/**
 * MMOS Memory - Context Provider
 * Per ADR-011: Memory as Context Provider
 * Per IMS-500: Memory Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface MemorySpec {
  readonly composition: Uoid;
  readonly type: 'ephemeral' | 'persistent' | 'vector' | 'graph' | 'hybrid';
  readonly backend: string;              // e.g., "in-memory", "redis", "postgres", "pinecone"
  readonly config?: Record<string, unknown>;
  readonly ttl?: number;                 // Time-to-live in seconds
  readonly maxEntries?: number;
}

export interface MemoryQuery {
  readonly filter?: Record<string, unknown>;
  readonly vector?: number[];
  readonly limit?: number;
  readonly offset?: number;
  readonly sort?: Record<string, 'asc' | 'desc'>;
}

export interface MemoryEntry {
  readonly key: string;
  readonly value: unknown;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly tags?: string[];
  readonly vector?: number[];
}

export interface Memory extends Metadata {
  readonly specification: Specification;
  readonly spec: MemorySpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createMemory(params: {
  composition: Uoid;
  name: string;
  version?: string;
  description?: string;
  type: 'ephemeral' | 'persistent' | 'vector' | 'graph' | 'hybrid';
  backend: string;
  config?: Record<string, unknown>;
  ttl?: number;
  maxEntries?: number;
  createdBy?: string;
  ownedBy?: string;
}): Memory {
  const uoid = createUoid('mem');
  const spec: MemorySpec = {
    composition: params.composition,
    type: params.type,
    backend: params.backend,
    config: params.config,
    ttl: params.ttl,
    maxEntries: params.maxEntries,
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
    specification: { type: 'memory', schema: 'memory.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.composition, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function withConfig(memory: Memory, config: Record<string, unknown>): Memory {
  return {
    ...memory,
    spec: { ...memory.spec, config },
  };
}

export function withTTL(memory: Memory, ttl: number): Memory {
  return {
    ...memory,
    spec: { ...memory.spec, ttl },
  };
}