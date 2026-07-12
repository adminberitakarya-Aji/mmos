/**
 * MMOS SystemLoop Tests
 * Per docs/reference/runtime/system-loop.md
 *
 * Covers:
 *   - state machine and metric snapshots
 *   - iteration step pipeline (10 steps)
 *   - heartbeat start/stop in event-driven mode
 *   - heartbeat start/stop in timer-driven mode
 *   - bounded parallelism via the parallel coordinator
 *   - graceful shutdown via the shutdown handler
 *   - end-to-end tick with stubbed scheduler / execution / event loop
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { EventBus, Uoid, Execution, EventEnvelope, Task } from '@mmos/sdk';
import { InMemoryEventBus } from '@mmos/sdk';
import {
  SystemLoop,
  createSystemLoop,
  evaluateSystemState,
  canTransition,
  assertTransition,
  runIterationStep,
  createIterationContext,
  createShutdownHandler,
  createParallelExecutionCoordinator,
  SystemStateMachine,
  createEmptyMetrics,
  snapshotHealth,
} from './index.js';
import type { Scheduler } from '../scheduler/index.js';
import type { ExecutionLoop, DispatchResult, CollectedResult } from '../execution/index.js';
import type { EventLoop } from '../event/index.js';

// --- Stubs ---------------------------------------------------------------

function buildEventLoopStub(): EventLoop {
  return {
    drain: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  } as unknown as EventLoop;
}

function buildSchedulerStub(opts: {
  ready?: Execution[];
  selected?: Execution;
  task?: Task | undefined;
} = {}): Scheduler {
  return {
    enqueue: vi.fn().mockResolvedValue(undefined),
    peekReadyExecutions: vi.fn().mockResolvedValue(opts.ready ?? []),
    selectNextExecution: vi.fn().mockResolvedValue(opts.selected),
    selectNextTask: vi.fn().mockResolvedValue(opts.task),
  } as unknown as Scheduler;
}

function buildExecutionLoopStub(opts: {
  success?: boolean;
  output?: unknown;
} = {}): {
  loop: ExecutionLoop;
  collect: ReturnType<typeof vi.fn>;
  dispatch: ReturnType<typeof vi.fn>;
  sync: ReturnType<typeof vi.fn>;
  dispatchByExecution: ReturnType<typeof vi.fn>;
} {
  const envelope: EventEnvelope = {
    event: { toString: () => 'evt_x' } as Uoid,
    type: 'task.completed',
    payload: { output: opts.output },
    timestamp: new Date(),
    source: { toString: () => 'exe_x' } as Uoid,
  };
  const dispatchResult: DispatchResult = {
    executionUoid: { toString: () => 'exe_x' } as Uoid,
    taskUoid: { toString: () => 'task_x' } as Uoid,
    success: opts.success ?? true,
    output: opts.output,
    event: envelope,
  };
  const collected: CollectedResult = {
    executionUoid: dispatchResult.executionUoid,
    valid: opts.success ?? true,
    normalized: opts.output,
    dispatch: dispatchResult,
  };
  // The returned spies are the *same* ones installed on `loop`, so
  // expect(spy).toHaveBeenCalled() works correctly.
  const dispatch = vi.fn().mockResolvedValue(dispatchResult);
  const dispatchByExecution = vi.fn().mockResolvedValue(dispatchResult);
  const collect = vi.fn().mockResolvedValue(collected);
  const sync = vi.fn().mockResolvedValue(undefined);
  return {
    loop: {
      dispatch,
      dispatchByExecution,
      collectResult: collect,
      synchronizeMemory: sync,
    } as unknown as ExecutionLoop,
    dispatch,
    collect,
    sync,
    dispatchByExecution,
  };
}

const eventEnvelope = (type: string): EventEnvelope => ({
  event: { toString: () => `evt_${type}` } as Uoid,
  type,
  payload: {},
  timestamp: new Date(),
  source: { toString: () => 'src' } as Uoid,
});

// --- State evaluator & state machine ------------------------------------

describe('evaluateSystemState', () => {
  it('returns stopped when not running', () => {
    expect(evaluateSystemState(false)).toBe('stopped');
    expect(evaluateSystemState(false, true)).toBe('stopped');
  });

  it('returns running when running and has work', () => {
    expect(evaluateSystemState(true, true)).toBe('running');
  });

  it('returns waiting when running and idle', () => {
    expect(evaluateSystemState(true, false)).toBe('waiting');
  });
});

describe('SystemStateMachine', () => {
  it('starts in stopped and is not running', () => {
    const sm = new SystemStateMachine();
    expect(sm.state).toBe('stopped');
    expect(sm.isRunning).toBe(false);
  });

  it('moves stopped → starting → running', () => {
    const sm = new SystemStateMachine();
    sm.transition('starting');
    expect(sm.isRunning).toBe(true);
    sm.transition('running');
    expect(sm.state).toBe('running');
  });

  it('rejects invalid transitions', () => {
    expect(() => assertTransition('stopped', 'running')).toThrow();
    expect(() => assertTransition('completed' as any, 'running')).toThrow();
  });

  it('force() bypasses validation', () => {
    const sm = new SystemStateMachine();
    sm.force('draining');
    expect(sm.state).toBe('draining');
  });
});

describe('canTransition', () => {
  it('allows the canonical happy path', () => {
    expect(canTransition('stopped', 'starting')).toBe(true);
    expect(canTransition('starting', 'running')).toBe(true);
    expect(canTransition('running', 'waiting')).toBe(true);
    expect(canTransition('waiting', 'running')).toBe(true);
    expect(canTransition('draining', 'stopped')).toBe(true);
  });

  it('forbids stopped -> running directly', () => {
    expect(canTransition('stopped', 'running')).toBe(false);
  });
});

// --- Metrics & health ----------------------------------------------------

describe('SystemMetrics & health', () => {
  it('creates empty metrics', () => {
    const m = createEmptyMetrics();
    expect(m.iterations).toBe(0);
    expect(m.tasksSucceeded).toBe(0);
    expect(m.lastTickAt).toBeUndefined();
  });

  it('snapshots health including uptime and metrics', async () => {
    const m = createEmptyMetrics();
    m.iterations = 3;
    m.eventsPublished = 5;
    const started = new Date(Date.now() - 1000);
    const h = snapshotHealth('running', m, started, undefined);
    expect(h.state).toBe('running');
    expect(h.metrics.eventsPublished).toBe(5);
    expect(h.uptimeMs).toBeGreaterThanOrEqual(1000);
  });
});

// --- Iteration step pipeline --------------------------------------------

describe('runIterationStep', () => {
  let eventBus: EventBus;
  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  it('returns false and does nothing when nothing is ready', async () => {
    const scheduler = buildSchedulerStub();
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();

    const ok = await runIterationStep({
      context: createIterationContext(),
      eventBus,
      eventLoop,
      scheduler,
      executionLoop,
      parallelCoordinator: createParallelExecutionCoordinator({ executionLoop }),
    });
    expect(ok).toBe(false);
  });

  it('executes the 10-step pipeline and returns true', async () => {
    const execUoid = { toString: () => 'exe_1' } as Uoid;
    const taskUoid = { toString: () => 'task_1' } as Uoid;
    const execution = { uoid: execUoid } as unknown as Execution;
    const task = { uoid: taskUoid } as unknown as Task;

    const scheduler = buildSchedulerStub({ ready: [execution], selected: execution, task });
    const { loop: executionLoop, dispatch, collect, sync } = buildExecutionLoopStub({ output: { ok: 1 } });
    const eventLoop = buildEventLoopStub();

    const ctx = createIterationContext();
    const ok = await runIterationStep({
      context: ctx,
      eventBus,
      eventLoop,
      scheduler,
      executionLoop,
      parallelCoordinator: createParallelExecutionCoordinator({ executionLoop }),
    });
    expect(ok).toBe(true);
    expect(dispatch).toHaveBeenCalled();
    expect(collect).toHaveBeenCalled();
    expect(sync).toHaveBeenCalled();
    expect(ctx.executionsProcessed).toContainEqual(execUoid);
    expect(ctx.tasksProcessed).toContainEqual(taskUoid);
    expect(ctx.lastPublishedEvent?.type).toBe('task.completed');
    expect(ctx.timings.publishMs).toBeGreaterThanOrEqual(0);
  });

  it('captures errors and returns false (never throws)', async () => {
    const scheduler: Scheduler = {
      enqueue: vi.fn(),
      peekReadyExecutions: vi.fn().mockRejectedValue(new Error('boom')),
      selectNextExecution: vi.fn(),
      selectNextTask: vi.fn(),
    } as unknown as Scheduler;
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();

    const ctx = createIterationContext();
    const ok = await runIterationStep({
      context: ctx,
      eventBus,
      eventLoop,
      scheduler,
      executionLoop,
      parallelCoordinator: createParallelExecutionCoordinator({ executionLoop }),
    });
    expect(ok).toBe(false);
    expect(ctx.lastError?.message).toBe('boom');
  });

  it('does not call memory sync when the collected result is invalid', async () => {
    const execUoid = { toString: () => 'exe_1' } as Uoid;
    const taskUoid = { toString: () => 'task_1' } as Uoid;
    const execution = { uoid: execUoid } as unknown as Execution;
    const task = { uoid: taskUoid } as unknown as Task;
    const scheduler = buildSchedulerStub({ ready: [execution], selected: execution, task });
    const { loop: executionLoop, sync, dispatch } = buildExecutionLoopStub({ success: false });
    const eventLoop = buildEventLoopStub();

    const ok = await runIterationStep({
      context: createIterationContext(),
      eventBus,
      eventLoop,
      scheduler,
      executionLoop,
      parallelCoordinator: createParallelExecutionCoordinator({ executionLoop }),
    });
    // The pipeline still ran end-to-end (dispatch+collect+publish), so ok=true.
    // What we care about is that memory was NOT synced.
    expect(ok).toBe(true);
    expect(dispatch).toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
  });
});

// --- Shutdown handler ----------------------------------------------------

describe('ShutdownHandler', () => {
  it('runs all phases and ends in "completed"', async () => {
    const eventBus = new InMemoryEventBus();
    const eventLoop = buildEventLoopStub();
    const phases: string[] = [];
    const sh = createShutdownHandler({
      eventBus,
      eventLoop,
      onPhaseStart: ctx => { phases.push(ctx.phase); },
      stopAccepting: () => { /* noop */ },
    });
    expect(sh.isShuttingDown()).toBe(false);
    await sh.shutdown('stop');
    expect(sh.isCompleted()).toBe(true);
    expect(phases).toEqual(['stop-accepting', 'finish-iteration', 'flush-events', 'persist-state', 'shutdown']);
  });

  it('is idempotent', async () => {
    const eventBus = new InMemoryEventBus();
    const eventLoop = buildEventLoopStub();
    const sh = createShutdownHandler({ eventBus, eventLoop });
    const p1 = sh.shutdown('stop');
    const p2 = sh.shutdown('stop');
    expect(p1).toBe(p2);
    await p1;
  });

  it('invokes persistence and stop-accepting hooks when provided', async () => {
    const eventBus = new InMemoryEventBus();
    const eventLoop = buildEventLoopStub();
    const stopAccepting = vi.fn();
    const persistState = vi.fn().mockResolvedValue(undefined);
    const sh = createShutdownHandler({
      eventBus,
      eventLoop,
      stopAccepting,
      persistState,
    });
    await sh.shutdown('signal');
    expect(stopAccepting).toHaveBeenCalled();
    expect(persistState).toHaveBeenCalled();
    expect(sh.currentPhase()).toBe('completed');
  });
});

// --- Parallel execution coordinator -------------------------------------

describe('ParallelExecutionCoordinator', () => {
  it('respects maxConcurrent', async () => {
    let inFlight = 0;
    let maxObserved = 0;
    const executionLoop: ExecutionLoop = {
      dispatchByExecution: vi.fn(async (e: Execution) => {
        inFlight += 1;
        maxObserved = Math.max(maxObserved, inFlight);
        await new Promise(r => setTimeout(r, 20));
        inFlight -= 1;
        return {
          executionUoid: e.uoid,
          taskUoid: undefined,
          success: true,
          event: eventEnvelope('task.completed'),
        } as DispatchResult;
      }),
    } as unknown as ExecutionLoop;

    const coord = createParallelExecutionCoordinator({
      executionLoop,
      maxConcurrent: 2,
    });
    const executions: Execution[] = Array.from({ length: 6 }, (_, i) => ({
      uoid: { toString: () => `exe_${i}` } as Uoid,
    } as unknown as Execution));
    const results = await coord.dispatchMany(executions);
    expect(results).toHaveLength(6);
    expect(maxObserved).toBeLessThanOrEqual(2);
  });

  it('isolates failures so one bad execution does not affect others', async () => {
    const calls: string[] = [];
    const executionLoop: ExecutionLoop = {
      dispatchByExecution: vi.fn(async (e: Execution) => {
        calls.push(e.uoid.toString());
        if (e.uoid.toString() === 'bad') {
          throw new Error('kaboom');
        }
        return {
          executionUoid: e.uoid,
          taskUoid: undefined,
          success: true,
          event: eventEnvelope('task.completed'),
        } as DispatchResult;
      }),
    } as unknown as ExecutionLoop;

    const coord = createParallelExecutionCoordinator({ executionLoop, maxConcurrent: 4 });
    const executions: Execution[] = ['ok1', 'bad', 'ok2', 'bad', 'ok3'].map(
      id => ({ uoid: { toString: () => id } as Uoid } as unknown as Execution)
    );
    const results = await coord.dispatchMany(executions);
    expect(results).toHaveLength(5);
    const failed = results.filter(r => !r.success);
    const ok = results.filter(r => r.success);
    expect(failed).toHaveLength(2);
    expect(ok).toHaveLength(3);
  });

  it('exposes metrics', async () => {
    const executionLoop: ExecutionLoop = {
      dispatchByExecution: vi.fn(async (e: Execution) => ({
        executionUoid: e.uoid,
        taskUoid: undefined,
        success: true,
        event: eventEnvelope('task.completed'),
      } as DispatchResult)),
    } as unknown as ExecutionLoop;
    const coord = createParallelExecutionCoordinator({ executionLoop });
    const m0 = coord.metrics();
    expect(m0.inFlight).toBe(0);
    expect(m0.maxConcurrent).toBe(8);
    coord.setMaxConcurrent(3);
    expect(coord.metrics().maxConcurrent).toBe(3);
  });
});

// --- SystemLoop end-to-end ----------------------------------------------

describe('SystemLoop', () => {
  let eventBus: EventBus;
  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  it('runs an iteration when there is pending work and records it', async () => {
    const execUoid = { toString: () => 'exe_1' } as Uoid;
    const taskUoid = { toString: () => 'task_1' } as Uoid;
    const execution = { uoid: execUoid } as unknown as Execution;
    const task = { uoid: taskUoid } as unknown as Task;

    const scheduler = buildSchedulerStub({ ready: [execution], selected: execution, task });
    const { loop: executionLoop } = buildExecutionLoopStub({ output: { ok: 1 } });
    const eventLoop = buildEventLoopStub();

    const loop = new SystemLoop({ eventBus, scheduler, executionLoop, eventLoop });
    const ctx = await loop.tick();
    expect(ctx.executionsProcessed).toContainEqual(execUoid);
    expect(loop.metricsSnapshot.activeIterations).toBe(1);
    expect(loop.metricsSnapshot.tasksSucceeded).toBe(1);
    expect(loop.metricsSnapshot.eventsPublished).toBe(1);
  });

  it('start/stop works in event-driven mode', async () => {
    const stateChanges: string[] = [];
    const scheduler = buildSchedulerStub();
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();

    const loop = new SystemLoop({
      eventBus,
      scheduler,
      executionLoop,
      eventLoop,
      tickIntervalMs: 0, // event-driven
      onStateChange: s => stateChanges.push(s),
    });

    const p = loop.start();
    // Yield so the loop runs at least once
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));
    expect(loop.isRunning).toBe(true);

    loop.stop('user');
    await p;

    expect(loop.isRunning).toBe(false);
    expect(loop.currentState).toBe('stopped');
    expect(stateChanges[0]).toBe('starting');
    expect(stateChanges[stateChanges.length - 1]).toBe('stopped');
  });

  it('start/stop works in timer-driven mode', async () => {
    const scheduler = buildSchedulerStub();
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();

    const loop = new SystemLoop({
      eventBus,
      scheduler,
      executionLoop,
      eventLoop,
      tickIntervalMs: 5,
    });
    const p = loop.start();
    await new Promise(r => setTimeout(r, 25));
    loop.stop('user');
    await p;
    expect(loop.currentState).toBe('stopped');
    expect(loop.metricsSnapshot.iterations).toBeGreaterThan(0);
  });

  it('start() is idempotent while running', async () => {
    const scheduler = buildSchedulerStub();
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();

    const loop = new SystemLoop({
      eventBus,
      scheduler,
      executionLoop,
      eventLoop,
      tickIntervalMs: 0,
    });
    const p1 = loop.start();
    const p2 = loop.start();
    expect(p1).toBe(p2);
    loop.stop('user');
    await p1;
  });

  it('health() reflects current state and metrics', async () => {
    const scheduler = buildSchedulerStub();
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();
    const loop = new SystemLoop({ eventBus, scheduler, executionLoop, eventLoop });

    const h = loop.health();
    expect(h.state).toBe('stopped');
    expect(h.isRunning).toBe(false);
    expect(h.uptimeMs).toBe(0);

    const p = loop.start();
    await new Promise(r => setImmediate(r));
    loop.stop('user');
    await p;

    const h2 = loop.health();
    expect(h2.state).toBe('stopped');
  });

  it('submit() forwards to the scheduler', async () => {
    const scheduler = buildSchedulerStub();
    const { loop: executionLoop } = buildExecutionLoopStub();
    const eventLoop = buildEventLoopStub();
    const loop = new SystemLoop({ eventBus, scheduler, executionLoop, eventLoop });
    const exec = { uoid: { toString: () => 'exe_sub' } as Uoid } as Execution;
    const id = await loop.submit(exec);
    expect(id.toString()).toBe('exe_sub');
    expect(scheduler.enqueue).toHaveBeenCalledWith(exec);
  });
});

// --- createSystemLoop factory -------------------------------------------

describe('createSystemLoop', () => {
  it('returns a SystemLoop instance', () => {
    const loop = createSystemLoop({
      eventBus: new InMemoryEventBus(),
      scheduler: buildSchedulerStub(),
      executionLoop: buildExecutionLoopStub().loop,
      eventLoop: buildEventLoopStub(),
    });
    expect(loop).toBeInstanceOf(SystemLoop);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
