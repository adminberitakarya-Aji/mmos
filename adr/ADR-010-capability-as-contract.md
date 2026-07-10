# ADR-010 — Capability as Contract

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS mengintegrasikan berbagai kemampuan (capabilities) dari banyak Engine dan Provider, seperti:

- Text Generation
- Image Generation
- Video Generation
- Audio Generation
- Translation
- OCR
- Embedding
- Search
- Tool Calling
- Database Query
- Email
- Notification
- External API

Seluruh kemampuan tersebut memiliki implementasi yang berbeda-beda.

Tanpa abstraksi yang baik, Workflow dan Engine akan bergantung langsung pada implementasi provider.

MMOS membutuhkan sebuah abstraksi yang stabil agar seluruh kemampuan dapat digunakan secara konsisten.

---

# Problem

Apabila Workflow memanggil implementasi secara langsung, maka:

- Workflow bergantung pada provider.
- Workflow sulit dipindahkan.
- Workflow sulit diuji.
- Provider sulit diganti.
- Multi-provider tidak dapat dilakukan.
- Runtime menjadi kompleks.
- Engine saling bergantung.

Sebagai contoh:

```
Workflow

↓

Call OpenAI GPT

↓

Response
```

Ketika provider berubah menjadi Anthropic atau DeepSeek, Workflow juga harus berubah.

Hal ini bertentangan dengan ADR-005 (Provider Agnostic).

---

# Decision

MMOS menetapkan bahwa seluruh kemampuan sistem direpresentasikan sebagai **Capability Contract**.

Workflow hanya mengenal Capability.

Capability tidak mengetahui provider.

Provider hanya mengimplementasikan Capability.

---

# Principle

Prinsip utama ADR ini adalah:

> **Capabilities define what can be done, not who does it.**

Capability mendefinisikan fungsi.

Provider menyediakan implementasi.

---

# Capability Model

```
Workflow

↓

Capability

↓

Runtime

↓

Engine

↓

Provider Adapter

↓

Provider
```

Workflow tidak pernah memanggil provider.

Workflow hanya meminta Capability.

---

# Capability Definition

Capability mendefinisikan:

- identifier
- name
- category
- version
- input schema
- output schema
- constraints
- supported execution modes

Capability tidak mendefinisikan implementasi.

---

# Example

Contoh Capability:

```
GenerateText
```

Input

```
Prompt

Language

Max Tokens

Temperature
```

Output

```
Generated Text
```

Capability tidak menyebut:

- OpenAI
- Claude
- Gemini
- DeepSeek

Semuanya hanyalah implementasi.

---

# Capability Categories

Capability dapat dikelompokkan menjadi:

AI

- GenerateText
- Summarize
- Translate
- Classify
- Reason

Media

- GenerateImage
- GenerateVideo
- EditImage
- TextToSpeech

Knowledge

- SearchKnowledge
- RetrieveContext
- EmbedText

Automation

- ExecuteTool
- SendEmail
- HTTPRequest

Data

- QueryDatabase
- ReadFile
- WriteFile

Communication

- Notification
- Messaging
- Webhook

Kategori tidak memengaruhi kontrak.

---

# Capability Contract

Minimal Capability memiliki:

```
Capability ID

Version

Input Schema

Output Schema

Execution Mode

Timeout

Retry Policy
```

Implementasi provider harus memenuhi kontrak tersebut.

---

# Input and Output

Input dan Output didefinisikan menggunakan schema.

Contoh:

```
Input

title

description

language
```

Output

```
summary

confidence

metadata
```

Workflow hanya memahami schema tersebut.

---

# Runtime Responsibilities

Runtime bertanggung jawab terhadap:

- menemukan provider
- memilih engine
- melakukan routing
- retry
- failover
- monitoring

Runtime tidak mengubah Capability.

---

# Provider Responsibilities

Provider Adapter bertanggung jawab terhadap:

- request mapping
- response mapping
- authentication
- rate limiting
- error translation

Provider tidak mengubah definisi Capability.

---

# Versioning

Capability memiliki version.

Contoh:

```
GenerateText v1

GenerateText v2
```

Workflow dapat memilih versi tertentu apabila diperlukan.

Perubahan breaking harus menghasilkan versi baru.

---

# Discoverability

Seluruh Capability harus dapat ditemukan melalui Capability Catalog.

Capability Catalog memuat:

- identifier
- description
- version
- schema
- supported providers
- execution requirements

Hal ini memungkinkan Runtime melakukan discovery secara dinamis.

---

# Validation

Sebelum dieksekusi, Runtime harus memvalidasi:

- input schema
- output schema
- required field
- constraints
- capability version

Capability yang tidak valid tidak boleh dijalankan.

---

# Execution Independence

Capability tidak mengetahui:

- Workflow
- Composition
- Project
- Provider
- Deployment

Capability hanya mengetahui kontraknya sendiri.

---

# Architectural Principles

1. Workflow hanya mengenal Capability.
2. Capability tidak mengenal Provider.
3. Provider mengimplementasikan Capability.
4. Runtime memilih Provider.
5. Capability memiliki schema.
6. Capability memiliki version.
7. Capability dapat ditemukan melalui Capability Catalog.
8. Capability bersifat reusable.

---

# Benefits

Dengan Capability as Contract:

- Workflow menjadi provider-independent.
- Multi-provider dapat dijalankan.
- Capability mudah digunakan kembali.
- Testing lebih sederhana.
- Runtime lebih fleksibel.
- Provider mudah diganti.
- Capability dapat berkembang tanpa mengubah Workflow.

---

# Consequences

Seluruh kemampuan baru harus dibuat sebagai Capability terlebih dahulu.

Urutan implementasi:

```
Capability Definition

↓

Capability Schema

↓

Capability Contract

↓

Runtime Support

↓

Provider Adapter

↓

Provider Implementation
```

Implementasi provider tidak boleh menjadi acuan utama.

Capability adalah sumber kebenaran.

---

# Alternatives Considered

## Provider sebagai Capability

Ditolak.

Provider adalah implementasi, bukan kontrak.

---

## Workflow Memanggil Engine Langsung

Ditolak.

Workflow akan bergantung pada implementasi Engine.

---

## Capability Tanpa Schema

Ditolak.

Tanpa schema, validasi dan interoperabilitas menjadi sulit.

---

# Impact

ADR ini memengaruhi:

- Capability Catalog
- MAS-300 Engine Architecture
- MAS-700 AI Runtime
- IMS-600 Capability Specification
- Capability Schema
- Runtime Schema
- Provider Adapter
- Validator
- Generator
- CLI

Seluruh kemampuan dalam MMOS wajib direpresentasikan sebagai Capability Contract sebelum diimplementasikan oleh Engine atau Provider.

---

# Related ADR

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

ADR-006 — Contract First

ADR-007 — Workflow is Declarative

ADR-009 — Runtime is Stateless

ADR-011 — Memory as Context Provider

---

# Summary

Capability merupakan **kontrak standar** yang mendefinisikan kemampuan yang dapat digunakan oleh MMOS tanpa bergantung pada implementasi tertentu.

Workflow hanya meminta Capability, Runtime memilih Engine dan Provider yang sesuai, sedangkan Provider Adapter menerjemahkan kontrak tersebut ke API atau layanan eksternal.

Pendekatan ini memastikan MMOS tetap modular, provider-agnostic, mudah diperluas, serta mampu mengadopsi teknologi baru tanpa mengubah Workflow maupun model domain.