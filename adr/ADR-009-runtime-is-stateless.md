# ADR-009 — Runtime is Stateless

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang sebagai platform yang mampu menjalankan ribuan hingga jutaan Execution secara paralel pada berbagai lingkungan deployment, mulai dari single node hingga multi-region cluster.

Runtime bertanggung jawab menjalankan Execution berdasarkan Workflow dan Capability yang telah ditentukan.

Agar Runtime dapat diskalakan secara horizontal, dipulihkan ketika terjadi kegagalan, dan dipindahkan antar node tanpa kehilangan informasi, diperlukan model arsitektur yang tidak bergantung pada state lokal.

---

# Problem

Apabila Runtime menyimpan state secara internal (stateful), maka akan muncul berbagai masalah:

- sulit melakukan horizontal scaling,
- sulit melakukan failover,
- sulit melakukan load balancing,
- sulit melakukan rolling update,
- sulit melakukan auto-scaling,
- sulit melakukan recovery,
- bergantung pada node tertentu.

Selain itu, ketika Runtime berhenti secara tidak terduga, seluruh state yang berada di memori dapat hilang.

---

# Decision

MMOS menetapkan bahwa seluruh Runtime bersifat **Stateless**.

Runtime tidak menyimpan state bisnis maupun state execution secara permanen.

Seluruh state disimpan pada storage yang persisten.

Runtime hanya membaca, memproses, dan memperbarui state.

---

# Principle

Prinsip utama ADR ini adalah:

> **Runtime Executes, Storage Remembers.**

Runtime menjalankan pekerjaan.

Storage menyimpan keadaan.

---

# Runtime Model

```
Execution

↓

Runtime

↓

Persistent State Store

↓

Execution
```

Runtime dapat dihentikan kapan saja tanpa kehilangan informasi.

---

# Responsibilities

Runtime bertanggung jawab terhadap:

- menjalankan task
- memilih engine
- memanggil capability
- mengelola retry
- mengelola timeout
- menghasilkan event
- memperbarui execution state

Runtime tidak bertanggung jawab terhadap penyimpanan permanen.

---

# State Ownership

State runtime dimiliki oleh object berikut:

Execution

- execution state
- progress
- retry count
- variables

Memory

- context
- knowledge
- embeddings

Artifact

- generated output

Event

- execution history

Runtime tidak menjadi pemilik state.

---

# Execution Flow

```
Load Execution

↓

Read State

↓

Execute Task

↓

Update State

↓

Persist

↓

Next Task
```

Setelah setiap perubahan penting, state harus dipersistensikan.

---

# Recovery

Jika Runtime gagal:

```
Execution

↓

Persisted State

↓

New Runtime

↓

Resume Execution
```

Execution dapat dilanjutkan oleh Runtime lain tanpa migrasi state.

---

# Horizontal Scaling

Karena Runtime bersifat stateless:

```
Runtime A

Runtime B

Runtime C

Runtime D
```

Seluruh Runtime dapat mengambil Execution dari antrean yang sama.

Tidak ada Runtime yang memiliki ownership eksklusif terhadap state.

---

# Load Balancing

Execution dapat dijadwalkan ke Runtime mana pun yang tersedia.

```
Execution Queue

↓

Load Balancer

↓

Runtime Pool
```

Load balancer tidak perlu mengetahui state internal Runtime.

---

# Auto Scaling

Runtime baru dapat ditambahkan kapan saja.

```
High Load

↓

Scale Out

↓

New Runtime

↓

Ready
```

Tidak diperlukan sinkronisasi state antar Runtime.

---

# Failure Handling

Jika Runtime berhenti:

```
Runtime Failure

↓

Execution State

↓

Persistent Storage

↓

Replacement Runtime

↓

Continue Execution
```

Kehilangan satu Runtime tidak menyebabkan kehilangan Execution.

---

# Deployment Independence

Karena Runtime tidak memiliki state lokal, Runtime dapat dijalankan pada:

- Docker
- Kubernetes
- Virtual Machine
- Bare Metal
- Serverless
- Multi Cloud

Tanpa perubahan pada model domain.

---

# Session Handling

Session pengguna bukan bagian dari Runtime.

Session dikelola oleh komponen autentikasi atau gateway.

Runtime hanya menerima execution context yang diperlukan.

---

# Caching

Runtime diperbolehkan memiliki cache sementara untuk meningkatkan performa.

Contoh:

- model cache
- metadata cache
- capability cache

Namun cache:

- bukan source of truth,
- dapat dihapus kapan saja,
- harus dapat dibangun kembali.

---

# Persistent Storage

Minimal informasi berikut harus disimpan secara persisten:

- execution state
- workflow progress
- variables
- execution log
- event history
- artifact metadata
- retry information

Storage menjadi sumber kebenaran sistem.

---

# Architectural Principles

1. Runtime tidak menyimpan state permanen.
2. Execution state selalu dipersistensikan.
3. Runtime dapat dihentikan kapan saja.
4. Runtime dapat diganti kapan saja.
5. Runtime dapat diskalakan secara horizontal.
6. Storage menjadi source of truth.
7. Cache hanya bersifat sementara.
8. Recovery selalu dilakukan dari persistent state.

---

# Benefits

Dengan Runtime Stateless:

- horizontal scaling menjadi mudah,
- failover lebih cepat,
- deployment lebih sederhana,
- rolling update tanpa downtime,
- auto-scaling lebih efisien,
- recovery lebih andal,
- resource utilization lebih optimal.

---

# Consequences

Seluruh implementasi Runtime harus mengikuti pola berikut:

```
Read State

↓

Execute

↓

Persist

↓

Publish Event
```

Runtime tidak boleh mengandalkan memori lokal sebagai sumber data utama.

---

# Alternatives Considered

## Stateful Runtime

Ditolak.

Runtime menjadi bergantung pada node tertentu dan sulit dipulihkan ketika terjadi kegagalan.

---

## Shared Memory Runtime

Ditolak.

Shared memory meningkatkan kompleksitas sinkronisasi dan mengurangi skalabilitas.

---

## In-Memory Execution State

Ditolak.

State akan hilang ketika Runtime berhenti atau mengalami crash.

---

# Impact

ADR ini memengaruhi:

- MAS-200 Execution Model
- MAS-700 AI Runtime
- IMS-400 Execution Specification
- IMS-500 Memory Specification
- Runtime Schema
- Execution Schema
- Deployment Reference
- Validator
- Generator
- CLI

Seluruh Runtime MMOS wajib bersifat stateless dan bergantung pada persistent storage sebagai sumber kebenaran.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-003 — Orchestrator Never Works

ADR-007 — Workflow is Declarative

ADR-008 — Execution is Runtime Unit

ADR-010 — Capability as Contract

---

# Summary

Runtime dalam MMOS adalah komponen eksekusi yang **stateless**. Runtime tidak menyimpan state permanen, melainkan membaca state dari persistent storage, menjalankan pekerjaan, memperbarui state, lalu menyimpannya kembali.

Dengan memisahkan Runtime dari penyimpanan state, MMOS memperoleh arsitektur yang mudah diskalakan secara horizontal, mendukung failover dan recovery otomatis, serta dapat dijalankan pada berbagai lingkungan deployment tanpa perubahan pada model domain.