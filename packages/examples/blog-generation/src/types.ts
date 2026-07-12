/**
 * MMOS Blog Generation Example - Types and Interfaces
 */

export interface BlogInput {
  topic: string;
  language?: string;
  length?: number;
  output?: 'markdown' | 'html';
  includeImage?: boolean;
}

export interface BlogOutput {
  readonly article: string;
  readonly metadata: BlogMetadata;
  readonly imageUrl: string | undefined;
  readonly seoReport: SeoReport | undefined;
}

export interface BlogMetadata {
  title: string;
  metaDescription: string;
  slug: string;
  tags: string[];
  readingTime?: number;
  wordCount?: number;
  publishedAt?: string;
}

export interface SeoReport {
  keyword: string;
  density: number;
  score: number;
  suggestions: string[];
}

export interface ResearchResult {
  sources: string[];
  keyPoints: string[];
  statistics: Record<string, number>;
  citations: string[];
}

export interface OutlineResult {
  title: string;
  sections: OutlineSection[];
  estimatedLength: number;
}

export interface OutlineSection {
  heading: string;
  subheadings: string[];
  keywords: string[];
}

export interface DraftResult {
  content: string;
  wordCount: number;
  sections: string[];
}

export interface ReviewResult {
  approved: boolean;
  issues: ReviewIssue[];
  suggestions: string[];
  score: number;
}

export interface ReviewIssue {
  type: 'grammar' | 'style' | 'clarity' | 'accuracy';
  location: string;
  description: string;
  suggestion?: string;
}

export interface PackageResult {
  files: OutputFile[];
  bundle: string;
}

export interface OutputFile {
  name: string;
  path: string;
  content: string;
  type: 'markdown' | 'json' | 'image';
}

/**
 * Configuration for the blog generation runtime
 */
export interface BlogGenerationConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  tavilyApiKey?: string;
  outputDir?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: BlogGenerationConfig = {
  outputDir: './output',
  logLevel: 'info',
};