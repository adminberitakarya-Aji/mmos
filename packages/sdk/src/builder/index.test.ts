/**
 * Unit tests for MMOS Builder fluent API
 * Per IMS-100: Universal Object Model
 */

import { describe, it, expect } from 'vitest';
import { createUoid } from '../domain/identity.js';
import { createRuntime } from '../domain/runtime.js';
import {
  CompositionBuilder,
  WorkflowBuilder,
  TaskBuilder,
  AgentBuilder,
  ExecutionBuilder,
  RuntimeBuilder,
  CapabilityBuilder,
  MemoryBuilder,
} from './index.js';

describe('CompositionBuilder', () => {
  const project = createUoid('prj');
  const workspace = createUoid('wsp');

  it('builds a composition with sensible defaults', () => {
    const composition = new CompositionBuilder()
      .withProject(project)
      .withWorkspace(workspace)
      .withName('hello-world')
      .withVersion('0.1.0')
      .withDescription('A minimal composition')
      .build();

    expect(composition.uoid.type).toBe('cmp');
    expect(composition.name).toBe('hello-world');
    expect(composition.version).toBe('0.1.0');
    expect(composition.spec.workflows).toEqual([]);
    expect(composition.spec.agents).toEqual([]);
    expect(composition.spec.capabilities).toEqual([]);
  });

  it('addWorkflow / addAgent / addCapability / addMemory collect items', () => {
    const wf = createUoid('wfl');
    const agt = createUoid('agt');
    const cap = createUoid('cap');
    const mem = createUoid('mem');

    const composition = new CompositionBuilder()
      .withProject(project)
      .withWorkspace(workspace)
      .withName('c')
      .addWorkflow(wf)
      .addAgent(agt)
      .addCapability(cap)
      .addMemory(mem)
      .setEntryWorkflow(wf)
      .build();

    expect(composition.spec.workflows).toEqual([wf]);
    expect(composition.spec.agents).toEqual([agt]);
    expect(composition.spec.capabilities).toEqual([cap]);
    expect(composition.spec.memory).toEqual([mem]);
    expect(composition.spec.entryWorkflow?.equals(wf)).toBe(true);
  });

  it('throws when project or workspace is missing', () => {
    expect(() => new CompositionBuilder().withName('x').build()).toThrow(/Project and Workspace/);
  });

  it('throws when name is missing', () => {
    expect(() =>
      new CompositionBuilder().withProject(project).withWorkspace(workspace).build()
    ).toThrow(/name is required/);
  });
});

describe('WorkflowBuilder', () => {
  it('builds a workflow with tasks and transitions', () => {
    const comp = createUoid('cmp');
    const tA = createUoid('tsk');
    const tB = createUoid('tsk');

    const workflow = new WorkflowBuilder()
      .withComposition(comp)
      .withName('main')
      .setEntryTask(tA)
      .addTask(tA)
      .addTask(tB)
      .addTransition(tA, tB, 'on_success')
      .build();

    expect(workflow.uoid.type).toBe('wfl');
    expect(workflow.spec.entryTask?.equals(tA)).toBe(true);
    expect(workflow.spec.tasks).toHaveLength(2);
    expect(workflow.spec.transitions).toHaveLength(1);
    expect(workflow.spec.transitions[0]?.condition).toBe('on_success');
  });
});

describe('TaskBuilder', () => {
  it('builds a task binding agent and capability', () => {
    const wf = createUoid('wfl');
    const agt = createUoid('agt');
    const cap = createUoid('cap');

    const task = new TaskBuilder()
      .withWorkflow(wf)
      .withAgent(agt)
      .withCapability(cap)
      .withName('research-step')
      .withInput({ prompt: 'hi' })
      .withTimeout(30_000)
      .build();

    expect(task.uoid.type).toBe('tsk');
    expect(task.spec.agent.equals(agt)).toBe(true);
    expect(task.spec.input?.['prompt']).toBe('hi');
    expect(task.spec.timeout).toBe(30_000);
  });

  it('human-in-the-loop config drives allowHumanIntervention', () => {
    const wf = createUoid('wfl');
    const agt = createUoid('agt');
    const cap = createUoid('cap');

    const noHITL = new TaskBuilder()
      .withWorkflow(wf)
      .withAgent(agt)
      .withCapability(cap)
      .withName('a')
      .build();
    expect(noHITL.spec.allowHumanIntervention).toBe(false);

    const withHITL = new TaskBuilder()
      .withWorkflow(wf)
      .withAgent(agt)
      .withCapability(cap)
      .withName('a')
      .allowHumanIntervention({ title: 'Approve', description: 'Confirm step' })
      .build();
    expect(withHITL.spec.allowHumanIntervention).toBe(true);
    expect(withHITL.spec.humanTaskConfig?.title).toBe('Approve');
  });
});

describe('AgentBuilder', () => {
  it('builds an agent with capabilities, memory, runtime, policies', () => {
    const comp = createUoid('cmp');
    const cap = createUoid('cap');
    const mem = createUoid('mem');
    const runtime = createRuntime({ composition: comp, name: 'r', provider: { type: 'openai', model: 'gpt-4o' } });

    const agent = new AgentBuilder()
      .withComposition(comp)
      .withName('researcher')
      .withRuntime(runtime.uoid)
      .addCapability(cap)
      .addMemory(mem)
      .withPolicies({ maxConcurrentTasks: 2, allowDelegation: true })
      .build();

    expect(agent.uoid.type).toBe('agt');
    expect(agent.spec.capabilities).toEqual([cap]);
    expect(agent.spec.memory).toEqual([mem]);
    expect(agent.spec.policies?.allowDelegation).toBe(true);
  });
});

describe('ExecutionBuilder', () => {
  it('builds an execution with input and variables', () => {
    const comp = createUoid('cmp');
    const wf = createUoid('wfl');

    const execution = new ExecutionBuilder()
      .withComposition(comp)
      .withWorkflow(wf)
      .withName('run-1')
      .withInput({ prompt: 'hello' })
      .withVariables({ env: 'dev' })
      .build();

    expect(execution.uoid.type).toBe('exe');
    expect(execution.spec.input?.['prompt']).toBe('hello');
    expect(execution.spec.variables?.['env']).toBe('dev');
  });
});

describe('RuntimeBuilder / CapabilityBuilder / MemoryBuilder', () => {
  it('RuntimeBuilder with provider and limits', () => {
    const comp = createUoid('cmp');
    const r = new RuntimeBuilder()
      .withComposition(comp)
      .withName('openai-runtime')
      .withProvider({ type: 'openai', model: 'gpt-4o' })
      .withLimits({ maxTokens: 8192, timeoutMs: 60_000 })
      .build();
    expect(r.uoid.type).toBe('run');
    expect(r.spec.provider.model).toBe('gpt-4o');
    expect(r.spec.limits?.maxTokens).toBe(8192);
  });

  it('CapabilityBuilder with inputs, outputs, and auth', () => {
    const comp = createUoid('cmp');
    const c = new CapabilityBuilder()
      .withComposition(comp)
      .withName('web.search')
      .withCategory('search')
      .withProvider('tavily')
      .addInput({ name: 'query', type: 'string', required: true })
      .addOutput({ name: 'results', type: 'array' })
      .withAuth({ type: 'apiKey' })
      .build();
    expect(c.uoid.type).toBe('cap');
    expect(c.spec.inputs).toHaveLength(1);
    expect(c.spec.outputs).toHaveLength(1);
    expect(c.spec.auth?.type).toBe('apiKey');
  });

  it('MemoryBuilder with config and TTL', () => {
    const comp = createUoid('cmp');
    const m = new MemoryBuilder()
      .withComposition(comp)
      .withName('short-term')
      .withType('ephemeral')
      .withBackend('in-memory')
      .withConfig({ maxEntries: 1000 })
      .withTTL(60_000)
      .build();
    expect(m.uoid.type).toBe('mem');
    expect(m.spec.type).toBe('ephemeral');
    expect(m.spec.ttl).toBe(60_000);
    expect(m.spec.config?.['maxEntries']).toBe(1000);
  });
});
