/**
 * MMOS Social Media - Content Adapt Capability Stub
 */

import type { Platform, PlatformContent, PlatformPost, CaptionResult } from '../types.js';

export interface ContentAdaptInput {
  captions: CaptionResult;
  hashtags: string[];
  cta: string;
  platform: Platform;
}

export interface ContentAdaptCapability {
  adapt(input: ContentAdaptInput): Promise<PlatformContent>;
}

export function createContentAdaptCapability(): ContentAdaptCapability {
  return {
    async adapt(input: ContentAdaptInput): Promise<PlatformContent> {
      const { platform, hashtags } = input;
      
      console.log(`[ContentAdaptCapability] Adapting content for: ${platform}`);
      
      const adaptedHashtags = adaptHashtagsForPlatform(hashtags, platform);
      const imageFormat = getImageFormatForPlatform(platform);
      
      return {
        platform,
        adaptedCaption: input.captions.captions[0] || '',
        adaptedHashtags,
        imageFormat,
      };
    },
  };
}

function adaptHashtagsForPlatform(hashtags: string[], platform: Platform): string[] {
  const maxHashtags: Record<Platform, number> = {
    instagram: 30,
    facebook: 3,
    x: 5,
    linkedin: 5,
  };
  
  return hashtags.slice(0, maxHashtags[platform]);
}

function getImageFormatForPlatform(platform: Platform): string {
  const formats: Record<Platform, string> = {
    instagram: '1080x1080 PNG',
    facebook: '1200x630 PNG',
    x: '1600x900 PNG',
    linkedin: '1200x627 PNG',
  };
  return formats[platform];
}