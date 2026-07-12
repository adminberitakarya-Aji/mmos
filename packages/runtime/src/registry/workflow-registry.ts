/**
 * MMOS WorkflowRegistry - Registry for Workflows
 * Manages workflow registration and lookup
 */

import type { Uoid } from '@mmos/sdk';
import type { Workflow, Task } from '@mmos/sdk';
import { createWorkflow, addTask, addTransition, createTask, createUoid } from '@mmos/sdk';

export interface RegisteredWorkflow {
  readonly workflow: Workflow;
  readonly tasks: Map<string, Task>;
}

export interface WorkflowRegistryOptions {
  readonly name?: string;
}

export class WorkflowRegistry {
  readonly name: string;
  
  private readonly workflows: Map<string, RegisteredWorkflow> = new Map();

  constructor(options: WorkflowRegistryOptions = {}) {
    this.name = options.name ?? 'WorkflowRegistry';
  }

  /**
   * Register a simple workflow with tasks and transitions
   */
  register(
    name: string,
    description?: string,
    entryTaskName?: string
  ): { workflow: Workflow; tasks: Map<string, Task> } {
    const composition = createUoid('cmp');
    const workflowUoid = createUoid('wfl');
    
    // Create initial workflow (name is required but stored in metadata)
    let workflow = createWorkflow({
      composition,
      name: name || 'workflow',
      tasks: [],
    });
    
    const tasks = new Map<string, Task>();
    
    // Update workflow uoid
    workflow = {
      ...workflow,
      uoid: workflowUoid,
    };
    
    this.workflows.set(workflowUoid.toString(), { workflow, tasks });
    
    return { workflow, tasks };
  }

  /**
   * Register a workflow with full task configuration
   */
  registerWithTasks(
    name: string,
    tasks: readonly { name: string; agent: Uoid; capability: Uoid; input?: Record<string, unknown> }[],
    transitions: readonly { from: string; to: string; condition?: string }[],
    entryTaskName?: string
  ): { workflow: Workflow; tasks: Map<string, Task> } {
    const composition = createUoid('cmp');
    const workflowUoid = createUoid('wfl');
    
    // Create tasks map
    const tasksMap = new Map<string, Task>();
    
    // Create all tasks
    for (const taskDef of tasks) {
      const taskUoid = createUoid('tsk');
      const task = createTask({
        workflow: workflowUoid,
        agent: taskDef.agent,
        capability: taskDef.capability,
        name: taskDef.name,
        input: taskDef.input,
      });
      tasksMap.set(taskDef.name, task);
    }
    
    // Create workflow with tasks
    let workflow = createWorkflow({
      composition,
      name,
    });
    
    // Add all tasks
    for (const task of tasksMap.values()) {
      workflow = addTask(workflow, task.uoid);
    }
    
    // Add all transitions
    for (const trans of transitions) {
      const fromTask = tasksMap.get(trans.from);
      const toTask = tasksMap.get(trans.to);
      
      if (fromTask && toTask) {
        // Create WorkflowTransition with from and to task UOIDs
        const transitionParams: { from: Uoid; to: Uoid; condition?: string } = {
          from: fromTask.uoid,
          to: toTask.uoid,
        };
        if (trans.condition) {
          transitionParams.condition = trans.condition;
        }
        workflow = addTransition(workflow, transitionParams);
      }
    }
    
    // Set entry task
    if (entryTaskName) {
      const entryTask = tasksMap.get(entryTaskName);
      if (entryTask) {
        workflow = {
          ...workflow,
          spec: {
            ...workflow.spec,
            entryTask: entryTask.uoid,
          },
        };
      }
    }
    
    // Update workflow uoid
    workflow = {
      ...workflow,
      uoid: workflowUoid,
    };
    
    this.workflows.set(workflowUoid.toString(), { workflow, tasks: tasksMap });
    
    return { workflow, tasks: tasksMap };
  }

  /**
   * Get a workflow by UOID
   */
  get(uoid: Uoid): RegisteredWorkflow | undefined {
    return this.workflows.get(uoid.toString());
  }

  /**
   * Get all workflows
   */
  getAll(): readonly RegisteredWorkflow[] {
    return [...this.workflows.values()];
  }

  /**
   * Find workflow by name
   */
  findByName(name: string): RegisteredWorkflow | undefined {
    for (const reg of this.workflows.values()) {
      if (reg.workflow.name === name) {
        return reg;
      }
    }
    return undefined;
  }

  /**
   * Get tasks for a workflow
   */
  getTasks(uoid: Uoid): Map<string, Task> | undefined {
    const reg = this.workflows.get(uoid.toString());
    return reg?.tasks;
  }

  /**
   * Check if a workflow is registered
   */
  has(uoid: Uoid): boolean {
    return this.workflows.has(uoid.toString());
  }

  /**
   * Unregister a workflow
   */
  unregister(uoid: Uoid): boolean {
    return this.workflows.delete(uoid.toString());
  }

  /**
   * Clear all registered workflows
   */
  clear(): void {
    this.workflows.clear();
  }

  /**
   * Get total count of registered workflows
   */
  get size(): number {
    return this.workflows.size;
  }
}

/**
 * Create a global workflow registry singleton
 */
let globalRegistry: WorkflowRegistry | null = null;

export function getWorkflowRegistry(): WorkflowRegistry {
  if (!globalRegistry) {
    globalRegistry = new WorkflowRegistry();
  }
  return globalRegistry;
}

export function resetWorkflowRegistry(): void {
  globalRegistry = null;
}