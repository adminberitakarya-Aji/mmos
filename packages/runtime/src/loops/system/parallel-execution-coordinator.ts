/**
 * MMOS ParallelExecutionCoordinator - Multi-execution dispatcher
 * Per docs/reference/runtime/system-loop.md (Parallel Executions)
 *
 * The Runtime may handle many Executions simultaneously. Each Execution is
 * processed independently; this coordinator enforces a configurable
 * concurrency cap and isolates failures between Executions.
 *
 * Algorithm:
 *   - Maintain a worker pool of size `maxConcurrent`.
 *   - For each incoming Execution, claim a worker; if none free, wait.
 *   - When a worker finishes, return its slot to the pool and surface the
 *     result. Exceptions are captured per-execution, never thrown.
 */

import type { Execution } from '@mmos/sdk';
import type { ExecutionLoop } from '../execution/index.js';
import type { DispatchResult } from '../execution/index.js';

export interface ParallelExecutionCoordinatorOptions {
  readonly executionLoop: ExecutionLoop;
  /** Maximum concurrent in-flight executions. Default: 8 */
  readonly maxConcurrent?: number;
  /** Called once per execution after dispatch completes (success or failure) */
  readonly onResult?: (result: DispatchResult) => void | Promise<void>;
}

export interface CoordinatorMetrics {
  readonly submitted: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly inFlight: number;
  readonly maxConcurrent: number;
}

export interface ParallelExecutionCoordinator {
  /** Dispatch a set of executions in parallel with bounded concurrency */
  dispatchMany(executions: readonly Execution[]): Promise<readonly DispatchResult[]>;
  /** Dispatch a single execution (isolated failure) */
  dispatchOne(execution: Execution): Promise<DispatchResult>;
  /** Snapshot of the current coordinator metrics */
  metrics(): CoordinatorMetrics;
  /** Update maxConcurrent at runtime (clamped to >= 1) */
  setMaxConcurrent(value: number): void;
}

export function createParallelExecutionCoordinator(
  options: ParallelExecutionCoordinatorOptions
): ParallelExecutionCoordinator {
  let maxConcurrent = Math.max(1, options.maxConcurrent ?? 8);
  const submitted = 0;
  let inFlight = 0;
  let succeeded = 0;
  let failed = 0;
  const waiters: Array<() => void> = [];

  function acquire(): Promise<void> {
    if (inFlight < maxConcurrent) {
      inFlight += 1;
      return Promise.resolve();
    }
    return new Promise<void>(resolve => waiters.push(resolve));
  }

  function release(): void {
    inFlight -= 1;
    const next = waiters.shift();
    if (next) {
      inFlight += 1;
      next();
    }
  }

  async function dispatchOne(execution: Execution): Promise<DispatchResult> {
    await acquire();
    let result: DispatchResult;
    try {
      result = await options.executionLoop.dispatchByExecution(execution);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      result = {
        executionUoid: execution.uoid,
        taskUoid: undefined,
        success: false,
        error,
        event: {
          event: execution.uoid,
          type: 'execution.failed',
          payload: { error: error.message },
          timestamp: new Date(),
          source: execution.uoid,
        },
      };
    } finally {
      release();
    }
    if (result.success) {
      succeeded += 1;
    } else {
      failed += 1;
    }
    if (options.onResult) {
      try {
        await options.onResult(result);
      } catch {
        // Hooks are best-effort
      }
    }
    return result;
  }

  return {
    dispatchOne,
    async dispatchMany(executions: readonly Execution[]): Promise<readonly DispatchResult[]> {
      const results: DispatchResult[] = [];
      // Kick off all at once; the `acquire()` semaphore inside dispatchOne
      // ensures we never exceed `maxConcurrent` in flight.
      const promises = executions.map(async e => {
        const r = await dispatchOne(e);
        results.push(r);
        return r;
      });
      await Promise.allSettled(promises);
      // Order results to match the input order
      const byExecution = new Map<string, DispatchResult>();
      for (const r of results) {
        byExecution.set(r.executionUoid.toString(), r);
      }
      return executions.map(e => {
        const key = e.uoid.toString();
        const found = byExecution.get(key);
        if (found) return found;
        // Defensive: synthesize a failure result for any missing
        return {
          executionUoid: e.uoid,
          taskUoid: undefined,
          success: false,
          error: new Error('Coordinator: missing result'),
          event: {
            event: e.uoid,
            type: 'execution.failed',
            payload: { error: 'missing result' },
            timestamp: new Date(),
            source: e.uoid,
          },
        };
      });
    },
    metrics() {
      return { submitted, succeeded, failed, inFlight, maxConcurrent };
    },
    setMaxConcurrent(value: number) {
      maxConcurrent = Math.max(1, value);
    },
  };
}
