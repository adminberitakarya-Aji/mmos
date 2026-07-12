/**
 * MMOS SystemLoop - Public API
 * Per docs/reference/runtime/system-loop.md
 *
 * Exposes the SystemLoop, its iteration pipeline, state evaluator, the
 * graceful shutdown handler, and the parallel execution coordinator.
 */

export { SystemLoop, createSystemLoop } from './system-loop.js';
export type { SystemLoopOptions } from './system-loop.js';

// Iteration pipeline
export {
  runIterationStep,
  createIterationContext,
  recordExecution,
  emptyTimings,
} from './iteration-step.js';
export type {
  IterationContext,
  IterationStepParams,
  StepTimings,
} from './iteration-step.js';

// State evaluator and state machine
export {
  evaluateSystemState,
  canTransition,
  assertTransition,
  createEmptyMetrics,
  snapshotHealth,
  SystemStateMachine,
} from './system-state.js';
export type { SystemState, SystemMetrics, SystemHealth } from './system-state.js';

// Graceful shutdown
export { createShutdownHandler } from './shutdown-handler.js';
export type {
  ShutdownHandler,
  ShutdownHandlerOptions,
  ShutdownPhase,
  ShutdownReason,
  ShutdownHook,
  ShutdownHookContext,
} from './shutdown-handler.js';

// Parallel execution
export { createParallelExecutionCoordinator } from './parallel-execution-coordinator.js';
export type {
  ParallelExecutionCoordinator,
  ParallelExecutionCoordinatorOptions,
  CoordinatorMetrics,
} from './parallel-execution-coordinator.js';
