/**
 * MMOS Object Identity System
 * Per ADR-013: Object Identity is Immutable
 * Per IMS-100: Universal Object Identifier (UOID) format
 */

import { randomUUID } from 'crypto';

function generateId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 16);
}

export interface UoidParts {
  readonly type: string;      // 3-letter type prefix (e.g., 'cmp', 'wfl', 'tsk', 'agt')
  readonly identifier: string; // unique identifier within type
}

export class Uoid implements Readonly<UoidParts> {
  readonly type: string;
  readonly identifier: string;

  constructor(type: string, identifier: string) {
    if (!/^[a-z]{3}$/.test(type)) {
      throw new Error(`Invalid UOID type: ${type}. Must be 3 lowercase letters.`);
    }
    if (!/^[A-Za-z0-9_-]+$/.test(identifier)) {
      throw new Error(`Invalid UOID identifier: ${identifier}. Must be alphanumeric with hyphen/underscore.`);
    }
    this.type = type;
    this.identifier = identifier;
  }

  toString(): string {
    return `${this.type}_${this.identifier}`;
  }

  static parse(uoid: string): Uoid {
    const match = uoid.match(/^([a-z]{3})_(.+)$/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid UOID format: ${uoid}. Expected: type_identifier`);
    }
    return new Uoid(match[1], match[2]);
  }

  static generate(type: string, identifier?: string): Uoid {
    const id = identifier ?? generateId();
    return new Uoid(type, id as string);
  }

  equals(other: Uoid): boolean {
    return this.type === other.type && this.identifier === other.identifier;
  }
}

export const UoidType = {
  Workspace: 'wrk',
  Project: 'prj',
  Composition: 'cmp',
  Workflow: 'wfl',
  Task: 'tsk',
  Agent: 'agt',
  Execution: 'exe',
  Runtime: 'run',
  Capability: 'cap',
  Memory: 'mem',
  Artifact: 'art',
  Event: 'evt',
} as const;

export type UoidType = typeof UoidType[keyof typeof UoidType];

export function createUoid(type: UoidType, identifier?: string): Uoid {
  return Uoid.generate(type, identifier);
}