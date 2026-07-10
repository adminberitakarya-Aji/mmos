/**
 * MMOS Engine Interfaces
 * Per ADR-004: Engine Separation - One Responsibility, One Engine
 * Per IMS-800: Engine Specifications
 */

import { Uoid } from '../domain/index.js';
import type { CapabilityInput, CapabilityOutput } from '../domain/capability.js';
import type { MemoryEntry, MemoryQuery } from '../domain/memory.js';

/**
 * RuntimeEngine - Executes AI/LLM prompts
 * Per ADR-005: Provider Agnostic - Depend on Contracts, Never on Providers
 */
export interface RuntimeEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedModels: readonly string[];
  
  /**
   * Execute a prompt with the configured model
   */
  execute(params: RuntimeEngineParams): Promise<RuntimeEngineResult>;
  
  /**
   * Stream execution for real-time responses
   */
  executeStream?(params: RuntimeEngineParams): AsyncIterable<RuntimeEngineChunk>;
  
  /**
   * Check if engine is available/healthy
   */
  healthCheck(): Promise<EngineHealth>;
}

export interface RuntimeEngineParams {
  readonly prompt: string;
  readonly model: string;
  readonly parameters?: Record<string, unknown>;
  readonly systemPrompt?: string;
  readonly messages?: readonly Message[];
  readonly tools?: readonly ToolDefinition[];
  readonly maxTokens?: number;
  readonly temperature?: number;
}

export interface Message {
  readonly role: 'system' | 'user' | 'assistant' | 'tool';
  readonly content: string;
  readonly toolCalls?: readonly ToolCall[];
  readonly toolCallId?: string;
}

export interface ToolDefinition {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly description: string;
    readonly parameters: Record<string, unknown>;
  };
}

export interface ToolCall {
  readonly id: string;
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly arguments: string;
  };
}

export interface RuntimeEngineResult {
  readonly content: string;
  readonly usage?: TokenUsage;
  readonly toolCalls?: readonly ToolCall[];
  readonly finishReason?: 'stop' | 'length' | 'tool_calls' | 'error';
  readonly metadata?: Record<string, unknown>;
}

export interface RuntimeEngineChunk {
  readonly content: string;
  readonly done: boolean;
  readonly toolCalls: readonly ToolCall[] | undefined;
  readonly usage: TokenUsage | undefined;
}

export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface EngineHealth {
  readonly healthy: boolean;
  readonly latencyMs?: number;
  readonly details?: Record<string, unknown>;
}

/**
 * CapabilityEngine - Invokes external capabilities
 * Per ADR-010: Capability as Contract
 */
export interface CapabilityEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedCategories: readonly string[];
  
  /**
   * Invoke a capability by its UOID
   */
  invoke(params: CapabilityEngineParams): Promise<CapabilityEngineResult>;
  
  /**
   * Check if engine can handle this capability
   */
  canHandle(capabilityUoid: Uoid): Promise<boolean>;
  
  /**
   * Get capability schema/definition
   */
  getCapabilitySchema(capabilityUoid: Uoid): Promise<CapabilitySchema | null>;
  
  healthCheck(): Promise<EngineHealth>;
}

export interface CapabilityEngineParams {
  readonly capabilityUoid: Uoid;
  readonly input: Record<string, unknown>;
  readonly config?: Record<string, unknown>;
  readonly auth?: AuthContext;
  readonly timeout?: number;
}

export interface CapabilityEngineResult {
  readonly output: Record<string, unknown>;
  readonly artifacts?: readonly ArtifactRef[];
  readonly metadata?: Record<string, unknown>;
}

export interface CapabilitySchema {
  readonly uoid: Uoid;
  readonly name: string;
  readonly category: string;
  readonly provider: string;
  readonly inputs: readonly CapabilityInput[];
  readonly outputs: readonly CapabilityOutput[];
  readonly version: string;
}

// CapabilityInput and CapabilityOutput are re-exported from domain/capability.js
// to avoid duplicate exports

export interface AuthContext {
  readonly type: 'none' | 'apiKey' | 'oauth2' | 'bearer' | 'custom';
  readonly credentials?: Record<string, string>;
}

export interface ArtifactRef {
  readonly uoid: Uoid;
  readonly type: string;
  readonly uri: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * MemoryEngine - Provides context storage and retrieval
 * Per ADR-011: Memory as Context Provider
 */
export interface MemoryEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedTypes: readonly MemoryType[];
  
  /**
   * Store a memory entry
   */
  store(params: MemoryStoreParams): Promise<MemoryStoreResult>;
  
  /**
   * Retrieve memory entries
   */
  retrieve(params: MemoryRetrieveParams): Promise<MemoryRetrieveResult>;
  
  /**
   * Search memory by vector similarity
   */
  search?(params: MemorySearchParams): Promise<MemorySearchResult>;
  
  /**
   * Delete memory entries
   */
  delete(params: MemoryDeleteParams): Promise<MemoryDeleteResult>;
  
  healthCheck(): Promise<EngineHealth>;
}

export type MemoryType = 'ephemeral' | 'persistent' | 'vector' | 'graph' | 'hybrid';

export interface MemoryStoreParams {
  readonly memoryUoid: Uoid;
  readonly entries: readonly MemoryEntry[];
}

export interface MemoryStoreResult {
  readonly stored: number;
  readonly failed?: readonly string[];
}

export interface MemoryRetrieveParams {
  readonly memoryUoid: Uoid;
  readonly query?: MemoryQuery;
}

export interface MemoryRetrieveResult {
  readonly entries: readonly MemoryEntry[];
  readonly total?: number;
}

export interface MemorySearchParams {
  readonly memoryUoid: Uoid;
  readonly vector: readonly number[];
  readonly limit?: number;
  readonly threshold?: number;
  readonly filter?: Record<string, unknown>;
}

export interface MemorySearchResult {
  readonly entries: readonly (MemoryEntry & { score: number })[];
}

export interface MemoryDeleteParams {
  readonly memoryUoid: Uoid;
  readonly keys?: readonly string[];
  readonly filter?: Record<string, unknown>;
  readonly deleteAll?: boolean;
}

export interface MemoryDeleteResult {
  readonly deleted: number;
}

/**
 * EventEngine - Event-driven communication
 * Per ADR-012: Event is Immutable
 * Per ADR-014: Event-Driven Architecture
 */
export interface EventEngine {
  readonly name: string;
  readonly version: string;
  
  /**
   * Publish an event
   */
  publish(event: EventEnvelope): Promise<EventPublishResult>;
  
  /**
   * Subscribe to events
   */
  subscribe(params: EventSubscribeParams): EventSubscription;
  
  /**
   * Unsubscribe
   */
  unsubscribe(subscriptionId: string): Promise<void>;
  
  /**
   * Get event history (if supported)
   */
  getHistory?(params: EventHistoryParams): Promise<EventHistoryResult>;
  
  healthCheck(): Promise<EngineHealth>;
}

export interface EventEnvelope {
  readonly event: Uoid;
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: Date;
  readonly source: Uoid;
  readonly correlationId?: Uoid;
  readonly causationId?: Uoid;
  readonly tags?: readonly string[];
}

export interface EventPublishResult {
  readonly published: boolean;
  readonly eventId: string;
}

export interface EventSubscribeParams {
  readonly eventTypes: readonly string[];
  readonly handler: EventHandler;
  readonly filter?: EventFilter;
  readonly fromBeginning?: boolean;
}

export type EventHandler = (event: EventEnvelope) => Promise<void> | void;

export interface EventFilter {
  readonly source?: Uoid;
  readonly correlationId?: Uoid;
  readonly tags?: readonly string[];
  readonly custom?: (event: EventEnvelope) => boolean;
}

export interface EventSubscription {
  readonly id: string;
  readonly unsubscribe: () => Promise<void>;
}

export interface EventHistoryParams {
  readonly eventTypes?: readonly string[];
  readonly from?: Date;
  readonly to?: Date;
  readonly limit?: number;
  readonly filter?: EventFilter;
}

export interface EventHistoryResult {
  readonly events: readonly EventEnvelope[];
  readonly total?: number;
}
