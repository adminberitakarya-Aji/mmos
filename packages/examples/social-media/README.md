# MMOS Social Media Example

**Multi-platform social media content generation using MMOS Runtime architecture**

This example demonstrates how to build a complete social media campaign workflow using:
- **5 Loop Runtime Architecture** (System, Scheduler, Execution, Agent, Event)
- **Composition, Workflow, Task, Agent, and Capability** domain models
- **Event-driven architecture** with platform adaptation

## Workflow

The social media workflow follows this pipeline:

```
Research → Audience Analysis → Caption → Hashtag → CTA → Image → Adapt → Package
```

### Pipeline Steps

1. **Research** - Gather campaign information and key messages
2. **Audience Analysis** - Analyze target demographics and preferences
3. **Caption Generation** - Create engaging captions
4. **Hashtag Generation** - Generate trending and niche hashtags
5. **CTA Generation** - Create call-to-action copy
6. **Image Generation** - Generate featured image (stub)
7. **Platform Adaptation** - Adapt content for each platform
8. **Package** - Create publishing package

## Supported Platforms

- Instagram
- Facebook
- X (Twitter)
- LinkedIn

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
# Generate social media campaign
npm run run -- --topic "AI Studio Promo"

# With options
npm run run -- --topic "Product Launch" --audience "Young Professionals"
npm run run -- --topic "Sale" --platforms instagram,facebook
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--topic <text>` | Campaign topic (required) | - |
| `--audience <text>` | Target audience | `UMKM` |
| `--platforms <list>` | Comma-separated platforms | `all` |
| `--no-image` | Skip image generation | `false` |
| `--help` | Show help message | - |

## Output

Generated files are saved in the `output/` directory:

```
output/
├── 2026-07-12-topic-instagram.txt  # Instagram post
├── 2026-07-12-topic-facebook.txt    # Facebook post
├── 2026-07-12-topic-x.txt           # X post
├── 2026-07-12-topic-linkedin.txt    # LinkedIn post
├── 2026-07-12-topic-hashtags.txt    # All hashtags
├── 2026-07-12-topic-cta.txt         # Call-to-action
├── 2026-07-12-topic-metadata.json    # Campaign metadata
```

## Architecture

### Domain Model

```
Composition (Social Media Campaign)
├── Workflow (wf-social-media)
│   ├── Task: Research
│   ├── Task: Audience Analysis
│   ├── Task: Caption
│   ├── Task: Hashtag
│   ├── Task: CTA
│   ├── Task: Image
│   ├── Task: Adaptation
│   └── Task: Packaging
└── Capabilities
    ├── Knowledge Search
    ├── Audience Analyze
    ├── Text Generate
    ├── Hashtag Generate
    ├── Image Generate
    └── Content Adapt
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
| `OUTPUT_DIR` | Output directory | No |
| `LOG_LEVEL` | Logging level | No |

## Documentation

- [MMOS Overview](https://github.com/adminberitakarya-Aji/mmos)
- [SDK Documentation](../sdk/README.md)
- [Runtime Documentation](../runtime/README.md)
- [Social Media Scenario](../examples/social-media.md)

## License

MIT