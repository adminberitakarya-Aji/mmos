/**
 * MMOS News Production Example - Types and Interfaces
 */

export interface NewsInput {
  topic: string;
  language?: string;
  category?: string;
  publish?: boolean;
}

export interface NewsOutput {
  readonly article: string;
  readonly headline: string;
  readonly summary: string;
  readonly metadata: NewsMetadata;
  readonly thumbnailUrl: string | undefined;
  readonly seoReport: SeoReport | undefined;
  readonly publicationPackage: PublicationPackage;
}

export interface NewsMetadata {
  title: string;
  category: string;
  slug: string;
  tags: string[];
  publishedAt?: string;
  readingTime?: number;
  wordCount?: number;
}

export interface SeoReport {
  keyword: string;
  density: number;
  score: number;
  suggestions: string[];
}

export interface ResearchResult {
  sources: string[];
  keyFacts: string[];
  statistics: Record<string, number>;
  citations: string[];
}

export interface VerificationResult {
  verified: boolean;
  verifiedFacts: VerifiedFact[];
  unverifiedClaims: string[];
  confidenceScore: number;
}

export interface VerifiedFact {
  statement: string;
  source: string;
  verifiedAt: string;
}

export interface HeadlineResult {
  headline: string;
  subheadlines: string[];
  category: string;
}

export interface DraftResult {
  content: string;
  wordCount: number;
  sections: string[];
}

export interface EditorialReview {
  approved: boolean;
  issues: EditorialIssue[];
  suggestions: string[];
  score: number;
}

export interface EditorialIssue {
  type: 'factual' | 'style' | 'legal' | 'clarity';
  location: string;
  description: string;
  suggestion?: string;
}

export interface PublicationPackage {
  articleFile: string;
  headlineFile: string;
  summaryFile: string;
  metadataFile: string;
  thumbnailFile?: string;
  seoReportFile?: string;
}

export interface NewsGenerationConfig {
  openaiApiKey?: string;
  newsApiKey?: string;
  outputDir?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_CONFIG: NewsGenerationConfig = {
  outputDir: './output',
  logLevel: 'info',
};