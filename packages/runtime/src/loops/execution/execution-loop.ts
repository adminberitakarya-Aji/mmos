/**
 * MMOS ExecutionLoop - Manages Execution lifecycle
 * Per docs/reference/runtime/execution-loop.md
 *
 * The ExecutionLoop is the bridge between the Scheduler's decision and the
 * actual Task execution by the Engine. It owns the Execution state machine,
 * retry policy, cancellation, and memory synchronization.
 */

import type { Execution, Task, Uoid, Orchestrator, MemoryEngine } from '@mmos/sdk';
import {
  evaluateSystemState as _ignore,
} from '../system/system-state.js';
import { createTaskDispatcher, type TaskDispatcher, type DispatchResult } from './task-dispatcher.js';
import { createResultCollector, type ResultCollector, type CollectedResult } from './result-collector.js';
import { createMemorySynchronizer, type MemorySynchronizer } from './memory-synchronizer.js';
import { createRetryHandler, type RetryHandler, type RetryPolicy } from './retry-handler.js';
import { createCancellationHandler, type CancellationHandler } from './cancellation-handler.js';
import { assertExecutionTransition, type ExecutionLifecycleState } from './execution-state-machine.js';
void _ignore;

export interface ExecutionLoopOptions {
  readonly orchestrator: Orchestrator;
  readonly memoryEngine?: MemoryEngine;
  readonly retryPolicy?: RetryPolicy;
}

export interface ExecutionLoop {
  dispatch(execution: Execution, task: Task): Promise<DispatchResult>;
  dispatchByExecution(execution: Execution): Promise<DispatchResult>;
  collectResult(dispatch: DispatchResult): Promise<CollectedResult>;
  synchronizeMemory(execution: Execution, collected: CollectedResult): Promise<void>;
  cancel(execution: Execution): Promise<void>;
  isCancelled(execution: Execution): boolean;
  lifecycleState(execution: Execution): ExecutionLifecycleState;
}

export function createExecutionLoop(options: ExecutionLoopOptions): ExecutionLoop {
  const dispatcher: TaskDispatcher = createTaskDispatcher(options.orchestrator);
  const collector: ResultCollector = createResultCollector();
  const memory: MemorySynchronizer = createMemorySynchronizer();
  const retry: RetryHandler = createRetryHandler(
    options.retryPolicy ?? { maxAttempts: 1, delayMs: 0 }
  );
  const cancellation: CancellationHandler = createCancellationHandler();
  const lifecycle: Map<string, ExecutionLifecycleState> = new Map();
  const attempt: Map<string, number> = new Map();

  function stateOf(execution: Execution): ExecutionLifecycleState {
    return lifecycle.get(execution.uoid.toString()) ?? 'created';
  }

  function setState(execution: Execution, next: ExecutionLifecycleState): void {
    const prev = stateOf(execution);
    if (prev !== next) {
      assertExecutionTransition(prev, next);
    }
    lifecycle.set(execution.uoid.toString(), next);
  }

  return {
    async dispatch(execution, task) {
      if (cancellation.isCancelled(execution)) {
        return {
          executionUoid: execution.uoid,
          taskUoid: task.uoid,
          success: false,
          error: new Error('Execution cancelled'),
          event: {
            event: task.uoid,
            type: 'execution.cancelled',
            payload: { execution: execution.uoid.toString() },
            timestamp: new Date(),
            source: execution.uoid,
          },
        };
      }
      setState(execution, 'running');
      const result = await dispatcher.dispatch(execution, task);
      if (!result.success) {
        const a = attempt.get(execution.uoid.toString()) ?? 1;
        const decision = retry.decide(a, result.error ?? new Error('unknown'));
        if (decision.shouldRetry) {
          attempt.set(execution.uoid.toString(), decision.nextAttempt);
          return result; // caller (system loop) will re-dispatch
        }
        setState(execution, 'failed');
      }
      return result;
    },
    async dispatchByExecution(execution) {
      const firstTask = (execution as { spec?: { entryTask?: Task } }).spec?.entryTask;
      if (!firstTask) {
        return {
          executionUoid: execution.uoid,
          taskUoid: undefined,
          success: false,
          error: new Error('No entry task'),
          event: {
            event: execution.uoid,
            type: 'execution.failed',
            payload: { error: 'No entry task' },
            timestamp: new Date(),
            source: execution.uoid,
          },
        };
      }
      return this.dispatch(execution, firstTask);
    },
    async collectResult(dispatch) {
      const execution = { uoid: dispatch.executionUoid } as Execution;
      const collected = collector.collect(execution, dispatch);
      if (collected.valid) {
        setState(execution, 'completed');
      }
      return collected;
    },
    async synchronizeMemory(_execution, collected) {
      await memory.synchronize(collected, options.memoryEngine);
    },
    async cancel(execution) {
      cancellation.cancel(execution, stateOf(execution));
      setState(execution, 'cancelled');
    },
    isCancelled(execution) {
      return cancellation.isCancelled(execution);
    },
    lifecycleState(execution) {
      return stateOf(execution);
    },
  };
}
