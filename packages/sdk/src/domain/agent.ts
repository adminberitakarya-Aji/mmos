/**
 * MMOS Agent - Autonomous Actor
 * Per IMS-200: Agent Specification
 * Per ADR-006: Contract First (Agent as contract)
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface AgentSpec {
  readonly composition: Uoid;           // Parent composition
  readonly capabilities: readonly Uoid[]; // Capabilities this agent can use
  readonly memory: readonly Uoid[];     // Memory instances available
  readonly runtime: Uoid;               // Runtime configuration
  readonly policies: AgentPolicies | undefined;    // Behavioral policies
  readonly planning: PlanningConfig | undefined;   // Planning/reasoning config
}

export interface AgentPolicies {
  readonly maxConcurrentTasks?: number;
  readonly defaultTimeout?: number;
  readonly retryPolicy?: RetryPolicy;
  readonly allowDelegation?: boolean;
}

export interface PlanningConfig {
  readonly enabled: boolean;
  readonly model?: string;              // AI model for planning
  readonly temperature?: number;
  readonly maxSteps?: number;
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly backoffMultiplier?: number;
}

export interface Agent extends Metadata {
  readonly specification: Specification;
  readonly spec: AgentSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createAgent(params: {
  composition: Uoid;
  name: string;
  version?: string;
  description?: string;
  capabilities?: readonly Uoid[];
  memory?: readonly Uoid[];
  runtime: Uoid;
  policies?: AgentPolicies;
  planning?: PlanningConfig;
  createdBy?: string;
  ownedBy?: string;
}): Agent {
  const uoid = createUoid('agt');
  const spec: AgentSpec = {
    composition: params.composition,
    capabilities: params.capabilities ?? [],
    memory: params.memory ?? [],
    runtime: params.runtime,
    policies: params.policies,
    planning: params.planning,
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
    specification: { type: 'agent', schema: 'agent.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.composition, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function addCapability(agent: Agent, capabilityUoid: Uoid): Agent {
  return {
    ...agent,
    spec: {
      ...agent.spec,
      capabilities: [...agent.spec.capabilities, capabilityUoid],
    },
  };
}

export function addMemory(agent: Agent, memoryUoid: Uoid): Agent {
  return {
    ...agent,
    spec: {
      ...agent.spec,
      memory: [...agent.spec.memory, memoryUoid],
    },
  };
}

export function withPolicies(agent: Agent, policies: AgentPolicies): Agent {
  return {
    ...agent,
    spec: {
      ...agent.spec,
      policies,
    },
  };
}