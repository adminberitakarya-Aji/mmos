/**
 * MMOS CapabilitySelector - Task → Capability Registry → Matching → Selected
 * Per docs/reference/runtime/agent-loop.md (Capability Selection)
 *
 * Selection is based on the Capability CONTRACT, not the implementation.
 */

import type { Task, Capability, Uoid } from '@mmos/sdk';

export type CapabilityResolver = (uoid: Uoid) => Capability | undefined;

export function selectCapability(
  task: Task,
  resolveCapability: CapabilityResolver
): Capability | undefined {
  return resolveCapability(task.spec.capability);
}

export function matchesContract(capability: Capability, task: Task): boolean {
  return capability.uoid.equals(task.spec.capability);
}
