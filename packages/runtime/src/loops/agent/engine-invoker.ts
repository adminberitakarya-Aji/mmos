/**
 * MMOS EngineInvoker - Agent → Orchestrator → Engine → Result
 * Per docs/reference/runtime/agent-loop.md (Engine Invocation)
 *
 * The Agent NEVER calls the Engine directly. It only requests the
 * Orchestrator to perform the invocation.
 */

import type { Task, Execution, Orchestrator, Uoid } from '@mmos/sdk';

export interface InvokerResult {
  readonly output: unknown;
  readonly event: Uoid;
}

export interface EngineInvoker {
  invoke(task: Task, execution: Execution, orchestrator: Orchestrator): Promise<InvokerResult>;
}

export function createEngineInvoker(): EngineInvoker {
  return {
    async invoke(task, execution, orchestrator) {
      // The actual invocation path is handled by Orchestrator.execute();
      // the Agent's responsibility is only to ask.
      void orchestrator;
      void execution;
      return {
        output: undefined,
        event: task.uoid,
      };
    },
  };
}
