# ADR-005 — Provider Agnostic

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang sebagai platform orkestrasi AI dan multimedia yang harus mampu bekerja dengan berbagai teknologi, baik saat ini maupun di masa depan.

Ekosistem AI berkembang sangat cepat.

Provider, model, dan layanan terus berubah.

Contoh provider yang umum digunakan:

- OpenAI
- Anthropic
- Google
- xAI
- DeepSeek
- Alibaba Qwen
- Mistral
- Cohere
- Stability AI
- Runway
- ElevenLabs
- Azure AI
- AWS AI
- Google Cloud AI

Mengikat arsitektur MMOS pada satu provider akan menyebabkan vendor lock-in dan mengurangi fleksibilitas platform.

---

# Problem

Apabila business logic bergantung langsung pada provider tertentu, maka:

- pergantian provider menjadi mahal,
- perubahan API berdampak luas,
- testing menjadi sulit,
- multi-provider tidak dapat dijalankan,
- optimasi biaya menjadi terbatas,
- availability sistem bergantung pada satu vendor.

Selain itu, setiap provider memiliki:

- format request berbeda,
- format response berbeda,
- model berbeda,
- authentication berbeda,
- rate limit berbeda,
- pricing berbeda,
- lifecycle API berbeda.

Perbedaan tersebut tidak boleh memengaruhi domain MMOS.

---

# Decision

MMOS mengadopsi prinsip **Provider Agnostic**.

Seluruh domain model, workflow, execution, dan object model tidak boleh mengetahui provider yang digunakan.

Provider hanya merupakan implementasi di balik kontrak (contract).

---

# Principle

Prinsip utama ADR ini adalah:

> **Depend on Contracts, Never on Providers.**

Business logic bergantung pada capability, bukan vendor.

---

# Architecture

```
Composition

↓

Workflow

↓

Execution

↓

Capability Contract

↓

Runtime

↓

Provider Adapter

↓

External Provider
```

Workflow tidak pernah memanggil provider secara langsung.

Workflow hanya meminta capability.

---

# Provider Layer

MMOS mengenal tiga lapisan:

## Domain Layer

Berisi:

- Composition
- Workflow
- Execution
- Memory
- Event

Layer ini tidak mengetahui provider.

---

## Runtime Layer

Berisi:

- provider selection
- routing
- retry
- failover
- load balancing
- cost optimization

Runtime mengetahui provider, tetapi domain tidak.

---

## Provider Adapter

Setiap provider diimplementasikan sebagai adapter.

Contoh:

- OpenAI Adapter
- Anthropic Adapter
- Gemini Adapter
- DeepSeek Adapter
- Qwen Adapter
- Claude Adapter
- Stability Adapter
- Runway Adapter

Adapter menerjemahkan contract MMOS menjadi API provider.

---

# Capability-Based Invocation

Workflow tidak meminta:

```
Call GPT-5
```

Workflow meminta:

```
GenerateText
```

atau

```
SummarizeDocument
```

atau

```
TranslateText
```

Runtime menentukan provider terbaik untuk memenuhi capability tersebut.

---

# Provider Selection

Runtime dapat memilih provider berdasarkan:

- capability
- availability
- latency
- cost
- quota
- policy
- compliance
- geographic location
- project configuration

Pemilihan provider merupakan keputusan runtime, bukan workflow.

---

# Failover

Jika provider utama gagal:

```
Workflow

↓

Runtime

↓

OpenAI

↓

Failure

↓

Runtime

↓

Anthropic

↓

Success
```

Workflow tetap berjalan tanpa perubahan.

---

# Multi-Provider

Satu workflow dapat menggunakan banyak provider.

Contoh:

```
Image Generation

↓

Stability AI

↓

Text Improvement

↓

OpenAI

↓

Translation

↓

DeepSeek

↓

Voice Synthesis

↓

ElevenLabs
```

Workflow tetap menggunakan capability, bukan nama provider.

---

# Configuration

Provider dikonfigurasi pada level Project atau Environment.

Contoh konfigurasi:

- API Key
- endpoint
- timeout
- retry
- quota
- preferred provider
- fallback provider

Konfigurasi tersebut berada di luar domain model.

---

# Adapter Responsibilities

Provider Adapter bertanggung jawab terhadap:

- authentication
- request mapping
- response mapping
- error translation
- rate limiting
- retry strategy
- provider-specific options

Adapter tidak mengandung business logic MMOS.

---

# Domain Independence

Object berikut tidak boleh memiliki informasi provider:

- Composition
- Workflow
- Task
- Execution
- Artifact
- Event
- Memory

Provider hanya muncul pada metadata runtime apabila diperlukan untuk observability dan audit.

---

# Observability

Runtime dapat mencatat informasi seperti:

- provider name
- model name
- execution duration
- token usage
- cost
- request identifier
- retry count

Informasi tersebut merupakan execution metadata dan bukan bagian dari domain model.

---

# Architectural Principles

1. Domain tidak mengenal provider.
2. Workflow hanya meminta capability.
3. Runtime memilih provider.
4. Provider diakses melalui adapter.
5. Provider dapat diganti tanpa mengubah workflow.
6. Multi-provider didukung secara native.
7. Failover dilakukan pada runtime.
8. Business logic bebas dari vendor lock-in.

---

# Benefits

Dengan Provider Agnostic:

- vendor lock-in dihindari,
- provider mudah diganti,
- workflow tetap stabil,
- biaya dapat dioptimalkan,
- availability meningkat,
- multi-cloud lebih mudah,
- testing lebih sederhana,
- teknologi baru dapat diadopsi tanpa perubahan domain.

---

# Consequences

Seluruh integrasi baru harus mengikuti pola:

```
Capability

↓

Runtime

↓

Provider Adapter

↓

Provider API
```

Tidak diperbolehkan ada pemanggilan API provider secara langsung dari:

- Workflow
- Composition
- Agent
- Orchestrator
- Domain Object

---

# Alternatives Considered

## Direct Provider Integration

Ditolak.

Domain akan bergantung pada implementasi vendor tertentu dan sulit dipelihara.

---

## Provider-Specific Workflow

Ditolak.

Workflow menjadi tidak portabel dan harus diubah setiap kali provider berubah.

---

## Hardcoded Provider Selection

Ditolak.

Pemilihan provider merupakan tanggung jawab Runtime agar dapat mempertimbangkan kondisi aktual seperti biaya, performa, dan ketersediaan layanan.

---

# Impact

ADR ini memengaruhi:

- MAS-700 AI Runtime
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- IMS-400 Execution Specification
- IMS-600 Capability Specification
- Runtime Provider Adapter
- JSON Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib mengakses layanan eksternal melalui contract dan provider adapter.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-002 — Project is Root Aggregate

ADR-003 — Orchestrator Never Works

ADR-004 — Engine Separation

ADR-006 — Contract First

---

# Summary

MMOS menerapkan prinsip **Provider Agnostic**, yaitu seluruh domain hanya bergantung pada **capability contract**, bukan pada implementasi vendor tertentu.

Runtime bertanggung jawab memilih provider, mengelola adapter, melakukan failover, serta mengoptimalkan biaya dan performa.

Dengan pendekatan ini, workflow dan object model tetap stabil meskipun provider AI, multimedia, atau layanan eksternal berubah, sehingga MMOS tetap fleksibel, portabel, dan bebas dari vendor lock-in.