/**
 * MMOS Engine Plugin System
 * Per ADR-004: Engine Separation
 *
 * Allows registering custom engine implementations at runtime.
 */

import type {
  RuntimeEngine,
  CapabilityEngine,
  MemoryEngine,
  EventEngine,
} from '@mmos/sdk';

export type EngineType = 'runtime' | 'capability' | 'memory' | 'event';

export interface PluginManifest {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly engines: readonly EngineRegistration[];
}

export interface EngineRegistration {
  readonly type: EngineType;
  readonly name: string;
  readonly version: string;
  readonly factory: () => RuntimeEngine | CapabilityEngine | MemoryEngine | EventEngine;
  readonly dependencies?: readonly string[];
}

export interface EnginePlugin {
  readonly manifest: PluginManifest;
  initialize(context: PluginContext): Promise<void>;
  shutdown(): Promise<void>;
}

export interface PluginContext {
  readonly pluginName: string;
  readonly registry: PluginRegistry;
}

/**
 * PluginRegistry - Manages registered engine plugins
 *
 * @example
 * ```typescript
 * const registry = new PluginRegistry();
 * 
 * // Register a custom engine
 * registry.register({
 *   type: 'runtime',
 *   name: 'my-runtime',
 *   version: '1.0.0',
 *   factory: () => new MyRuntimeEngine(),
 * });
 * 
 * // Load all engines of a type
 * const runtimeEngines = registry.getEnginesByType('runtime');
 * ```
 */
export class PluginRegistry {
  private readonly plugins: Map<string, EngineRegistration> = new Map();
  private readonly enginePlugins: Map<string, EnginePlugin> = new Map();

  /**
   * Register a single engine
   */
  register(engine: EngineRegistration): void {
    const key = `${engine.type}:${engine.name}`;
    if (this.plugins.has(key)) {
      throw new Error(`Engine already registered: ${key}`);
    }
    this.plugins.set(key, engine);
  }

  /**
   * Register an engine plugin (collection of engines)
   */
  async registerPlugin(plugin: EnginePlugin): Promise<void> {
    const { name } = plugin.manifest;

    if (this.enginePlugins.has(name)) {
      throw new Error(`Plugin already registered: ${name}`);
    }

    const context: PluginContext = {
      pluginName: name,
      registry: this,
    };

    await plugin.initialize(context);
    this.enginePlugins.set(name, plugin);

    // Register each engine in the plugin
    for (const engine of plugin.manifest.engines) {
      this.register(engine);
    }
  }

  /**
   * Get all registered engines of a specific type
   */
  getEnginesByType(type: EngineType): EngineRegistration[] {
    const results: EngineRegistration[] = [];

    for (const reg of this.plugins.values()) {
      if (reg.type === type) {
        results.push(reg);
      }
    }

    return results;
  }

  /**
   * Get a specific engine registration
   */
  getEngine(type: EngineType, name: string): EngineRegistration | undefined {
    return this.plugins.get(`${type}:${name}`);
  }

  /**
   * Instantiate engines of a given type
   */
  instantiateEngines(type: EngineType): Array<RuntimeEngine | CapabilityEngine | MemoryEngine | EventEngine> {
    const engines = this.getEnginesByType(type);
    return engines.map(reg => reg.factory());
  }

  /**
   * Check if an engine is registered
   */
  hasEngine(type: EngineType, name: string): boolean {
    return this.plugins.has(`${type}:${name}`);
  }

  /**
   * Remove a plugin and its engines
   */
  async unregisterPlugin(name: string): Promise<void> {
    const plugin = this.enginePlugins.get(name);
    if (!plugin) return;

    // Remove all engines for this plugin
    for (const engine of plugin.manifest.engines) {
      const key = `${engine.type}:${engine.name}`;
      this.plugins.delete(key);
    }

    await plugin.shutdown();
    this.enginePlugins.delete(name);
  }

  /**
   * Get all registered plugin names
   */
  getPluginNames(): readonly string[] {
    return [...this.enginePlugins.keys()];
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.plugins.clear();
    this.enginePlugins.clear();
  }

  /**
   * Get registry statistics
   */
  getStats(): PluginRegistryStats {
    const byType: Record<EngineType, number> = {
      runtime: 0,
      capability: 0,
      memory: 0,
      event: 0,
    };

    for (const reg of this.plugins.values()) {
      byType[reg.type]++;
    }

    return {
      totalEngines: this.plugins.size,
      totalPlugins: this.enginePlugins.size,
      byType,
    };
  }
}

export interface PluginRegistryStats {
  readonly totalEngines: number;
  readonly totalPlugins: number;
  readonly byType: Record<EngineType, number>;
}

/**
 * Built-in notification plugin for engine lifecycle events
 */
export class NotificationPlugin implements EnginePlugin {
  readonly manifest: PluginManifest = {
    name: '@mmos/plugin-notification',
    version: '1.0.0',
    description: 'Built-in notification hooks for engine lifecycle',
    author: 'MMOS Team',
    engines: [],
  };

  private hooks: Map<string, Array<(event: string, data: unknown) => void>> = new Map();

  async initialize(context: PluginContext): Promise<void> {
    // Plugin does not register any engines, only provides hooks
  }

  async shutdown(): Promise<void> {
    this.hooks.clear();
  }

  on(event: string, handler: (event: string, data: unknown) => void): void {
    const handlers = this.hooks.get(event) ?? [];
    handlers.push(handler);
    this.hooks.set(event, handlers);
  }

  emit(event: string, data: unknown): void {
    const handlers = this.hooks.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(event, data);
      }
    }
  }
}

/**
 * Create a default plugin registry with built-in plugin support
 */
export function createPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry();
  return registry;
}