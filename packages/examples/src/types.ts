/**
 * MMOS Examples - Shared Types and Utilities
 */

/**
 * Common output directory path
 */
export const OUTPUT_DIR = './output';

/**
 * Default log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Example configuration
 */
export interface ExampleConfig {
  outputDir: string;
  logLevel: LogLevel;
  verbose: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: ExampleConfig = {
  outputDir: OUTPUT_DIR,
  logLevel: 'info',
  verbose: false,
};

/**
 * Logger utility
 */
export function createLogger(config: Partial<ExampleConfig> = {}) {
  const { logLevel = 'info', verbose = false } = config;
  
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };
  
  const currentLevel = levels[logLevel];
  
  return {
    debug: (message: string, ...args: unknown[]) => {
      if (verbose && currentLevel <= levels.debug) {
        console.log(`[DEBUG] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: unknown[]) => {
      if (currentLevel <= levels.info) {
        console.log(`[INFO] ${message}`, ...args);
      }
    },
    warn: (message: string, ...args: unknown[]) => {
      if (currentLevel <= levels.warn) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },
    error: (message: string, ...args: unknown[]) => {
      if (currentLevel <= levels.error) {
        console.error(`[ERROR] ${message}`, ...args);
      }
    },
  };
}

/**
 * Parse command line arguments for examples
 */
export function parseExampleArgs<T extends Record<string, unknown>>(
  args: string[],
  defaults: T,
  options: {
    flags: Record<string, { type: 'string' | 'boolean' | 'array'; key: keyof T }>;
  }
): T {
  const result = { ...defaults };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    for (const [flag, config] of Object.entries(options.flags)) {
      if (arg === `--${flag}` || arg === `-${flag[0]}`) {
        if (config.type === 'boolean') {
          (result as Record<string, unknown>)[config.key as string] = true;
        } else if (config.type === 'string' && i + 1 < args.length) {
          (result as Record<string, unknown>)[config.key as string] = args[++i];
        } else if (config.type === 'array' && i + 1 < args.length) {
          (result as Record<string, unknown>)[config.key as string] = args[++i].split(',');
        }
      }
    }
  }
  
  return result;
}

/**
 * Slugify a string for use in filenames
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Format timestamp for filenames
 */
export function getTimestamp(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate output filename prefix
 */
export function getOutputPrefix(slug: string): string {
  return `${getTimestamp()}-${slug}`;
}