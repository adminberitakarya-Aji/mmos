/**
 * MMOS HttpCapabilityEngine - REST/GraphQL Capability Implementation
 * Per ADR-010: Capability as Contract
 */

import type { Uoid } from '@mmos/sdk';
import {
  type CapabilityEngine,
  type CapabilityEngineParams,
  type CapabilityEngineResult,
  type CapabilitySchema,
  type CapabilityInput,
  type CapabilityOutput,
  type EngineHealth,
} from '@mmos/sdk';

export interface HttpCapabilityEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly defaultTimeout?: number;
  readonly defaultHeaders?: Record<string, string>;
  readonly maxRetries?: number;
}

export interface HttpEndpointConfig {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly url: string;
  readonly headers?: Record<string, string>;
  readonly queryParams?: Record<string, string>;
  readonly bodyTemplate?: Record<string, unknown>;
  readonly responsePath?: string;
  readonly auth?: {
    type: 'none' | 'apiKey' | 'bearer' | 'basic';
    apiKeyHeader?: string;
    apiKeyValue?: string;
  };
}

interface RegisteredEndpoint {
  name: string;
  category: string;
  config: HttpEndpointConfig;
  schema: CapabilitySchema;
}

/**
 * HttpCapabilityEngine - Invokes REST/GraphQL APIs as capabilities
 *
 * @example
 * ```typescript
 * const engine = new HttpCapabilityEngine();
 *
 * engine.register('web.search', 'web-search', 'search', {
 *   method: 'POST',
 *   url: 'https://api.example.com/search',
 *   headers: { 'Content-Type': 'application/json' },
 *   auth: { type: 'apiKey', apiKeyHeader: 'X-API-Key', apiKeyValue: 'my-key' },
 * });
 *
 * const result = await engine.invoke({
 *   capabilityUoid: createUoid('cap'),
 *   input: { query: 'MMOS framework' },
 * });
 * ```
 */
export class HttpCapabilityEngine implements CapabilityEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedCategories: readonly string[];

  private readonly endpoints: Map<string, RegisteredEndpoint> = new Map();
  private readonly defaultTimeout: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly maxRetries: number;

  constructor(options: HttpCapabilityEngineOptions = {}) {
    this.name = options.name ?? 'HttpCapabilityEngine';
    this.version = options.version ?? '1.0.0';
    this.supportedCategories = ['http', 'rest', 'graphql', 'api', 'web'];
    this.defaultTimeout = options.defaultTimeout ?? 30_000;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.maxRetries = options.maxRetries ?? 2;
  }

  register(
    name: string,
    category: string,
    endpointConfig: HttpEndpointConfig,
    inputSchema?: Record<string, unknown>,
    outputSchema?: Record<string, unknown>
  ): void {
    const uoid = `http:${category}:${name}`;
    const inputs: readonly CapabilityInput[] = inputSchema
      ? Object.entries((inputSchema as Record<string, unknown>).properties as Record<string, unknown> ?? {}).map(([name, prop]) => {
          const p = prop as Record<string, unknown>;
          return {
            name,
            type: (p.type as string) ?? 'string',
            description: p.description as string | undefined,
            required: ((inputSchema as Record<string, unknown>).required as string[] | undefined)?.includes(name) ?? false,
          } as CapabilityInput;
        })
      : [];

    const outputs: readonly CapabilityOutput[] = outputSchema
      ? Object.entries((outputSchema as Record<string, unknown>).properties as Record<string, unknown> ?? {}).map(([name, prop]) => {
          const p = prop as Record<string, unknown>;
          return {
            name,
            type: (p.type as string) ?? 'string',
            description: p.description as string | undefined,
          } as CapabilityOutput;
        })
      : [];

    const schema: CapabilitySchema = {
      uoid: {} as Uoid,
      name,
      category,
      provider: this.name,
      inputs,
      outputs,
      version: '1.0.0',
    };

    this.endpoints.set(uoid, { name, category, config: endpointConfig, schema });
  }

  async invoke(params: CapabilityEngineParams): Promise<CapabilityEngineResult> {
    const key = `http:${params.input.category as string ?? 'unknown'}:${params.input.name as string ?? params.capabilityUoid.toString()}`;
    const endpoint = this.endpoints.get(key) ?? this.findEndpointByUoid(params.capabilityUoid);

    if (!endpoint) {
      throw new Error(`HTTP endpoint not found for capability: ${params.capabilityUoid}. Register it first with register().`);
    }

    const config = endpoint.config;
    const url = this.buildUrl(config, params.input);
    const headers = { ...this.defaultHeaders, ...config.headers };
    const body = this.buildBody(config, params.input);

    // Add auth headers
    if (config.auth) {
      const auth = config.auth;
      if (auth.type === 'apiKey' && auth.apiKeyHeader && auth.apiKeyValue) {
        headers[auth.apiKeyHeader] = auth.apiKeyValue;
      } else if (auth.type === 'bearer') {
        headers['Authorization'] = `Bearer ${auth.apiKeyValue ?? ''}`;
      }
    }

    // Merge params.config into headers if provided
    if (params.config?.headers) {
      Object.assign(headers, params.config.headers as Record<string, string>);
    }

    const timeout = params.timeout ?? this.defaultTimeout;

    // Execute with retry
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        const fetchBody = config.method !== 'GET' && config.method !== 'DELETE' ? JSON.stringify(body) : null;
        const response = await fetch(url, {
          method: config.method,
          headers,
          body: fetchBody,
          signal: AbortSignal.timeout(timeout),
        } as RequestInit);

        const contentType = response.headers.get('content-type') ?? '';
        let responseBody: unknown;

        if (contentType.includes('application/json')) {
          responseBody = await response.json();
        } else {
          responseBody = await response.text();
        }

        if (!response.ok) {
          throw new Error(
            `HTTP ${config.method} ${url} failed (${response.status}): ${JSON.stringify(responseBody).slice(0, 200)}`
          );
        }

        // Extract response at path if specified
        const output = config.responsePath
          ? this.getValueAtPath(responseBody as Record<string, unknown>, config.responsePath)
          : responseBody;

        return {
          output: typeof output === 'object' && output !== null
            ? output as Record<string, unknown>
            : { result: output },
          metadata: {
            engine: this.name,
            method: config.method,
            url,
            status: response.status,
            attempt,
          },
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt <= this.maxRetries && this.isRetryable(lastError)) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw lastError;
      }
    }

    throw lastError ?? new Error('Request failed');
  }

  async canHandle(capabilityUoid: Uoid): Promise<boolean> {
    return this.findEndpointByUoid(capabilityUoid) !== undefined;
  }

  async getCapabilitySchema(capabilityUoid: Uoid): Promise<CapabilitySchema | null> {
    const endpoint = this.findEndpointByUoid(capabilityUoid);
    return endpoint?.schema ?? null;
  }

  async healthCheck(): Promise<EngineHealth> {
    return {
      healthy: true,
      details: {
        name: this.name,
        version: this.version,
        registeredEndpoints: this.endpoints.size,
      },
    };
  }

  private findEndpointByUoid(uoid: Uoid): RegisteredEndpoint | undefined {
    const key = uoid.toString();
    return this.endpoints.get(key);
  }

  private buildUrl(config: HttpEndpointConfig, input: Record<string, unknown>): string {
    let url = config.url;

    // Template substitution
    for (const [key, value] of Object.entries(input)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    }

    // Query params
    const queryParams = { ...config.queryParams };
    for (const [key, value] of Object.entries(input)) {
      if (!queryParams[key]) {
        queryParams[key] = String(value);
      }
    }

    const queryString = Object.entries(queryParams)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return url;
  }

  private buildBody(config: HttpEndpointConfig, input: Record<string, unknown>): Record<string, unknown> {
    const body = { ...(config.bodyTemplate ?? {}) };

    // Merge input into body
    for (const [key, value] of Object.entries(input)) {
      // Skip keys used in URL template or query params
      if (config.url.includes(`{${key}}`) || config.queryParams?.[key]) {
        continue;
      }
      body[key] = value;
    }

    return body;
  }

  private getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
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

  /**
   * Clear all registered endpoints
   */
  clear(): void {
    this.endpoints.clear();
  }

  /**
   * Get count of registered endpoints
   */
  get size(): number {
    return this.endpoints.size;
  }
}