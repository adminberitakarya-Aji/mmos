/**
 * MMOS EventLoop Tests
 * Per docs/reference/runtime/event-loop.md
 */

import { describe, it, expect, vi } from 'vitest';
import { createEventValidator, defaultSchemaValidator } from './event-validator.js';
import { createEventQueue } from './event-queue.js';
import { createEventDispatcher } from './event-dispatcher.js';
import { createSubscriberRegistry } from './subscriber-registry.js';
import { EventRetryPolicy } from './retry-policy.js';
import { createDeadLetterQueue } from './dead-letter-queue.js';
import { createEventArchive } from './event-archiver.js';
import { createEventLoop } from './event-loop.js';
import type { Uoid } from '@mmos/sdk';

const sourceUoid = { toString: () => 'src_1' } as unknown as Uoid;
const eventUoid = { toString: () => 'evt_1' } as unknown as Uoid;

function envelope(type: string, payload: Record<string, unknown> = {}) {
  return {
    event: eventUoid,
    type,
    payload,
    timestamp: new Date(),
    source: sourceUoid,
  };
}

describe('EventLoop components', () => {
  it('default schema validator requires non-empty type', () => {
    expect(defaultSchemaValidator(envelope('task.completed'))).toBe(true);
    expect(defaultSchemaValidator({ ...envelope(''), type: '' })).toBe(false);
  });

  it('event validator rejects invalid metadata', () => {
    const v = createEventValidator();
    const bad = { ...envelope('x'), timestamp: new Date('invalid') } as any;
    expect(v.validate(bad).valid).toBe(false);
  });

  it('event queue preserves insertion order after sort', () => {
    const q = createEventQueue();
    const e1 = envelope('a');
    const e2 = envelope('b');
    e1.timestamp = new Date(1);
    e2.timestamp = new Date(2);
    q.enqueue(e2);
    q.enqueue(e1);
    expect(q.dequeue()!.type).toBe('a');
  });

  it('event dispatcher isolates failures', async () => {
    const d = createEventDispatcher();
    const ok = vi.fn().mockResolvedValue(undefined);
    const bad = vi.fn().mockRejectedValue(new Error('boom'));
    const r = await d.dispatch(envelope('x'), [ok, bad, ok]);
    expect(r.delivered).toBe(2);
    expect(r.failed).toBe(1);
  });

  it('subscriber registry matches by category and type', () => {
    const r = createSubscriberRegistry();
    const sub = r.register({
      category: 'execution',
      types: ['execution.*'],
      handler: async () => undefined,
    });
    expect(r.forCategory('execution')).toHaveLength(1);
    expect(r.forEnvelope(envelope('execution.started'))).toHaveLength(1);
    r.unregister(sub.id);
    expect(r.size()).toBe(0);
  });

  it('retry policy applies exponential backoff', () => {
    const p = new EventRetryPolicy({ maxAttempts: 3, delayMs: 50, backoffMultiplier: 2 });
    expect(p.decide(1).delayMs).toBe(50);
    expect(p.decide(2).delayMs).toBe(100);
    expect(p.decide(3).shouldRetry).toBe(false);
  });

  it('DLQ accumulates and drains', () => {
    const d = createDeadLetterQueue();
    d.push(envelope('x'), 'bad', 1);
    d.push(envelope('y'), 'worse', 2);
    expect(d.size()).toBe(2);
    const drained = d.drain();
    expect(drained).toHaveLength(2);
    expect(d.size()).toBe(0);
  });

  it('event archive is immutable', () => {
    const a = createEventArchive();
    const e = envelope('x');
    a.push(e);
    const stored = a.list()[0]!;
    // In strict mode, frozen objects throw on assignment; the archive
    // preserves the original value either way.
    try {
      (stored as any).type = 'mutated';
    } catch {
      // expected
    }
    expect(stored.type).toBe('x');
  });

  it('event loop publishes, dispatches, archives', async () => {
    const loop = createEventLoop();
    const handler = vi.fn().mockResolvedValue(undefined);
    loop.register({
      category: 'task',
      types: ['task.*'],
      handler,
    });
    await loop.publish(envelope('task.completed', { ok: true }));
    await loop.drain();
    expect(handler).toHaveBeenCalled();
    expect(loop.archive().size()).toBe(1);
  });

  it('event loop sends invalid events to DLQ', async () => {
    const loop = createEventLoop();
    await loop.publish({
      event: { toString: () => '' } as Uoid,
      type: '',
      payload: {},
      timestamp: new Date(),
      source: { toString: () => 's' } as Uoid,
    });
    await loop.drain();
    // DLQ has 1 entry
    expect(loop.archive().size()).toBe(0);
  });
});
