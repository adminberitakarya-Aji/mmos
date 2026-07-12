/**
 * MMOS Scheduler - What? When? Where?
 * Per docs/reference/runtime/scheduler-loop.md
 *
 * The Scheduler answers three questions:
 *   - What?  (which Task)
 *   - When?  (now or later)
 *   - Where? (which Engine)
 *
 * It does NOT run work; it only selects.
 *
 * Architecture:
 *   - The ExecutionLoop submits an Execution via `enqueue` and registers
 *     its task graph via `setTasks`.
 *   - As tasks complete, callers invoke `markTaskCompleted` so the
 *     Scheduler can advance the dependency graph.
 *   - On each heartbeat, the SystemLoop asks the Scheduler to:
 *       1) `peekReadyExecutions()` to size the work in front
 *       2) `selectNextExecution()` for fair-pick (anti-starvation)
 *       3) `selectNextTask(execution)` for capability/resource gating
 *       4) `dispatch(task, execution)` to pop and emit a SelectionDecision
 */

import type { Execution, Task, Uoid, CapabilityEngine, Capability } from '@mmos/sdk';
import { normalizePriority, type Priority } from './priority-evaluator.js';
import { evaluateDependencies, type DependencyResolver, type DependencyContext } from './dependency-evaluator.js';
import { evaluateCapability } from './capability-evaluator.js';
import { evaluateResources, DEFAULT_RESOURCES, type ResourceSnapshot, type ResourceRequirements } from './resource-evaluator.js';
import { createReadyQueue, type ReadyQueue, type QueueEntry } from './ready-queue.js';
import { createRetryQueue, type RetryQueue, type RetryEntry } from './retry-queue.js';
import { createFairSelector, type FairSelector } from './fair-selection.js';

export interface SchedulerOptions {
  readonly capabilityEngine?: CapabilityEngine | undefined;
  readonly resolveCapability?: ((uoid: Uoid) => Capability | undefined) | undefined;
  readonly resolveDependencies?: DependencyResolver | undefined;
  readonly resourceSnapshot?: (() => ResourceSnapshot) | undefined;
  readonly fairSelector?: FairSelector | undefined;
  /** Optional hook fired after a SelectionDecision is produced */
  readonly onDispatch?: ((decision: SelectionDecision) => void) | undefined;
  /** Optional hook fired when a task is marked completed */
  readonly onTaskCompleted?: ((execution: Execution, taskUoid: Uoid) => void) | undefined;
  /** Optional hook fired when a task is scheduled for retry */
  readonly onRetryScheduled?: ((entry: RetryEntry) => void) | undefined;
}

export interface SelectionDecision {
  readonly execution: Execution;
  readonly task: Task;
  readonly where: { readonly engineName: string };
}

/**
 * Mutable per-execution state tracked by the Scheduler.
 */
interface ExecutionState {
  readonly execution: Execution;
  tasks: ReadonlyMap<Uoid, Task>;
  entryTaskUoid: Uoid | undefined;
  completed: Map<Uoid, unknown>;
  failed: Set<Uoid>;
  inFlight: Set<Uoid>;
}

export interface SchedulerMetrics {
  /** Total executions registered */
  readonly executions: number;
  /** Executions with at least one ready task */
  readonly ready: number;
  /** Total tasks across all executions */
  readonly totalTasks: number;
  /** Tasks completed successfully */
  readonly completedTasks: number;
  /** Tasks that failed (and may be retried) */
  readonly failedTasks: number;
  /** Tasks currently being dispatched */
  readonly inFlightTasks: number;
  /** Tasks waiting in retry queue */
  readonly retryQueueSize: number;
  /** Tasks currently in the ready queue */
  readonly readyQueueSize: number;
  /** Total SelectionDecisions produced */
  readonly dispatched: number;
}

export interface Scheduler {
  enqueue(execution: Execution): Promise<void>;
  /** Register the task graph for an already-enqueued execution */
  setTasks(execution: Execution, tasks: readonly Task[], entryTaskUoid?: Uoid): void;
  /** Mark a task as completed; downstream tasks may become ready */
  markTaskCompleted(execution: Execution, taskUoid: Uoid, output?: unknown): void;
  /** Mark a task as failed; may be retried or marked terminal */
  markTaskFailed(execution: Execution, taskUoid: Uoid, reason: string): void;
  /** Schedule a task for retry; integrates with the retry queue */
  scheduleRetry(task: Task, execution: Execution, attempt: number, delayMs: number, reason: string): void;
  peekReadyExecutions(): Promise<readonly Execution[]>;
  selectNextExecution(): Promise<Execution | undefined>;
  selectNextTask(execution: Execution): Promise<Task | undefined>;
  dispatch(task: Task, execution: Execution): Promise<SelectionDecision | undefined>;
  metrics(): SchedulerMetrics;
}

export function createScheduler(options: SchedulerOptions = {}): Scheduler {
  const queue: ReadyQueue = createReadyQueue();
  const retry: RetryQueue = createRetryQueue();
  const fair: FairSelector = options.fairSelector ?? createFairSelector();
  const state: Map<string, ExecutionState> = new Map();
  let totalDispatched = 0;
  let totalCompleted = 0;
  let totalFailed = 0;

  function getOrCreate(execution: Execution): ExecutionState {
    const key = execution.uoid.toString();
    let s = state.get(key);
    if (!s) {
      s = {
        execution,
        tasks: new Map(),
        entryTaskUoid: undefined,
        completed: new Map(),
        failed: new Set(),
        inFlight: new Set(),
      };
      state.set(key, s);
    }
    return s;
  }

  function priorityOf(execution: Execution): Priority {
    const raw = (execution.spec as { priority?: unknown }).priority;
    return normalizePriority(raw);
  }

  function resourceRequirements(execution: Execution): ResourceRequirements {
    return (execution.spec as { resources?: ResourceRequirements }).resources ?? {};
  }

  function depResolver(): DependencyResolver {
    return options.resolveDependencies ?? (() => []);
  }

  function pushReadyTasks(s: ExecutionState): void {
    // Re-evaluate all tasks for this execution
    const ctx: DependencyContext = { completed: s.completed };
    for (const [taskUoid, task] of s.tasks) {
      if (s.completed.has(taskUoid)) continue;
      if (s.failed.has(taskUoid)) continue;
      if (s.inFlight.has(taskUoid)) continue;

      const deps = depResolver()(taskUoid);
      const depResult = evaluateDependencies(task, deps, ctx);
      if (!depResult.satisfied) continue;

      // Capability gate
      if (options.resolveCapability && options.capabilityEngine) {
        const cap = options.resolveCapability(task.spec.capability);
        // We push; async capability check is done in selectNextTask to keep
        // enqueue synchronous and O(1). However we surface availability
        // via the queue metadata.
        if (!cap) continue;
      }
      queue.enqueue(task, s.execution, priorityOf(s.execution));
    }
  }

  async function rebuildAllReady(): Promise<void> {
    queue.clear();
    for (const s of state.values()) {
      fair.touch(s.execution.uoid);
      pushReadyTasks(s);
    }
  }

  return {
    async enqueue(execution) {
      getOrCreate(execution);
      await rebuildAllReady();
    },
    setTasks(execution, tasks, entryTaskUoid) {
      const s = getOrCreate(execution);
      s.tasks = new Map(tasks.map(t => [t.uoid, t] as const));
      s.entryTaskUoid = entryTaskUoid ?? tasks[0]?.uoid;
      // Re-evaluate
      queue.remove(e => e.execution.uoid.equals(execution.uoid));
      pushReadyTasks(s);
    },
    markTaskCompleted(execution, taskUoid, output) {
      const s = getOrCreate(execution);
      s.completed.set(taskUoid, output);
      s.inFlight.delete(taskUoid);
      totalCompleted += 1;
      // Drop any ready-queue entries for this task
      queue.remove(e =>
        e.execution.uoid.equals(execution.uoid) && e.task.uoid.equals(taskUoid)
      );
      // Push downstream tasks that may now be ready
      pushReadyTasks(s);
      if (options.onTaskCompleted) {
        try { options.onTaskCompleted(execution, taskUoid); } catch { /* best effort */ }
      }
    },
    markTaskFailed(execution, taskUoid, _reason) {
      const s = getOrCreate(execution);
      s.failed.add(taskUoid);
      s.inFlight.delete(taskUoid);
      totalFailed += 1;
      queue.remove(e =>
        e.execution.uoid.equals(execution.uoid) && e.task.uoid.equals(taskUoid)
      );
    },
    scheduleRetry(task, execution, attempt, delayMs, reason) {
      retry.schedule(task, execution, attempt, delayMs, reason);
      if (options.onRetryScheduled) {
        try { options.onRetryScheduled({ task, execution, attempt, nextAttemptAt: new Date(Date.now() + delayMs), reason }); } catch { /* */ }
      }
    },
    async peekReadyExecutions() {
      // Pull retry-ready entries into the queue first
      const due = retry.popReady(new Date());
      for (const r of due) {
        const s = getOrCreate(r.execution);
        if (s.completed.has(r.task.uoid) || s.failed.has(r.task.uoid) || s.inFlight.has(r.task.uoid)) {
          continue;
        }
        queue.enqueue(r.task, r.execution, priorityOf(r.execution));
      }
      const entries = queue.peek();
      const set = new Set<string>();
      for (const e of entries) set.add(e.execution.uoid.toString());
      const out: Execution[] = [];
      for (const s of state.values()) {
        if (set.has(s.execution.uoid.toString())) {
          out.push(s.execution);
        }
      }
      return out;
    },
    async selectNextExecution() {
      const ready = await this.peekReadyExecutions();
      if (ready.length === 0) return undefined;
      const candidateUoids = ready.map(e => e.uoid);
      const pickedUoid = fair.pickNext(candidateUoids);
      if (!pickedUoid) return undefined;
      return ready.find(e => e.uoid.equals(pickedUoid));
    },
    async selectNextTask(execution) {
      const entries = queue.peek();
      // Find highest-priority entry for this execution
      const matches: QueueEntry[] = entries.filter(e => e.execution.uoid.equals(execution.uoid));
      if (matches.length === 0) return undefined;

      // Walk in priority order; pick the first that passes capability + resources
      for (const entry of matches) {
        if (options.resolveCapability && options.capabilityEngine) {
          const cap = options.resolveCapability(entry.task.spec.capability);
          const capResult = await evaluateCapability(entry.task, cap, options.capabilityEngine);
          if (!capResult.available) continue;
        }
        const snapshot = options.resourceSnapshot?.() ?? DEFAULT_RESOURCES;
        const req = resourceRequirements(execution);
        const resourceCheck = evaluateResources(snapshot, req);
        if (!resourceCheck.enough) continue;
        return entry.task;
      }
      return undefined;
    },
    async dispatch(task, execution) {
      const entries = queue.peek();
      const entry = entries.find(e =>
        e.execution.uoid.equals(execution.uoid) && e.task.uoid.equals(task.uoid)
      );
      if (!entry) return undefined;
      queue.remove(e =>
        e.execution.uoid.equals(execution.uoid) && e.task.uoid.equals(task.uoid)
      );
      const s = getOrCreate(execution);
      s.inFlight.add(task.uoid);
      const engineName = options.capabilityEngine?.name ?? 'unknown';
      const decision: SelectionDecision = {
        execution: entry.execution,
        task: entry.task,
        where: { engineName },
      };
      totalDispatched += 1;
      if (options.onDispatch) {
        try { options.onDispatch(decision); } catch { /* */ }
      }
      return decision;
    },
    metrics() {
      let totalTasks = 0;
      let inFlightTasks = 0;
      let ready = 0;
      const readyExecUoids = new Set(queue.peek().map(e => e.execution.uoid.toString()));
      for (const s of state.values()) {
        totalTasks += s.tasks.size;
        inFlightTasks += s.inFlight.size;
        if (readyExecUoids.has(s.execution.uoid.toString())) ready += 1;
      }
      return {
        executions: state.size,
        ready,
        totalTasks,
        completedTasks: totalCompleted,
        failedTasks: totalFailed,
        inFlightTasks,
        retryQueueSize: retry.size(),
        readyQueueSize: queue.size(),
        dispatched: totalDispatched,
      };
    },
  };
}

/** Expose the internal state shape for advanced use cases (e.g. tests). */
export function asExecutionStateKey(execution: Execution): string {
  return execution.uoid.toString();
}
