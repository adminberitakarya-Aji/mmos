/**
 * MMOS AgentLoop - Internal cycle of an Agent when receiving a Task
 * Per docs/reference/runtime/agent-loop.md
 *
 *   Receive Task → Load Context → Understand Objective → Reason
 *                → Select Capability → Execute → Evaluate Result
 *                → Satisfied? ── No ──► Reason Again
 *                            └── Yes ──► Produce Output → Update Memory → Publish Event → Done
 */

import type { Task, Execution, Orchestrator, MemoryEngine, Uoid, Artifact, RuntimeExecutionContext } from '@mmos/sdk';
import { createAgentContextBuilder, type AgentContext, type AgentContextBuilder } from './context-builder.js';
import { analyzeObjective, type ObjectiveAnalysis } from './objective-analyzer.js';
import { createReasoner, type Reasoner, type ActionPlan, type Decision } from './reasoner.js';
import { selectCapability, type CapabilityResolver } from './capability-selector.js';
import { createEngineInvoker, type EngineInvoker, type InvokerResult } from './engine-invoker.js';
import { createResultEvaluator, type ResultEvaluator, type EvaluationResult } from './result-evaluator.js';
import { createOutputGenerator, type OutputGenerator } from './output-generator.js';
import { createMemoryUpdater, type MemoryUpdater } from './memory-updater.js';
import { createHumanInTheLoop, type HumanInTheLoop, type HumanDecision, type HumanApprovalFn } from './human-in-loop.js';

export interface AgentLoopOptions {
  readonly orchestrator: Orchestrator;
  readonly memoryEngine?: MemoryEngine;
  readonly resolveCapability?: CapabilityResolver;
  readonly humanApproval?: HumanApprovalFn;
  readonly maxIterations?: number;
}

export interface AgentLoopResult {
  readonly decision: Decision;
  readonly output: unknown;
  readonly artifact: Artifact | undefined;
  readonly iterations: number;
  readonly humanDecision?: HumanDecision;
}

export interface AgentLoop {
  run(task: Task, execution: Execution): Promise<AgentLoopResult>;
}

export function createAgentLoop(options: AgentLoopOptions): AgentLoop {
  const reasoner: Reasoner = createReasoner();
  const invoker: EngineInvoker = createEngineInvoker();
  const evaluator: ResultEvaluator = createResultEvaluator();
  const output: OutputGenerator = createOutputGenerator();
  const memory: MemoryUpdater = createMemoryUpdater();
  const hitl: HumanInTheLoop = createHumanInTheLoop(
    options.humanApproval ?? (async () => ({ approved: true }))
  );
  const maxIterations = options.maxIterations ?? 5;

  async function buildContext(task: Task, execution: Execution): Promise<AgentContext> {
    // Build a synthetic RuntimeExecutionContext for the agent's local view
    const execCtx = {
      execution,
      workflow: execution as unknown as RuntimeExecutionContext['workflow'],
      variables: {},
      taskOutputs: new Map<Uoid, unknown>(),
      artifacts: new Map(),
      events: [],
      completedTasks: new Set<Uoid>(),
      failedTasks: new Set<Uoid>(),
      cancelled: false,
    } satisfies RuntimeExecutionContext;
    const builder: AgentContextBuilder = createAgentContextBuilder(execCtx);
    return builder
      .withTaskInput(task.spec.input ?? {})
      .withMemory({})
      .withComposition({})
      .withAgent({})
      .withVariables({})
      .build();
  }
  async function step(
    task: Task,
    execution: Execution,
    ctx: AgentContext,
    analysis: ObjectiveAnalysis,
    iteration: number
  ): Promise<{ plan: ActionPlan; invokerResult?: InvokerResult; evaluation?: EvaluationResult }> {
    const plan = reasoner.reason(ctx, analysis, iteration);
    if (plan.decision === 'invoke_capability') {
      const capability = options.resolveCapability
        ? selectCapability(task, options.resolveCapability)
        : undefined;
      if (!capability) {
        return { plan: { ...plan, decision: 'fail' }, };
      }
      const invokerResult = await invoker.invoke(task, execution, options.orchestrator);
      const evaluation = evaluator.evaluate(invokerResult.output);
      return { plan, invokerResult, evaluation };
    }
    if (plan.decision === 'request_human') {
      const decision = await hitl.request(task, { executionUoid: execution.uoid });
      return { plan: { ...plan, decision: decision.approved ? 'produce_output' : 'fail' } };
    }
    return { plan };
  }

  return {
    async run(task, execution): Promise<AgentLoopResult> {
      const ctx = await buildContext(task, execution);
      const analysis = analyzeObjective(task.spec.input?.['objective'] as string ?? task.name);

      let iteration = 0;
      let lastInvoker: InvokerResult | undefined;
      let lastEvaluation: EvaluationResult | undefined;
      let lastPlan: ActionPlan | undefined;
      const uoid: Uoid = execution.uoid;

      while (iteration < maxIterations) {
        const result = await step(task, execution, ctx, analysis, iteration);
        lastPlan = result.plan;
        lastInvoker = result.invokerResult;
        lastEvaluation = result.evaluation;

        if (result.plan.decision === 'produce_output') {
          break;
        }
        if (result.plan.decision === 'fail') {
          break;
        }
        if (result.evaluation && result.evaluation.accepted) {
          break;
        }
        iteration++;
      }

      const decision: Decision = lastPlan?.decision ?? 'produce_output';
      const outputValue = lastInvoker?.output;
      const artifact = decision === 'produce_output' || decision === 'invoke_capability'
        ? output.generate(outputValue, `${task.name}-output`)
        : undefined;

      if (artifact && options.memoryEngine) {
        await memory.update(
          uoid,
          { key: artifact.uoid.toString(), value: outputValue, timestamp: new Date() },
          options.memoryEngine
        );
      }

      return {
        decision,
        output: outputValue,
        artifact,
        iterations: iteration + 1,
      };
    },
  };
}
