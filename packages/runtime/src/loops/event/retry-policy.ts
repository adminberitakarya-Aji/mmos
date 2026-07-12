/**
 * MMOS RetryPolicy - Handler Failed → Retry → Dispatch Again
 * Per docs/reference/runtime/event-loop.md (Event Retry)
 */

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly backoffMultiplier?: number;
}

export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly nextAttempt: number;
  readonly delayMs: number;
}

export class EventRetryPolicy {
  constructor(private readonly policy: RetryPolicy) {}

  decide(attempt: number): RetryDecision {
    if (attempt >= this.policy.maxAttempts) {
      return { shouldRetry: false, nextAttempt: attempt, delayMs: 0 };
    }
    const multiplier = this.policy.backoffMultiplier ?? 2;
    const delay = this.policy.delayMs * Math.pow(multiplier, attempt - 1);
    return { shouldRetry: true, nextAttempt: attempt + 1, delayMs: delay };
  }
}

export function createEventRetryPolicy(policy: RetryPolicy): EventRetryPolicy {
  return new EventRetryPolicy(policy);
}
