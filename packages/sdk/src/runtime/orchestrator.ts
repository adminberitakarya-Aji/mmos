/**
 * MMOS Orchestrator - Coordinates Workflow Execution
 * Per ADR-001: Composition is the Heart
 * Per ADR-007: Workflow is Declarative
 * Per ADR-008: Execution is Runtime Unit
 * Per ADR-014: Event-Driven Architecture
 *
 * This is the SDK-level Orchestrator interface and base class.
 * The full Reference Runtime (with concrete engines) lives in @mmos/runtime.
 */

import { Uoid } from '../domain/identity.js';
import { Execution, completeExecution, failExecution } from '../domain/execution.js';
import { Workflow, getNextTasks } from '../domain/workflow.js';
import { Task } from '../domain/task.js';
import { Agent } from '../domain/agent.js';
import { Capability } from '../domain/capability.js';
import { Event } from '../domain/event.js';
import { EventBus, InMemoryEventBus, emitTaskEvent } from './event-bus.js';
import {
  RuntimeExecutionContext,
  RuntimeContextBuilder,
  setTaskOutput,
} from './execution-context.js';
import { ExecutionResult, ExecutionOutcome, createExecutionResult } from './execution-result.js';

export interface OrchestratorOptions {
  readonly eventBus?: EventBus;
  readonly maxConcurrentTasks?: number;
  readonly defaultTaskTimeout?: number;
}

export interface Orchestrator {
  execute(execution: Execution, workflow: Workflow, tasks: readonly Task[]): Promise<ExecutionResult>;
  cancel(execution: Execution): Promise<void>;
}

/**
 * EngineBindings - In-memory registry of domain objects needed to resolve
 * a task at execution time. Production implementations come from @mmos/runtime.
 */
export interface EngineBindings {
  resolveAgent(agentUoid: Uoid): Agent | undefined;
  resolveCapability(capabilityUoid: Uoid): Capability | undefined;
  resolveTask(taskUoid: Uoid): Task | undefined;
}

/**
 * BaseOrchestrator - Provides event-driven step execution.
 * Subclasses implement the concrete task-invocation strategy (sync, parallel,
 * human-in-the-loop, etc.) by overriding invokeTask().
 */
export abstract class BaseOrchestrator implements Orchestrator {
  protected readonly eventBus: EventBus;
  protected readonly maxConcurrentTasks: number;
  protected readonly defaultTaskTimeout: number;
  private _cancelledExecutions: Set<string> = new Set();

  constructor(options: OrchestratorOptions = {}) {
    this.eventBus = options.eventBus ?? new InMemoryEventBus();
    this.maxConcurrentTasks = options.maxConcurrentTasks ?? 1;
    this.defaultTaskTimeout = options.defaultTaskTimeout ?? 30000;
  }

  async cancel(execution: Execution): Promise<void> {
    this._cancelledExecutions.add(execution.uoid.toString());
    await emitTaskEvent(this.eventBus, {
      source: execution.uoid,
      type: 'execution.cancelled',
      payload: { execution: execution.uoid.toString() },
    });
  }

  async execute(
    execution: Execution,
    workflow: Workflow,
    tasks: readonly Task[]
  ): Promise<ExecutionResult> {
    const startedAt = new Date();
    const contextBuilder = new RuntimeContextBuilder();
    const initialVariables: Record<string, unknown> = {
      ...execution.context.variables,
    };
    contextBuilder.withVariables(initialVariables);
    const context = contextBuilder.build(execution, workflow);

    const taskMap = new Map<Uoid, Task>(tasks.map(t => [t.uoid, t]));
    const bindings: EngineBindings = {
      resolveAgent: () => undefined,
      resolveCapability: () => undefined,
      resolveTask: uoid => taskMap.get(uoid),
    };

    // Emit execution.started
    await emitTaskEvent(this.eventBus, {
      source: execution.uoid,
      type: 'execution.started',
      payload: { workflow: workflow.uoid.toString() },
    });

    let outcome: ExecutionOutcome = 'completed';
    let error: Error | undefined;

    try {
      let currentTask: Uoid | undefined = workflow.spec.entryTask;

      if (!currentTask) {
        throw new Error(`Workflow ${workflow.uoid} has no entry task`);
      }

      while (currentTask) {
        if (this._cancelledExecutions.has(execution.uoid.toString())) {
          outcome = 'cancelled';
          break;
        }

        const task = taskMap.get(currentTask);
        if (!task) {
          throw new Error(`Task ${currentTask} not found in bindings`);
        }

        await emitTaskEvent(this.eventBus, {
          source: execution.uoid,
          type: 'task.started',
          payload: { task: currentTask.toString(), name: task.name },
        });

        try {
          const output = await this.invokeTask(task, context, bindings);

          // Check cancellation after task completes — cancel() may have been
          // called during the task invocation (e.g., human-in-the-loop abort).
          if (this._cancelledExecutions.has(execution.uoid.toString())) {
            outcome = 'cancelled';
            break;
          }

          setTaskOutput(context, task, output);
          context.completedTasks.add(task.uoid);
          await emitTaskEvent(this.eventBus, {
            source: execution.uoid,
            type: 'task.completed',
            payload: { task: currentTask.toString(), output },
          });
        } catch (err) {
          const errObj = err instanceof Error ? err : new Error(String(err));
          context.failedTasks.add(task.uoid);
          await emitTaskEvent(this.eventBus, {
            source: execution.uoid,
            type: 'task.failed',
            payload: { task: currentTask.toString(), error: errObj.message },
          });
          throw errObj;
        }

        const nextTasks = getNextTasks(workflow, currentTask);
        currentTask = nextTasks[0]; // Linear progression; parallel handled by subclass
      }
    } catch (err) {
      outcome = 'failed';
      error = err instanceof Error ? err : new Error(String(err));
      await emitTaskEvent(this.eventBus, {
        source: execution.uoid,
        type: 'execution.failed',
        payload: { error: error.message },
      });
    }

    const completedAt = new Date();

    if (outcome === 'completed') {
      await emitTaskEvent(this.eventBus, {
        source: execution.uoid,
        type: 'execution.completed',
        payload: { durationMs: completedAt.getTime() - startedAt.getTime() },
      });
    }

    this._cancelledExecutions.delete(execution.uoid.toString());

    // Sync domain execution status
    if (outcome === 'completed') {
      completeExecution(execution, 'completed');
    } else if (outcome === 'failed' && error) {
      failExecution(execution, error.message, error);
    } else if (outcome === 'cancelled') {
      // No dedicated cancel function; domain Execution remains as-is.
    }

    // Map task outputs by task name for ergonomic consumption
    const outputsByName: Record<string, unknown> = {};
    for (const [uoid, output] of context.taskOutputs) {
      const task = taskMap.get(uoid);
      outputsByName[task?.name ?? uoid.toString()] = output;
    }

    return createExecutionResult({
      execution: execution.uoid,
      outcome,
      outputs: outputsByName,
      artifacts: Array.from(context.artifacts.values()),
      events: context.events as readonly Event[],
      startedAt,
      completedAt,
      error,
    });
  }

  /**
   * Subclasses override this to invoke a task with concrete engines.
   * The base implementation throws so misconfigured subclasses fail fast.
   */
  protected async invokeTask(
    task: Task,
    context: RuntimeExecutionContext,
    bindings: EngineBindings
  ): Promise<unknown> {
    void task;
    void context;
    void bindings;
    throw new Error('BaseOrchestrator.invokeTask must be overridden by subclass');
  }
}
