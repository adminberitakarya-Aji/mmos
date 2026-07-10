# MAS-400 — Orchestrator

Version: 1.0

---

# Purpose

MAS-400 mendefinisikan Orchestrator sebagai komponen yang mengoordinasikan seluruh proses eksekusi di MMOS.

Orchestrator memastikan Workflow dijalankan sesuai urutan, Engine menerima pekerjaan yang tepat, dan seluruh proses berlangsung secara deterministik.

Orchestrator **bukan** tempat implementasi logika bisnis maupun logika AI.

---

# Scope

MAS-400 mencakup:

- Orchestrator
- Workflow Execution
- Task Dispatching
- Event Handling
- Execution State
- Workflow Lifecycle

MAS-400 tidak mencakup:

- Business Object
- Engine Logic
- AI Runtime
- Memory
- Provider
- Infrastructure

---

# Definition

Orchestrator adalah komponen koordinasi yang menerjemahkan Workflow menjadi rangkaian eksekusi Engine.

Orchestrator hanya mengetahui:

- Workflow
- Stage
- Task
- Event
- Execution State

Orchestrator tidak mengetahui bagaimana sebuah pekerjaan dikerjakan.

---

# Design Principles

## Principle 1

Orchestrator Never Works.

Orchestrator tidak menjalankan domain logic.

---

## Principle 2

Workflow Driven.

Seluruh keputusan berasal dari Workflow.

Tidak ada hardcoded flow.

---

## Principle 3

Event Driven.

Seluruh transisi state dipicu oleh Event.

---

## Principle 4

Stateless Coordination.

Business State berada pada Business Object.

Execution State berada pada Workflow Execution.

Orchestrator tidak menyimpan state bisnis.

---

## Principle 5

Deterministic.

Workflow yang sama dengan input yang sama harus menghasilkan urutan eksekusi yang sama.

---

# Responsibilities

Orchestrator bertanggung jawab untuk:

- memulai Workflow
- membaca Stage
- memilih Task berikutnya
- mengirim Task ke Engine
- menunggu Event
- memperbarui Execution State
- menentukan transisi Workflow
- mengakhiri Workflow

---

# Non Responsibilities

Orchestrator tidak boleh:

- mengubah Composition
- mengubah Asset
- melakukan Rendering
- memilih AI Model
- memilih Provider
- membuat Prompt
- mengakses Storage secara langsung
- melakukan AI Inference
- menyimpan Business Object

Seluruh pekerjaan tersebut merupakan tanggung jawab Engine.

---

# Execution Flow

```
Workflow

↓

Stage

↓

Task

↓

Orchestrator

↓

Engine

↓

Business Object

↓

Event

↓

Orchestrator

↓

Next Task
```

---

# Workflow Lifecycle

```
Created

↓

Queued

↓

Running

↓

Waiting Event

↓

Running

↓

Completed
```

Jika terjadi kesalahan:

```
Running

↓

Failed

↓

Retry

↓

Running

atau

Cancelled
```

---

# Execution State

Setiap Workflow memiliki Execution State.

```
Pending

Running

Waiting

Completed

Failed

Cancelled
```

Execution State hanya menggambarkan kondisi eksekusi.

Execution State bukan Business State.

---

# Task Dispatch

Orchestrator menentukan Engine berdasarkan Capability yang diminta.

```
Task

↓

Capability

↓

Engine

↓

Execute
```

Contoh:

```
Generate Image

↓

Image Generation

↓

AI Engine
```

```
Render Video

↓

Rendering

↓

Render Engine
```

Workflow tidak mengetahui Engine.

Task tidak mengetahui Engine.

Engine dipilih oleh Orchestrator berdasarkan Capability Registry.

---

# Event Handling

Setelah Engine selesai bekerja, Engine menerbitkan Event.

```
Engine

↓

TaskCompleted
```

atau

```
Engine

↓

TaskFailed
```

Orchestrator kemudian menentukan langkah berikutnya.

---

# Event Flow

```
TaskStarted

↓

TaskCompleted

↓

StageCompleted

↓

WorkflowCompleted
```

atau

```
TaskStarted

↓

TaskFailed

↓

Retry

↓

TaskCompleted
```

---

# Retry Policy

Retry merupakan tanggung jawab Orchestrator.

Retry tidak dilakukan oleh Engine.

Retry dapat berdasarkan:

- jumlah maksimum percobaan
- jenis kesalahan
- kebijakan Workflow

---

# Timeout

Orchestrator bertanggung jawab mendeteksi Task yang melebihi batas waktu.

```
Running

↓

Timeout

↓

Retry

atau

Failed
```

Timeout tidak ditentukan oleh Engine.

---

# Parallel Execution

Workflow dapat menjalankan beberapa Task secara paralel apabila tidak memiliki dependency.

Contoh:

```
Generate Thumbnail

Generate Subtitle

Generate Transcript
```

Ketiga Task tersebut dapat dijalankan secara bersamaan.

Workflow akan melanjutkan ke Stage berikutnya setelah seluruh Task selesai.

---

# Sequential Execution

Apabila terdapat dependency, Task dijalankan secara berurutan.

```
Generate Script

↓

Generate Voice

↓

Generate Video

↓

Render
```

---

# Engine Communication

Komunikasi yang diperbolehkan:

```
Workflow

↓

Orchestrator

↓

Engine

↓

Business Object

↓

Event

↓

Orchestrator
```

Komunikasi yang dilarang:

```
Engine

↓

Engine
```

Engine tidak pernah memanggil Engine lain.

---

# Failure Handling

Apabila terjadi kegagalan:

```
Task Failed

↓

Publish Event

↓

Orchestrator

↓

Retry

atau

Abort Workflow
```

Engine hanya melaporkan kegagalan.

Keputusan selanjutnya selalu berada pada Orchestrator.

---

# Cancellation

Workflow dapat dihentikan kapan saja.

```
Running

↓

Cancel Requested

↓

Stop Dispatch

↓

Cancelled
```

Task yang sedang berjalan dapat diselesaikan atau dihentikan sesuai kebijakan Workflow.

---

# Scalability

Orchestrator dirancang agar:

- stateless
- horizontal scalable
- asynchronous
- event driven

Beberapa Orchestrator dapat berjalan secara bersamaan tanpa mengubah Business Model.

---

# Orchestrator Rules

## Rule 1

Tidak menjalankan domain logic.

---

## Rule 2

Tidak memanggil AI Provider.

---

## Rule 3

Tidak memilih Tool.

---

## Rule 4

Tidak mengetahui implementasi Engine.

---

## Rule 5

Seluruh keputusan berdasarkan Workflow.

---

## Rule 6

Seluruh komunikasi berdasarkan Event.

---

## Rule 7

Retry dilakukan oleh Orchestrator.

---

## Rule 8

Timeout dikelola oleh Orchestrator.

---

## Rule 9

Engine tidak saling berkomunikasi.

---

## Rule 10

Business State tidak disimpan oleh Orchestrator.

---

# Relationship with MAS-200

MAS-200 mendefinisikan proses.

MAS-400 menjalankan proses tersebut.

```
Workflow

↓

Stage

↓

Task

↓

Orchestrator

↓

Engine
```

---

# Relationship with MAS-300

MAS-300 menyediakan Engine.

MAS-400 mengoordinasikan Engine.

```
Orchestrator

↓

AI Engine

↓

Render Engine

↓

Composition Engine
```

Engine tetap independen.

---

# Out of Scope

MAS-400 tidak membahas:

- AI Model
- Provider
- Memory
- Prompt
- Rendering
- Business Object
- Authentication
- Infrastructure

---

# Related Documents

- README.md
- 000-overview.md
- 010-constitution.md
- MAS-100-business-model.md
- MAS-200-execution-model.md
- MAS-300-engine-architecture.md
- event-catalog.md

---

# Summary

Orchestrator merupakan pusat koordinasi eksekusi MMOS.

Orchestrator tidak mengerjakan pekerjaan domain, tidak memilih AI Provider, dan tidak mengubah Business Object.

Seluruh logika bisnis berada pada Business Model, seluruh logika proses berada pada Execution Model, dan seluruh implementasi berada pada Engine.

Dengan pemisahan tersebut, Orchestrator tetap sederhana, deterministik, mudah diskalakan, dan konsisten dengan Constitution MMOS.