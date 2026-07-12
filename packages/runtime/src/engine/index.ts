/**
 * MMOS Runtime - Engine Module
 * Per ADR-004: Engine Separation
 * 
 * This module provides reference implementations for all engine types:
 * - RuntimeEngine: AI/LLM execution (OpenAI, Anthropic, Local)
 * - CapabilityEngine: External capability invocation (HTTP, CLI, Function)
 * - MemoryEngine: Context storage and retrieval (InMemory, Redis, Vector)
 * - EventEngine: Event-driven communication (InMemory, Redis, Kafka)
 */

// Re-export all engine implementations
export * from './runtime/index.js';
export * from './capability/index.js';
export * from './memory/index.js';
export * from './event/index.js';
export * from './plugin/index.js';
