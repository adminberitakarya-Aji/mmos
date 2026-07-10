# MMOS v1.0 — Component Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan **Component Diagram** untuk setiap Engine di dalam
MMOS.

Berbeda dengan **Container Diagram** yang memperlihatkan hubungan antar
Engine, Component Diagram menjelaskan komponen internal yang membentuk
setiap Engine beserta tanggung jawabnya.

Dokumen ini merupakan **Level-3 Architecture**.

---

# 2. Objectives

Component Diagram bertujuan untuk:

- Menjelaskan struktur internal setiap Engine
- Menentukan tanggung jawab komponen
- Menjelaskan dependency internal
- Menjadi acuan implementasi Engine
- Menjaga Separation of Concerns

---

# 3. Architecture Levels

```text
Level 1

System Context

↓

Level 2

Container Diagram

↓

Level 3

Component Diagram

↓

Implementation
```

---

# 4. API Gateway Components

```text
API Gateway

├── Request Router
├── Authentication
├── Authorization
├── Request Validator
├── Version Manager
├── Rate Limiter
├── Response Formatter
└── Health Endpoint
```

### Responsibilities

- menerima request
- validasi request
- autentikasi
- routing
- response formatting

Gateway tidak menjalankan Workflow.

---

# 5. Orchestrator Components

```text
Orchestrator

├── Request Coordinator
├── Scheduler
├── Dispatcher
├── Execution Tracker
├── Policy Resolver
└── Coordination Controller
```

### Responsibilities

- koordinasi Engine
- menentukan urutan proses
- dispatch request
- monitoring lifecycle

Orchestrator tidak menjalankan pekerjaan bisnis.

---

# 6. Workflow Engine Components

```text
Workflow Engine

├── Workflow Loader
├── Workflow Parser
├── Workflow Validator
├── Workflow Scheduler
├── State Manager
└── Transition Evaluator
```

### Responsibilities

- membaca Workflow
- validasi Workflow
- menentukan Task berikutnya
- mengelola Workflow State

---

# 7. Execution Engine Components

```text
Execution Engine

├── Execution Manager
├── Task Dispatcher
├── Retry Manager
├── Timeout Manager
├── Error Handler
├── Result Collector
└── Execution State Manager
```

### Responsibilities

- menjalankan Execution
- mengelola Task
- retry
- timeout
- error recovery

---

# 8. Runtime Engine Components

```text
Runtime Engine

├── Runtime Selector
├── Provider Resolver
├── Prompt Builder
├── Model Invoker
├── Response Processor
├── Runtime Policy Manager
└── Runtime State Manager
```

### Responsibilities

- memilih Provider AI
- membangun Prompt
- memanggil Model
- memproses Response

Runtime tidak mengetahui Workflow.

---

# 9. Capability Engine Components

```text
Capability Engine

├── Capability Registry
├── Capability Resolver
├── Provider Adapter
├── Authentication Manager
├── Secret Manager
├── Retry Manager
└── Capability State Manager
```

### Responsibilities

- memilih Capability
- mengakses Tool
- mengelola Secret
- menangani Retry

---

# 10. Memory Engine Components

```text
Memory Engine

├── Context Loader
├── Context Writer
├── Scope Resolver
├── Version Manager
├── Cache Manager
├── Knowledge Resolver
└── Memory State Manager
```

### Responsibilities

- membaca Context
- menyimpan Context
- mengelola Scope
- versioning
- knowledge retrieval

---

# 11. Event Engine Components

```text
Event Engine

├── Event Publisher
├── Event Dispatcher
├── Event Store
├── Subscription Manager
├── Replay Manager
└── Event State Manager
```

### Responsibilities

- publish Event
- distribusi Event
- persistence
- replay
- subscription

---

# 12. Common Component Pattern

Sebagian besar Engine mengikuti pola umum.

```text
Request

↓

Resolver

↓

Policy

↓

Processor

↓

State Manager

↓

Result
```

Pola ini menjaga konsistensi implementasi.

---

# 13. Internal Dependency Rules

Komponen internal hanya boleh berinteraksi
di dalam Engine yang sama.

```text
Execution Manager

↓

Retry Manager

↓

State Manager
```

Komponen internal tidak boleh memanggil
komponen Engine lain secara langsung.

---

# 14. Inter-Engine Communication

Komunikasi antar Engine dilakukan
melalui public contract.

```text
Execution Engine

↓

Runtime Contract

↓

Runtime Engine
```

Bukan melalui komponen internal.

---

# 15. Component Lifecycle

Komponen memiliki lifecycle sederhana.

```text
Initialize

↓

Ready

↓

Running

↓

Stopping

↓

Stopped
```

Lifecycle Engine mengendalikan lifecycle komponen.

---

# 16. Failure Isolation

Jika satu komponen gagal.

```text
Retry Manager

↓

Failure
```

Komponen lain tetap berjalan
selama Engine masih sehat.

---

# 17. Extensibility

Komponen dapat ditambahkan
tanpa mengubah kontrak Engine.

Contoh:

```text
Runtime Engine

↓

Add Prompt Optimizer
```

Kontrak Runtime tetap sama.

---

# 18. Testing Strategy

Setiap komponen dapat diuji secara mandiri.

Jenis pengujian:

- Unit Test
- Component Test
- Contract Test
- Integration Test

---

# 19. Observability

Setiap komponen menghasilkan:

- Logs
- Metrics
- Events
- Health Status

Monitoring dilakukan pada level komponen dan Engine.

---

# 20. Design Principles

Component Diagram mengikuti prinsip:

- Single Responsibility
- High Cohesion
- Low Coupling
- Contract-Based Communication
- Replaceable Components
- Independent Testing
- Internal Encapsulation

---

# 21. Relationship with Other Diagrams

```text
System Context

↓

Container Diagram

↓

Component Diagram

↓

Sequence Diagram

↓

State Machine
```

Component Diagram menjadi jembatan
antara arsitektur dan implementasi.

---

# 22. Related Documents

- system-context.md
- container-diagram.md
- engine-overview.md
- runtime-overview.md
- object-relationship.md
- workflow-execution.md

---

# END