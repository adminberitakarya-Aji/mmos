# ADR-014 — Event-Driven Architecture

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS merupakan platform terdistribusi yang terdiri dari banyak komponen independen, antara lain:

- Orchestrator
- Workflow Engine
- AI Engine
- Memory Engine
- Capability Engine
- Storage Engine
- Event Engine
- Integration Engine

Setiap komponen menghasilkan perubahan keadaan (state changes) dan perlu berkomunikasi dengan komponen lain.

Apabila komunikasi dilakukan secara langsung (direct synchronous call), maka akan muncul ketergantungan yang tinggi antar komponen.

MMOS membutuhkan mekanisme komunikasi yang longgar (loosely coupled), skalabel, dan mudah diamati.

---

# Problem

Pendekatan Request/Response secara langsung menyebabkan:

- tight coupling
- cascading failure
- sulit melakukan scaling
- sulit melakukan asynchronous execution
- sulit menambah subscriber baru
- observability rendah
- integrasi eksternal menjadi kompleks

Selain itu, banyak aktivitas dalam MMOS sebenarnya merupakan reaksi terhadap suatu kejadian (event).

Contoh:

Execution selesai.

↓

Artifact dibuat.

↓

Notification dikirim.

↓

Analytics diperbarui.

↓

Audit dicatat.

Seluruh proses tersebut tidak perlu saling mengetahui implementasi masing-masing.

---

# Decision

MMOS mengadopsi **Event-Driven Architecture (EDA)** sebagai mekanisme komunikasi utama antar komponen.

Perubahan pada Domain Object menghasilkan Event.

Komponen lain bereaksi terhadap Event tersebut.

Tidak ada ketergantungan langsung antar implementasi.

---

# Principle

Prinsip utama ADR ini adalah:

> **Publish Facts, React to Facts.**

Komponen hanya menerbitkan fakta.

Komponen lain memutuskan apakah perlu bereaksi.

---

# Architecture

```
Execution

↓

ExecutionCompleted Event

↓

Event Bus

↓

Artifact Engine

↓

Notification Engine

↓

Analytics Engine

↓

Audit Engine
```

Execution tidak mengetahui siapa yang akan menggunakan Event tersebut.

---

# Event Flow

```
State Change

↓

Domain Event

↓

Event Bus

↓

Subscribers

↓

Action
```

Seluruh komunikasi asynchronous mengikuti pola ini.

---

# Publisher

Publisher bertanggung jawab terhadap:

- membuat Event
- memvalidasi Event
- mempublikasikan Event

Publisher tidak mengetahui Subscriber.

---

# Subscriber

Subscriber bertanggung jawab terhadap:

- menerima Event
- memvalidasi Event
- menjalankan aksi yang diperlukan

Subscriber tidak memengaruhi Publisher.

---

# Event Bus

Event Bus bertanggung jawab terhadap:

- routing
- delivery
- filtering
- retry
- ordering (apabila diperlukan)
- dead-letter handling

Event Bus tidak menjalankan business logic.

---

# Domain Events

Contoh Domain Event:

Project

- ProjectCreated
- ProjectArchived

Composition

- CompositionCreated
- CompositionCompleted

Workflow

- WorkflowStarted
- WorkflowCompleted

Execution

- ExecutionStarted
- ExecutionPaused
- ExecutionCompleted
- ExecutionFailed

Artifact

- ArtifactGenerated
- ArtifactPublished

Memory

- MemoryUpdated

Capability

- CapabilityExecuted

---

# Asynchronous Processing

EDA memungkinkan proses asynchronous.

Contoh:

```
ExecutionCompleted

↓

Publish Event

↓

Notification

Analytics

Audit

Webhook

Search Index
```

Seluruh subscriber berjalan secara independen.

---

# Loose Coupling

Tanpa EDA:

```
Execution

↓

Notification

↓

Analytics

↓

Audit

↓

Webhook
```

Dengan EDA:

```
Execution

↓

Event

↓

Notification

Analytics

Audit

Webhook
```

Execution tidak mengetahui komponen lain.

---

# Failure Isolation

Apabila Notification gagal:

```
ExecutionCompleted

↓

Notification Failed

Analytics Success

Audit Success
```

Kegagalan satu Subscriber tidak memengaruhi Subscriber lainnya.

---

# Scalability

Subscriber dapat diskalakan secara independen.

Contoh:

```
Event Bus

↓

Notification Cluster

Analytics Cluster

Webhook Cluster
```

Tidak diperlukan perubahan pada Publisher.

---

# Replay

Karena Event bersifat immutable (ADR-012), maka Event dapat diputar ulang.

```
Event Store

↓

Replay

↓

Subscriber
```

Replay digunakan untuk:

- recovery
- reindex
- analytics
- migration
- debugging

---

# Integration

Integrasi eksternal dilakukan melalui Event.

Contoh:

```
ArtifactGenerated

↓

Webhook

↓

External CMS
```

Atau:

```
ExecutionCompleted

↓

Webhook

↓

Slack

Discord

Teams

Email
```

Integrasi tidak memengaruhi Domain Model.

---

# Event Ordering

Dalam satu Execution, Event harus memiliki urutan logis.

Contoh:

```
ExecutionStarted

↓

TaskStarted

↓

TaskCompleted

↓

ExecutionCompleted
```

Namun antar Execution, Event dapat diproses secara paralel.

---

# Idempotency

Seluruh Subscriber harus dirancang agar idempotent.

Jika Event diterima lebih dari satu kali:

```
ExecutionCompleted

↓

Subscriber

↓

Duplicate

↓

Ignored
```

Hal ini mendukung model at-least-once delivery.

---

# Delivery Guarantee

MMOS mengutamakan:

- At-Least-Once Delivery

Subscriber bertanggung jawab menangani kemungkinan Event duplikat.

Strategi delivery dapat berubah sesuai implementasi tanpa memengaruhi Domain Model.

---

# Observability

EDA memungkinkan observability penuh.

Setiap Event dapat digunakan untuk:

- tracing
- metrics
- audit
- monitoring
- timeline visualization

---

# Architectural Principles

1. Seluruh perubahan menghasilkan Event.
2. Komponen berkomunikasi melalui Event.
3. Publisher tidak mengenal Subscriber.
4. Subscriber independen.
5. Event bersifat immutable.
6. Event dapat direplay.
7. Subscriber harus idempotent.
8. Event Bus tidak mengandung business logic.

---

# Benefits

Dengan Event-Driven Architecture:

- loose coupling
- scalability tinggi
- fault isolation
- observability lengkap
- asynchronous execution
- integrasi lebih mudah
- replay didukung
- evolusi sistem lebih fleksibel

---

# Consequences

Seluruh fitur baru harus dievaluasi:

Apabila suatu proses hanya bereaksi terhadap perubahan state, maka proses tersebut harus diimplementasikan sebagai Subscriber terhadap Event terkait.

Direct synchronous call hanya digunakan apabila benar-benar diperlukan untuk menjaga konsistensi transaksi atau memenuhi kebutuhan latensi yang sangat rendah.

---

# Alternatives Considered

## Direct Service-to-Service Calls

Ditolak.

Meningkatkan coupling dan memperbesar risiko cascading failure.

---

## Shared Database Communication

Ditolak.

Menghasilkan coupling terhadap storage dan melanggar batas kepemilikan domain.

---

## Polling-Based Integration

Ditolak.

Tidak efisien, meningkatkan latensi, dan menghasilkan beban sistem yang tidak diperlukan.

---

# Impact

ADR ini memengaruhi:

- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-800 Platform
- IMS-800 Event Specification
- Event Catalog
- Event Schema
- Event Engine
- Integration Engine
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib menggunakan Event sebagai mekanisme komunikasi utama antar komponen yang independen.

---

# Related ADR

ADR-003 — Orchestrator Never Works

ADR-004 — Engine Separation

ADR-009 — Runtime is Stateless

ADR-012 — Event is Immutable

ADR-013 — Object Identity is Immutable

ADR-015 — Human in the Loop

---

# Summary

MMOS mengadopsi **Event-Driven Architecture (EDA)** sebagai fondasi komunikasi antar komponen. Setiap perubahan pada Domain Object menghasilkan Event yang dipublikasikan melalui Event Bus, kemudian diproses secara independen oleh Subscriber yang relevan.

Pendekatan ini menghasilkan arsitektur yang longgar (loosely coupled), mudah diskalakan, tahan terhadap kegagalan, mendukung pemrosesan asynchronous, serta memungkinkan observability, replay, dan integrasi eksternal tanpa meningkatkan kompleksitas pada Domain Model.