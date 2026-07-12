/**
 * MMOS News Production - Text Review Capability Stub
 */

import type { EditorialReview, EditorialIssue } from '../types.js';

export interface TextReviewInput {
  article: string;
  headline: string;
}

export interface TextReviewCapability {
  review(input: TextReviewInput): Promise<EditorialReview>;
}

export function createTextReviewCapability(): TextReviewCapability {
  return {
    async review(input: TextReviewInput): Promise<EditorialReview> {
      const { article, headline } = input;
      
      console.log('[TextReviewCapability] Reviewing article');
      
      const issues: EditorialIssue[] = [];
      const suggestions: string[] = [];
      
      // Check word count
      const wordCount = article.split(/\s+/).length;
      if (wordCount < 300) {
        issues.push({
          type: 'clarity',
          location: 'Overall',
          description: 'Article is too short for a news piece. Aim for at least 500 words.',
          suggestion: 'Expand key sections with more details.',
        });
      }
      
      // Check headline quality
      if (headline.length < 30) {
        suggestions.push('Consider making the headline more descriptive.');
      }
      
      // Check for proper attribution
      if (!article.toLowerCase().includes('source:') && !article.includes('(Source:')) {
        issues.push({
          type: 'factual',
          location: 'Attribution',
          description: 'Missing source attribution for key claims.',
          suggestion: 'Add source citations for all factual statements.',
        });
      }
      
      // Calculate score
      const baseScore = 60;
      const wordBonus = Math.min(15, Math.floor(wordCount / 50));
      const issuePenalty = issues.length * 10;
      const score = Math.max(0, Math.min(100, baseScore + wordBonus - issuePenalty));
      
      return {
        approved: issues.filter(i => i.type === 'factual' || i.type === 'legal').length === 0 && score >= 70,
        issues,
        suggestions,
        score,
      };
    },
  };
}