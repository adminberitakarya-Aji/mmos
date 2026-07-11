/**
 * MMOS Task - Unit of Work
 * Per ADR-004: Engine Separation (Workflow Engine executes Tasks via Capability Engine)
 * Per IMS-300: Task Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface TaskSpec {
  readonly workflow: Uoid;              // Parent workflow
  readonly agent: Uoid;                 // Assigned agent
  readonly capability: Uoid;            // Capability to invoke
  readonly input: Record<string, unknown> | undefined;  // Static input or template
  readonly inputTemplate: string | undefined;      // Template reference (e.g., "memory.key" or "$.outputs.prev")
  readonly outputMapping: Record<string, string> | undefined; // Output field mappings
  readonly retryPolicy: RetryPolicy | undefined;
  readonly timeout: number | undefined;            // Task timeout in ms
  readonly allowHumanIntervention: boolean | undefined; // Per ADR-015
  readonly humanTaskConfig: HumanTaskConfig | undefined;
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly backoffMultiplier?: number;
  readonly retryOn?: string[];
}

export interface HumanTaskConfig {
  readonly title: string;
  readonly description: string;
  readonly formSchema?: Record<string, unknown>;
  readonly assignee?: string;
  readonly dueDate?: Date;
}

export interface Task extends Metadata {
  readonly specification: Specification;
  readonly spec: TaskSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createTask(params: {
  uoid?: Uoid | undefined;
  workflow: Uoid;
  agent: Uoid;
  capability: Uoid;
  name: string;
  version?: string | undefined;
  description?: string | undefined;
  input?: Record<string, unknown> | undefined;
  inputTemplate?: string | undefined;
  outputMapping?: Record<string, string> | undefined;
  retryPolicy?: RetryPolicy | undefined;
  timeout?: number | undefined;
  allowHumanIntervention?: boolean | undefined;
  humanTaskConfig?: HumanTaskConfig | undefined;
  createdBy?: string | undefined;
  ownedBy?: string | undefined;
}): Task {
  const uoid = params.uoid ?? createUoid('tsk');
  const spec: TaskSpec = {
    workflow: params.workflow,
    agent: params.agent,
    capability: params.capability,
    input: params.input,
    inputTemplate: params.inputTemplate,
    outputMapping: params.outputMapping,
    retryPolicy: params.retryPolicy,
    timeout: params.timeout,
    allowHumanIntervention: params.allowHumanIntervention ?? false,
    humanTaskConfig: params.humanTaskConfig,
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
    specification: { type: 'task', schema: 'task.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> | undefined },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.workflow, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function withInput(task: Task, input: Record<string, unknown>): Task {
  return {
    ...task,
    spec: { ...task.spec, input },
  };
}

export function withRetryPolicy(task: Task, policy: RetryPolicy): Task {
  return {
    ...task,
    spec: { ...task.spec, retryPolicy: policy },
  };
}