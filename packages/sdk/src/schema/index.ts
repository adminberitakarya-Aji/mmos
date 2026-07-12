/**
 * MMOS Schema Validation
 * Loads and compiles JSON schemas from specs/schemas/
 */

import AjvModule from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import type { ErrorObject, ValidateFunction } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type aliases for Ajv to work with ESM imports
type AjvInstance = {
  addSchema(schema: object, key?: string): void;
  compile(schema: object): ValidateFunction;
  getSchema(key: string): object | undefined;
};
type AjvClass = new (options?: object) => AjvInstance;
type AddFormatsFn = (ajv: AjvInstance) => void;

const AjvConstructor = AjvModule as unknown as AjvClass;
const addFormatsFn = addFormatsModule as unknown as AddFormatsFn;

export interface SchemaValidator {
  validate(schemaName: string, data: unknown): ValidationResult;
  validateOrThrow(schemaName: string, data: unknown): void;
  getSchema(schemaName: string): object | undefined;
  listSchemas(): string[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
  data?: unknown;
}

export interface SchemaCompilationResult {
  schemaName: string;
  success: boolean;
  error?: string;
}

// Schema location depends on how this module is being run:
//  - Bundled dist (production): schemas are copied next to the compiled
//    output at build time (see tsup.config.ts onSuccess hook) -> dist/schemas
//  - Source / vitest (dev, test): running straight from src/schema, so the
//    canonical specs/schemas/ at the repo root is reachable via a relative
//    walk up from src/schema.
// We try each candidate in order and use the first one that actually
// exists on disk, instead of hardcoding a single relative depth that only
// happens to be correct for one of these two cases.
const SCHEMA_DIR_CANDIDATES = [
  path.resolve(__dirname, 'schemas'),               // dist/schemas (bundled)
  path.resolve(__dirname, '../../../../specs/schemas'), // repo root (src/schema during dev/test)
];

function resolveSchemaDir(): string {
  for (const candidate of SCHEMA_DIR_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `MMOS schema directory not found. Tried: ${SCHEMA_DIR_CANDIDATES.join(', ')}. ` +
    `If this is a built package, make sure the tsup build step copied specs/schemas into dist/schemas.`
  );
}

const SCHEMA_FILES = [
  'composition.schema.json',
  'workflow.schema.json',
  'execution.schema.json',
  'agent.schema.json',
  'capability.schema.json',
  'memory.schema.json',
  'event.schema.json',
  'task.schema.json',
  'runtime.schema.json',
  'artifact.schema.json',
];

let ajvInstance: AjvInstance | null = null;
let compiledSchemas: Map<string, ValidateFunction> = new Map();

export function createValidator(): SchemaValidator {
  if (!ajvInstance) {
    ajvInstance = new AjvConstructor({
      strict: true,
      allErrors: true,
      validateFormats: true,
      ownProperties: true,
    });
    addFormatsFn(ajvInstance);

    const schemaDir = resolveSchemaDir();
    const loadErrors: string[] = [];

    // Load all schemas
    for (const schemaFile of SCHEMA_FILES) {
      const schemaPath = path.join(schemaDir, schemaFile);
      try {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);
        const schemaName = schemaFile.replace('.schema.json', '');
        ajvInstance.addSchema(schema, schemaName);
        compiledSchemas.set(schemaName, ajvInstance.compile(schema));
      } catch (error) {
        loadErrors.push(`${schemaFile}: ${(error as Error).message}`);
      }
    }

    // Fail loudly rather than silently handing back a validator that will
    // reject every single call with "schema not found" — that failure mode
    // is much harder to notice than a startup crash.
    if (compiledSchemas.size === 0) {
      ajvInstance = null;
      compiledSchemas = new Map();
      throw new Error(
        `MMOS schema validator failed to load any schemas from ${schemaDir}. Errors: ${loadErrors.join('; ')}`
      );
    } else if (loadErrors.length > 0) {
      console.warn(`MMOS schema validator: ${loadErrors.length} schema(s) failed to load: ${loadErrors.join('; ')}`);
    }
  }

  return {
    validate(schemaName: string, data: unknown): ValidationResult {
      const validate = compiledSchemas.get(schemaName);
      if (!validate) {
        return {
          valid: false,
          errors: [{ 
            keyword: 'schema', 
            message: `Schema '${schemaName}' not found`,
            schemaPath: '',
            instancePath: '',
            params: {},
          } as ErrorObject],
        };
      }

      const valid = validate(data);
      return {
        valid: valid as boolean,
        errors: validate.errors ?? [],
        data,
      };
    },

    validateOrThrow(schemaName: string, data: unknown): void {
      const result = this.validate(schemaName, data);
      if (!result.valid) {
        const errorMessages = result.errors?.map(e => 
          `${e.instancePath} ${e.message}`
        ).join('; ') ?? 'Unknown validation error';
        throw new Error(`Validation failed for ${schemaName}: ${errorMessages}`);
      }
    },

    getSchema(schemaName: string): object | undefined {
      return ajvInstance?.getSchema(schemaName);
    },

    listSchemas(): string[] {
      return Array.from(compiledSchemas.keys());
    },
  };
}

export function validateSchema(schemaName: string, data: unknown): ValidationResult {
  return createValidator().validate(schemaName, data);
}

export function validateOrThrow(schemaName: string, data: unknown): void {
  return createValidator().validateOrThrow(schemaName, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Types — Generated from specs/schemas/*.schema.json
// ─────────────────────────────────────────────────────────────────────────────

export type {
  SchemaIdentity,
  SchemaSemanticVersion,
  SchemaDateTime,
  SchemaNonEmptyString,
  SchemaDescription,
  SchemaUUID,
  SchemaMetadata,
  SchemaLabelMap,
  SchemaTimestamp,
  SchemaAuditInformation,
  SchemaStatus,
  SchemaOwnerReference,
  SchemaWorkflowReference,
  SchemaMemoryReference,
  SchemaArtifactReference,
  SchemaCapabilityReference,
  SchemaAgentReference,
  SchemaRuntimeReference,
  SchemaRetryPolicy,
  SchemaExecutionPolicy,
  SchemaConfiguration,
  SchemaComposition,
  SchemaTransitionCondition,
  SchemaTransition,
  SchemaWorkflow,
  SchemaTaskInputField,
  SchemaTaskOutputField,
  SchemaHumanTaskConfig,
  SchemaTaskRetryPolicy,
  SchemaTask,
  SchemaAgentPolicies,
  SchemaAgent,
  SchemaExecutionPhase,
  SchemaExecutionStatus,
  SchemaExecutionContext,
  SchemaExecution,
  SchemaRuntimeProvider,
  SchemaRuntimeLimits,
  SchemaRuntime,
  SchemaCapabilityInput,
  SchemaCapabilityOutput,
  SchemaCapabilityAuth,
  SchemaCapability,
  SchemaMemoryType,
  SchemaMemoryConfig,
  SchemaMemory,
  SchemaArtifactKind,
  SchemaArtifactStorage,
  SchemaArtifact,
  SchemaEventPayload,
  SchemaEvent,
  SchemaTypeMap,
  SchemaName,
  SchemaType,
} from './types.js';