# MMOS Implementation Plan - Phase 3: Executable Specification (Design Complete) & Phase 4: Reference Implementation

> **Status**: Planned  
> **Version**: MMOS v1.0  
> **Current Phase**: 3 (Executable Specification) — **Design Complete**  
> **Next Phase**: 4 (Reference Implementation — SDK, Runtime, Tools, Examples)  
> **Created**: 2026-07-10

---

## Executive Summary

**Phase 3 (Executable Specification) — Design Complete:**

| Component | Status | Notes |
|-----------|--------|-------|
| 20 Architecture Decision Records (ADR-001 to ADR-020) | ✅ Complete | Frozen architectural contracts |
| 10 Rich Domain JSON Schemas (specs/schemas/) | ✅ Complete | Source of truth for validation |
| Validator Specification (tools/validator/) | ✅ Spec Complete | Design docs only; implementation deferred |
| Generator Specification (tools/generators/) | ✅ Spec Complete | Design docs only; implementation deferred |
| CLI Specification (tools/cli/) | ✅ Spec Complete | Design docs only; implementation deferred |

> **Per AUDIT_REPORT.md**: "Tidak ada kode implementasi... tools/ hanya berisi dokumen spesifikasi/desain markdown."

**Key Clarification**: Validator, Generator, and CLI **implementation** is intentionally deferred to **Phase 4**, where they will be built **on top of the MMOS SDK** (consuming its schema validation, domain models, and engine interfaces). This ensures:
- Tools share the same validation logic as the Runtime
- Single source of truth for domain types (SDK)
- Tools can generate code that directly uses SDK APIs

**Phase 4 Goal**: Deliver the complete Reference Implementation:
1. **MMOS SDK** — Core library: domain models, schema validation, engine interfaces, builders
2. **Reference Runtime** — Orchestrator + Engine implementations
3. **Developer Tools** — Validator, Generator, CLI (built on SDK)
4. **Sample Applications** — End-to-end demos proving the stack works

---

## Scope

| Component | Description | Priority |
|-----------|-------------|----------|
| **MMOS SDK** | Core library: domain models, schema validation, engine interfaces, builders | P0 |
| **Reference Runtime** | Orchestrator + Engine implementations (Runtime, Capability, Memory, Event) | P0 |
| **Sample Applications** | End-to-end demos: Blog Generation, News Production, Social Media | P1 |
| **Reference UI** (optional) | Visual composer, execution monitor, marketplace browser | P2 |

---

## Architecture Decisions (Locked In)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Language** | TypeScript (Node.js / Bun) | Aligns with CLI/Generator docs; runs everywhere; strong typing for domain models |
| **Runtime Model** | Embedded library (not microservice) | Zero-infra dev experience; deployable as library or wrapped in service later |
| **Package Manager** | npm (with Bun for speed) | Standard ecosystem |
| **Validation** | AJV + MMOS schemas | Reuses Phase 3 JSON schemas directly |
| **Testing** | Vitest | Fast, TypeScript-native |
| **Build** | tsup / tsc | Dual ESM + CJS output |

---

## Directory Structure (Target)

```
mmos/
├── packages/
│   ├── sdk/                    # @mmos/sdk
│   │   ├── src/
│   │   │   ├── domain/         # Domain models (Composition, Workflow, Task, Agent, ...)
│   │   │   ├── schema/         # Schema validation (AJV + generated types)
│   │   │   ├── engine/         # Engine interfaces (RuntimeEngine, CapabilityEngine, ...)
│   │   │   ├── builder/        # Fluent builders (CompositionBuilder, WorkflowBuilder, ...)
│   │   │   ├── runtime/        # Runtime orchestration (Orchestrator, ExecutionContext)
│   │   │   └── index.ts        # Public API
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── runtime/                # @mmos/runtime (Reference Runtime)
│   │   ├── src/
│   │   │   ├── orchestrator/   # Workflow execution coordinator
│   │   │   ├── engine/
│   │   │   │   ├── runtime/    # RuntimeEngine implementations (OpenAI, Anthropic, Local)
│   │   │   │   ├── capability/ # CapabilityEngine (HTTP, CLI, Function, MCP)
│   │   │   │   ├── memory/     # MemoryEngine (InMemory, Redis, Vector, File)
│   │   │   │   └── event/      # EventEngine (InMemory, Redis, Kafka)
│   │   │   ├── registry/       # Capability/Agent/Workflow registry
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── examples/               # Sample Applications (not published)
│       ├── blog-generation/
│       ├── news-production/
│       └── social-media/
│
├── tools/                      # Existing (CLI, Generator, Validator)
├── specs/                      # Existing (schemas, IMS)
├── docs/                       # Existing (architecture, ADR)
├── implementation-plan.md      # This file
├── package.json                # Workspace root
├── tsconfig.base.json
└── README.md
```

---

## Work Breakdown

### Milestone 1: SDK Core (Week 1)

#### 1.1 Workspace Setup
- [x] Root `package.json` with workspaces config
- [x] `tsconfig.base.json` with strict settings
- [x] `packages/sdk/package.json` with dependencies: `ajv`, `ajv-formats`, `zod` (optional), `uuid`, `yaml`
- [x] Build config: `tsup` for ESM+CJS, `vitest` for testing

#### 1.2 Domain Models (`packages/sdk/src/domain/`)
- [x] `Composition.ts` — root aggregate (per ADR-002)
- [x] `Workflow.ts` — declarative workflow (per ADR-007)
- [x] `Task.ts` — unit of work
- [x] `Agent.ts` — agent definition + capabilities
- [x] `Execution.ts` — runtime unit (per ADR-008)
- [x] `Runtime.ts` — AI provider config
- [x] `Capability.ts` — external capability contract (per ADR-010)
- [x] `Memory.ts` — context provider (per ADR-011)
- [x] `Artifact.ts` — output artifact
- [x] `Event.ts` — immutable event (per ADR-012)
- [x] `Identity.ts` — object identity (per ADR-013)
- [x] `index.ts` — barrel export

#### 1.3 Schema Validation (`packages/sdk/src/schema/`)
- [x] Load all 10 JSON schemas from `specs/schemas/*.schema.json`
- [x] Compile AJV instances per schema
- [x] `validate(schemaName, data)` function
- [x] TypeScript types generated from schemas (`SchemaName` union, per-schema types)
- [x] Unit tests: valid/invalid payloads per schema (all 10 schemas, self-validation)

#### 1.4 Engine Interfaces (`packages/sdk/src/engine/`)
- [x] `RuntimeEngine` — `execute(prompt, config): Promise<Result>`
- [x] `CapabilityEngine` — `invoke(capability, input): Promise<Output>`
- [x] `MemoryEngine` — `store(key, value)`, `retrieve(query)`, `search(vector)`
- [x] `EventEngine` — `publish(event)`, `subscribe(type, handler)`
- [x] All interfaces in `engine/index.ts`

#### 1.5 Builders (`packages/sdk/src/builder/`)
- [x] `CompositionBuilder` — fluent API for Composition
- [x] `WorkflowBuilder` — declarative workflow construction
- [x] `TaskBuilder` — task with agent/capability binding
- [x] `AgentBuilder` — agent with capabilities, memory, runtime
- [x] `ExecutionBuilder` — runtime execution config

#### 1.6 Runtime Orchestration (`packages/sdk/src/runtime/`)
- [x] `Orchestrator` — coordinates workflow execution
- [x] `ExecutionContext` — carries state, memory, events during execution
- [x] `ExecutionResult` — output + events + artifacts
- [x] Event-driven step execution (per ADR-014)

#### 1.7 SDK Entry Point & Tests
- [x] `packages/sdk/src/index.ts` — public API exports
- [x] Unit tests: domain model creation (identity, metadata, create-functions), validation (all 10 JSON schemas), builder patterns (Composition, Workflow, Task)
- [ ] Integration test: minimal Composition → Workflow → Execution (mocked engines)
- [x] Build verification: `npm run build` produces `dist/` with types

---

### Milestone 2: Reference Runtime (Week 2)

#### 2.1 Runtime Package Setup
- [x] `packages/runtime/package.json` — depends on `@mmos/sdk`
- [x] Engine implementations as separate modules

#### 2.2 Orchestrator Implementation (`packages/runtime/src/orchestrator/`)
- [x] `DefaultOrchestrator` implementing orchestration logic
- [x] Workflow → Task DAG resolution
- [x] Task scheduling (sequential, parallel, conditional)
- [x] Error handling: retry, fallback, compensation
- [x] Human-in-the-loop checkpoints (per ADR-015)

#### 2.3 Engine Implementations

**RuntimeEngine** (`packages/runtime/src/engine/runtime/`)
- [x] `OpenAIRuntimeEngine` — OpenAI-compatible API
- [x] `AnthropicRuntimeEngine` — Anthropic API
- [x] `LocalRuntimeEngine` — Ollama / llama.cpp / local models
- [x] `MockRuntimeEngine` — for testing

**CapabilityEngine** (`packages/runtime/src/engine/capability/`)
- [x] `HttpCapabilityEngine` — REST/GraphQL calls
- [x] `CliCapabilityEngine` — shell command execution
- [x] `FunctionCapabilityEngine` — in-process TypeScript functions
- [x] `McpCapabilityEngine` — Model Context Protocol

**MemoryEngine** (`packages/runtime/src/engine/memory/`)
- [x] `InMemoryMemoryEngine` — Map-based (dev)
- [x] `FileMemoryEngine` — JSON/Markdown files
- [x] `RedisMemoryEngine` — Redis + vector (prod, with in-memory fallback)
- [x] `VectorMemoryEngine` — embedding-based search (cosine/euclidean/dot-product)

**EventEngine** (`packages/runtime/src/engine/event/`)
- [x] `InMemoryEventEngine` — EventEmitter-based (dev)
- [x] `RedisEventEngine` — Redis Streams (prod, with in-memory fallback)
- [x] `KafkaEventEngine` — Apache Kafka (prod, with in-memory fallback)

#### 2.4 Registry (`packages/runtime/src/registry/`)
- [x] `CapabilityRegistry` — load capabilities from schema + implementations
- [x] `AgentRegistry` — agent definitions
- [x] `WorkflowRegistry` — workflow templates
- [x] Plugin system for custom engines

#### 2.5 Runtime Integration Tests
- [ ] End-to-end: Composition → Orchestrator → Engines → Result
- [ ] Test with Blog Generation workflow (mock engines first)
- [ ] Test event emission, memory persistence, capability invocation

---

### Milestone 3: Sample Applications (Week 3)

#### 3.1 Blog Generation (`packages/examples/blog-generation/`)
- [ ] Composition: `blog-generation.composition.json`
- [ ] Workflows: Research → Outline → Write → Review → Publish
- [ ] Agents: Researcher, Writer, Editor, Publisher
- [ ] Capabilities: `web.search`, `text.generate`, `text.summarize`, `cms.publish`
- [ ] Runtime config: OpenAI + local memory + HTTP capability
- [ ] CLI entry: `npx mmos run blog-generation --topic "AI Trends"`

#### 3.2 News Production (`packages/examples/news-production/`)
- [ ] Composition: `news-production.composition.json`
- [ ] Workflows: Ingest → Verify → Write → Translate → Distribute
- [ ] Agents: Monitor, FactChecker, Journalist, Translator, Distributor
- [ ] Capabilities: `rss.fetch`, `news.verify`, `text.translate`, `social.post`

#### 3.3 Social Media (`packages/examples/social-media/`)
- [ ] Composition: `social-media.composition.json`
- [ ] Workflows: Trend → Plan → Create → Schedule → Analyze
- [ ] Agents: TrendAnalyzer, ContentPlanner, Creator, Scheduler, Analyst
- [ ] Capabilities: `social.trends`, `image.generate`, `video.render`, `social.schedule`

#### 3.4 Example Runner
- [ ] Shared `run-example.ts` script
- [ ] Environment config (`.env.example`)
- [ ] README per example with run instructions

---

### Milestone 4: Reference UI (Optional, Parallel) — P2

- [ ] Web-based Composition visualizer (React + React Flow)
- [ ] Execution timeline viewer (event-sourced replay)
- [ ] Capability marketplace browser
- [ ] Deployable as static site or Electron app

---

## Dependencies Between Milestones

```
Milestone 1 (SDK) ──────┬──────► Milestone 2 (Runtime)
                        │
                        └──────► Milestone 3 (Examples)
                                               │
                                               ▼
                                    Milestone 4 (UI) [optional]
```

- M2 requires M1 complete (SDK published locally via `npm link` or workspace protocol)
- M3 requires M2 complete (Runtime engines)
- M4 can start after M1 (consumes SDK types)

---

## Quality Gates

| Gate | Criteria |
|------|----------|
| **M1 Done** | All domain models compile, schemas validate, builders work, unit tests pass |
| **M2 Done** | Orchestrator executes a 3-step workflow with mocked engines; events emitted; memory persisted |
| **M3 Done** | Blog Generation runs end-to-end with real OpenAI API (or local model); produces markdown output |
| **M4 Done** | UI loads composition, shows execution graph, replays events |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema ↔ TypeScript drift | High | Generate types from JSON Schema in build step; CI check |
| Engine interface changes | Medium | Keep interfaces in SDK; engines implement — version together |
| Provider API changes | Low | Adapter pattern in RuntimeEngine; test against multiple providers |
| Performance (vector search) | Medium | Start with in-memory; swap to Redis/pgvector later |
| Scope creep in Examples | Medium | Time-box each example to 2 days max; cut features if needed |

---

## Definition of Done (Phase 4)

- [ ] `@mmos/sdk` published to npm (or GitHub Packages) with types
- [ ] `@mmos/runtime` published with at least 2 RuntimeEngine impls, 1 MemoryEngine, 1 EventEngine
- [ ] At least 1 sample app runs end-to-end with real AI provider
- [ ] Documentation: `docs/reference/sdk.md`, `docs/reference/runtime.md`
- [ ] CI: lint, typecheck, test, build on every PR
- [ ] CHANGELOG.md updated with Phase 4 entries

---

## Next Actions (Immediate)

1. **Create workspace scaffolding** — root `package.json`, `tsconfig.base.json`, `packages/` dirs
2. **Initialize SDK package** — domain models first (they drive everything else)
3. **Set up CI pipeline** — GitHub Actions: lint + typecheck + test + build

---

## Notes

- All JSON schemas in `specs/schemas/` are the **source of truth** for validation
- ADRs in `adr/` are **binding** — implementation must comply
- Generator/Validator/CLI in `tools/` will be implemented in TypeScript later to consume SDK
- This plan is a living document — update as decisions are made

---

*End of Implementation Plan*