/**
 * MMOS FunctionCapabilityEngine - In-Process TypeScript Function Execution
 * Per ADR-010: Capability as Contract
 */

import type { Uoid } from '@mmos/sdk';
import { createUoid } from '@mmos/sdk';
import {
  type CapabilityEngine,
  type CapabilityEngineParams,
  type CapabilityEngineResult,
  type CapabilitySchema,
  type EngineHealth,
  type CapabilityInput,
  type CapabilityOutput,
} from '@mmos/sdk';

export interface FunctionCapabilityConfig {
  readonly inputSchema?: Record<string, unknown>;
  readonly outputSchema?: Record<string, unknown>;
}

export type CapabilityFunction = (
  input: Record<string, unknown>,
  context?: CapabilityContext
) => Promise<Record<string, unknown>> | Record<string, unknown>;

export interface CapabilityContext {
  readonly capabilityUoid: Uoid;
  readonly executionId?: Uoid | undefined;
  readonly variables?: Record<string, unknown> | undefined;
}

/**
 * FunctionCapabilityEngine - Invokes in-process TypeScript functions
 * 
 * @example
 * ```typescript
 * const engine = new FunctionCapabilityEngine();
 * 
 * engine.register('text.generate', async (input) => {
 *   return { text: `Generated: ${input.prompt}` };
 * });
 * 
 * const result = await engine.invoke({
 *   capabilityUoid: createUoid('cap'),
 *   input: { prompt: 'Hello world' }
 * });
 * ```
 */
export class FunctionCapabilityEngine implements CapabilityEngine {
  readonly name = 'FunctionCapabilityEngine';
  readonly version = '1.0.0';
  readonly supportedCategories = ['function', 'builtin', 'transform', 'utility'];

  private readonly functions: Map<string, CapabilityFunction> = new Map();
  private readonly schemas: Map<string, CapabilitySchema> = new Map();

  register(
    uoid: string,
    name: string,
    category: string,
    func: CapabilityFunction,
    config?: FunctionCapabilityConfig
  ): void {
    const capabilityUoid = createUoid('cap');
    
    const schema: CapabilitySchema = {
      uoid: capabilityUoid,
      name,
      category,
      provider: this.name,
      inputs: config?.inputSchema ? this.schemaToInputs(config.inputSchema) : [],
      outputs: config?.outputSchema ? this.schemaToOutputs(config.outputSchema) : [],
      version: '1.0.0',
    };

    this.functions.set(uoid, func);
    this.schemas.set(uoid, schema);
  }

  registerWithSchema(
    uoid: string,
    name: string,
    category: string,
    provider: string,
    func: CapabilityFunction,
    inputs: readonly CapabilityInput[],
    outputs: readonly CapabilityOutput[]
  ): void {
    const capabilityUoid = createUoid('cap');
    
    const schema: CapabilitySchema = {
      uoid: capabilityUoid,
      name,
      category,
      provider,
      inputs,
      outputs,
      version: '1.0.0',
    };

    this.functions.set(uoid, func);
    this.schemas.set(uoid, schema);
  }

  async invoke(params: CapabilityEngineParams): Promise<CapabilityEngineResult> {
    const { capabilityUoid, input, config, timeout } = params;

    const func = this.functions.get(capabilityUoid.toString());
    if (!func) {
      throw new Error(`Function not registered for capability: ${capabilityUoid}`);
    }

    const context: CapabilityContext = {
      capabilityUoid,
      variables: config ?? undefined,
    };

    // Execute with optional timeout
    const result = timeout 
      ? this.executeWithTimeout(func, input, context, timeout)
      : func(input, context);

    const output = await Promise.resolve(result);

    return {
      output,
      metadata: {
        engine: this.name,
        version: this.version,
        capability: capabilityUoid.toString(),
      },
    };
  }

  async canHandle(capabilityUoid: Uoid): Promise<boolean> {
    return this.functions.has(capabilityUoid.toString());
  }

  async getCapabilitySchema(capabilityUoid: Uoid): Promise<CapabilitySchema | null> {
    return this.schemas.get(capabilityUoid.toString()) ?? null;
  }

  async healthCheck(): Promise<EngineHealth> {
    return {
      healthy: true,
      details: {
        name: this.name,
        version: this.version,
        registeredFunctions: this.functions.size,
      },
    };
  }

  private async executeWithTimeout(
    func: CapabilityFunction,
    input: Record<string, unknown>,
    context: CapabilityContext,
    timeoutMs: number
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Capability execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      Promise.resolve(func(input, context))
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private schemaToInputs(schema: Record<string, unknown>): readonly CapabilityInput[] {
    if (!schema || typeof schema !== 'object') {
      return [];
    }

    const properties = (schema as Record<string, unknown>).properties as Record<string, unknown> | undefined;
    if (!properties) {
      return [];
    }

    return Object.entries(properties).map(([name, prop]) => {
      const propObj = prop as Record<string, unknown>;
      return {
        name,
        type: (propObj.type as string) ?? 'string',
        description: propObj.description as string | undefined,
        required: ((schema as Record<string, unknown>).required as string[] | undefined)?.includes(name) ?? false,
        default: propObj.default as unknown,
        schema: propObj.schema as Record<string, unknown> | undefined,
      } as CapabilityInput;
    });
  }

  private schemaToOutputs(schema: Record<string, unknown>): readonly CapabilityOutput[] {
    if (!schema || typeof schema !== 'object') {
      return [];
    }

    const properties = (schema as Record<string, unknown>).properties as Record<string, unknown> | undefined;
    if (!properties) {
      return [];
    }

    return Object.entries(properties).map(([name, prop]) => {
      const propObj = prop as Record<string, unknown>;
      return {
        name,
        type: (propObj.type as string) ?? 'string',
        description: propObj.description as string | undefined,
        schema: propObj.schema as Record<string, unknown> | undefined,
      } as CapabilityOutput;
    });
  }
}