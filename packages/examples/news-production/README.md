# MMOS News Production Example

**End-to-end news article production using MMOS Runtime architecture**

This example demonstrates how to build a complete news production workflow using:
- **5 Loop Runtime Architecture** (System, Scheduler, Execution, Agent, Event)
- **Composition, Workflow, Task, Agent, and Capability** domain models
- **Event-driven architecture** with fact verification and editorial review

## Workflow

The news production follows this pipeline:

```
Research → Verify → Headline → Write → Editorial Review → SEO → Thumbnail → Package
```

### Pipeline Steps

1. **Research** - Fetch news from RSS feeds and gather sources
2. **Verify** - Fact-check and verify claims with confidence scoring
3. **Headline** - Generate compelling headline and subheadlines
4. **Write** - Write full news article with verified facts
5. **Editorial Review** - Quality check with editorial issues
6. **SEO** - Optimize for search engines
7. **Thumbnail** - Generate featured image (stub)
8. **Package** - Create publication package

## Prerequisites

- Node.js 20+
- npm or pnpm

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Produce a news article
npm run run -- --topic "Government Launches AI National Program"

# With options
npm run run -- --topic "Tech Company Acquisition" --category business
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--topic <text>` | News topic (required) | - |
| `--language <code>` | Language code (`id` or `en`) | `id` |
| `--category <name>` | Category: technology, politics, business, etc. | `technology` |
| `--no-publish` | Skip thumbnail and final packaging | `false` |
| `--help` | Show help message | - |

## Output

Generated files are saved in the `output/` directory:

```
output/
├── 2026-07-12-topic-slug-article.md   # News article
├── 2026-07-12-topic-slug-headline.txt # Headline
├── 2026-07-12-topic-slug-summary.txt   # Summary
├── 2026-07-12-topic-slug-metadata.json # Article metadata
├── 2026-07-12-topic-slug-seo.json      # SEO analysis
```

## Architecture

### Domain Model

```
Composition (News Production)
├── Workflow (wf-news-production)
│   ├── Task: Research
│   ├── Task: Verification
│   ├── Task: Headline
│   ├── Task: Writing
│   ├── Task: Editorial Review
│   ├── Task: SEO
│   ├── Task: Thumbnail
│   └── Task: Packaging
└── Capabilities
    ├── RSS Fetch
    ├── News Verify
    ├── Headline Generate
    ├── Text Generate
    ├── Text Review
    └── Image Generate (stub)
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
| `NEWS_API_KEY` | News API key for RSS feeds | No |
| `OUTPUT_DIR` | Output directory for generated files | No |
| `LOG_LEVEL` | Logging level: debug, info, warn, error | No |

## Documentation

- [MMOS Overview](https://github.com/adminberitakarya-Aji/mmos)
- [SDK Documentation](../sdk/README.md)
- [Runtime Documentation](../runtime/README.md)
- [News Production Scenario](../examples/news-production.md)

## License

MIT