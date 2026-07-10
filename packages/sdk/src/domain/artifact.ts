/**
 * MMOS Artifact - Output Artifact
 * Per IMS-100: Universal Object Structure
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface ArtifactSpec {
  readonly execution: Uoid;              // Execution that produced this artifact
  readonly task?: Uoid;                  // Task that produced this artifact (optional)
  readonly type: string;                 // Artifact type: "document", "image", "video", "json", "code", etc.
  readonly mimeType: string;             // MIME type
  readonly size?: number;                // Size in bytes
  readonly checksum?: string;            // SHA256 or similar
  readonly storage: StorageRef;          // Storage reference
  readonly metadata?: Record<string, unknown>;
}

export interface StorageRef {
  readonly backend: string;              // Storage backend: "file", "s3", "gcs", "azure", "memory"
  readonly path: string;                 // Path/key in storage
  readonly bucket?: string;              // Bucket/container (if applicable)
  readonly region?: string;              // Region (if applicable)
  readonly url?: string;                 // Public/signed URL
}

export interface Artifact extends Metadata {
  readonly specification: Specification;
  readonly spec: ArtifactSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createArtifact(params: {
  execution: Uoid;
  name: string;
  version?: string;
  description?: string;
  type: string;
  mimeType: string;
  size?: number;
  checksum?: string;
  storage: StorageRef;
  task?: Uoid;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  ownedBy?: string;
}): Artifact {
  const uoid = createUoid('art');
  const spec: ArtifactSpec = {
    execution: params.execution,
    task: params.task,
    type: params.type,
    mimeType: params.mimeType,
    size: params.size,
    checksum: params.checksum,
    storage: params.storage,
    metadata: params.metadata,
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
    specification: { type: 'artifact', schema: 'artifact.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'pending', message: undefined, progress: undefined, startedAt: undefined, completedAt: undefined, error: undefined },
    relationships: { parent: params.execution, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function withStorage(artifact: Artifact, storage: StorageRef): Artifact {
  return {
    ...artifact,
    spec: { ...artifact.spec, storage },
  };
}

export function withChecksum(artifact: Artifact, checksum: string): Artifact {
  return {
    ...artifact,
    spec: { ...artifact.spec, checksum },
  };
}