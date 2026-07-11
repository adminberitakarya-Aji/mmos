/**
 * Unit tests for MMOS Domain create functions
 * Per IMS-100: Universal Object Model
 */

import { describe, it, expect } from 'vitest';
import { createUoid } from './identity.js';
import { createAgent, addCapability, addMemory, withPolicies } from './agent.js';
import { createWorkflow, addTask, addTransition, getNextTasks } from './workflow.js';
import { createTask } from './task.js';
import { createRuntime } from './runtime.js';
import { createCapability } from './capability.js';
import { createMemory } from './memory.js';
import { createExecution, startExecution, completeExecution, failExecution } from './execution.js';
import { createArtifact } from './artifact.js';
import { createEvent, withCorrelation } from './event.js';

describe('createAgent', () => {
  it('creates an agent with sensible defaults', () => {
    const comp = createUoid('cmp');
    const runtime = createUoid('run');
    const agent = createAgent({ composition: comp, name: 'researcher', runtime });

    expect(agent.uoid.type).toBe('agt');
    expect(agent.name).toBe('researcher');
    expect(agent.spec.composition.equals(comp)).toBe(true);
    expect(agent.spec.runtime.equals(runtime)).toBe(true);
    expect(agent.spec.capabilities).toEqual([]);
    expect(agent.spec.memory).toEqual([]);
    expect(agent.status.phase).toBe('pending');
  });

  it('addCapability / addMemory are immutable', () => {
    const comp = createUoid('cmp');
    const runtime = createUoid('run');
    const cap = createUoid('cap');
    const mem = createUoid('mem');

    const agent = createAgent({ composition: comp, name: 'a', runtime });
    const updated = addCapability(addMemory(agent, mem), cap);

    expect(agent.spec.capabilities).toEqual([]); // original untouched
    expect(agent.spec.memory).toEqual([]);
    expect(updated.spec.capabilities).toEqual([cap]);
    expect(updated.spec.memory).toEqual([mem]);
  });

  it('withPolicies replaces policies', () => {
    const comp = createUoid('cmp');
    const runtime = createUoid('run');
    const agent = createAgent({ composition: comp, name: 'a', runtime });
    const updated = withPolicies(agent, { maxConcurrentTasks: 4, allowDelegation: true });
    expect(updated.spec.policies).toEqual({ maxConcurrentTasks: 4, allowDelegation: true });
  });
});

describe('createWorkflow / getNextTasks', () => {
  it('resolves next tasks via transitions', () => {
    const comp = createUoid('cmp');
    const tA = createUoid('tsk');
    const tB = createUoid('tsk');
    const tC = createUoid('tsk');

    let wf = createWorkflow({ composition: comp, name: 'wf', entryTask: tA });
    wf = addTransition(addTask(addTask(wf, tA), tB), { from: tA, to: tB });
    wf = addTransition(wf, { from: tA, to: tC });

    const next = getNextTasks(wf, tA);
    expect(next).toHaveLength(2);
    expect(new Set(next.map(n => n.toString()))).toEqual(new Set([tB.toString(), tC.toString()]));
  });

  it('returns empty array when task has no outgoing transitions', () => {
    const comp = createUoid('cmp');
    const tA = createUoid('tsk');
    const wf = createWorkflow({ composition: comp, name: 'wf', entryTask: tA });
    expect(getNextTasks(wf, tA)).toEqual([]);
  });
});

describe('createTask', () => {
  it('creates a task with required fields', () => {
    const wf = createUoid('wfl');
    const agt = createUoid('agt');
    const cap = createUoid('cap');
    const task = createTask({ workflow: wf, agent: agt, capability: cap, name: 't' });
    expect(task.uoid.type).toBe('tsk');
    expect(task.spec.workflow.equals(wf)).toBe(true);
    expect(task.spec.agent.equals(agt)).toBe(true);
    expect(task.spec.capability.equals(cap)).toBe(true);
  });
});

describe('createRuntime / createCapability / createMemory', () => {
  it('createRuntime', () => {
    const r = createRuntime({
      composition: createUoid('cmp'),
      name: 'openai-runtime',
      provider: { type: 'openai', model: 'gpt-4o' },
    });
    expect(r.uoid.type).toBe('run');
    expect(r.spec.provider.model).toBe('gpt-4o');
  });

  it('createCapability', () => {
    const c = createCapability({
      composition: createUoid('cmp'),
      name: 'web.search',
      category: 'search',
      provider: 'tavily',
    });
    expect(c.uoid.type).toBe('cap');
    expect(c.spec.category).toBe('search');
  });

  it('createMemory', () => {
    const m = createMemory({
      composition: createUoid('cmp'),
      name: 'short-term',
      backend: 'in-memory',
    });
    expect(m.uoid.type).toBe('mem');
    expect(m.spec.backend).toBe('in-memory');
  });
});

describe('createExecution lifecycle', () => {
  it('transitions pending → active → completed', () => {
    const comp = createUoid('cmp');
    const wf = createUoid('wfl');
    let exec = createExecution({ composition: comp, workflow: wf, name: 'run-1' });
    expect(exec.status.phase).toBe('pending');

    exec = startExecution(exec);
    expect(exec.status.phase).toBe('active');
    expect(exec.status.startedAt).toBeInstanceOf(Date);

    exec = completeExecution(exec, 'done');
    expect(exec.status.phase).toBe('completed');
    expect(exec.status.completedAt).toBeInstanceOf(Date);
  });

  it('transitions to failed with error', () => {
    const comp = createUoid('cmp');
    const wf = createUoid('wfl');
    const exec = startExecution(createExecution({ composition: comp, workflow: wf, name: 'r' }));
    const failed = failExecution(exec, 'kapow', new Error('boom'));
    expect(failed.status.phase).toBe('failed');
    expect(failed.status.error?.message).toBe('boom');
  });
});

describe('createArtifact / createEvent', () => {
  it('createArtifact', () => {
    const exec = createUoid('exe');
    const a = createArtifact({
      execution: exec,
      name: 'report.pdf',
      type: 'document',
      mimeType: 'application/pdf',
      storage: { backend: 's3', path: 'reports/report.pdf' },
    });
    expect(a.uoid.type).toBe('art');
    expect(a.spec.type).toBe('document');
  });

  it('createEvent and withCorrelation are immutable', () => {
    const src = createUoid('agt');
    const corr = createUoid('exe');
    const ev = createEvent({ source: src, type: 'task.completed', payload: { foo: 1 } });
    expect(ev.spec.type).toBe('task.completed');
    expect(ev.spec.correlationId).toBeUndefined();

    const ev2 = withCorrelation(ev, corr);
    expect(ev.spec.correlationId).toBeUndefined(); // original unchanged
    expect(ev2.spec.correlationId?.equals(corr)).toBe(true);
  });
});
