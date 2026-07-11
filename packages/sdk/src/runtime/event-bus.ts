/**
 * MMOS Event Bus - In-Memory Event Delivery
 * Per ADR-012: Event is Immutable
 * Per ADR-014: Event-Driven Architecture
 */

import { Uoid } from '../domain/identity.js';
import { Event } from '../domain/event.js';
import { createEvent } from '../domain/event.js';

export type RuntimeEventHandler = (event: Event) => void | Promise<void>;

export type EventPattern = string | RegExp;

/**
 * EventBus - Decouples event producers from consumers.
 * Patterns can be exact type strings (e.g. "task.completed") or RegExp.
 */
export interface EventBus {
  publish(event: Event): Promise<void>;
  publishMany(events: readonly Event[]): Promise<void>;
  subscribe(pattern: EventPattern, handler: RuntimeEventHandler): () => void;
  unsubscribe(pattern: EventPattern, handler: RuntimeEventHandler): void;
  clear(): void;
  size(): number;
}

interface Subscription {
  pattern: EventPattern;
  handler: RuntimeEventHandler;
}

function matchesPattern(pattern: EventPattern, eventType: string): boolean {
  if (typeof pattern === 'string') {
    return pattern === eventType;
  }
  return pattern.test(eventType);
}

export class InMemoryEventBus implements EventBus {
  private subscriptions: Subscription[] = [];
  private eventHistory: Event[] = [];

  async publish(event: Event): Promise<void> {
    this.eventHistory.push(event);
    const matching = this.subscriptions.filter(s => matchesPattern(s.pattern, event.spec.type));
    await Promise.all(
      matching.map(async s => {
        try {
          await s.handler(event);
        } catch (err) {
          // Swallow handler errors to prevent one bad subscriber from breaking others.
          // Production implementations should log this via a structured logger.
          // eslint-disable-next-line no-console
          console.error(`EventBus handler error for "${event.spec.type}":`, err);
        }
      })
    );
  }

  async publishMany(events: readonly Event[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(pattern: EventPattern, handler: RuntimeEventHandler): () => void {
    const sub: Subscription = { pattern, handler };
    this.subscriptions.push(sub);
    return () => this.unsubscribe(pattern, handler);
  }

  unsubscribe(pattern: EventPattern, handler: RuntimeEventHandler): void {
    this.subscriptions = this.subscriptions.filter(
      s => !(s.pattern === pattern && s.handler === handler)
    );
  }

  clear(): void {
    this.subscriptions = [];
    this.eventHistory = [];
  }

  size(): number {
    return this.eventHistory.length;
  }

  history(): readonly Event[] {
    return this.eventHistory;
  }
}

/**
 * Helper to build events with sensible defaults for the orchestrator.
 */
export function emitTaskEvent(
  bus: EventBus,
  params: {
    source: Uoid;
    type: string;
    payload: Record<string, unknown>;
    correlationId?: Uoid;
  }
): Promise<Event> {
  const event = createEvent({
    source: params.source,
    type: params.type,
    payload: params.payload,
    correlationId: params.correlationId,
  });
  return bus.publish(event).then(() => event);
}
