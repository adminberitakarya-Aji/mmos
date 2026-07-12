/**
 * MMOS CapabilityEvaluator - Checks capability availability
 * Per docs/reference/runtime/scheduler-loop.md (Capability Evaluation)
 *
 *   Task → Required Capability → Capability Registry → Available?
 *
 * The Capability is selected by CONTRACT (its Uoid), not by engine
 * implementation. The Engine advertises that it can handle the Uoid;
 * the scheduler verifies the Engine's claim before dispatching.
 *
 * This module exposes:
 *   - `evaluateCapability(task, capability, engine)` - single check
 *   - `evaluateCapabilities(tasks, resolver, engine)` - bulk check
 *   - `createCapabilityCache()` - memoize canHandle results
 *   - `isValidCapabilityReference(uoid)` - cheap sanity check
 */

import type { Task, Uoid, CapabilityEngine, Capability } from '@mmos/sdk';

export interface CapabilityCheckResult {
  readonly available: boolean;
  readonly reason?: string;
}

export async function evaluateCapability(
  task: Task,
  capability: Capability | undefined,
  engine: CapabilityEngine | undefined
): Promise<CapabilityCheckResult> {
  if (!capability) {
    return { available: false, reason: `Capability ${task.spec.capability.toString()} not found` };
  }
  if (!engine) {
    return { available: false, reason: 'No CapabilityEngine registered' };
  }
  try {
    const canHandle = await engine.canHandle(capability.uoid);
    if (!canHandle) {
      return { available: false, reason: `Engine ${engine.name} cannot handle ${capability.uoid.toString()}` };
    }
    return { available: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { available: false, reason: `Capability check error: ${message}` };
  }
}

export type CapabilityResolver = (uoid: Uoid) => Capability | undefined;

/**
 * Bulk-evaluate a list of tasks. Returns a Map from task Uoid string to
 * the check result.
 */
export async function evaluateCapabilities(
  tasks: readonly Task[],
  resolveCapability: CapabilityResolver,
  engine: CapabilityEngine | undefined
): Promise<Map<string, CapabilityCheckResult>> {
  const out = new Map<string, CapabilityCheckResult>();
  for (const task of tasks) {
    const cap = resolveCapability(task.spec.capability);
    const result = await evaluateCapability(task, cap, engine);
    out.set(task.uoid.toString(), result);
  }
  return out;
}

export function isValidCapabilityReference(capabilityUoid: Uoid): boolean {
  return typeof capabilityUoid.toString() === 'string' && capabilityUoid.toString().length > 0;
}

/**
 * Memoize `canHandle` results per engine+capabilityUoid pair. The cache
 * is best-effort and never expires; if the engine's state changes
 * (registration/de-registration), call `clear()`.
 */
export interface CapabilityCache {
  canHandle(engine: CapabilityEngine, capabilityUoid: Uoid): Promise<boolean>;
  clear(): void;
  size(): number;
}

export function createCapabilityCache(): CapabilityCache {
  const cache = new Map<string, Promise<boolean>>();

  function keyOf(engine: CapabilityEngine, uoid: Uoid): string {
    return `${engine.name}::${uoid.toString()}`;
  }

  return {
    canHandle(engine, capabilityUoid) {
      const k = keyOf(engine, capabilityUoid);
      const hit = cache.get(k);
      if (hit) return hit;
      const p = Promise.resolve(engine.canHandle(capabilityUoid));
      cache.set(k, p);
      return p;
    },
    clear() {
      cache.clear();
    },
    size() {
      return cache.size;
    },
  };
}
