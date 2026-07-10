# ADR-004 — Engine Separation

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dibangun untuk mendukung berbagai jenis pekerjaan AI dan multimedia, seperti:

- Large Language Model (LLM)
- Image Generation
- Video Generation
- Audio Processing
- Workflow Execution
- Memory Retrieval
- Tool Calling
- Vector Search
- Document Processing
- Data Transformation

Masing-masing domain memiliki karakteristik teknis, kebutuhan resource, lifecycle, dan skalabilitas yang berbeda.

Pada tahap awal desain muncul dua pendekatan:

1. Satu Engine besar yang menangani semua pekerjaan.
2. Banyak Engine independen yang masing-masing memiliki tanggung jawab spesifik.

---

# Problem

Menggabungkan seluruh kemampuan ke dalam satu Engine akan menyebabkan:

- kode semakin kompleks,
- sulit dikembangkan,
- sulit diuji,
- sulit diskalakan,
- sulit mengganti provider,
- deployment menjadi besar,
- kegagalan satu fitur memengaruhi seluruh sistem.

Selain itu, kebutuhan resource antar domain sangat berbeda.

Contoh:

- LLM membutuhkan GPU dan koneksi ke model.
- Memory membutuhkan vector database.
- Workflow membutuhkan state machine.
- Media membutuhkan encoder dan decoder.
- Storage membutuhkan object storage.

Menggabungkannya dalam satu Engine bertentangan dengan prinsip Single Responsibility.

---

# Decision

MMOS menggunakan arsitektur **Engine Separation**.

Setiap Engine bertanggung jawab terhadap satu domain kemampuan (capability domain).

Engine harus independen, memiliki kontrak yang jelas, dan dapat dikembangkan secara terpisah.

---

# Principle

Prinsip utama ADR ini adalah:

> **One Responsibility, One Engine.**

Satu Engine hanya memiliki satu tanggung jawab utama.

---

# Engine Catalog

Engine standar MMOS meliputi:

- AI Engine
- Workflow Engine
- Memory Engine
- Capability Engine
- Media Engine
- Storage Engine
- Event Engine
- Search Engine
- Security Engine
- Integration Engine

Implementasi dapat menambah Engine baru tanpa mengubah Orchestrator.

---

# Responsibilities

## AI Engine

Bertanggung jawab terhadap:

- LLM inference
- prompt execution
- reasoning
- model invocation

Tidak bertanggung jawab terhadap workflow atau memory.

---

## Workflow Engine

Bertanggung jawab terhadap:

- workflow execution
- dependency graph
- branching
- looping
- conditional execution

Tidak menjalankan AI secara langsung.

---

## Memory Engine

Bertanggung jawab terhadap:

- embedding
- retrieval
- indexing
- semantic search
- knowledge lookup

Tidak menjalankan workflow.

---

## Capability Engine

Bertanggung jawab terhadap:

- tool execution
- connector execution
- external API
- plugin execution

Tidak menjalankan AI inference.

---

## Media Engine

Bertanggung jawab terhadap:

- image generation
- video generation
- audio processing
- rendering
- transcoding

Tidak mengelola workflow.

---

## Storage Engine

Bertanggung jawab terhadap:

- object storage
- file persistence
- artifact management
- backup

Tidak memproses data bisnis.

---

## Event Engine

Bertanggung jawab terhadap:

- event publishing
- event routing
- event subscription
- event delivery

Tidak menjalankan business logic.

---

## Search Engine

Bertanggung jawab terhadap:

- indexing
- keyword search
- hybrid search
- filtering
- ranking

Tidak menyimpan ownership object.

---

## Security Engine

Bertanggung jawab terhadap:

- authentication
- authorization
- policy enforcement
- token validation

Tidak menjalankan workflow.

---

## Integration Engine

Bertanggung jawab terhadap:

- webhook
- connector
- third-party integration
- synchronization

Tidak menyimpan business state.

---

# Engine Interaction

Semua komunikasi antar Engine dilakukan melalui kontrak resmi MMOS.

```
Orchestrator

↓

Workflow Engine

↓

AI Engine

↓

Capability Engine

↓

Memory Engine

↓

Storage Engine
```

Engine tidak boleh saling bergantung secara langsung pada implementasi internal Engine lain.

Interaksi dilakukan melalui interface atau service contract.

---

# Dependency Rules

Engine boleh menggunakan layanan Engine lain melalui contract.

Namun:

- tidak boleh mengakses database internal Engine lain,
- tidak boleh memanggil fungsi privat Engine lain,
- tidak boleh bergantung pada implementasi internal.

Setiap Engine adalah black box.

---

# Lifecycle

Setiap Engine memiliki lifecycle independen:

Registered

↓

Available

↓

Healthy

↓

Busy

↓

Degraded

↓

Unavailable

↓

Removed

Orchestrator hanya melihat status Engine, bukan implementasinya.

---

# Scalability

Karena Engine dipisahkan:

- AI Engine dapat menggunakan GPU cluster.
- Memory Engine dapat menggunakan vector database cluster.
- Workflow Engine dapat diskalakan horizontal.
- Media Engine dapat menggunakan node rendering khusus.
- Storage Engine dapat menggunakan object storage terdistribusi.

Setiap Engine dapat diskalakan secara independen sesuai kebutuhan.

---

# Failure Isolation

Jika satu Engine gagal:

```
Media Engine

↓

Failure

↓

Orchestrator

↓

Retry / Alternative Engine
```

Engine lain tetap berjalan normal.

Kegagalan tidak menyebar ke seluruh sistem.

---

# Observability

Setiap Engine wajib menyediakan:

- health check
- metrics
- logs
- tracing
- version information
- capability metadata

Hal ini memungkinkan monitoring dilakukan secara independen.

---

# Architectural Principles

1. Satu Engine memiliki satu tanggung jawab utama.
2. Engine bersifat independen.
3. Engine berkomunikasi melalui contract.
4. Engine tidak berbagi implementasi internal.
5. Engine dapat diganti tanpa mengubah Orchestrator.
6. Engine dapat dikembangkan oleh tim yang berbeda.
7. Engine dapat diskalakan secara independen.
8. Engine harus dapat diobservasi.

---

# Benefits

Dengan Engine Separation:

- modularitas meningkat,
- maintenance lebih mudah,
- deployment lebih fleksibel,
- provider lebih mudah diganti,
- scaling lebih efisien,
- fault isolation lebih baik,
- pengembangan paralel lebih mudah,
- performa sistem meningkat.

---

# Consequences

Seluruh kemampuan baru di MMOS harus dievaluasi:

Apabila kemampuan tersebut merupakan domain baru yang independen, maka harus dibuat sebagai Engine baru.

Engine tidak boleh berkembang menjadi "God Engine" yang menangani terlalu banyak tanggung jawab.

---

# Alternatives Considered

## Monolithic Engine

Ditolak.

Menggabungkan seluruh kemampuan dalam satu Engine menghasilkan coupling tinggi, deployment besar, dan sulit diskalakan.

---

## Shared Database antar Engine

Ditolak.

Engine hanya boleh berbagi data melalui contract atau event.

Database internal merupakan bagian dari implementasi Engine.

---

## Direct Engine-to-Engine Internal Calls

Ditolak.

Ketergantungan langsung terhadap implementasi internal akan mengurangi fleksibilitas dan menyulitkan penggantian Engine.

---

# Impact

ADR ini memengaruhi:

- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-700 AI Runtime
- IMS-400 Execution Specification
- IMS-600 Capability Specification
- Engine Interaction Reference
- JSON Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib memisahkan domain kemampuan ke dalam Engine yang independen.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-002 — Project is Root Aggregate

ADR-003 — Orchestrator Never Works

ADR-005 — Provider Agnostic

---

# Summary

MMOS menerapkan prinsip **Engine Separation**, yaitu setiap Engine memiliki satu tanggung jawab utama dan beroperasi secara independen.

Orchestrator hanya mengoordinasikan Engine melalui kontrak resmi, sementara setiap Engine bebas menentukan implementasi internalnya.

Dengan pendekatan ini, MMOS memperoleh arsitektur yang modular, mudah diskalakan, mudah dipelihara, tahan terhadap kegagalan, serta mampu beradaptasi dengan perubahan teknologi dan provider tanpa mengubah fondasi sistem.