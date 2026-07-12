/**
 * MMOS Blog Generation Example - Runner Script
 * 
 * Usage:
 *   npm run build && npm run run -- --topic "Your Blog Topic"
 *   npm run dev -- --topic "Your Blog Topic"
 */

import { createBlogGenerator } from './blog-generator.js';
import type { BlogInput, BlogOutput } from './types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Parse command line arguments
function parseArgs(): BlogInput {
  const args = process.argv.slice(2);
  const input: BlogInput = {
    topic: '',
    language: 'id' as const, // Default to Indonesian
    length: 1500,
    output: 'markdown' as const,
    includeImage: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--topic' && i + 1 < args.length) {
      input.topic = args[++i];
    } else if (arg === '--language' && i + 1 < args.length) {
      input.language = args[++i];
    } else if (arg === '--length' && i + 1 < args.length) {
      input.length = parseInt(args[++i], 10);
    } else if (arg === '--no-image') {
      input.includeImage = false;
    } else if (arg === '--help') {
      printUsage();
      process.exit(0);
    }
  }

  if (!input.topic) {
    console.error('Error: --topic is required');
    printUsage();
    process.exit(1);
  }

  return input;
}

function printUsage(): void {
  console.log(`
MMOS Blog Generation Example

Usage:
  npm run run -- --topic "Your Blog Topic" [options]

Options:
  --topic <text>       Blog topic (required)
  --language <code>    Language code: 'id' or 'en' (default: id)
  --length <number>    Target word count (default: 1500)
  --no-image          Disable featured image generation
  --help              Show this help message

Examples:
  npm run run -- --topic "10 Benefits of AI for Small Business"
  npm run run -- --topic "How to Build a Website" --language en --length 2000
`);
}

async function saveOutput(result: BlogOutput, topic: string): Promise<void> {
  // Create output directory
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename from topic
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  const prefix = `${timestamp}-${slug}`;

  // Save article
  const articlePath = path.join(outputDir, `${prefix}-article.md`);
  fs.writeFileSync(articlePath, result.article, 'utf-8');
  console.log(`✓ Article saved: ${articlePath}`);

  // Save metadata
  const metadataPath = path.join(outputDir, `${prefix}-metadata.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(result.metadata, null, 2), 'utf-8');
  console.log(`✓ Metadata saved: ${metadataPath}`);

  // Save SEO report
  if (result.seoReport) {
    const seoPath = path.join(outputDir, `${prefix}-seo.json`);
    fs.writeFileSync(seoPath, JSON.stringify(result.seoReport, null, 2), 'utf-8');
    console.log(`✓ SEO report saved: ${seoPath}`);
  }

  // Save generation report
  const report = {
    topic,
    generatedAt: new Date().toISOString(),
    articleLength: result.article.length,
    wordCount: result.metadata.wordCount,
    readingTime: result.metadata.readingTime,
    seoScore: result.seoReport?.score,
    qualityScore: result.seoReport ? result.seoReport.score : undefined,
  };
  const reportPath = path.join(outputDir, `${prefix}-report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✓ Report saved: ${reportPath}`);

  console.log(`\n📁 Output directory: ${outputDir}`);
}

async function main(): Promise<void> {
  console.log('\n🚀 MMOS Blog Generation Example');
  console.log('   TypeScript + MMOS Runtime Reference Implementation\n');

  const input = parseArgs();
  
  console.log(`📝 Topic: ${input.topic}`);
  console.log(`🌐 Language: ${input.language}`);
  console.log(`📏 Target length: ${input.length} words\n`);

  try {
    const generator = createBlogGenerator();
    const result = await generator.generate(input);
    
    console.log('--- Generated Content Preview ---');
    console.log(`\nTitle: ${result.metadata.title}`);
    console.log(`Slug: ${result.metadata.slug}`);
    console.log(`Word Count: ${result.metadata.wordCount}`);
    console.log(`Reading Time: ${result.metadata.readingTime} min`);
    if (result.seoReport) {
      console.log(`SEO Score: ${result.seoReport.score}/100`);
    }
    
    // Show article preview (first 500 chars)
    const preview = result.article.slice(0, 500);
    console.log(`\n--- Article Preview (first 500 chars) ---\n`);
    console.log(preview);
    console.log('\n...[truncated]...\n');

    // Save output files
    await saveOutput(result, input.topic);
    
    console.log('\n✅ Blog generation completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Blog generation failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
    process.exit(1);
  }
}

main();