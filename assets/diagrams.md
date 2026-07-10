# MMOS Diagram Standards

**Version:** MMOS v1.0  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan standar diagram yang digunakan di seluruh proyek MMOS.

Tujuannya adalah memastikan seluruh diagram memiliki gaya, terminologi, dan representasi arsitektur yang konsisten sehingga mudah dipahami oleh developer, architect, maupun stakeholder.

Diagram merupakan dokumentasi arsitektur dan **bukan** implementasi sistem.

---

# Objectives

Diagram digunakan untuk:

- Menjelaskan arsitektur MMOS.
- Memvisualisasikan hubungan antar object.
- Mendokumentasikan alur workflow.
- Menjelaskan interaksi antar engine.
- Mendukung ADR, MAS, IMS, dan dokumentasi lainnya.

---

# Design Principles

## Architecture First

Diagram menggambarkan arsitektur, bukan implementasi.

---

## Domain Driven

Diagram menggunakan object domain MMOS.

Contoh:

- Project
- Composition
- Workflow
- Task
- Agent
- Capability
- Engine
- Runtime
- Memory
- Artifact
- Event

---

## Provider Agnostic

Diagram tidak menampilkan provider tertentu.

Contoh yang **tidak** boleh ditampilkan:

- OpenAI
- Claude
- Gemini
- Ollama
- Docker
- Kubernetes
- PostgreSQL

Diagram hanya menunjukkan konsep arsitektur.

---

## Simple

Diagram harus mudah dibaca.

Hindari hubungan yang terlalu kompleks dalam satu gambar.

---

## Layered

Gunakan layer yang jelas.

Contoh:

```
User

↓

Composition

↓

Workflow

↓

Orchestrator

↓

Engine

↓

Capability

↓

Runtime

↓

Provider
```

---

# Standard Diagram Types

## 1. Context Diagram

Menjelaskan posisi MMOS di dalam sistem yang lebih besar.

Contoh:

```
User

↓

MMOS

↓

External Systems
```

---

## 2. Container Diagram

Menunjukkan komponen besar dalam MMOS.

Contoh:

```
Project

Composition

Workflow

Orchestrator

Engines

Memory

Storage
```

---

## 3. Component Diagram

Menjelaskan struktur internal suatu container.

Contoh:

```
Workflow Engine

Task Scheduler

Execution Queue

State Manager
```

---

## 4. Object Relationship Diagram

Menunjukkan relasi antar object domain.

Contoh:

```
Project

└── Composition

    ├── Workflow

    ├── Memory

    ├── Artifact

    └── Event
```

---

## 5. Workflow Diagram

Menggambarkan urutan Task.

Contoh:

```
Research

↓

Writing

↓

Review

↓

Publish
```

---

## 6. Sequence Diagram

Menjelaskan interaksi antar komponen berdasarkan waktu.

Contoh:

```
User

↓

Composition

↓

Orchestrator

↓

Workflow Engine

↓

AI Engine
```

---

## 7. State Diagram

Menjelaskan perubahan state object.

Contoh:

```
Created

↓

Queued

↓

Running

↓

Completed

↓

Archived
```

---

## 8. Deployment Diagram

Menjelaskan deployment MMOS secara konseptual.

Contoh:

```
Client

↓

API

↓

Orchestrator

↓

Engine Cluster

↓

Storage
```

---

# Preferred Formats

Diagram sebaiknya dibuat dalam format berikut.

## Source

- Draw.io
- Mermaid
- PlantUML

---

## Export

- SVG (utama)
- PDF
- PNG

SVG menjadi format yang direkomendasikan karena bersifat scalable dan mudah digunakan pada dokumentasi.

---

# Naming Convention

Gunakan format:

```
kebab-case
```

Contoh:

```
system-context.svg

container-diagram.svg

workflow-execution.svg

runtime-overview.svg

memory-state.svg

event-flow.svg
```

---

# Visual Guidelines

## Direction

Diagram menggunakan orientasi:

```
Top → Bottom
```

atau

```
Left → Right
```

Jangan mencampurkan keduanya dalam satu diagram.

---

## Shapes

Gunakan bentuk secara konsisten.

| Object | Shape |
|---------|-------|
| Project | Folder |
| Composition | Rounded Rectangle |
| Workflow | Rectangle |
| Task | Rectangle |
| Agent | Hexagon |
| Engine | Rectangle |
| Capability | Capsule |
| Memory | Cylinder |
| Artifact | Document |
| Event | Circle |

---

## Connectors

Gunakan:

- Solid Line → Relationship
- Arrow → Direction
- Dashed Line → Dependency

---

## Labels

Seluruh label menggunakan istilah resmi MMOS.

Contoh:

- Composition
- Workflow
- Task
- Agent
- Capability
- Engine
- Runtime
- Memory
- Artifact
- Event

Hindari singkatan yang tidak didefinisikan dalam Glossary.

---

# Diagram Scope

Setiap diagram sebaiknya hanya memiliki satu fokus utama.

Contoh:

- Workflow Diagram hanya menjelaskan workflow.
- Sequence Diagram hanya menjelaskan interaksi.
- Deployment Diagram hanya menjelaskan deployment.

Jangan menggabungkan beberapa jenis diagram menjadi satu.

---

# Version Compatibility

Seluruh diagram harus konsisten dengan:

- ADR
- MAS
- IMS
- Object Model
- Capability Catalog
- Event Catalog
- Engine Interaction

Perubahan pada model domain harus diikuti dengan pembaruan diagram terkait.

---

# Review Checklist

Sebelum diagram dipublikasikan, pastikan:

- Menggunakan terminologi resmi MMOS.
- Konsisten dengan arsitektur yang berlaku.
- Tidak bergantung pada provider tertentu.
- Mudah dibaca tanpa penjelasan tambahan.
- Tidak mengandung detail implementasi.
- Menggunakan format dan penamaan yang sesuai.
- Memiliki fokus yang jelas.

---

# Related Documents

- `docs/architecture/`
- `docs/catalog/`
- `docs/reference/`
- `docs/examples/`
- `assets/images.md`
- `assets/icons.md`