/**
 * MMOS SchedulerLoop - Public API
 * Per docs/reference/runtime/scheduler-loop.md
 *
 * Exposes the Scheduler, priority/dependency/capability/resource
 * evaluators, queues, fair-selection, and related helpers.
 */

export { createScheduler } from './scheduler.js';
export type { Scheduler, SchedulerOptions, SchedulerMetrics, SelectionDecision } from './scheduler.js';

export { comparePriority, isPriority, normalizePriority } from './priority-evaluator.js';
export type { Priority } from './priority-evaluator.js';

export {
  evaluateDependencies,
  createDependencyResolver,
  detectCycle,
  findReadyTasks,
} from './dependency-evaluator.js';
export type {
  DependencyResult,
  DependencyContext,
  DependencyResolver,
  WorkflowLike,
} from './dependency-evaluator.js';

export {
  evaluateCapability,
  evaluateCapabilities,
  isValidCapabilityReference,
  createCapabilityCache,
} from './capability-evaluator.js';
export type {
  CapabilityCheckResult,
  CapabilityResolver,
  CapabilityCache,
} from './capability-evaluator.js';

export {
  evaluateResources,
  DEFAULT_RESOURCES,
  mergeResources,
  subtractResources,
  createResourceTracker,
} from './resource-evaluator.js';
export type {
  ResourceSnapshot,
  ResourceRequirements,
  ResourceCheckResult,
  ResourceTracker,
} from './resource-evaluator.js';

export { createReadyQueue } from './ready-queue.js';
export type { ReadyQueue, QueueEntry } from './ready-queue.js';

export { createRetryQueue } from './retry-queue.js';
export type { RetryQueue, RetryEntry } from './retry-queue.js';

export { createFairSelector } from './fair-selection.js';
export type {
  FairSelector,
  FairSelectorOptions,
  FairSnapshot,
} from './fair-selection.js';
