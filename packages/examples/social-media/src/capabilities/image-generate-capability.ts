/**
 * MMOS Social Media - Image Generate Capability Stub
 */

import type { ImageResult, CampaignBrief } from '../types.js';

export interface ImageGenerateInput {
  campaign: CampaignBrief;
  platform?: string;
}

export interface ImageGenerateCapability {
  generate(input: ImageGenerateInput): Promise<ImageResult>;
}

export function createImageGenerateCapability(): ImageGenerateCapability {
  return {
    async generate(input: ImageGenerateInput): Promise<ImageResult> {
      const { campaign, platform = 'instagram' } = input;
      
      console.log(`[ImageGenerateCapability] Generating image for: ${campaign.topic}`);
      
      return {
        imageUrl: 'https://example.com/generated-social-image.png',
        altText: `Social media post about ${campaign.topic}`,
        dimensions: platform === 'linkedin' ? { width: 1200, height: 627 } : { width: 1080, height: 1080 },
      };
    },
  };
}