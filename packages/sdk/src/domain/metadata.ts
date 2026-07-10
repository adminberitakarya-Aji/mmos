/**
 * MMOS Object Metadata
 * Per IMS-100: Universal Object Structure - Metadata
 */

import { Uoid } from './identity.js';

export interface Metadata {
  readonly uoid: Uoid;
  readonly version: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly tags: readonly string[] | undefined;
  readonly labels: Readonly<Record<string, string>> | undefined;
  readonly annotations: Readonly<Record<string, unknown>> | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string | undefined;
  readonly ownedBy: string | undefined;
}

export function createMetadata(params: {
  uoid: Uoid;
  version: string;
  name: string;
  description?: string | undefined;
  tags?: readonly string[] | undefined;
  labels?: Record<string, string> | undefined;
  annotations?: Record<string, unknown> | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  createdBy?: string | undefined;
  ownedBy?: string | undefined;
}): Metadata {
  // Validate semantic version format
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(params.version)) {
    throw new Error(`Invalid semantic version: ${params.version}`);
  }

  const now = new Date();
  return {
    uoid: params.uoid,
    version: params.version,
    name: params.name,
    description: params.description,
    tags: params.tags,
    labels: params.labels,
    annotations: params.annotations,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now,
    createdBy: params.createdBy,
    ownedBy: params.ownedBy,
  };
}

export function withMetadataUpdates(
  metadata: Metadata,
  updates: Partial<Pick<Metadata, 'version' | 'name' | 'description' | 'tags' | 'labels' | 'annotations'>>
): Metadata {
  return {
    ...metadata,
    ...updates,
    updatedAt: new Date(),
  };
}

export function withMetadataVersion(metadata: Metadata, version: string): Metadata {
  return withMetadataUpdates(metadata, { version });
}

export function withMetadataDescription(metadata: Metadata, description: string): Metadata {
  return withMetadataUpdates(metadata, { description });
}

export function withMetadataTags(metadata: Metadata, tags: readonly string[]): Metadata {
  return withMetadataUpdates(metadata, { tags });
}

/**
 * Specification - type-specific configuration
 */
export interface Specification {
  readonly type: string;
  readonly schema: string | undefined;
  readonly config: Readonly<Record<string, unknown>> | undefined;
}

export function createSpecification(type: string, schema?: string, config?: Record<string, unknown>): Specification {
  return { type, schema, config };
}

/**
 * Status - execution lifecycle state
 */
export type StatusPhase = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface Status {
  readonly phase: StatusPhase;
  readonly message: string | undefined;
  readonly progress: number | undefined;
  readonly startedAt: Date | undefined;
  readonly completedAt: Date | undefined;
  readonly error: Error | undefined;
}

export type StatusParams = Partial<{
  readonly phase: StatusPhase;
  readonly message: string | undefined;
  readonly progress: number | undefined;
  readonly startedAt: Date | undefined;
  readonly completedAt: Date | undefined;
  readonly error: Error | undefined;
}> & { readonly phase: StatusPhase };

export function createStatus(params: StatusParams): Status {
  return {
    phase: params.phase,
    message: params.message,
    progress: params.progress,
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    error: params.error,
  };
}

export const Status = {
  pending: (message?: string) => createStatus({ phase: 'pending' as const, message }),
  active: (message?: string, progress?: number) => createStatus({ phase: 'active' as const, message, progress, startedAt: new Date() }),
  completed: (message?: string) => createStatus({ phase: 'completed' as const, message, progress: 100, completedAt: new Date() }),
  failed: (message: string, error?: Error) => createStatus({ phase: 'failed' as const, message, error, completedAt: new Date() }),
  cancelled: (message?: string) => createStatus({ phase: 'cancelled' as const, message, completedAt: new Date() }),
  paused: (message?: string, progress?: number) => createStatus({ phase: 'paused' as const, message, progress }),
};

export function isTerminalStatus(status: Status): boolean {
  return ['completed', 'failed', 'cancelled'].includes(status.phase);
}

export function isActiveStatus(status: Status): boolean {
  return status.phase === 'active';
}

/**
 * Relationships - object graph connections
 */
export interface Relationships {
  readonly parent: Uoid | undefined;
  readonly children: readonly Uoid[];
  readonly dependencies: readonly Uoid[];
  readonly dependents: readonly Uoid[];
  readonly references: readonly Uoid[];
  readonly referencedBy: readonly Uoid[];
}

export function createRelationships(params: {
  parent?: Uoid;
  children?: readonly Uoid[];
  dependencies?: readonly Uoid[];
  dependents?: readonly Uoid[];
  references?: readonly Uoid[];
  referencedBy?: readonly Uoid[];
} = {}): Relationships {
  return {
    parent: params.parent,
    children: params.children ?? [],
    dependencies: params.dependencies ?? [],
    dependents: params.dependents ?? [],
    references: params.references ?? [],
    referencedBy: params.referencedBy ?? [],
  };
}

export function addChild(rels: Relationships, child: Uoid): Relationships {
  return {
    ...rels,
    children: [...rels.children, child],
  };
}

export function addDependency(rels: Relationships, dep: Uoid): Relationships {
  return {
    ...rels,
    dependencies: [...rels.dependencies, dep],
  };
}

export function addReference(rels: Relationships, ref: Uoid): Relationships {
  return {
    ...rels,
    references: [...rels.references, ref],
  };
}