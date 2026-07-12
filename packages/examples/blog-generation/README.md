# MMOS Blog Generation Example

**End-to-end blog article generation using MMOS Runtime architecture**

This example demonstrates how to build a complete blog generation workflow using:
- **5 Loop Runtime Architecture** (System, Scheduler, Execution, Agent, Event)
- **Composition, Workflow, Task, Agent, and Capability** domain models
- **Event-driven architecture** with proper separation of concerns

## Workflow

The blog generation follows this pipeline:

```
Research → Outline → Write → Review → SEO Optimize → Package → Publish
```

### Pipeline Steps

1. **Research** - Search for information on the topic
2. **Outline** - Create article structure with sections
3. **Write** - Generate full article content from outline
4. **Review** - Quality check and content review
5. **SEO Optimize** - Analyze and improve search engine optimization
6. **Package** - Generate metadata, images, and final output

## Prerequisites

- Node.js 20+
- npm or pnpm

## Installation

```bash
# Install dependencies from root workspace
npm install

# Build all packages
npm run build
```

## Usage

```bash
# Generate a blog post
npm run run -- --topic "10 Benefits of AI for Small Business"

# With options
npm run run -- --topic "How to Build a Website" --language en --length 2000

# Development mode (with watch)
npm run dev -- --topic "Your Topic"
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--topic <text>` | Blog topic (required) | - |
| `--language <code>` | Language code (`id` or `en`) | `id` |
| `--length <number>` | Target word count | `1500` |
| `--no-image` | Disable featured image generation | `false` |
| `--help` | Show help message | - |

## Output

Generated files are saved in the `output/` directory:

```
output/
├── 2026-07-12-topic-slug-article.md   # Final article
├── 2026-07-12-topic-slug-metadata.json # Article metadata
├── 2026-07-12-topic-slug-seo.json      # SEO analysis
└── 2026-07-12-topic-slug-report.json   # Generation report
```

### Article Metadata

```json
{
  "title": "10 Benefits of AI for Small Business",
  "metaDescription": "Learn about the key benefits...",
  "slug": "10-benefits-of-ai-for-small-business",
  "tags": ["ai", "small-business", "benefits"],
  "readingTime": 5,
  "wordCount": 1500,
  "publishedAt": "2026-07-12T15:00:00.000Z"
}
```

## Architecture

### Domain Model

```
Composition (Blog Generation)
├── Workflow (wf-blog-generation)
│   ├── Task: Research
│   ├── Task: Outline
│   ├── Task: Write
│   ├── Task: Review
│   ├── Task: SEO
│   ├── Task: Image
│   └── Task: Package
├── Agents
│   ├── Researcher Agent
│   ├── Writer Agent
│   ├── Editor Agent
│   └── Publisher Agent
└── Capabilities
    ├── Web Search
    ├── Text Generate
    ├── Text Summarize
    └── CMS Publish
```

### Capability Pattern

Each capability follows the MMOS Capability contract:

```typescript
export interface WebSearchCapability {
  search(input: WebSearchInput): Promise<ResearchResult>;
}

export interface TextGenerateCapability {
  generate(input: TextGenerateInput): Promise<OutlineResult | DraftResult>;
}

export interface TextSummarizeCapability {
  process(input: TextSummarizeInput): Promise<ReviewResult | string>;
}
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI capabilities | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | No |
| `TAVILY_API_KEY` | Tavily API key for web search | No |
| `OUTPUT_DIR` | Output directory for generated files | No |
| `LOG_LEVEL` | Logging level: debug, info, warn, error | No |

## Extending the Example

### Adding New Capabilities

1. Create a new file in `src/capabilities/`
2. Implement the capability interface
3. Register it in `src/capabilities/index.ts`
4. Use it in `src/blog-generator.ts`

### Customizing the Workflow

1. Modify `workflow.json` to change task order or add new tasks
2. Update `blog-generation.composition.json` to add new agents
3. Modify `src/blog-generator.ts` to change orchestration logic

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## Documentation

- [MMOS Overview](https://github.com/adminberitakarya-Aji/mmos)
- [SDK Documentation](../sdk/README.md)
- [Runtime Documentation](../runtime/README.md)
- [Blog Generation Scenario](../examples/blog-generation.md)

## License

MIT