/**
 * MMOS News Production - Main News Generator
 * 
 * Orchestrates the news production workflow.
 */

import { createRssFetchCapability } from './capabilities/rss-fetch-capability.js';
import { createNewsVerifyCapability } from './capabilities/news-verify-capability.js';
import { createHeadlineGenerateCapability } from './capabilities/headline-generate-capability.js';
import { createTextGenerateCapability } from './capabilities/text-generate-capability.js';
import { createTextReviewCapability } from './capabilities/text-review-capability.js';
import type { 
  NewsInput, 
  NewsOutput, 
  NewsMetadata,
  ResearchResult,
  VerificationResult,
  HeadlineResult,
  DraftResult,
  EditorialReview,
  PublicationPackage
} from './types.js';

/**
 * News Generator - Orchestrates the news production workflow
 */
export class NewsGenerator {
  private rssFetch;
  private newsVerify;
  private headlineGenerate;
  private textGenerate;
  private textReview;

  constructor() {
    this.rssFetch = createRssFetchCapability();
    this.newsVerify = createNewsVerifyCapability();
    this.headlineGenerate = createHeadlineGenerateCapability();
    this.textGenerate = createTextGenerateCapability();
    this.textReview = createTextReviewCapability();
  }

  /**
   * Generate a complete news article
   */
  async generate(input: NewsInput): Promise<NewsOutput> {
    const { topic, category = 'technology', publish = true } = input;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  MMOS News Production - "${topic}"`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Research
    console.log('[Step 1/8] Fetching news sources...');
    const research = await this.performResearch(topic);
    console.log(`  ✓ Found ${research.sources.length} sources`);
    console.log(`  ✓ Extracted ${research.keyFacts.length} key facts\n`);

    // Step 2: Verification
    console.log('[Step 2/8] Verifying facts...');
    const verification = await this.performVerification(topic, research);
    console.log(`  ✓ Verification confidence: ${verification.confidenceScore}%`);
    console.log(`  ✓ ${verification.verifiedFacts.length} facts verified`);
    if (verification.unverifiedClaims.length > 0) {
      console.log(`  ⚠ ${verification.unverifiedClaims.length} unverified claims`);
    }
    console.log('');

    // Step 3: Headline
    console.log('[Step 3/8] Generating headline...');
    const headline = await this.generateHeadline(topic, verification, category);
    console.log(`  ✓ "${headline.headline}"\n`);

    // Step 4: Write Article
    console.log('[Step 4/8] Writing article...');
    const draft = await this.writeArticle(headline, verification);
    console.log(`  ✓ Generated ${draft.wordCount} words\n`);

    // Step 5: Editorial Review
    console.log('[Step 5/8] Editorial review...');
    const review = await this.performReview(headline.headline, draft);
    console.log(`  ✓ Quality score: ${review.score}/100`);
    console.log(`  ✓ ${review.approved ? 'Approved ✓' : 'Needs revision'}`);
    console.log('');

    // Step 6: SEO Optimization (stub)
    console.log('[Step 6/8] SEO optimization...');
    const seoReport = this.optimizeSEO(topic, draft);
    console.log(`  ✓ SEO score: ${seoReport.score}/100\n`);

    // Step 7: Thumbnail (stub)
    console.log('[Step 7/8] Thumbnail generation...');
    const thumbnailUrl = publish ? 'https://example.com/generated-thumbnail.png' : undefined;
    console.log(`  ✓ Thumbnail ${thumbnailUrl ? 'generated' : 'skipped'}\n`);

    // Step 8: Package
    console.log('[Step 8/8] Creating publication package...');
    const finalContent = review.approved ? draft.content : this.addReviewNotes(draft, review);
    const summary = this.generateSummary(verification);
    const metadata = this.generateMetadata(topic, category, draft);
    console.log(`  ✓ Package ready for publication\n`);

    console.log(`${'='.repeat(60)}`);
    console.log(`  News Production Complete!`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      article: finalContent,
      headline: headline.headline,
      summary,
      metadata,
      thumbnailUrl,
      seoReport,
      publicationPackage: {
        articleFile: `article-${metadata.slug}.md`,
        headlineFile: `headline-${metadata.slug}.txt`,
        summaryFile: `summary-${metadata.slug}.txt`,
        metadataFile: `metadata-${metadata.slug}.json`,
        thumbnailFile: thumbnailUrl ? `thumbnail-${metadata.slug}.png` : undefined,
        seoReportFile: `seo-${metadata.slug}.json`,
      },
    };
  }

  private async performResearch(topic: string): Promise<ResearchResult> {
    return this.rssFetch.fetch({ topic, maxResults: 5 });
  }

  private async performVerification(topic: string, research: ResearchResult): Promise<VerificationResult> {
    return this.newsVerify.verify({ research, topic });
  }

  private async generateHeadline(topic: string, verification: VerificationResult, category: string): Promise<HeadlineResult> {
    return this.headlineGenerate.generate({ topic, verifiedFacts: verification, category });
  }

  private async writeArticle(headline: HeadlineResult, verification: VerificationResult): Promise<DraftResult> {
    const result = await this.textGenerate.generate({
      type: 'article',
      headline,
      verification,
    });
    return result as DraftResult;
  }

  private async performReview(headline: string, draft: DraftResult): Promise<EditorialReview> {
    return this.textReview.review({ article: draft.content, headline });
  }

  private optimizeSEO(topic: string, draft: DraftResult): { keyword: string; density: number; score: number; suggestions: string[] } {
    const wordCount = draft.wordCount;
    const keywordCount = (draft.content.toLowerCase().match(new RegExp(topic.toLowerCase(), 'g')) || []).length;
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    
    const suggestions: string[] = [];
    let score = 65;
    
    if (density < 0.5) {
      suggestions.push('Consider adding more keyword mentions for better SEO');
      score -= 10;
    } else if (density > 3) {
      suggestions.push('Keyword density is high. Reduce usage to avoid keyword stuffing');
    } else {
      score += 15;
    }

    if (draft.content.includes('# ')) {
      score += 5;
    }

    return {
      keyword: topic,
      density: Math.round(density * 100) / 100,
      score: Math.max(0, Math.min(100, score)),
      suggestions,
    };
  }

  private addReviewNotes(draft: DraftResult, review: EditorialReview): string {
    let content = draft.content;
    if (review.issues.length > 0) {
      content += '\n\n---\n\n**Editorial Review Notes:**\n';
      for (const issue of review.issues) {
        content += `- [${issue.type.toUpperCase()}] ${issue.location}: ${issue.description}\n`;
      }
    }
    return content;
  }

  private generateSummary(verification: VerificationResult): string {
    const keyPoints = verification.verifiedFacts.slice(0, 3).map(f => f.statement);
    return `## Summary\n\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n**Verification Status:** ${verification.confidenceScore}% verified\n**Published:** ${new Date().toLocaleDateString()}`;
  }

  private generateMetadata(topic: string, category: string, draft: DraftResult): NewsMetadata {
    const wordCount = draft.wordCount;
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      title: topic,
      category,
      slug,
      tags: [category.toLowerCase(), 'news', 'breaking', 'ai'],
      readingTime: Math.ceil(wordCount / 200),
      wordCount,
      publishedAt: new Date().toISOString(),
    };
  }
}

/**
 * Factory function to create a NewsGenerator
 */
export function createNewsGenerator(): NewsGenerator {
  return new NewsGenerator();
}