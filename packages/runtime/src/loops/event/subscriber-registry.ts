/**
 * MMOS SubscriberRegistry - Subscriber registration by category
 * Per docs/reference/runtime/event-loop.md (Event Categories)
 *
 *   Execution, Workflow, Task, Capability, Memory, Runtime, Plugin, System
 */

import type { EventHandler, EventEnvelope } from '@mmos/sdk';

export type EventCategory =
  | 'execution'
  | 'workflow'
  | 'task'
  | 'capability'
  | 'memory'
  | 'runtime'
  | 'plugin'
  | 'system';

export interface SubscriberEntry {
  readonly id: string;
  readonly category: EventCategory;
  readonly types: readonly string[];
  readonly handler: EventHandler;
}

export interface SubscriberRegistry {
  register(entry: Omit<SubscriberEntry, 'id'>): SubscriberEntry;
  unregister(id: string): boolean;
  forCategory(category: EventCategory): readonly SubscriberEntry[];
  forEnvelope(envelope: EventEnvelope): readonly SubscriberEntry[];
  size(): number;
}

export function createSubscriberRegistry(): SubscriberRegistry {
  let counter = 0;
  const entries: SubscriberEntry[] = [];

  function matches(entry: SubscriberEntry, type: string): boolean {
    return entry.types.some(t => t === '*' || t === type || matchPrefix(t, type));
  }

  function matchPrefix(pattern: string, type: string): boolean {
    if (!pattern.endsWith('*')) return false;
    const prefix = pattern.slice(0, -1);
    return type.startsWith(prefix);
  }

  return {
    register(entry) {
      const full: SubscriberEntry = { id: `sub_${++counter}`, ...entry };
      entries.push(full);
      return full;
    },
    unregister(id) {
      const i = entries.findIndex(e => e.id === id);
      if (i < 0) return false;
      entries.splice(i, 1);
      return true;
    },
    forCategory(category) {
      return entries.filter(e => e.category === category);
    },
    forEnvelope(envelope) {
      return entries.filter(e => matches(e, envelope.type));
    },
    size() {
      return entries.length;
    },
  };
}
