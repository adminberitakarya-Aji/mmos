# ADR-012 — Event is Immutable

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS merupakan platform yang menjalankan banyak proses secara paralel:

- Workflow Execution
- AI Inference
- Capability Invocation
- Memory Retrieval
- Artifact Generation
- Human Interaction
- External Integration

Seluruh aktivitas tersebut menghasilkan perubahan pada sistem.

Agar perubahan tersebut dapat diaudit, direkonstruksi, dan dipantau, MMOS membutuhkan mekanisme pencatatan yang konsisten.

Mekanisme tersebut adalah **Event**.

---

# Problem

Apabila Event dapat diubah atau dihapus setelah dipublikasikan, maka akan muncul berbagai masalah:

- audit menjadi tidak valid,
- riwayat sistem tidak dapat dipercaya,
- debugging menjadi sulit,
- replay tidak akurat,
- observability menurun,
- sinkronisasi antar sistem menjadi tidak konsisten.

Selain itu, perubahan Event akan menyebabkan berbagai subscriber memiliki pandangan yang berbeda terhadap keadaan sistem.

---

# Decision

MMOS menetapkan bahwa seluruh **Event bersifat Immutable**.

Setelah Event dipublikasikan:

- tidak boleh diubah,
- tidak boleh ditimpa,
- tidak boleh diedit.

Apabila terjadi perubahan keadaan, sistem harus menghasilkan Event baru.

---

# Principle

Prinsip utama ADR ini adalah:

> **Events are Facts, Facts Never Change.**

Event merepresentasikan fakta yang telah terjadi.

Fakta tidak boleh diubah.

---

# Event Model

```
Action

↓

Event Created

↓

Published

↓

Consumed

↓

Stored

↓

Never Modified
```

Setelah dipublikasikan, Event hanya dapat dibaca.

---

# Event Responsibilities

Event bertanggung jawab terhadap:

- mencatat fakta
- memberi notifikasi perubahan
- audit
- observability
- replay
- integration
- analytics

Event tidak bertanggung jawab terhadap:

- business logic
- workflow execution
- state mutation
- persistence policy

---

# Event Structure

Minimal Event memiliki:

```
Event ID

Event Type

Version

Timestamp

Project ID

Composition ID

Execution ID

Source

Payload

Metadata
```

Seluruh Event memiliki identitas unik.

---

# Event Lifecycle

```
Created

↓

Validated

↓

Published

↓

Consumed

↓

Archived
```

Tidak ada state:

```
Updated
```

atau

```
Modified
```

---

# Event Example

Contoh:

```
ExecutionStarted
```

Kemudian:

```
ExecutionCompleted
```

Bukan:

```
Update ExecutionStarted
```

Perubahan selalu direpresentasikan sebagai Event baru.

---

# Event Ordering

Event harus memiliki urutan yang dapat ditelusuri.

Contoh:

```
CompositionCreated

↓

WorkflowStarted

↓

ExecutionStarted

↓

TaskStarted

↓

TaskCompleted

↓

ExecutionCompleted

↓

ArtifactGenerated
```

Urutan Event membentuk riwayat sistem.

---

# Event as History

Event merupakan catatan historis.

Contoh:

```
Execution Failed

↓

Retry Requested

↓

Execution Restarted

↓

Execution Completed
```

Seluruh Event tetap disimpan.

Tidak ada Event yang ditimpa.

---

# Event Payload

Payload harus merepresentasikan kondisi saat Event terjadi.

Contoh:

```
TaskCompleted

Output

Duration

Engine

Capability
```

Payload tidak boleh berubah setelah Event dipublikasikan.

---

# Event Versioning

Event memiliki versi.

Contoh:

```
TaskCompleted v1

TaskCompleted v2
```

Versi baru digunakan apabila struktur Event mengalami perubahan yang tidak kompatibel.

---

# Event Storage

Event dapat disimpan pada:

- Event Store
- Message Queue
- Streaming Platform
- Log Storage

Implementasi storage tidak memengaruhi sifat immutable Event.

---

# Replay

Karena Event immutable, sistem dapat melakukan replay.

```
Event Stream

↓

Replay

↓

Reconstruct Timeline
```

Replay digunakan untuk:

- debugging
- audit
- analytics
- recovery
- simulation

---

# Observability

Seluruh Event menjadi dasar:

- logging
- tracing
- monitoring
- metrics
- timeline visualization

Observability tidak bergantung pada Runtime.

---

# Integration

Integrasi antar sistem dilakukan melalui Event.

```
MMOS

↓

Publish Event

↓

Subscriber A

Subscriber B

Subscriber C
```

Subscriber tidak boleh mengubah Event.

---

# Security

Event tidak boleh diedit oleh pengguna.

Apabila diperlukan koreksi, sistem menghasilkan Event baru.

Contoh:

```
ArtifactCreated

↓

ArtifactDeprecated
```

Bukan:

```
Update ArtifactCreated
```

---

# Architectural Principles

1. Event adalah fakta.
2. Event bersifat immutable.
3. Perubahan menghasilkan Event baru.
4. Event memiliki identitas unik.
5. Event memiliki timestamp.
6. Event dapat direplay.
7. Event dapat diaudit.
8. Event menjadi dasar observability.

---

# Benefits

Dengan Event Immutable:

- audit menjadi terpercaya,
- replay menjadi akurat,
- debugging lebih mudah,
- observability meningkat,
- integrasi lebih stabil,
- sinkronisasi lebih konsisten,
- timeline dapat direkonstruksi.

---

# Consequences

Seluruh Event MMOS harus mengikuti aturan:

- tidak boleh diubah,
- tidak boleh dihapus secara selektif,
- tidak boleh ditimpa,
- tidak boleh digunakan untuk menyimpan state yang dapat berubah.

State saat ini diperoleh dari Domain Object.

Riwayat perubahan diperoleh dari Event.

---

# Alternatives Considered

## Mutable Event

Ditolak.

Mengubah Event akan merusak integritas audit dan replay.

---

## Event sebagai Current State

Ditolak.

Event mencatat perubahan, bukan merepresentasikan kondisi terkini.

Current state tetap dimiliki oleh Domain Object.

---

## Delete Event

Ditolak.

Penghapusan Event menghilangkan jejak historis dan mengurangi kepercayaan terhadap sistem.

---

# Impact

ADR ini memengaruhi:

- Event Catalog
- MAS-500 Memory & Knowledge
- MAS-800 Platform
- IMS-800 Event Specification
- Event Schema
- Event Store
- Audit System
- Monitoring
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib memperlakukan Event sebagai catatan historis yang immutable.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-006 — Contract First

ADR-008 — Execution is Runtime Unit

ADR-009 — Runtime is Stateless

ADR-011 — Memory as Context Provider

ADR-013 — Object Identity is Immutable

---

# Summary

Event dalam MMOS merupakan **catatan fakta yang tidak dapat diubah**. Setiap perubahan pada sistem menghasilkan Event baru tanpa mengubah Event yang telah ada.

Pendekatan ini menjamin audit yang dapat dipercaya, replay yang akurat, observability yang kuat, serta integrasi antarsistem yang konsisten. Current state tetap dikelola oleh Domain Object, sedangkan Event menyimpan sejarah lengkap perjalanan sistem.