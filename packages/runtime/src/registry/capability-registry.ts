/**
 * MMOS CapabilityRegistry - Registry for Capabilities
 * Manages capability registration and lookup
 */

import type { Uoid } from '@mmos/sdk';
import type { CapabilitySchema } from '@mmos/sdk';
import type { CapabilityEngine } from '@mmos/sdk';
import type { Capability } from '@mmos/sdk';
import { createCapability, createUoid } from '@mmos/sdk';

export interface RegisteredCapability {
  readonly capability: Capability;
  readonly schema: CapabilitySchema;
  readonly engine: CapabilityEngine;
}

export interface CapabilityRegistryOptions {
  readonly name?: string;
}

export class CapabilityRegistry {
  readonly name: string;
  
  private readonly capabilities: Map<string, RegisteredCapability> = new Map();
  private readonly engines: Map<string, CapabilityEngine> = new Map();

  constructor(options: CapabilityRegistryOptions = {}) {
    this.name = options.name ?? 'CapabilityRegistry';
  }

  /**
   * Register an engine with the registry
   */
  registerEngine(engine: CapabilityEngine, categories?: readonly string[]): void {
    this.engines.set(engine.name, engine);
    
    // Register engine for specified categories
    if (categories) {
      for (const category of categories) {
        this.engines.set(`category:${category}`, engine);
      }
    }
  }

  /**
   * Get an engine by name
   */
  getEngine(name: string): CapabilityEngine | undefined {
    return this.engines.get(name);
  }

  /**
   * Get engine by category
   */
  getEngineByCategory(category: string): CapabilityEngine | undefined {
    return this.engines.get(`category:${category}`);
  }

  /**
   * Register a capability with the registry
   */
  register(
    name: string,
    category: string,
    engineName: string,
    inputs: readonly { name: string; type: string; description?: string }[] = [],
    outputs: readonly { name: string; type: string; description?: string }[] = [],
    config?: Record<string, unknown>
  ): Capability {
    const engine = this.engines.get(engineName);
    if (!engine) {
      throw new Error(`Engine not found: ${engineName}`);
    }

    const uoid = createUoid('cap');
    const composition = createUoid('cmp');
    
    const createParams: {
      composition: Uoid;
      name: string;
      category: string;
      provider: string;
      inputs: readonly { name: string; type: string; description?: string; required: boolean }[];
      outputs: readonly { name: string; type: string; description?: string }[];
      config?: Record<string, unknown>;
    } = {
      composition,
      name,
      category,
      provider: engineName,
      inputs: inputs.map(i => ({ ...i, required: false })),
      outputs: outputs.map(o => ({ ...o })),
    };
    
    if (config !== undefined) {
      createParams.config = config;
    }
    
    const capability = createCapability(createParams);

    const schema: CapabilitySchema = {
      uoid,
      name,
      category,
      provider: engineName,
      inputs: capability.spec.inputs ?? [],
      outputs: capability.spec.outputs ?? [],
      version: '1.0.0',
    };

    this.capabilities.set(uoid.toString(), {
      capability,
      schema,
      engine,
    });

    return capability;
  }

  /**
   * Get a capability by UOID
   */
  get(uoid: Uoid): RegisteredCapability | undefined {
    return this.capabilities.get(uoid.toString());
  }

  /**
   * Get all capabilities
   */
  getAll(): readonly RegisteredCapability[] {
    return [...this.capabilities.values()];
  }

  /**
   * Get capabilities by category
   */
  getByCategory(category: string): readonly RegisteredCapability[] {
    return [...this.capabilities.values()].filter(c => c.schema.category === category);
  }

  /**
   * Get capabilities by provider/engine
   */
  getByProvider(provider: string): readonly RegisteredCapability[] {
    return [...this.capabilities.values()].filter(c => c.schema.provider === provider);
  }

  /**
   * Check if a capability is registered
   */
  has(uoid: Uoid): boolean {
    return this.capabilities.has(uoid.toString());
  }

  /**
   * Unregister a capability
   */
  unregister(uoid: Uoid): boolean {
    return this.capabilities.delete(uoid.toString());
  }

  /**
   * Clear all registered capabilities
   */
  clear(): void {
    this.capabilities.clear();
  }

  /**
   * Get total count of registered capabilities
   */
  get size(): number {
    return this.capabilities.size;
  }
}

/**
 * Create a global capability registry singleton
 */
let globalRegistry: CapabilityRegistry | null = null;

export function getCapabilityRegistry(): CapabilityRegistry {
  if (!globalRegistry) {
    globalRegistry = new CapabilityRegistry();
  }
  return globalRegistry;
}

export function resetCapabilityRegistry(): void {
  globalRegistry = null;
}