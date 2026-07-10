/**
 * MMOS Execution - Runtime Instance
 * Per ADR-008: Execution is Runtime Unit
 * Per IMS-400: Execution Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface ExecutionSpec {
  readonly composition: Uoid;         // Source composition
  readonly workflow: Uoid;            // Workflow being executed
  readonly input?: Record<string, unknown>; // Initial input
  readonly variables?: Record<string, unknown>; // Runtime variables
  readonly parentExecution?: Uoid;    // Parent execution (for sub-workflows)
  readonly config?: ExecutionConfig;
}

export interface ExecutionConfig {
  readonly maxConcurrentTasks?: number;
  readonly defaultTaskTimeout?: number;
  readonly enableCheckpointing?: boolean;
  readonly checkpointInterval?: number;
}

export interface ExecutionContext {
  readonly execution: Uoid;
  readonly workflow: Uoid;
  readonly variables: Record<string, unknown>;
  readonly taskOutputs: Record<string, unknown>;
  readonly artifacts: Record<string, Uoid>;
  readonly memory: Record<string, unknown>;
}

export interface Execution extends Metadata {
  readonly specification: Specification;
  readonly spec: ExecutionSpec;
  readonly status: Status;
  readonly relationships: Relationships;
  readonly context: ExecutionContext;
}

export function createExecution(params: {
  composition: Uoid;
  workflow: Uoid;
  name: string;
  version?: string;
  description?: string;
  input?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  parentExecution?: Uoid;
  config?: ExecutionConfig;
  createdBy?: string;
  ownedBy?: string;
}): Execution {
  const uoid = createUoid('exe');
  const spec: ExecutionSpec = {
    composition: params.composition,
    workflow: params.workflow,
    input: params.input,
    variables: params.variables,
    parentExecution: params.parentExecution,
    config: params.config,
  };

  const initialContext: ExecutionContext = {
    execution: uoid,
    workflow: params.workflow,
    variables: { ...params.variables, ...params.input },
    taskOutputs: {},
    artifacts: {},
    memory: {},
  };

  return {
    ...createMetadata({
      uoid,
      version: params.version ?? '1.0.0',
      name: params.name,
      description: params.description,
      createdBy: params.createdBy,
      ownedBy: params.ownedBy,
    }),
    specification: { type: 'execution', schema: 'execution.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.composition, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
    context: initialContext,
  };
}

export function startExecution(exec: Execution): Execution {
  return {
    ...exec,
    status: { phase: 'active', message: 'Execution started', progress: 0, startedAt: new Date(), completedAt: undefined, error: undefined },
  };
}

export function completeExecution(exec: Execution, message?: string): Execution {
  return {
    ...exec,
    status: { phase: 'completed', message, progress: 100, startedAt: exec.status.startedAt, completedAt: new Date(), error: undefined },
  };
}

export function failExecution(exec: Execution, message: string, error?: Error): Execution {
  return {
    ...exec,
    status: { phase: 'failed', message, progress: exec.status.progress, startedAt: exec.status.startedAt, completedAt: new Date(), error },
  };
}

export function updateExecutionContext(exec: Execution, updates: Partial<ExecutionContext>): Execution {
  return {
    ...exec,
    context: { ...exec.context, ...updates },
  };
}

export function setTaskOutput(exec: Execution, taskUoid: Uoid, output: unknown): Execution {
  return updateExecutionContext(exec, {
    taskOutputs: { ...exec.context.taskOutputs, [taskUoid.toString()]: output },
  });
}

export function setVariable(exec: Execution, key: string, value: unknown): Execution {
  return updateExecutionContext(exec, {
    variables: { ...exec.context.variables, [key]: value },
  });
}