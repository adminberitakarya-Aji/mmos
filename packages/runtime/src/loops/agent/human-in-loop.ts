/**
 * MMOS HumanInTheLoop - Human Approval Required → Wait → Approved? → Continue / Cancelled
 * Per docs/reference/runtime/agent-loop.md (Human-in-the-Loop)
 * Per ADR-015: Human-in-the-Loop
 */

import type { Task, Uoid } from '@mmos/sdk';

export interface HumanDecision {
  readonly approved: boolean;
  readonly output?: Record<string, unknown>;
  readonly comment?: string;
}

export type HumanApprovalFn = (task: Task, context: { executionUoid: Uoid }) => Promise<HumanDecision>;

export interface HumanInTheLoop {
  request(task: Task, context: { executionUoid: Uoid }): Promise<HumanDecision>;
}

export function createHumanInTheLoop(approver: HumanApprovalFn): HumanInTheLoop {
  return {
    async request(task, context) {
      return approver(task, context);
    },
  };
}

/** Convenience: build a synchronous approver from a constant decision */
export function constantApprover(decision: HumanDecision): HumanApprovalFn {
  return async () => decision;
}
