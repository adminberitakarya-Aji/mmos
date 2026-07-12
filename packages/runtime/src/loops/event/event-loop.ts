/**
 * MMOS EventLoop - Receive → Validate → Queue → Select → Dispatch → Complete → Archive
 * Per docs/reference/runtime/event-loop.md
 *
 * The EventLoop is the asynchronous mechanism that ensures every change in
 * the system is observable, traceable, and processed consistently.
 */

import type { EventEnvelope, EventEngine } from '@mmos/sdk';
import { createEventValidator, type EventValidator } from './event-validator.js';
import { createEventQueue, type EventQueue } from './event-queue.js';
import { createEventSelector, type EventSelector } from './event-selector.js';
import { createEventDispatcher, type EventDispatcher } from './event-dispatcher.js';
import { createSubscriberRegistry, type SubscriberRegistry, type EventCategory, type SubscriberEntry } from './subscriber-registry.js';
import { createEventRetryPolicy, type EventRetryPolicy, type RetryPolicy } from './retry-policy.js';
import { createDeadLetterQueue, type DeadLetterQueue } from './dead-letter-queue.js';
import { createEventArchive, type EventArchive } from './event-archiver.js';

export interface EventLoopOptions {
  readonly engine?: EventEngine;
  readonly retryPolicy?: RetryPolicy;
  readonly validator?: EventValidator;
}

export interface EventLoop {
  publish(envelope: EventEnvelope): Promise<void>;
  register(entry: Omit<SubscriberEntry, 'id'>): SubscriberEntry;
  unregister(id: string): boolean;
  drain(): Promise<void>;
  close(): Promise<void>;
  archive(): EventArchive;
  registry(): SubscriberRegistry;
}

export function createEventLoop(options: EventLoopOptions = {}): EventLoop {
  const validator = options.validator ?? createEventValidator();
  const queue: EventQueue = createEventQueue();
  const selector: EventSelector = createEventSelector();
  const dispatcher: EventDispatcher = createEventDispatcher();
  const registry: SubscriberRegistry = createSubscriberRegistry();
  const retry: EventRetryPolicy = createEventRetryPolicy(
    options.retryPolicy ?? { maxAttempts: 3, delayMs: 100, backoffMultiplier: 2 }
  );
  const dlq: DeadLetterQueue = createDeadLetterQueue();
  const archive: EventArchive = createEventArchive();
  let closed = false;

  async function dispatchOne(envelope: EventEnvelope): Promise<void> {
    const subs = registry.forEnvelope(envelope);
    if (subs.length === 0) {
      archive.push(envelope);
      return;
    }
    let attempt = 1;
    // Initial attempt
    const first = await dispatcher.dispatch(envelope, subs.map(s => s.handler));
    archive.push(envelope);
    let failedCount = first.failed;
    while (failedCount > 0) {
      const decision = retry.decide(attempt);
      if (!decision.shouldRetry) {
        // Send failed subscribers to DLQ
        // We approximate per-envelope DLQ entry
        dlq.push(envelope, `${failedCount} subscriber(s) failed`, attempt);
        break;
      }
      await new Promise(r => setTimeout(r, decision.delayMs));
      const next = await dispatcher.dispatch(envelope, subs.map(s => s.handler));
      failedCount = next.failed;
      if (failedCount === 0) break;
      attempt = decision.nextAttempt;
    }
  }

  return {
    async publish(envelope) {
      if (closed) return;
      const result = validator.validate(envelope);
      if (!result.valid) {
        // Invalid events go directly to DLQ
        dlq.push(envelope, result.reason ?? 'invalid', 0);
        return;
      }
      queue.enqueue(envelope);
    },
    register(entry) {
      return registry.register(entry);
    },
    unregister(id) {
      return registry.unregister(id);
    },
    async drain() {
      while (queue.size() > 0) {
        const next = selector.selectNext(queue);
        if (!next) break;
        await dispatchOne(next);
      }
      if (options.engine) {
        try {
          await options.engine.publish({} as EventEnvelope);
        } catch {
          // best effort
        }
      }
    },
    async close() {
      await this.drain();
      closed = true;
    },
    archive: () => archive,
    registry: () => registry,
  };
}

// Re-export event category type
export type { EventCategory };
