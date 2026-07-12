/**
 * MMOS Blog Generation - Web Search Capability Stub
 * 
 * This is a stub implementation for demonstration.
 * In production, this would call Tavily or similar search API.
 */

import type { ResearchResult } from '../types.js';

export interface WebSearchInput {
  topic: string;
  maxResults?: number;
}

export interface WebSearchCapability {
  search(input: WebSearchInput): Promise<ResearchResult>;
}

/**
 * Creates a web search capability
 * Stub: returns mock research data
 */
export function createWebSearchCapability(): WebSearchCapability {
  return {
    async search(input: WebSearchInput): Promise<ResearchResult> {
      const { topic, maxResults = 5 } = input;
      
      console.log(`[WebSearchCapability] Searching for: ${topic}`);
      
      // Stub implementation - returns mock data
      return {
        sources: Array.from({ length: maxResults }, (_, i) => 
          `https://example.com/article-${i + 1}-${topic.replace(/\s+/g, '-')}`
        ),
        keyPoints: [
          `Key insight 1 about ${topic} that readers find valuable`,
          `Key insight 2 about ${topic} with practical applications`,
          `Key insight 3 about ${topic} backed by research`,
          `Key insight 4 about ${topic} with real-world examples`,
          `Key insight 5 about ${topic} and future implications`,
        ],
        statistics: {
          'global_adoption_percent': 67,
          'market_value_billion_usd': 150,
          'year_over_year_growth': 25.5,
          'enterprise_usage_percent': 45,
        },
        citations: [
          'Source: Industry Analysis Report 2024',
          'Source: Academic Research on AI Applications',
          'Source: Market Research by Leading Firm',
        ],
      };
    },
  };
}