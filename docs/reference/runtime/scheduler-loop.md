# Scheduler Loop

**Version:** MMOS v1.0  
**Category:** Runtime Reference  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan **Scheduler Loop**, yaitu mekanisme Runtime yang bertanggung jawab memilih Execution dan Task berikutnya untuk dijalankan.

Scheduler merupakan bagian dari Runtime dan bekerja pada setiap iterasi **System Loop**.

Scheduler **tidak menjalankan pekerjaan**.

Scheduler hanya menentukan:

- apa yang dijalankan,
- kapan dijalankan,
- oleh Engine mana dijalankan.

Eksekusi tetap dilakukan oleh Engine melalui Orchestrator.

---

# Responsibilities

Scheduler bertanggung jawab untuk:

- memilih Execution yang siap diproses;
- menentukan Task berikutnya;
- memeriksa dependency;
- memeriksa Resource Availability;
- memeriksa Capability Availability;
- menentukan prioritas;
- mengirim Task ke Orchestrator.

Scheduler tidak bertanggung jawab terhadap:

- reasoning AI;
- menjalankan Capability;
- mengakses Memory secara langsung;
- menghasilkan output.

---

# Design Goals

Scheduler dirancang agar:

- deterministic;
- scalable;
- provider agnostic;
- non-blocking;
- fair;
- extensible.

---

# High-Level Flow

```
Pending Executions

↓

Priority Evaluation

↓

Dependency Check

↓

Capability Check

↓

Resource Check

↓

Ready Queue

↓

Dispatch

↓

Next Iteration
```

---

# Scheduler Position

Scheduler berada di dalam Runtime.

```
Runtime

│

├── Scheduler

├── State Manager

├── Event Manager

├── Memory Coordinator

└── Orchestrator
```

Scheduler bekerja sama dengan komponen Runtime lainnya namun memiliki tanggung jawab tersendiri.

---

# Scheduler Cycle

Pada setiap iterasi Runtime.

```
Read Queue

↓

Select Execution

↓

Evaluate Workflow

↓

Select Ready Task

↓

Dispatch

↓

Repeat
```

---

# Scheduling Decision

Scheduler menjawab tiga pertanyaan utama.

```
What?

↓

When?

↓

Where?
```

Artinya:

- Task apa yang dijalankan.
- Kapan dijalankan.
- Engine mana yang akan menerima Task.

---

# Execution Selection

Scheduler memilih Execution.

```
Pending

↓

Ready

↓

Selected

↓

Running
```

Execution yang belum memenuhi syarat tetap berada pada antrean.

---

# Task Selection

Setelah Execution dipilih.

```
Workflow

↓

Ready Tasks

↓

Priority

↓

Selected Task
```

Hanya Task yang memenuhi seluruh dependency yang dapat dipilih.

---

# Dependency Evaluation

Scheduler memeriksa seluruh dependency.

```
Task

↓

Dependencies

↓

Satisfied?

      │

      ├── No

      │

      └── Wait

      │

      └── Yes

            ↓

Ready
```

---

# Capability Evaluation

Scheduler memastikan Capability tersedia.

```
Task

↓

Required Capability

↓

Capability Registry

↓

Available?
```

Task tidak dapat dijalankan apabila Capability belum tersedia.

---

# Resource Evaluation

Scheduler mengevaluasi Resource.

```
CPU

Memory

GPU

Workers

↓

Enough?

↓

Dispatch
```

Scheduler tidak melakukan alokasi Resource secara langsung.

---

# Priority Evaluation

Scheduler dapat menggunakan prioritas.

Contoh.

```
Critical

↓

High

↓

Normal

↓

Low
```

Prioritas hanya memengaruhi urutan pemilihan, bukan logika Workflow.

---

# Ready Queue

Task yang siap dijalankan ditempatkan pada Ready Queue.

```
Task A

Task B

Task C

↓

Scheduler

↓

Dispatch
```

Ready Queue bersifat dinamis.

---

# Dispatch

Setelah dipilih.

```
Scheduler

↓

Orchestrator

↓

Engine

↓

Execution
```

Scheduler tidak pernah memanggil Engine secara langsung.

---

# Waiting Tasks

Task yang belum dapat dijalankan.

```
Waiting

↓

Dependency

↓

Satisfied

↓

Ready Queue
```

Task akan dievaluasi kembali pada iterasi berikutnya.

---

# Retry Scheduling

Apabila terjadi kegagalan.

```
Task Failed

↓

Retry Policy

↓

Retry Queue

↓

Scheduler
```

Retry Policy dikelola oleh Runtime sesuai konfigurasi.

---

# Parallel Scheduling

Scheduler dapat memilih beberapa Task.

```
Execution

├── Task A

├── Task B

├── Task C

└── Task D
```

Task hanya dapat berjalan paralel apabila:

- dependency terpenuhi;
- Workflow mengizinkan;
- Resource tersedia.

---

# Scheduling Constraints

Scheduler harus memastikan:

- dependency terpenuhi;
- state valid;
- capability tersedia;
- resource mencukupi;
- execution masih aktif.

---

# Fair Scheduling

Scheduler harus menghindari starvation.

```
Execution A

Execution B

Execution C

↓

Fair Selection
```

Seluruh Execution memiliki kesempatan untuk diproses.

---

# Failure Handling

Jika Dispatch gagal.

```
Dispatch

↓

Failed

↓

Retry

↓

Event

↓

Next Iteration
```

Scheduler tidak menghentikan Runtime akibat satu kegagalan.

---

# Relationship with System Loop

```
System Loop

↓

Scheduler Loop

↓

Execution Selection

↓

Task Selection

↓

Dispatch

↓

System Loop
```

Scheduler merupakan salah satu tahap dalam setiap iterasi System Loop.

---

# Design Principles

## Deterministic

Input yang sama menghasilkan keputusan yang sama.

---

## Non-Blocking

Satu Task tidak boleh menghentikan Scheduler.

---

## Stateless

Scheduler tidak menyimpan state permanen.

---

## Fair

Setiap Execution diperlakukan secara adil.

---

## Scalable

Mendukung ribuan Execution secara bersamaan.

---

## Provider Agnostic

Scheduler tidak bergantung pada AI Provider maupun Engine tertentu.

---

# Related Documents

- `docs/reference/runtime/system-loop.md`
- `docs/architecture/MAS-400-orchestrator.md`
- `docs/architecture/MAS-700-ai-runtime.md`
- `docs/reference/sequence/workflow-execution.md`
- `docs/reference/sequence/runtime-call.md`
- `docs/reference/state-machine/execution-state.md`
- `docs/reference/state-machine/task-state.md`
- `specs/ims/IMS-400-execution-specification.md`
```