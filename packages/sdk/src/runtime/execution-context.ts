/**
 * MMOS Runtime Execution Context - Mutable State Carried During Execution
 * Per ADR-008: Execution is Runtime Unit
 * Per ADR-014: Event-Driven Architecture
 */

import { Uoid } from '../domain/identity.js';
import { Execution } from '../domain/execution.js';
import { Workflow } from '../domain/workflow.js';
import { Task } from '../domain/task.js';
import { Event } from '../domain/event.js';
import { Artifact } from '../domain/artifact.js';

export interface RuntimeExecutionContext {
  readonly execution: Execution;
  readonly workflow: Workflow;
  readonly variables: Record<string, unknown>;
  readonly taskOutputs: Map<Uoid, unknown>;
  readonly artifacts: Map<string, Artifact>;
  readonly events: Event[];
  readonly completedTasks: Set<Uoid>;
  readonly failedTasks: Set<Uoid>;
  readonly cancelled: boolean;
}

export class RuntimeContextBuilder {
  private _variables: Record<string, unknown> = {};
  private _taskOutputs: Map<Uoid, unknown> = new Map();
  private _artifacts: Map<string, Artifact> = new Map();
  private _events: Event[] = [];
  private _completed: Set<Uoid> = new Set();
  private _failed: Set<Uoid> = new Set();
  private _cancelled = false;

  withVariables(variables: Record<string, unknown>): this {
    this._variables = { ...this._variables, ...variables };
    return this;
  }

  withTaskOutput(task: Uoid, output: unknown): this {
    this._taskOutputs.set(task, output);
    return this;
  }

  withArtifact(artifact: Artifact): this {
    this._artifacts.set(artifact.spec.metadata?.['key'] as string ?? artifact.uoid.toString(), artifact);
    return this;
  }

  recordEvent(event: Event): this {
    this._events.push(event);
    return this;
  }

  markCompleted(task: Uoid): this {
    this._completed.add(task);
    return this;
  }

  markFailed(task: Uoid): this {
    this._failed.add(task);
    return this;
  }

  markCancelled(): this {
    this._cancelled = true;
    return this;
  }

  build(execution: Execution, workflow: Workflow): RuntimeExecutionContext {
    return {
      execution,
      workflow,
      variables: this._variables,
      taskOutputs: this._taskOutputs,
      artifacts: this._artifacts,
      events: this._events,
      completedTasks: this._completed,
      failedTasks: this._failed,
      cancelled: this._cancelled,
    };
  }
}

export function createRuntimeContext(
  execution: Execution,
  workflow: Workflow,
  initialVariables: Record<string, unknown> = {}
): RuntimeExecutionContext {
  return new RuntimeContextBuilder().withVariables(initialVariables).build(execution, workflow);
}

export function setTaskOutput(
  ctx: RuntimeExecutionContext,
  task: Task | Uoid,
  output: unknown
): void {
  const uoid = 'uoid' in task ? task.uoid : task;
  ctx.taskOutputs.set(uoid, output);
}

export function getTaskOutput(ctx: RuntimeExecutionContext, task: Task | Uoid): unknown {
  const uoid = 'uoid' in task ? task.uoid : task;
  return ctx.taskOutputs.get(uoid);
}
