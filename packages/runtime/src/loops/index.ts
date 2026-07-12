/**
 * MMOS Runtime Loops - Public Barrel
 * Per docs/reference/runtime/*.md
 *
 * Implements the 5 Loop Runtime architecture as described in:
 *   - system-loop.md
 *   - scheduler-loop.md
 *   - execution-loop.md
 *   - agent-loop.md
 *   - event-loop.md
 *
 * Each Loop is a module under packages/runtime/src/loops/ that accesses
 * Engines only via the Orchestrator (ADR-003), stays stateless (ADR-009),
 * and emits Events for every significant change (ADR-014).
 */

export * as system from './system/index.js';
export * as scheduler from './scheduler/index.js';
export * as execution from './execution/index.js';
export * as agent from './agent/index.js';
export * as event from './event/index.js';

// Re-export the most-used public surface explicitly so consumers can
// import them without a namespace prefix.
export { SystemLoop, createSystemLoop } from './system/index.js';
export { createScheduler } from './scheduler/index.js';
export { createExecutionLoop } from './execution/index.js';
export { createAgentLoop } from './agent/index.js';
export { createEventLoop } from './event/index.js';
