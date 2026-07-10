/**
 * MMOS Workflow - Declarative Workflow Definition
 * Per ADR-007: Workflow is Declarative
 * Per IMS-300: Workflow Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface WorkflowTaskRef {
  readonly task: Uoid;
  readonly condition?: string;     // Optional condition expression
  readonly retryPolicy?: RetryPolicy;
  readonly timeout?: number;       // Timeout in milliseconds
  readonly onFailure?: 'fail' | 'continue' | 'compensate';
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly backoffMultiplier?: number;
  readonly retryOn?: string[];     // Error types to retry on
}

export interface WorkflowTransition {
  readonly from: Uoid;             // Source task UOID
  readonly to: Uoid;               // Target task UOID
  readonly condition?: string;     // Transition condition
}

export interface WorkflowSpec {
  readonly tasks: readonly Uoid[];        // Task UOIDs in this workflow
  readonly transitions: readonly WorkflowTransition[]; // Task transitions
  readonly entryTask: Uoid | undefined;   // Starting task
  readonly variables: Record<string, unknown> | undefined; // Workflow-level variables
  readonly timeout: number | undefined;   // Total workflow timeout
}

export interface Workflow extends Metadata {
  readonly specification: Specification;
  readonly spec: WorkflowSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createWorkflow(params: {
  composition: Uoid;              // Parent composition
  name: string;
  version?: string | undefined;
  description?: string | undefined;
  tasks?: readonly Uoid[] | undefined;
  transitions?: readonly WorkflowTransition[] | undefined;
  entryTask?: Uoid | undefined;
  variables?: Record<string, unknown> | undefined;
  timeout?: number | undefined;
  createdBy?: string | undefined;
  ownedBy?: string | undefined;
}): Workflow {
  const uoid = createUoid('wfl');
  const spec: WorkflowSpec = {
    tasks: params.tasks ?? [],
    transitions: params.transitions ?? [],
    entryTask: params.entryTask,
    variables: params.variables,
    timeout: params.timeout,
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
    specification: { type: 'workflow', schema: 'workflow.schema.json', config: params.variables as Readonly<Record<string, unknown>> | undefined },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.composition, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function addTask(wf: Workflow, taskUoid: Uoid): Workflow {
  return {
    ...wf,
    spec: {
      ...wf.spec,
      tasks: [...wf.spec.tasks, taskUoid],
    },
  };
}

export function addTransition(wf: Workflow, transition: WorkflowTransition): Workflow {
  return {
    ...wf,
    spec: {
      ...wf.spec,
      transitions: [...wf.spec.transitions, transition],
    },
  };
}

export function setEntryTask(wf: Workflow, taskUoid: Uoid): Workflow {
  return {
    ...wf,
    spec: {
      ...wf.spec,
      entryTask: taskUoid,
    },
  };
}

export function getNextTasks(wf: Workflow, completedTask: Uoid): readonly Uoid[] {
  return wf.spec.transitions
    .filter(t => t.from.equals(completedTask) && (!t.condition || evalCondition(t.condition, wf.spec.variables ?? {})))
    .map(t => t.to);
}

function evalCondition(condition: string, variables: Record<string, unknown>): boolean {
  // Simple condition evaluation - in production use a proper expression evaluator
  try {
    // eslint-disable-next-line no-new-func
    return new Function('vars', `with(vars) { return ${condition}; }`)(variables);
  } catch {
    return false;
  }
}