/**
 * MMOS OpenAIRuntimeEngine - OpenAI-Compatible API Implementation
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
  type ToolCall,
  type TokenUsage,
} from '@mmos/sdk';

export interface OpenAIRuntimeEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly organization?: string;
  readonly defaultModel?: string;
  readonly defaultParameters?: Record<string, unknown>;
  readonly timeout?: number;
  readonly maxRetries?: number;
}

interface OpenAIErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

interface OpenAICompletionChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
    tool_calls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAICompletionChoice[];
  usage?: OpenAIUsage;
}

interface OpenAIStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: 'function';
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | null;
  }>;
  usage?: OpenAIUsage;
}

/**
 * OpenAIRuntimeEngine - Executes prompts via OpenAI-compatible APIs
 *
 * Supports any OpenAI-compatible provider (OpenAI, Azure OpenAI, Together AI, etc.)
 * by configurable baseUrl and apiKey.
 *
 * @example
 * ```typescript
 * const engine = new OpenAIRuntimeEngine({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   defaultModel: 'gpt-4o',
 * });
 *
 * const result = await engine.execute({
 *   prompt: 'Hello, world!',
 *   model: 'gpt-4o',
 * });
 * ```
 */
export class OpenAIRuntimeEngine implements RuntimeEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedModels: readonly string[];

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly organization: string | undefined;
  private readonly defaultModel: string;
  private readonly defaultParameters: Record<string, unknown>;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(options: OpenAIRuntimeEngineOptions = {}) {
    this.name = options.name ?? 'OpenAIRuntimeEngine';
    this.version = options.version ?? '1.0.0';
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY ?? process.env.AZURE_OPENAI_API_KEY ?? '';
    this.baseUrl = options.baseUrl ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    this.organization = options.organization ?? process.env.OPENAI_ORGANIZATION;
    this.defaultModel = options.defaultModel ?? process.env.OPENAI_DEFAULT_MODEL ?? 'gpt-4o';
    this.defaultParameters = options.defaultParameters ?? { temperature: 0.7 };
    this.timeout = options.timeout ?? 120_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.supportedModels = options.defaultModel
      ? [options.defaultModel]
      : ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  async execute(params: RuntimeEngineParams): Promise<RuntimeEngineResult> {
    const model = params.model || this.defaultModel;
    const messages = this.buildMessages(params);
    const tools = params.tools?.length ? this.formatTools(params.tools) : undefined;

    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: params.maxTokens ?? 4096,
      temperature: params.temperature ?? (this.defaultParameters.temperature as number ?? 0.7),
      ...(this.defaultParameters as Record<string, unknown>),
      ...(params.parameters as Record<string, unknown> ?? {}),
    };

    if (tools) {
      body.tools = tools;
    }

    const data = await this.makeRequest<OpenAICompletionResponse>('/chat/completions', body);
    return this.parseResponse(data);
  }

  async *executeStream(params: RuntimeEngineParams): AsyncIterableIterator<RuntimeEngineChunk> {
    const model = params.model || this.defaultModel;
    const messages = this.buildMessages(params);
    const tools = params.tools?.length ? this.formatTools(params.tools) : undefined;

    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: params.maxTokens ?? 4096,
      temperature: params.temperature ?? (this.defaultParameters.temperature as number ?? 0.7),
      stream: true,
      stream_options: { include_usage: true },
      ...(this.defaultParameters as Record<string, unknown>),
      ...(params.parameters as Record<string, unknown> ?? {}),
    };

    if (tools) {
      body.tools = tools;
    }

    const response = await this.makeStreamRequest('/chat/completions', body);

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
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6)) as OpenAIStreamChunk;
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
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return {
          healthy: false,
          details: {
            name: this.name,
            version: this.version,
            status: response.status,
            error: errorBody.slice(0, 200),
          },
        };
      }

      return {
        healthy: true,
        latencyMs: Date.now() - start,
        details: {
          name: this.name,
          version: this.version,
          baseUrl: this.baseUrl,
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

  private buildMessages(params: RuntimeEngineParams): Message[] {
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

  private formatTools(tools: readonly ToolDefinition[]): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters as Record<string, unknown>,
      },
    }));
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }

    return headers;
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
          const errorBody = (await response.json().catch(() => ({}))) as OpenAIErrorResponse;
          throw new Error(
            `OpenAI API error (${response.status}): ${errorBody.error?.message ?? response.statusText}`
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
      const errorBody = (await response.json().catch(() => ({}))) as OpenAIErrorResponse;
      throw new Error(
        `OpenAI API error (${response.status}): ${errorBody.error?.message ?? response.statusText}`
      );
    }

    return response;
  }

  private parseResponse(data: OpenAICompletionResponse): RuntimeEngineResult {
    const choice = data.choices[0];
    if (!choice) {
      throw new Error('No choices in OpenAI response');
    }

    const content = choice.message.content ?? '';
    const finishReason: 'stop' | 'length' | 'tool_calls' | 'error' = this.mapFinishReason(choice.finish_reason);
    const toolCalls: readonly ToolCall[] | undefined = choice.message.tool_calls?.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }));

    const usage: TokenUsage | undefined = data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined;

    return {
      content,
      ...(toolCalls !== undefined ? { toolCalls: toolCalls as readonly ToolCall[] } : {}),
      ...(finishReason !== undefined ? { finishReason } : {}),
      ...(usage !== undefined ? { usage } : {}),
      ...{ metadata: { model: data.model, engine: this.name, id: data.id, created: data.created, timestamp: new Date().toISOString() } },
    };
  }

  private parseStreamChunk(chunk: OpenAIStreamChunk): RuntimeEngineChunk | null {
    const choice = chunk.choices?.[0];
    if (!choice) return null;

    const delta = choice.delta;
    const content = delta.content ?? '';

    const toolCalls = delta.tool_calls?.map(tc => ({
      id: tc.id ?? `call_${Date.now()}_${tc.index}`,
      type: 'function' as const,
      function: {
        name: tc.function?.name ?? '',
        arguments: tc.function?.arguments ?? '',
      },
    })) as readonly ToolCall[] | undefined;

    const usage: TokenUsage | undefined = chunk.usage
      ? {
          promptTokens: chunk.usage.prompt_tokens,
          completionTokens: chunk.usage.completion_tokens,
          totalTokens: chunk.usage.total_tokens,
        }
      : undefined;

    return {
      content,
      done: choice.finish_reason !== null,
      toolCalls: toolCalls ?? [],
      usage: usage ?? undefined,
    } as RuntimeEngineChunk;
  }

  private mapFinishReason(
    reason: OpenAICompletionChoice['finish_reason']
  ): 'stop' | 'length' | 'tool_calls' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  private isRetryable(error: Error): boolean {
    const retryableMessages = [
      '429',       // Rate limit
      '500',       // Server error
      '502',       // Bad gateway
      '503',       // Service unavailable
      'timeout',   // Timeout
      'rate_limit', // Rate limit
      'internal',  // Internal server error
    ];

    return retryableMessages.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
}