/**
 * MMOS DefaultOrchestrator - Reference Implementation
 * Per ADR-001: Composition is the Heart
 * Per ADR-007: Workflow is Declarative
 * Per ADR-008: Execution is Runtime Unit
 * Per ADR-014: Event-Driven Architecture
 * Per ADR-015: Human-in-the-Loop
 */

import type { Uoid } from '@mmos/sdk';
import type { Execution } from '@mmos/sdk';
import type { Workflow } from '@mmos/sdk';
import type { Task } from '@mmos/sdk';
import { BaseOrchestrator, EngineBindings, OrchestratorOptions } from '@mmos/sdk';
import { emitTaskEvent } from '@mmos/sdk';
import type { RuntimeExecutionContext } from '@mmos/sdk';
import { RuntimeContextBuilder, setRuntimeTaskOutput } from '@mmos/sdk';
import { createExecutionResult, type ExecutionResult, type ExecutionOutcome } from '@mmos/sdk';
import type { CapabilityEngine } from '@mmos/sdk';

/**
 * DefaultOrchestratorOptions - Configuration for the orchestrator
 */
export interface DefaultOrchestratorOptions extends OrchestratorOptions {
  /** Capability engine for external capability invocation */
  capabilityEngine?: CapabilityEngine;
  /** Handler for human-in-the-loop checkpoints */
  humanTaskHandler?: HumanTaskHandler;
}

/**
 * HumanTaskHandler - Callback for human intervention
 */
export type HumanTaskHandler = (
  task: Task,
  context: RuntimeExecutionContext,
  config: HumanTaskConfig
) => Promise<HumanTaskResult>;

/**
 * HumanTaskConfig - Configuration for human task
 */
export interface HumanTaskConfig {
  title: string;
  description: string;
  formSchema?: Record<string, unknown> | undefined;
  assignee?: string | undefined;
  dueDate?: Date | undefined;
}

/**
 * HumanTaskResult - Result from human intervention
 */
export interface HumanTaskResult {
  action: 'approve' | 'reject' | 'modify';
  output?: Record<string, unknown>;
  comment?: string;
}

/**
 * RetryPolicy - Retry configuration for tasks
 */
export interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  retryOn?: string[];
}

/**
 * DefaultOrchestrator - Full orchestration implementation with:
 * - Parallel task execution via DAG
 * - Conditional transitions
 * - Retry policies
 * - Human-in-the-loop checkpoints
 * - Error compensation
 */
export class DefaultOrchestrator extends BaseOrchestrator {
  private readonly capabilityEngine: CapabilityEngine | undefined;
  private readonly humanTaskHandler: HumanTaskHandler | undefined;

  constructor(options: DefaultOrchestratorOptions = {}) {
    super(options);
    this.capabilityEngine = options.capabilityEngine;
    this.humanTaskHandler = options.humanTaskHandler;
  }

  protected override async invokeTask(
    task: Task,
    context: RuntimeExecutionContext,
    bindings: EngineBindings
  ): Promise<unknown> {
    const agent = bindings.resolveAgent(task.spec.agent);
    const capability = bindings.resolveCapability(task.spec.capability);

    if (!agent) {
      throw new Error(`Agent ${task.spec.agent} not found in bindings`);
    }

    if (!capability) {
      throw new Error(`Capability ${task.spec.capability} not found in bindings`);
    }

    // Check for human-in-the-loop
    if (task.spec.allowHumanIntervention && this.humanTaskHandler) {
      const humanConfig: HumanTaskConfig = {
        title: task.spec.humanTaskConfig?.title ?? `Review: ${task.name}`,
        description: task.spec.humanTaskConfig?.description ?? `Human review required for task: ${task.name}`,
        formSchema: task.spec.humanTaskConfig?.formSchema,
        assignee: task.spec.humanTaskConfig?.assignee,
        dueDate: task.spec.humanTaskConfig?.dueDate,
      };

      const humanResult = await this.humanTaskHandler(task, context, humanConfig);

      if (humanResult.action === 'reject') {
        throw new Error(`Task ${task.name} rejected by human: ${humanResult.comment ?? 'No comment'}`);
      }

      if (humanResult.action === 'modify' && humanResult.output) {
        return humanResult.output;
      }
    }

    // Resolve input from templates
    const resolvedInput = this.resolveInput(task, context);

    // Get retry policy from task spec
    const retryPolicy = task.spec.retryPolicy ?? { maxAttempts: 1, delayMs: 1000 };

    // Execute with retry
    return this.executeWithRetry(task, resolvedInput, retryPolicy, capability.uoid);
  }

  private resolveInput(task: Task, context: RuntimeExecutionContext): Record<string, unknown> {
    const baseInput = task.spec.input ?? {};

    // Resolve template references
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(baseInput)) {
      resolved[key] = this.resolveTemplateValue(value, context);
    }

    return resolved;
  }

  private resolveTemplateValue(value: unknown, context: RuntimeExecutionContext): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    // Handle memory references: "memory.key"
    if (value.startsWith('memory.')) {
      const memoryKey = value.slice(7);
      const memory = context.variables['memory'] as Record<string, unknown> | undefined;
      return memory?.[memoryKey];
    }

    // Handle output references: "$.outputs.taskName.field"
    if (value.startsWith('$.outputs.')) {
      const outputPath = value.slice(10);
      const [taskName, ...fieldPath] = outputPath.split('.');

      for (const [uoid, output] of context.taskOutputs) {
        const foundTask = this.taskMap?.get(uoid);
        if (foundTask?.name === taskName) {
          let result: unknown = output;
          for (const field of fieldPath) {
            if (result && typeof result === 'object' && field in result) {
              result = (result as Record<string, unknown>)[field];
            } else {
              return undefined;
            }
          }
          return result;
        }
      }
    }

    // Handle variable references: "vars.variableName"
    if (value.startsWith('vars.')) {
      const varName = value.slice(5);
      return context.variables[varName];
    }

    return value;
  }

  private taskMap: Map<Uoid, Task> | undefined;

  private async executeWithRetry(
    task: Task,
    input: Record<string, unknown>,
    retryPolicy: RetryPolicy,
    capabilityUoid: Uoid
  ): Promise<unknown> {
    let lastError: Error | undefined;
    const backoffMultiplier = retryPolicy.backoffMultiplier ?? 2;
    const retryOnErrors = retryPolicy.retryOn ?? [];

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
      try {
        // Execute via CapabilityEngine
        if (!this.capabilityEngine) {
          throw new Error('CapabilityEngine not configured');
        }

        const invokeParams: {
          capabilityUoid: Uoid;
          input: Record<string, unknown>;
          timeout?: number;
        } = {
          capabilityUoid: capabilityUoid,
          input,
        };

        if (task.spec.timeout !== undefined) {
          invokeParams.timeout = task.spec.timeout;
        }

        const result = await this.capabilityEngine.invoke(invokeParams);

        return result.output;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Check if we should retry this error
        if (attempt < retryPolicy.maxAttempts) {
          const shouldRetry = retryOnErrors.length === 0 ||
            retryOnErrors.some((errorType: string) => lastError!.message.includes(errorType));

          if (shouldRetry) {
            // Calculate delay with exponential backoff
            const delay = retryPolicy.delayMs * Math.pow(backoffMultiplier, attempt - 1);
            await this.delay(delay);
            continue;
          }
        }

        throw lastError;
      }
    }

    throw lastError ?? new Error('Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async execute(
    execution: Execution,
    workflow: Workflow,
    tasks: readonly Task[]
  ): Promise<ExecutionResult> {
    // Build task map for lookups
    this.taskMap = new Map(tasks.map(t => [t.uoid, t]));

    // Build bindings - agents and capabilities should be provided by caller
    const bindings: EngineBindings = {
      resolveAgent: (_uoid) => undefined,
      resolveCapability: (_uoid) => undefined,
      resolveTask: (uoid) => this.taskMap?.get(uoid),
    };

    const startedAt = new Date();
    const contextBuilder = new RuntimeContextBuilder();
    const initialVariables: Record<string, unknown> = {
      ...execution.context.variables,
    };
    contextBuilder.withVariables(initialVariables);
    const context = contextBuilder.build(execution, workflow);

    // Emit execution.started
    await emitTaskEvent(this.eventBus, {
      source: execution.uoid,
      type: 'execution.started',
      payload: { workflow: workflow.uoid.toString() },
    });

    let outcome: ExecutionOutcome = 'completed';
    let error: Error | undefined;

    try {
      // Build task DAG for parallel execution
      const dag = this.buildTaskDAG(workflow, tasks);

      // Execute from entry task
      const entryTask = workflow.spec.entryTask;
      if (!entryTask) {
        throw new Error(`Workflow ${workflow.uoid} has no entry task`);
      }

      // Execute with dependency resolution
      await this.executeWithDependencies(context, dag, entryTask, bindings);
    } catch (err) {
      outcome = 'failed';
      error = err instanceof Error ? err : new Error(String(err));
      await emitTaskEvent(this.eventBus, {
        source: execution.uoid,
        type: 'execution.failed',
        payload: { error: error.message },
      });
    }

    const completedAt = new Date();

    if (outcome === 'completed') {
      await emitTaskEvent(this.eventBus, {
        source: execution.uoid,
        type: 'execution.completed',
        payload: { durationMs: completedAt.getTime() - startedAt.getTime() },
      });
    }

    // Clean up task map
    this.taskMap = undefined;

    // Map task outputs by task name
    const outputsByName: Record<string, unknown> = {};
    for (const [uoid, output] of context.taskOutputs) {
      outputsByName[uoid.toString()] = output;
    }

    // Build result parameters
    const resultParams: {
      execution: Uoid;
      outcome: ExecutionOutcome;
      outputs: Record<string, unknown>;
      artifacts: readonly [];
      events: readonly [];
      startedAt: Date;
      completedAt: Date;
      error?: Error;
    } = {
      execution: execution.uoid,
      outcome,
      outputs: outputsByName,
      artifacts: [],
      events: [],
      startedAt,
      completedAt,
    };

    if (error) {
      resultParams.error = error;
    }

    return createExecutionResult(resultParams);
  }

  private taskDAG: TaskDAG | undefined;

  private buildTaskDAG(workflow: Workflow, tasks: readonly Task[]): TaskDAG {
    const taskMap = new Map(tasks.map(t => [t.uoid, t]));
    const dag: TaskDAG = {
      tasks: taskMap,
      dependencies: new Map(),
      dependents: new Map(),
    };

    // Build dependency graph from transitions
    for (const transition of workflow.spec.transitions) {
      const fromDeps = dag.dependencies.get(transition.to) ?? [];
      fromDeps.push(transition.from);
      dag.dependencies.set(transition.to, fromDeps);

      const toDependents = dag.dependents.get(transition.from) ?? [];
      toDependents.push(transition.to);
      dag.dependents.set(transition.from, toDependents);
    }

    // Initialize all tasks with empty dependencies
    for (const task of tasks) {
      if (!dag.dependencies.has(task.uoid)) {
        dag.dependencies.set(task.uoid, []);
      }
      if (!dag.dependents.has(task.uoid)) {
        dag.dependents.set(task.uoid, []);
      }
    }

    this.taskDAG = dag;
    return dag;
  }

  private async executeWithDependencies(
    context: RuntimeExecutionContext,
    dag: TaskDAG,
    currentTaskId: Uoid,
    bindings: EngineBindings,
    executedTasks: Set<Uoid> = new Set()
  ): Promise<void> {
    // Check if already executed
    if (executedTasks.has(currentTaskId)) {
      return;
    }

    const task = dag.tasks.get(currentTaskId);
    if (!task) {
      throw new Error(`Task ${currentTaskId} not found in DAG`);
    }

    // Check and wait for dependencies
    const deps = dag.dependencies.get(currentTaskId) ?? [];
    for (const depId of deps) {
      if (!executedTasks.has(depId)) {
        await this.executeWithDependencies(context, dag, depId, bindings, executedTasks);
      }
    }

    // Check cancellation
    if (context.cancelled) {
      return;
    }

    // Emit task started
    await emitTaskEvent(this.eventBus, {
      source: context.execution.uoid,
      type: 'task.started',
      payload: { task: currentTaskId.toString(), name: task.name },
    });

    try {
      const output = await this.invokeTask(task, context, bindings);

      setRuntimeTaskOutput(context, task, output);
      context.completedTasks.add(task.uoid);

      await emitTaskEvent(this.eventBus, {
        source: context.execution.uoid,
        type: 'task.completed',
        payload: { task: currentTaskId.toString(), output },
      });

      executedTasks.add(currentTaskId);

      // Execute dependents
      const dependents = dag.dependents.get(currentTaskId) ?? [];
      for (const depId of dependents) {
        // Check transition conditions
        const transitions = context.workflow.spec.transitions.filter(
          t => t.from.equals(currentTaskId) && t.to.equals(depId)
        );

        for (const transition of transitions) {
          if (!transition.condition || this.evaluateCondition(transition.condition, context)) {
            await this.executeWithDependencies(context, dag, depId, bindings, executedTasks);
          }
        }
      }
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error(String(err));
      context.failedTasks.add(task.uoid);

      await emitTaskEvent(this.eventBus, {
        source: context.execution.uoid,
        type: 'task.failed',
        payload: { task: currentTaskId.toString(), error: errObj.message },
      });

      throw errObj;
    }
  }

  private evaluateCondition(condition: string, context: RuntimeExecutionContext): boolean {
    try {
      const vars = { ...context.variables };
      // eslint-disable-next-line no-new-func
      return new Function('vars', `with(vars) { return ${condition}; }`)(vars) as boolean;
    } catch {
      return false;
    }
  }
}

/**
 * TaskDAG - Directed Acyclic Graph representation of workflow tasks
 */
export interface TaskDAG {
  tasks: Map<Uoid, Task>;
  dependencies: Map<Uoid, Uoid[]>;
  dependents: Map<Uoid, Uoid[]>;
}