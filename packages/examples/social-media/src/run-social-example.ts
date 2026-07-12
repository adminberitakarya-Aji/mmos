/**
 * MMOS Social Media Example - Runner Script
 * 
 * Usage:
 *   npm run build && npm run run -- --topic "Your Campaign Topic"
 *   npm run dev -- --topic "Your Campaign Topic"
 */

import { createSocialGenerator } from './social-generator.js';
import type { SocialInput, SocialOutput, Platform } from './types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Parse command line arguments
function parseArgs(): SocialInput {
  const args = process.argv.slice(2);
  const input: SocialInput = {
    topic: '',
    audience: 'UMKM',
    platforms: ['instagram', 'facebook', 'x', 'linkedin'],
    includeImage: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--topic' && i + 1 < args.length) {
      input.topic = args[++i];
    } else if (arg === '--audience' && i + 1 < args.length) {
      input.audience = args[++i];
    } else if (arg === '--platforms' && i + 1 < args.length) {
      input.platforms = args[++i].split(',') as Platform[];
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
MMOS Social Media Campaign Example

Usage:
  npm run run -- --topic "Your Campaign Topic" [options]

Options:
  --topic <text>        Campaign topic (required)
  --audience <text>     Target audience (default: UMKM)
  --platforms <list>    Comma-separated platforms (default: all)
  --no-image           Skip image generation
  --help               Show this help message

Platforms: instagram, facebook, x, linkedin

Examples:
  npm run run -- --topic "AI Studio Promo"
  npm run run -- --topic "Product Launch" --audience "Young Professionals"
  npm run run -- --topic "Sale" --platforms instagram,facebook
`);
}

async function saveOutput(result: SocialOutput, topic: string): Promise<void> {
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  const timestamp = new Date().toISOString().split('T')[0];
  const prefix = `${timestamp}-${slug}`;

  // Save posts for each platform
  for (const post of result.posts) {
    fs.writeFileSync(path.join(outputDir, `${prefix}-${post.platform}.txt`), post.caption, 'utf-8');
    console.log(`✓ ${post.platform} post saved`);
  }

  // Save hashtags
  fs.writeFileSync(path.join(outputDir, `${prefix}-hashtags.txt`), result.hashtags.join('\n'), 'utf-8');
  console.log(`✓ Hashtags saved`);

  // Save CTA
  fs.writeFileSync(path.join(outputDir, `${prefix}-cta.txt`), result.cta, 'utf-8');
  console.log(`✓ CTA saved`);

  // Save metadata
  fs.writeFileSync(path.join(outputDir, `${prefix}-metadata.json`), JSON.stringify(result.metadata, null, 2), 'utf-8');
  console.log(`✓ Metadata saved`);

  console.log(`\n📁 Output directory: ${outputDir}`);
}

async function main(): Promise<void> {
  console.log('\n🚀 MMOS Social Media Campaign Example');
  console.log('   Multi-platform content generation\n');

  const input = parseArgs();
  
  console.log(`📱 Campaign: ${input.topic}`);
  console.log(`👥 Audience: ${input.audience}`);
  console.log(`📢 Platforms: ${input.platforms?.join(', ')}`);
  console.log('');

  try {
    const generator = createSocialGenerator();
    const result = await generator.generate(input);
    
    console.log('--- Generated Content Summary ---');
    console.log(`\nTotal Posts: ${result.posts.length}`);
    console.log(`Hashtags: ${result.hashtags.length}`);
    console.log(`Image: ${result.imageUrl ? 'Generated' : 'Skipped'}`);
    
    // Show preview for each platform
    for (const post of result.posts) {
      console.log(`\n📸 ${post.platform.toUpperCase()} - ${post.caption.slice(0, 100)}...`);
    }

    await saveOutput(result, input.topic);
    
    console.log('\n✅ Social media campaign completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Campaign generation failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
    process.exit(1);
  }
}

main();