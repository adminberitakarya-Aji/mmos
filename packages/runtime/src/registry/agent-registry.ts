/**
 * MMOS AgentRegistry - Registry for Agents
 * Manages agent registration and lookup
 */

import type { Uoid } from '@mmos/sdk';
import type { Agent } from '@mmos/sdk';
import { createAgent, createUoid } from '@mmos/sdk';

export interface RegisteredAgent {
  readonly agent: Agent;
}

export interface AgentRegistryOptions {
  readonly name?: string;
}

export class AgentRegistry {
  readonly name: string;
  
  private readonly agents: Map<string, RegisteredAgent> = new Map();

  constructor(options: AgentRegistryOptions = {}) {
    this.name = options.name ?? 'AgentRegistry';
  }

  /**
   * Register an agent
   */
  register(
    name: string,
    runtime: Uoid,
    description?: string,
    capabilities?: readonly Uoid[],
    memory?: readonly Uoid[],
    createdBy?: string
  ): Agent {
    const composition = createUoid('cmp');
    
    const createParams: {
      composition: Uoid;
      name: string;
      runtime: Uoid;
      description?: string;
      capabilities?: readonly Uoid[];
      memory?: readonly Uoid[];
      createdBy?: string;
    } = {
      composition,
      name,
      runtime,
    };
    
    if (description) createParams.description = description;
    if (capabilities) createParams.capabilities = capabilities;
    if (memory) createParams.memory = memory;
    if (createdBy) createParams.createdBy = createdBy;
    
    const agent = createAgent(createParams);
    
    this.agents.set(agent.uoid.toString(), { agent });
    
    return agent;
  }

  /**
   * Get an agent by UOID
   */
  get(uoid: Uoid): RegisteredAgent | undefined {
    return this.agents.get(uoid.toString());
  }

  /**
   * Get all agents
   */
  getAll(): readonly RegisteredAgent[] {
    return [...this.agents.values()];
  }

  /**
   * Find agent by name
   */
  findByName(name: string): RegisteredAgent | undefined {
    for (const reg of this.agents.values()) {
      if (reg.agent.name === name) {
        return reg;
      }
    }
    return undefined;
  }

  /**
   * Check if an agent is registered
   */
  has(uoid: Uoid): boolean {
    return this.agents.has(uoid.toString());
  }

  /**
   * Unregister an agent
   */
  unregister(uoid: Uoid): boolean {
    return this.agents.delete(uoid.toString());
  }

  /**
   * Clear all registered agents
   */
  clear(): void {
    this.agents.clear();
  }

  /**
   * Get total count of registered agents
   */
  get size(): number {
    return this.agents.size;
  }
}

/**
 * Create a global agent registry singleton
 */
let globalRegistry: AgentRegistry | null = null;

export function getAgentRegistry(): AgentRegistry {
  if (!globalRegistry) {
    globalRegistry = new AgentRegistry();
  }
  return globalRegistry;
}

export function resetAgentRegistry(): void {
  globalRegistry = null;
}