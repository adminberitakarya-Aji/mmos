# MMOS v1.0 — Runtime Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan **Runtime Diagram** MMOS.

Runtime bertanggung jawab untuk menjalankan model AI yang dibutuhkan
oleh Execution. Runtime menjadi lapisan abstraksi antara MMOS dan
berbagai AI Provider sehingga Workflow maupun Agent tidak bergantung
pada vendor tertentu.

Runtime **tidak mengelola Workflow**, **tidak mengelola Task**, dan
**tidak mengakses Memory secara langsung**.

---

# 2. Objectives

Runtime Diagram bertujuan untuk:

- Menjelaskan posisi Runtime dalam arsitektur MMOS
- Menjelaskan struktur internal Runtime
- Menjelaskan hubungan Runtime dengan Provider AI
- Menjelaskan alur pemanggilan Runtime
- Menjadi referensi implementasi Runtime Engine

---

# 3. Runtime Principles

Runtime mengikuti prinsip:

- Provider Agnostic
- Stateless
- Contract Based
- Replaceable
- Observable
- Secure by Design

Runtime hanya menjalankan inferensi AI.

---

# 4. Runtime Position

Runtime berada di bawah Execution.

```text
Workflow
      │
      ▼
Task
      │
      ▼
Execution
      │
      ▼
Runtime
```

Execution menjadi satu-satunya pihak yang menggunakan Runtime.

---

# 5. High-Level Runtime Model

```text
Execution
      │
      ▼
Runtime Engine
      │
      ▼
Runtime
      │
      ▼
Provider Adapter
      │
      ▼
AI Provider
```

Runtime tidak mengetahui siapa yang membuat Workflow.

---

# 6. Internal Structure

Runtime terdiri dari:

```text
Runtime

├── Runtime Profile
├── Model Selection
├── Provider Configuration
├── Invocation Parameters
├── Prompt Payload
├── Response
├── Usage
└── Metadata
```

Runtime tidak menyimpan Workflow State.

---

# 7. Runtime Components

Secara logis Runtime Engine terdiri dari:

```text
Runtime Engine

├── Runtime Resolver
├── Provider Resolver
├── Prompt Builder
├── Model Invoker
├── Response Processor
├── Policy Manager
└── Runtime State Manager
```

Komponen ini telah dijelaskan pada
`component-diagram.md`.

---

# 8. Runtime Invocation

Alur dasar pemanggilan Runtime.

```text
Execution

↓

Runtime Engine

↓

Runtime

↓

Provider Adapter

↓

AI Provider

↓

Response
```

Seluruh komunikasi dilakukan melalui Runtime Engine.

---

# 9. Provider Abstraction

Runtime tidak bergantung pada Provider tertentu.

```text
Runtime

↓

Provider Adapter

├── OpenAI
├── Anthropic
├── Google
├── Azure OpenAI
├── Ollama
├── vLLM
└── Provider Lain
```

Penambahan Provider tidak mengubah Workflow.

---

# 10. Model Selection

Runtime memilih model berdasarkan Policy.

```text
Execution

↓

Runtime Policy

↓

Model Selection

↓

Invocation
```

Pemilihan model tidak dilakukan oleh Workflow.

---

# 11. Prompt Relationship

Prompt dibangun sebelum Invocation.

```text
Execution Context

↓

Prompt Builder

↓

Prompt Payload

↓

Runtime
```

Prompt Builder merupakan bagian dari Runtime Engine.

---

# 12. Runtime Response

Hasil inferensi dikembalikan kepada Execution.

```text
AI Provider

↓

Runtime

↓

Execution

↓

Artifact
```

Runtime tidak menyimpan hasil secara permanen.

---

# 13. Memory Relationship

Runtime tidak mengakses Memory secara langsung.

```text
Execution

↓

Memory Engine

↓

Context

↓

Runtime
```

Execution menyediakan Context yang diperlukan.

---

# 14. Capability Relationship

Runtime tidak memanggil Capability.

```text
Execution

├── Runtime
└── Capability
```

Keduanya merupakan layanan independen
yang dikoordinasikan oleh Execution.

---

# 15. Event Relationship

Runtime menghasilkan Event operasional.

```text
Runtime Invoked

↓

Provider Selected

↓

Response Received

↓

Runtime Completed
```

Jika gagal.

```text
Runtime Failed
```

Event dipublikasikan melalui Event Engine.

---

# 16. Runtime Lifecycle

```text
Initialized

↓

Ready

↓

Invoking

↓

Processing

↓

Completed
```

Kemungkinan akhir lainnya:

```text
Failed

Timed Out

Cancelled
```

Detail state dijelaskan pada
`runtime-state.md`.

---

# 17. Error Handling

Jika Provider gagal.

```text
Runtime

↓

Invocation Failed

↓

Retry

↓

Alternative Provider

↓

Completed
```

Strategi Retry mengikuti Runtime Policy.

---

# 18. Scalability

Runtime dapat memiliki banyak Worker.

```text
Execution Queue
       │
       ▼
Runtime Engine
 ┌─────┼─────┐
 ▼     ▼     ▼
R1    R2    R3
```

Setiap Runtime Worker bersifat stateless.

---

# 19. Security

Runtime menerapkan:

- Provider Authentication
- Secret Management
- API Key Isolation
- Encryption
- Policy Validation

Credential tidak pernah diketahui oleh Workflow maupun Agent.

---

# 20. Monitoring

Runtime menghasilkan:

- Invocation Count
- Response Time
- Token Usage
- Provider Usage
- Error Rate
- Retry Count
- Latency

Seluruh metrik dikumpulkan oleh sistem observability.

---

# 21. Dependency Rules

Runtime dapat bergantung pada:

- Provider Adapter
- Runtime Policy
- Model Configuration

Runtime tidak boleh bergantung pada:

- Workflow
- Composition
- Memory Store
- Capability
- Event Store

---

# 22. Design Principles

Runtime mengikuti prinsip:

- Runtime hanya menjalankan inferensi AI.
- Runtime bersifat provider agnostic.
- Runtime tidak mengetahui Workflow.
- Runtime tidak mengetahui Agent.
- Runtime tidak mengakses Memory secara langsung.
- Runtime mengembalikan hasil kepada Execution.
- Runtime dapat diganti tanpa mengubah Workflow.

---

# 23. Relationship with Other Diagrams

```text
Execution Diagram
        │
        ▼
Runtime Diagram
        │
        ▼
AI Provider
```

Runtime menjadi lapisan abstraksi antara Execution dan AI Provider.

---

# 24. Related Documents

- execution-diagram.md
- capability-diagram.md
- runtime-overview.md
- runtime-call.md
- runtime-state.md
- container-diagram.md
- component-diagram.md
- MAS-700 AI Runtime

---

# END