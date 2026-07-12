/**
 * MMOS Social Media - Main Social Generator
 * 
 * Orchestrates the social media content generation workflow.
 */

import { createKnowledgeSearchCapability } from './capabilities/knowledge-search-capability.js';
import { createAudienceAnalyzeCapability } from './capabilities/audience-analyze-capability.js';
import { createTextGenerateCapability } from './capabilities/text-generate-capability.js';
import { createHashtagGenerateCapability } from './capabilities/hashtag-generate-capability.js';
import { createImageGenerateCapability } from './capabilities/image-generate-capability.js';
import { createContentAdaptCapability } from './capabilities/content-adapt-capability.js';
import type { 
  SocialInput, 
  SocialOutput, 
  SocialMetadata,
  Platform,
  PlatformPost,
  CampaignBrief,
  AudienceProfile,
  CaptionResult,
  HashtagResult,
  ImageResult,
  PlatformContent,
} from './types.js';

/**
 * Social Generator - Orchestrates the social media workflow
 */
export class SocialGenerator {
  private knowledgeSearch;
  private audienceAnalyze;
  private textGenerate;
  private hashtagGenerate;
  private imageGenerate;
  private contentAdapt;

  constructor() {
    this.knowledgeSearch = createKnowledgeSearchCapability();
    this.audienceAnalyze = createAudienceAnalyzeCapability();
    this.textGenerate = createTextGenerateCapability();
    this.hashtagGenerate = createHashtagGenerateCapability();
    this.imageGenerate = createImageGenerateCapability();
    this.contentAdapt = createContentAdaptCapability();
  }

  /**
   * Generate social media content for multiple platforms
   */
  async generate(input: SocialInput): Promise<SocialOutput> {
    const { topic, audience = 'UMKM', platforms = ['instagram', 'facebook', 'x', 'linkedin'], includeImage = true } = input;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  MMOS Social Media Campaign - "${topic}"`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Research
    console.log('[Step 1/7] Researching campaign...');
    const campaign = await this.performResearch(topic, audience);
    console.log(`  ✓ ${campaign.keyMessages.length} key messages identified`);
    console.log(`  ✓ Target URL: ${campaign.targetUrl}\n`);

    // Step 2: Audience Analysis
    console.log('[Step 2/7] Analyzing audience...');
    const audienceProfile = await this.analyzeAudience(campaign, audience);
    console.log(`  ✓ Age range: ${audienceProfile.demographics.ageRange}`);
    console.log(`  ✓ ${audienceProfile.insights.length} audience insights\n`);

    // Step 3: Caption Generation
    console.log('[Step 3/7] Generating captions...');
    const captions = await this.generateCaptions(campaign, audienceProfile);
    console.log(`  ✓ Generated ${captions.captions.length} caption variants`);
    console.log(`  ✓ Tone: ${captions.tone}\n`);

    // Step 4: Hashtag Generation
    console.log('[Step 4/7] Generating hashtags...');
    const hashtags = await this.generateHashtags(captions, topic);
    console.log(`  ✓ ${hashtags.hashtags.length} hashtags generated`);
    console.log(`  ✓ ${hashtags.trending.length} trending + ${hashtags.niche.length} niche\n`);

    // Step 5: CTA Generation
    console.log('[Step 5/7] Generating call-to-action...');
    const cta = await this.generateCTA(campaign, audienceProfile);
    console.log(`  ✓ CTA ready\n`);

    // Step 6: Image Generation
    console.log('[Step 6/7] Generating image...');
    const imageUrl = includeImage ? await this.generateImage(campaign) : undefined;
    console.log(`  ✓ Image ${imageUrl ? 'generated' : 'skipped'}\n`);

    // Step 7: Platform Adaptation
    console.log('[Step 7/7] Adapting content for platforms...');
    const posts = await this.adaptForPlatforms(platforms, captions, hashtags, cta);
    console.log(`  ✓ Adapted content for ${posts.length} platforms\n`);

    console.log(`${'='.repeat(60)}`);
    console.log(`  Social Media Campaign Complete!`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      posts,
      hashtags: hashtags.hashtags,
      cta,
      imageUrl,
      metadata: {
        campaign: topic,
        audience,
        platforms,
        generatedAt: new Date().toISOString(),
        totalPosts: posts.length,
      },
      publishingPackage: {
        posts: posts.map(p => ({ name: `${p.platform}-post.txt`, platform: p.platform, content: p.caption })),
        imageFile: imageUrl ? 'social-image.png' : undefined,
        metadataFile: 'metadata.json',
      },
    };
  }

  private async performResearch(topic: string, audience: string): Promise<CampaignBrief> {
    return this.knowledgeSearch.search({ topic, audience });
  }

  private async analyzeAudience(campaign: CampaignBrief, audience: string): Promise<AudienceProfile> {
    return this.audienceAnalyze.analyze({ campaign, targetAudience: audience });
  }

  private async generateCaptions(campaign: CampaignBrief, audience: AudienceProfile): Promise<CaptionResult> {
    const result = await this.textGenerate.generate({ type: 'caption', campaign, audience });
    return result as CaptionResult;
  }

  private async generateHashtags(captions: CaptionResult, topic: string): Promise<HashtagResult> {
    return this.hashtagGenerate.generate({ captions, topic });
  }

  private async generateCTA(campaign: CampaignBrief, audience: AudienceProfile): Promise<string> {
    const result = await this.textGenerate.generate({ type: 'cta', campaign, audience });
    return result as string;
  }

  private async generateImage(campaign: CampaignBrief): Promise<string> {
    const result = await this.imageGenerate.generate({ campaign });
    return result.imageUrl;
  }

  private async adaptForPlatforms(
    platforms: Platform[], 
    captions: CaptionResult, 
    hashtags: HashtagResult, 
    cta: string
  ): Promise<PlatformPost[]> {
    const posts: PlatformPost[] = [];
    
    for (const platform of platforms) {
      const adapted = await this.contentAdapt.adapt({ captions, hashtags: hashtags.hashtags, cta, platform });
      posts.push({
        platform,
        caption: this.formatCaptionForPlatform(adapted, platform),
        hashtags: adapted.adaptedHashtags,
        cta,
      });
    }
    
    return posts;
  }

  private formatCaptionForPlatform(adapted: PlatformContent, platform: Platform): string {
    const caption = adapted.adaptedCaption;
    const hashtagLine = adapted.adaptedHashtags.slice(0, 5).join(' ');
    
    if (platform === 'x') {
      return `${caption.slice(0, 200)}...\n\n${hashtagLine}`;
    }
    
    if (platform === 'linkedin') {
      return `${caption}\n\n${hashtagLine}`;
    }
    
    return `${caption}\n\n${hashtagLine}`;
  }
}

/**
 * Factory function to create a SocialGenerator
 */
export function createSocialGenerator(): SocialGenerator {
  return new SocialGenerator();
}