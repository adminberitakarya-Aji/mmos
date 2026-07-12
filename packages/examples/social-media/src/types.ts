/**
 * MMOS Social Media Example - Types and Interfaces
 */

export type Platform = 'instagram' | 'facebook' | 'x' | 'linkedin';

export interface SocialInput {
  topic: string;
  audience?: string;
  language?: string;
  platforms?: Platform[];
  includeImage?: boolean;
}

export interface SocialOutput {
  posts: PlatformPost[];
  hashtags: string[];
  cta: string;
  imageUrl: string | undefined;
  metadata: SocialMetadata;
  publishingPackage: PublishingPackage;
}

export interface PlatformPost {
  platform: Platform;
  caption: string;
  hashtags: string[];
  cta: string;
}

export interface SocialMetadata {
  campaign: string;
  audience: string;
  platforms: Platform[];
  generatedAt: string;
  totalPosts: number;
}

export interface CampaignBrief {
  topic: string;
  keyMessages: string[];
  targetUrl?: string;
  brandVoice?: string;
}

export interface AudienceProfile {
  demographics: {
    ageRange: string;
    interests: string[];
    location: string;
  };
  preferences: {
    tone: string;
    contentStyle: string;
    engagementHours: string[];
  };
  insights: string[];
}

export interface CaptionResult {
  captions: string[];
  tone: string;
}

export interface HashtagResult {
  hashtags: string[];
  trending: string[];
  niche: string[];
}

export interface ImageResult {
  imageUrl: string;
  altText: string;
  dimensions: { width: number; height: number };
}

export interface PlatformContent {
  platform: Platform;
  adaptedCaption: string;
  adaptedHashtags: string[];
  imageFormat: string;
}

export interface PublishingPackage {
  posts: OutputFile[];
  imageFile: string | undefined;
  metadataFile: string;
}

export interface OutputFile {
  name: string;
  platform: Platform;
  content: string;
}

export interface SocialConfig {
  openaiApiKey?: string;
  outputDir?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_CONFIG: SocialConfig = {
  outputDir: './output',
  logLevel: 'info',
};