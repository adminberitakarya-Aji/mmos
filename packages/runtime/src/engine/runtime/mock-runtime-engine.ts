/**
 * MMOS MockRuntimeEngine - Testing Implementation
 * Per ADR-005: Provider Agnostic
 */

import type { Uoid } from '@mmos/sdk';
import {
  type RuntimeEngine,
  type RuntimeEngineParams,
  type RuntimeEngineResult,
  type EngineHealth,
} from '@mmos/sdk';

export interface MockRuntimeEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly supportedModels?: readonly string[];
  readonly defaultResponse?: string;
  readonly simulateLatency?: boolean;
  readonly latencyMs?: number;
}

export class MockRuntimeEngine implements RuntimeEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedModels: readonly string[];
  private readonly defaultResponse: string;
  private readonly simulateLatency: boolean;
  private readonly latencyMs: number;

  constructor(options: MockRuntimeEngineOptions = {}) {
    this.name = options.name ?? 'MockRuntimeEngine';
    this.version = options.version ?? '1.0.0';
    this.supportedModels = options.supportedModels ?? ['mock-model', 'gpt-4-mock', 'claude-mock'];
    this.defaultResponse = options.defaultResponse ?? 'This is a mock response from MockRuntimeEngine.';
    this.simulateLatency = options.simulateLatency ?? false;
    this.latencyMs = options.latencyMs ?? 100;
  }

  async execute(params: RuntimeEngineParams): Promise<RuntimeEngineResult> {
    if (this.simulateLatency) {
      await this.delay(this.latencyMs);
    }

    // Generate mock response
    const content = this.generateResponse(params);

    return {
      content,
      usage: {
        promptTokens: this.countTokens(params.prompt),
        completionTokens: this.countTokens(content),
        totalTokens: this.countTokens(params.prompt) + this.countTokens(content),
      },
      finishReason: 'stop',
      metadata: {
        model: params.model,
        engine: this.name,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async *executeStream(params: RuntimeEngineParams): AsyncIterable<{
    content: string;
    done: boolean;
    toolCalls: readonly [] | undefined;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;
  }> {
    const response = this.generateResponse(params);
    const words = response.split(' ');

    for (let i = 0; i < words.length; i++) {
      yield {
        content: words[i] + (i < words.length - 1 ? ' ' : ''),
        done: i === words.length - 1,
        toolCalls: undefined,
        usage: i === words.length - 1 ? {
          promptTokens: this.countTokens(params.prompt),
          completionTokens: this.countTokens(response),
          totalTokens: this.countTokens(params.prompt) + this.countTokens(response),
        } : undefined,
      };
    }
  }

  async healthCheck(): Promise<EngineHealth> {
    return {
      healthy: true,
      latencyMs: Math.random() * 10,
      details: {
        name: this.name,
        version: this.version,
        simulateLatency: this.simulateLatency,
      },
    };
  }

  private generateResponse(params: RuntimeEngineParams): string {
    // Check for tool calls in prompt
    if (params.tools && params.tools.length > 0) {
      return JSON.stringify({
        toolCalls: [
          {
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: params.tools[0]!.function.name,
              arguments: '{"input":"sample input"}',
            },
          },
        ],
      });
    }

    // Include system prompt context if available
    let response = this.defaultResponse;
    if (params.systemPrompt) {
      response = `[Based on system instructions]: ${response}`;
    }

    // Echo back prompt context for testing
    if (params.prompt.includes('[TEST:')) {
      const match = params.prompt.match(/\[TEST:(.*?)\]/);
      if (match) {
        response = `Mock response for test: ${match[1]}`;
      }
    }

    return response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private countTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}