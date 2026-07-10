# MMOS v1.0 — Example: Simple Agent

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini memberikan contoh sederhana bagaimana sebuah Agent
didefinisikan dan dijalankan di dalam MMOS.

Contoh ini bersifat konseptual.

Tujuannya adalah membantu implementor memahami hubungan antara:

- Agent
- Workflow
- Execution
- Runtime
- Capability
- Memory
- Event

Contoh ini bukan implementasi bahasa pemrograman tertentu.

---

# 2. Scenario

Misalkan terdapat Agent bernama:

```text
News Summarizer Agent
```

Tugas Agent:

> Membaca sebuah artikel berita kemudian menghasilkan ringkasan singkat.

Input:

```text
Article
```

Output:

```text
Summary
```

---

# 3. Agent Definition

Secara konseptual Agent terdiri atas:

```text
Agent

Name

Description

Instruction

Capabilities

Memory Policy

Runtime Policy
```

Contoh:

```text
Name

News Summarizer

Instruction

Create concise factual summaries.

Capability

Text Generation

Memory

Session Memory

Runtime

LLM Runtime
```

---

# 4. Workflow

Workflow sederhana.

```text
Receive Request

↓

Load Context

↓

Generate Summary

↓

Save Result

↓

Complete
```

Workflow bersifat deklaratif.

---

# 5. Execution Flow

```text
Client

↓

Workflow Engine

↓

Execution Engine

↓

Runtime Engine

↓

LLM Provider

↓

Execution Completed
```

Execution bertanggung jawab mengoordinasikan Task.

---

# 6. Runtime Interaction

Runtime menerima Prompt.

```text
Instruction

+

Article

+

Context

↓

Runtime

↓

LLM

↓

Summary
```

Runtime tidak mengetahui Workflow.

---

# 7. Memory Usage

Memory digunakan sebelum Runtime dipanggil.

```text
Execution

↓

Memory Engine

↓

Session Context

↓

Runtime
```

Memory dapat berisi:

- User Preference
- Previous Conversation
- Workspace Information

---

# 8. Capability Usage

Contoh sederhana tidak membutuhkan Capability eksternal.

Flow:

```text
Execution

↓

Runtime

↓

Completed
```

Jika diperlukan, Capability dapat ditambahkan tanpa mengubah Workflow.

---

# 9. Event Flow

Selama proses berjalan dihasilkan Event.

```text
WorkflowStarted

↓

ExecutionStarted

↓

RuntimeStarted

↓

RuntimeCompleted

↓

ExecutionCompleted

↓

WorkflowCompleted
```

Seluruh Event memiliki Correlation ID yang sama.

---

# 10. Object Relationship

```text
Agent

↓

Workflow

↓

Execution

↓

Runtime

↓

Result
```

Memory dan Event mendukung seluruh proses tersebut.

---

# 11. Example Composition

Contoh Composition.

```text
Composition

Agent:
    News Summarizer

Input:
    Article

Output:
    Summary
```

Composition menjadi titik masuk Execution.

---

# 12. Example Input

```text
Article

"MMOS version 1.0 officially released..."
```

---

# 13. Example Output

```text
Summary

"MMOS v1.0 introduces a modular multi-engine architecture
focused on orchestration, extensibility, and provider independence."
```

Output di atas hanya ilustrasi.

---

# 14. Execution Sequence

```text
Client

↓

API Gateway

↓

Orchestrator

↓

Workflow Engine

↓

Execution Engine

↓

Memory Engine

↓

Runtime Engine

↓

Execution Engine

↓

Workflow Engine

↓

Client
```

Seluruh koordinasi dilakukan oleh Orchestrator.

---

# 15. State Transition

Execution mengikuti State Machine.

```text
Created

↓

Queued

↓

Running

↓

Completed
```

Runtime mengikuti State Machine tersendiri.

---

# 16. Error Scenario

Jika Runtime gagal.

```text
Runtime

↓

Failed

↓

Retry

↓

Completed
```

Retry mengikuti Runtime Policy.

---

# 17. Scaling

Banyak Execution dapat berjalan bersamaan.

```text
Execution-1

Execution-2

Execution-3

Execution-4
```

Setiap Execution bersifat independen.

---

# 18. Observability

Execution menghasilkan:

- Logs
- Metrics
- Events
- Audit Trail

Monitoring tidak memengaruhi Workflow.

---

# 19. Design Principles

Contoh ini menunjukkan prinsip MMOS:

- Agent bersifat deklaratif.
- Workflow mengatur urutan pekerjaan.
- Execution mengelola proses.
- Runtime menjalankan AI.
- Memory menyediakan Context.
- Event mencatat perubahan.
- Orchestrator hanya mengoordinasikan.

---

# 20. Related Documents

- MAS-600 Agent Architecture
- IMS-200 Agent Specification
- execution-state.md
- runtime-overview.md
- agent-execution.md
- workflow-execution.md

---

# END