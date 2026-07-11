/**
 * MMOS Runtime - Public API
 * Per ADR-008: Execution is Runtime Unit
 * Per ADR-014: Event-Driven Architecture
 *
 * Note: Some symbols (setTaskOutput) are intentionally renamed here to avoid
 * name clashes with re-exports from domain/execution.
 */

export type { EventBus, EventPattern, RuntimeEventHandler } from './event-bus.js';
export { InMemoryEventBus, emitTaskEvent } from './event-bus.js';

export type { RuntimeExecutionContext } from './execution-context.js';
export {
  RuntimeContextBuilder,
  createRuntimeContext,
  setTaskOutput as setRuntimeTaskOutput,
  getTaskOutput as getRuntimeTaskOutput,
} from './execution-context.js';

export type { ExecutionResult, ExecutionOutcome } from './execution-result.js';
export { createExecutionResult, isSuccessfulResult } from './execution-result.js';

export type { Orchestrator, OrchestratorOptions, EngineBindings } from './orchestrator.js';
export { BaseOrchestrator } from './orchestrator.js';
