/**
 * MMOS ResultEvaluator - Quality Check → Accepted?
 * Per docs/reference/runtime/agent-loop.md (Result Evaluation)
 */

export type QualityCheck = (output: unknown) => boolean;

export interface EvaluationResult {
  readonly accepted: boolean;
  readonly reason?: string;
}

export interface ResultEvaluator {
  evaluate(output: unknown): EvaluationResult;
}

export function createResultEvaluator(check: QualityCheck = () => true): ResultEvaluator {
  return {
    evaluate(output) {
      const ok = check(output);
      return ok
        ? { accepted: true }
        : { accepted: false, reason: 'Quality check failed' };
    },
  };
}
