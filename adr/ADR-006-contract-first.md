# ADR-006 — Contract First

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS merupakan platform yang terdiri dari banyak komponen independen:

- Orchestrator
- Engine
- Runtime
- Capability
- Memory
- Storage
- Event Bus
- External Provider

Setiap komponen berkembang secara independen dan dapat memiliki implementasi yang berbeda.

Tanpa kontrak yang jelas, komunikasi antar komponen akan bergantung pada implementasi internal masing-masing sehingga menghasilkan coupling yang tinggi.

MMOS membutuhkan fondasi komunikasi yang stabil agar seluruh komponen dapat berkembang secara independen.

---

# Problem

Apabila implementasi dibuat terlebih dahulu sebelum mendefinisikan kontrak, maka akan muncul berbagai masalah:

- interface berubah-ubah
- integrasi sulit dilakukan
- implementasi saling bergantung
- testing menjadi rumit
- dokumentasi selalu tertinggal
- provider sulit diganti
- backward compatibility sulit dijaga

Selain itu, setiap Engine berpotensi memiliki implementasi berbeda sehingga diperlukan bahasa komunikasi yang seragam.

---

# Decision

MMOS mengadopsi prinsip **Contract First**.

Seluruh komunikasi antar komponen harus didasarkan pada contract yang didefinisikan terlebih dahulu.

Implementasi harus mengikuti contract, bukan sebaliknya.

---

# Principle

Prinsip utama ADR ini adalah:

> **Define the Contract Before the Implementation.**

Contract adalah sumber kebenaran (source of truth) untuk komunikasi antar komponen.

---

# Contract Hierarchy

MMOS menggunakan beberapa jenis contract.

```
Business Contract

↓

Object Contract

↓

Execution Contract

↓

Capability Contract

↓

Provider Adapter
```

Implementasi hanya berada pada lapisan paling bawah.

---

# Contract Types

## Object Contract

Mendefinisikan struktur object domain.

Contoh:

- Project
- Composition
- Workflow
- Task
- Agent
- Execution
- Artifact
- Memory
- Event

---

## Execution Contract

Mendefinisikan bagaimana sebuah execution dijalankan.

Contoh:

- StartExecution
- PauseExecution
- ResumeExecution
- CancelExecution
- CompleteExecution

---

## Capability Contract

Mendefinisikan kemampuan sistem tanpa bergantung pada implementasi.

Contoh:

- GenerateText
- GenerateImage
- GenerateVideo
- TranslateText
- SummarizeDocument
- SearchKnowledge

Capability tidak mengetahui provider.

---

## Runtime Contract

Mendefinisikan komunikasi antara Orchestrator dan Runtime.

Contoh:

- ExecuteCapability
- LoadModel
- AllocateRuntime
- ReleaseRuntime

---

## Event Contract

Mendefinisikan format event yang dipublikasikan.

Contoh:

- CompositionCreated
- WorkflowStarted
- TaskCompleted
- ExecutionFailed
- ArtifactGenerated

---

# Communication Model

Seluruh komunikasi menggunakan contract.

```
Orchestrator

↓

Execution Contract

↓

Workflow Engine

↓

Capability Contract

↓

AI Runtime

↓

Provider Adapter
```

Tidak ada komunikasi berdasarkan implementasi internal.

---

# Contract Ownership

Setiap contract dimiliki oleh domain yang bersangkutan.

Contoh:

Workflow Engine memiliki Workflow Contract.

Memory Engine memiliki Memory Contract.

Capability Engine memiliki Capability Contract.

Provider Adapter mengimplementasikan Capability Contract.

---

# Versioning

Seluruh contract wajib memiliki versi.

Contoh:

```
v1

v2

v3
```

Perubahan besar (breaking changes) harus menghasilkan versi baru.

Perubahan kecil yang kompatibel dapat dilakukan dalam versi yang sama.

---

# Backward Compatibility

MMOS mengutamakan kompatibilitas ke belakang.

Contract lama tetap didukung selama masa transisi.

Implementasi baru harus mampu berinteraksi dengan contract lama sesuai kebijakan kompatibilitas.

---

# JSON Schema

Seluruh Object Contract harus memiliki JSON Schema resmi.

Contoh:

```
composition.schema.json

workflow.schema.json

task.schema.json

execution.schema.json

memory.schema.json

event.schema.json
```

JSON Schema merupakan representasi formal dari contract.

---

# Validation

Semua request dan response harus divalidasi terhadap contract.

Validasi dilakukan sebelum:

- execution
- persistence
- provider invocation
- event publishing

Hal ini memastikan integritas data dan konsistensi sistem.

---

# Documentation

Setiap contract wajib memiliki dokumentasi yang menjelaskan:

- tujuan
- struktur data
- field wajib
- field opsional
- aturan validasi
- contoh penggunaan
- versi

Dokumentasi merupakan bagian dari contract.

---

# Testing

Contract menjadi dasar untuk:

- unit testing
- integration testing
- compatibility testing
- provider testing
- regression testing

Implementasi dianggap benar apabila memenuhi contract.

---

# Architectural Principles

1. Contract didefinisikan sebelum implementasi.
2. Implementasi wajib mematuhi contract.
3. Contract bersifat stabil.
4. Contract memiliki versi.
5. Contract menjadi dasar dokumentasi.
6. Contract menjadi dasar validasi.
7. Contract menjadi dasar pengujian.
8. Perubahan contract harus dikelola melalui versioning.

---

# Benefits

Dengan Contract First:

- komunikasi antar komponen menjadi konsisten,
- implementasi dapat berkembang secara independen,
- integrasi lebih mudah,
- dokumentasi selalu sinkron,
- provider mudah diganti,
- testing lebih sederhana,
- backward compatibility lebih terjaga.

---

# Consequences

Seluruh fitur baru harus mengikuti urutan berikut:

```
Architecture Decision

↓

Contract

↓

JSON Schema

↓

Validator

↓

Implementation

↓

Testing
```

Implementasi tidak boleh mendefinisikan struktur data sendiri di luar contract resmi.

---

# Alternatives Considered

## Implementation First

Ditolak.

Contract akan mengikuti implementasi sehingga sulit dipelihara dan rawan perubahan.

---

## Provider-Specific Contract

Ditolak.

Contract harus bersifat independen terhadap provider agar tidak terjadi vendor lock-in.

---

## Dynamic Contract

Ditolak.

Contract harus eksplisit, terdokumentasi, dan tervalidasi agar seluruh komponen memiliki pemahaman yang sama.

---

# Impact

ADR ini memengaruhi:

- Object Model
- Object Catalog
- Capability Catalog
- Event Catalog
- IMS Specifications
- JSON Schema
- Validator
- Generator
- CLI
- Provider Adapter

Seluruh implementasi MMOS wajib dibangun berdasarkan contract resmi yang telah didefinisikan.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-002 — Project is Root Aggregate

ADR-003 — Orchestrator Never Works

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

ADR-007 — Workflow is Declarative

---

# Summary

MMOS menerapkan prinsip **Contract First**, yaitu seluruh komunikasi antar komponen didasarkan pada contract yang didefinisikan sebelum implementasi.

Contract menjadi sumber kebenaran (source of truth) bagi object model, execution, capability, event, dan integrasi antar Engine. JSON Schema, validator, generator, dan implementasi seluruh platform harus diturunkan dari contract tersebut.

Dengan pendekatan ini, MMOS memperoleh arsitektur yang konsisten, mudah diuji, mudah dikembangkan, dan tetap kompatibel seiring evolusi sistem.