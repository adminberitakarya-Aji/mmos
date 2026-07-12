/**
 * MMOS ResourceEvaluator - Resource availability check
 * Per docs/reference/runtime/scheduler-loop.md (Resource Evaluation)
 *
 *   CPU, Memory, GPU, Workers → Enough? → Dispatch
 *
 * The Scheduler only checks; it does NOT allocate resources directly.
 * Allocation is performed by the engine that ultimately executes the
 * task. This module provides:
 *   - `evaluateResources(snapshot, required)` - plain gating
 *   - `mergeResources(a, b)`                 - snapshot combination
 *   - `createResourceTracker()`              - mutable in-flight counter
 *   - `reserve(tracker, requirements)`        - attempt to claim
 *   - `release(tracker, requirements)`        - give back
 */

export interface ResourceSnapshot {
  readonly cpu: number;       // 0..1
  readonly memory: number;    // 0..1
  readonly gpu: number;       // 0..1
  readonly workers: { readonly inUse: number; readonly total: number };
}

export interface ResourceRequirements {
  readonly cpu?: number;
  readonly memory?: number;
  readonly gpu?: number;
  readonly workers?: number;
}

export interface ResourceCheckResult {
  readonly enough: boolean;
  readonly missing: readonly string[];
}

export const DEFAULT_RESOURCES: ResourceSnapshot = {
  cpu: 0,
  memory: 0,
  gpu: 0,
  workers: { inUse: 0, total: Number.MAX_SAFE_INTEGER },
};

/**
 * Clamp to [0, 1] to guard against bad inputs.
 */
function clamp01(n: number): number {
  if (Number.isNaN(n) || n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function evaluateResources(
  current: ResourceSnapshot,
  required: ResourceRequirements
): ResourceCheckResult {
  const missing: string[] = [];
  if (required.cpu !== undefined && current.cpu + required.cpu > 1) {
    missing.push('cpu');
  }
  if (required.memory !== undefined && current.memory + required.memory > 1) {
    missing.push('memory');
  }
  if (required.gpu !== undefined && current.gpu + required.gpu > 1) {
    missing.push('gpu');
  }
  if (required.workers !== undefined && current.workers.inUse + required.workers > current.workers.total) {
    missing.push('workers');
  }
  return { enough: missing.length === 0, missing };
}

/**
 * Combine two snapshots by element-wise addition (clamped to [0,1] for the
 * scalar fields and summed for workers). Useful for telemetry aggregation.
 */
export function mergeResources(a: ResourceSnapshot, b: ResourceSnapshot): ResourceSnapshot {
  return {
    cpu: clamp01(a.cpu + b.cpu),
    memory: clamp01(a.memory + b.memory),
    gpu: clamp01(a.gpu + b.gpu),
    workers: {
      inUse: a.workers.inUse + b.workers.inUse,
      total: Math.max(a.workers.total, b.workers.total),
    },
  };
}

/**
 * Subtract requirements from a snapshot (clamped at 0 for scalars and
 * `inUse - workers` for the worker count).
 */
export function subtractResources(
  snapshot: ResourceSnapshot,
  req: ResourceRequirements
): ResourceSnapshot {
  return {
    cpu: clamp01(snapshot.cpu - (req.cpu ?? 0)),
    memory: clamp01(snapshot.memory - (req.memory ?? 0)),
    gpu: clamp01(snapshot.gpu - (req.gpu ?? 0)),
    workers: {
      inUse: Math.max(0, snapshot.workers.inUse - (req.workers ?? 0)),
      total: snapshot.workers.total,
    },
  };
}

export interface ResourceTracker {
  /** Current snapshot */
  snapshot(): ResourceSnapshot;
  /** Attempt to claim resources. Returns true on success. */
  reserve(req: ResourceRequirements): boolean;
  /** Release previously-reserved resources. */
  release(req: ResourceRequirements): void;
  /** Total reservations made (success + fail) */
  totalReservations(): { readonly ok: number; readonly failed: number };
}

export function createResourceTracker(
  initial: ResourceSnapshot = DEFAULT_RESOURCES
): ResourceTracker {
  let state: ResourceSnapshot = { ...initial, workers: { ...initial.workers } };
  let ok = 0;
  let failed = 0;

  return {
    snapshot: () => ({
      cpu: state.cpu,
      memory: state.memory,
      gpu: state.gpu,
      workers: { inUse: state.workers.inUse, total: state.workers.total },
    }),
    reserve(req) {
      const check = evaluateResources(state, req);
      if (!check.enough) {
        failed += 1;
        return false;
      }
      state = mergeResources(state, {
        cpu: req.cpu ?? 0,
        memory: req.memory ?? 0,
        gpu: req.gpu ?? 0,
        workers: {
          inUse: req.workers ?? 0,
          total: 0,
        },
      });
      ok += 1;
      return true;
    },
    release(req) {
      state = subtractResources(state, req);
    },
    totalReservations() {
      return { ok, failed };
    },
  };
}
