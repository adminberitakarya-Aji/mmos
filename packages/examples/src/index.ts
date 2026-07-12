/**
 * MMOS Examples - Shared Module Index
 */

// Re-export types and utilities
export {
  createLogger,
  parseExampleArgs,
  slugify,
  getTimestamp,
  getOutputPrefix,
  DEFAULT_CONFIG,
  OUTPUT_DIR,
  type ExampleConfig,
  type LogLevel,
} from './types.js';

// Re-export runner utilities
export {
  ensureOutputDir,
  saveOutputFile,
  saveJsonOutput,
  runExample,
  displayPreview,
  displaySummary,
  type RunOptions,
} from './run-example.js';