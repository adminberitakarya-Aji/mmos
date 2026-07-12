/**
 * MMOS RetryHandler - Applies RetryPolicy on task failure
 * Per docs/reference/runtime/execution-loop.md (Retry Flow)
 *
 *   Task Failed → RetryPolicy → Retry? → Execute Again | Execution Failed
 */

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly backoffMultiplier?: number;
  readonly retryOn?: readonly string[];
}

export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly nextAttempt: number;
  readonly delayMs: number;
}

export class RetryHandler {
  constructor(private readonly policy: RetryPolicy) {}

  decide(attempt: number, error: Error): RetryDecision {
    if (attempt >= this.policy.maxAttempts) {
      return { shouldRetry: false, nextAttempt: attempt, delayMs: 0 };
    }
    const retryOn = this.policy.retryOn ?? [];
    if (retryOn.length > 0) {
      const matches = retryOn.some(pattern => error.message.includes(pattern));
      if (!matches) {
        return { shouldRetry: false, nextAttempt: attempt, delayMs: 0 };
      }
    }
    const multiplier = this.policy.backoffMultiplier ?? 2;
    const delay = this.policy.delayMs * Math.pow(multiplier, attempt - 1);
    return { shouldRetry: true, nextAttempt: attempt + 1, delayMs: delay };
  }
}

export function createRetryHandler(policy: RetryPolicy): RetryHandler {
  return new RetryHandler(policy);
}
