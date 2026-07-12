/**
 * MMOS DeadLetterQueue - Holds events that exhausted retry attempts
 * Per docs/reference/runtime/event-loop.md (Dead Letter Queue)
 *
 *   Event → Retry Failed → DLQ → Manual Inspection
 */

import type { EventEnvelope } from '@mmos/sdk';

export interface DLQEntry {
  readonly envelope: EventEnvelope;
  readonly reason: string;
  readonly attempts: number;
  readonly deadLetteredAt: Date;
}

export interface DeadLetterQueue {
  push(envelope: EventEnvelope, reason: string, attempts: number): void;
  drain(): readonly DLQEntry[];
  size(): number;
}

export function createDeadLetterQueue(): DeadLetterQueue {
  const items: DLQEntry[] = [];

  return {
    push(envelope, reason, attempts) {
      items.push({ envelope, reason, attempts, deadLetteredAt: new Date() });
    },
    drain() {
      const out = [...items];
      items.length = 0;
      return out;
    },
    size() {
      return items.length;
    },
  };
}
