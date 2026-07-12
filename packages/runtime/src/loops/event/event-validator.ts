/**
 * MMOS EventValidator - Validate Schema + Validate Metadata
 * Per docs/reference/runtime/event-loop.md (Event Validation)
 *
 *   Receive Event → Validate Schema → Validate Metadata → Accept | Reject
 */

import type { EventEnvelope } from '@mmos/sdk';

export type SchemaValidator = (envelope: EventEnvelope) => boolean;

export interface ValidationResult {
  readonly valid: boolean;
  readonly reason?: string;
}

export interface EventValidator {
  validate(envelope: EventEnvelope): ValidationResult;
}

export function createEventValidator(
  schemaValidator: SchemaValidator = defaultSchemaValidator,
  metadataValidator: SchemaValidator = defaultMetadataValidator
): EventValidator {
  return {
    validate(envelope) {
      if (!envelope.event || !envelope.type) {
        return { valid: false, reason: 'Missing event or type' };
      }
      if (!schemaValidator(envelope)) {
        return { valid: false, reason: 'Schema validation failed' };
      }
      if (!metadataValidator(envelope)) {
        return { valid: false, reason: 'Metadata validation failed' };
      }
      return { valid: true };
    },
  };
}

export function defaultSchemaValidator(envelope: EventEnvelope): boolean {
  return typeof envelope.type === 'string' && envelope.type.length > 0;
}

export function defaultMetadataValidator(envelope: EventEnvelope): boolean {
  return envelope.timestamp instanceof Date && !Number.isNaN(envelope.timestamp.getTime());
}
