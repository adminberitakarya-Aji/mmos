/**
 * MMOS PriorityEvaluator - Scheduler priority levels
 * Per docs/reference/runtime/scheduler-loop.md (Priority Evaluation)
 *
 *   Critical > High > Normal > Low
 *
 * Priority only affects selection order, not Workflow logic.
 */

export type Priority = 'critical' | 'high' | 'normal' | 'low';

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function comparePriority(a: Priority, b: Priority): number {
  return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}

export function isPriority(value: unknown): value is Priority {
  return value === 'critical' || value === 'high' || value === 'normal' || value === 'low';
}

export function normalizePriority(value: unknown, fallback: Priority = 'normal'): Priority {
  return isPriority(value) ? value : fallback;
}
