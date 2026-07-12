/**
 * MMOS ResultCollector - Validate → Normalize → Update Execution
 * Per docs/reference/runtime/execution-loop.md (Result Collection)
 */

import type { DispatchResult } from './task-dispatcher.js';
import type { Execution, Uoid } from '@mmos/sdk';

export interface CollectedResult {
  readonly executionUoid: Uoid;
  readonly valid: boolean;
  readonly normalized: unknown;
  readonly dispatch: DispatchResult;
}

export type Validator = (output: unknown) => boolean;
export type Normalizer = (output: unknown) => unknown;

export const defaultValidator: Validator = output => output !== undefined;
export const defaultNormalizer: Normalizer = output => output;

export interface ResultCollector {
  collect(execution: Execution, dispatch: DispatchResult): CollectedResult;
}

export function createResultCollector(
  validator: Validator = defaultValidator,
  normalizer: Normalizer = defaultNormalizer
): ResultCollector {
  return {
    collect(execution, dispatch) {
      const output = dispatch.output;
      return {
        executionUoid: execution.uoid,
        valid: validator(output),
        normalized: normalizer(output),
        dispatch,
      };
    },
  };
}
