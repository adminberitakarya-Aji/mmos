# MAS-200 — Execution Model

Version: 1.0

---

# Purpose

MAS-200 mendefinisikan bagaimana Business Object dijalankan.

Jika MAS-100 menjelaskan **apa yang dikelola**, maka MAS-200 menjelaskan **bagaimana pekerjaan dilakukan**.

Execution Model memisahkan proses eksekusi dari Business Model sehingga perubahan workflow, AI Provider, maupun teknologi implementasi tidak mempengaruhi struktur bisnis.

---

# Scope

MAS-200 mencakup:

- Workflow
- Stage
- Task
- Capability
- Tool
- Provider
- Event

MAS-200 tidak mencakup:

- Business Object
- Engine
- Memory
- Runtime
- Infrastruktur

---

# Design Principles

Execution Model dibangun berdasarkan prinsip berikut.

## Workflow is Declarative

Workflow mendeskripsikan proses.

Workflow tidak menjalankan proses.

---

## Business Independent

Execution tidak memiliki Business Object.

Execution hanya menggunakan Business Object.

---

## Provider Agnostic

Workflow tidak mengetahui provider AI.

Pergantian provider tidak mengubah Workflow.

---

## Engine Driven

Workflow hanya mendeskripsikan pekerjaan.

Engine yang mengimplementasikan pekerjaan tersebut.

---

## Event Driven

Perubahan status selalu direpresentasikan sebagai Event.

Execution tidak menggunakan komunikasi langsung antar Engine.

---

# Execution Pipeline

```
Workflow
    │
    ▼
Stage
    │
    ▼
Task
    │
    ▼
Capability
    │
    ▼
Tool
    │
    ▼
Provider
    │
    ▼
Event
```

Execution selalu mengikuti urutan tersebut.

---

# Execution Objects

## Workflow

### Definition

Workflow adalah blueprint eksekusi.

Workflow mendeskripsikan urutan pekerjaan yang harus dilakukan untuk mencapai tujuan bisnis.

Workflow tidak mengandung implementasi.

---

### Responsibilities

- mendefinisikan proses
- mengatur Stage
- menentukan urutan eksekusi
- menjadi reusable workflow

---

### Owns

- Stage

---

### Uses

- Project
- Composition
- Asset
- Render
- Artifact

---

### Business Rules

Workflow:

- tidak menjalankan Task
- tidak memilih Tool
- tidak memilih Provider
- tidak mengetahui Engine

---

## Stage

### Definition

Stage merupakan kelompok Task yang mewakili satu fase pekerjaan.

Stage digunakan untuk membagi Workflow menjadi bagian yang lebih kecil.

---

### Responsibilities

- mengelompokkan Task
- menjadi boundary eksekusi
- mempermudah monitoring
- mempermudah retry

---

### Owns

- Task

---

### Business Rules

Stage:

- selalu berada di dalam Workflow
- tidak berdiri sendiri
- dieksekusi secara berurutan

---

## Task

### Definition

Task adalah unit pekerjaan terkecil yang dapat dijalankan.

Task hanya menjelaskan satu pekerjaan.

---

### Responsibilities

Task meminta sebuah Capability.

Task tidak mengetahui implementasinya.

---

### Uses

- Capability

---

### Examples

- Generate Script
- Generate Voice
- Generate Image
- Remove Background
- Upscale Image
- Translate
- Lip Sync
- Render Video

---

### Business Rules

Task:

- tidak mengetahui Tool
- tidak mengetahui Provider
- tidak mengetahui Engine

---

## Capability

### Definition

Capability adalah kemampuan abstrak yang dibutuhkan oleh Task.

Capability menjadi kontrak antara kebutuhan bisnis dan implementasi teknis.

---

### Responsibilities

Capability mendefinisikan:

- kemampuan
- input
- output
- kontrak layanan

---

### Uses

- Tool

---

### Examples

- Text Generation
- Image Generation
- Image Editing
- Video Generation
- Speech Synthesis
- OCR
- Translation
- Transcription
- Object Detection
- Background Removal

---

### Business Rules

Capability:

- tidak bergantung provider
- tidak bergantung model AI
- bersifat stabil

---

## Tool

### Definition

Tool merupakan implementasi konkret dari Capability.

Tool menyediakan cara menjalankan sebuah Capability.

---

### Responsibilities

- mengimplementasikan Capability
- menyediakan konfigurasi teknis
- melakukan normalisasi request

---

### Uses

- Provider

---

### Examples

Capability

```
Image Generation
```

Tool

```
FLUX

SDXL

Imagen

GPT Image

Nano Banana
```

---

### Business Rules

Tool:

- dapat diganti
- dapat bertambah
- tidak diketahui Workflow

---

## Provider

### Definition

Provider merupakan lingkungan tempat Tool dijalankan.

Provider dapat berupa cloud service maupun infrastruktur lokal.

---

### Responsibilities

- menyediakan komputasi
- menjalankan model AI
- menyediakan API

---

### Examples

- OpenAI
- Anthropic
- Google Vertex AI
- Fal
- Replicate
- Azure AI
- Local GPU

---

### Business Rules

Provider:

- dapat diganti
- dapat memiliki banyak Tool
- tidak diketahui Workflow

---

## Event

### Definition

Event merupakan representasi bahwa suatu perubahan telah terjadi.

Event digunakan sebagai mekanisme komunikasi antar komponen.

---

### Responsibilities

- memberi notifikasi perubahan
- memicu langkah berikutnya
- menyediakan audit trail

---

### Examples

WorkflowStarted

StageStarted

StageCompleted

TaskStarted

TaskCompleted

TaskFailed

RenderCompleted

ArtifactCreated

WorkflowCompleted

---

### Characteristics

Event:

- immutable
- timestamped
- append only

---

# Execution Relationships

```
Workflow
│
├── Stage
│      │
│      ├── Task
│      ├── Task
│      └── Task
│
└───────────────────────┐
                        │
                        ▼
                  Capability
                        │
                        ▼
                      Tool
                        │
                        ▼
                    Provider
                        │
                        ▼
                      Event
```

---

# Execution Lifecycle

```
Workflow Created

↓

Workflow Started

↓

Stage Started

↓

Task Executed

↓

Capability Requested

↓

Tool Selected

↓

Provider Executed

↓

Event Published

↓

Next Task

↓

Workflow Completed
```

---

# Execution Rules

## Rule 1

Workflow terdiri dari satu atau lebih Stage.

---

## Rule 2

Stage terdiri dari satu atau lebih Task.

---

## Rule 3

Task selalu menggunakan satu Capability.

---

## Rule 4

Capability dapat memiliki banyak Tool.

---

## Rule 5

Tool dapat berjalan pada banyak Provider.

---

## Rule 6

Workflow tidak mengetahui Tool.

---

## Rule 7

Workflow tidak mengetahui Provider.

---

## Rule 8

Task tidak mengetahui Provider.

---

## Rule 9

Provider dapat diganti tanpa mengubah Workflow.

---

## Rule 10

Seluruh perubahan status dipublikasikan sebagai Event.

---

# Interaction with MAS-100

Execution tidak memiliki Business Object.

Execution menggunakan Business Object dari MAS-100.

Contoh:

```
Project

↓

Composition

↓

Workflow

↓

Render

↓

Artifact
```

Business tetap berada pada MAS-100.

Execution hanya mengatur prosesnya.

---

# Interaction with MAS-300

Execution tidak menjalankan pekerjaan.

Execution hanya mendeskripsikan pekerjaan.

Engine pada MAS-300 mengimplementasikan Execution Model.

```
Workflow

↓

Task

↓

Capability

↓

Engine

↓

Business Object

↓

Event
```

---

# Out of Scope

MAS-200 tidak menjelaskan:

- Engine
- Orchestrator
- Memory
- AI Runtime
- Platform
- Developer Platform

---

# Related Documents

- README.md
- 000-overview.md
- 010-constitution.md
- MAS-100-business-model.md
- MAS-300-engine-architecture.md
- MAS-400-orchestrator.md
- capability-catalog.md
- event-catalog.md

---

# Summary

MAS-200 mendefinisikan model eksekusi MMOS melalui tujuh Execution Object:

- Workflow
- Stage
- Task
- Capability
- Tool
- Provider
- Event

Dengan pemisahan ini, Business Model tetap stabil, Workflow tetap deklaratif, Engine tetap independen, dan Provider dapat diganti tanpa mengubah proses bisnis. Hal ini memastikan MMOS tetap modular, provider-agnostic, dan mudah berkembang seiring perubahan teknologi AI.