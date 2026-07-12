/**
 * MMOS AnthropicRuntimeEngine - Anthropic API Implementation
 * Per ADR-005: Provider Agnostic - Depend on Contracts, Never on Providers
 */

import {
  type RuntimeEngine,
  type RuntimeEngineParams,
  type RuntimeEngineResult,
  type EngineHealth,
  type RuntimeEngineChunk,
  type ToolDefinition,
  type Message,
  type TokenUsage,
} from '@mmos/sdk';

export interface AnthropicRuntimeEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly defaultModel?: string;
  readonly defaultParameters?: Record<string, unknown>;
  readonly timeout?: number;
  readonly maxRetries?: number;
}

interface AnthropicErrorResponse {
  error?: {
    message?: string;
    type?: string;
  };
}

interface AnthropicContent {
  type: 'text' | 'tool_use';
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
  id?: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
}

interface AnthropicMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicContent[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;
  usage: AnthropicUsage;
}

interface AnthropicStreamChunk {
  type: 'content_block_delta' | 'content_block_start' | 'content_block_stop' | 'message_delta' | 'message_start' | 'ping';
  delta?: {
    text?: string;
    stop_reason?: string;
  };
  content_block?: AnthropicContent;
  index?: number;
  message?: AnthropicMessageResponse;
  usage?: AnthropicUsage;
}

/**
 * AnthropicRuntimeEngine - Executes prompts via the Anthropic API
 *
 * Supports Claude models (claude-3-opus, claude-3-sonnet, claude-3-haiku, etc.)
 *
 * @example
 * ```typescript
 * const engine = new AnthropicRuntimeEngine({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   defaultModel: 'claude-3-opus-latest',
 * });
 *
 * const result = await engine.execute({
 *   prompt: 'Hello, Claude!',
 *   model: 'claude-3-opus-latest',
 * });
 * ```
 */
export class AnthropicRuntimeEngine implements RuntimeEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedModels: readonly string[];

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParameters: Record<string, unknown>;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly anthropicVersion: string;

  constructor(options: AnthropicRuntimeEngineOptions = {}) {
    this.name = options.name ?? 'AnthropicRuntimeEngine';
    this.version = options.version ?? '1.0.0';
    this.apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.baseUrl = options.baseUrl ?? process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1';
    this.defaultModel = options.defaultModel ?? process.env.ANTHROPIC_DEFAULT_MODEL ?? 'claude-3-haiku-latest';
    this.defaultParameters = options.defaultParameters ?? { temperature: 0.7, max_tokens: 4096 };
    this.timeout = options.timeout ?? 120_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.anthropicVersion = '2023-06-01';
    this.supportedModels = options.defaultModel
      ? [options.defaultModel]
      : ['claude-3-opus-latest', 'claude-3-sonnet-latest', 'claude-3-haiku-latest', 'claude-2.1', 'claude-instant-1.2'];
  }

  async execute(params: RuntimeEngineParams): Promise<RuntimeEngineResult> {
    const model = params.model || this.defaultModel;
    const body = this.buildRequestBody(params, model);

    const data = await this.makeRequest<AnthropicMessageResponse>('/messages', body);
    return this.parseResponse(data);
  }

  async *executeStream(params: RuntimeEngineParams): AsyncIterableIterator<RuntimeEngineChunk> {
    const model = params.model || this.defaultModel;
    const body: Record<string, unknown> = {
      ...this.buildRequestBody(params, model),
      stream: true,
    };

    const response = await this.makeStreamRequest('/messages', body);

    if (!response.body) {
      throw new Error('Response body is null - streaming not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6)) as AnthropicStreamChunk;
            const chunk = this.parseStreamChunk(json);

            if (chunk) {
              yield chunk;
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async healthCheck(): Promise<EngineHealth> {
    try {
      const start = Date.now();
      // Use a simple ping with minimal tokens
      await this.execute({
        prompt: 'ping',
        model: this.defaultModel,
        maxTokens: 1,
      });

      return {
        healthy: true,
        latencyMs: Date.now() - start,
        details: {
          name: this.name,
          version: this.version,
          defaultModel: this.defaultModel,
        },
      };
    } catch (err) {
      return {
        healthy: false,
        details: {
          name: this.name,
          version: this.version,
          error: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  private buildRequestBody(params: RuntimeEngineParams, model: string): Record<string, unknown> {
    const systemPrompt = params.systemPrompt;
    const messages = this.buildMessages(params);

    const body: Record<string, unknown> = {
      model,
      max_tokens: params.maxTokens ?? (this.defaultParameters.max_tokens as number ?? 4096),
      messages,
      ...(this.defaultParameters as Record<string, unknown>),
      ...(params.parameters as Record<string, unknown> ?? {}),
    };

    // Remove max_tokens from spread if already set explicitly
    if (body.max_tokens === undefined) {
      body.max_tokens = 4096;
    }

    // Remove temperature from spread if already set
    if (body.temperature === undefined) {
      body.temperature = 0.7;
    }

    // Add system as top-level parameter (Anthropic API)
    if (systemPrompt) {
      body.system = systemPrompt;
    }

    // Add tools if provided
    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map(t => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters as Record<string, unknown>,
      }));
    }

    return body;
  }

  private buildMessages(params: RuntimeEngineParams): Array<{ role: string; content: string }> {
    if (params.messages) {
      return params.messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));
    }

    return [{ role: 'user' as const, content: params.prompt }];
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': this.anthropicVersion,
    };
  }

  private async makeRequest<T>(path: string, body: unknown): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${path}`, {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({}))) as AnthropicErrorResponse;
          throw new Error(
            `Anthropic API error (${response.status}): ${errorBody.error?.message ?? response.statusText}`
          );
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < this.maxRetries && this.isRetryable(lastError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError ?? new Error('Max retries exceeded');
  }

  private async makeStreamRequest(path: string, body: unknown): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as AnthropicErrorResponse;
      throw new Error(
        `Anthropic API error (${response.status}): ${errorBody.error?.message ?? response.statusText}`
      );
    }

    return response;
  }

  private parseResponse(data: AnthropicMessageResponse): RuntimeEngineResult {
    const textContent = data.content
      .filter(c => c.type === 'text')
      .map(c => c.text ?? '')
      .join('\n');

    const toolUseBlocks = data.content.filter(c => c.type === 'tool_use');
    const toolCalls = toolUseBlocks.length > 0
      ? toolUseBlocks.map(tc => ({
          id: tc.id ?? `toolu_${Date.now()}`,
          type: 'function' as const,
          function: {
            name: tc.name ?? '',
            arguments: JSON.stringify(tc.input ?? {}),
          },
        }))
      : undefined;

    const finishReason = this.mapFinishReason(data.stop_reason);

    const usage: TokenUsage = {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    };

    return {
      content: textContent,
      ...(toolCalls !== undefined ? { toolCalls: toolCalls as readonly { id: string; type: 'function'; function: { name: string; arguments: string } }[] } : {}),
      ...(finishReason !== undefined ? { finishReason } : {}),
      ...{ usage },
      ...{ metadata: { model: data.model, engine: this.name, id: data.id, timestamp: new Date().toISOString() } },
    };
  }

  private parseStreamChunk(chunk: AnthropicStreamChunk): RuntimeEngineChunk | null {
    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
      return {
        content: chunk.delta.text,
        done: false,
        toolCalls: [],
        usage: undefined,
      };
    }

    if (chunk.type === 'message_delta') {
      const usage: TokenUsage | undefined = chunk.usage
        ? {
            promptTokens: 0,
            completionTokens: chunk.usage.output_tokens,
            totalTokens: chunk.usage.output_tokens,
          }
        : undefined;

      return {
        content: '',
        done: chunk.delta?.stop_reason !== undefined,
        toolCalls: [],
        ...(usage !== undefined ? { usage } : {}),
      } as RuntimeEngineChunk;
    }

    return null;
  }

  private mapFinishReason(
    reason: AnthropicMessageResponse['stop_reason']
  ): 'stop' | 'length' | 'tool_calls' | 'error' | undefined {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      case 'stop_sequence':
        return 'stop';
      default:
        return undefined;
    }
  }

  private isRetryable(error: Error): boolean {
    const retryableMessages = [
      '429',       // Rate limit
      '500',       // Server error
      '529',       // Overloaded
      'timeout',   // Timeout
      'rate_limit', // Rate limit
      'overloaded', // Overloaded
      'internal',  // Internal server error
    ];

    return retryableMessages.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
}