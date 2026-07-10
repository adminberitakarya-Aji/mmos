/**
 * MMOS Schema Validation
 * Loads and compiles JSON schemas from specs/schemas/
 */

import AjvModule from 'ajv';
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

const SCHEMA_DIR = path.resolve(__dirname, '../../../specs/schemas');

const SCHEMA_FILES = [
  'composition.schema.json',
  'workflow.schema.json',
  'execution.schema.json',
  'agent.schema.json',
  'capability.schema.json',
  'memory.schema.json',
  'event.schema.json',
  'object.schema.json',
  'task.schema.json',
  'runtime.schema.json',
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
    
    // Load all schemas
    for (const schemaFile of SCHEMA_FILES) {
      const schemaPath = path.join(SCHEMA_DIR, schemaFile);
      try {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);
        const schemaName = schemaFile.replace('.schema.json', '');
        ajvInstance.addSchema(schema, schemaName);
        compiledSchemas.set(schemaName, ajvInstance.compile(schema));
      } catch (error) {
        console.warn(`Failed to load schema ${schemaFile}:`, error);
      }
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
