# ADR-001 — Composition is the Heart

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dibangun sebagai platform orchestration untuk AI, Workflow, Automation, dan Multimedia Production.

Seluruh aktivitas sistem—baik yang sederhana maupun kompleks—harus memiliki representasi yang konsisten.

Pada tahap awal desain muncul beberapa kandidat sebagai pusat sistem:

- Project
- Workflow
- Agent
- Execution
- Session
- Composition

Masing-masing memiliki kelebihan, namun hanya satu yang dapat menjadi pusat (heart) dari seluruh domain model.

---

# Problem

Apabila Workflow dijadikan pusat:

- Workflow hanya menjelaskan proses.
- Tidak dapat menyimpan asset.
- Tidak memiliki lifecycle bisnis.

Apabila Agent dijadikan pusat:

- Agent hanyalah worker.
- Tidak semua pekerjaan membutuhkan agent.

Apabila Execution dijadikan pusat:

- Execution bersifat sementara (runtime).
- Tidak dapat menjadi representasi bisnis.

Apabila Project dijadikan pusat:

- Project hanya wadah organisasi.
- Tidak menjelaskan apa yang sedang dibuat.

MMOS membutuhkan satu object yang:

- mewakili tujuan bisnis,
- memiliki lifecycle,
- dapat memiliki workflow,
- dapat memiliki artifact,
- dapat memiliki execution,
- dapat memiliki memory,
- dapat dimiliki project.

---

# Decision

Composition ditetapkan sebagai object utama (Heart of MMOS).

Seluruh aktivitas dalam MMOS selalu terjadi di dalam sebuah Composition.

Tidak ada Workflow tanpa Composition.

Tidak ada Execution tanpa Composition.

Tidak ada Artifact tanpa Composition.

Tidak ada Context tanpa Composition.

Composition menjadi boundary utama seluruh domain.

---

# Why Composition

Composition merepresentasikan hasil yang ingin dibuat.

Contoh:

- Artikel
- Video
- Podcast
- Banner
- Kampanye
- Presentasi
- Website
- Dokumen
- Social Media Post

Semuanya adalah Composition.

Workflow hanyalah cara membuatnya.

Execution hanyalah proses menjalankannya.

Agent hanyalah pelaksana.

Engine hanyalah mesin.

---

# Responsibilities

Composition bertanggung jawab terhadap:

- metadata
- objective
- workflow
- artifacts
- memory
- executions
- status
- ownership
- permissions
- lifecycle

Composition TIDAK bertanggung jawab menjalankan task.

Execution yang menjalankan task.

---

# Ownership

Composition memiliki:

- Workflow
- Artifact
- Memory
- Execution History
- Event History
- Context
- Variables

Composition dapat memiliki banyak Workflow.

Composition dapat memiliki banyak Execution.

Composition dapat menghasilkan banyak Artifact.

---

# Lifecycle

Lifecycle Composition:

Draft

↓

Designed

↓

Ready

↓

Running

↓

Paused

↓

Completed

↓

Archived

Composition tetap ada walaupun seluruh Execution telah selesai.

---

# Relationship

Project

└── Composition

├── Workflow

├── Memory

├── Artifact

├── Execution

├── Event

└── Context

Execution tidak pernah menjadi parent Composition.

Workflow tidak pernah menjadi parent Composition.

---

# Architectural Principles

1. Semua pekerjaan dimulai dari Composition.

2. Workflow selalu milik Composition.

3. Execution selalu milik Composition.

4. Artifact selalu milik Composition.

5. Memory selalu terkait Composition.

6. Event selalu dapat ditelusuri ke Composition.

---

# Benefits

Dengan Composition sebagai pusat:

- object model menjadi sederhana
- ownership menjadi jelas
- lifecycle menjadi konsisten
- permission lebih mudah
- audit lebih mudah
- event sourcing lebih mudah
- workflow reusable
- execution reusable
- storage lebih sederhana

---

# Consequences

Seluruh object harus memiliki Composition ID.

Contoh:

Workflow
```

compositionId

```

Execution
```

compositionId

```

Artifact
```

compositionId

```

Memory
```

compositionId

```

Event
```

compositionId

```

Hal ini memastikan seluruh aktivitas dapat ditelusuri kembali ke Composition.

---

# Alternatives Considered

## Workflow sebagai pusat

Ditolak.

Workflow hanyalah definisi proses.

---

## Execution sebagai pusat

Ditolak.

Execution bersifat runtime dan sementara.

---

## Agent sebagai pusat

Ditolak.

Agent hanyalah pelaksana.

---

## Project sebagai pusat

Ditolak.

Project hanya container organisasi.

---

# Impact

ADR ini memengaruhi:

- Object Model
- Object Catalog
- Workflow Specification
- Execution Specification
- Memory Specification
- Event Specification
- JSON Schema
- Validator
- Generator
- CLI

Semua implementasi MMOS wajib menganggap Composition sebagai root object operasional.

---

# Related ADR

ADR-002 — Project is Root Aggregate

ADR-003 — Orchestrator Never Works

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

---

# Summary

Composition adalah jantung MMOS.

Semua aktivitas sistem dimulai, dijalankan, dilacak, diaudit, dan dihasilkan dalam konteks sebuah Composition.

Workflow mendefinisikan cara bekerja.

Execution menjalankan pekerjaan.

Agent mengerjakan tugas.

Engine menyediakan kemampuan.

Composition menyatukan semuanya menjadi satu kesatuan bisnis yang utuh.