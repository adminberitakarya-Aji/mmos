/**
 * MMOS Blog Generation - Main Blog Generator
 * 
 * This module orchestrates the blog generation workflow using
 * the capabilities defined for each step.
 */

import { createWebSearchCapability } from './capabilities/web-search-capability.js';
import { createTextGenerateCapability } from './capabilities/text-generate-capability.js';
import { createTextSummarizeCapability } from './capabilities/text-summarize-capability.js';
import type { 
  BlogInput, 
  BlogOutput, 
  BlogMetadata,
  ResearchResult,
  OutlineResult, 
  DraftResult,
  ReviewResult 
} from './types.js';

/**
 * Blog Generator - Orchestrates the blog generation workflow
 */
export class BlogGenerator {
  private webSearch;
  private textGenerate;
  private textSummarize;

  constructor() {
    this.webSearch = createWebSearchCapability();
    this.textGenerate = createTextGenerateCapability();
    this.textSummarize = createTextSummarizeCapability();
  }

  /**
   * Generate a complete blog post
   */
  async generate(input: BlogInput): Promise<BlogOutput> {
    const { topic, includeImage = true } = input;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  MMOS Blog Generation - "${topic}"`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Research
    console.log('[Step 1/6] Researching topic...');
    const research = await this.performResearch(topic);
    console.log(`  ✓ Found ${research.sources.length} sources`);
    console.log(`  ✓ Extracted ${research.keyPoints.length} key points\n`);

    // Step 2: Generate Outline
    console.log('[Step 2/6] Creating article outline...');
    const outline = await this.createOutline(topic, research);
    console.log(`  ✓ Generated outline with ${outline.sections.length} sections`);
    console.log(`  ✓ Estimated length: ${outline.estimatedLength} words\n`);

    // Step 3: Write Draft
    console.log('[Step 3/6] Writing article draft...');
    const draft = await this.writeDraft(topic, outline);
    console.log(`  ✓ Generated ${draft.wordCount} words\n`);

    // Step 4: Review
    console.log('[Step 4/6] Reviewing content...');
    const review = await this.reviewContent(draft);
    console.log(`  ✓ Quality score: ${review.score}/100`);
    console.log(`  ✓ ${review.approved ? 'Approved ✓' : 'Needs revision'}`);
    if (review.issues.length > 0) {
      console.log(`  ⚠ ${review.issues.length} issue(s) found`);
    }
    console.log('');

    // Step 5: SEO Optimization (stub)
    console.log('[Step 5/6] Optimizing for SEO...');
    const seoReport = this.optimizeSEO(topic, draft);
    console.log(`  ✓ SEO score: ${seoReport.score}/100`);
    console.log(`  ✓ ${seoReport.suggestions.length} improvement suggestion(s)\n`);

    // Step 6: Package Result
    console.log('[Step 6/6] Packaging final result...');
    const finalContent = review.approved ? draft.content : this.applyReviewSuggestions(draft, review);
    const metadata = this.generateMetadata(topic, draft, seoReport);
    console.log(`  ✓ Generated metadata`);
    console.log(`  ✓ Article ready for publishing\n`);

    console.log(`${'='.repeat(60)}`);
    console.log(`  Blog Generation Complete!`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      article: finalContent,
      metadata,
      imageUrl: includeImage ? 'https://example.com/generated-featured-image.png' : undefined,
      seoReport,
    };
  }

  private async performResearch(topic: string): Promise<ResearchResult> {
    return this.webSearch.search({ topic, maxResults: 5 });
  }

  private async createOutline(topic: string, research: ResearchResult): Promise<OutlineResult> {
    const result = await this.textGenerate.generate({
      type: 'outline',
      topic,
      research,
    });
    return result as OutlineResult;
  }

  private async writeDraft(topic: string, outline: OutlineResult): Promise<DraftResult> {
    const result = await this.textGenerate.generate({
      type: 'draft',
      topic,
      outline,
    });
    return result as DraftResult;
  }

  private async reviewContent(draft: DraftResult): Promise<ReviewResult> {
    const result = await this.textSummarize.process({
      type: 'review',
      content: draft.content,
    });
    return result as ReviewResult;
  }

  private optimizeSEO(topic: string, draft: DraftResult): { keyword: string; density: number; score: number; suggestions: string[] } {
    const wordCount = draft.wordCount;
    const keywordCount = (draft.content.toLowerCase().match(new RegExp(topic.toLowerCase(), 'g')) || []).length;
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    
    const suggestions: string[] = [];
    let score = 70;
    
    if (density < 0.5) {
      suggestions.push('Consider adding more keyword mentions for better SEO');
      score -= 10;
    } else if (density > 3) {
      suggestions.push('Keyword density is high. Consider reducing keyword usage to avoid keyword stuffing');
      score -= 5;
    } else {
      score += 15;
    }

    if (draft.content.includes('meta')) {
      score += 5;
    } else {
      suggestions.push('Add meta description for better search engine visibility');
    }

    if (draft.content.includes('# ')) {
      score += 5;
    } else {
      suggestions.push('Add H1 heading for better SEO structure');
    }

    return {
      keyword: topic,
      density: Math.round(density * 100) / 100,
      score: Math.max(0, Math.min(100, score)),
      suggestions,
    };
  }

  private applyReviewSuggestions(draft: DraftResult, review: ReviewResult): string {
    // Simple: just add a note about review issues
    let content = draft.content;
    if (review.issues.length > 0) {
      content += '\n\n---\n\n**Content Review Notes:**\n';
      for (const issue of review.issues) {
        content += `- ${issue.location}: ${issue.description}\n`;
      }
    }
    return content;
  }

  private generateMetadata(topic: string, draft: DraftResult, seo: { keyword: string; score: number }): BlogMetadata {
    const wordCount = draft.wordCount;
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      title: `${topic}: A Comprehensive Guide`,
      metaDescription: `Learn everything about ${topic} in this comprehensive guide. Expert insights, practical tips, and actionable strategies for success.`,
      slug,
      tags: [topic.toLowerCase(), 'guide', 'tutorial', 'comprehensive'],
      readingTime: Math.ceil(wordCount / 200),
      wordCount,
      publishedAt: new Date().toISOString(),
    };
  }
}

/**
 * Factory function to create a BlogGenerator
 */
export function createBlogGenerator(): BlogGenerator {
  return new BlogGenerator();
}