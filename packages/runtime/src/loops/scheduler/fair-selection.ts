/**
 * MMOS FairSelection - Anti-starvation for multi-execution
 * Per docs/reference/runtime/scheduler-loop.md (Fair Scheduling)
 *
 * Two policies combined:
 *   - Round-robin: candidates are ordered by lastServedAt (oldest first)
 *   - Anti-starvation: candidates that have been waiting longer than
 *     `maxWaitMs` are promoted to the head of the queue
 *
 * The FairSelector is purely advisory: it does not modify any other
 * data structure. The caller decides what to do with the returned
 * executionUoid.
 */

import type { Uoid } from '@mmos/sdk';

export interface FairSelectorOptions {
  /** Max time an execution may wait before being force-promoted. */
  readonly maxWaitMs?: number;
  /** Initial lastServedAt (defaults to enqueue time) */
  readonly now?: () => Date;
}

interface FairEntry {
  readonly executionUoid: Uoid;
  lastServedAt: Date;
  firstSeenAt: Date;
  seq: number;
}

export interface FairSnapshot {
  readonly executionUoid: Uoid;
  readonly lastServedAt: Date;
  readonly firstSeenAt: Date;
  readonly waitMs: number;
  readonly isStarving: boolean;
}

export interface FairSelector {
  /** Record that this execution exists; reset its wait clock. */
  touch(executionUoid: Uoid): void;
  /** Remove an execution from tracking. */
  forget(executionUoid: Uoid): void;
  /** Pick the next execution to serve. */
  pickNext(candidates: readonly Uoid[]): Uoid | undefined;
  /** Reset all tracking state. */
  reset(): void;
  /** Snapshot of all tracked executions. */
  snapshot(): readonly FairSnapshot[];
}

export function createFairSelector(options: FairSelectorOptions = {}): FairSelector {
  const maxWaitMs = options.maxWaitMs ?? 30_000;
  const now = options.now ?? (() => new Date());
  const entries = new Map<string, FairEntry>();
  let globalSeq = 0;

  function getOrCreate(uoid: Uoid): FairEntry {
    const key = uoid.toString();
    let e = entries.get(key);
    if (!e) {
      e = { executionUoid: uoid, lastServedAt: now(), firstSeenAt: now(), seq: globalSeq++ };
      entries.set(key, e);
    }
    return e;
  }

  return {
    touch(uoid) {
      getOrCreate(uoid);
    },
    forget(uoid) {
      entries.delete(uoid.toString());
    },
    pickNext(candidates) {
      if (candidates.length === 0) return undefined;
      const t = now().getTime();
      // 1. Starvation guard
      const starved = candidates.find(c => {
        const e = entries.get(c.toString());
        return e !== undefined && t - e.lastServedAt.getTime() > maxWaitMs;
      });
      if (starved) {
        const e = entries.get(starved.toString());
        if (e) e.lastServedAt = now();
        return starved;
      }
      // 2. Touch unknown candidates so they have a fair chance
      for (const c of candidates) getOrCreate(c);
      // 3. Round-robin: pick the one served least recently
      // Use seq as tie-breaker when timestamps are equal
      const sorted = [...candidates].sort((a, b) => {
        const ea = entries.get(a.toString());
        const eb = entries.get(b.toString());
        const ta = ea ? ea.lastServedAt.getTime() : 0;
        const tb = eb ? eb.lastServedAt.getTime() : 0;
        if (ta !== tb) return ta - tb;
        // Tie-breaker: lower seq (created first) wins
        return (ea?.seq ?? 0) - (eb?.seq ?? 0);
      });
      const winner = sorted[0]!;
      const e = entries.get(winner.toString());
      if (e) e.lastServedAt = now();
      return winner;
    },
    reset() {
      entries.clear();
      globalSeq = 0;
    },
    snapshot() {
      const t = now().getTime();
      return [...entries.values()].map(e => ({
        executionUoid: e.executionUoid,
        lastServedAt: e.lastServedAt,
        firstSeenAt: e.firstSeenAt,
        waitMs: t - e.lastServedAt.getTime(),
        isStarving: t - e.lastServedAt.getTime() > maxWaitMs,
      }));
    },
  };
}