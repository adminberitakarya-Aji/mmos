/**
 * RuntimeEngine Base Classes and Utilities
 * Per ADR-005: Provider Agnostic - Depend on Contracts, Never on Providers
 */

import { RuntimeEngine, RuntimeEngineParams, RuntimeEngineResult, EngineHealth, TokenUsage, Message, ToolDefinition, ToolCall } from './index.js';

export abstract class BaseRuntimeEngine implements RuntimeEngine {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly supportedModels: readonly string[];

  abstract execute(params: RuntimeEngineParams): Promise<RuntimeEngineResult>;
  
  async *executeStream(params: RuntimeEngineParams): AsyncIterableIterator<RuntimeEngineChunk> {
    const result = await this.execute(params);
    yield { content: result.content, done: true, toolCalls: result.toolCalls, usage: result.usage };
  }

  async healthCheck(): Promise<EngineHealth> {
    try {
      const start = Date.now();
      await this.execute({ prompt: 'ping', model: this.supportedModels[0] ?? '', maxTokens: 1 });
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false };
    }
  }

  protected calculateUsage(promptTokens: number, completionTokens: number): TokenUsage {
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  protected formatMessages(params: RuntimeEngineParams): Message[] {
    const messages: Message[] = [];
    
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }
    
    if (params.messages) {
      messages.push(...params.messages);
    } else {
      messages.push({ role: 'user', content: params.prompt });
    }
    
    return messages;
  }
}

export interface RuntimeEngineChunk {
  readonly content: string;
  readonly done: boolean;
  readonly toolCalls: readonly ToolCall[] | undefined;
  readonly usage: TokenUsage | undefined;
}

export interface RuntimeEngineConfig {
  readonly apiKey: string | undefined;
  readonly baseUrl: string | undefined;
  readonly organization: string | undefined;
  readonly defaultModel: string | undefined;
  readonly defaultParameters: Record<string, unknown> | undefined;
  readonly timeout: number | undefined;
  readonly maxRetries: number | undefined;
}

export function createRuntimeEngineConfig(config: Partial<RuntimeEngineConfig> = {}): RuntimeEngineConfig {
  return {
    apiKey: config.apiKey ?? '',
    baseUrl: config.baseUrl ?? 'https://api.openai.com/v1',
    organization: config.organization,
    defaultModel: config.defaultModel ?? 'gpt-4o',
    defaultParameters: config.defaultParameters ?? { temperature: 0.7 },
    timeout: config.timeout ?? 120000,
    maxRetries: config.maxRetries ?? 3,
  };
}
