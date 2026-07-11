/**
 * MMOS Execution Result - Output of Orchestrator Execution
 * Per ADR-008: Execution is Runtime Unit
 * Per IMS-400: Execution Specification
 */

import { Uoid } from '../domain/identity.js';
import { Event } from '../domain/event.js';
import { Artifact } from '../domain/artifact.js';

export type ExecutionOutcome = 'completed' | 'failed' | 'cancelled';

export interface ExecutionResult {
  readonly execution: Uoid;
  readonly outcome: ExecutionOutcome;
  readonly outputs: Readonly<Record<string, unknown>>;
  readonly artifacts: readonly Artifact[];
  readonly events: readonly Event[];
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly durationMs: number;
  readonly error?: Error;
}

export function createExecutionResult(params: {
  execution: Uoid;
  outcome: ExecutionOutcome;
  outputs?: Record<string, unknown>;
  artifacts?: readonly Artifact[];
  events?: readonly Event[];
  startedAt: Date;
  completedAt: Date;
  error?: Error;
}): ExecutionResult {
  const durationMs = params.completedAt.getTime() - params.startedAt.getTime();
  return {
    execution: params.execution,
    outcome: params.outcome,
    outputs: Object.freeze({ ...(params.outputs ?? {}) }),
    artifacts: Object.freeze([...(params.artifacts ?? [])]),
    events: Object.freeze([...(params.events ?? [])]),
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    durationMs,
    error: params.error,
  };
}

export function isSuccessfulResult(result: ExecutionResult): boolean {
  return result.outcome === 'completed';
}
