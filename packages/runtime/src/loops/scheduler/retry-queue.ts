/**
 * MMOS RetryQueue - Holds tasks scheduled for retry
 * Per docs/reference/runtime/scheduler-loop.md (Retry Scheduling)
 *
 * The Retry Queue holds tasks that should not be picked up until a given
 * wall-clock instant. Entries are keyed by (executionUoid, taskUoid) to
 * prevent duplicates. When the deadline elapses, the entry is returned
 * via `popReady` and re-enqueued into the Ready Queue.
 */

import type { Task, Execution } from '@mmos/sdk';

export interface RetryEntry {
  readonly task: Task;
  readonly execution: Execution;
  readonly attempt: number;
  readonly nextAttemptAt: Date;
  readonly reason: string;
}

export interface RetryQueue {
  schedule(task: Task, execution: Execution, attempt: number, delayMs: number, reason: string): void;
  /** Return entries whose deadline is `<= now` and remove them. */
  popReady(now: Date): RetryEntry[];
  /** View all entries without removing. */
  peek(): readonly RetryEntry[];
  /** Remove entries matching the predicate. Returns the count removed. */
  remove(predicate: (entry: RetryEntry) => boolean): number;
  size(): number;
  clear(): void;
}

export function createRetryQueue(): RetryQueue {
  const entries: RetryEntry[] = [];

  function keyOf(task: Task, execution: Execution): string {
    return `${execution.uoid.toString()}::${task.uoid.toString()}`;
  }

  return {
    schedule(task, execution, attempt, delayMs, reason) {
      // Dedupe: if already scheduled, replace the existing entry
      const key = keyOf(task, execution);
      for (let i = 0; i < entries.length; i++) {
        if (keyOf(entries[i]!.task, entries[i]!.execution) === key) {
          entries[i] = {
            task,
            execution,
            attempt,
            nextAttemptAt: new Date(Date.now() + delayMs),
            reason,
          };
          return;
        }
      }
      entries.push({
        task,
        execution,
        attempt,
        nextAttemptAt: new Date(Date.now() + delayMs),
        reason,
      });
    },
    popReady(now) {
      const ready: RetryEntry[] = [];
      for (let i = entries.length - 1; i >= 0; i--) {
        if (entries[i]!.nextAttemptAt <= now) {
          ready.push(entries[i]!);
          entries.splice(i, 1);
        }
      }
      // Restore insertion order
      ready.reverse();
      return ready;
    },
    peek() {
      return [...entries];
    },
    remove(predicate) {
      let removed = 0;
      for (let i = entries.length - 1; i >= 0; i--) {
        if (predicate(entries[i]!)) {
          entries.splice(i, 1);
          removed++;
        }
      }
      return removed;
    },
    size() {
      return entries.length;
    },
    clear() {
      entries.length = 0;
    },
  };
}
