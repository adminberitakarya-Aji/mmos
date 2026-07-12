/**
 * MMOS EventArchiver - Read-only archive of processed events
 * Per docs/reference/runtime/event-loop.md (Event Immutability)
 * Per ADR-012: Event is Immutable
 */

import type { EventEnvelope } from '@mmos/sdk';

export interface EventArchive {
  push(envelope: EventEnvelope): void;
  list(): readonly EventEnvelope[];
  byType(type: string): readonly EventEnvelope[];
  size(): number;
}

export function createEventArchive(): EventArchive {
  const items: EventEnvelope[] = [];
  // We deep-freeze on push to enforce immutability at the boundary
  function deepFreeze<T>(value: T): T {
    if (value && typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach(v => {
        if (v && typeof v === 'object' && !Object.isFrozen(v)) {
          deepFreeze(v);
        }
      });
      Object.freeze(value);
    }
    return value;
  }

  return {
    push(envelope) {
      items.push(deepFreeze({ ...envelope }));
    },
    list() {
      return [...items];
    },
    byType(type) {
      return items.filter(e => e.type === type);
    },
    size() {
      return items.length;
    },
  };
}
