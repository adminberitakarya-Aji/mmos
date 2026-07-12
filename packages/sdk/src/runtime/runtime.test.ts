/**
 * Unit tests for MMOS Runtime Orchestration
 * Per ADR-008: Execution is Runtime Unit
 * Per ADR-014: Event-Driven Architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createUoid } from '../domain/identity.js';
import { createWorkflow, addTask, addTransition } from '../domain/workflow.js';
import { createTask } from '../domain/task.js';
import { createExecution } from '../domain/execution.js';
import { createEvent } from '../domain/event.js';
import { InMemoryEventBus } from './event-bus.js';
import { createRuntimeContext } from './execution-context.js';
import { createExecutionResult, isSuccessfulResult } from './execution-result.js';
import { BaseOrchestrator, EngineBindings } from './orchestrator.js';
import { Task } from '../domain/task.js';
import { RuntimeExecutionContext } from './execution-context.js';

class ScriptedOrchestrator extends BaseOrchestrator {
  private handler: (task: Task) => Promise<unknown>;

  constructor(bus: InMemoryEventBus, handler: (task: Task) => Promise<unknown>) {
    super({ eventBus: bus });
    this.handler = handler;
  }

  protected async invokeTask(
    task: Task,
    _context: RuntimeExecutionContext,
    _bindings: EngineBindings
  ): Promise<unknown> {
    return this.handler(task);
  }
}

describe('InMemoryEventBus', () => {
  it('delivers events to exact-type subscribers', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];
    bus.subscribe('task.completed', ev => {
      received.push(ev.spec.type);
    });

    const ev = createEvent({
      source: createUoid('agt'),
      type: 'task.completed',
      payload: {},
    });

    await bus.publish(ev);
    expect(received).toEqual(['task.completed']);
  });

  it('supports RegExp patterns', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];
    bus.subscribe(/^task\./, ev => { received.push(ev.spec.type); });

    const ev1 = createEvent({
      source: createUoid('agt'),
      type: 'task.started',
      payload: {},
    });
    const ev2 = createEvent({
      source: createUoid('agt'),
      type: 'execution.completed',
      payload: {},
    });

    await bus.publishMany([ev1, ev2]);
    expect(received).toEqual(['task.started']);
  });

  it('unsubscribe stops delivery', () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];
    const unsub = bus.subscribe('x', () => { received.push('x'); });
    unsub();
    void bus.publish(createEvent({
      source: createUoid('agt'),
      type: 'x',
      payload: {},
    }));
    expect(received).toEqual([]);
  });
});

describe('createExecutionResult', () => {
  it('computes duration and freezes outputs', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-01T00:00:01Z');
    const result = createExecutionResult({
      execution: createUoid('exe'),
      outcome: 'completed',
      outputs: { a: 1 },
      startedAt: start,
      completedAt: end,
    });
    expect(result.durationMs).toBe(1000);
    expect(Object.isFrozen(result.outputs)).toBe(true);
    expect(isSuccessfulResult(result)).toBe(true);
  });
});

describe('createRuntimeContext', () => {
  it('starts with empty variables, completedTasks, failedTasks', () => {
    const comp = createUoid('cmp');
    const wf = createWorkflow({ composition: comp, name: 'wf', entryTask: createUoid('tsk') });
    const exec = createExecution({ composition: comp, workflow: wf.uoid, name: 'r' });
    const ctx = createRuntimeContext(exec, wf);
    expect(ctx.variables).toEqual({});
    expect(ctx.completedTasks.size).toBe(0);
    expect(ctx.failedTasks.size).toBe(0);
    expect(ctx.cancelled).toBe(false);
  });
});

describe('BaseOrchestrator (linear workflow)', () => {
  it('runs tasks in order and emits events', async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    bus.subscribe(/^task\./, ev => { seen.push(ev.spec.type); });
    bus.subscribe(/^execution\./, ev => { seen.push(ev.spec.type); });

    const comp = createUoid('cmp');
    const wfUoid = createUoid('wfl');
    // Use explicit Uoids so the workflow entry task and the actual Task share identity
    const tA = createUoid('tsk');
    const tB = createUoid('tsk');

    let wf = createWorkflow({ composition: comp, name: 'wf', entryTask: tA });
    wf = addTask(wf, tA);
    wf = addTask(wf, tB);
    wf = addTransition(wf, { from: tA, to: tB });

    // Bind tasks to the workflow by their Uoids
    const taskA = createTask({ uoid: tA, workflow: wfUoid, agent: createUoid('agt'), capability: createUoid('cap'), name: 'A' });
    const taskB = createTask({ uoid: tB, workflow: wfUoid, agent: createUoid('agt'), capability: createUoid('cap'), name: 'B' });
    const exec = createExecution({ composition: comp, workflow: wf.uoid, name: 'run-1' });

    const calls: string[] = [];
    const orch = new ScriptedOrchestrator(bus, async t => {
      calls.push(t.name);
      return { task: t.name, ok: true };
    });

    const result = await orch.execute(exec, wf, [taskA, taskB]);
    expect(calls).toEqual(['A', 'B']);
    expect(result.outcome).toBe('completed');
    expect(result.outputs).toEqual({ A: { task: 'A', ok: true }, B: { task: 'B', ok: true } });
    expect(seen).toEqual([
      'execution.started',
      'task.started',
      'task.completed',
      'task.started',
      'task.completed',
      'execution.completed',
    ]);
  });

  it('marks execution failed and emits failure event on task error', async () => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];
    bus.subscribe(/^execution\./, ev => { seen.push(ev.spec.type); });
    bus.subscribe('task.failed', ev => { seen.push(ev.spec.type); });

    const comp = createUoid('cmp');
    const tA = createUoid('tsk');
    const wfUoid = createUoid('wfl');
    let wf = createWorkflow({ composition: comp, name: 'wf', entryTask: tA });
    wf = addTask(wf, tA);
    const taskA = createTask({ uoid: tA, workflow: wfUoid, agent: createUoid('agt'), capability: createUoid('cap'), name: 'A' });
    const exec = createExecution({ composition: comp, workflow: wf.uoid, name: 'r' });

    const orch = new ScriptedOrchestrator(bus, async () => {
      throw new Error('kapow');
    });

    const result = await orch.execute(exec, wf, [taskA]);
    expect(result.outcome).toBe('failed');
    expect(result.error?.message).toBe('kapow');
    expect(seen).toContain('task.failed');
    expect(seen).toContain('execution.failed');
  });

  it('cancels a running execution', async () => {
    const bus = new InMemoryEventBus();
    const comp = createUoid('cmp');
    const tA = createUoid('tsk');
    const wfUoid = createUoid('wfl');
    let wf = createWorkflow({ composition: comp, name: 'wf', entryTask: tA });
    wf = addTask(wf, tA);
    const taskA = createTask({ uoid: tA, workflow: wfUoid, agent: createUoid('agt'), capability: createUoid('cap'), name: 'A' });
    const exec = createExecution({ composition: comp, workflow: wf.uoid, name: 'r' });

    const orch = new ScriptedOrchestrator(bus, async () => {
      await orch.cancel(exec);
      return { ok: true };
    });

    const result = await orch.execute(exec, wf, [taskA]);
    expect(result.outcome).toBe('cancelled');
  });
});
