/**
 * MMOS FileMemoryEngine - File-Based Memory Implementation
 * Per ADR-011: Memory as Context Provider
 */

import { readFile, writeFile, mkdir, readdir, unlink, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

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

export interface FileMemoryEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly basePath?: string;
  readonly format?: 'json' | 'markdown';
  readonly maxFileSize?: number;
}

// Mutable equivalent of MemoryEntry for serialization purposes
interface MutableEntry {
  key: string;
  value: unknown;
  metadata?: Record<string, unknown>;
  timestamp: string; // ISO string for serialization
  tags?: string[];
  vector?: number[];
}

/**
 * FileMemoryEngine - Stores memories as files on disk
 *
 * Supports:
 * - json: Each memory is a JSON file
 * - markdown: Each memory is a Markdown file with frontmatter
 */
export class FileMemoryEngine implements MemoryEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedTypes: readonly MemoryType[] = ['persistent', 'hybrid'];

  private readonly basePath: string;
  private readonly format: 'json' | 'markdown';
  private readonly maxFileSize: number;

  constructor(options: FileMemoryEngineOptions = {}) {
    this.name = options.name ?? 'FileMemoryEngine';
    this.version = options.version ?? '1.0.0';
    this.basePath = resolve(options.basePath ?? './data/memories');
    this.format = options.format ?? 'json';
    this.maxFileSize = options.maxFileSize ?? 10 * 1024 * 1024; // 10MB

    if (!existsSync(this.basePath)) {
      mkdir(this.basePath, { recursive: true }).catch(() => {});
    }
  }

  async store(params: MemoryStoreParams): Promise<MemoryStoreResult> {
    const { memoryUoid, entries } = params;
    let stored = 0;
    const failed: string[] = [];

    for (const entry of entries) {
      try {
        const filePath = this.getFilePath(memoryUoid, entry.key);
        const dir = resolve(filePath, '..');

        if (!existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }

        const data = this.serializeEntry(entry);
        await writeFile(filePath, data, 'utf-8');
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
      const files = await this.listFilesForMemory(memoryUoid);
      for (const { entry } of files) {
        entries.push(entry);
      }
      return { entries, total: entries.length };
    }

    if (query.filter) {
      const files = await this.listFilesForMemory(memoryUoid);
      for (const { entry } of files) {
        if (this.matchesFilter(entry, query.filter)) {
          entries.push(entry);
        }
      }
      return { entries, total: entries.length };
    }

    return { entries: [], total: 0 };
  }

  async search(params: MemorySearchParams): Promise<MemorySearchResult> {
    const { memoryUoid, limit = 10, filter } = params;
    const entries: (MemoryEntry & { score: number })[] = [];

    const files = await this.listFilesForMemory(memoryUoid);

    for (const { entry } of files) {
      if (filter) {
        if (!this.matchesFilter(entry, filter)) {
          continue;
        }
      }

      entries.push(Object.assign({}, entry, { score: 1.0 }));
      if (entries.length >= limit) {
        break;
      }
    }

    return { entries };
  }

  async delete(params: MemoryDeleteParams): Promise<MemoryDeleteResult> {
    let deleted = 0;

    if (params.deleteAll) {
      const files = await this.listFilesForMemory(params.memoryUoid);
      for (const { filePath } of files) {
        try {
          await unlink(filePath);
          deleted++;
        } catch {
          // Ignore
        }
      }
    } else if (params.keys && params.keys.length > 0) {
      for (const key of params.keys) {
        const filePath = this.getFilePath(params.memoryUoid, key);
        try {
          await unlink(filePath);
          deleted++;
        } catch {
          // Ignore
        }
      }
    } else if (params.filter) {
      const files = await this.listFilesForMemory(params.memoryUoid);
      for (const { entry, filePath } of files) {
        if (this.matchesFilter(entry, params.filter)) {
          try {
            await unlink(filePath);
            deleted++;
          } catch {
            // Ignore
          }
        }
      }
    }

    return { deleted };
  }

  async healthCheck(): Promise<EngineHealth> {
    try {
      const exists = existsSync(this.basePath);
      const allFiles = await this.getAllMemoryFiles();

      return {
        healthy: exists,
        details: {
          name: this.name,
          version: this.version,
          basePath: this.basePath,
          format: this.format,
          fileCount: allFiles.length,
        },
      };
    } catch (err) {
      return {
        healthy: false,
        details: {
          name: this.name,
          version: this.version,
          error: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  private getFileExtension(): string {
    return this.format === 'markdown' ? '.md' : '.json';
  }

  private getFilePath(memoryUoid: Uoid, key: string): string {
    const memoryDir = join(this.basePath, memoryUoid.toString());
    const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    return join(memoryDir, `${sanitized}${this.getFileExtension()}`);
  }

  private serializeEntry(entry: MemoryEntry): string {
    const mutable: MutableEntry = {
      key: entry.key,
      value: entry.value,
      timestamp: entry.timestamp.toISOString(),
    };
    if (entry.metadata) mutable.metadata = entry.metadata;
    if (entry.tags) mutable.tags = entry.tags;
    if (entry.vector) mutable.vector = entry.vector;

    if (this.format === 'markdown') {
      return this.toMarkdown(mutable);
    }

    return JSON.stringify(mutable, null, 2);
  }

  private deserializeEntry(data: string): MemoryEntry | null {
    try {
      let mutable: MutableEntry;

      if (this.format === 'markdown') {
        mutable = this.fromMarkdown(data);
      } else {
        mutable = JSON.parse(data) as MutableEntry;
      }

      if (!mutable.key) return null;

      return {
        key: mutable.key,
        value: mutable.value,
        timestamp: new Date(mutable.timestamp),
        ...(mutable.metadata ? { metadata: mutable.metadata } : {}),
        ...(mutable.tags ? { tags: mutable.tags } : {}),
        ...(mutable.vector ? { vector: mutable.vector } : {}),
      };
    } catch {
      return null;
    }
  }

  private toMarkdown(entry: MutableEntry): string {
    let md = '---\n';
    md += `key: ${entry.key}\n`;
    md += `timestamp: ${entry.timestamp}\n`;

    if (entry.tags && entry.tags.length > 0) {
      md += `tags: ${JSON.stringify(entry.tags)}\n`;
    }
    if (entry.metadata) {
      for (const [k, v] of Object.entries(entry.metadata)) {
        if (typeof v === 'string') {
          md += `${k}: ${v}\n`;
        } else {
          md += `${k}: ${JSON.stringify(v)}\n`;
        }
      }
    }

    md += '---\n\n';

    if (typeof entry.value === 'string') {
      md += entry.value;
    } else {
      md += JSON.stringify(entry.value, null, 2);
    }

    return md;
  }

  private fromMarkdown(data: string): MutableEntry {
    const match = data.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    const entry: MutableEntry = {
      key: '',
      value: match?.[2]?.trim() ?? data,
      timestamp: new Date().toISOString(),
    };

    const frontmatter = match?.[1];
    if (!frontmatter) return entry;

    for (const line of frontmatter.split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx <= 0) continue;

      const k = line.slice(0, colonIdx).trim();
      const v = line.slice(colonIdx + 1).trim();

      if (k === 'key') entry.key = v;
      else if (k === 'tags') entry.tags = JSON.parse(v) as string[];
      else if (k === 'timestamp') entry.timestamp = v;
      else {
        if (!entry.metadata) entry.metadata = {};
        entry.metadata[k] = v;
      }
    }

    return entry;
  }

  private async listFilesForMemory(memoryUoid: Uoid): Promise<Array<{ entry: MemoryEntry; filePath: string }>> {
    const results: Array<{ entry: MemoryEntry; filePath: string }> = [];
    const memoryDir = join(this.basePath, memoryUoid.toString());
    const ext = this.getFileExtension();

    try {
      const files = await readdir(memoryDir);

      for (const file of files) {
        if (!file.endsWith(ext)) continue;

        const filePath = join(memoryDir, file);
        const stats = await stat(filePath);
        if (!stats.isFile() || stats.size > this.maxFileSize) continue;

        const data = await readFile(filePath, 'utf-8');
        const entry = this.deserializeEntry(data);

        if (entry) {
          results.push({ entry, filePath });
        }
      }
    } catch {
      // Directory may not exist
    }

    return results;
  }

  private async getAllMemoryFiles(): Promise<string[]> {
    const results: string[] = [];
    const ext = this.getFileExtension();

    try {
      const memoryDirs = await readdir(this.basePath);

      for (const dir of memoryDirs) {
        const dirPath = join(this.basePath, dir);
        const dirStats = await stat(dirPath);
        if (!dirStats.isDirectory()) continue;

        const files = await readdir(dirPath);
        for (const file of files) {
          if (file.endsWith(ext)) {
            results.push(join(dirPath, file));
          }
        }
      }
    } catch {
      // Directory may not exist
    }

    return results;
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
      }
    }
    return true;
  }
}