/**
 * MMOS SystemState - Runtime state evaluator
 * Per docs/reference/runtime/system-loop.md (Execution Cycle, Runtime States)
 *
 * Per the reference, the Runtime walks through these states:
 *   stopped   - Runtime is not running
 *   starting  - boot phase, accepting initial state
 *   running   - heartbeat active, processing executions
 *   waiting   - heartbeat active but no ready work
 *   draining  - shutdown initiated, flushing events
 *   stopped   - terminal state (re-entered)
 *
 * In addition this module tracks lightweight metrics used by the heartbeat
 * to surface health and to record how work flowed through the system.
 */

export type SystemState =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'waiting'
  | 'draining';

const VALID_TRANSITIONS: Record<SystemState, readonly SystemState[]> = {
  stopped: ['starting'],
  starting: ['running', 'waiting', 'draining'],
  running: ['waiting', 'draining'],
  waiting: ['running', 'draining'],
  draining: ['stopped'],
};

/**
 * Evaluate the SystemState based on whether the Runtime is running and
 * whether there is pending work. Used by the heartbeat to decide whether
 * the next iteration is "running" or "waiting".
 */
export function evaluateSystemState(
  isRunning: boolean,
  hasPendingWork: boolean = false
): SystemState {
  if (!isRunning) {
    return 'stopped';
  }
  if (hasPendingWork) {
    return 'running';
  }
  return 'waiting';
}

export function canTransition(from: SystemState, to: SystemState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: SystemState, to: SystemState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid SystemLoop state transition: ${from} -> ${to}`);
  }
}

/**
 * Lightweight mutable metrics tracked by the SystemLoop across iterations.
 * The Runtime is otherwise stateless, but these counters are observational
 * telemetry and are reset on each `start()` call.
 */
export interface SystemMetrics {
  /** Number of heartbeat iterations executed since start() */
  iterations: number;
  /** Iterations that produced at least one piece of useful work */
  activeIterations: number;
  /** Iterations that returned empty (no ready work) */
  idleIterations: number;
  /** Number of executions dispatched since start() */
  executionsDispatched: number;
  /** Number of tasks that succeeded */
  tasksSucceeded: number;
  /** Number of tasks that failed */
  tasksFailed: number;
  /** Number of events published to the bus */
  eventsPublished: number;
  /** Number of errors caught in the heartbeat (recovered) */
  errorsCaught: number;
  /** Timestamp of the last successful tick */
  lastTickAt: Date | undefined;
  /** Total number of milliseconds spent in tick() since start() */
  totalTickMs: number;
}

export function createEmptyMetrics(): SystemMetrics {
  return {
    iterations: 0,
    activeIterations: 0,
    idleIterations: 0,
    executionsDispatched: 0,
    tasksSucceeded: 0,
    tasksFailed: 0,
    eventsPublished: 0,
    errorsCaught: 0,
    lastTickAt: undefined,
    totalTickMs: 0,
  }
}

/**
 * Health snapshot exposed to operators / monitoring.
 */
export interface SystemHealth {
  readonly state: SystemState;
  readonly isRunning: boolean;
  readonly uptimeMs: number;
  readonly metrics: Readonly<SystemMetrics>;
  readonly lastError: Error | undefined;
}

export function snapshotHealth(
  state: SystemState,
  metrics: SystemMetrics,
  startedAt: Date | undefined,
  lastError: Error | undefined
): SystemHealth {
  return {
    state,
    isRunning: state !== 'stopped' && state !== 'draining',
    uptimeMs: startedAt ? Date.now() - startedAt.getTime() : 0,
    metrics: { ...metrics },
    lastError,
  };
}

/**
 * Tracks a SystemState value and refuses invalid transitions. Use this in
 * the SystemLoop to enforce the state machine described in the reference
 * document.
 */
export class SystemStateMachine {
  private _state: SystemState = 'stopped';

  get state(): SystemState {
    return this._state;
  }

  get isRunning(): boolean {
    return this._state === 'running' || this._state === 'waiting' || this._state === 'starting';
  }

  get isDraining(): boolean {
    return this._state === 'draining';
  }

  transition(next: SystemState): void {
    if (this._state === next) return;
    assertTransition(this._state, next);
    this._state = next;
  }

  force(next: SystemState): void {
    this._state = next;
  }
}
