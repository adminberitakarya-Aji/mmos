/**
 * MMOS Composition - Root Aggregate
 * Per ADR-001: Composition is the Heart
 * Per ADR-002: Project Root Aggregate
 * Per IMS-100: Composition Specification
 */

import { Uoid, UoidType, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface CompositionSpec {
  readonly project: Uoid;           // Parent project UOID
  readonly workspace: Uoid;         // Parent workspace UOID
  readonly workflows: readonly Uoid[]; // Workflow UOIDs in this composition
  readonly agents: readonly Uoid[];    // Agent UOIDs available in this composition
  readonly capabilities: readonly Uoid[]; // Capability UOIDs available
  readonly memory: readonly Uoid[];      // Memory UOIDs
  readonly entryWorkflow: Uoid | undefined;    // Entry point workflow
  readonly config: Record<string, unknown> | undefined;
}

export interface Composition extends Metadata {
  readonly specification: Specification;
  readonly spec: CompositionSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createComposition(params: {
  project: Uoid;
  workspace: Uoid;
  name: string;
  version?: string | undefined;
  description?: string | undefined;
  workflows?: readonly Uoid[] | undefined;
  agents?: readonly Uoid[] | undefined;
  capabilities?: readonly Uoid[] | undefined;
  memory?: readonly Uoid[] | undefined;
  entryWorkflow?: Uoid | undefined;
  config?: Record<string, unknown> | undefined;
  createdBy?: string | undefined;
  ownedBy?: string | undefined;
}): Composition {
  const uoid = createUoid('cmp');
  const spec: CompositionSpec = {
    project: params.project,
    workspace: params.workspace,
    workflows: params.workflows ?? [],
    agents: params.agents ?? [],
    capabilities: params.capabilities ?? [],
    memory: params.memory ?? [],
    entryWorkflow: params.entryWorkflow,
    config: params.config,
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
    specification: { type: 'composition', schema: 'composition.schema.json', config: params.config as Readonly<Record<string, unknown>> | undefined },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.project, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function addWorkflow(comp: Composition, workflowUoid: Uoid): Composition {
  return {
    ...comp,
    spec: {
      ...comp.spec,
      workflows: [...comp.spec.workflows, workflowUoid],
    },
  };
}

export function addAgent(comp: Composition, agentUoid: Uoid): Composition {
  return {
    ...comp,
    spec: {
      ...comp.spec,
      agents: [...comp.spec.agents, agentUoid],
    },
  };
}

export function setEntryWorkflow(comp: Composition, workflowUoid: Uoid): Composition {
  return {
    ...comp,
    spec: {
      ...comp.spec,
      entryWorkflow: workflowUoid,
    },
  };
}