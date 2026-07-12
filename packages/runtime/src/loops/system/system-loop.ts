/**
 * MMOS SystemLoop - The heartbeat of MMOS Runtime
 * Per docs/reference/runtime/system-loop.md
 * Per ADR-009: Runtime is Stateless - permanent state lives outside the Runtime
 * Per ADR-014: Event-Driven Architecture
 *
 * The SystemLoop is the main "tick" of MMOS. While the Runtime is running, the
 * SystemLoop keeps iterating Observe → Decide → Dispatch → Collect → Update
 * until shutdown. It coordinates the SchedulerLoop, ExecutionLoop, and
 * EventLoop but never executes Capability or Engine work itself.
 *
 * Two operating modes are supported:
 *   - timer-driven: `while (isRunning) { tick(); sleep(tickIntervalMs); }`
 *   - event-driven: caller invokes `tick()` on demand (tickIntervalMs = 0)
 */

import type { Uoid } from '@mmos/sdk';
import type { Execution } from '@mmos/sdk';
import type { EventBus } from '@mmos/sdk';
import type { IterationContext } from './iteration-step.js';
import { createIterationContext, runIterationStep } from './iteration-step.js';
import {
  createEmptyMetrics,
  evaluateSystemState,
  snapshotHealth,
  type SystemHealth,
  type SystemMetrics,
  type SystemState,
  SystemStateMachine,
} from './system-state.js';
import { createShutdownHandler, type ShutdownHandler } from './shutdown-handler.js';
import { createParallelExecutionCoordinator, type ParallelExecutionCoordinator } from './parallel-execution-coordinator.js';

/**
 * SystemLoopOptions - configuration for the Runtime heartbeat
 */
export interface SystemLoopOptions {
  readonly eventBus: EventBus;
  readonly scheduler: import('../scheduler/index.js').Scheduler;
  readonly executionLoop: import('../execution/index.js').ExecutionLoop;
  readonly eventLoop: import('../event/index.js').EventLoop;
  /** Tick interval in milliseconds (0 = purely event-driven) */
  readonly tickIntervalMs?: number;
  /** Max iterations per tick (0 = unlimited). Used for back-pressure. */
  readonly maxIterationsPerTick?: number;
  /** Optional override for the parallel coordinator (otherwise constructed internally) */
  readonly parallelCoordinator?: ParallelExecutionCoordinator;
  /** Optional override for the shutdown handler */
  readonly shutdownHandler?: ShutdownHandler;
  /** Called whenever the SystemState changes */
  readonly onStateChange?: ((state: SystemState) => void) | undefined;
}

/**
 * SystemLoop - the Runtime heartbeat.
 *
 * Per the reference document, the main loop is:
 *   while (runtime.isRunning) { processExecutions(); }
 *
 * This class implements that loop with state-machine enforcement, metrics,
 * a phased shutdown sequence, and either timer- or event-driven ticking.
 */
export class SystemLoop {
  private readonly eventBus: EventBus;
  private readonly scheduler: import('../scheduler/index.js').Scheduler;
  private readonly executionLoop: import('../execution/index.js').ExecutionLoop;
  private readonly eventLoop: import('../event/index.js').EventLoop;
  private readonly tickIntervalMs: number;
  private readonly maxIterationsPerTick: number;
  private readonly onStateChange: ((state: SystemState) => void) | undefined;
  private readonly shutdownHandler: ShutdownHandler;
  private readonly parallelCoordinator: ParallelExecutionCoordinator;
  private readonly stateMachine = new SystemStateMachine();
  private readonly metrics: SystemMetrics = createEmptyMetrics();
  private startedAt: Date | undefined;
  private lastError: Error | undefined;
  private startPromise: Promise<void> | undefined;

  constructor(options: SystemLoopOptions) {
    this.eventBus = options.eventBus;
    this.scheduler = options.scheduler;
    this.executionLoop = options.executionLoop;
    this.eventLoop = options.eventLoop;
    this.tickIntervalMs = Math.max(0, options.tickIntervalMs ?? 0);
    this.maxIterationsPerTick = Math.max(0, options.maxIterationsPerTick ?? 0);
    this.onStateChange = options.onStateChange;
    this.parallelCoordinator =
      options.parallelCoordinator ??
      createParallelExecutionCoordinator({ executionLoop: this.executionLoop });
    this.shutdownHandler =
      options.shutdownHandler ??
      createShutdownHandler({
        eventBus: this.eventBus,
        eventLoop: this.eventLoop,
        stopAccepting: () => {
          this.stateMachine.transition('draining');
          this.notifyStateChange();
        },
        finishIteration: async () => {
          // Yield once so any in-flight tick can finish
          await new Promise(r => setImmediate(r));
        },
      });
  }

  // --- Public API --------------------------------------------------------

  get isRunning(): boolean {
    return this.stateMachine.isRunning;
  }

  get currentState(): SystemState {
    return this.stateMachine.state;
  }

  get metricsSnapshot(): Readonly<SystemMetrics> {
    return { ...this.metrics };
  }

  /** Health snapshot for operators and monitoring */
  health(): SystemHealth {
    return snapshotHealth(
      this.stateMachine.state,
      this.metrics,
      this.startedAt,
      this.lastError
    );
  }

  /**
   * Start the heartbeat. Returns a promise that resolves when the loop exits
   * (via stop() or shutdown). Calling start() while already running is a
   * no-op and returns the existing promise.
   */
  start(): Promise<void> {
    if (this.startPromise) {
      return this.startPromise;
    }
    // Reset per-run state
    this.resetMetrics();
    this.startedAt = new Date();
    this.lastError = undefined;
    this.stateMachine.transition('starting');
    this.notifyStateChange();

    this.startPromise = (async () => {
      try {
        // The main loop: while (runtime.isRunning) { processExecutions(); }
        while (this.stateMachine.isRunning) {
          const ctx = await this.tick();
          this.lastError = ctx.lastError ?? this.lastError;
          // Decide next state based on whether we did work
          const hasPending = ctx.executionsProcessed.length > 0 || ctx.tasksProcessed.length > 0;
          const next = evaluateSystemState(this.stateMachine.isRunning, hasPending);
          if (this.stateMachine.state !== 'draining' && this.stateMachine.state !== next) {
            this.stateMachine.transition(next);
            this.notifyStateChange();
          }
          if (this.tickIntervalMs > 0) {
            await this.delay(this.tickIntervalMs);
          } else {
            // Event-driven: yield to the event loop
            await this.yieldToEventLoop();
          }
        }
        // Loop exited because isRunning became false; finalize
        if (this.stateMachine.state !== 'draining') {
          this.stateMachine.transition('draining');
          this.notifyStateChange();
        }
      } finally {
        await this.shutdownHandler.shutdown('stop');
        this.stateMachine.transition('stopped');
        this.notifyStateChange();
        this.startPromise = undefined;
      }
    })();

    return this.startPromise;
  }

  /**
   * Request graceful stop. The current iteration (if any) will complete
   * before the loop exits.
   */
  stop(reason: 'user' | 'signal' | 'error' = 'user'): void {
    this.stateMachine.transition('draining');
    this.notifyStateChange();
    // Note: we don't await shutdown here; the start() loop will run it.
    if (reason === 'error') {
      this.lastError = this.lastError ?? new Error('stop() called with reason=error');
    }
  }

  /**
   * Run a single heartbeat iteration. Public so callers can use the
   * SystemLoop in event-driven mode.
   */
  async tick(): Promise<IterationContext> {
    const ctx = createIterationContext();
    const tickStart = Date.now();
    this.metrics.iterations += 1;

    // Event-driven mode: one iteration per call. Timer mode: many per call.
    let continueLoop = true;
    let localIterations = 0;
    while (continueLoop) {
      localIterations += 1;
      ctx.iterations = localIterations;
      continueLoop = await runIterationStep({
        context: ctx,
        eventBus: this.eventBus,
        eventLoop: this.eventLoop,
        scheduler: this.scheduler,
        executionLoop: this.executionLoop,
        parallelCoordinator: this.parallelCoordinator,
        metrics: this.metrics,
      });
      if (
        this.maxIterationsPerTick > 0 &&
        localIterations >= this.maxIterationsPerTick
      ) {
        break;
      }
      if (this.tickIntervalMs === 0) {
        break;
      }
    }

    ctx.completedAt = new Date();
    this.metrics.lastTickAt = ctx.completedAt;
    this.metrics.totalTickMs += Date.now() - tickStart;
    return ctx;
  }

  /**
   * Submit a new Execution for processing. The Scheduler will pick it up on
   * the next iteration.
   */
  async submit(execution: Execution): Promise<Uoid> {
    await this.scheduler.enqueue(execution);
    return execution.uoid;
  }

  // --- Private helpers ---------------------------------------------------

  private resetMetrics(): void {
    Object.assign(this.metrics, createEmptyMetrics());
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      try {
        this.onStateChange(this.stateMachine.state);
      } catch {
        // Hooks are best-effort
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private yieldToEventLoop(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve));
  }
}

/**
 * Create a SystemLoop with default dependencies wired in.
 */
export function createSystemLoop(options: SystemLoopOptions): SystemLoop {
  return new SystemLoop(options);
}
