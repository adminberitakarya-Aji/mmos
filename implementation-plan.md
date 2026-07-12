# MMOS Implementation Plan - Phase 3: Executable Specification (Design Complete) & Phase 4: Reference Implementation

> **Status**: Planned  
> **Version**: MMOS v1.0  
> **Current Phase**: 3 (Executable Specification) — **Design Complete**  
> **Next Phase**: 4 (Reference Implementation — SDK, Runtime, Tools, Examples)  
> **Created**: 2026-07-10

---

## Executive Summary

**Phase 3 (Executable Specification) — Design Complete:**

| Komponen | Status | Catatan |
|----------|--------|---------|
| 20 Architecture Decision Records (ADR-001 to ADR-020) | ✅ Complete | Kontrak arsitektur beku |
| 10 Rich Domain JSON Schemas (specs/schemas/) | ✅ Complete | Sumber kebenaran untuk validasi |
| 9 Implementation Specifications (specs/ims/, IMS-100 to IMS-900) | ✅ Complete | Spesifikasi perilaku |
| 5 Runtime Reference Documents (docs/reference/runtime/) | ✅ Complete | **Belum diimplementasikan** — menjadi bagian dari Milestone 2.6 |
| &nbsp;&nbsp;&nbsp;├─ system-loop.md | ✅ Complete | Detak jantung Runtime |
| &nbsp;&nbsp;&nbsp;├─ scheduler-loop.md | ✅ Complete | Pemilihan Task berikutnya |
| &nbsp;&nbsp;&nbsp;├─ execution-loop.md | ✅ Complete | Siklus hidup Execution |
| &nbsp;&nbsp;&nbsp;├─ agent-loop.md | ✅ Complete | Siklus penalaran Agent |
| &nbsp;&nbsp;&nbsp;└─ event-loop.md | ✅ Complete | Pemrosesan & dispatch Event |
| Validator Specification (tools/validator/) | ✅ Spec Complete | Desain saja; implementasi ditunda ke Phase 4 |
| Generator Specification (tools/generators/) | ✅ Spec Complete | Desain saja; implementasi ditunda ke Phase 4 |
| CLI Specification (tools/cli/) | ✅ Spec Complete | Desain saja; implementasi ditunda ke Phase 4 |

> **Per AUDIT_REPORT.md**: "Tidak ada kode implementasi... tools/ hanya berisi dokumen spesifikasi/desain markdown."

**Key Clarification**: Validator, Generator, dan CLI **implementation** sengaja ditunda ke **Phase 4**, tempat mereka akan dibangun **atas dasar MMOS SDK** (mengkonsumsi validasi skema, model domain, dan antarmuka engine). Hal ini memastikan:
- Tools berbagi logika validasi yang sama dengan Runtime
- Satu sumber kebenaran untuk tipe domain (SDK)
- Tools dapat menghasilkan kode yang langsung menggunakan API SDK

**Tujuan Phase 4**: Menyampaikan Implementasi Referensi lengkap:
1. **MMOS SDK** — Perpustakaan inti: model domain, validasi skema, antarmuka engine, builder
2. **Reference Runtime** — Implementasi Orkes + Engine
3. **Developer Tools** — Validator, Generator, CLI (dibangun atas SDK)
4. **Sample Applications** — Demo end-to-end yang membuktikan stack bekerja

---

## Scope

| Component | Description | Priority |
|-----------|-------------|----------|
| | **MMOS SDK** | Perpustakaan inti: model domain, validasi skema, antarmuka engine, builder | P0 |
| | **Reference Runtime** | Implementasi Orkes + Engine (Runtime, Capability, Memory, Event) | P0 |
| | **Sample Applications** | Demo end-to-end: Blog Generation, News Production, Social Media | P1 |
| | **Reference UI** (opsional) | Visual composer, execution monitor, marketplace browser | P2 |

---

## Keputusan Arsitektur (Terkunci)

| Keputusan | Pilihan | Rasional |
|-----------|---------|----------|
| | **Bahasa Utama** | TypeScript (Node.js / Bun) | Sesuai dengan dokumentasi CLI/Generator; berjalan di partout; ketik kuat untuk model domain |
| | **Model Runtime** | Perpustakaan tertanam (bukan mikrolayanan) | Pengalaman dev tanpa infrastruktur; dapat disebarkan sebagai perpustakaan atau dibungkus dalam layanan nanti |
| | **Pengelola Paket** | npm (dengan Bun untuk kecepatan) | Ekosistem standar |
| | **Validasi** | AJV + Skema MMOS | Menggunakan ulang skema JSON Fase 3 secara langsung |
| | **Pengujian** | Vitest | Cepat, berbasis TypeScript |
| | **Build** | tsup / tsc | Output ESM + CJS ganda |

---

## Struktur Direktori (Target)

```
mmos/
├── packages/
│   ├── sdk/                    # @mmos/sdk
│   │   ├── src/
│   │   │   ├── domain/         # Model domain (Komposisi, Alur Kerja, Tugas, Agen, ...)
│   │   │   ├── schema/         # Validasi skema (AJV + jenis yang dihasilkan)
│   │   │   ├── engine/         # Antarmuka engine (RuntimeEngine, CapabilityEngine, ...)
│   │   │   ├── builder/        # Builder fluent (ConstructionBuilder, WorkflowBuilder, ...)
│   │   │   ├── runtime/        # Orkestrasi runtime (Orkestrator, ExecutionContext)
│   │   │   └── index.ts        # API Publik
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── runtime/                # @mmos/runtime (Referensi Runtime)
│   │   ├── src/
│   │   │   ├── orchestrator/   # Koordinator eksekusi alur kerja
│   │   │   ├── engine/
│   │   │   │   ├── runtime/    # Implementasi RuntimeEngine (OpenAI, Anthropic, Lokal)
│   │   │   │   ├── capability/ # CapabilityEngine (HTTP, CLI, Fungsi, MCP)
│   │   │   │   ├── memori/     # MemoryEngine (Dalam Memori, Redis, Vektor, Berkas)
│   │   │   │   └── event/      # EventEngine (Dalam Memori, Redis, Kafka)
│   │   │   ├── registry/       # Registri Kapasitas/Agen/Alur Kerja
│   │   │   ├── loops/          # 5 Loop Runtime (per docs/reference/runtime/*.md)
│   │   │   │   ├── system/     # SystemLoop — heartbeat Runtime
│   │   │   │   ├── scheduler/  # SchedulerLoop — pemilihan Task berikutnya
│   │   │   │   ├── execution/  # ExecutionLoop — siklus hidup Execution
│   │   │   │   ├── agent/      # AgentLoop — siklus penalaran Agent
│   │   │   │   └── event/      # EventLoop — pemrosesan & dispatch Event
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── examples/               # Contoh Aplikasi (tidak diterbitkan)
│       ├── blog-generation/
│       ├── news-production/
│       └── social-media/
│
├── tools/                      # Ada (CLI, Generator, Validator)
├── specs/                      # Ada (skema, IMS)
├── docs/                       # Ada (arsitektur, ADR)
│   └── reference/
│       └── runtime/
│           ├── agent-loop.md
│           ├── event-loop.md
│           ├── execution-loop.md
│           ├── scheduler-loop.md
│           └── system-loop.md
├── implementation-plan.md      # File ini
├── package.json                # Akar workspace
├── tsconfig.base.json
└── README.md
```

---

## Pecahan Pekerjaan

### Milestone 1: Inti SDK (Minggu 1)

#### 1.1 Pengaturan Ruang Kerja
- [x] Root `package.json` dengan konfigurasi workspace
- [x] `tsconfig.base.json` dengan pengaturan ketat
- [x] `packages/sdk/package.json` dengan dependensi: `ajv`, `ajv-formats`, `zod` (opsional), `uuid`, `yaml`
- [x] Konfigurasi build: `tsup` untuk ESM+CJS, `vitest` untuk pengujian

#### 1.2 Model Domain (`packages/sdk/src/domain/`)
- [x] `Composition.ts` — agregat akar (per ADR-002)
- [x] `Workflow.ts` — alur kerja deklaratif (per ADR-007)
- [x] `Task.ts` — unit kerja
- [x] `Agent.ts` — definisi agen + kapasitas
- [x] `Execution.ts` — unit runtime (per ADR-008)
- [x] `Runtime.ts` — konfigurasi penyedia AI
- [x] `Capability.ts` — kontrak kapasitas eksternal (per ADR-010)
- [x] `Memory.ts` — penyedia konteks (per ADR-011)
- [x] `Artifact.ts` — artefak keluaran
- [x] `Event.ts` — peristiwa tidak dapat diubah (per ADR-012)
- [x] `Identity.ts` — identitas objek (per ADR-013)
- [x] `index.ts` — ekspor tambal

#### 1.3 Validasi Skema (`packages/sdk/src/schema/`)
- [x] Muat semua 10 skema JSON dari `specs/schemas/*.schema.json`
- [x] Kompilasi instance AJV per skema
- [x] `validate(schemaName, data)` fungsi
- [x] Jenis TypeScript dihasilkan dari skema (`SchemaName` union, jenis per-skema)
- [x] Uji unit: payload valid/tidak valid per skema (semua 10 skema, validasi sendiri)

#### 1.4 Antarmuka Engine (`packages/sdk/src/engine/`)
- [x] `RuntimeEngine` — `execute(prompt, config): Promise<Hasil>`
- [x] `CapabilityEngine` — `invoke(capability, input): Promise<Output>`
- [x] `MemoryEngine` — `simpan(kunci, nilai)`, `ambil(kueri)`, `cari(vektor)`
- [x] `EventEngine` — `terbitkan(peristiwa)`, `langgan(jenis, penangan)`
- [x] Semua antarmuka di `engine/index.ts`

#### 1.5 Pembuat (`packages/sdk/src/builder/`)
- [x] `CompositionBuilder` — API fluent untuk Komposisi
- [x] `WorkflowBuilder` — konstruksi alur kerja deklaratif
- [x] `TaskBuilder` — tugas dengan ikatan agen/kapasitas
- [x] `AgentBuilder` — agen dengan kapasitas, memori, runtime
- [x] `ExecutionBuilder` — konfigurasi eksekusi runtime

#### 1.6 Orkestrasi Runtime (`packages/sdk/src/runtime/`)
- [x] `Orkestrator` — mengoorkestrasi eksekusi alur kerja
- [x] `ExecutionContext` — membawa status, memori, peristiwa selama eksekusi
- [x] `ExecutionResult` — keluaran + peristiwa + artefak
- [x] Eksekusi berbasis peristiwa (per ADR-014)

#### 1.7 Titik Masuk SDK & Uji
- [x] `packages/sdk/src/index.ts` — ekspor API publik
- [x] Uji unit: pembuatan model domain (identitas, metadata, fungsi buat), validasi (semua 10 skema JSON), pola pembuat (Komposisi, Alur Kerja, Tugas)
- [ ] Uji integrasi: Komposisi minimal → Alur Kerja → Eksekusi (mesin tiruan)
- [x] Verifikasi build: `npm run build` menghasilkan `dist/` dengan jenis

---

### Milestone 2: Referensi Runtime (Minggu 2)

#### 2.1 Pengaturan Paket Runtime
- [x] `packages/runtime/package.json` — bergantung pada `@mmos/sdk`
- [x] Implementasi engine sebagai modul terpisah

#### 2.2 Implementasi Orkestrator (`packages/runtime/src/orchestrator/`)
- [x] `DefaultOrchestrator` — menerapkan logika orkestrasi
- [x] Resolusi DAG Alur Kerja → Tugas
- [x] Penjadwalan Tugas (berurutan, paralel, bersyarat)
- [x] Penanganan kesalahan: coba lagi, fallback, kompensasi
- [x] Pemeriksaan titik masuk manusia (per ADR-015)

#### 2.3 Implementasi Engine

**RuntimeEngine** (`packages/runtime/src/engine/runtime/`)
- [x] `OpenAIRuntimeEngine` — API kompatibel OpenAI
- [x] `AnthropicRuntimeEngine` — API Anthropic
- [x] `LocalRuntimeEngine` — Ollama / llama.cpp / model lokal
- [x] `MockRuntimeEngine` — untuk pengujian

**CapabilityEngine** (`packages/runtime/src/engine/capability/`)
- [x] `HttpCapabilityEngine` — panggilan REST/GraphQL
- [x] `CliCapabilityEngine` — eksekusi perintah shell
- [x] `FunctionCapabilityEngine` — fungsi TypeScript dalam proses
- [x] `McpCapabilityEngine` — Protokol Konteks Model

**MemoryEngine** (`packages/runtime/src/engine/memory/`)
- [x] `InMemoryMemoryEngine` — berbasis Map (dev)
- [x] `FileMemoryEngine` — berkas JSON/Markdown
- [x] `RedisMemoryEngine` — Redis + vektor (prod, dengan fallback dalam memori)
- [x] `VectorMemoryEngine` — pencarian berbasis penyamaan (kosinus/euclidean/dot-product)

**EventEngine** (`packages/runtime/src/engine/event/`)
- [x] `InMemoryEventEngine` — berbasis EventEmitter (dev)
- [x] `RedisEventEngine` — Aliran Redis (prod, dengan fallback dalam memori)
- [x] `KafkaEventEngine` — Apache Kafka (prod, dengan fallback dalam memori)

#### 2.4 Registri (`packages/runtime/src/registry/`)
- [x] `CapabilityRegistry` — memuat kapasitas dari skema + implementasi
- [x] `AgentRegistry` — definisi agen
- [x] `WorkflowRegistry` — templat alur kerja
- [x] Sistem plugin untuk mesin kustom

#### 2.5 Uji Integrasi Runtime
- [ ] Uji akhir ke akhir: Komposisi → Orkestrator → Mesin → Hasil
- [ ] Uji dengan alur kerja Blog Generation (mesin tiruan pertama)
- [ ] Uji emissi peristiwa, persistenan memori, pemanggilan kapasitas

#### 2.6 Arsitektur 5 Loop Runtime (Baru — per `docs/reference/runtime/*.md`)

> **Latar Belakang**: Fase 3 telah menghasilkan 5 dokumen referensi runtime
> (`system-loop.md`, `scheduler-loop.md`, `execution-loop.md`, `agent-loop.md`,
> `event-loop.md`) yang menjelaskan siklus internal Runtime. Dokumen-dokumen
> tersebut saat ini **belum diimplementasikan** sebagai modul terpisah di
> `@mmos/runtime`. Milestone ini menerjemahkan kelima dokumen referensi menjadi
> modul-modul kode yang dapat diuji, sehingga Runtime memiliki pemisahan
> tanggung jawab yang jelas (sesuai ADR-003 Orchestrator Never Works, ADR-004
> Engine Separation, ADR-009 Runtime is Stateless, ADR-014 Event-Driven
> Architecture).

**Pohon Target**:

```
packages/runtime/src/loops/
├── system/         # SystemLoop — detak jantung Runtime
├── scheduler/      # SchedulerLoop — pemilihan Task
├── execution/      # ExecutionLoop — siklus hidup Execution
├── agent/          # AgentLoop — siklus penalaran Agent
└── event/          # EventLoop — pemrosesan & dispatch Event
```

##### 2.6.1 System Loop (`packages/runtime/src/loops/system/`)
- [x] `system-loop.ts` — implementasi `RuntimeManager` yang menjalankan
      `while (runtime.isRunning) { processExecutions(); }`
- [x] `iteration-step.ts` — 10 langkah iterasi (Read Events → Update State →
      Select Execution → Evaluate Workflow → Select Task → Dispatch Engine →
      Collect Result → Update Memory → Publish Event → Repeat)
- [x] `system-state.ts` — state evaluator (Pending / Ready / Running / Waiting /
      Completed) sesuai execution state machine
- [x] `shutdown-handler.ts` — graceful shutdown (Stop Accepting → Finish Active
      → Flush Events → Persist State → Shutdown)
- [x] `parallel-execution-coordinator.ts` — multi-execution dispatcher
- [x] `system-loop.test.ts` — uji heartbeat, paralelisme, shutdown terkontrol
- [x] `index.ts` — ekspor publik

##### 2.6.2 Scheduler Loop (`packages/runtime/src/loops/scheduler/`)
- [x] `scheduler.ts` — `Scheduler` yang menjawab 3 pertanyaan:
      *What? When? Where?*
- [x] `priority-evaluator.ts` — evaluasi prioritas (Critical/High/Normal/Low)
- [x] `dependency-evaluator.ts` — `Satisfied?` → Wait / Ready
- [x] `capability-evaluator.ts` — validasi ketersediaan Capability via
      `CapabilityRegistry`
- [x] `resource-evaluator.ts` — Resource Availability (CPU/Memory/GPU/Workers)
- [x] `ready-queue.ts` — struktur data `Ready Queue` dinamis
- [x] `retry-queue.ts` — `Retry Queue` sesuai RetryPolicy
- [x] `fair-selection.ts` — anti-starvation untuk multi-execution
- [x] `scheduler-loop.test.ts` — uji prioritas, dependency, retry, fairness
- [x] `index.ts` — ekspor publik

##### 2.6.3 Execution Loop (`packages/runtime/src/loops/execution/`)
- [x] `execution-loop.ts` — pemuatan Workflow + Composition + Context
      Initialization (memperluas konsep `DefaultOrchestrator`)
- [x] `execution-state-machine.ts` — transisi state
      (Created → Initialized → Running → Waiting → Running → Completed, atau
      Failed → Retry, atau Cancelled)
- [x] `task-dispatcher.ts` — eksekusi Task via Orchestrator
      (**tidak pernah memanggil Engine secara langsung**)
- [x] `result-collector.ts` — Validate → Normalize → Update Execution
- [x] `memory-synchronizer.ts` — Read Context → Merge Result → Write Memory
- [x] `retry-handler.ts` — penerapan `RetryPolicy`
- [x] `cancellation-handler.ts` — Stop Dispatch → Complete Active Task →
      Cancelled (tanpa menghapus Event/Memory)
- [x] `execution-loop.test.ts` — uji lifecycle, retry, cancellation,
      parallel tasks
- [x] `index.ts` — ekspor publik

##### 2.6.4 Agent Loop (`packages/runtime/src/loops/agent/`)
- [x] `agent-loop.ts` — `run(task, context)` Receive Task → Done
- [x] `context-builder.ts` — Task Input + Execution Context + Memory Context +
      Composition Context + Agent Context
- [x] `objective-analyzer.ts` — Objective → Constraints → Requirements →
      Execution Plan (tidak mengubah Objective)
- [x] `reasoner.ts` — Context → Reason → Decision → Action Plan
      (dengan iterasi internal)
- [x] `capability-selector.ts` — Task → Capability Registry → Matching → Selected
      (berdasarkan kontrak, bukan implementasi)
- [x] `engine-invoker.ts` — Agent → Orchestrator → Engine → Result
      (tidak memanggil Engine secara langsung)
- [x] `result-evaluator.ts` — Quality Check → Accepted? (loop kembali ke
      Reason jika tidak)
- [x] `output-generator.ts` — Validated Result → Normalize → Artifact → Output
- [x] `memory-updater.ts` — delegasi ke MemoryEngine (Agent tidak menyimpan
      Memory secara langsung)
- [x] `human-in-loop.ts` — Human Approval Required → Wait → Approved? →
      Continue / Cancelled (per ADR-015)
- [x] `agent-loop.test.ts` — uji reasoning, capability selection, iteration,
      human-in-the-loop, failure handling
- [x] `index.ts` — ekspor publik

##### 2.6.5 Event Loop (`packages/runtime/src/loops/event/`)
- [x] `event-loop.ts` — Event Created → Validate → Publish → Queue → Select →
      Dispatch → Subscribers → Complete → Archive
- [x] `event-validator.ts` — Validasi Schema + Validasi Metadata
- [x] `event-queue.ts` — antrian dengan urutan deterministik
- [x] `event-selector.ts` — pemilihan event berikutnya sesuai kebijakan Runtime
- [x] `event-dispatcher.ts` — pengiriman ke 1..N Subscribers dengan
      isolasi kesalahan (satu Subscriber gagal tidak menghentikan yang lain)
- [x] `subscriber-registry.ts` — pendaftaran subscriber per kategori
      (Execution, Workflow, Task, Capability, Memory, Runtime, Plugin, System)
- [x] `retry-policy.ts` — Handler Failed → Retry → Dispatch Again
- [x] `dead-letter-queue.ts` — Retry Failed → DLQ → Manual Inspection
- [x] `event-archiver.ts` — Read-Only archive (Event immutable per ADR-012)
- [x] `event-loop.test.ts` — uji validasi, ordering, retry, DLQ, immutability,
      kategori event
- [x] `index.ts` — ekspor publik

##### 2.6.6 Kepatuhan Lintas-Loop
- [x] Setiap modul Loop menggunakan **Engine** via `EngineBindings` (tidak
      pernah langsung; sesuai ADR-003)
- [x] Setiap Loop stateless; state permanen di luar Loop (sesuai ADR-009)
- [x] Setiap perubahan signifikan mempublikasikan `Event` (sesuai ADR-014)
- [x] `packages/runtime/src/loops/index.ts` — barrel ekspor
- [x] `packages/runtime/src/index.ts` — re-ekspor modul Loop
- [ ] Uji integrasi: simulasi SystemLoop → SchedulerLoop → ExecutionLoop →
      AgentLoop + EventLoop end-to-end dengan engine tiruan

---

### Milestone 3: Aplikasi Contoh (Minggu 3)

#### 3.1 Pembuatan Blog (`packages/examples/blog-generation/`)
- [x] Create directory structure: `packages/examples/blog-generation/`
- [x] Create composition file: `blog-generation.composition.json`
- [x] Define workflow: Research → Outline → Write → Review → Publish
- [x] Create agent definitions:
    - Researcher agent with web.search capability
    - Writer agent with text.generate capability
    - Editor agent with text.summarize capability
    - Publisher agent with cms.publish capability
- [x] Implement capability implementations:
    - web.search: Web search capability (stub)
    - text.generate: Text generation capability (stub)
    - text.summarize: Text summarize/review capability (stub)
- [x] Configure runtime: blog-generator.ts orchestrator
- [x] Create example runner script: `src/run-blog-example.ts`
- [x] Create environment template: `.env.example`
- [x] Create README with usage instructions

#### 3.2 Produksi Berita (`packages/examples/news-production/`)
- [x] Create directory structure: `packages/examples/news-production/`
- [x] Create composition file: `news-production.composition.json`
- [x] Define workflow: Research → Verify → Headline → Write → Review → SEO → Thumbnail → Package
- [x] Implement capability implementations:
    - rss-fetch: RSS feed capability (stub)
    - news-verify: Fact-checking capability (stub)
    - headline-generate: Headline generation capability (stub)
    - text-generate: Article generation capability (stub)
    - text-review: Editorial review capability (stub)
- [x] Create news-generator orchestrator with 8-step pipeline
- [x] Create example runner script: `src/run-news-example.ts`
- [x] Create environment template: `.env.example`
- [x] Create README with usage instructions

#### 3.3 Media Sosial (`packages/examples/social-media/`)
- [x] Create directory structure: `packages/examples/social-media/`
- [x] Create composition file: `social-media.composition.json`
- [x] Define workflow: Research → Audience → Caption → Hashtag → CTA → Image → Adapt → Package
- [x] Implement capability implementations:
    - knowledge-search: Campaign research capability (stub)
    - audience-analyze: Target audience analysis (stub)
    - text-generate: Caption & CTA generation (stub)
    - hashtag-generate: Hashtag generation (stub)
    - image-generate: Image generation (stub)
    - content-adapt: Platform adaptation (stub)
- [x] Create social-generator orchestrator with 7-step pipeline
- [x] Create example runner script: `src/run-social-example.ts`
- [x] Create environment template: `.env.example`
- [x] Create README with usage instructions

#### 3.4 Pelari Contoh
- [x] Create shared `src/` directory with common utilities
- [x] Create shared types: `src/types.ts` (logger, config, parsing)
- [x] Create shared runner: `src/run-example.ts` (CLI, output management)
- [x] Create `src/index.ts` barrel export
- [x] Create environment template: `.env.example`
- [x] Create README with usage instructions
- [x] Create package configuration: `package.json`, `tsconfig.json`

---

### Milestone 4: Referensi UI (Opsional, Paralel) — P2
- [ ] Visualisasi komposisi berbasis web (React + React Flow)
- [ ] Penonton timeline eksekusi (pemutaran berdasarkan peristiwa)
- [ ] Browser pasar kapasitas
- [ ] Dapat disebarkan sebagai situs statis atau aplikasi Electron

---

## Ketergantungan Antar Milestone

```
Milestone 1 (SDK) ──────┬──────► Milestone 2 (Runtime)
                        │
                        └──────► Milestone 3 (Contoh)
                                           │
                                           ▼
                                    Milestone 4 (UI) [opsional]
```

- M2 memerlukan M1 selesai (SDK dipublikasikan secara lokal melalui `npm link` atau protokol workspace)
- M3 memerlukan M2 selesai (mesin runtime)
- M4 dapat dimulai setelah M1 (mengonsumsi jenis SDK)

---

## Gerbang Kualitas

| Gerbang | Kriteria |
|---------|----------|
| | **M1 Selesai** | Semua model domain terkompilasi, skema divalidasi, builder berfungsi, uji unit lulus |
| | **M2 Selesai** | Orkestrator mengeksekusi alur kerja 3 langkah dengan mesin tiruan; peristiwa dipancarkan; memori bertahan |
| | **M3 Selesai** | Blog Generation berjalan end-to-end dengan API OpenAI nyata (atau model lokal); menghasilkan keluaran markdown |
| | **M4 Selesai** | UI memuat komposisi, menampilkan grafik eksekusi, memutar peristiwa |

---

## Mitigasi Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| | Deret Skema ↔ TypeScript | Tinggi | Menghasilkan jenis dari Skema JSON di langkah build; pemeriksaan CI |
| | Perubahan antarmuka engine | Menengah | Simpan antarmuka di SDK; mesin mengimplementasikan — versi bersama |
| | Perubahan API penyedia | Rendah | Pola adaptor di RuntimeEngine; uji terhadap beberapa penyedia |
| | Kinerja (pencarian vektor) | Sedang | Mulai dengan dalam memori; tukar ke Redis/pgvector nanti |
| | Screep contoh | Sedang | Waktu tinjau setiap contoh hingga 2 hari maks; potong fitur jika diperlukan |

---

## Definisi Selesai (Fase 4)

- [ ] `@mmos/sdk` diterbitkan ke npm (atau GitHub Packages) dengan jenis
- [ ] `@mmos/runtime` diterbitkan dengan setidaknya 2 implementasi RuntimeEngine, 1 MemoryEngine, 1 EventEngine
- [ ] **5 Loop Runtime terimplementasi** di `packages/runtime/src/loops/`:
      - [ ] `SystemLoop` (heartbeat) + uji paralelisme & shutdown
      - [ ] `SchedulerLoop` (prioritas, dependency, retry, fairness) + uji
      - [ ] `ExecutionLoop` (lifecycle, retry, cancellation) + uji
      - [ ] `AgentLoop` (reasoning, capability, human-in-the-loop) + uji
      - [ ] `EventLoop` (validasi, queue, retry, DLQ) + uji
      - [ ] Uji integrasi lintas-loop end-to-end
- [ ] Setidaknya 1 aplikasi contoh berjalan end-to-end dengan penyedia AI nyata
- [ ] Dokumentasi: `docs/reference/sdk.md`, `docs/reference/runtime.md`,
      `docs/reference/runtime/agent-loop.md`, `docs/reference/runtime/event-loop.md`,
      `docs/reference/runtime/execution-loop.md`,
      `docs/reference/runtime/scheduler-loop.md`,
      `docs/reference/runtime/system-loop.md`
- [ ] CI: latik, pemeriksaan jenis, uji, build pada setiap PR
- [ ] CHANGELOG.md diperbarui dengan entri Fase 4

---

## Tindakan Berikutnya (Segera)

1. **Buat kerangka ruang kerja** — `package.json` akar, `tsconfig.base.json`, direktori `packages/`
2. **Inisialisasi paket SDK** — model domain pertama (mereka mengemudikan segalanya lain)
3. **Siapkan alur kerja CI** — GitHub Actions: lint + typecheck + test + build

---

## Catatan

- Semua skema JSON di `specs/schemas/` adalah **sumber kebenaran** untuk validasi
- ADR di `adr/` adalah **mengikat** — implementasi harus mematuhi
- Generator/Validator/CLI di `tools/` akan diimplementasikan dalam TypeScript nanti untuk mengkonsumsi SDK
- **5 dokumen referensi runtime** di `docs/reference/runtime/*.md` adalah
  **spesifikasi perilaku** untuk kelima loop Runtime. Milestone 2.6 menerjemahkan
  dokumen-dokumen tersebut menjadi modul-modul kode di
  `packages/runtime/src/loops/{system,scheduler,execution,agent,event}/`,
  dengan pemisahan tegas: setiap Loop mengakses Engine hanya via Orchestrator
  (ADR-003), tidak menyimpan state permanen (ADR-009), dan mempublikasikan
  Event untuk setiap perubahan signifikan (ADR-014).
- Rencana ini adalah dokumen hidup — perbarui ketika keputusan dibuat

---

*Akhir dari Rencana Implementasi*
</task_progress>
- [x] List files in docs/reference/runtime
- [x] Read agent-loop.md
- [x] Read event-loop.md
- [x] Read execution-loop.md
- [x] Read scheduler-loop.md
- [x] Read system-loop.md
- [x] Read implementation-plan.md
- [x] Update implementation-plan.md to include the 5 runtime reference documents
- [x] Fix typo in Milestone 4 section
- [x] Enhance 3.1 Blog Generation section with detailed implementation steps
- [x] Enhance 3.2 News Production section with detailed implementation steps
- [x] Enhance 3.3 Social Media section with detailed implementation steps
- [x] Enhance 3.4 Example Runner section with detailed implementation steps
</task_progress>
</write_to_file>