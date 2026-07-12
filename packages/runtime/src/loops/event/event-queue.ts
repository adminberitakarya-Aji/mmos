/**
 * MMOS EventQueue - Ordered event queue with deterministic ordering
 * Per docs/reference/runtime/event-loop.md (Event Queue)
 */

import type { EventEnvelope } from '@mmos/sdk';

export interface EventQueue {
  enqueue(envelope: EventEnvelope): void;
  dequeue(): EventEnvelope | undefined;
  peek(): readonly EventEnvelope[];
  size(): number;
  clear(): void;
}

export function createEventQueue(): EventQueue {
  const items: EventEnvelope[] = [];

  return {
    enqueue(envelope) {
      items.push(envelope);
      // Keep order by timestamp then insertion
      items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    },
    dequeue() {
      return items.shift();
    },
    peek() {
      return [...items];
    },
    size() {
      return items.length;
    },
    clear() {
      items.length = 0;
    },
  };
}
