/**
 * MMOS AgentContextBuilder - Task Input + Execution Context + Memory Context +
 *                            Composition Context + Agent Context
 * Per docs/reference/runtime/agent-loop.md (Context Construction)
 */

import type { RuntimeExecutionContext } from '@mmos/sdk';

export interface AgentContext {
  readonly taskInput: Record<string, unknown>;
  readonly execution: RuntimeExecutionContext;
  readonly memory: Record<string, unknown>;
  readonly composition: Record<string, unknown>;
  readonly agent: Record<string, unknown>;
  readonly variables: Record<string, unknown>;
}

export interface AgentContextBuilder {
  withTaskInput(input: Record<string, unknown>): AgentContextBuilder;
  withMemory(memory: Record<string, unknown>): AgentContextBuilder;
  withComposition(composition: Record<string, unknown>): AgentContextBuilder;
  withAgent(agent: Record<string, unknown>): AgentContextBuilder;
  withVariables(variables: Record<string, unknown>): AgentContextBuilder;
  build(): AgentContext;
}

export function createAgentContextBuilder(execution: RuntimeExecutionContext): AgentContextBuilder {
  let taskInput: Record<string, unknown> = {};
  let memory: Record<string, unknown> = {};
  let composition: Record<string, unknown> = {};
  let agent: Record<string, unknown> = {};
  let variables: Record<string, unknown> = {};

  return {
    withTaskInput(input) { taskInput = { ...taskInput, ...input }; return this; },
    withMemory(m) { memory = { ...memory, ...m }; return this; },
    withComposition(c) { composition = { ...composition, ...c }; return this; },
    withAgent(a) { agent = { ...agent, ...a }; return this; },
    withVariables(v) { variables = { ...variables, ...v }; return this; },
    build() {
      return { taskInput, execution, memory, composition, agent, variables };
    },
  };
}
