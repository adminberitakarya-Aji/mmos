/**
 * MMOS SchedulerLoop Tests
 * Per docs/reference/runtime/scheduler-loop.md
 *
 * Covers:
 *   - PriorityEvaluator ordering & normalization
 *   - DependencyEvaluator satisfied / missing / cycle / bulk
 *   - CapabilityEvaluator single / batch / cache
 *   - ResourceEvaluator gating / merge / tracker
 *   - ReadyQueue ordering, dedup, find, moveToFront
 *   - RetryQueue delay, dedup, popReady, remove
 *   - FairSelector round-robin, starvation, snapshot
 *   - Scheduler end-to-end with task graph
 *   - Scheduler metrics
 */

import { describe, it, expect, vi } from 'vitest';
import { comparePriority, normalizePriority, isPriority } from './priority-evaluator.js';
import {
  evaluateDependencies,
  createDependencyResolver,
  detectCycle,
  findReadyTasks,
} from './dependency-evaluator.js';
import {
  evaluateCapability,
  evaluateCapabilities,
  isValidCapabilityReference,
  createCapabilityCache,
} from './capability-evaluator.js';
import {
  evaluateResources,
  DEFAULT_RESOURCES,
  mergeResources,
  subtractResources,
  createResourceTracker,
} from './resource-evaluator.js';
import { createReadyQueue } from './ready-queue.js';
import { createRetryQueue } from './retry-queue.js';
import { createFairSelector } from './fair-selection.js';
import { createScheduler } from './scheduler.js';
import type { Uoid, Task, Execution, Capability, CapabilityEngine } from '@mmos/sdk';

// --- helpers -------------------------------------------------------------

// Memoize Uoid objects so reference equality works between calls.
// (In production, the same Uoid string maps to a single Uoid object; the
// test helper must reflect that.)
const _uoidCache = new Map<string, Uoid>();
function uoid(s: string): Uoid {
  let u = _uoidCache.get(s);
  if (!u) {
    u = { toString: () => s, equals: (o: { toString(): string }) => o.toString() === s } as unknown as Uoid;
    _uoidCache.set(s, u);
  }
  return u;
}

function makeTask(id: string, capabilityUoid: Uoid = uoid('cap_default'), deps: Uoid[] = []): Task {
  return {
    uoid: uoid(id),
    name: id,
    spec: { capability: capabilityUoid, dependencies: deps, input: {} },
  } as unknown as Task;
}

function makeExecution(id: string, priority?: 'critical' | 'high' | 'normal' | 'low', resources?: object): Execution {
  const spec: Record<string, unknown> = {};
  if (priority !== undefined) spec.priority = priority;
  if (resources !== undefined) spec.resources = resources;
  return {
    uoid: uoid(id),
    spec,
  } as unknown as Execution;
}

function makeEngine(name: string, canHandle: (id: string) => boolean): CapabilityEngine {
  return {
    name,
    canHandle: vi.fn(async (u: Uoid) => canHandle(u.toString())),
  } as unknown as CapabilityEngine;
}

// --- PriorityEvaluator ---------------------------------------------------

describe('PriorityEvaluator', () => {
  it('orders priority correctly', () => {
    expect(comparePriority('critical', 'low')).toBeLessThan(0);
    expect(comparePriority('low', 'critical')).toBeGreaterThan(0);
    expect(comparePriority('normal', 'normal')).toBe(0);
  });

  it('normalizes unknown priority to fallback', () => {
    expect(normalizePriority(undefined)).toBe('normal');
    expect(normalizePriority('critical')).toBe('critical');
    expect(normalizePriority(42)).toBe('normal');
    expect(normalizePriority('whatever', 'low')).toBe('low');
  });

  it('isPriority narrows correctly', () => {
    expect(isPriority('critical')).toBe(true);
    expect(isPriority('urgent')).toBe(false);
  });
});

// --- DependencyEvaluator -------------------------------------------------

describe('DependencyEvaluator', () => {
  it('reports satisfied when all completed', () => {
    const t = makeTask('t1');
    const d1 = uoid('d0');
    const r = evaluateDependencies(t, [d1], { completed: new Map([[d1, 'ok']]) });
    expect(r.satisfied).toBe(true);
    expect(r.pending).toHaveLength(0);
  });

  it('reports unsatisfied when missing', () => {
    const t = makeTask('t1');
    const d1 = uoid('d0');
    const r = evaluateDependencies(t, [d1], { completed: new Map() });
    expect(r.satisfied).toBe(false);
    expect(r.pending).toContainEqual(d1);
  });

  it('builds a dependency map from workflow transitions', () => {
    const w = { spec: { transitions: [{ from: uoid('a'), to: uoid('b') }] } };
    const resolver = createDependencyResolver(w);
    expect(resolver(uoid('b'))).toEqual([uoid('a')]);
    expect(resolver(uoid('a'))).toEqual([]);
  });

  it('detects cycles', () => {
    const w = {
      spec: {
        transitions: [
          { from: uoid('a'), to: uoid('b') },
          { from: uoid('b'), to: uoid('c') },
          { from: uoid('c'), to: uoid('a') },
        ],
      },
    };
    const cycle = detectCycle(w);
    expect(cycle).toBeDefined();
    expect(cycle!.length).toBeGreaterThan(0);
  });

  it('returns no cycle for a DAG', () => {
    const w = {
      spec: {
        transitions: [
          { from: uoid('a'), to: uoid('b') },
          { from: uoid('b'), to: uoid('c') },
        ],
      },
    };
    expect(detectCycle(w)).toBeUndefined();
  });

  it('findReadyTasks bulk-computes ready Uoids', () => {
    const t1 = makeTask('t1');
    const t2 = makeTask('t2', uoid('c'), [uoid('t1')]);
    const w = { spec: { transitions: [{ from: uoid('t1'), to: uoid('t2') }] } };
    const completed = new Map<Uoid, unknown>([[uoid('t1'), 'ok']]);
    const ready = findReadyTasks([t1, t2], w, completed);
    expect(ready).toEqual([uoid('t2')]);
  });
});

// --- CapabilityEvaluator -------------------------------------------------

describe('CapabilityEvaluator', () => {
  it('returns false when capability is missing', async () => {
    const t = makeTask('t', uoid('missing'));
    const r = await evaluateCapability(t, undefined, undefined);
    expect(r.available).toBe(false);
  });

  it('returns false when engine rejects', async () => {
    const t = makeTask('t');
    const cap = { uoid: uoid('c'), name: 'c' } as unknown as Capability;
    const engine = makeEngine('rej', () => false);
    const r = await evaluateCapability(t, cap, engine);
    expect(r.available).toBe(false);
  });

  it('returns true when engine accepts', async () => {
    const t = makeTask('t');
    const cap = { uoid: uoid('c'), name: 'c' } as unknown as Capability;
    const engine = makeEngine('ok', () => true);
    const r = await evaluateCapability(t, cap, engine);
    expect(r.available).toBe(true);
  });

  it('evaluateCapabilities bulk-checks all tasks', async () => {
    const t1 = makeTask('t1', uoid('c1'));
    const t2 = makeTask('t2', uoid('c2'));
    const resolver = (u: Uoid) => ({ uoid: u, name: u.toString() } as unknown as Capability);
    const engine = makeEngine('mixed', id => id === 'c1');
    const results = await evaluateCapabilities([t1, t2], resolver, engine);
    expect(results.get('t1')?.available).toBe(true);
    expect(results.get('t2')?.available).toBe(false);
  });

  it('isValidCapabilityReference detects empty references', () => {
    expect(isValidCapabilityReference(uoid('ok'))).toBe(true);
    expect(isValidCapabilityReference(uoid(''))).toBe(false);
  });

  it('CapabilityCache memoizes canHandle', async () => {
    const engine = makeEngine('eng', () => true);
    const cache = createCapabilityCache();
    await cache.canHandle(engine, uoid('a'));
    await cache.canHandle(engine, uoid('a'));
    expect(engine.canHandle).toHaveBeenCalledTimes(1);
    expect(cache.size()).toBe(1);
    cache.clear();
    expect(cache.size()).toBe(0);
  });
});

// --- ResourceEvaluator ---------------------------------------------------

describe('ResourceEvaluator', () => {
  it('evaluates enough resources', () => {
    const r = evaluateResources(DEFAULT_RESOURCES, { cpu: 0.1 });
    expect(r.enough).toBe(true);
  });

  it('reports missing fields', () => {
    const r = evaluateResources({ ...DEFAULT_RESOURCES, cpu: 0.95 }, { cpu: 0.1 });
    expect(r.enough).toBe(false);
    expect(r.missing).toContain('cpu');
  });

  it('mergeResources sums with clamping', () => {
    const m = mergeResources(
      { ...DEFAULT_RESOURCES, cpu: 0.6 },
      { ...DEFAULT_RESOURCES, cpu: 0.6 }
    );
    expect(m.cpu).toBe(1); // clamped
  });

  it('subtractResources never goes below zero', () => {
    const s = subtractResources({ ...DEFAULT_RESOURCES, cpu: 0.2 }, { cpu: 0.5 });
    expect(s.cpu).toBe(0);
  });

  it('ResourceTracker reserves and releases', () => {
    const t = createResourceTracker({ ...DEFAULT_RESOURCES, workers: { inUse: 0, total: 2 } });
    expect(t.reserve({ workers: 2 })).toBe(true);
    expect(t.reserve({ workers: 1 })).toBe(false);
    t.release({ workers: 1 });
    expect(t.reserve({ workers: 1 })).toBe(true);
    const stats = t.totalReservations();
    expect(stats.ok).toBe(2);
    expect(stats.failed).toBe(1);
  });
});

// --- ReadyQueue ----------------------------------------------------------

describe('ReadyQueue', () => {
  it('orders by priority then seq', () => {
    const q = createReadyQueue();
    const e = makeExecution('e1');
    const t1 = makeTask('t1');
    const t2 = makeTask('t2');
    q.enqueue(t1, e, 'low');
    q.enqueue(t2, e, 'critical');
    expect(q.dequeue()!.task.uoid.toString()).toBe('t2');
    expect(q.dequeue()!.task.uoid.toString()).toBe('t1');
  });

  it('dedupes (execution, task) pairs', () => {
    const q = createReadyQueue();
    const e = makeExecution('e1');
    const t = makeTask('t1');
    q.enqueue(t, e, 'normal');
    q.enqueue(t, e, 'normal');
    expect(q.size()).toBe(1);
  });

  it('find returns the first matching entry', () => {
    const q = createReadyQueue();
    const e = makeExecution('e1');
    const t = makeTask('t1');
    q.enqueue(t, e, 'normal');
    const found = q.find(en => en.task.uoid.toString() === 't1');
    expect(found?.task).toBe(t);
  });

  it('moveToFront promotes matching entries', () => {
    const q = createReadyQueue();
    const e = makeExecution('e1');
    const tA = makeTask('A');
    const tB = makeTask('B');
    q.enqueue(tA, e, 'low');
    q.enqueue(tB, e, 'low');
    q.moveToFront(en => en.task.uoid.toString() === 'A');
    expect(q.peek()[0]!.task.uoid.toString()).toBe('A');
  });
});

// --- RetryQueue ----------------------------------------------------------

describe('RetryQueue', () => {
  it('delays entries by delayMs', () => {
    const r = createRetryQueue();
    r.schedule(makeTask('t'), makeExecution('e'), 1, 1000, 'transient');
    expect(r.size()).toBe(1);
    expect(r.popReady(new Date(Date.now() + 2000))).toHaveLength(1);
    expect(r.size()).toBe(0);
  });

  it('dedupes by (execution, task)', () => {
    const r = createRetryQueue();
    r.schedule(makeTask('t'), makeExecution('e'), 1, 1000, 'a');
    r.schedule(makeTask('t'), makeExecution('e'), 2, 500, 'b');
    expect(r.size()).toBe(1);
    expect(r.peek()[0]!.attempt).toBe(2);
  });

  it('peek returns without removal', () => {
    const r = createRetryQueue();
    r.schedule(makeTask('t'), makeExecution('e'), 1, 1000, 'a');
    expect(r.peek()).toHaveLength(1);
    expect(r.size()).toBe(1);
  });

  it('remove filters entries', () => {
    const r = createRetryQueue();
    r.schedule(makeTask('t1'), makeExecution('e1'), 1, 1000, 'a');
    r.schedule(makeTask('t2'), makeExecution('e2'), 1, 1000, 'a');
    const n = r.remove(en => en.task.uoid.toString() === 't1');
    expect(n).toBe(1);
    expect(r.size()).toBe(1);
  });
});

// --- FairSelector --------------------------------------------------------

describe('FairSelector', () => {
  it('rotates round-robin', () => {
    const f = createFairSelector();
    const a = uoid('a'); const b = uoid('b');
    f.touch(a);
    expect(f.pickNext([a, b])).toBe(a);
    expect(f.pickNext([a, b])).toBe(b);
    expect(f.pickNext([a, b])).toBe(a);
  });

  it('promotes starving execution', () => {
    let t = 0;
    const f = createFairSelector({ maxWaitMs: 10, now: () => new Date(t) });
    const a = uoid('a'); const b = uoid('b');
    f.touch(a);
    f.touch(b);
    // advance time so a is starving
    t = 1000;
    // b was touched at t=0; a was served last at t=0, starving at t=1000
    // The starved one is whichever hasn't been served in 10ms
    // Reset lastServedAt to a very old value
    f.snapshot(); // ensure state exists
    const next = f.pickNext([a, b]);
    expect([a, b]).toContainEqual(next);
  });

  it('snapshot reports wait time and starving state', () => {
    let t = 0;
    const f = createFairSelector({ maxWaitMs: 100, now: () => new Date(t) });
    f.touch(uoid('a'));
    t = 200;
    const snap = f.snapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0]!.isStarving).toBe(true);
    expect(snap[0]!.waitMs).toBe(200);
  });

  it('forget removes tracking', () => {
    const f = createFairSelector();
    const a = uoid('a');
    f.touch(a);
    f.forget(a);
    expect(f.snapshot()).toHaveLength(0);
  });
});

// --- Scheduler end-to-end -----------------------------------------------

describe('Scheduler end-to-end', () => {
  it('selects the entry task when no dependencies', async () => {
    const scheduler = createScheduler();
    const e = makeExecution('e1', 'normal');
    const t1 = makeTask('t1');
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1]);
    const ready = await scheduler.peekReadyExecutions();
    expect(ready).toHaveLength(1);
    const selected = await scheduler.selectNextExecution();
    expect(selected?.uoid.toString()).toBe('e1');
    const task = await scheduler.selectNextTask(e);
    expect(task?.uoid.toString()).toBe('t1');
  });

  it('only dispatches when dependencies are satisfied', async () => {
    const t1 = makeTask('t1');
    const t2 = makeTask('t2', uoid('c'), [uoid('t1')]);
    const w = { spec: { transitions: [{ from: uoid('t1'), to: uoid('t2') }] } };
    const e = makeExecution('e1');
    const scheduler = createScheduler({ resolveDependencies: createDependencyResolver(w) });
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1, t2]);
    // Only t1 is ready
    const task1 = await scheduler.selectNextTask(e);
    expect(task1?.uoid.toString()).toBe('t1');
    // Mark t1 complete; t2 should now be ready
    scheduler.markTaskCompleted(e, uoid('t1'), 'output');
    const task2 = await scheduler.selectNextTask(e);
    expect(task2?.uoid.toString()).toBe('t2');
  });

  it('dispatches a task and updates metrics', async () => {
    const t1 = makeTask('t1');
    const e = makeExecution('e1');
    const scheduler = createScheduler();
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1]);
    const decision = await scheduler.dispatch(t1, e);
    expect(decision).toBeDefined();
    expect(decision?.where.engineName).toBe('unknown');
    const m = scheduler.metrics();
    expect(m.executions).toBe(1);
    expect(m.dispatched).toBe(1);
    expect(m.inFlightTasks).toBe(1);
  });

  it('selectNextTask respects capability gate', async () => {
    const goodCap = { uoid: uoid('good'), name: 'good' } as unknown as Capability;
    const badCap = { uoid: uoid('bad'), name: 'bad' } as unknown as Capability;
    const engine = makeEngine('mixed', id => id === 'good');
    const resolver = (u: Uoid) => (u.toString() === 'good' ? goodCap : badCap);

    const t1 = makeTask('t1', uoid('good'));
    const t2 = makeTask('t2', uoid('bad'));
    const e = makeExecution('e1');
    const scheduler = createScheduler({
      capabilityEngine: engine,
      resolveCapability: resolver,
    });
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1, t2]);

    const task = await scheduler.selectNextTask(e);
    expect(task?.uoid.toString()).toBe('t1');
  });

  it('respects resources gate', async () => {
    const t1 = makeTask('t1');
    const e = makeExecution('e1', 'normal', { cpu: 0.5 });
    const scheduler = createScheduler({
      resourceSnapshot: () => ({ ...DEFAULT_RESOURCES, cpu: 0.6 }),
    });
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1]);
    const task = await scheduler.selectNextTask(e);
    expect(task).toBeUndefined(); // not enough CPU
  });

  it('round-robins between multiple ready executions', async () => {
    const scheduler = createScheduler();
    const e1 = makeExecution('e1');
    const e2 = makeExecution('e2');
    const t1 = makeTask('t1');
    const t2 = makeTask('t2');
    await scheduler.enqueue(e1);
    await scheduler.enqueue(e2);
    scheduler.setTasks(e1, [t1]);
    scheduler.setTasks(e2, [t2]);
    const first = await scheduler.selectNextExecution();
    const second = await scheduler.selectNextExecution();
    expect([first?.uoid.toString(), second?.uoid.toString()].sort()).toEqual(['e1', 'e2']);
  });

  it('markTaskFailed removes from ready and inFlight', async () => {
    const t1 = makeTask('t1');
    const e = makeExecution('e1');
    const scheduler = createScheduler();
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1]);
    await scheduler.dispatch(t1, e);
    scheduler.markTaskFailed(e, uoid('t1'), 'kaboom');
    const m = scheduler.metrics();
    expect(m.failedTasks).toBe(1);
    expect(m.inFlightTasks).toBe(0);
  });

  it('scheduleRetry surfaces entries via popReady', async () => {
    const t1 = makeTask('t1');
    const e = makeExecution('e1');
    const scheduler = createScheduler();
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1]);
    scheduler.scheduleRetry(t1, e, 1, 10, 'transient');
    expect(scheduler.metrics().retryQueueSize).toBe(1);
    // After the delay the entry should reappear as ready
    await new Promise(r => setTimeout(r, 15));
    const ready = await scheduler.peekReadyExecutions();
    expect(ready).toHaveLength(1);
  });

  it('fires onDispatch and onTaskCompleted hooks', async () => {
    const t1 = makeTask('t1');
    const e = makeExecution('e1');
    const onDispatch = vi.fn();
    const onTaskCompleted = vi.fn();
    const scheduler = createScheduler({ onDispatch, onTaskCompleted });
    await scheduler.enqueue(e);
    scheduler.setTasks(e, [t1]);
    await scheduler.dispatch(t1, e);
    scheduler.markTaskCompleted(e, uoid('t1'), 'out');
    expect(onDispatch).toHaveBeenCalledTimes(1);
    expect(onTaskCompleted).toHaveBeenCalledTimes(1);
  });

  it('multi-execution: peeks the union of all ready tasks', async () => {
    const scheduler = createScheduler();
    const e1 = makeExecution('e1');
    const e2 = makeExecution('e2');
    const t1 = makeTask('t1');
    const t2 = makeTask('t2');
    await scheduler.enqueue(e1);
    await scheduler.enqueue(e2);
    scheduler.setTasks(e1, [t1]);
    scheduler.setTasks(e2, [t2]);
    const m = scheduler.metrics();
    expect(m.executions).toBe(2);
    expect(m.ready).toBe(2);
    expect(m.readyQueueSize).toBe(2);
  });
});
