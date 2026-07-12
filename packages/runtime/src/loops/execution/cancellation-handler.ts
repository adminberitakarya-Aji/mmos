/**
 * MMOS CancellationHandler - Stop Dispatch → Complete Active Task → Cancelled
 * Per docs/reference/runtime/execution-loop.md (Cancellation)
 *
 * Cancellation does NOT delete Events or Memory that have already been stored.
 */

import type { Execution } from '@mmos/sdk';
import type { ExecutionLifecycleState } from './execution-state-machine.js';

export interface CancellationHandler {
  cancel(execution: Execution, currentState: ExecutionLifecycleState): boolean;
  isCancelled(execution: Execution): boolean;
}

export function createCancellationHandler(): CancellationHandler {
  const cancelled = new Set<string>();

  return {
    cancel(execution) {
      cancelled.add(execution.uoid.toString());
      return true;
    },
    isCancelled(execution) {
      return cancelled.has(execution.uoid.toString());
    },
  };
}
