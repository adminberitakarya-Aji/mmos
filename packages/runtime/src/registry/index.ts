/**
 * MMOS Runtime - Registry Module
 * Per ADR-004: Engine Separation
 * 
 * This module provides registries for:
 * - Capabilities: Manage external capability registrations
 * - Agents: Manage agent definitions
 * - Workflows: Manage workflow templates
 * - Plugins: Support for custom engines
 */

// Re-export all registries
export { CapabilityRegistry, getCapabilityRegistry, resetCapabilityRegistry, type RegisteredCapability, type CapabilityRegistryOptions } from './capability-registry.js';
export { AgentRegistry, getAgentRegistry, resetAgentRegistry, type RegisteredAgent, type AgentRegistryOptions } from './agent-registry.js';
export { WorkflowRegistry, getWorkflowRegistry, resetWorkflowRegistry, type RegisteredWorkflow, type WorkflowRegistryOptions } from './workflow-registry.js';