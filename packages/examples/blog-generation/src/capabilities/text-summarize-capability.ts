/**
 * MMOS Blog Generation - Text Summarize Capability Stub
 * 
 * This is a stub implementation for demonstration.
 * In production, this would call AI APIs for intelligent review.
 */

import type { ReviewResult, ReviewIssue } from '../types.js';

export interface TextSummarizeInput {
  type: 'review' | 'summarize';
  content: string;
}

export interface TextSummarizeCapability {
  process(input: TextSummarizeInput): Promise<ReviewResult | string>;
}

/**
 * Creates a text summarize/review capability
 * Stub: performs basic analysis
 */
export function createTextSummarizeCapability(): TextSummarizeCapability {
  return {
    async process(input: TextSummarizeInput): Promise<ReviewResult | string> {
      console.log(`[TextSummarizeCapability] Processing ${input.type}`);
      
      if (input.type === 'review') {
        return reviewContent(input.content);
      } else {
        return summarizeContent(input.content);
      }
    },
  };
}

function reviewContent(content: string): ReviewResult {
  const issues: ReviewIssue[] = [];
  const suggestions: string[] = [];
  
  // Check word count
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 800) {
    issues.push({
      type: 'clarity',
      location: 'Overall',
      description: `Article is ${wordCount} words. Consider expanding to at least 1000 words for better SEO.`,
      suggestion: 'Add more detailed explanations and examples in key sections.',
    });
  } else if (wordCount > 2500) {
    suggestions.push('Consider breaking up long sections for better readability.');
  }
  
  // Check for headings
  const h2Count = (content.match(/^##\s+.+$/gm) || []).length;
  if (h2Count < 3) {
    issues.push({
      type: 'clarity',
      location: 'Structure',
      description: 'Article needs more section headings for better readability.',
      suggestion: 'Add descriptive H2 headings to organize content.',
    });
  }
  
  // Check for lists
  const hasUnorderedList = content.includes('- ') || content.includes('* ');
  const hasOrderedList = /^\d+\.\s/m.test(content);
  if (!hasUnorderedList && !hasOrderedList) {
    suggestions.push('Consider adding bullet points or numbered lists for scannability.');
  }
  
  // Check for intro/conclusion
  if (!content.toLowerCase().includes('introduction') && !content.includes('## Introduction')) {
    suggestions.push('Consider adding a clear introduction section.');
  }
  
  if (!content.toLowerCase().includes('conclusion') && !content.includes('## Conclusion')) {
    suggestions.push('Consider adding a conclusion section with a call to action.');
  }
  
  // Calculate score
  const baseScore = 70;
  const wordBonus = Math.min(15, Math.floor(wordCount / 100));
  const structureBonus = Math.min(10, h2Count * 2);
  const issuePenalty = issues.length * 5;
  const score = Math.max(0, Math.min(100, baseScore + wordBonus + structureBonus - issuePenalty));
  
  return {
    approved: issues.filter(i => i.type === 'accuracy').length === 0 && score >= 60,
    issues,
    suggestions,
    score,
  };
}

function summarizeContent(content: string): string {
  // Simple extractive summarization
  const sentences = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  // Take first and last few sentences as summary
  const summarySentences = [
    ...sentences.slice(0, Math.min(2, sentences.length)),
    ...sentences.slice(-Math.min(2, sentences.length)),
  ];
  
  return summarySentences.join('. ') + (summarySentences.length > 0 ? '.' : '');
}