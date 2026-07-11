/**
 * Unit tests for MMOS Metadata
 * Per IMS-100: Universal Object Structure - Metadata
 */

import { describe, it, expect } from 'vitest';
import { createMetadata, withMetadataVersion, withMetadataTags, isTerminalStatus, isActiveStatus, createStatus } from './metadata.js';
import { createUoid } from './identity.js';

describe('createMetadata', () => {
  it('creates metadata with required fields', () => {
    const uoid = createUoid('agt');
    const meta = createMetadata({ uoid, version: '1.0.0', name: 'test-agent' });

    expect(meta.uoid.equals(uoid)).toBe(true);
    expect(meta.name).toBe('test-agent');
    expect(meta.version).toBe('1.0.0');
    expect(meta.createdAt).toBeInstanceOf(Date);
    expect(meta.updatedAt).toBeInstanceOf(Date);
  });

  it('rejects invalid semantic version', () => {
    const uoid = createUoid('agt');
    expect(() => createMetadata({ uoid, version: 'not-a-version', name: 'x' })).toThrow(/Invalid semantic version/);
    expect(() => createMetadata({ uoid, version: '1.0', name: 'x' })).toThrow(/Invalid semantic version/);
  });

  it('accepts versions with pre-release and build metadata', () => {
    const uoid = createUoid('agt');
    expect(() => createMetadata({ uoid, version: '1.0.0-alpha.1', name: 'x' })).not.toThrow();
    expect(() => createMetadata({ uoid, version: '1.0.0+build.123', name: 'x' })).not.toThrow();
  });
});

describe('withMetadataVersion / withMetadataTags', () => {
  it('updates version and bumps updatedAt', async () => {
    const uoid = createUoid('agt');
    const meta = createMetadata({ uoid, version: '1.0.0', name: 'x' });
    const before = meta.updatedAt;
    // wait a millisecond to make updatedAt reliably later
    await new Promise(r => setTimeout(r, 5));
    const updated = withMetadataVersion(meta, '2.0.0');
    expect(updated.version).toBe('2.0.0');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('updates tags', () => {
    const uoid = createUoid('agt');
    const meta = createMetadata({ uoid, version: '1.0.0', name: 'x' });
    const updated = withMetadataTags(meta, ['alpha', 'experimental']);
    expect(updated.tags).toEqual(['alpha', 'experimental']);
  });
});

describe('createStatus / isTerminalStatus / isActiveStatus', () => {
  it('detects terminal status', () => {
    expect(isTerminalStatus(createStatus({ phase: 'completed' }))).toBe(true);
    expect(isTerminalStatus(createStatus({ phase: 'failed' }))).toBe(true);
    expect(isTerminalStatus(createStatus({ phase: 'cancelled' }))).toBe(true);
    expect(isTerminalStatus(createStatus({ phase: 'pending' }))).toBe(false);
    expect(isTerminalStatus(createStatus({ phase: 'active' }))).toBe(false);
  });

  it('detects active status', () => {
    expect(isActiveStatus(createStatus({ phase: 'active' }))).toBe(true);
    expect(isActiveStatus(createStatus({ phase: 'pending' }))).toBe(false);
  });
});
