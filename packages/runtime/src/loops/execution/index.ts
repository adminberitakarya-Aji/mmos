/**
 * MMOS ExecutionLoop - Public API
 * Per docs/reference/runtime/execution-loop.md
 */

export { createExecutionLoop } from './execution-loop.js';
export type { ExecutionLoop, ExecutionLoopOptions } from './execution-loop.js';

export { createTaskDispatcher } from './task-dispatcher.js';
export type { TaskDispatcher, DispatchResult } from './task-dispatcher.js';

export { createResultCollector, defaultValidator, defaultNormalizer } from './result-collector.js';
export type { ResultCollector, CollectedResult, Validator, Normalizer } from './result-collector.js';

export { createMemorySynchronizer } from './memory-synchronizer.js';
export type { MemorySynchronizer } from './memory-synchronizer.js';

export { createRetryHandler, RetryHandler } from './retry-handler.js';
export type { RetryPolicy, RetryDecision } from './retry-handler.js';

export { createCancellationHandler } from './cancellation-handler.js';
export type { CancellationHandler } from './cancellation-handler.js';

export {
  canTransitionExecution,
  assertExecutionTransition,
  isTerminal,
} from './execution-state-machine.js';
export type { ExecutionLifecycleState } from './execution-state-machine.js';
