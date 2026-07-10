/**
 * MMOS Domain Models - Main Export
 * Per IMS-100: Universal Object Model
 */

export * from './identity.js';
export * from './metadata.js';

// Composition
export type { Composition, CompositionSpec } from './composition.js';
export { createComposition, addWorkflow, addAgent, setEntryWorkflow } from './composition.js';

// Workflow
export type { Workflow, WorkflowSpec, WorkflowTransition, WorkflowTaskRef } from './workflow.js';
export { createWorkflow, addTask, addTransition, setEntryTask, getNextTasks } from './workflow.js';
export type { RetryPolicy as WorkflowRetryPolicy } from './workflow.js';

// Task
export type { Task, TaskSpec, HumanTaskConfig } from './task.js';
export { createTask, withInput, withRetryPolicy } from './task.js';
export type { RetryPolicy as TaskRetryPolicy } from './task.js';

// Agent
export type { Agent, AgentSpec, AgentPolicies, PlanningConfig } from './agent.js';
export { createAgent, addCapability, addMemory, withPolicies } from './agent.js';
export type { RetryPolicy as AgentRetryPolicy } from './agent.js';

// Execution
export type { Execution, ExecutionSpec, ExecutionConfig, ExecutionContext } from './execution.js';
export { createExecution, startExecution, completeExecution, failExecution, updateExecutionContext, setTaskOutput, setVariable } from './execution.js';

// Runtime
export type { Runtime, RuntimeSpec, ProviderConfig, RuntimeLimits } from './runtime.js';
export { createRuntime, withProvider, withLimits, withFallback } from './runtime.js';

// Capability
export type { Capability, CapabilitySpec, CapabilityInput, CapabilityOutput, AuthConfig } from './capability.js';
export { createCapability, addInput, addOutput, withConfig as withCapabilityConfig } from './capability.js';

// Memory
export type { Memory, MemorySpec, MemoryEntry, MemoryQuery } from './memory.js';
export { createMemory, withConfig as withMemoryConfig, withTTL } from './memory.js';

// Artifact
export type { Artifact, ArtifactSpec, StorageRef } from './artifact.js';
export { createArtifact, withStorage, withChecksum } from './artifact.js';

// Event
export type { Event, EventSpec } from './event.js';
export { createEvent, withCorrelation, withCausation, withTags } from './event.js';
