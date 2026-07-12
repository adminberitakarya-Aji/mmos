/**
 * MMOS LocalRuntimeEngine - Ollama / llama.cpp / Local Model Implementation
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

export interface LocalRuntimeEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly baseUrl?: string;
  readonly defaultModel?: string;
  readonly defaultParameters?: Record<string, unknown>;
  readonly timeout?: number;
  readonly maxRetries?: number;
  readonly provider?: 'ollama' | 'llamacpp' | 'openai-compat';
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * LocalRuntimeEngine - Executes prompts via local model providers
 *
 * Supports:
 * - Ollama (default): http://localhost:11434
 * - llama.cpp server: http://localhost:8080
 * - Any OpenAI-compatible local endpoint
 *
 * @example
 * ```typescript
 * const engine = new LocalRuntimeEngine({
 *   provider: 'ollama',
 *   baseUrl: 'http://localhost:11434',
 *   defaultModel: 'llama3.2',
 * });
 *
 * const result = await engine.execute({
 *   prompt: 'Hello, local model!',
 *   model: 'llama3.2',
 * });
 * ```
 */
export class LocalRuntimeEngine implements RuntimeEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedModels: readonly string[];

  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParameters: Record<string, unknown>;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly provider: 'ollama' | 'llamacpp' | 'openai-compat';

  constructor(options: LocalRuntimeEngineOptions = {}) {
    this.name = options.name ?? 'LocalRuntimeEngine';
    this.version = options.version ?? '1.0.0';
    this.provider = options.provider ?? 'ollama';
    this.baseUrl = options.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.defaultModel = options.defaultModel ?? process.env.LOCAL_MODEL ?? 'llama3.2';
    this.defaultParameters = options.defaultParameters ?? { temperature: 0.7 };
    this.timeout = options.timeout ?? 300_000; // Local models can be slow
    this.maxRetries = options.maxRetries ?? 2;
    this.supportedModels = options.defaultModel
      ? [options.defaultModel]
      : ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'mixtral', 'phi3'];
  }

  async execute(params: RuntimeEngineParams): Promise<RuntimeEngineResult> {
    const model = params.model || this.defaultModel;

    switch (this.provider) {
      case 'ollama':
        return this.executeOllama(params, model);
      case 'llamacpp':
        return this.executeLlamacpp(params, model);
      case 'openai-compat':
        return this.executeOpenAICompat(params, model);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async *executeStream(params: RuntimeEngineParams): AsyncIterableIterator<RuntimeEngineChunk> {
    const model = params.model || this.defaultModel;

    if (this.provider === 'ollama') {
      yield* this.streamOllama(params, model);
    } else {
      // Fallback: execute non-streaming and yield single chunk
      const result = await this.execute(params);
      yield {
        content: result.content,
        done: true,
        toolCalls: result.toolCalls ?? [],
        usage: result.usage ?? undefined,
      } as RuntimeEngineChunk;
    }
  }

  async healthCheck(): Promise<EngineHealth> {
    try {
      const start = Date.now();

      if (this.provider === 'ollama') {
        const response = await fetch(`${this.baseUrl}/api/tags`, {
          signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
          return { healthy: false, details: { provider: this.provider, error: response.statusText } };
        }

        const data = await response.json() as { models?: Array<{ name: string }> };
        return {
          healthy: true,
          latencyMs: Date.now() - start,
          details: {
            provider: this.provider,
            baseUrl: this.baseUrl,
            defaultModel: this.defaultModel,
            availableModels: (data.models ?? []).map(m => m.name),
          },
        };
      }

      // OpenAI-compat and llamacpp use /models endpoint
      const response = await fetch(`${this.baseUrl}/models`, {
        signal: AbortSignal.timeout(10_000),
      });

      return {
        healthy: response.ok,
        latencyMs: Date.now() - start,
        details: { provider: this.provider, baseUrl: this.baseUrl, defaultModel: this.defaultModel },
      };
    } catch (err) {
      return {
        healthy: false,
        details: {
          provider: this.provider,
          baseUrl: this.baseUrl,
          error: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  private async executeOllama(params: RuntimeEngineParams, model: string): Promise<RuntimeEngineResult> {
    const messages = this.buildMessages(params);
    const body: Record<string, unknown> = {
      model,
      messages,
      stream: false,
      options: {
        temperature: params.temperature ?? (this.defaultParameters.temperature as number ?? 0.7),
        num_predict: params.maxTokens ?? 4096,
        ...(this.defaultParameters as Record<string, unknown>),
        ...(params.parameters as Record<string, unknown> ?? {}),
      },
    };

    const data = await this.makeRequest<OllamaChatResponse>('/api/chat', body);

    const usage: TokenUsage = {
      promptTokens: data.prompt_eval_count ?? 0,
      completionTokens: data.eval_count ?? 0,
      totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
    };

    return {
      content: data.message?.content ?? '',
      usage,
      finishReason: data.done ? 'stop' : 'length',
      metadata: {
        model: data.model,
        engine: this.name,
        provider: 'ollama',
        duration: data.total_duration,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async *streamOllama(params: RuntimeEngineParams, model: string): AsyncIterableIterator<RuntimeEngineChunk> {
    const messages = this.buildMessages(params);
    const body: Record<string, unknown> = {
      model,
      messages,
      stream: true,
      options: {
        temperature: params.temperature ?? (this.defaultParameters.temperature as number ?? 0.7),
        num_predict: params.maxTokens ?? 4096,
        ...(this.defaultParameters as Record<string, unknown>),
        ...(params.parameters as Record<string, unknown> ?? {}),
      },
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.body) {
      throw new Error('Response body is null - streaming not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(l => l.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaChatResponse;
            yield {
              content: data.message?.content ?? '',
              done: data.done,
              toolCalls: [],
              usage: data.done ? {
                promptTokens: data.prompt_eval_count ?? 0,
                completionTokens: data.eval_count ?? 0,
                totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
              } : undefined,
            } as RuntimeEngineChunk;
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async executeLlamacpp(params: RuntimeEngineParams, model: string): Promise<RuntimeEngineResult> {
    const prompt = this.buildPrompt(params);
    const body: Record<string, unknown> = {
      prompt,
      temperature: params.temperature ?? (this.defaultParameters.temperature as number ?? 0.7),
      n_predict: params.maxTokens ?? 4096,
      stop: ['\n\n'],
      ...(this.defaultParameters as Record<string, unknown>),
      ...(params.parameters as Record<string, unknown> ?? {}),
    };

    // Add model if llamacpp supports it
    if (model) {
      body.model = model;
    }

    const data = await this.makeRequest<{ content: string; tokens_predicted?: number; tokens_evaluated?: number; stop: boolean }>('/completion', body);

    const usage: TokenUsage = {
      promptTokens: data.tokens_evaluated ?? 0,
      completionTokens: data.tokens_predicted ?? 0,
      totalTokens: (data.tokens_evaluated ?? 0) + (data.tokens_predicted ?? 0),
    };

    return {
      content: data.content ?? '',
      usage,
      finishReason: data.stop ? 'stop' : 'length',
      metadata: {
        model,
        engine: this.name,
        provider: 'llamacpp',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async executeOpenAICompat(params: RuntimeEngineParams, model: string): Promise<RuntimeEngineResult> {
    const messages = this.buildMessages(params);
    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: params.maxTokens ?? 4096,
      temperature: params.temperature ?? (this.defaultParameters.temperature as number ?? 0.7),
      ...(this.defaultParameters as Record<string, unknown>),
      ...(params.parameters as Record<string, unknown> ?? {}),
    };

    const data = await this.makeRequest<{
      choices: Array<{
        message: { content: string | null };
        finish_reason: string;
      }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    }>('/chat/completions', body);

    const choice = data.choices[0];
    if (!choice) {
      throw new Error('No choices in response');
    }

    const usage: TokenUsage | undefined = data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined;

    return {
      content: choice.message.content ?? '',
      ...(usage !== undefined ? { usage } : {}),
      finishReason: 'stop',
      metadata: {
        model,
        engine: this.name,
        provider: 'openai-compat',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private buildMessages(params: RuntimeEngineParams): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }

    if (params.messages) {
      messages.push(...params.messages.map(m => ({
        role: m.role,
        content: m.content,
      })));
    } else {
      messages.push({ role: 'user', content: params.prompt });
    }

    return messages;
  }

  private buildPrompt(params: RuntimeEngineParams): string {
    let prompt = '';
    if (params.systemPrompt) {
      prompt += `System: ${params.systemPrompt}\n\n`;
    }
    prompt += `User: ${params.prompt}\n\nAssistant: `;
    return prompt;
  }

  private async makeRequest<T>(path: string, body: unknown): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(
            `Local model API error (${response.status}): ${errorBody.slice(0, 200) || response.statusText}`
          );
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < this.maxRetries && this.isRetryable(lastError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError ?? new Error('Max retries exceeded');
  }

  private isRetryable(error: Error): boolean {
    const retryableMessages = [
      '429',
      '500',
      '502',
      '503',
      'timeout',
      'econnrefused',
      'econnreset',
      'eaddrinuse',
    ];

    return retryableMessages.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
}