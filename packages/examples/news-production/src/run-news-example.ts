/**
 * MMOS News Production Example - Runner Script
 * 
 * Usage:
 *   npm run build && npm run run -- --topic "Your News Topic"
 *   npm run dev -- --topic "Your News Topic"
 */

import { createNewsGenerator } from './news-generator.js';
import type { NewsInput, NewsOutput } from './types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Helper to safely get next argument with error message
function getNextArg(args: string[], i: number, optionName: string): string {
  if (i + 1 >= args.length) {
    console.error(`Error: --${optionName} requires a value`);
    process.exit(1);
  }
  return args[i + 1]!;
}

// Parse command line arguments
function parseArgs(): NewsInput {
  const args = process.argv.slice(2);
  const input: NewsInput = {
    topic: '',
    language: 'id' as const,
    category: 'technology',
    publish: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--topic') {
      input.topic = getNextArg(args, i, 'topic');
      i++; // skip next arg as it's the value
    } else if (arg === '--language') {
      input.language = getNextArg(args, i, 'language') as 'id' | 'en';
      i++;
    } else if (arg === '--category') {
      input.category = getNextArg(args, i, 'category');
      i++;
    } else if (arg === '--no-publish') {
      input.publish = false;
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
MMOS News Production Example

Usage:
  npm run run -- --topic "Your News Topic" [options]

Options:
  --topic <text>       News topic (required)
  --language <code>    Language code: 'id' or 'en' (default: id)
  --category <name>    Category: technology, politics, business, etc. (default: technology)
  --no-publish         Skip thumbnail and final packaging
  --help               Show this help message

Examples:
  npm run run -- --topic "Government Launches AI Program"
  npm run run -- --topic "Tech Company Acquisition" --category business
`);
}

async function saveOutput(result: NewsOutput, topic: string): Promise<void> {
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const slug = result.metadata.slug;
  const timestamp = new Date().toISOString().split('T')[0];
  const prefix = `${timestamp}-${slug}`;

  // Save article
  fs.writeFileSync(path.join(outputDir, `${prefix}-article.md`), result.article, 'utf-8');
  console.log(`✓ Article saved`);

  // Save headline
  fs.writeFileSync(path.join(outputDir, `${prefix}-headline.txt`), result.headline, 'utf-8');
  console.log(`✓ Headline saved`);

  // Save summary
  fs.writeFileSync(path.join(outputDir, `${prefix}-summary.txt`), result.summary, 'utf-8');
  console.log(`✓ Summary saved`);

  // Save metadata
  fs.writeFileSync(path.join(outputDir, `${prefix}-metadata.json`), JSON.stringify(result.metadata, null, 2), 'utf-8');
  console.log(`✓ Metadata saved`);

  // Save SEO report
  if (result.seoReport) {
    fs.writeFileSync(path.join(outputDir, `${prefix}-seo.json`), JSON.stringify(result.seoReport, null, 2), 'utf-8');
    console.log(`✓ SEO report saved`);
  }

  console.log(`\n📁 Output directory: ${outputDir}`);
}

async function main(): Promise<void> {
  console.log('\n🚀 MMOS News Production Example');
  console.log('   TypeScript + MMOS Runtime Reference Implementation\n');

  const input = parseArgs();
  
  console.log(`📰 Topic: ${input.topic}`);
  console.log(`🏷️ Category: ${input.category}`);
  console.log('');

  try {
    const generator = createNewsGenerator();
    const result = await generator.generate(input);
    
    console.log('--- Generated News Preview ---');
    console.log(`\nHeadline: ${result.headline}`);
    console.log(`Category: ${result.metadata.category}`);
    console.log(`Word Count: ${result.metadata.wordCount}`);
    console.log(`SEO Score: ${result.seoReport?.score}/100`);
    
    // Show article preview
    const preview = result.article.slice(0, 500);
    console.log(`\n--- Article Preview (first 500 chars) ---\n`);
    console.log(preview);
    console.log('\n...[truncated]...\n');

    await saveOutput(result, input.topic);
    
    console.log('\n✅ News production completed successfully!');
    
  } catch (error) {
    console.error('\n❌ News production failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
    process.exit(1);
  }
}

main();