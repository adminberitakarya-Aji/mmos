/**
 * MMOS InMemoryMemoryEngine - Map-Based Memory Implementation
 * Per ADR-011: Memory as Context Provider
 */

import type { Uoid } from '@mmos/sdk';
import {
  type MemoryEngine,
  type MemoryType,
  type MemoryStoreParams,
  type MemoryStoreResult,
  type MemoryRetrieveParams,
  type MemoryRetrieveResult,
  type MemorySearchParams,
  type MemorySearchResult,
  type MemoryDeleteParams,
  type MemoryDeleteResult,
  type MemoryEntry,
  type MemoryQuery,
  type EngineHealth,
} from '@mmos/sdk';

export interface InMemoryMemoryEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly maxEntries?: number;
}

interface StoredEntry {
  entry: MemoryEntry;
  storedAt: Date;
}

/**
 * InMemoryMemoryEngine - Simple Map-based memory for development and testing
 */
export class InMemoryMemoryEngine implements MemoryEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedTypes: readonly MemoryType[] = ['ephemeral', 'persistent', 'hybrid'];
  
  private readonly storage: Map<string, StoredEntry> = new Map();
  private readonly maxEntries: number;

  constructor(options: InMemoryMemoryEngineOptions = {}) {
    this.name = options.name ?? 'InMemoryMemoryEngine';
    this.version = options.version ?? '1.0.0';
    this.maxEntries = options.maxEntries ?? 10000;
  }

  async store(params: MemoryStoreParams): Promise<MemoryStoreResult> {
    const { memoryUoid, entries } = params;
    let stored = 0;
    const failed: string[] = [];

    for (const entry of entries) {
      try {
        const key = this.buildKey(memoryUoid, entry.key);
        
        // Check max entries limit
        if (this.storage.size >= this.maxEntries && !this.storage.has(key)) {
          this.evictOldest();
        }

        this.storage.set(key, {
          entry,
          storedAt: new Date(),
        });
        stored++;
      } catch {
        failed.push(entry.key);
      }
    }

    return { stored, failed: failed.length > 0 ? Object.freeze([...failed]) : [] };
  }

  async retrieve(params: MemoryRetrieveParams): Promise<MemoryRetrieveResult> {
    const { memoryUoid, query } = params;
    
    if (!query) {
      // Return all entries for this memory
      const entries: MemoryEntry[] = [];
      for (const [key, stored] of this.storage) {
        if (key.startsWith(memoryUoid.toString())) {
          entries.push(stored.entry);
        }
      }
      return { entries, total: entries.length };
    }

    // Retrieve by filter
    if (query.filter) {
      const entries: MemoryEntry[] = [];
      for (const [key, stored] of this.storage) {
        if (key.startsWith(memoryUoid.toString())) {
          if (this.matchesFilter(stored.entry, query.filter)) {
            entries.push(stored.entry);
          }
        }
      }
      return { entries, total: entries.length };
    }

    return { entries: [], total: 0 };
  }

  async search(params: MemorySearchParams): Promise<MemorySearchResult> {
    const { memoryUoid, limit = 10, filter } = params;
    const entries: (MemoryEntry & { score: number })[] = [];

    for (const [key, stored] of this.storage) {
      if (!key.startsWith(memoryUoid.toString())) {
        continue;
      }

      if (filter) {
        if (!this.matchesFilter(stored.entry, filter)) {
          continue;
        }
      }

      entries.push({
        ...stored.entry,
        score: 1.0,
      });

      if (entries.length >= limit) {
        break;
      }
    }

    return { entries };
  }

  async delete(params: MemoryDeleteParams): Promise<MemoryDeleteResult> {
    let deleted = 0;

    if (params.deleteAll) {
      for (const key of this.storage.keys()) {
        if (key.startsWith(params.memoryUoid.toString())) {
          this.storage.delete(key);
          deleted++;
        }
      }
    } else if (params.keys && params.keys.length > 0) {
      for (const key of params.keys) {
        const fullKey = this.buildKey(params.memoryUoid, key);
        if (this.storage.delete(fullKey)) {
          deleted++;
        }
      }
    } else if (params.filter) {
      for (const [key, stored] of this.storage) {
        if (!key.startsWith(params.memoryUoid.toString())) {
          continue;
        }

        if (this.matchesFilter(stored.entry, params.filter)) {
          this.storage.delete(key);
          deleted++;
        }
      }
    }

    return { deleted };
  }

  async healthCheck(): Promise<EngineHealth> {
    return {
      healthy: true,
      details: {
        name: this.name,
        version: this.version,
        totalEntries: this.storage.size,
        maxEntries: this.maxEntries,
      },
    };
  }

  private buildKey(memoryUoid: Uoid, key: string): string {
    return `${memoryUoid.toString()}:${key}`;
  }

  private matchesFilter(entry: MemoryEntry, filter: Record<string, unknown>): boolean {
    for (const [filterKey, filterValue] of Object.entries(filter)) {
      if (filterKey === 'tags' && Array.isArray(filterValue)) {
        const entryTags = entry.tags;
        if (!entryTags || !filterValue.every((tag: unknown) => entryTags.includes(tag as string))) {
          return false;
        }
      } else if (filterKey === 'key' && filterValue !== entry.key) {
        return false;
      } else if (filterKey === 'value') {
        if (filterValue !== entry.value) {
          return false;
        }
      } else if (filterKey === 'metadata') {
        if (filterValue !== entry.metadata) {
          return false;
        }
      } else if (filterKey === 'timestamp' && filterValue !== entry.timestamp) {
        return false;
      } else if (filterKey === 'vector' && filterValue !== entry.vector) {
        return false;
      }
    }
    return true;
  }

  private evictOldest(): void {
    let oldest: string | null = null;
    let oldestTime = Infinity;

    for (const [key, stored] of this.storage) {
      if (stored.storedAt.getTime() < oldestTime) {
        oldestTime = stored.storedAt.getTime();
        oldest = key;
      }
    }

    if (oldest) {
      this.storage.delete(oldest);
    }
  }

  destroy(): void {
    this.storage.clear();
  }
}