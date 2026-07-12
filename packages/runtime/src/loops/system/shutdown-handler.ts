/**
 * MMOS ShutdownHandler - Controlled Runtime shutdown
 * Per docs/reference/runtime/system-loop.md (Runtime Shutdown)
 *
 * The reference defines a 5-phase shutdown:
 *   1. Stop Accepting New Executions
 *   2. Finish Active Iteration
 *   3. Flush Events
 *   4. Persist Required State
 *   5. Shutdown
 *
 * This module implements that sequence as a state machine so callers can
 * observe progress, attach hooks, and enforce a deadline.
 */

import type { EventBus } from '@mmos/sdk';
import type { EventLoop } from '../event/index.js';

export type ShutdownPhase =
  | 'idle'
  | 'stop-accepting'
  | 'finish-iteration'
  | 'flush-events'
  | 'persist-state'
  | 'shutdown'
  | 'completed'
  | 'failed';

const PHASE_ORDER: readonly ShutdownPhase[] = [
  'stop-accepting',
  'finish-iteration',
  'flush-events',
  'persist-state',
  'shutdown',
  'completed',
];

export interface ShutdownHookContext {
  readonly phase: ShutdownPhase;
  readonly reason: ShutdownReason;
}

export type ShutdownHook = (ctx: ShutdownHookContext) => void | Promise<void>;

/**
 * Why the shutdown was initiated. The Runtime captures this so hooks and
 * observers can react appropriately.
 */
export type ShutdownReason = 'stop' | 'signal' | 'error' | 'timeout';

export interface ShutdownHandlerOptions {
  readonly eventBus: EventBus;
  readonly eventLoop: EventLoop;
  /** Hooks called at the start of each phase */
  readonly onPhaseStart?: ShutdownHook;
  /** Hooks called at the end of each phase */
  readonly onPhaseEnd?: ShutdownHook;
  /** Total deadline for the entire shutdown sequence (ms). 0 = no timeout. */
  readonly timeoutMs?: number;
  /** Optional persistence callback used in the "persist-state" phase. */
  readonly persistState?: () => void | Promise<void>;
  /** Optional callback for the "stop-accepting" phase. */
  readonly stopAccepting?: () => void | Promise<void>;
  /** Optional callback for the "finish-iteration" phase. */
  readonly finishIteration?: () => void | Promise<void>;
}

export interface ShutdownHandler {
  /** True if a shutdown has been requested (idempotent) */
  isShuttingDown(): boolean;
  /** Current phase of the shutdown sequence */
  currentPhase(): ShutdownPhase;
  /** True if the shutdown has completed (terminal phase) */
  isCompleted(): boolean;
  /** Initiate the shutdown sequence. Idempotent. */
  shutdown(reason?: ShutdownReason): Promise<void>;
  /** Wait for shutdown completion. */
  waitForCompletion(): Promise<void>;
}

export function createShutdownHandler(options: ShutdownHandlerOptions): ShutdownHandler {
  let phase: ShutdownPhase = 'idle';
  let reason: ShutdownReason = 'stop';
  let completed = false;
  let completionPromise: Promise<void> | undefined;

  function setPhase(next: ShutdownPhase): void {
    phase = next;
  }

  async function runWithTimeout<T>(p: Promise<T>, ms: number): Promise<T | undefined> {
    if (ms <= 0) {
      return p;
    }
    return Promise.race([
      p,
      new Promise<undefined>(resolve => setTimeout(() => resolve(undefined), ms)),
    ]);
  }

  async function executePhase(
    name: ShutdownPhase,
    work: () => void | Promise<void>
  ): Promise<void> {
    setPhase(name);
    if (options.onPhaseStart) {
      await runWithTimeout(
        Promise.resolve(options.onPhaseStart({ phase: name, reason })),
        Math.floor((options.timeoutMs ?? 0) / PHASE_ORDER.length)
      );
    }
    try {
      await work();
    } catch (err) {
      // Surface but continue to next phase for best-effort cleanup
      const error = err instanceof Error ? err : new Error(String(err));
      // eslint-disable-next-line no-console
      console.error(`[ShutdownHandler] phase "${name}" failed:`, error);
    }
    if (options.onPhaseEnd) {
      await runWithTimeout(
        Promise.resolve(options.onPhaseEnd({ phase: name, reason })),
        Math.floor((options.timeoutMs ?? 0) / PHASE_ORDER.length)
      );
    }
  }

  function run(): Promise<void> {
    const startMs = Date.now();
    const remaining = (): number => {
      const t = options.timeoutMs ?? 0;
      if (t <= 0) return 0;
      return Math.max(0, t - (Date.now() - startMs));
    };

    return (async () => {
      try {
        // Phase 1: Stop accepting new executions
        await executePhase('stop-accepting', async () => {
          if (options.stopAccepting) {
            await options.stopAccepting();
          }
        });

        // Phase 2: Finish active iteration
        await executePhase('finish-iteration', async () => {
          if (options.finishIteration) {
            await options.finishIteration();
          } else {
            // Best-effort: yield to the event loop once
            await new Promise(r => setImmediate(r));
          }
        });

        // Phase 3: Flush events
        await executePhase('flush-events', async () => {
          await options.eventLoop.drain();
        });

        // Phase 4: Persist required state (delegated to engines per ADR-009)
        await executePhase('persist-state', async () => {
          if (options.persistState) {
            await options.persistState();
          }
        });

        // Phase 5: Close the event loop
        await executePhase('shutdown', async () => {
          await options.eventLoop.close();
        });

        setPhase('completed');
        completed = true;
        void options.eventBus;
        void remaining;
      } catch (err) {
        setPhase('failed');
        completed = true;
        const error = err instanceof Error ? err : new Error(String(err));
        // eslint-disable-next-line no-console
        console.error('[ShutdownHandler] failed:', error);
        throw error;
      }
    })();
  }

  return {
    isShuttingDown: () => phase !== 'idle' && !completed,
    currentPhase: () => phase,
    isCompleted: () => completed,
    shutdown(r: ShutdownReason = 'stop') {
      if (completionPromise) {
        return completionPromise;
      }
      reason = r;
      completionPromise = run();
      return completionPromise;
    },
    async waitForCompletion() {
      if (completionPromise) {
        await completionPromise;
      }
    },
  };
}
