# MMOS v1.0 — Example: Workflow Sample

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini memberikan contoh lengkap bagaimana sebuah Workflow
didefinisikan dan dijalankan di dalam MMOS.

Tujuannya adalah memperlihatkan hubungan antara:

- Composition
- Workflow
- Task
- Agent
- Execution
- Runtime
- Capability
- Memory
- Event

Contoh ini bersifat konseptual dan tidak bergantung pada bahasa
pemrograman maupun Workflow Engine tertentu.

---

# 2. Scenario

Sebuah perusahaan ingin menghasilkan artikel berita lengkap dari
informasi mentah.

Workflow harus melakukan:

1. Mengumpulkan informasi
2. Memverifikasi fakta
3. Menulis artikel
4. Membuat gambar
5. Review manusia
6. Publikasi

---

# 3. Workflow Overview

```text
Start

↓

Collect Information

↓

Fact Checking

↓

Write Article

↓

Generate Image

↓

Human Review

↓

Publish

↓

End
```

Workflow mendefinisikan urutan pekerjaan.

Workflow tidak menjalankan pekerjaan secara langsung.

---

# 4. Composition

Workflow merupakan bagian dari sebuah Composition.

```text
Composition

Project

News Production

Workflow

News Workflow

Input

Topic

Output

Published Article
```

Composition menjadi root object.

---

# 5. Workflow Definition

Workflow terdiri dari beberapa Task.

```text
Workflow

├── Collect Information
├── Fact Checking
├── Write Article
├── Generate Image
├── Human Review
└── Publish
```

Setiap Task bersifat independen.

---

# 6. Task Mapping

| Task | Assigned Agent |
|---------|----------------|
| Collect Information | Research Agent |
| Fact Checking | Fact Checker Agent |
| Write Article | Writer Agent |
| Generate Image | Image Agent |
| Human Review | Human Reviewer |
| Publish | Publisher Agent |

Workflow hanya mengetahui Task.

Agent dipilih sesuai konfigurasi.

---

# 7. Execution Flow

```text
Workflow

↓

Execution

↓

Task-1

↓

Task-2

↓

Task-3

↓

Task-4

↓

Task-5

↓

Task-6

↓

Completed
```

Execution mengelola lifecycle seluruh Task.

---

# 8. Runtime Usage

Task AI dijalankan oleh Runtime.

```text
Writer Agent

↓

Runtime Engine

↓

LLM Provider

↓

Generated Article
```

Runtime tidak mengetahui Workflow.

---

# 9. Capability Usage

Beberapa Task membutuhkan layanan eksternal.

```text
Research Agent

↓

Capability Engine

↓

Search API
```

```text
Publisher Agent

↓

Capability Engine

↓

CMS
```

Capability selalu diakses melalui Capability Engine.

---

# 10. Memory Usage

Workflow menggunakan Memory sepanjang proses.

```text
Execution

↓

Memory Engine

↓

Workspace Context

↓

Execution
```

Memory dapat berisi:

- Topic
- Draft
- References
- Review Notes
- Metadata

---

# 11. Event Flow

Workflow menghasilkan Event.

```text
WorkflowStarted

↓

TaskStarted

↓

TaskCompleted

↓

TaskStarted

↓

TaskCompleted

↓

WorkflowCompleted
```

Seluruh Event menggunakan Correlation ID yang sama.

---

# 12. Sequential Workflow

Contoh Workflow linear.

```text
Task A

↓

Task B

↓

Task C

↓

Task D
```

Task berikutnya dimulai setelah Task sebelumnya selesai.

---

# 13. Parallel Workflow

Workflow dapat menjalankan Task secara paralel.

```text
          Workflow

        /          \

Write Article    Generate Image

        \          /

        Human Review
```

Workflow menunggu seluruh Task paralel selesai sebelum melanjutkan.

---

# 14. Conditional Workflow

Workflow dapat memiliki percabangan.

```text
Fact Checking

↓

Verified?

↓

Yes ----------→ Continue

↓

No

↓

Revise Draft
```

Percabangan ditentukan oleh Workflow Definition.

---

# 15. Retry Behaviour

Jika Task gagal.

```text
Task

↓

Failed

↓

Retry

↓

Completed
```

Retry mengikuti Workflow Policy.

---

# 16. Human Approval

Workflow dapat berhenti sementara.

```text
Generate Article

↓

Human Review

↓

Approved?

↓

Yes

↓

Publish
```

Human Review merupakan bagian dari Workflow.

---

# 17. Workflow Completion

Workflow selesai apabila:

- seluruh Task selesai
- tidak ada Error yang belum ditangani
- seluruh Event telah dipublikasikan

Status menjadi:

```text
Completed
```

---

# 18. Failure Scenario

Contoh.

```text
Generate Image

↓

Runtime Failure

↓

Retry

↓

Success

↓

Continue Workflow
```

Jika Retry gagal, Workflow mengikuti Failure Policy.

---

# 19. Monitoring

Workflow menghasilkan:

- Workflow Metrics
- Task Metrics
- Runtime Metrics
- Capability Metrics
- Event Metrics

Monitoring dilakukan secara independen oleh Monitoring Engine.

---

# 20. Audit Trail

Audit mencatat:

- Workflow Started
- Task Assignment
- Runtime Call
- Capability Call
- Human Approval
- Workflow Completed

Audit tidak memengaruhi Execution.

---

# 21. Object Relationship

```text
Composition

↓

Workflow

↓

Execution

↓

Task

↓

Agent

↓

Runtime

↓

Capability

↓

Result
```

Memory dan Event mendukung seluruh proses.

---

# 22. State Transition

Workflow mengikuti State Machine.

```text
Created

↓

Ready

↓

Running

↓

Completed
```

Task, Execution, Runtime, dan Capability memiliki State Machine masing-masing.

---

# 23. Design Principles

Contoh ini menunjukkan prinsip MMOS:

- Workflow bersifat deklaratif.
- Task merupakan unit pekerjaan.
- Agent hanya menjalankan Task.
- Runtime menjalankan AI.
- Capability mengakses layanan eksternal.
- Memory menyediakan Context.
- Event mencatat perubahan.
- Orchestrator hanya melakukan koordinasi.

---

# 24. Comparison

| Aspect | Simple Agent | Multi-Agent | Workflow Sample |
|----------|--------------|-------------|-----------------|
| Workflow | Minimal | Ya | Lengkap |
| Task | 1 | Beberapa | Lengkap |
| Parallel Task | Tidak | Ya | Ya |
| Conditional Flow | Tidak | Opsional | Ya |
| Human Approval | Tidak | Opsional | Ya |
| Capability | Minimal | Ya | Ya |
| Memory | Dasar | Shared | Shared + Workflow Context |
| Event | Dasar | Ya | Lengkap |

---

# 25. Related Documents

- simple-agent.md
- multi-agent.md
- workflow-execution.md
- agent-execution.md
- execution-state.md
- workflow-state.md
- memory-read.md
- memory-write.md
- event-flow.md
- MAS-400 Orchestrator
- MAS-600 Agent Architecture

---

# END