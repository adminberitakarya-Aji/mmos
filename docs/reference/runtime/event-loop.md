# Event Loop

**Version:** MMOS v1.0  
**Category:** Runtime Reference  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan **Event Loop**, yaitu mekanisme Runtime yang bertanggung jawab menerima, memproses, mendistribusikan, dan menyelesaikan seluruh Event yang terjadi selama sistem berjalan.

Event Loop memastikan setiap perubahan yang terjadi di dalam MMOS dapat diamati (**observable**), dilacak (**traceable**), dan diproses secara konsisten.

Event Loop merupakan bagian dari Runtime dan berjalan terus selama Runtime aktif.

---

# Responsibilities

Event Loop bertanggung jawab untuk:

- menerima Event baru;
- memvalidasi Event;
- mengurutkan Event;
- mendistribusikan Event;
- memanggil Subscriber;
- mengelola Event Queue;
- menyelesaikan Event Processing.

Event Loop tidak bertanggung jawab untuk:

- menjalankan Workflow;
- melakukan Reasoning;
- memilih Capability;
- menjalankan Engine;
- mengubah Workflow.

---

# Design Goals

Event Loop dirancang agar:

- asynchronous;
- deterministic;
- observable;
- scalable;
- fault tolerant;
- provider agnostic.

---

# High-Level Flow

```
Event Created

↓

Validate Event

↓

Publish

↓

Event Queue

↓

Select Event

↓

Dispatch

↓

Subscribers

↓

Processing Complete

↓

Archive
```

---

# Event Position

Event Loop bekerja berdampingan dengan System Loop.

```
System Loop

├── Scheduler Loop

├── Execution Loop

├── Agent Loop

└── Event Loop
```

Event Loop berjalan secara independen tetapi tetap berada di bawah Runtime.

---

# Event Lifecycle

```
Created

↓

Published

↓

Queued

↓

Processing

↓

Delivered

↓

Completed

↓

Archived
```

Jika gagal.

```
Processing

↓

Retry

↓

Processing

↓

Completed
```

atau

```
Processing

↓

Dead Letter Queue
```

---

# Event Creation

Event dapat dibuat oleh berbagai komponen.

```
Runtime

Workflow

Execution

Task

Agent

Capability

Memory

Plugin
```

Seluruh Event memiliki struktur yang sama sesuai Event Specification.

---

# Event Validation

Sebelum diproses.

```
Receive Event

↓

Validate Schema

↓

Validate Metadata

↓

Accept
```

Event yang tidak valid akan ditolak.

---

# Event Queue

Seluruh Event masuk ke Queue.

```
Publish

↓

Queue

↓

Pending Events
```

Queue menjaga urutan pemrosesan Event.

---

# Event Selection

Event berikutnya dipilih.

```
Queue

↓

Next Event

↓

Dispatch
```

Pemilihan mengikuti kebijakan Runtime.

---

# Event Dispatch

Event dikirim kepada Subscriber.

```
Event

↓

Subscribers

↓

Handler

↓

Response
```

Event dapat memiliki satu atau banyak Subscriber.

---

# Subscriber Processing

Setiap Subscriber memproses Event secara independen.

```
Subscriber A

Subscriber B

Subscriber C

↓

Completed
```

Kegagalan satu Subscriber tidak boleh menghentikan Subscriber lainnya.

---

# Event Ordering

Runtime menjaga urutan Event apabila diperlukan.

```
Event 1

↓

Event 2

↓

Event 3
```

Untuk Event yang tidak saling bergantung, Runtime dapat memproses secara paralel.

---

# Parallel Event Processing

```
Queue

├── Event A

├── Event B

├── Event C

└── Event D
```

Event independen dapat diproses secara bersamaan.

---

# Event Retry

Apabila Handler gagal.

```
Handler Failed

↓

Retry Policy

↓

Retry Queue

↓

Dispatch Again
```

Retry Policy dikelola oleh Runtime.

---

# Dead Letter Queue

Jika Retry gagal.

```
Event

↓

Retry Failed

↓

Dead Letter Queue

↓

Manual Inspection
```

Dead Letter Queue mencegah Event bermasalah menghambat Runtime.

---

# Event Completion

Setelah seluruh Subscriber selesai.

```
Subscribers Completed

↓

Mark Completed

↓

Archive
```

Event tidak diubah setelah selesai diproses.

---

# Event Immutability

Event bersifat immutable.

```
Create

↓

Publish

↓

Read Only

↓

Archive
```

Event tidak boleh dimodifikasi setelah dipublikasikan.

---

# Event Categories

Contoh kategori Event.

```
Execution Events

Workflow Events

Task Events

Capability Events

Memory Events

Runtime Events

Plugin Events

System Events
```

Kategori Event mengacu pada Event Catalog MMOS.

---

# Event Processing Model

```
Producer

↓

Publish

↓

Queue

↓

Dispatcher

↓

Subscribers

↓

Completed
```

Model ini mendukung arsitektur Event-Driven MMOS.

---

# Failure Handling

Jika terjadi kesalahan.

```
Dispatch Failed

↓

Retry

↓

Still Failed?

      │

      ├── Yes

      │

      └── Dead Letter Queue

      │

      └── No

            ↓

Completed
```

Runtime tetap berjalan walaupun terdapat Event yang gagal.

---

# Relationship with Other Loops

```
System Loop

↓

Execution Loop

↓

Agent Loop

↓

Event Created

↓

Event Loop

↓

Subscribers

↓

Continue Runtime
```

Event Loop menerima Event dari seluruh komponen Runtime.

---

# Design Principles

## Event Driven

Seluruh perubahan sistem direpresentasikan sebagai Event.

---

## Immutable

Event tidak dapat diubah setelah dipublikasikan.

---

## Asynchronous

Pemrosesan Event dilakukan secara asynchronous.

---

## Observable

Seluruh Event dapat dilacak dan diaudit.

---

## Fault Tolerant

Kegagalan satu Event tidak menghentikan Runtime.

---

## Provider Agnostic

Event Loop tidak bergantung pada provider, Engine, maupun implementasi transport tertentu.

---

# Related Documents

- `docs/reference/runtime/system-loop.md`
- `docs/reference/runtime/scheduler-loop.md`
- `docs/reference/runtime/execution-loop.md`
- `docs/reference/runtime/agent-loop.md`
- `docs/architecture/MAS-700-ai-runtime.md`
- `docs/architecture/MAS-400-orchestrator.md`
- `docs/catalog/event-catalog.md`
- `docs/reference/sequence/event-flow.md`
- `docs/reference/state-machine/event-state.md`
- `specs/ims/IMS-800-event-specification.md`