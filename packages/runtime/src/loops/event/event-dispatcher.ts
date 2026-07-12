/**
 * MMOS EventDispatcher - Dispatch to 1..N Subscribers with error isolation
 * Per docs/reference/runtime/event-loop.md (Event Dispatch)
 *
 * One failing subscriber MUST NOT stop the others.
 */

import type { EventEnvelope, EventHandler } from '@mmos/sdk';

export interface EventDispatcher {
  dispatch(envelope: EventEnvelope, handlers: readonly EventHandler[]): Promise<{
    delivered: number;
    failed: number;
  }>;
}

export function createEventDispatcher(): EventDispatcher {
  return {
    async dispatch(envelope, handlers) {
      let delivered = 0;
      let failed = 0;
      for (const handler of handlers) {
        try {
          await Promise.resolve(handler(envelope));
          delivered++;
        } catch {
          failed++;
        }
      }
      return { delivered, failed };
    },
  };
}
