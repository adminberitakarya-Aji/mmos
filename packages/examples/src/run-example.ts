/**
 * MMOS Examples - Shared Example Runner
 * 
 * This is a helper module for running examples with common configuration.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { OUTPUT_DIR, createLogger, type ExampleConfig, type LogLevel } from './types.js';

/**
 * Create output directory if it doesn't exist
 */
export function ensureOutputDir(config?: Partial<ExampleConfig>): string {
  const dir = config?.outputDir || OUTPUT_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Save output to file
 */
export function saveOutputFile(
  outputDir: string,
  filename: string,
  content: string
): void {
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`  ✓ ${filename}`);
}

/**
 * Save JSON output
 */
export function saveJsonOutput(
  outputDir: string,
  filename: string,
  data: unknown
): void {
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  ✓ ${filename}`);
}

/**
 * Run configuration options
 */
export interface RunOptions {
  /**
   * Example name for display
   */
  exampleName: string;
  
  /**
   * Default configuration
   */
  defaultInput: Record<string, unknown>;
  
  /**
   * CLI flags configuration
   */
  flags: Record<string, { type: 'string' | 'boolean' | 'array'; description: string }>;
  
  /**
   * Run function
   */
  run: (input: Record<string, unknown>, config: Partial<ExampleConfig>) => Promise<void>;
}

/**
 * Read a required CLI flag value out of argv, exiting with a clear error
 * instead of silently accepting `undefined`. `process.exit` is typed as
 * `never`, so after this call TypeScript narrows the result to `string`
 * (not `string | undefined`) for every caller under `exactOptionalPropertyTypes`.
 */
function requireArgValue(args: readonly string[], index: number, flagLabel: string): string {
  const value = args[index];
  if (value === undefined) {
    console.error(`\n❌ Error: --${flagLabel} requires a value\n`);
    process.exit(1);
  }
  return value;
}

/**
 * Run an example with common configuration
 */
export async function runExample(options: RunOptions): Promise<void> {
  const { exampleName, defaultInput, flags, run } = options;
  
  // Parse args
  const args = process.argv.slice(2);
  const input: Record<string, unknown> = { ...defaultInput };
  const config: Partial<ExampleConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      printHelp(exampleName, flags);
      process.exit(0);
    }
    
    if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
      config.logLevel = 'debug';
      continue;
    }
    
    if (arg === '--log-level' && i + 1 < args.length) {
      config.logLevel = requireArgValue(args, ++i, 'log-level') as LogLevel;
      continue;
    }
    
    if (arg === '--output-dir' && i + 1 < args.length) {
      config.outputDir = requireArgValue(args, ++i, 'output-dir');
      continue;
    }
    
    for (const [flag, flagConfig] of Object.entries(flags)) {
      if (arg === `--${flag}`) {
        if (flagConfig.type === 'boolean') {
          input[flag] = true;
        } else if (flagConfig.type === 'string' && i + 1 < args.length) {
          input[flag] = requireArgValue(args, ++i, flag);
        } else if (flagConfig.type === 'array' && i + 1 < args.length) {
          input[flag] = requireArgValue(args, ++i, flag).split(',');
        }
      }
    }
  }
  
  // Validate required inputs
  if (!input.topic && !input.command) {
    console.error(`\n❌ Error: --topic or command is required\n`);
    printHelp(exampleName, flags);
    process.exit(1);
  }
  
  // Create logger
  const logger = createLogger(config);
  
  console.log(`\n🚀 ${exampleName}`);
  console.log('─'.repeat(50));
  
  try {
    await run(input, config);
    console.log('\n✅ Completed successfully!');
  } catch (error) {
    logger.error('Execution failed:', error);
    process.exit(1);
  }
}

function printHelp(
  exampleName: string,
  flags: Record<string, { type: string; description: string }>
): void {
  console.log(`
${exampleName}

Usage:
  npm run run -- [options]

Options:
  --help, -h              Show this help message
  --verbose, -v           Enable verbose logging
  --log-level <level>     Set log level (debug, info, warn, error)
  --output-dir <dir>      Set output directory

Example-specific options:`);
  
  for (const [flag, flagConfig] of Object.entries(flags)) {
    const typeStr = flagConfig.type === 'boolean' ? '' : ` <${flagConfig.type}>`;
    console.log(`  --${flag}${typeStr}              ${flagConfig.description}`);
  }
  
  console.log();
}

/**
 * Format and display result preview
 */
export function displayPreview(title: string, content: string, maxLength = 200): void {
  console.log(`\n📋 ${title}`);
  console.log('─'.repeat(50));
  const preview = content.length > maxLength 
    ? content.slice(0, maxLength) + '...'
    : content;
  console.log(preview);
  console.log();
}

/**
 * Display result summary
 */
export function displaySummary(summary: Record<string, unknown>): void {
  console.log('\n📊 Summary');
  console.log('─'.repeat(50));
  for (const [key, value] of Object.entries(summary)) {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    if (Array.isArray(value)) {
      console.log(`  ${formattedKey}: ${value.length} items`);
    } else if (typeof value === 'object' && value !== null) {
      console.log(`  ${formattedKey}: ${JSON.stringify(value)}`);
    } else {
      console.log(`  ${formattedKey}: ${value}`);
    }
  }
}