# MMOS Examples

**Reference implementations demonstrating MMOS Runtime architecture**

This directory contains example applications that demonstrate the MMOS framework's capabilities:

## Examples

| Example | Description | Status |
|---------|-------------|--------|
| [Blog Generation](blog-generation/) | End-to-end blog content creation pipeline | ✅ Complete |
| [News Production](news-production/) | Multi-step news article production workflow | ✅ Complete |
| [Social Media](social-media/) | Multi-platform social media campaign generation | ✅ Complete |

## Shared Utilities

The `src/` directory contains shared utilities for all examples:

- **Logger** - Configurable logging with multiple levels
- **File utilities** - Output saving and directory management
- **Common types** - Shared TypeScript interfaces
- **Runner helpers** - Common CLI argument parsing and configuration

## Prerequisites

- Node.js 20+
- npm or pnpm

## Installation

Install dependencies for all examples:

```bash
npm install
```

## Running Examples

Each example can be run independently:

### Blog Generation

```bash
npm run run --workspace=packages/examples/blog-generation -- --topic "Your Blog Topic"
```

### News Production

```bash
npm run run --workspace=packages/examples/news-production -- --topic "Your News Topic"
```

### Social Media

```bash
npm run run --workspace=packages/examples/social-media -- --topic "Your Campaign Topic"
```

## Common Options

All examples support these common options:

| Option | Description |
|--------|-------------|
| `--help, -h` | Show help message |
| `--verbose, -v` | Enable verbose logging |
| `--log-level <level>` | Set log level (debug, info, warn, error) |
| `--output-dir <dir>` | Set output directory |

## Output

Generated files are saved to the `output/` directory (configurable via `--output-dir`):

```
output/
├── [timestamp]-[slug]-article.md    # Blog/News articles
├── [timestamp]-[slug]-headline.txt  # Headlines
├── [timestamp]-[slug]-metadata.json  # Metadata
└── [timestamp]-[slug]-*.txt          # Other outputs
```

## Architecture

Each example follows the MMOS architecture:

```
Composition (Root)
├── Workflow (Task Pipeline)
│   ├── Task 1 → Task 2 → Task 3...
│   └── Agents + Capabilities
└── Event-driven execution
```

## Documentation

- [MMOS Overview](../../README.md)
- [SDK Documentation](../sdk/README.md)
- [Runtime Documentation](../runtime/README.md)
- [Implementation Plan](../../implementation-plan.md)

## License

MIT