/**
 * MMOS ExecutionStateMachine - Execution lifecycle
 * Per docs/reference/runtime/execution-loop.md (Execution Lifecycle)
 *
 *   Created → Initialized → Running → Waiting → Running → Completed
 *                                       │
 *                                       └→ Failed → Retry → Running
 *                                       └→ Cancelled
 */

export type ExecutionLifecycleState =
  | 'created'
  | 'initialized'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled';

const TRANSITIONS: Record<ExecutionLifecycleState, readonly ExecutionLifecycleState[]> = {
  created: ['initialized', 'failed', 'cancelled'],
  initialized: ['running', 'failed', 'cancelled'],
  running: ['waiting', 'completed', 'failed', 'cancelled'],
  waiting: ['running', 'failed', 'cancelled'],
  completed: [],
  failed: ['running'], // via retry
  cancelled: [],
};

export function canTransitionExecution(
  from: ExecutionLifecycleState,
  to: ExecutionLifecycleState
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertExecutionTransition(
  from: ExecutionLifecycleState,
  to: ExecutionLifecycleState
): void {
  if (!canTransitionExecution(from, to)) {
    throw new Error(`Invalid Execution state transition: ${from} -> ${to}`);
  }
}

export function isTerminal(state: ExecutionLifecycleState): boolean {
  return state === 'completed' || state === 'cancelled';
}
