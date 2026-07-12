/**
 * MMOS IterationStep - One pass through the SystemLoop tick
 * Per docs/reference/runtime/system-loop.md (Iteration Step)
 *
 * The reference describes a 10-step iteration. This module implements that
 * pipeline as discrete, named steps so each can be tested, timed, and
 * replaced. The pipeline is:
 *
 *   1. Read Events        2. Update Runtime State
 *   3. Select Execution   4. Evaluate Workflow
 *   5. Select Task        6. Dispatch Engine
 *   7. Collect Result     8. Update Memory
 *   9. Publish Event      10. Repeat
 *
 * The 10th step is a return-value convention: the pipeline returns a
 * `boolean` (continue iterating) and the outer driver decides whether
 * to call it again.
 */

import type { EventBus, Uoid, Execution, EventEnvelope, Task } from '@mmos/sdk';
import type { Scheduler } from '../scheduler/index.js';
import type { ExecutionLoop, DispatchResult, CollectedResult } from '../execution/index.js';
import type { EventLoop } from '../event/index.js';
import type { ParallelExecutionCoordinator } from './parallel-execution-coordinator.js';
import type { SystemMetrics } from './system-state.js';

/**
 * Per-step timing, populated by the pipeline. Useful for telemetry.
 */
export interface StepTimings {
  /** Step 1: drain events from the EventLoop */
  readEventsMs: number;
  /** Step 2: query scheduler for pending work */
  updateStateMs: number;
  /** Step 3: select next execution */
  selectExecutionMs: number;
  /** Step 4+5: select next task within the chosen execution */
  selectTaskMs: number;
  /** Step 6: dispatch through the ExecutionLoop */
  dispatchMs: number;
  /** Step 7: collect and validate the result */
  collectMs: number;
  /** Step 8: persist to memory */
  memoryMs: number;
  /** Step 9: publish event to the bus */
  publishMs: number;
}

/**
 * IterationContext - per-tick mutable state.
 */
export interface IterationContext {
  startedAt: Date;
  completedAt?: Date;
  iterations: number;
  executionsProcessed: Uoid[];
  tasksProcessed: Uoid[];
  lastError?: Error;
  lastPublishedEvent?: EventEnvelope;
  timings: StepTimings;
  /** Updated by the pipeline with the result of step 7 */
  lastCollected?: CollectedResult;
  /** Updated by the pipeline with the result of step 6 */
  lastDispatch?: DispatchResult;
}

/**
 * IterationStepParams - inputs to one tick step.
 */
export interface IterationStepParams {
  context: IterationContext;
  eventBus: EventBus;
  eventLoop: EventLoop;
  scheduler: Scheduler;
  executionLoop: ExecutionLoop;
  parallelCoordinator: ParallelExecutionCoordinator;
  /** Optional metrics sink. Updated as work flows through the pipeline. */
  metrics?: SystemMetrics;
}

/**
 * Step 1: read pending events through the EventLoop.
 */
async function step1ReadEvents(eventLoop: EventLoop): Promise<void> {
  await eventLoop.drain();
}

/**
 * Step 2: update Runtime State by asking the scheduler for the current
 * snapshot of ready work. Returns the list of ready executions.
 */
async function step2UpdateRuntimeState(
  scheduler: Scheduler
): Promise<readonly Execution[]> {
  return scheduler.peekReadyExecutions();
}

/**
 * Step 3: select the next Execution to work on. Uses the scheduler's
 * fair-selection policy internally.
 */
async function step3SelectExecution(
  scheduler: Scheduler
): Promise<Execution | undefined> {
  return scheduler.selectNextExecution();
}

/**
 * Steps 4 + 5: evaluate the workflow and select the next ready Task.
 */
async function steps4And5SelectTask(
  scheduler: Scheduler,
  execution: Execution
): Promise<Task | undefined> {
  return scheduler.selectNextTask(execution);
}

/**
 * Step 6: dispatch the task via the ExecutionLoop (never directly).
 */
async function step6Dispatch(
  executionLoop: ExecutionLoop,
  execution: Execution,
  task: Task
): Promise<DispatchResult> {
  return executionLoop.dispatch(execution, task);
}

/**
 * Step 7: collect and validate the result.
 */
async function step7Collect(
  executionLoop: ExecutionLoop,
  dispatch: DispatchResult
): Promise<CollectedResult> {
  return executionLoop.collectResult(dispatch);
}

/**
 * Step 8: persist the result to memory via the ExecutionLoop.
 */
async function step8UpdateMemory(
  executionLoop: ExecutionLoop,
  execution: Execution,
  collected: CollectedResult
): Promise<void> {
  await executionLoop.synchronizeMemory(execution, collected);
}

/**
 * Step 9: publish the event produced by the task to the event bus.
 */
async function step9Publish(
  eventBus: EventBus,
  envelope: EventEnvelope
): Promise<void> {
  await eventBus.publish(envelope as never);
}

/**
 * Run a single iteration of the 10-step pipeline. Returns true to keep
 * iterating (synchronous / timer mode) or false to let the outer driver
 * decide (event-driven mode). Errors are caught and recorded in the
 * IterationContext, never thrown.
 */
export async function runIterationStep(params: IterationStepParams): Promise<boolean> {
  const { context, eventBus, eventLoop, scheduler, executionLoop, metrics } = params;
  // parallelCoordinator is reserved for future use; the current pipeline
  // dispatches one execution at a time for ordering reasons.
  void params.parallelCoordinator;

  try {
    // 1. Read Events
    const t0 = Date.now();
    await step1ReadEvents(eventLoop);
    context.timings.readEventsMs += Date.now() - t0;

    // 2. Update Runtime State
    const t1 = Date.now();
    const readyExecutions = await step2UpdateRuntimeState(scheduler);
    context.timings.updateStateMs += Date.now() - t1;
    if (readyExecutions.length === 0) {
      if (metrics) metrics.idleIterations += 1;
      return false;
    }

    // 3. Select Execution
    const t2 = Date.now();
    const selected = await step3SelectExecution(scheduler);
    context.timings.selectExecutionMs += Date.now() - t2;
    if (!selected) {
      if (metrics) metrics.idleIterations += 1;
      return false;
    }
    context.executionsProcessed.push(selected.uoid);
    if (metrics) metrics.executionsDispatched += 1;

    // 4 & 5. Evaluate Workflow + Select Task
    const t3 = Date.now();
    const readyTask = await steps4And5SelectTask(scheduler, selected);
    context.timings.selectTaskMs += Date.now() - t3;
    if (!readyTask) {
      // Dependencies / capability / resources not ready yet
      return false;
    }
    context.tasksProcessed.push(readyTask.uoid);

    // 6. Dispatch Engine via the Orchestrator (ExecutionLoop)
    const t4 = Date.now();
    const dispatchResult = await step6Dispatch(executionLoop, selected, readyTask);
    context.timings.dispatchMs += Date.now() - t4;
    context.lastDispatch = dispatchResult;

    // 7. Collect Result
    const t5 = Date.now();
    const collected = await step7Collect(executionLoop, dispatchResult);
    context.timings.collectMs += Date.now() - t5;
    context.lastCollected = collected;

    if (collected.valid) {
      if (metrics) metrics.tasksSucceeded += 1;
    } else {
      if (metrics) metrics.tasksFailed += 1;
    }

    // 8. Update Memory (only on valid results)
    if (collected.valid) {
      const t6 = Date.now();
      await step8UpdateMemory(executionLoop, selected, collected);
      context.timings.memoryMs += Date.now() - t6;
    }

    // 9. Publish Event
    const t7 = Date.now();
    await step9Publish(eventBus, dispatchResult.event);
    context.timings.publishMs += Date.now() - t7;
    context.lastPublishedEvent = dispatchResult.event;
    if (metrics) metrics.eventsPublished += 1;

    if (metrics) metrics.activeIterations += 1;
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    context.lastError = error;
    if (metrics) metrics.errorsCaught += 1;
    return false;
  }
}

/**
 * Helper to construct an iteration context for a fresh tick.
 */
export function createIterationContext(): IterationContext {
  return {
    startedAt: new Date(),
    iterations: 0,
    executionsProcessed: [],
    tasksProcessed: [],
    timings: emptyTimings(),
  };
}

/**
 * Helper to construct an empty StepTimings.
 */
export function emptyTimings(): StepTimings {
  return {
    readEventsMs: 0,
    updateStateMs: 0,
    selectExecutionMs: 0,
    selectTaskMs: 0,
    dispatchMs: 0,
    collectMs: 0,
    memoryMs: 0,
    publishMs: 0,
  };
}

/**
 * Convenience: ensure execution is in the context list (idempotent).
 */
export function recordExecution(ctx: IterationContext, execution: Execution): void {
  if (!ctx.executionsProcessed.some(u => u.equals(execution.uoid))) {
    ctx.executionsProcessed.push(execution.uoid);
  }
}
