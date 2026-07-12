/**
 * MMOS ExecutionLoop Tests
 * Per docs/reference/runtime/execution-loop.md
 */

import { describe, it, expect } from 'vitest';
import { canTransitionExecution, isTerminal, assertExecutionTransition } from './execution-state-machine.js';
import { RetryHandler } from './retry-handler.js';
import { createCancellationHandler } from './cancellation-handler.js';
import { createResultCollector } from './result-collector.js';
import { createTaskDispatcher } from './task-dispatcher.js';

describe('ExecutionLoop components', () => {
  it('enforces valid execution state transitions', () => {
    expect(canTransitionExecution('created', 'initialized')).toBe(true);
    expect(canTransitionExecution('running', 'waiting')).toBe(true);
    expect(canTransitionExecution('completed', 'running')).toBe(false);
    expect(() => assertExecutionTransition('completed', 'running')).toThrow();
  });

  it('identifies terminal states', () => {
    expect(isTerminal('completed')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('running')).toBe(false);
  });

  it('RetryHandler applies exponential backoff', () => {
    const h = new RetryHandler({ maxAttempts: 3, delayMs: 100, backoffMultiplier: 2 });
    expect(h.decide(1, new Error('boom')).shouldRetry).toBe(true);
    expect(h.decide(2, new Error('boom')).delayMs).toBe(200);
    expect(h.decide(3, new Error('boom')).shouldRetry).toBe(false);
  });

  it('RetryHandler respects retryOn filter', () => {
    const h = new RetryHandler({ maxAttempts: 3, delayMs: 100, retryOn: ['transient'] });
    expect(h.decide(1, new Error('transient network')).shouldRetry).toBe(true);
    expect(h.decide(1, new Error('fatal')).shouldRetry).toBe(false);
  });

  it('CancellationHandler toggles cancelled state', () => {
    const h = createCancellationHandler();
    const e = { uoid: { toString: () => 'e1' } } as any;
    expect(h.isCancelled(e)).toBe(false);
    h.cancel(e, 'running');
    expect(h.isCancelled(e)).toBe(true);
  });

  it('ResultCollector validates and normalizes', () => {
    const c = createResultCollector();
    const dispatch = {
      executionUoid: { toString: () => 'e' } as any,
      taskUoid: { toString: () => 't' } as any,
      success: true,
      output: { value: 42 },
      event: {} as any,
    };
    const result = c.collect({ uoid: { toString: () => 'e' } } as any, dispatch);
    expect(result.valid).toBe(true);
    expect(result.normalized).toEqual({ value: 42 });
  });

  it('TaskDispatcher dispatches and wraps result', async () => {
    const orchestrator = {} as any;
    const d = createTaskDispatcher(orchestrator);
    const result = await d.dispatch(
      { uoid: { toString: () => 'e' } } as any,
      { uoid: { toString: () => 't' } } as any
    );
    expect(result.success).toBe(true);
    expect(result.event.type).toBe('task.completed');
  });
});
