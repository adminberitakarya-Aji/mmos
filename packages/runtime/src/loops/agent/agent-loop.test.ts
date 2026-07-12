/**
 * MMOS AgentLoop Tests
 * Per docs/reference/runtime/agent-loop.md
 */

import { describe, it, expect } from 'vitest';
import { createAgentContextBuilder } from './context-builder.js';
import { analyzeObjective } from './objective-analyzer.js';
import { createReasoner } from './reasoner.js';
import { selectCapability, matchesContract } from './capability-selector.js';
import { createResultEvaluator } from './result-evaluator.js';
import { createOutputGenerator } from './output-generator.js';
import { constantApprover, createHumanInTheLoop } from './human-in-loop.js';
import { createAgentLoop } from './agent-loop.js';

describe('AgentLoop components', () => {
  it('builds agent context', () => {
    const b = createAgentContextBuilder({
      execution: {} as any,
      workflow: {} as any,
      variables: {},
      taskOutputs: new Map(),
      artifacts: new Map(),
      events: [],
      completedTasks: new Set(),
      failedTasks: new Set(),
      cancelled: false,
    });
    const ctx = b
      .withTaskInput({ foo: 'bar' })
      .withMemory({ x: 1 })
      .withVariables({ y: 2 })
      .build();
    expect(ctx.taskInput).toEqual({ foo: 'bar' });
    expect(ctx.memory).toEqual({ x: 1 });
    expect(ctx.variables).toEqual({ y: 2 });
  });

  it('analyzes objective', () => {
    const a = analyzeObjective('We must ensure quality. We need to deliver.');
    expect(a.objective).toContain('We must');
    expect(a.constraints.length).toBeGreaterThan(0);
    expect(a.requirements.length).toBeGreaterThan(0);
  });

  it('reasoner chooses invoke_capability when requirements exist', () => {
    const r = createReasoner();
    const plan = r.reason(
      {} as any,
      { objective: 'x', constraints: [], requirements: ['do x'], executionPlan: [] },
      0
    );
    expect(plan.decision).toBe('invoke_capability');
  });

  it('reasoner returns fail when max iterations reached', () => {
    const r = createReasoner();
    const plan = r.reason(
      {} as any,
      { objective: 'x', constraints: [], requirements: ['do x'], executionPlan: [] },
      99
    );
    expect(plan.decision).toBe('fail');
  });

  it('capability selector picks by contract', () => {
    const uoid = { toString: () => 'cap_1', equals: (o: { toString(): string }) => o.toString() === 'cap_1' } as any;
    const t = { uoid: { toString: () => 't' }, spec: { capability: uoid } } as any;
    const cap = { uoid, name: 'x' } as any;
    const resolver = () => cap;
    expect(selectCapability(t, resolver)).toBe(cap);
    expect(matchesContract(cap, t)).toBe(true);
  });

  it('result evaluator accepts and rejects', () => {
    const e1 = createResultEvaluator(() => true);
    expect(e1.evaluate(42).accepted).toBe(true);
    const e2 = createResultEvaluator(() => false);
    expect(e2.evaluate(42).accepted).toBe(false);
  });

  it('output generator creates artifact', () => {
    const g = createOutputGenerator();
    const a = g.generate({ hello: 'world' }, 'test');
    expect(a.name).toBe('test');
  });

  it('human-in-the-loop returns approval', async () => {
    const h = createHumanInTheLoop(constantApprover({ approved: true }));
    const d = await h.request(
      { uoid: { toString: () => 't' } } as any,
      { executionUoid: { toString: () => 'e' } as any }
    );
    expect(d.approved).toBe(true);
  });

  it('agent loop runs and produces output', async () => {
    const loop = createAgentLoop({
      orchestrator: {} as any,
    });
    const task = {
      uoid: { toString: () => 't1' },
      name: 'noop',
      spec: { input: { objective: 'do something simple' } },
    } as any;
    const execution = { uoid: { toString: () => 'e1' } } as any;
    const result = await loop.run(task, execution);
    expect(result.iterations).toBeGreaterThan(0);
  });
});
