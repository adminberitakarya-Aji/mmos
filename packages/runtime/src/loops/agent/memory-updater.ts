/**
 * MMOS MemoryUpdater - Delegates to MemoryEngine
 * Per docs/reference/runtime/agent-loop.md (Memory Update)
 *
 * The Agent does NOT store Memory directly. It asks the MemoryEngine.
 */

import type { MemoryEngine, Uoid } from '@mmos/sdk';
import type { MemoryEntry } from '@mmos/sdk';

export interface MemoryUpdater {
  update(memoryUoid: Uoid, entry: MemoryEntry, engine?: MemoryEngine): Promise<void>;
}

export function createMemoryUpdater(): MemoryUpdater {
  return {
    async update(memoryUoid, entry, engine) {
      if (!engine) return;
      await engine.store({ memoryUoid, entries: [entry] });
    },
  };
}
