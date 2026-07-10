# ADR-008 — Execution is Runtime Unit

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

Pada MMOS, Workflow merupakan definisi proses yang bersifat deklaratif (ADR-007).

Namun sebuah Workflow dapat dijalankan berkali-kali dengan:

- input berbeda
- user berbeda
- parameter berbeda
- environment berbeda
- waktu berbeda

Oleh karena itu diperlukan object yang merepresentasikan **satu instansi nyata dari proses yang sedang berjalan**.

Object tersebut adalah **Execution**.

---

# Problem

Apabila Workflow dianggap sebagai proses yang sedang berjalan, maka akan muncul berbagai masalah:

- Workflow menjadi mutable.
- Sulit menjalankan workflow secara paralel.
- Sulit melakukan retry.
- Sulit melakukan audit.
- Sulit menyimpan progress.
- Sulit melakukan recovery.
- Sulit mengetahui riwayat eksekusi.

Workflow seharusnya tetap menjadi blueprint.

Diperlukan object runtime yang terpisah.

---

# Decision

MMOS menetapkan bahwa **Execution adalah Runtime Unit**.

Workflow hanya mendefinisikan proses.

Execution adalah instansi runtime dari Workflow.

Setiap kali Workflow dijalankan, sistem akan membuat Execution baru.

---

# Principle

Prinsip utama ADR ini adalah:

> **Workflow Defines, Execution Runs.**

Workflow bersifat statis.

Execution bersifat dinamis.

---

# Execution Model

```
Project

↓

Composition

↓

Workflow

↓

Execution #1

Execution #2

Execution #3
```

Satu Workflow dapat memiliki banyak Execution.

Execution tidak pernah menjadi bagian dari definisi Workflow.

---

# Responsibilities

Execution bertanggung jawab terhadap:

- runtime state
- task state
- execution progress
- execution context
- runtime variables
- retry information
- execution metrics
- execution logs
- execution duration

Execution tidak bertanggung jawab terhadap definisi Workflow.

---

# Execution Lifecycle

Lifecycle standar:

```
Created

↓

Queued

↓

Preparing

↓

Running

↓

Waiting

↓

Paused

↓

Resuming

↓

Completed
```

atau

```
Running

↓

Failed
```

atau

```
Running

↓

Cancelled
```

State tersebut hanya berlaku untuk Execution.

Workflow tidak berubah.

---

# Execution Context

Execution memiliki context sendiri.

Contoh:

```
Workflow

↓

Execution

↓

Context

- input
- variables
- temporary memory
- runtime metadata
```

Context bersifat sementara.

Setelah Execution selesai, context dapat diarsipkan atau dibuang sesuai kebijakan.

---

# Task Execution

Task dalam Workflow berubah menjadi Task Execution.

Contoh:

```
Workflow Task

↓

Execution Task
```

Task Execution menyimpan:

- state
- retry count
- duration
- output
- error
- logs

Workflow Task tetap tidak berubah.

---

# Parallel Execution

Karena Execution merupakan Runtime Unit, maka satu Workflow dapat dijalankan secara paralel.

Contoh:

```
Workflow

↓

Execution A

Execution B

Execution C

Execution D
```

Masing-masing memiliki:

- context
- progress
- state
- metrics

yang independen.

---

# Retry Model

Retry dilakukan pada level Execution.

Contoh:

```
Execution

↓

Task Failed

↓

Retry

↓

Success
```

Workflow tidak diubah.

Execution hanya memperbarui runtime state.

---

# Observability

Execution wajib menghasilkan:

- execution id
- workflow id
- composition id
- project id
- start time
- finish time
- duration
- status
- metrics
- logs

Execution menjadi dasar observability sistem.

---

# Persistence

Execution harus dapat dipersistensikan.

Minimal menyimpan:

- state
- progress
- variables
- task state
- metrics
- logs

Hal ini memungkinkan:

- recovery
- resume
- replay
- audit

---

# Failure Recovery

Jika Runtime berhenti:

```
Execution

↓

Persisted State

↓

Restart Runtime

↓

Resume Execution
```

Workflow tidak perlu dijalankan ulang dari awal apabila state masih valid.

---

# Runtime Independence

Execution tidak mengetahui:

- provider
- engine implementation
- deployment topology

Execution hanya mengetahui runtime state.

Pemilihan Engine dan Provider tetap menjadi tanggung jawab Runtime.

---

# Architectural Principles

1. Workflow adalah blueprint.
2. Execution adalah runtime instance.
3. Satu Workflow dapat memiliki banyak Execution.
4. Execution memiliki lifecycle sendiri.
5. Execution memiliki context sendiri.
6. Retry dilakukan pada Execution.
7. Audit dilakukan melalui Execution.
8. Workflow tetap immutable selama Execution berlangsung.

---

# Benefits

Dengan Execution sebagai Runtime Unit:

- workflow tetap sederhana,
- progress mudah dilacak,
- retry lebih mudah,
- recovery lebih mudah,
- observability meningkat,
- audit lengkap,
- parallel execution didukung,
- state management lebih jelas.

---

# Consequences

Seluruh proses runtime harus direpresentasikan oleh Execution.

Object seperti:

- Workflow
- Composition
- Capability

tidak boleh menyimpan runtime state.

Semua runtime state berada di Execution.

---

# Alternatives Considered

## Workflow Menyimpan Runtime State

Ditolak.

Workflow harus tetap menjadi definisi proses yang immutable.

---

## Task Menjadi Runtime Root

Ditolak.

Task hanyalah bagian dari Execution dan tidak memiliki lifecycle independen.

---

## Session Sebagai Runtime Unit

Ditolak.

Session merepresentasikan interaksi pengguna, bukan pelaksanaan Workflow.

---

# Impact

ADR ini memengaruhi:

- MAS-200 Execution Model
- IMS-400 Execution Specification
- Event Specification
- Execution Schema
- Runtime Schema
- Workflow Schema
- Validator
- Generator
- CLI

Semua implementasi runtime MMOS wajib menggunakan Execution sebagai unit utama pelaksanaan proses.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-003 — Orchestrator Never Works

ADR-006 — Contract First

ADR-007 — Workflow is Declarative

ADR-009 — Runtime is Stateless

---

# Summary

Execution adalah **unit runtime** dalam MMOS.

Workflow hanya mendefinisikan proses, sedangkan setiap pelaksanaan nyata direpresentasikan oleh sebuah Execution yang memiliki lifecycle, context, state, progress, dan metadata sendiri.

Pemisahan ini memungkinkan MMOS mendukung parallel execution, retry, recovery, observability, dan audit tanpa mengubah definisi Workflow, sehingga arsitektur tetap konsisten, immutable, dan mudah diskalakan.