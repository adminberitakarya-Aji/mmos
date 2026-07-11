/**
 * Unit tests for MMOS Identity (Uoid)
 * Per ADR-013: Object Identity is Immutable
 * Per IMS-100: Universal Object Identifier
 */

import { describe, it, expect } from 'vitest';
import { Uoid, createUoid, UoidType } from './identity.js';

describe('Uoid', () => {
  describe('constructor', () => {
    it('accepts a valid 3-letter type and identifier', () => {
      const uoid = new Uoid('agt', 'abc123');
      expect(uoid.type).toBe('agt');
      expect(uoid.identifier).toBe('abc123');
    });

    it('rejects invalid type (not 3 letters)', () => {
      expect(() => new Uoid('ag', 'abc')).toThrow(/Invalid UOID type/);
      expect(() => new Uoid('AGENT', 'abc')).toThrow(/Invalid UOID type/);
      expect(() => new Uoid('ag1', 'abc')).toThrow(/Invalid UOID type/);
    });

    it('rejects invalid identifier (special chars)', () => {
      expect(() => new Uoid('agt', 'abc!')).toThrow(/Invalid UOID identifier/);
      expect(() => new Uoid('agt', 'abc def')).toThrow(/Invalid UOID identifier/);
    });
  });

  describe('toString', () => {
    it('formats as "type_identifier"', () => {
      const uoid = new Uoid('wfl', 'xyz');
      expect(uoid.toString()).toBe('wfl_xyz');
    });
  });

  describe('parse', () => {
    it('parses a valid UOID string', () => {
      const uoid = Uoid.parse('cmp_abc123');
      expect(uoid.type).toBe('cmp');
      expect(uoid.identifier).toBe('abc123');
    });

    it('rejects malformed strings', () => {
      expect(() => Uoid.parse('invalid')).toThrow(/Invalid UOID format/);
      expect(() => Uoid.parse('ag_abc')).toThrow(/Invalid UOID format/);
      expect(() => Uoid.parse('AGENT_abc')).toThrow(/Invalid UOID format/);
    });
  });

  describe('generate / createUoid', () => {
    it('generates a Uoid with a unique identifier when none is provided', () => {
      const a = Uoid.generate('tsk');
      const b = Uoid.generate('tsk');
      expect(a.type).toBe('tsk');
      expect(b.type).toBe('tsk');
      expect(a.identifier).not.toBe(b.identifier);
    });

    it('uses the provided identifier when given', () => {
      const uoid = Uoid.generate('mem', 'fixed-id');
      expect(uoid.identifier).toBe('fixed-id');
    });

    it('createUoid delegates to generate', () => {
      const uoid = createUoid('agt' as UoidType, 'one');
      expect(uoid.type).toBe('agt');
      expect(uoid.identifier).toBe('one');
    });
  });

  describe('equals', () => {
    it('returns true for structurally equal Uoids', () => {
      const a = new Uoid('wfl', 'same');
      const b = new Uoid('wfl', 'same');
      expect(a.equals(b)).toBe(true);
    });

    it('returns false when type or identifier differ', () => {
      const base = new Uoid('wfl', 'same');
      expect(base.equals(new Uoid('wfl', 'diff'))).toBe(false);
      expect(base.equals(new Uoid('tsk', 'same'))).toBe(false);
    });
  });
});
