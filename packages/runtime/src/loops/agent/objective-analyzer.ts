/**
 * MMOS ObjectiveAnalyzer - Objective → Constraints → Requirements → Execution Plan
 * Per docs/reference/runtime/agent-loop.md (Objective Analysis)
 *
 * The Agent does NOT modify the Objective. It only extracts structure.
 */

export interface ObjectiveAnalysis {
  readonly objective: string;
  readonly constraints: readonly string[];
  readonly requirements: readonly string[];
  readonly executionPlan: readonly string[];
}

export function analyzeObjective(objective: string, hints?: {
  constraints?: readonly string[];
  requirements?: readonly string[];
}): ObjectiveAnalysis {
  const constraints = hints?.constraints ?? extractSentences(objective, /must|should|require/i);
  const requirements = hints?.requirements ?? extractSentences(objective, /need|want|expect/i);
  const executionPlan = [
    'Parse input context',
    'Identify required Capability',
    'Invoke Engine via Orchestrator',
    'Evaluate result',
    'Produce output',
  ];
  return { objective, constraints, requirements, executionPlan };
}

function extractSentences(text: string, pattern: RegExp): string[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  return sentences.filter(s => pattern.test(s));
}
