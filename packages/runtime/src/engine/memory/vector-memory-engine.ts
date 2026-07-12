/**
 * MMOS VectorMemoryEngine - Embedding-Based Vector Search Memory
 * Per ADR-011: Memory as Context Provider
 *
 * Provides cosine similarity search over stored memory entries.
 * Can be backed by in-memory storage (default) or external vector databases.
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
  type EngineHealth,
} from '@mmos/sdk';

export interface VectorMemoryEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly dimension?: number;
  readonly similarity?: 'cosine' | 'euclidean' | 'dot-product';
  readonly backend?: 'in-memory' | 'pinecone' | 'pgvector' | 'qdrant';
  readonly backendConfig?: Record<string, unknown>;
}

interface IndexedEntry {
  entry: MemoryEntry;
  vector: number[];
  storedAt: Date;
}

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dotProd = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const ai = a[i] as number;
    const bi = b[i] as number;
    dotProd += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProd / denom;
}

function euclideanSimilarity(a: readonly number[], b: readonly number[]): number {
  let sumSquared = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = (a[i] as number) - (b[i] as number);
    sumSquared += diff * diff;
  }
  return 1 / (1 + Math.sqrt(sumSquared));
}

function dotProduct(a: readonly number[], b: readonly number[]): number {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += (a[i] as number) * (b[i] as number);
  }
  return result;
}

function matchesFilter(entry: MemoryEntry, filter: Record<string, unknown>): boolean {
  for (const [filterKey, filterValue] of Object.entries(filter)) {
    if (filterKey === 'tags' && Array.isArray(filterValue)) {
      const entryTags = entry.tags;
      if (!entryTags || !filterValue.every((tag: unknown) => entryTags.includes(tag as string))) {
        return false;
      }
    } else if (filterKey === 'key' && filterValue !== entry.key) {
      return false;
    } else if (filterKey === 'value') {
      if (filterValue !== entry.value) return false;
    } else if (filterKey === 'metadata') {
      if (filterValue !== entry.metadata) return false;
    } else if (filterKey === 'timestamp' && filterValue !== entry.timestamp) {
      return false;
    }
  }
  return true;
}

/**
 * VectorMemoryEngine - Embedding-based vector search
 */
export class VectorMemoryEngine implements MemoryEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedTypes: readonly MemoryType[] = ['vector', 'hybrid'];

  private readonly storage: Map<string, IndexedEntry> = new Map();
  private readonly dimension: number;
  private readonly similarity: 'cosine' | 'euclidean' | 'dot-product';
  private readonly backend: string;
  private readonly backendConfig: Record<string, unknown>;

  constructor(options: VectorMemoryEngineOptions = {}) {
    this.name = options.name ?? 'VectorMemoryEngine';
    this.version = options.version ?? '1.0.0';
    this.dimension = options.dimension ?? 1536;
    this.similarity = options.similarity ?? 'cosine';
    this.backend = options.backend ?? 'in-memory';
    this.backendConfig = options.backendConfig ?? {};
  }

  async store(params: MemoryStoreParams): Promise<MemoryStoreResult> {
    const { memoryUoid, entries } = params;
    let stored = 0;
    const failed: string[] = [];

    for (const entry of entries) {
      try {
        if (!entry.vector || entry.vector.length !== this.dimension) {
          failed.push(entry.key);
          continue;
        }

        const key = this.buildKey(memoryUoid, entry.key);
        this.storage.set(key, {
          entry,
          vector: [...entry.vector],
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
    const entries: MemoryEntry[] = [];

    if (!query) {
      for (const [key, stored] of this.storage) {
        if (key.startsWith(memoryUoid.toString())) {
          entries.push(stored.entry);
        }
      }
      return { entries, total: entries.length };
    }

    if (query.filter) {
      for (const [key, stored] of this.storage) {
        if (key.startsWith(memoryUoid.toString())) {
          if (matchesFilter(stored.entry, query.filter)) {
            entries.push(stored.entry);
          }
        }
      }
      return { entries, total: entries.length };
    }

    return { entries: [], total: 0 };
  }

  async search(params: MemorySearchParams): Promise<MemorySearchResult> {
    const { memoryUoid, vector, limit = 10, threshold = 0.0, filter } = params;

    if (vector.length !== this.dimension) {
      throw new Error(
        `Vector dimension mismatch: expected ${this.dimension}, got ${vector.length}`
      );
    }

    const scored: Array<{ entry: MemoryEntry; score: number }> = [];

    for (const [key, stored] of this.storage) {
      if (!key.startsWith(memoryUoid.toString())) continue;

      if (filter) {
        if (!matchesFilter(stored.entry, filter)) continue;
      }

      const score = this.calculateSimilarity(vector, stored.vector);
      if (score < threshold) continue;

      scored.push({ entry: stored.entry, score });
    }

    scored.sort((a, b) => b.score - a.score);

    const results = scored.slice(0, limit).map(({ entry, score }) =>
      Object.assign({}, entry, { score })
    );

    return { entries: results };
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
        if (this.storage.delete(fullKey)) deleted++;
      }
    } else if (params.filter) {
      for (const [key, stored] of this.storage) {
        if (!key.startsWith(params.memoryUoid.toString())) continue;
        if (matchesFilter(stored.entry, params.filter)) {
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
        dimension: this.dimension,
        similarity: this.similarity,
        backend: this.backend,
        totalEntries: this.storage.size,
      },
    };
  }

  private buildKey(memoryUoid: Uoid, key: string): string {
    return `${memoryUoid.toString()}:${key}`;
  }

  private calculateSimilarity(a: readonly number[], b: readonly number[]): number {
    switch (this.similarity) {
      case 'euclidean':
        return euclideanSimilarity(a, b);
      case 'dot-product':
        return dotProduct(a, b);
      case 'cosine':
      default:
        return cosineSimilarity(a, b);
    }
  }
}