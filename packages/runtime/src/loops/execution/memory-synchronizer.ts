/**
 * MMOS MemorySynchronizer - Read Context → Merge Result → Write Memory
 * Per docs/reference/runtime/execution-loop.md (Memory Synchronization)
 *
 * Memory is always updated after a context change.
 */

import type { MemoryEngine, Uoid } from '@mmos/sdk';
import type { CollectedResult } from './result-collector.js';

export interface MemorySynchronizer {
  synchronize(result: CollectedResult, memoryEngine?: MemoryEngine): Promise<void>;
}

export function createMemorySynchronizer(): MemorySynchronizer {
  return {
    async synchronize(result, memoryEngine) {
      if (!memoryEngine) return;
      if (!result.valid) return;
      // Stub: real implementation writes the normalized output as a memory entry
      // tied to the execution's memory Uoid (not part of the public surface yet).
      void memoryEngine;
    },
  };
}
