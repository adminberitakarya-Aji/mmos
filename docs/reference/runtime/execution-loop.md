# Execution Loop

**Version:** MMOS v1.0  
**Category:** Runtime Reference  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan **Execution Loop**, yaitu mekanisme Runtime yang mengelola siklus hidup (**lifecycle**) sebuah **Execution** dari awal hingga selesai.

Execution Loop memastikan setiap Workflow dijalankan secara terstruktur, deterministik, dan sesuai dengan Object Model MMOS.

Execution Loop bekerja di dalam **System Loop** dan menggunakan **Scheduler Loop** untuk menentukan Task berikutnya.

---

# Responsibilities

Execution Loop bertanggung jawab untuk:

- memulai Execution;
- mengevaluasi Workflow;
- menjalankan Task sesuai urutan;
- mengelola perubahan State;
- mengoordinasikan Engine melalui Orchestrator;
- memperbarui Memory;
- menghasilkan Event;
- mendeteksi penyelesaian Execution.

Execution Loop tidak bertanggung jawab terhadap:

- scheduling global;
- reasoning AI;
- implementasi Capability;
- penyimpanan Memory.

---

# Design Goals

Execution Loop dirancang agar:

- deterministic;
- repeatable;
- observable;
- event-driven;
- stateless;
- provider agnostic.

---

# High-Level Flow

```
Create Execution

↓

Initialize Context

↓

Evaluate Workflow

↓

Select Ready Task

↓

Execute Task

↓

Collect Result

↓

Update State

↓

Update Memory

↓

Publish Event

↓

Completed?

      │

      ├── No

      │

      └─────────────┐
                    │
                    ▼

             Next Task

      │

      └── Yes

            ↓

Finalize Execution
```

---

# Execution Lifecycle

```
Created

↓

Initialized

↓

Running

↓

Waiting

↓

Running

↓

Completed
```

Apabila terjadi kegagalan.

```
Running

↓

Failed

↓

Retry

↓

Running

↓

Completed
```

atau

```
Running

↓

Cancelled
```

---

# Execution Position

Execution Loop berada di antara Scheduler dan Engine.

```
System Loop

↓

Scheduler Loop

↓

Execution Loop

↓

Orchestrator

↓

Engine
```

---

# Initialization

Saat Execution dibuat.

```
Execution

↓

Load Workflow

↓

Load Composition

↓

Initialize Context

↓

Ready
```

Execution belum menjalankan Task pada tahap ini.

---

# Context Preparation

Sebelum Task pertama dijalankan.

```
Execution Context

↓

Workflow

↓

Parameters

↓

Memory Context

↓

Execution Ready
```

Context digunakan selama seluruh Execution berlangsung.

---

# Task Evaluation

Execution Loop mengevaluasi Workflow.

```
Workflow

↓

Available Tasks

↓

Dependency Check

↓

Ready Tasks
```

Task yang belum memenuhi dependency akan tetap berada pada status **Waiting**.

---

# Task Execution

Task dijalankan melalui Orchestrator.

```
Execution

↓

Task

↓

Orchestrator

↓

Engine

↓

Result
```

Execution Loop tidak pernah memanggil Engine secara langsung.

---

# Result Collection

Setelah Engine selesai.

```
Engine Result

↓

Validate

↓

Normalize

↓

Update Execution
```

Result menjadi bagian dari Context Execution.

---

# State Transition

Setiap Task mengubah State Execution.

```
Running

↓

Task Finished

↓

Evaluate

↓

Continue
```

atau

```
Running

↓

Workflow Complete

↓

Completed
```

---

# Memory Synchronization

Setelah Task selesai.

```
Read Context

↓

Merge Result

↓

Write Memory

↓

Continue
```

Memory selalu diperbarui setelah perubahan Context.

---

# Event Publication

Setiap perubahan penting menghasilkan Event.

```
Task Started

↓

Task Completed

↓

Memory Updated

↓

Execution Updated

↓

Execution Completed
```

Event dipublikasikan melalui Event Engine.

---

# Decision Point

Setelah setiap Task.

```
Remaining Tasks?

      │

      ├── Yes

      │

      └── Continue

      │

      └── No

             ↓

Complete Execution
```

---

# Parallel Tasks

Execution dapat memiliki beberapa Task paralel.

```
Task A

├── Task B

├── Task C

└── Task D
```

Seluruh Task harus memenuhi dependency sebelum dijalankan.

---

# Retry Flow

Apabila Task gagal.

```
Task Failed

↓

Retry Policy

↓

Retry?

      │

      ├── Yes

      │

      └── Execute Again

      │

      └── No

             ↓

Execution Failed
```

Retry Policy ditentukan oleh Runtime.

---

# Cancellation

Execution dapat dihentikan.

```
Running

↓

Cancel Request

↓

Stop Dispatch

↓

Complete Active Task

↓

Cancelled
```

Cancellation tidak menghapus Event maupun Memory yang telah tersimpan.

---

# Completion

Execution selesai apabila:

- seluruh Task selesai;
- tidak ada Task yang tersisa;
- seluruh dependency telah terpenuhi;
- Workflow mencapai terminal state.

```
Workflow Complete

↓

Finalize

↓

Publish Event

↓

Completed
```

---

# Failure Handling

Apabila terjadi kesalahan.

```
Task Failed

↓

Execution State Updated

↓

Failure Event

↓

Retry / Abort
```

Failure tidak menghentikan Runtime.

---

# Relationship with Other Loops

```
System Loop

↓

Scheduler Loop

↓

Execution Loop

↓

Agent Loop

↓

Engine
```

Execution Loop menjadi penghubung antara keputusan Scheduler dan pelaksanaan Task oleh Engine.

---

# Design Principles

## Workflow Driven

Execution selalu mengikuti definisi Workflow.

---

## Stateless Runtime

State permanen disimpan di luar Runtime.

---

## Event Driven

Seluruh perubahan dipublikasikan sebagai Event.

---

## Deterministic

Workflow yang sama menghasilkan urutan eksekusi yang sama.

---

## Observable

Seluruh perubahan dapat ditelusuri melalui Event dan State.

---

## Provider Agnostic

Execution tidak bergantung pada AI provider maupun implementasi Engine.

---

# Related Documents

- `docs/reference/runtime/system-loop.md`
- `docs/reference/runtime/scheduler-loop.md`
- `docs/reference/runtime/agent-loop.md`
- `docs/architecture/MAS-200-execution-model.md`
- `docs/architecture/MAS-400-orchestrator.md`
- `docs/reference/state-machine/execution-state.md`
- `docs/reference/state-machine/task-state.md`
- `specs/ims/IMS-400-execution-specification.md`