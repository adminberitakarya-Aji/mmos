# ADR-003 — Orchestrator Never Works

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang sebagai platform orchestration yang mengintegrasikan berbagai AI provider, execution engine, workflow engine, memory system, dan capability provider.

Pada tahap awal desain muncul pertanyaan mendasar:

> Apakah Orchestrator boleh menjalankan pekerjaan?

Banyak sistem orchestration modern mulai dengan Orchestrator yang sederhana, namun seiring waktu Orchestrator berkembang menjadi komponen yang:

- memanggil LLM,
- menjalankan workflow,
- mengakses database,
- mengelola memory,
- memproses file,
- menjalankan tool.

Akibatnya Orchestrator berubah menjadi komponen terbesar dalam sistem (God Object).

MMOS menghindari pola tersebut.

---

# Problem

Apabila Orchestrator diperbolehkan melakukan pekerjaan secara langsung, maka akan muncul berbagai masalah:

- business logic tersebar
- coupling meningkat
- sulit diuji
- sulit diganti engine
- sulit melakukan scaling
- sulit melakukan observability
- sulit melakukan failover

Selain itu akan muncul duplikasi logika antara:

- Orchestrator
- Engine
- Runtime

yang menyebabkan arsitektur menjadi tidak konsisten.

---

# Decision

Orchestrator **tidak pernah melakukan pekerjaan (work execution).**

Orchestrator hanya bertugas:

- menerima request,
- melakukan validasi,
- menentukan routing,
- membuat execution plan,
- mengoordinasikan engine,
- memonitor progress,
- mengelola lifecycle execution.

Semua pekerjaan aktual dilakukan oleh Engine.

---

# Principle

Prinsip utama ADR ini adalah:

> **Coordinate, Never Execute.**

Orchestrator adalah coordinator.

Engine adalah executor.

---

# Responsibilities

Orchestrator bertanggung jawab terhadap:

- request routing
- execution planning
- scheduling
- dependency resolution
- state transition
- retry policy
- timeout policy
- cancellation
- monitoring
- event publishing

Orchestrator **tidak** bertanggung jawab terhadap:

- inferensi AI
- pemrosesan media
- eksekusi tool
- akses database bisnis
- manipulasi file
- vector search
- embedding
- rendering
- workflow step execution

---

# Execution Flow

```
Client

↓

API

↓

Orchestrator

↓

Execution Plan

↓

Engine Selection

↓

Engine Execution

↓

Result

↓

Orchestrator

↓

Client
```

Orchestrator hanya mengendalikan alur.

Engine yang menghasilkan pekerjaan.

---

# Engine Responsibilities

Contoh pembagian tanggung jawab:

LLM Engine

- prompt execution
- model invocation

Workflow Engine

- workflow execution
- node evaluation

Memory Engine

- retrieval
- indexing

Media Engine

- image generation
- video generation
- audio generation

Capability Engine

- tool invocation

Storage Engine

- persistence

Setiap pekerjaan dilakukan oleh engine yang sesuai.

---

# Allowed Operations

Orchestrator boleh:

- memilih engine
- memulai execution
- menghentikan execution
- melanjutkan execution
- membuat execution graph
- mengumpulkan hasil
- menerbitkan event

---

# Forbidden Operations

Orchestrator tidak boleh:

- menjalankan prompt LLM
- membuat embedding
- membaca vector database
- mengolah gambar
- mengolah video
- mengolah audio
- memproses PDF
- menjalankan Python
- menjalankan Tool
- menjalankan Capability
- menjalankan Workflow Node

Semua operasi tersebut harus didelegasikan ke Engine.

---

# State Management

Orchestrator hanya menyimpan:

- execution state
- workflow state
- scheduling state
- orchestration metadata

Business state tetap dimiliki oleh object domain yang relevan.

---

# Failure Handling

Jika Engine gagal:

```
Engine

↓

Failure Event

↓

Orchestrator

↓

Retry Policy

↓

Engine
```

Atau

```
Engine

↓

Failure Event

↓

Orchestrator

↓

Alternative Engine

↓

Execution
```

Orchestrator tidak mencoba menyelesaikan pekerjaan yang gagal.

Orchestrator hanya mengatur strategi penanganannya.

---

# Scalability

Karena Orchestrator tidak menjalankan pekerjaan:

- dapat dibuat stateless,
- mudah di-scale horizontal,
- tidak membutuhkan GPU,
- konsumsi memori rendah,
- throughput tinggi.

Engine dapat diskalakan secara independen sesuai kebutuhan.

---

# Architectural Principles

1. Orchestrator hanya mengoordinasikan.
2. Engine selalu menjalankan pekerjaan.
3. Tidak ada business logic di Orchestrator.
4. Tidak ada AI inference di Orchestrator.
5. Tidak ada media processing di Orchestrator.
6. Semua pekerjaan dilakukan melalui contract Engine.
7. Orchestrator bersifat stateless.
8. Engine dapat diganti tanpa mengubah Orchestrator.

---

# Benefits

Dengan prinsip ini:

- arsitektur lebih modular
- tanggung jawab jelas
- lebih mudah diuji
- lebih mudah dikembangkan
- lebih mudah diskalakan
- lebih mudah diobservasi
- lebih mudah mengganti provider
- lebih tahan terhadap perubahan teknologi

---

# Consequences

Seluruh fitur baru harus mengikuti aturan berikut:

Jika sebuah komponen benar-benar "mengerjakan sesuatu", maka komponen tersebut **bukan** bagian dari Orchestrator.

Komponen tersebut harus menjadi:

- Engine
- Runtime
- Capability
- Service

sesuai domain tanggung jawabnya.

---

# Alternatives Considered

## Smart Orchestrator

Ditolak.

Menjadikan Orchestrator sebagai pusat seluruh logika akan menghasilkan God Object yang sulit dipelihara.

---

## Workflow Engine di dalam Orchestrator

Ditolak.

Workflow Engine harus menjadi komponen independen agar dapat berkembang dan diskalakan secara terpisah.

---

## Direct Tool Execution oleh Orchestrator

Ditolak.

Tool execution merupakan tanggung jawab Capability Engine.

---

## AI Execution oleh Orchestrator

Ditolak.

Inference AI adalah tanggung jawab AI Runtime/LLM Engine.

---

# Impact

ADR ini memengaruhi:

- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-700 AI Runtime
- IMS-300 Workflow Specification
- IMS-400 Execution Specification
- IMS-600 Capability Specification
- JSON Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib menjaga pemisahan tegas antara koordinasi dan eksekusi.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-002 — Project is Root Aggregate

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

---

# Summary

Orchestrator adalah **pengatur lalu lintas**, bukan pelaksana pekerjaan.

Ia menerima permintaan, menyusun rencana, memilih Engine, memantau pelaksanaan, dan mengelola lifecycle execution.

Seluruh pekerjaan nyata—AI inference, workflow execution, media processing, memory retrieval, capability invocation, maupun storage—selalu dilakukan oleh Engine yang sesuai.

Prinsip **"Coordinate, Never Execute"** memastikan MMOS tetap modular, mudah diskalakan, mudah diuji, dan mampu beradaptasi terhadap perubahan teknologi tanpa mengubah inti sistem.