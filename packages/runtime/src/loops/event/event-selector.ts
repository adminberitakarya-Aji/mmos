/**
 * MMOS EventSelector - Choose the next event to dispatch
 * Per docs/reference/runtime/event-loop.md (Event Selection)
 *
 * Selection follows Runtime policy. Default: FIFO based on queue order.
 */

import type { EventEnvelope } from '@mmos/sdk';
import type { EventQueue } from './event-queue.js';

export interface EventSelector {
  selectNext(queue: EventQueue): EventEnvelope | undefined;
}

export function createEventSelector(): EventSelector {
  return {
    selectNext(queue) {
      return queue.dequeue();
    },
  };
}
