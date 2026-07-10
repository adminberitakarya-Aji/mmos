/**
 * MMOS Event - Immutable Event
 * Per ADR-012: Event is Immutable
 * Per ADR-014: Event-Driven Architecture
 * Per IMS-800: Event Specification
 */

import { Uoid, createUoid } from './identity.js';
import { Metadata, createMetadata, Specification, Status, Relationships } from './metadata.js';

export interface EventSpec {
  readonly source: Uoid;                 // Source object (execution, task, agent, etc.)
  readonly type: string;                 // Event type: "execution.started", "task.completed", "agent.error", etc.
  readonly payload: Record<string, unknown>; // Event payload
  readonly correlationId?: Uoid;         // Correlation ID for tracing
  readonly causationId?: Uoid;           // Causation ID (what caused this event)
  readonly timestamp: Date;              // Event timestamp
  readonly tags?: string[];              // Event tags for filtering
}

export interface Event extends Metadata {
  readonly specification: Specification;
  readonly spec: EventSpec;
  readonly status: Status;
  readonly relationships: Relationships;
}

export function createEvent(params: {
  source: Uoid;
  type: string;
  payload: Record<string, unknown>;
  correlationId?: Uoid;
  causationId?: Uoid;
  timestamp?: Date;
  tags?: string[];
  version?: string;
  name?: string;
  description?: string;
  createdBy?: string;
  ownedBy?: string;
}): Event {
  const uoid = createUoid('evt');
  const spec: EventSpec = {
    source: params.source,
    type: params.type,
    payload: params.payload,
    correlationId: params.correlationId,
    causationId: params.causationId,
    timestamp: params.timestamp ?? new Date(),
    tags: params.tags,
  };

  return {
    ...createMetadata({
      uoid,
      version: params.version ?? '1.0.0',
      name: params.name ?? params.type,
      description: params.description ?? JSON.stringify(params.payload),
      createdBy: params.createdBy,
      ownedBy: params.ownedBy,
    }),
    specification: { type: 'event', schema: 'event.schema.json', config: spec as unknown as Readonly<Record<string, unknown>> },
    spec,
    status: { phase: 'completed', message: undefined, progress: 100, startedAt: params.timestamp, completedAt: params.timestamp, error: undefined },
    relationships: { parent: params.source, children: [], dependencies: [], dependents: [], references: [], referencedBy: [] },
  };
}

export function withCorrelation(event: Event, correlationId: Uoid): Event {
  return {
    ...event,
    spec: { ...event.spec, correlationId },
  };
}

export function withCausation(event: Event, causationId: Uoid): Event {
  return {
    ...event,
    spec: { ...event.spec, causationId },
  };
}

export function withTags(event: Event, tags: string[]): Event {
  return {
    ...event,
    spec: { ...event.spec, tags: [...(event.spec.tags ?? []), ...tags] },
  };
}