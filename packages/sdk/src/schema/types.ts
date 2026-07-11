/**
 * MMOS Schema Types — TypeScript interfaces generated from specs/schemas/*.schema.json
 * Per IMS-200: Schema-as-Contract
 *
 * These types represent the wire/serialization format of MMOS objects.
 * They are the contract between producers and consumers and are validated
 * against the JSON schemas at runtime. Domain model types (in domain/) add
 * behavior, immutability helpers, and runtime-specific fields above this layer.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared Primitives (from $defs in every schema)
// ─────────────────────────────────────────────────────────────────────────────

/** Immutable object identifier. Pattern: ^[a-z]{3}_[A-Za-z0-9_-]+$, 4..128 chars. */
export type SchemaIdentity = string;

/** Semantic version string. Pattern: ^[0-9]+\.[0-9]+\.[0-9]+$ */
export type SchemaSemanticVersion = string;

/** ISO-8601 date-time UTC string. */
export type SchemaDateTime = string;

/** Non-empty string, min 1 character. */
export type SchemaNonEmptyString = string;

/** String up to 5000 characters. */
export type SchemaDescription = string;

/** UUID string (RFC 4122 format). */
export type SchemaUUID = string;

// ─────────────────────────────────────────────────────────────────────────────
// Shared Sub-Objects
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaMetadata {
  [key: string]: unknown;
}

export interface SchemaLabelMap {
  [key: string]: string;
}

export interface SchemaTimestamp {
  createdAt: SchemaDateTime;
  updatedAt: SchemaDateTime;
  archivedAt?: SchemaDateTime | null;
  deletedAt?: SchemaDateTime | null;
}

export interface SchemaAuditInformation {
  createdBy: string;
  updatedBy?: string | null;
  archivedBy?: string | null;
  deletedBy?: string | null;
}

export type SchemaStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'archived'
  | 'deleted';

// ─────────────────────────────────────────────────────────────────────────────
// Composition Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaOwnerReference {
  projectId: SchemaIdentity;
  organizationId?: string | null;
  workspaceId?: string | null;
}

export interface SchemaWorkflowReference {
  workflowId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string | null;
  version: SchemaSemanticVersion;
  role: 'primary' | 'secondary' | 'approval' | 'fallback';
  enabled?: boolean;
}

export interface SchemaMemoryReference {
  memoryId: SchemaIdentity;
  type: 'conversation' | 'knowledge' | 'vector' | 'document' | 'session' | 'cache';
  readOnly?: boolean;
}

export interface SchemaArtifactReference {
  artifactId: SchemaIdentity;
  kind: 'image' | 'video' | 'audio' | 'document' | 'dataset' | 'json' | 'binary' | 'text' | 'other';
  required?: boolean;
}

export interface SchemaCapabilityReference {
  capabilityId: SchemaIdentity;
  required?: boolean;
}

export interface SchemaAgentReference {
  agentId: SchemaIdentity;
  role: string;
  optional?: boolean;
}

export interface SchemaRuntimeReference {
  runtimeId: SchemaIdentity;
  provider?: string;
  version?: SchemaSemanticVersion;
}

export interface SchemaRetryPolicy {
  enabled?: boolean;
  maxAttempts?: number;
  backoffStrategy?: 'fixed' | 'linear' | 'exponential';
  delaySeconds?: number;
}

export interface SchemaExecutionPolicy {
  mode?: 'sequential' | 'parallel' | 'mixed';
  timeoutSeconds?: number;
  allowHumanIntervention?: boolean;
  retryPolicy?: SchemaRetryPolicy;
}

export interface SchemaConfiguration {
  executionPolicy?: SchemaExecutionPolicy;
  defaultRuntime?: SchemaRuntimeReference;
  environment?: 'development' | 'testing' | 'staging' | 'production';
  variables?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SchemaComposition {
  compositionId: SchemaIdentity;
  projectId: SchemaIdentity;
  parentCompositionId?: SchemaIdentity | null;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  owner: SchemaOwnerReference;
  workflows: SchemaWorkflowReference[];
  defaultWorkflowId?: SchemaIdentity | null;
  agents?: SchemaAgentReference[];
  capabilities?: SchemaCapabilityReference[];
  memory?: SchemaMemoryReference[];
  artifacts?: SchemaArtifactReference[];
  configuration: SchemaConfiguration;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Schema
// ─────────────────────────────────────────────────────────────────────────────

export type SchemaTransitionCondition =
  | 'on_success'
  | 'on_failure'
  | 'on_cancelled'
  | 'on_completed'
  | 'always';

export interface SchemaTransition {
  from: SchemaIdentity;
  to: SchemaIdentity;
  condition?: SchemaTransitionCondition;
  label?: string;
}

export interface SchemaWorkflow {
  workflowId: SchemaIdentity;
  compositionId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  entryTask?: SchemaIdentity | null;
  tasks: SchemaIdentity[];
  transitions?: SchemaTransition[];
  configuration?: Record<string, unknown>;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaTaskInputField {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

export interface SchemaTaskOutputField {
  name: string;
  type: string;
  description?: string;
}

export interface SchemaHumanTaskConfig {
  title: string;
  description?: string;
  instructions?: string;
  timeoutSeconds?: number;
  assignee?: string;
  resultSchema?: Record<string, unknown>;
}

export interface SchemaTaskRetryPolicy {
  enabled?: boolean;
  maxAttempts?: number;
  backoffStrategy?: 'fixed' | 'linear' | 'exponential';
  delaySeconds?: number;
}

export interface SchemaTask {
  taskId: SchemaIdentity;
  workflowId: SchemaIdentity;
  agentId: SchemaIdentity;
  capabilityId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  input?: SchemaTaskInputField[];
  output?: SchemaTaskOutputField[];
  timeoutSeconds?: number;
  allowHumanIntervention?: boolean;
  humanTaskConfig?: SchemaHumanTaskConfig;
  retryPolicy?: SchemaTaskRetryPolicy;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaAgentPolicies {
  maxConcurrentTasks?: number;
  allowDelegation?: boolean;
  requireApproval?: boolean;
  maxRetries?: number;
  [key: string]: unknown;
}

export interface SchemaAgent {
  agentId: SchemaIdentity;
  compositionId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  runtimeId?: SchemaIdentity | null;
  capabilities?: SchemaIdentity[];
  memory?: SchemaIdentity[];
  policies?: SchemaAgentPolicies;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Execution Schema
// ─────────────────────────────────────────────────────────────────────────────

export type SchemaExecutionPhase =
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SchemaExecutionStatus {
  phase: SchemaExecutionPhase;
  startedAt?: SchemaDateTime | null;
  completedAt?: SchemaDateTime | null;
  pausedAt?: SchemaDateTime | null;
  error?: string | null;
  progress?: number;
}

export interface SchemaExecutionContext {
  variables?: Record<string, unknown>;
  taskOutputs?: Record<string, unknown>;
  selectedAgent?: SchemaIdentity;
  [key: string]: unknown;
}

export interface SchemaExecution {
  executionId: SchemaIdentity;
  compositionId: SchemaIdentity;
  workflowId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaExecutionStatus;
  input?: Record<string, unknown>;
  context?: SchemaExecutionContext;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaRuntimeProvider {
  type: string;
  model?: string;
  endpoint?: string;
  apiKey?: string;
  organizationId?: string;
  [key: string]: unknown;
}

export interface SchemaRuntimeLimits {
  maxTokens?: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  retryAttempts?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  [key: string]: unknown;
}

export interface SchemaRuntime {
  runtimeId: SchemaIdentity;
  compositionId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  provider: SchemaRuntimeProvider;
  limits?: SchemaRuntimeLimits;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Capability Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaCapabilityInput {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

export interface SchemaCapabilityOutput {
  name: string;
  type: string;
  description?: string;
}

export interface SchemaCapabilityAuth {
  type: 'none' | 'apiKey' | 'bearer' | 'oauth2' | 'basic' | 'mcp';
  apiKey?: string;
  endpoint?: string;
  [key: string]: unknown;
}

export interface SchemaCapability {
  capabilityId: SchemaIdentity;
  compositionId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  category: string;
  provider: string;
  inputs?: SchemaCapabilityInput[];
  outputs?: SchemaCapabilityOutput[];
  auth?: SchemaCapabilityAuth;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Memory Schema
// ─────────────────────────────────────────────────────────────────────────────

export type SchemaMemoryType =
  | 'conversation'
  | 'knowledge'
  | 'vector'
  | 'document'
  | 'session'
  | 'cache'
  | 'ephemeral'
  | 'persistent';

export interface SchemaMemoryConfig {
  maxEntries?: number;
  maxTokens?: number;
  embeddingModel?: string;
  vectorDimensions?: number;
  similarityMetric?: 'cosine' | 'euclidean' | 'dot';
  [key: string]: unknown;
}

export interface SchemaMemory {
  memoryId: SchemaIdentity;
  compositionId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  type: SchemaMemoryType;
  backend: string;
  config?: SchemaMemoryConfig;
  ttl?: number;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Artifact Schema
// ─────────────────────────────────────────────────────────────────────────────

export type SchemaArtifactKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'dataset'
  | 'json'
  | 'binary'
  | 'text'
  | 'other';

export interface SchemaArtifactStorage {
  backend: string;
  path: string;
  bucket?: string;
  region?: string;
  url?: string;
  [key: string]: unknown;
}

export interface SchemaArtifact {
  artifactId: SchemaIdentity;
  executionId: SchemaIdentity;
  name: SchemaNonEmptyString;
  displayName?: string;
  description?: SchemaDescription;
  version: SchemaSemanticVersion;
  status: SchemaStatus;
  type: SchemaArtifactKind;
  mimeType?: string;
  size?: number;
  storage?: SchemaArtifactStorage;
  metadata?: SchemaMetadata;
  labels?: SchemaLabelMap;
  timestamps: SchemaTimestamp;
  audit: SchemaAuditInformation;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaEventPayload {
  [key: string]: unknown;
}

export interface SchemaEvent {
  eventId: SchemaIdentity;
  source: SchemaIdentity;
  type: SchemaNonEmptyString;
  payload: SchemaEventPayload;
  correlationId?: SchemaIdentity | null;
  causationId?: SchemaIdentity | null;
  timestamp: SchemaDateTime;
  metadata?: SchemaMetadata;
  extensions?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry: Schema name → TypeScript type mapping
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaTypeMap {
  composition: SchemaComposition;
  workflow: SchemaWorkflow;
  task: SchemaTask;
  agent: SchemaAgent;
  execution: SchemaExecution;
  runtime: SchemaRuntime;
  capability: SchemaCapability;
  memory: SchemaMemory;
  artifact: SchemaArtifact;
  event: SchemaEvent;
}

/** Known schema names (matches specs/schemas/*.schema.json filenames). */
export type SchemaName = keyof SchemaTypeMap;

/** Resolve the TypeScript type for a given schema name. */
export type SchemaType<N extends SchemaName> = SchemaTypeMap[N];