/**
 * MMOS ReadyQueue - Dynamic queue of ready tasks
 * Per docs/reference/runtime/scheduler-loop.md (Ready Queue)
 *
 * The Ready Queue holds all tasks whose dependencies are satisfied, that
 * have a registered Capability, and that have an Execution willing to
 * host them. Entries are ordered by (priority, enqueueTime).
 *
 * Operations:
 *   - enqueue(task, execution, priority)  O(log n) due to sort
 *   - dequeue()                           O(n) (shift); use peek for inspection
 *   - peek()                              O(n) copy
 *   - find(predicate)                     O(n) lookup
 *   - remove(predicate)                   O(n)
 *   - moveToFront(predicate)              promotes to highest priority
 *   - size()                              O(1)
 *   - clear()                             O(1)
 *   - iterator()                          live read-only iteration
 */

import type { Task, Execution } from '@mmos/sdk';
import { comparePriority, type Priority } from './priority-evaluator.js';

export interface QueueEntry {
  readonly task: Task;
  readonly execution: Execution;
  readonly priority: Priority;
  readonly enqueuedAt: Date;
  /** Monotonic id used to break ties deterministically */
  readonly seq: number;
}

export interface ReadyQueue {
  enqueue(task: Task, execution: Execution, priority: Priority): void;
  dequeue(): QueueEntry | undefined;
  peek(): readonly QueueEntry[];
  find(predicate: (entry: QueueEntry) => boolean): QueueEntry | undefined;
  remove(predicate: (entry: QueueEntry) => boolean): number;
  /** Promote every entry matching predicate to the front (highest priority). */
  moveToFront(predicate: (entry: QueueEntry) => boolean): number;
  size(): number;
  clear(): void;
  /** Iterate a snapshot */
  iterator(): IterableIterator<QueueEntry>;
}

export function createReadyQueue(): ReadyQueue {
  const entries: QueueEntry[] = [];
  let seq = 0;

  function sort(): void {
    entries.sort((a, b) => {
      const p = comparePriority(a.priority, b.priority);
      if (p !== 0) return p;
      return a.seq - b.seq;
    });
  }

  return {
    enqueue(task, execution, priority) {
      // Dedupe: same (task, execution) pair is collapsed
      const key = `${execution.uoid.toString()}::${task.uoid.toString()}`;
      if (entries.some(e => `${e.execution.uoid.toString()}::${e.task.uoid.toString()}` === key)) {
        return;
      }
      entries.push({ task, execution, priority, enqueuedAt: new Date(), seq: ++seq });
      sort();
    },
    dequeue() {
      return entries.shift();
    },
    peek() {
      return [...entries];
    },
    find(predicate) {
      return entries.find(predicate);
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
    moveToFront(predicate) {
      const matched: QueueEntry[] = [];
      for (let i = entries.length - 1; i >= 0; i--) {
        if (predicate(entries[i]!)) {
          matched.push(entries[i]!);
          entries.splice(i, 1);
        }
      }
      // Re-insert at the front in the order they were found
      matched.reverse();
      entries.unshift(...matched);
      return matched.length;
    },
    size() {
      return entries.length;
    },
    clear() {
      entries.length = 0;
    },
    iterator() {
      return entries[Symbol.iterator]();
    },
  };
}
