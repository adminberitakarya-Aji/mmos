/**
 * MMOS Capability - External Capability Contract
 * Per ADR-010: Capability as Contract
 * Per IMS-600: Capability Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface CapabilityInput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly default?: unknown;
  readonly schema?: Record<string, unknown>;
}

export interface CapabilityOutput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly schema?: Record<string, unknown>;
}

export interface CapabilitySpec {
  readonly composition: Uoid;
  readonly category: string;               // e.g., "llm", "search", "storage", "transform"
  readonly provider: string;                // Provider identifier
  readonly inputs: readonly CapabilityInput[];
  readonly outputs: readonly CapabilityOutput[];
  readonly config?: Record<string, unknown>;
  readonly auth?: AuthConfig;
  readonly version: string;
}

export interface AuthConfig {
  readonly type: 'none' | 'apiKey' | 'oauth2' | 'bearer' | 'custom';
  readonly config?: Record<string, unknown>;
}

export interface Capability extends Metadata {
  readonly specification: Specification;
  readonly spec: CapabilitySpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createCapability(params: {
  composition: Uoid;
  name: string;
  version?: string;
  description?: string;
  category: string;
  provider: string;
  inputs?: readonly CapabilityInput[];
  outputs?: readonly CapabilityOutput[];
  config?: Record<string, unknown>;
  auth?: AuthConfig;
  createdBy?: string;
  ownedBy?: string;
}): Capability {
  const uoid = createUoid('cap');
  const spec: CapabilitySpec = {
    composition: params.composition,
    category: params.category,
    provider: params.provider,
    inputs: params.inputs ?? [],
    outputs: params.outputs ?? [],
    config: params.config,
    auth: params.auth,
    version: params.version ?? '1.0.0',
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
    specification: { type: 'capability', schema: 'capability.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.composition, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function addInput(cap: Capability, input: CapabilityInput): Capability {
  return {
    ...cap,
    spec: {
      ...cap.spec,
      inputs: [...cap.spec.inputs, input],
    },
  };
}

export function addOutput(cap: Capability, output: CapabilityOutput): Capability {
  return {
    ...cap,
    spec: {
      ...cap.spec,
      outputs: [...cap.spec.outputs, output],
    },
  };
}

export function withConfig(cap: Capability, config: Record<string, unknown>): Capability {
  return {
    ...cap,
    spec: { ...cap.spec, config },
  };
}