/**
 * MMOS McpCapabilityEngine - Model Context Protocol Capability Implementation
 * Per ADR-010: Capability as Contract
 *
 * Supports external MCP servers that provide tools/resources via the Model Context Protocol.
 * This engine acts as a client to MCP servers, wrapping their tools as MMOS capabilities.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

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

export interface McpCapabilityEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly servers?: readonly McpServerConfig[];
  readonly connectionTimeout?: number;
  readonly requestTimeout?: number;
}

export interface McpServerConfig {
  readonly name: string;
  readonly command: string;
  readonly args?: readonly string[];
  readonly env?: Record<string, string>;
  readonly transport?: 'stdio' | 'sse';
  readonly url?: string;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown> | undefined;
}

interface McpJsonRpcMessage {
  jsonrpc: '2.0';
  id: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface McpServerConnection {
  config: McpServerConfig;
  process: ChildProcess;
  emitter: EventEmitter;
  connected: boolean;
  tools: McpTool[];
  requestId: number;
  buffer: string;
}

/**
 * McpCapabilityEngine - Connects MCP servers and wraps their tools as capabilities
 *
 * The Model Context Protocol (MCP) allows AI models to discover and invoke
 * tools provided by external servers. This engine acts as an MCP client.
 *
 * @example
 * ```typescript
 * const engine = new McpCapabilityEngine({
 *   servers: [{
 *     name: 'filesystem',
 *     command: 'npx',
 *     args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
 *   }],
 * });
 *
 * // Tools from the filesystem MCP server are automatically registered
 * const result = await engine.invoke({
 *   capabilityUoid: createUoid('cap'),
 *   input: { tool: 'read_file', path: '/workspace/test.txt' },
 * });
 * ```
 */
export class McpCapabilityEngine implements CapabilityEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedCategories: readonly string[];

  private readonly servers: Map<string, McpServerConnection> = new Map();
  private readonly tools: Map<string, { serverName: string; tool: McpTool }> = new Map();
  private readonly connectionTimeout: number;
  private readonly requestTimeout: number;

  constructor(options: McpCapabilityEngineOptions = {}) {
    this.name = options.name ?? 'McpCapabilityEngine';
    this.version = options.version ?? '1.0.0';
    this.supportedCategories = ['mcp', 'tool', 'function'];
    this.connectionTimeout = options.connectionTimeout ?? 10_000;
    this.requestTimeout = options.requestTimeout ?? 30_000;

    // Connect to configured servers
    if (options.servers) {
      for (const server of options.servers) {
        this.connectServer(server).catch(() => {
          // Server connection failures are logged but don't crash
          console.warn(`[McpCapabilityEngine] Failed to connect to MCP server: ${server.name}`);
        });
      }
    }
  }

  async invoke(params: CapabilityEngineParams): Promise<CapabilityEngineResult> {
    const toolName = params.input.toolName as string ?? params.input.tool as string;
    const toolArgs = params.input.arguments as Record<string, unknown> ?? params.input.params as Record<string, unknown> ?? {};

    if (!toolName) {
      throw new Error('MCP tool name is required. Provide it as input.toolName or input.tool.');
    }

    const entry = this.tools.get(toolName);
    if (!entry) {
      throw new Error(`MCP tool not found: ${toolName}. Available tools: ${[...this.tools.keys()].join(', ')}`);
    }

    const server = this.servers.get(entry.serverName);
    if (!server || !server.connected) {
      throw new Error(`MCP server '${entry.serverName}' is not connected`);
    }

    const response = await this.sendRequest(server, 'tools/call', {
      name: toolName,
      arguments: toolArgs,
    });

    const result = response.result as { content?: Array<{ type: string; text?: string; data?: unknown }>; isError?: boolean } | undefined;

    const content = result?.content ?? [];
    const textContent = content
      .filter(c => c.type === 'text')
      .map(c => c.text ?? '')
      .join('\n');

    return {
      output: {
        content: textContent,
        raw: result,
        toolName,
      },
      metadata: {
        engine: this.name,
        server: entry.serverName,
        tool: toolName,
        isError: result?.isError ?? false,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async canHandle(capabilityUoid: Uoid): Promise<boolean> {
    const toolName = this.extractToolName(capabilityUoid);
    return this.tools.has(toolName);
  }

  async getCapabilitySchema(capabilityUoid: Uoid): Promise<CapabilitySchema | null> {
    const toolName = this.extractToolName(capabilityUoid);
    const entry = this.tools.get(toolName);

    if (!entry) return null;

    const tool = entry.tool;
    const inputSchema = tool.inputSchema as Record<string, unknown> | undefined;
    const properties = (inputSchema?.properties as Record<string, unknown>) ?? {};

    const inputs: readonly CapabilityInput[] = Object.entries(properties).map(([name, prop]) => {
      const p = prop as Record<string, unknown>;
      return {
        name,
        type: (p.type as string) ?? 'string',
        description: p.description as string | undefined,
        required: ((inputSchema?.required as string[] | undefined)?.includes(name)) ?? false,
      } as CapabilityInput;
    });

    return {
      uoid: {} as Uoid,
      name: tool.name,
      category: 'mcp',
      provider: `${this.name}/${entry.serverName}`,
      inputs,
      outputs: [{ name: 'content', type: 'string', description: tool.description ?? 'Tool output' }],
      version: '1.0.0',
    };
  }

  async healthCheck(): Promise<EngineHealth> {
    const connectedServers = [...this.servers.values()].filter(s => s.connected);
    const totalServers = this.servers.size;
    const totalTools = this.tools.size;

    return {
      healthy: connectedServers.length > 0 || totalServers === 0,
      details: {
        name: this.name,
        version: this.version,
        servers: totalServers,
        connected: connectedServers.length,
        tools: totalTools,
        serverNames: [...this.servers.keys()],
      },
    };
  }

  /**
   * Connect to an MCP server
   */
  async connectServer(config: McpServerConfig): Promise<void> {
    if (this.servers.has(config.name)) {
      throw new Error(`MCP server already connected: ${config.name}`);
    }

    if (config.transport === 'sse' && config.url) {
      return this.connectSSE(config);
    }

    return this.connectStdio(config);
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnectServer(name: string): Promise<void> {
    const server = this.servers.get(name);
    if (!server) return;

    // Remove tools from this server
    for (const [toolName, entry] of this.tools) {
      if (entry.serverName === name) {
        this.tools.delete(toolName);
      }
    }

    server.process.kill('SIGTERM');
    this.servers.delete(name);
  }

  /**
   * Get list of available MCP tools
   */
  getAvailableTools(): readonly { server: string; tool: McpTool }[] {
    return [...this.tools.entries()].map(([name, entry]) => ({
      server: entry.serverName,
      tool: { name, description: entry.tool.description, inputSchema: entry.tool.inputSchema },
    }));
  }

  private async connectStdio(config: McpServerConfig): Promise<void> {
    const env: Record<string, string | undefined> = {
      ...process.env as Record<string, string | undefined>,
      ...config.env,
    };

    const child = spawn(config.command, config.args ?? [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env as NodeJS.ProcessEnv,
    });

    const emitter = new EventEmitter();
    const server: McpServerConnection = {
      config,
      process: child,
      emitter,
      connected: false,
      tools: [],
      requestId: 0,
      buffer: '',
    };

    this.servers.set(config.name, server);

    child.stdout?.on('data', (data: Buffer) => {
      server.buffer += data.toString('utf-8');
      const messages = server.buffer.split('\n');
      server.buffer = messages.pop() ?? '';

      for (const msg of messages) {
        if (!msg.trim()) continue;
        try {
          const parsed = JSON.parse(msg) as McpJsonRpcMessage;
          server.emitter.emit(`response:${parsed.id}`, parsed);
        } catch {
          // Ignore malformed JSON
        }
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      // MCP servers may log to stderr; we ignore it
    });

    child.on('close', (code) => {
      server.connected = false;
      server.emitter.emit('close', code);
      this.servers.delete(config.name);

      // Remove tools
      for (const [toolName, entry] of [...this.tools]) {
        if (entry.serverName === config.name) {
          this.tools.delete(toolName);
        }
      }
    });

    child.on('error', (err) => {
      server.connected = false;
      server.emitter.emit('error', err);
    });

    // Initialize MCP connection
    try {
      const initResponse = await this.sendRequest(server, 'initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'mmos-mcp-engine', version: '1.0.0' },
      });

      const initResult = initResponse.result as { capabilities?: Record<string, unknown> } | undefined;

    // List available tools
      const toolsResponse = await this.sendRequest(server, 'tools/list', {});
      const toolsResult = toolsResponse.result as { tools?: Array<{ name: string; description?: string; inputSchema?: Record<string, unknown> }> } | undefined;

      if (toolsResult?.tools) {
      for (const tool of toolsResult.tools) {
        const fullTool: McpTool = {
          name: tool.name,
          description: tool.description ?? '',
          inputSchema: tool.inputSchema ?? undefined,
        };
        this.tools.set(tool.name, { serverName: config.name, tool: fullTool });
        server.tools.push(fullTool);
      }
      }

      server.connected = true;
    } catch (err) {
      child.kill('SIGTERM');
      this.servers.delete(config.name);
      throw err;
    }
  }

  private async connectSSE(config: McpServerConfig): Promise<void> {
    throw new Error('SSE transport for MCP is not yet implemented. Use stdio transport.');
  }

  private sendRequest(server: McpServerConnection, method: string, params?: Record<string, unknown>): Promise<McpJsonRpcMessage> {
    return new Promise((resolve, reject) => {
      const id = ++server.requestId;
    const message: McpJsonRpcMessage = {
      jsonrpc: '2.0',
      id,
      ...{ method, ...(params !== undefined ? { params } : {}) },
    } as McpJsonRpcMessage;

      const timeout = setTimeout(() => {
        server.emitter.removeAllListeners(`response:${id}`);
        reject(new Error(`MCP request timed out after ${this.requestTimeout}ms: ${method}`));
      }, this.requestTimeout);

      server.emitter.once(`response:${id}`, (response: McpJsonRpcMessage) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(`MCP error: ${response.error.message} (code: ${response.error.code})`));
        } else {
          resolve(response);
        }
      });

      // Write to stdin
      const json = JSON.stringify(message) + '\n';
      server.process.stdin?.write(json);
    });
  }

  private extractToolName(uoid: Uoid): string {
    const str = uoid.toString();
    // Parse tool name from UOID like "mcp:tool:filesystem_read"
    const parts = str.split(':');
    return parts[parts.length - 1] ?? str;
  }
}