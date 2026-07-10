/**
 * MMOS Runtime - AI Provider Configuration
 * Per ADR-009: Runtime is Stateless
 * Per ADR-005: Provider Agnostic
 * Per IMS-700: Runtime Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface ProviderConfig {
  readonly type: 'openai' | 'anthropic' | 'ollama' | 'custom';
  readonly model: string;
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly organization?: string;
  readonly parameters?: Record<string, unknown>;
}

export interface RuntimeSpec {
  readonly composition: Uoid;
  readonly provider: ProviderConfig;
  readonly defaultParameters?: Record<string, unknown>;
  readonly limits?: RuntimeLimits;
  readonly fallback?: ProviderConfig;
}

export interface RuntimeLimits {
  readonly maxTokens?: number;
  readonly maxConcurrentRequests?: number;
  readonly rateLimitRpm?: number;
  readonly timeoutMs?: number;
}

export interface Runtime extends Metadata {
  readonly specification: Specification;
  readonly spec: RuntimeSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createRuntime(params: {
  composition: Uoid;
  name: string;
  version?: string;
  description?: string;
  provider: ProviderConfig;
  defaultParameters?: Record<string, unknown>;
  limits?: RuntimeLimits;
  fallback?: ProviderConfig;
  createdBy?: string;
  ownedBy?: string;
}): Runtime {
  const uoid = createUoid('run');
  const spec: RuntimeSpec = {
    composition: params.composition,
    provider: params.provider,
    defaultParameters: params.defaultParameters,
    limits: params.limits,
    fallback: params.fallback,
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
    specification: { type: 'runtime', schema: 'runtime.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.composition, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function withProvider(runtime: Runtime, provider: ProviderConfig): Runtime {
  return {
    ...runtime,
    spec: { ...runtime.spec, provider },
  };
}

export function withLimits(runtime: Runtime, limits: RuntimeLimits): Runtime {
  return {
    ...runtime,
    spec: { ...runtime.spec, limits },
  };
}

export function withFallback(runtime: Runtime, fallback: ProviderConfig): Runtime {
  return {
    ...runtime,
    spec: { ...runtime.spec, fallback },
  };
}