# MMOS v1.0 — Event Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan **Event Diagram** MMOS.

Event digunakan untuk merepresentasikan perubahan yang terjadi selama
operasional sistem. Event memungkinkan Engine saling mengetahui bahwa
suatu perubahan telah terjadi tanpa menciptakan ketergantungan langsung
(di​rect dependency) antar Engine.

Event **bukan perintah (command)** dan **bukan media komunikasi sinkron**.
Event adalah fakta bahwa suatu aktivitas telah terjadi.

---

# 2. Objectives

Event Diagram bertujuan untuk:

- Menjelaskan posisi Event dalam arsitektur MMOS
- Menjelaskan struktur Event Engine
- Menjelaskan aliran Event
- Menjelaskan hubungan Publisher dan Subscriber
- Menjadi referensi implementasi Event Engine

---

# 3. Event Principles

Event mengikuti prinsip:

- Event Driven
- Immutable
- Asynchronous
- Decoupled
- Observable
- Replayable
- Auditable

Event hanya menyatakan fakta yang telah terjadi.

---

# 4. Event Position

Seluruh Engine dapat menghasilkan Event.

```text
Workflow
Execution
Runtime
Capability
Memory
      │
      ▼
Event Engine
      │
      ▼
Event Store
```

Engine tidak saling mengirim Event secara langsung.

---

# 5. High-Level Event Model

```text
Publisher
      │
      ▼
Event Engine
      │
 ┌────┼────────────┐
 ▼    ▼            ▼
Store Dispatcher Subscriber
```

Event Engine menjadi pusat distribusi Event.

---

# 6. Internal Structure

Event terdiri dari:

```text
Event

├── Event ID
├── Event Type
├── Source
├── Timestamp
├── Payload
├── Metadata
├── Correlation ID
├── Causation ID
└── Version
```

Event bersifat immutable setelah dipublikasikan.

---

# 7. Event Engine Components

Secara logis Event Engine terdiri dari:

```text
Event Engine

├── Event Publisher
├── Event Dispatcher
├── Subscription Manager
├── Event Store
├── Replay Manager
├── Audit Manager
└── Event State Manager
```

Komponen ini telah dijelaskan pada
`component-diagram.md`.

---

# 8. Event Publication

Publisher mengirim Event.

```text
Execution

↓

Event Publisher

↓

Event Engine
```

Publisher tidak mengetahui Subscriber.

---

# 9. Event Distribution

Event didistribusikan
oleh Event Engine.

```text
Event Engine

↓

Dispatcher

↓

Subscribers
```

Distribusi dilakukan secara asynchronous.

---

# 10. Event Subscription

Subscriber mendaftarkan minatnya
terhadap jenis Event tertentu.

```text
Subscriber

↓

Subscription Manager

↓

Event Engine
```

Subscriber hanya menerima Event
yang sesuai dengan Subscription.

---

# 11. Event Persistence

Seluruh Event dapat dipersistensikan.

```text
Event

↓

Event Store

↓

Storage
```

Persistence mengikuti Event Policy.

---

# 12. Event Replay

Event dapat diputar ulang.

```text
Event Store

↓

Replay Manager

↓

Subscriber
```

Replay digunakan untuk:

- Recovery
- Audit
- Debugging
- Rebuild State

---

# 13. Event Categories

Contoh kategori Event.

```text
Workflow Event

Execution Event

Runtime Event

Capability Event

Memory Event

System Event
```

Kategori membantu klasifikasi dan routing.

---

# 14. Event Flow

Alur umum Event.

```text
Publisher

↓

Event Engine

↓

Store

↓

Dispatcher

↓

Subscriber
```

Publisher dan Subscriber
tidak saling mengenal.

---

# 15. Event Relationship

Contoh hubungan.

```text
Execution Completed

↓

Artifact Created

↓

Workflow Continued
```

Setiap Event dapat memicu
proses lanjutan melalui Orchestrator
atau Engine yang berlangganan.

---

# 16. Security

Event menerapkan:

- Authentication
- Authorization
- Encryption
- Audit Trail
- Access Policy

Payload sensitif harus mengikuti
kebijakan keamanan sistem.

---

# 17. Monitoring

Event Engine menghasilkan:

- Published Count
- Dispatch Count
- Queue Length
- Replay Count
- Subscriber Count
- Failure Count
- Latency

Monitoring dilakukan secara independen.

---

# 18. Dependency Rules

Event Engine dapat bergantung pada:

- Event Store
- Subscription Manager
- Dispatcher

Event Engine tidak boleh bergantung pada:

- Workflow
- Runtime
- Capability
- Memory
- AI Provider

Publisher dan Subscriber tetap terpisah
melalui Event Engine.

---

# 19. Scalability

Event Engine dapat diperbanyak.

```text
Publishers

↓

Event Engine Cluster

 ┌────┼────┐
 ▼    ▼    ▼
E1   E2   E3

↓

Subscribers
```

Distribusi Event tetap konsisten
sesuai kebijakan sistem.

---

# 20. Lifecycle Overview

```text
Created

↓

Published

↓

Stored

↓

Dispatched

↓

Consumed

↓

Archived
```

Lifecycle rinci dijelaskan pada
`event-state.md`.

---

# 21. Design Principles

Event mengikuti prinsip:

- Event menyatakan fakta yang telah terjadi.
- Event bersifat immutable.
- Event didistribusikan secara asynchronous.
- Publisher tidak mengetahui Subscriber.
- Subscriber tidak mengetahui Publisher.
- Event dapat dipersistensikan.
- Event dapat diputar ulang (replay).
- Event mendukung observability dan audit.

---

# 22. Relationship with Other Diagrams

```text
Execution Diagram
        │
        ▼
Event Diagram
        │
        ▼
Publisher
        │
        ▼
Event Engine
        │
        ▼
Subscribers
```

Event menjadi mekanisme komunikasi tidak langsung (decoupled communication)
antar bagian sistem tanpa menciptakan ketergantungan langsung.

---

# 23. Related Documents

- execution-diagram.md
- event-flow.md
- event-state.md
- event-catalog.md
- component-diagram.md
- engine-overview.md
- MAS-300 Engine Architecture

---

# END