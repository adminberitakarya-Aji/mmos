# Agent Loop

**Version:** MMOS v1.0  
**Category:** Runtime Reference  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan **Agent Loop**, yaitu siklus kerja internal yang dilakukan oleh sebuah Agent ketika menerima sebuah Task.

Agent Loop merupakan mekanisme reasoning yang mengubah **Task** menjadi **Result** dengan memanfaatkan Context, Capability, Memory, dan Engine.

Agent Loop berjalan di dalam **Execution Loop** dan berakhir ketika Agent telah menghasilkan output atau menyatakan Task gagal.

---

# Responsibilities

Agent Loop bertanggung jawab untuk:

- menerima Task;
- memahami Objective;
- membangun Context;
- melakukan reasoning;
- memilih Capability;
- memanggil Engine melalui Orchestrator;
- mengevaluasi hasil;
- menghasilkan Output;
- memperbarui Memory bila diperlukan.

Agent Loop tidak bertanggung jawab terhadap:

- scheduling;
- workflow orchestration;
- execution management;
- runtime lifecycle;
- event routing.

---

# Design Goals

Agent Loop dirancang agar:

- deterministic;
- modular;
- observable;
- provider agnostic;
- extensible;
- reusable.

---

# High-Level Flow

```
Receive Task

↓

Load Context

↓

Understand Objective

↓

Reason

↓

Select Capability

↓

Execute

↓

Evaluate Result

↓

Satisfied?

      │

      ├── No

      │

      └───────────────┐
                      │
                      ▼

                 Reason Again

      │

      └── Yes

            ↓

Produce Output

↓

Update Memory

↓

Publish Event

↓

Done
```

---

# Agent Position

Agent berada di bawah Execution.

```
System Loop

↓

Scheduler Loop

↓

Execution Loop

↓

Agent Loop

↓

Capability

↓

Engine
```

---

# Task Reception

Agent menerima Task.

```
Execution

↓

Task

↓

Agent
```

Task berisi:

- Objective
- Input
- Context
- Constraints
- Expected Output

---

# Context Construction

Agent membangun Context.

```
Task Input

↓

Execution Context

↓

Memory Context

↓

Composition Context

↓

Agent Context
```

Context menjadi dasar seluruh proses reasoning.

---

# Objective Analysis

Agent memahami tujuan Task.

```
Objective

↓

Constraints

↓

Requirements

↓

Execution Plan
```

Agent tidak mengubah Objective.

---

# Reasoning

Agent melakukan reasoning.

```
Context

↓

Reason

↓

Decision

↓

Action Plan
```

Reasoning dapat melibatkan beberapa iterasi internal.

---

# Capability Selection

Agent memilih Capability.

```
Task

↓

Capability Registry

↓

Matching Capability

↓

Selected
```

Capability dipilih berdasarkan kontrak, bukan implementasi.

---

# Engine Invocation

Agent tidak memanggil Engine secara langsung.

```
Agent

↓

Orchestrator

↓

Engine

↓

Result
```

Hal ini menjaga pemisahan tanggung jawab sesuai arsitektur MMOS.

---

# Result Evaluation

Setelah Engine selesai.

```
Engine Result

↓

Evaluate

↓

Quality Check

↓

Accepted?
```

Jika hasil belum memenuhi kebutuhan, Agent dapat melakukan iterasi reasoning kembali.

---

# Internal Iteration

Agent dapat mengulang proses reasoning.

```
Reason

↓

Execute

↓

Evaluate

↓

Improve

↓

Reason Again
```

Jumlah iterasi ditentukan oleh kebijakan Runtime atau konfigurasi Agent.

---

# Output Generation

Jika hasil telah memenuhi tujuan.

```
Validated Result

↓

Normalize

↓

Artifact

↓

Output
```

Output dikembalikan kepada Execution Loop.

---

# Memory Update

Apabila diperlukan.

```
Output

↓

Memory Engine

↓

Store Context

↓

Ready
```

Agent tidak menyimpan Memory secara langsung.

---

# Event Publication

Perubahan penting menghasilkan Event.

```
Task Started

↓

Capability Invoked

↓

Capability Completed

↓

Output Produced

↓

Task Completed
```

Event dipublikasikan oleh Runtime.

---

# Failure Handling

Jika terjadi kegagalan.

```
Capability Failed

↓

Alternative?

      │

      ├── Yes

      │

      └── Retry

      │

      └── No

            ↓

Task Failed
```

Kegagalan Agent tidak menghentikan Runtime.

---

# Human-in-the-Loop

Apabila Task membutuhkan persetujuan manusia.

```
Reason

↓

Human Approval Required

↓

Wait

↓

Approved?

      │

      ├── Yes

      │

      └── Continue

      │

      └── No

            ↓

Cancelled
```

Agent memasuki status **Waiting** hingga keputusan diterima.

---

# Completion

Agent selesai apabila:

- Output berhasil dihasilkan;
- Task dinyatakan selesai;
- Task dibatalkan;
- Retry telah habis.

```
Task Complete

↓

Return Output

↓

Execution Loop
```

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

Capability Loop

↓

Engine
```

Agent Loop menjadi penghubung antara **Execution** dan **Capability**.

---

# Design Principles

## Goal Driven

Agent selalu bekerja untuk mencapai Objective Task.

---

## Context Aware

Keputusan Agent selalu didasarkan pada Context yang tersedia.

---

## Capability Based

Agent hanya menggunakan Capability yang terdaftar.

---

## Event Driven

Setiap perubahan penting menghasilkan Event.

---

## Stateless

State permanen disimpan pada Runtime dan Memory Engine, bukan pada Agent.

---

## Provider Agnostic

Agent tidak bergantung pada model AI, provider, maupun implementasi Engine tertentu.

---

# Related Documents

- `docs/reference/runtime/system-loop.md`
- `docs/reference/runtime/scheduler-loop.md`
- `docs/reference/runtime/execution-loop.md`
- `docs/reference/runtime/capability-loop.md`
- `docs/architecture/MAS-600-agent-architecture.md`
- `docs/architecture/MAS-400-orchestrator.md`
- `docs/reference/sequence/agent-execution.md`
- `docs/reference/state-machine/task-state.md`
- `specs/ims/IMS-200-agent-specification.md`