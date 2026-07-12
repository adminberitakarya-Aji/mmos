/**
 * MMOS Reasoner - Context → Reason → Decision → Action Plan
 * Per docs/reference/runtime/agent-loop.md (Reasoning)
 *
 * Reasoning may involve several internal iterations. The reference
 * implementation is a thin wrapper: actual reasoning is delegated to a
 * RuntimeEngine. This module decides the high-level action plan.
 */

import type { AgentContext } from './context-builder.js';
import type { ObjectiveAnalysis } from './objective-analyzer.js';

export type Decision = 'invoke_capability' | 'request_human' | 'produce_output' | 'iterate' | 'fail';

export interface ActionPlan {
  readonly decision: Decision;
  readonly rationale: string;
  readonly iterations: number;
}

export interface Reasoner {
  reason(ctx: AgentContext, analysis: ObjectiveAnalysis, iteration: number): ActionPlan;
}

export function createReasoner(): Reasoner {
  return {
    reason(_ctx, analysis, iteration) {
      if (iteration >= 3) {
        return { decision: 'fail', rationale: 'Max iterations reached', iterations: iteration };
      }
      if (analysis.requirements.length === 0) {
        return { decision: 'produce_output', rationale: 'No requirements to fulfill', iterations: iteration };
      }
      return { decision: 'invoke_capability', rationale: 'Requirements present', iterations: iteration };
    },
  };
}
