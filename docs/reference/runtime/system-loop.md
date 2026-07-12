# System Loop

**Version:** MMOS v1.0  
**Category:** Runtime Reference  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan **System Loop**, yaitu mekanisme utama yang menjalankan MMOS Runtime.

System Loop merupakan "heartbeat" dari MMOS. Selama Runtime aktif, loop ini terus berjalan untuk:

- menerima Execution,
- mengevaluasi kondisi sistem,
- memilih pekerjaan berikutnya,
- mengoordinasikan Engine,
- memperbarui State,
- mengelola Memory,
- mempublikasikan Event,
- dan menentukan kapan sebuah Execution selesai.

System Loop bukan Workflow.

System Loop bukan Agent.

System Loop merupakan mekanisme internal Runtime.

---

# Design Goals

System Loop dirancang untuk:

- menjaga Runtime tetap aktif;
- mengoordinasikan seluruh Engine;
- menjalankan Execution secara bertahap;
- memproses Event;
- mengelola perubahan State;
- memperbarui Memory;
- mendukung eksekusi paralel;
- tetap bersifat stateless.

---

# Scope

System Loop bertanggung jawab terhadap:

- Execution Scheduling
- State Evaluation
- Task Dispatching
- Event Processing
- Memory Synchronization
- Runtime Coordination
- Completion Detection

System Loop **tidak** melakukan:

- reasoning AI;
- menjalankan Capability;
- menjalankan Plugin;
- menyimpan Memory;
- menghasilkan konten.

Seluruh pekerjaan tersebut didelegasikan kepada Engine yang sesuai.

---

# High-Level Loop

```
Runtime Start

↓

Load Pending Executions

↓

Select Execution

↓

Evaluate State

↓

Select Next Task

↓

Dispatch Task

↓

Wait Result

↓

Update State

↓

Update Memory

↓

Publish Events

↓

Execution Finished?

      │

      ├── No

      │

      └───────────────┐
                      │
                      ▼

                Next Iteration

      │

      └── Yes

            ↓

      Finalize Execution

            ↓

Continue Runtime
```

---

# Runtime Heartbeat

Runtime terus mengulang siklus berikut.

```
Observe

↓

Decide

↓

Dispatch

↓

Collect

↓

Update

↓

Repeat
```

Selama Runtime hidup, heartbeat tidak berhenti.

---

# Core Loop

Secara konseptual, Runtime bekerja seperti berikut.

```
while(runtime.isRunning){

    processExecutions()

}
```

Runtime tidak pernah berhenti setelah satu Workflow selesai.

Runtime berhenti hanya ketika Runtime dihentikan.

---

# Execution Cycle

Setiap Execution diproses melalui beberapa tahap.

```
Pending

↓

Ready

↓

Running

↓

Waiting

↓

Running

↓

Completed
```

Perubahan status mengikuti Execution State Machine.

---

# Iteration Steps

Setiap iterasi Runtime terdiri dari langkah berikut.

```
1.

Read Events

↓

2.

Update Runtime State

↓

3.

Select Execution

↓

4.

Evaluate Workflow

↓

5.

Select Task

↓

6.

Dispatch Engine

↓

7.

Collect Result

↓

8.

Update Memory

↓

9.

Publish Event

↓

10.

Repeat
```

---

# Event Processing

Setiap iterasi Runtime selalu memproses Event.

```
Incoming Events

↓

Filter

↓

Dispatch

↓

Subscribers

↓

Processed
```

Event tidak mengontrol Runtime.

Event hanya menjadi sinyal perubahan.

---

# State Evaluation

Runtime mengevaluasi kondisi object.

```
Execution

↓

Workflow

↓

Task

↓

Capability

↓

Runtime
```

Keputusan berikutnya selalu berdasarkan state terbaru.

---

# Memory Synchronization

Memory diproses pada setiap iterasi.

```
Read Context

↓

Execution

↓

Write Memory

↓

Index

↓

Available
```

Runtime tidak menyimpan Memory secara langsung.

Memory Engine bertanggung jawab terhadap penyimpanan.

---

# Task Dispatch

Runtime memilih Task berikutnya.

```
Workflow

↓

Ready Task

↓

Capability Check

↓

Engine Selection

↓

Dispatch
```

Dispatch selalu dilakukan melalui Orchestrator.

---

# Engine Coordination

Runtime hanya mengoordinasikan Engine.

```
Runtime

│

├── AI Engine

├── Memory Engine

├── Tool Engine

├── Event Engine

└── Plugin Engine
```

Runtime tidak menjalankan pekerjaan Engine.

---

# Completion Detection

Setelah setiap iterasi Runtime memeriksa:

```
Remaining Tasks?

      │

      ├── Yes

      │

      └───────► Continue

      │

      └── No

             ↓

Complete Execution
```

---

# Parallel Executions

Runtime dapat menangani beberapa Execution.

```
Runtime

├── Execution A

├── Execution B

├── Execution C

└── Execution D
```

Setiap Execution diproses secara independen.

---

# Failure Handling

Jika terjadi kegagalan.

```
Task Failed

↓

Retry Policy

↓

Success?

    │

    ├── Yes

    │

    └── Continue

    │

    └── No

          ↓

Failure Event

↓

Execution State Updated
```

---

# Runtime Shutdown

Saat Runtime dihentikan.

```
Stop Accepting New Executions

↓

Finish Active Iteration

↓

Flush Events

↓

Persist Required State

↓

Shutdown
```

Runtime harus berhenti secara terkontrol.

---

# Design Principles

## Event Driven

Loop bereaksi terhadap perubahan Event.

---

## Stateless Runtime

State permanen berada di luar Runtime.

---

## Engine Separation

Runtime hanya mengoordinasikan.

Engine melakukan pekerjaan.

---

## Deterministic

State yang sama menghasilkan keputusan Runtime yang sama.

---

## Non Blocking

Runtime tidak boleh berhenti karena satu Execution.

---

## Extensible

Loop dapat diperluas melalui Engine tambahan tanpa mengubah arsitektur inti.

---

# Relationship with Other Components

```
System Loop

↓

Execution

↓

Workflow

↓

Task

↓

Capability

↓

Engine

↓

Memory

↓

Events
```

System Loop menjadi mekanisme yang menghubungkan seluruh komponen Runtime MMOS.

---

# Related Documents

- `docs/architecture/MAS-400-orchestrator.md`
- `docs/architecture/MAS-700-ai-runtime.md`
- `docs/reference/sequence/runtime-call.md`
- `docs/reference/state-machine/runtime-state.md`
- `docs/reference/state-machine/execution-state.md`
- `docs/reference/sequence/event-flow.md`
- `docs/reference/sequence/memory-read.md`
- `docs/reference/sequence/memory-write.md`
- `specs/ims/IMS-400-execution-specification.md`