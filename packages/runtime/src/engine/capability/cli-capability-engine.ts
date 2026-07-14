/**
 * MMOS CliCapabilityEngine - Shell Command Execution Capability
 * Per ADR-010: Capability as Contract
 */

import { exec, execFile, type ExecOptions, type ExecFileOptions } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Manually-typed promise wrappers instead of `util.promisify(exec)` /
 * `util.promisify(execFile)`. Node's typings overload those functions on
 * the shape of the options object (encoding, shell, etc.), and promisify
 * only picks one overload — which forces awkward `as unknown as X` casts at
 * every call site to fight the type checker. Wrapping manually keeps the
 * types simple and correct: options in, `{ stdout, stderr }` (always
 * strings) out, and the original error (with stdout/stderr attached) on
 * failure so existing error-handling below keeps working unchanged.
 */
function execAsync(command: string, options: ExecOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        Object.assign(error, { stdout: stdout.toString(), stderr: stderr.toString() });
        reject(error);
        return;
      }
      resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
    });
  });
}

function execFileAsync(
  file: string,
  args: readonly string[],
  options: ExecFileOptions
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args as string[], options, (error, stdout, stderr) => {
      if (error) {
        Object.assign(error, { stdout: stdout.toString(), stderr: stderr.toString() });
        reject(error);
        return;
      }
      resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
    });
  });
}

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



export interface CliCapabilityEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly defaultTimeout?: number;
  readonly allowedCommands?: readonly string[];
  readonly workingDirectory?: string;
  readonly maxOutputSize?: number;
}

export interface CliCommandConfig {
  readonly command: string;
  readonly args?: readonly string[];
  readonly shell?: boolean;
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly timeout?: number;
}

interface RegisteredCliCommand {
  name: string;
  category: string;
  config: CliCommandConfig;
  schema: CapabilitySchema;
}

/**
 * CliCapabilityEngine - Executes shell commands as capabilities
 *
 * Handles input/output via:
 * - Command-line arguments
 * - Environment variables
 * - Temporary files (for large inputs)
 * - stdin/stdout/stderr
 *
 * @example
 * ```typescript
 * const engine = new CliCapabilityEngine({
 *   allowedCommands: ['ffmpeg', 'imagemagick', 'python'],
 * });
 *
 * engine.register('image.resize', 'media', {
 *   command: 'ffmpeg',
 *   args: ['-i', '{input}', '-vf', 'scale={width}:{height}', '{output}'],
 * });
 *
 * const result = await engine.invoke({
 *   capabilityUoid: createUoid('cap'),
 *   input: {
 *     input: '/path/to/image.jpg',
 *     width: 800,
 *     height: 600,
 *     output: '/path/to/resized.jpg',
 *   },
 * });
 * ```
 */
export class CliCapabilityEngine implements CapabilityEngine {
  readonly name: string;
  readonly version: string;
  readonly supportedCategories: readonly string[];

  private readonly commands: Map<string, RegisteredCliCommand> = new Map();
  private readonly defaultTimeout: number;
  private readonly allowedCommands: readonly string[] | undefined;
  private readonly workingDirectory: string;
  private readonly maxOutputSize: number;

  constructor(options: CliCapabilityEngineOptions = {}) {
    this.name = options.name ?? 'CliCapabilityEngine';
    this.version = options.version ?? '1.0.0';
    this.supportedCategories = ['cli', 'shell', 'command', 'system'];
    this.defaultTimeout = options.defaultTimeout ?? 60_000;
    this.allowedCommands = options.allowedCommands;
    this.workingDirectory = options.workingDirectory ?? process.cwd();
    this.maxOutputSize = options.maxOutputSize ?? 10 * 1024 * 1024; // 10MB
  }

  register(
    name: string,
    category: string,
    config: CliCommandConfig,
    inputSchema?: Record<string, unknown>,
    outputSchema?: Record<string, unknown>
  ): void {
    const uoid = `cli:${category}:${name}`;

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

    this.commands.set(uoid, { name, category, config, schema });
  }

  async invoke(params: CapabilityEngineParams): Promise<CapabilityEngineResult> {
    const key = `cli:${params.input.category as string ?? 'unknown'}:${params.input.name as string ?? params.capabilityUoid.toString()}`;
    const registered = this.commands.get(key) ?? this.findByUoid(params.capabilityUoid);

    if (!registered) {
      throw new Error(`CLI command not found for capability: ${params.capabilityUoid}. Register it first with register().`);
    }

    const config = registered.config;

    // Validate command is allowed
    if (this.allowedCommands) {
      const baseCommand = config.command.split(' ')[0] ?? config.command;
      const isAllowed = this.allowedCommands.some(
        allowed => baseCommand.startsWith(allowed)
      );
      if (!isAllowed) {
        throw new Error(
          `Command '${baseCommand}' is not in the allowed list: [${this.allowedCommands.join(', ')}]`
        );
      }
    }

    // Build resolved args with template substitution. Each argument is kept
    // as a separate array element — never concatenated into one string —
    // so a value like "foo.jpg; rm -rf /" is passed through as a single
    // literal argument, not interpreted as two shell commands.
    const input = params.input;
    const resolvedArgs = (config.args ?? []).map(arg => this.resolveTemplate(arg, input));

    // Build environment
    const env: Record<string, string | undefined> = {
      ...process.env as Record<string, string | undefined>,
      ...config.env,
    };

    // Add input variables as environment variables
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        env[`INPUT_${key.toUpperCase()}`] = String(value);
      }
    }

    // Handle stdin input if provided
    let stdinInput: string | undefined;
    if (typeof input.stdin === 'string') {
      stdinInput = input.stdin as string;
    } else if (typeof input.input === 'string') {
      stdinInput = input.input as string;
    }

    const timeout = params.timeout ?? config.timeout ?? this.defaultTimeout;
    const cwd = config.cwd ?? this.workingDirectory;

    // SECURITY: shell is opt-in and OFF by default.
    //
    // Previously this always ran via `exec()` with `shell: true`, joining
    // command + resolved args into one string. Any shell metacharacter
    // (`;`, `|`, `&&`, `$(...)`, backticks, `>` ...) present in a resolved
    // template value — which can come from task input, i.e. attacker- or
    // AI-generated content — was interpreted by the shell. That's arbitrary
    // command execution, not just "running the registered command".
    //
    // By default we now use `execFile()`, which invokes the binary directly
    // with argv passed as an array. There is no shell in the loop at all, so
    // there is nothing for injected metacharacters to be interpreted *by* —
    // "foo.jpg; rm -rf /" arrives at the child process as one literal
    // argument, not two commands.
    //
    // `config.shell: true` remains available for commands that genuinely
    // need shell features (pipes, redirects, globbing), but every
    // substituted value is shell-escaped first so it still can't break out
    // of its argument position.
    const useShell = config.shell === true;

    try {
      // Write stdin to temp file if provided and execute
      let tempDir: string | undefined;

      if (stdinInput && stdinInput.length > 1024) {
        tempDir = await mkdtemp(join(tmpdir(), 'mmos-cli-'));
        const stdinFile = join(tempDir, 'stdin.txt');
        await writeFile(stdinFile, stdinInput, 'utf-8');
        env['MMOS_STDIN_FILE'] = stdinFile;
      }

      let stdout: string;
      let stderr: string;

      if (useShell) {
        const commandStr = [config.command, ...resolvedArgs.map(a => this.shellEscape(a))].join(' ');
        const execOptions: ExecOptions = {
          cwd,
          env: env as NodeJS.ProcessEnv,
          timeout,
          maxBuffer: this.maxOutputSize,
        };
        ({ stdout, stderr } = await execAsync(commandStr, execOptions));
      } else {
        const execFileOptions: ExecFileOptions = {
          cwd,
          env: env as NodeJS.ProcessEnv,
          timeout,
          maxBuffer: this.maxOutputSize,
        };
        ({ stdout, stderr } = await execFileAsync(config.command, resolvedArgs, execFileOptions));
      }

      // Cleanup temp dir
      if (tempDir) {
        rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }

      const output: Record<string, unknown> = {
        stdout: stdout.slice(0, this.maxOutputSize),
        ...(stderr ? { stderr: stderr.slice(0, this.maxOutputSize) } : {}),
        exitCode: 0,
      };

      return {
        output,
        metadata: {
          engine: this.name,
          command: config.command,
          timeout,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err) {
      const possibleExecError = err as Record<string, unknown> | null | undefined;
      if (possibleExecError && typeof possibleExecError === 'object' && 'stdout' in possibleExecError && 'stderr' in possibleExecError) {
        const execErr = possibleExecError as { stdout: string; stderr: string; code?: number };
        return {
          output: {
            stdout: execErr.stdout.slice(0, this.maxOutputSize),
            stderr: execErr.stderr.slice(0, this.maxOutputSize),
            exitCode: execErr.code ?? 1,
          },
          metadata: {
            engine: this.name,
            command: config.command,
            error: (err as Error).message,
            timestamp: new Date().toISOString(),
          },
        };
      }
      throw err;
    }
  }

  async canHandle(capabilityUoid: Uoid): Promise<boolean> {
    return this.findByUoid(capabilityUoid) !== undefined;
  }

  async getCapabilitySchema(capabilityUoid: Uoid): Promise<CapabilitySchema | null> {
    const registered = this.findByUoid(capabilityUoid);
    return registered?.schema ?? null;
  }

  async healthCheck(): Promise<EngineHealth> {
    return {
      healthy: true,
      details: {
        name: this.name,
        version: this.version,
        registeredCommands: this.commands.size,
        allowedCommands: this.allowedCommands?.length ?? 'unrestricted',
      },
    };
  }

  private findByUoid(uoid: Uoid): RegisteredCliCommand | undefined {
    const key = uoid.toString();
    return this.commands.get(key);
  }

  private resolveTemplate(template: string, input: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = input[key];
      if (value === undefined || value === null) {
        return match;
      }
      return String(value);
    });
  }

  /**
   * POSIX shell-quote a single argument: wrap in single quotes and escape
   * any embedded single quote, so the value is treated as one literal
   * argument even by a shell. Only used when `config.shell: true` is
   * explicitly opted into (e.g. a command that needs pipes or redirects).
   * Note: this targets POSIX shells (sh/bash); it does not cover cmd.exe
   * quoting rules on Windows — prefer the default non-shell mode there.
   */
  private shellEscape(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
  }

  /**
   * Clear all registered commands
   */
  clear(): void {
    this.commands.clear();
  }

  /**
   * Get count of registered commands
   */
  get size(): number {
    return this.commands.size;
  }
}