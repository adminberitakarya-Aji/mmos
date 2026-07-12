/**
 * MMOS DependencyEvaluator - Checks task dependencies
 * Per docs/reference/runtime/scheduler-loop.md (Dependency Evaluation)
 *
 *   Task → Dependencies → Satisfied? → Wait | Ready
 *
 * A dependency is "satisfied" if and only if it appears in the
 * `completed` map. A dependency is "missing" if it does not appear in
 * the dependency list of the task itself (i.e. the task has a reference
 * to a Task that was never declared upstream).
 *
 * The module also exposes:
 *   - `createDependencyResolver(workflow)` to derive dependencies from
 *     a workflow's `transitions` array
 *   - `detectCycle(workflow)` to refuse cyclic task graphs
 *   - `findReadyTasks(workflow, completed)` to bulk-compute all ready tasks
 */

import type { Task, Uoid } from '@mmos/sdk';

export interface DependencyResult {
  readonly satisfied: boolean;
  readonly pending: readonly Uoid[];
  readonly missing: readonly Uoid[];
}

export interface DependencyContext {
  /** Map of Uoid -> ExecutionResult of completed task */
  readonly completed: ReadonlyMap<Uoid, unknown>;
}

export type DependencyResolver = (uoid: Uoid) => readonly Uoid[];

export function evaluateDependencies(
  task: Task,
  dependencies: readonly Uoid[],
  ctx: DependencyContext
): DependencyResult {
  const pending: Uoid[] = [];
  const missing: Uoid[] = [];
  for (const dep of dependencies) {
    if (ctx.completed.has(dep)) {
      continue;
    }
    pending.push(dep);
    if (!task.uoid.equals(dep)) {
      missing.push(dep);
    }
  }
  return { satisfied: pending.length === 0, pending, missing };
}

/**
 * A workflow-shaped object used by the dependency utilities.
 */
export interface WorkflowLike {
  spec: { transitions: readonly { from: Uoid; to: Uoid }[] };
}

export function createDependencyResolver(workflow: WorkflowLike): DependencyResolver {
  const map = new Map<string, Uoid[]>();
  for (const t of workflow.spec.transitions) {
    const list = map.get(t.to.toString()) ?? [];
    list.push(t.from);
    map.set(t.to.toString(), list);
  }
  return uoid => map.get(uoid.toString()) ?? [];
}

/**
 * Detect cycles in the workflow's transition graph using DFS.
 * Returns the first cycle as an array of Uoids, or undefined if acyclic.
 */
export function detectCycle(workflow: WorkflowLike): readonly Uoid[] | undefined {
  const map = new Map<string, string[]>();
  for (const t of workflow.spec.transitions) {
    const list = map.get(t.from.toString()) ?? [];
    list.push(t.to.toString());
    map.set(t.from.toString(), list);
  }
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const parent = new Map<string, string | undefined>();
  const allNodes = new Set<string>();
  for (const t of workflow.spec.transitions) {
    allNodes.add(t.from.toString());
    allNodes.add(t.to.toString());
  }
  for (const n of allNodes) color.set(n, WHITE);

  function visit(u: string): readonly Uoid[] | undefined {
    color.set(u, GRAY);
    const neighbors = map.get(u) ?? [];
    for (const v of neighbors) {
      const c = color.get(v) ?? WHITE;
      if (c === WHITE) {
        parent.set(v, u);
        const r = visit(v);
        if (r) return r;
      } else if (c === GRAY) {
        // Cycle found; reconstruct
        const cycle: string[] = [v];
        let cur: string | undefined = u;
        while (cur && cur !== v) {
          cycle.push(cur);
          cur = parent.get(cur);
        }
        cycle.push(v);
        return cycle.map(s => workflow.spec.transitions
          .flatMap(t => [t.from, t.to])
          .find(o => o.toString() === s)) as readonly Uoid[];
      }
    }
    color.set(u, BLACK);
    return undefined;
  }

  for (const n of allNodes) {
    if ((color.get(n) ?? WHITE) === WHITE) {
      const r = visit(n);
      if (r) return r;
    }
  }
  return undefined;
}

/**
 * Bulk-compute which task Uoids are ready given a set of completed ones.
 */
export function findReadyTasks(
  tasks: readonly Task[],
  workflow: WorkflowLike,
  completed: ReadonlyMap<Uoid, unknown>
): readonly Uoid[] {
  const resolver = createDependencyResolver(workflow);
  const ready: Uoid[] = [];
  for (const task of tasks) {
    // Skip tasks that are already completed
    if (completed.has(task.uoid)) continue;
    const deps = resolver(task.uoid);
    const result = evaluateDependencies(task, deps, { completed });
    if (result.satisfied) ready.push(task.uoid);
  }
  return ready;
}
