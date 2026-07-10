# IMS-400 Execution Specification

Version: 1.0

Status: Draft

Location:

specs/ims/IMS-400-execution-spec.md

---

# 1. Purpose

Dokumen ini mendefinisikan spesifikasi resmi Execution pada MMOS.

Execution merupakan representasi runtime dari sebuah Workflow yang sedang atau telah dijalankan.

Execution adalah Object yang dikelola oleh Execution Engine dan dikoordinasikan oleh Orchestrator.

Dokumen ini mendefinisikan bagaimana Workflow berubah menjadi Execution Instance yang dapat dijalankan oleh MMOS.

Execution tidak mendefinisikan Workflow.

Execution tidak mendefinisikan Capability.

Execution tidak mendefinisikan Agent.

Execution hanya merepresentasikan runtime state dari Workflow.

Dokumen ini melengkapi:

- IMS-100 Object Specification
- IMS-200 Agent Specification
- IMS-300 Workflow Specification

serta seluruh dokumen MAS Architecture.

---

# 2. Scope

Dokumen ini mencakup:

- Execution Object
- Execution Instance
- Execution Lifecycle
- Execution Context
- Execution State
- Node Execution
- Scheduler
- Dispatcher
- Queue
- Runtime Binding
- Resource Allocation
- Retry Execution
- Failure Recovery
- Compensation Execution
- Monitoring
- Execution Event

Implementasi internal Engine berada di luar ruang lingkup dokumen ini.

---

# 3. Execution Definition

Execution adalah runtime instance dari sebuah Workflow.

Setiap kali Workflow dijalankan, MMOS membuat sebuah Execution baru.

Execution memiliki identitas sendiri.

Workflow tetap immutable.

Execution bersifat mutable selama lifecycle berlangsung.

Execution menyimpan runtime state.

Workflow tidak menyimpan runtime state.

Contoh:

```
Workflow

Content Pipeline

↓

Execution #1001

Running

↓

Execution #1002

Completed

↓

Execution #1003

Queued
```

Ketiga Execution di atas berasal dari Workflow yang sama.

---

# 4. Design Principles

Execution mengikuti prinsip-prinsip dasar MMOS.

---

## 4.1 Runtime Object

Execution merupakan Runtime Object.

Execution hanya ada ketika Workflow dijalankan.

Execution tidak digunakan untuk mendefinisikan Workflow.

---

## 4.2 Workflow Separation

Workflow dan Execution harus dipisahkan secara tegas.

Workflow:

- immutable
- declarative
- versioned

Execution:

- mutable
- runtime
- stateful

Perubahan Execution tidak boleh mengubah Workflow.

---

## 4.3 Engine Managed

Execution sepenuhnya dikelola oleh Execution Engine.

Workflow tidak memiliki kendali terhadap Runtime State.

Engine bertanggung jawab terhadap:

- Scheduling
- Dispatching
- Retry
- Timeout
- State Transition
- Monitoring

---

## 4.4 Orchestrator Coordinates

Execution tidak memilih Agent.

Execution tidak memilih Runtime.

Execution meminta Capability.

Orchestrator melakukan koordinasi untuk menentukan:

- Agent
- Runtime
- Resource

Execution hanya menerima hasil koordinasi tersebut.

---

## 4.5 Event Driven

Seluruh perubahan Execution menghasilkan Event.

Minimal:

- ExecutionCreated
- ExecutionQueued
- ExecutionStarted
- ExecutionPaused
- ExecutionResumed
- ExecutionCompleted
- ExecutionFailed
- ExecutionCancelled

Seluruh Event mengikuti Event Catalog resmi MMOS.

---

## 4.6 Contract First

Execution wajib mematuhi seluruh Contract yang telah didefinisikan oleh Workflow.

Execution tidak boleh:

- mengubah Input Contract
- mengubah Output Contract
- mengubah Capability
- mengubah Workflow Graph

---

# 5. Execution Object

Execution merupakan turunan dari Base Object sesuai IMS-100.

Execution memiliki metadata standar serta atribut runtime tambahan.

---

## 5.1 Execution Structure

| Field | Required | Description |
|--------|----------|-------------|
| executionId | Yes | Immutable Execution Identifier |
| workflowId | Yes | Source Workflow Identifier |
| workflowVersion | Yes | Workflow Version |
| status | Yes | Execution Status |
| state | Yes | Current Runtime State |
| context | Yes | Execution Context |
| input | Yes | Runtime Input |
| output | No | Runtime Output |
| startedAt | No | Start Time |
| completedAt | No | Completion Time |
| duration | No | Execution Duration |
| parentExecution | No | Parent Execution Reference |
| metadata | No | Additional Metadata |

---

## 5.2 Execution Identity

Execution Identifier harus unik secara global.

Contoh:

```
execution-2c81ef92

execution-6d145bd1

execution-0fa34be8
```

Identifier tidak boleh berubah selama Execution berlangsung.

---

## 5.3 Relationship

Execution selalu berasal dari satu Workflow.

```
Workflow

↓

Execution
```

Satu Workflow dapat memiliki banyak Execution.

```
Workflow

↓

Execution-1

Execution-2

Execution-3

Execution-4
```

Execution tidak dapat berpindah ke Workflow lain.

---

# 6. Execution Responsibilities

Execution bertanggung jawab terhadap:

- menyimpan Runtime State
- menyimpan Runtime Context
- menyimpan Node State
- menyimpan Runtime Output
- menyimpan Retry State
- menyimpan Timeout State
- menyimpan Correlation Information
- menyimpan Execution Metrics

Execution tidak bertanggung jawab terhadap:

- mendefinisikan Workflow
- memilih Agent
- memilih Runtime
- menyimpan Memory permanen
- mengubah Capability
- mengubah Workflow Graph

Seluruh keputusan tersebut berada pada komponen MMOS lainnya.

---

# 7. Execution Instance

Execution Instance merupakan representasi nyata dari Workflow yang sedang berjalan.

Setiap permintaan eksekusi menghasilkan satu Execution Instance baru.

Execution Instance memiliki lifecycle sendiri.

Contoh:

```
Workflow

Content Pipeline

↓

Execution

ID-001

Running
```

Execution berikutnya menghasilkan Instance baru.

```
Workflow

Content Pipeline

↓

Execution

ID-002

Queued
```

Kedua Instance tidak saling berbagi Runtime State.

---

## 7.1 Instance Isolation

Setiap Execution harus terisolasi.

Execution tidak boleh:

- berbagi Runtime State
- berbagi Variable
- berbagi Retry Counter
- berbagi Timeout

Setiap Instance memiliki Context sendiri.

---

## 7.2 Instance Ownership

Execution dimiliki oleh Workflow yang membuatnya.

Hubungan tersebut bersifat permanen.

Execution tidak dapat dipindahkan ke Workflow lain.

---

## 7.3 Instance Lifetime

Execution dibuat ketika Engine menerima permintaan yang valid.

Execution berakhir ketika mencapai salah satu Terminal State:

- Completed
- Failed
- Cancelled

Setelah mencapai Terminal State, Execution tidak dapat diaktifkan kembali.

---

# 8. Execution Context

Execution Context menyimpan seluruh informasi runtime yang diperlukan selama Execution berlangsung.

Execution Context bukan bagian dari Workflow Definition.

Execution Context dibuat oleh Execution Engine.

---

## 8.1 Context Components

Execution Context minimal terdiri dari:

- executionId
- workflowId
- workflowVersion
- traceId
- correlationId
- tenantId
- requestId
- executionTime

Engine dapat menambahkan Context lain sesuai kebutuhan implementasi.

---

## 8.2 Context Lifetime

Execution Context berlaku selama Execution aktif.

Context dihancurkan setelah Execution selesai sesuai kebijakan penyimpanan Engine.

---

## 8.3 Context Isolation

Execution Context tidak boleh diakses langsung oleh Execution lain.

Komunikasi antar Execution hanya dapat dilakukan melalui mekanisme resmi MMOS, seperti:

- Event
- Service Contract
- Parent-Child Execution
- Workflow Contract

Engine wajib menjaga isolasi Context untuk menjamin keamanan dan konsistensi eksekusi.

---

# 9. Execution Lifecycle

Execution memiliki Lifecycle yang terpisah dari Workflow Lifecycle.

Workflow mendefinisikan struktur.

Execution merepresentasikan proses runtime.

Setiap Execution mengikuti Lifecycle yang sama, независимо dari jenis Workflow yang dijalankan.

---

## 9.1 Execution Lifecycle Overview

Execution mengikuti lifecycle berikut.

```
Created
    │
    ▼
Queued
    │
    ▼
Scheduling
    │
    ▼
Dispatching
    │
    ▼
Running
    │
    ├────────► Paused
    │             │
    │             ▼
    │          Running
    │
    ├────────► Completed
    │
    ├────────► Failed
    │
    └────────► Cancelled
```

State di atas merupakan lifecycle resmi Execution.

Engine tidak boleh menghilangkan makna dari state tersebut.

---

## 9.2 Created

Execution telah berhasil dibuat.

Pada tahap ini Engine telah:

- memvalidasi Workflow
- membuat Execution Identifier
- membuat Execution Context
- menyimpan Runtime Input

Belum ada Node yang dijalankan.

---

## 9.3 Queued

Execution menunggu Resource yang diperlukan.

Contoh:

- Worker
- Runtime
- Queue Slot
- Compute Resource

Execution dapat berada pada Queue selama diperlukan.

---

## 9.4 Scheduling

Execution sedang diproses oleh Scheduler.

Scheduler menentukan:

- prioritas
- resource
- waktu eksekusi
- dispatch target

Belum ada Node yang berjalan.

---

## 9.5 Dispatching

Execution sedang dikirim menuju Worker atau Execution Engine yang sesuai.

Dispatching merupakan tahap transisi.

State ini biasanya berlangsung singkat.

---

## 9.6 Running

Execution sedang berjalan.

Workflow Graph mulai dievaluasi.

Node dieksekusi sesuai Dependency dan Policy.

Execution dapat berpindah ke:

- Paused
- Completed
- Failed
- Cancelled

---

## 9.7 Paused

Execution dihentikan sementara.

Contoh penyebab:

- Human Approval
- Waiting Event
- Manual Pause
- Maintenance
- Resource Constraint

Execution dapat dilanjutkan kembali.

---

## 9.8 Completed

Execution selesai dengan sukses.

Seluruh Node wajib memenuhi:

- Contract
- Policy
- Dependency

Output Workflow telah tersedia.

---

## 9.9 Failed

Execution berhenti karena kegagalan yang tidak dapat dipulihkan.

Failure Strategy telah diterapkan.

Execution tidak dapat dilanjutkan.

---

## 9.10 Cancelled

Execution dihentikan sebelum selesai.

Cancellation dapat berasal dari:

- User
- API
- Parent Workflow
- Policy
- Engine

Compensation dapat dijalankan apabila Workflow mendefinisikannya.

---

# 10. Execution State Machine

Execution Engine wajib menggunakan State Machine yang deterministik.

State Machine menjamin seluruh Execution memiliki perilaku yang konsisten.

---

## 10.1 Valid State Transition

```
Created

↓

Queued

↓

Scheduling

↓

Dispatching

↓

Running

↓

Completed
```

---

## 10.2 Pause Transition

Execution dapat dipause.

```
Running

↓

Paused

↓

Running
```

Pause tidak mengubah Execution Identifier.

---

## 10.3 Failure Transition

```
Running

↓

Failed
```

Failure merupakan Terminal State.

---

## 10.4 Cancellation Transition

```
Running

↓

Cancelled
```

Cancellation merupakan Terminal State.

---

## 10.5 Invalid Transition

Contoh berikut tidak diperbolehkan.

```
Completed

↓

Running
```

```
Failed

↓

Running
```

```
Cancelled

↓

Queued
```

```
Created

↓

Completed
```

Engine wajib menolak transisi yang tidak valid.

---

# 11. Execution Context Model

Execution Context menyimpan seluruh informasi yang diperlukan selama Runtime.

Execution Context dibuat ketika Execution dibuat.

Workflow tidak memiliki akses langsung untuk mengubah Context.

---

## 11.1 Context Categories

Execution Context terdiri dari beberapa kategori.

### Identity

- executionId
- workflowId
- workflowVersion

---

### Correlation

- traceId
- correlationId
- parentExecutionId
- requestId

---

### Runtime

- runtimeId
- workerId
- queueName
- schedulerId

---

### Tenant

- tenantId
- namespace

---

### Timing

- createdAt
- startedAt
- completedAt

---

### Policy

- retryPolicy
- timeoutPolicy
- failurePolicy

---

## 11.2 Context Immutability

Sebagian Context bersifat immutable.

Contoh:

- executionId
- workflowId
- workflowVersion
- traceId

Nilai tersebut tidak boleh berubah.

---

## 11.3 Mutable Context

Sebagian Context dapat berubah.

Contoh:

- status
- runtimeId
- workerId
- retryCount
- currentNode
- progress

Perubahan dilakukan hanya oleh Execution Engine.

---

# 12. Execution Status

Execution memiliki Status yang menggambarkan kondisi saat ini.

Status berbeda dengan Workflow Status.

Workflow Status menggambarkan definisi Workflow.

Execution Status menggambarkan Runtime.

---

## 12.1 Standard Status

Execution menggunakan Status berikut.

- Created
- Queued
- Scheduling
- Dispatching
- Running
- Paused
- Completed
- Failed
- Cancelled

Status tambahan dapat digunakan oleh Engine selama tetap dapat dipetakan ke Status standar.

---

## 12.2 Terminal Status

Status berikut merupakan Terminal Status.

- Completed
- Failed
- Cancelled

Execution tidak dapat keluar dari Status tersebut.

---

## 12.3 Active Status

Status berikut dianggap aktif.

- Queued
- Scheduling
- Dispatching
- Running
- Paused

Execution masih berada di bawah pengelolaan Engine.

---

# 13. Execution Metadata

Execution dapat menyimpan Metadata tambahan.

Metadata tidak memengaruhi perilaku Workflow.

Metadata digunakan untuk kebutuhan operasional.

---

## 13.1 Labels

Execution dapat memiliki Label.

Contoh:

```
environment=production

priority=high

team=editorial
```

---

## 13.2 Annotations

Execution dapat memiliki Annotation.

Contoh:

- operator
- deployment
- release
- notes

Annotation tidak memengaruhi Runtime.

---

## 13.3 Metrics Metadata

Execution dapat menyimpan informasi statistik.

Contoh:

- executionDuration
- queueDuration
- nodeCount
- retryCount
- timeoutCount

Metadata ini digunakan oleh Monitoring Engine.

---

# 14. Parent-Child Execution

Execution dapat membuat Execution lain melalui Sub Workflow.

Hubungan tersebut membentuk Parent-Child Execution.

---

## 14.1 Parent Execution

Execution yang memanggil Sub Workflow disebut Parent Execution.

Parent tetap bertanggung jawab terhadap Workflow utama.

---

## 14.2 Child Execution

Sub Workflow dijalankan sebagai Child Execution.

Child memiliki:

- Execution Identifier sendiri
- Runtime Context sendiri
- Lifecycle sendiri
- State sendiri

---

## 14.3 Parent Relationship

Execution Engine wajib menjaga hubungan berikut.

```
Execution A

↓

Execution B

↓

Execution C
```

Setiap Child harus mengetahui Parent Execution.

Parent juga harus mengetahui seluruh Child yang dibuat.

---

## 14.4 Execution Isolation

Walaupun memiliki hubungan Parent-Child,

Execution tetap harus:

- memiliki Runtime State sendiri
- memiliki Retry sendiri
- memiliki Timeout sendiri
- memiliki Queue sendiri
- memiliki Resource sendiri

Tidak diperbolehkan berbagi Runtime State antar Execution.

---

# 15. Scheduler

Scheduler merupakan komponen Execution Engine yang bertanggung jawab menentukan kapan dan bagaimana sebuah Execution dijalankan.

Scheduler tidak menjalankan Workflow.

Scheduler hanya membuat keputusan penjadwalan.

Eksekusi tetap dilakukan oleh Execution Engine.

---

## 15.1 Scheduler Responsibilities

Scheduler bertanggung jawab terhadap:

- menerima Execution baru
- mengevaluasi Policy
- menentukan prioritas
- memilih Queue
- mengalokasikan Resource awal
- meneruskan Execution ke Dispatcher

Scheduler tidak bertanggung jawab terhadap:

- menjalankan Node
- memilih Agent
- menjalankan Runtime
- mengevaluasi Workflow Graph

---

## 15.2 Scheduling Inputs

Scheduler menggunakan informasi berikut.

- Execution Context
- Workflow Policy
- Priority
- Resource Availability
- Queue Status
- Runtime Availability
- Tenant Policy

Seluruh keputusan dilakukan berdasarkan informasi tersebut.

---

## 15.3 Scheduling Outputs

Scheduler menghasilkan keputusan berupa:

- Queue Assignment
- Scheduling Time
- Execution Priority
- Dispatch Request

Keputusan tersebut diteruskan ke Dispatcher.

---

# 16. Scheduling Policies

Execution dapat dijadwalkan menggunakan berbagai kebijakan.

Workflow hanya mendeklarasikan Policy.

Scheduler mengimplementasikannya.

---

## 16.1 Immediate

Execution segera dijadwalkan.

```
Request

↓

Queue

↓

Dispatch
```

Merupakan kebijakan default.

---

## 16.2 Scheduled Time

Execution dijalankan pada waktu tertentu.

Contoh:

```
2026-07-15

09:00 UTC
```

Engine bertanggung jawab menjaga akurasi jadwal.

---

## 16.3 Delayed

Execution ditunda selama periode tertentu.

Contoh:

```
Delay

10 Minutes
```

Setelah waktu terpenuhi, Execution kembali masuk proses Scheduling.

---

## 16.4 Event Driven

Execution menunggu Event tertentu sebelum dijadwalkan.

Contoh:

```
payment.completed

↓

Scheduling
```

---

## 16.5 Dependency Driven

Execution hanya dapat dijadwalkan setelah Workflow atau Execution lain selesai.

Contoh:

```
Execution A

↓

Execution B
```

---

# 17. Queue Model

Queue digunakan untuk menampung Execution sebelum dijalankan.

Queue bersifat implementasi Engine.

Workflow tidak mengetahui Queue yang digunakan.

---

## 17.1 Queue Responsibilities

Queue bertanggung jawab terhadap:

- menyimpan Execution sementara
- menjaga urutan antrean
- menyediakan Execution untuk Dispatcher
- mendukung kontrol kapasitas

Queue tidak melakukan eksekusi.

---

## 17.2 Queue Structure

Secara konseptual Queue berisi:

```
Execution

Execution

Execution

Execution
```

Urutan Queue ditentukan oleh Scheduler.

---

## 17.3 Queue States

Execution dapat berada pada kondisi:

- Waiting
- Reserved
- Dispatched
- Expired

State Queue bersifat internal terhadap Execution Engine.

---

## 17.4 Queue Capacity

Engine dapat membatasi kapasitas Queue.

Ketika kapasitas tercapai, Engine dapat:

- menolak Execution baru
- menunda Scheduling
- mengalihkan ke Queue lain
- menerapkan kebijakan sesuai Policy

Workflow tidak menentukan perilaku tersebut.

---

# 18. Priority Model

Execution dapat memiliki Priority.

Priority membantu Scheduler menentukan urutan eksekusi.

Priority bukan jaminan urutan absolut.

---

## 18.1 Standard Priority

MMOS mendefinisikan tingkat prioritas berikut.

- Critical
- High
- Normal
- Low
- Background

Engine dapat menggunakan representasi internal lain selama dapat dipetakan ke tingkatan tersebut.

---

## 18.2 Priority Resolution

Priority dapat berasal dari:

- Workflow Policy
- API Request
- Tenant Policy
- System Policy

Apabila terjadi konflik, Engine menentukan prioritas akhir sesuai kebijakan implementasi.

---

## 18.3 Priority Aging

Engine dapat meningkatkan Priority Execution yang terlalu lama berada di Queue.

Tujuannya adalah mengurangi kemungkinan starvation.

Mekanisme peningkatan Priority merupakan tanggung jawab Scheduler.

---

# 19. Dispatcher

Dispatcher merupakan komponen yang mengirim Execution kepada Worker atau Execution Engine yang sesuai.

Dispatcher tidak mengevaluasi Workflow.

Dispatcher tidak memilih Capability.

Dispatcher hanya melakukan proses distribusi.

---

## 19.1 Dispatcher Responsibilities

Dispatcher bertanggung jawab terhadap:

- menerima Dispatch Request
- memilih Worker yang tersedia
- mengirim Execution
- mengonfirmasi Dispatch
- menangani kegagalan Dispatch

---

## 19.2 Dispatch Flow

Secara konseptual:

```
Scheduler

↓

Dispatcher

↓

Worker

↓

Execution Engine
```

Dispatcher tidak mengubah Execution Context.

---

## 19.3 Dispatch Validation

Sebelum Dispatch dilakukan, Engine minimal memverifikasi:

- Worker tersedia
- Queue valid
- Execution masih aktif
- Resource tersedia
- Runtime dapat digunakan

Execution yang tidak memenuhi syarat tetap berada di Queue atau dijadwalkan ulang.

---

# 20. Worker Model

Worker merupakan komponen yang menjalankan Execution atas nama Execution Engine.

Worker tidak memiliki Workflow.

Worker tidak memiliki Graph.

Worker menerima Execution yang telah dipersiapkan oleh Engine.

---

## 20.1 Worker Responsibilities

Worker bertanggung jawab terhadap:

- menerima Execution
- menjalankan Node
- melaporkan Status
- menghasilkan Output
- mengirim Event

Worker tidak menentukan:

- Workflow
- Capability
- Retry Policy
- Failure Strategy

---

## 20.2 Worker Registration

Worker harus terdaftar pada Execution Engine.

Informasi minimal meliputi:

- workerId
- capabilities
- runtime
- status
- capacity

Engine menggunakan informasi tersebut saat proses Dispatch.

---

## 20.3 Worker Availability

Worker dapat berada pada status:

- Available
- Busy
- Unavailable
- Maintenance

Dispatcher hanya boleh mengirim Execution kepada Worker yang memenuhi persyaratan.

---

## 20.4 Worker Failure

Apabila Worker gagal selama Execution berlangsung, Engine harus:

- mendeteksi kegagalan
- memperbarui Status Execution
- menerapkan Retry Policy apabila sesuai
- menerbitkan Event
- menjadwalkan ulang bila memungkinkan

Implementasi mekanisme deteksi kegagalan merupakan tanggung jawab Engine.

---

# 21. Dispatch Lifecycle

Dispatch memiliki lifecycle sendiri sebagai bagian dari Execution.

```
Queued

↓

Selected

↓

Reserved

↓

Dispatched

↓

Acknowledged

↓

Running
```

Setiap tahap harus dapat diaudit.

---

## 21.1 Selected

Execution dipilih dari Queue oleh Scheduler.

Belum ada Worker yang ditetapkan.

---

## 21.2 Reserved

Worker telah dipilih.

Resource sementara dicadangkan.

Execution belum dijalankan.

---

## 21.3 Dispatched

Execution telah dikirim ke Worker.

Engine menunggu konfirmasi penerimaan.

---

## 21.4 Acknowledged

Worker mengonfirmasi bahwa Execution telah diterima.

Execution siap memasuki tahap Running.

---

# 22. Scheduling Constraints

Agar Execution tetap konsisten dengan prinsip MMOS, Scheduler dan Dispatcher harus memenuhi batasan berikut.

Scheduler dan Dispatcher:

- MUST NOT mengubah Workflow Definition.
- MUST NOT mengubah Workflow Graph.
- MUST NOT mengubah Capability Contract.
- MUST NOT mengubah Input Contract.
- MUST NOT mengubah Output Contract.
- MUST NOT memilih Runtime secara langsung.
- MUST NOT memilih Agent secara langsung.

Scheduler dan Dispatcher hanya mengelola:

- waktu eksekusi
- antrean
- distribusi Execution
- alokasi Worker
- koordinasi operasional

Seluruh keputusan Capability tetap mengikuti prinsip:

- **Orchestrator Coordinates**
- **Engine Executes**
- **Capability Based**
- **Contract First**

---

# 23. Node Execution Model

Execution Engine menjalankan Workflow melalui eksekusi Node.

Node merupakan unit eksekusi terkecil selama Runtime.

Workflow tetap bersifat deklaratif.

Execution bertanggung jawab terhadap proses runtime setiap Node.

---

## 23.1 Execution Unit

Setiap Node menghasilkan satu Node Execution.

Contoh:

```
Workflow

Node A

↓

Node Execution A
```

Node Execution memiliki lifecycle sendiri.

Node Execution bukan Workflow.

---

## 23.2 Independent Execution

Setiap Node Execution bersifat independen.

Node Execution memiliki:

- Execution State
- Retry Counter
- Timeout
- Start Time
- End Time
- Runtime Assignment
- Worker Assignment

Perubahan pada satu Node Execution tidak boleh mengubah Node Execution lain.

---

## 23.3 Node Execution Context

Setiap Node Execution memiliki Context sendiri.

Minimal terdiri dari:

- executionId
- nodeId
- nodeExecutionId
- workflowId
- traceId
- retryCount
- timeout
- runtimeId
- workerId

Context tersebut dibuat oleh Execution Engine.

---

# 24. Node Execution Lifecycle

Node Execution mengikuti lifecycle berikut.

```
Pending

↓

Ready

↓

Assigned

↓

Running

↓

Completed
```

atau

```
Running

↓

Failed
```

atau

```
Running

↓

Cancelled
```

---

## 24.1 Pending

Dependency belum terpenuhi.

Node belum memenuhi syarat untuk dijalankan.

---

## 24.2 Ready

Seluruh dependency telah terpenuhi.

Node siap dipilih oleh Scheduler.

---

## 24.3 Assigned

Execution Engine telah menentukan:

- Worker
- Runtime
- Resource

Node belum mulai berjalan.

---

## 24.4 Running

Node sedang dieksekusi.

Capability sedang dijalankan.

Output belum tersedia.

---

## 24.5 Completed

Node berhasil selesai.

Output telah divalidasi.

Output dapat digunakan oleh Node berikutnya.

---

## 24.6 Failed

Node gagal.

Retry atau Failure Strategy akan dievaluasi.

---

## 24.7 Cancelled

Node dihentikan sebelum selesai.

Cancellation dapat dipicu oleh:

- Workflow Cancellation
- Timeout
- Manual Stop
- Parent Failure

---

# 25. Node Scheduling

Execution Engine menentukan urutan Node berdasarkan Workflow Graph.

Engine tidak boleh mengubah Graph.

---

## 25.1 Ready Queue

Node yang seluruh dependency-nya terpenuhi ditempatkan pada Ready Queue.

Contoh:

```
Pending

↓

Ready Queue

↓

Assignment
```

Ready Queue hanya berisi Node yang siap dijalankan.

---

## 25.2 Assignment

Execution Engine memilih:

- Worker
- Runtime
- Resource

berdasarkan hasil koordinasi Orchestrator.

Assignment dilakukan sebelum Node memasuki Running.

---

## 25.3 Execution Order

Apabila beberapa Node sama-sama Ready:

Execution Engine dapat:

- menjalankan seluruhnya secara paralel
- menjalankan sebagian
- menunda sebagian

sesuai Resource dan Policy.

---

# 26. Dependency Resolution

Dependency Resolution menentukan kapan sebuah Node dapat dijalankan.

Dependency berasal dari Workflow Graph.

Execution Engine tidak boleh membuat Dependency baru.

---

## 26.1 Dependency Evaluation

Execution Engine mengevaluasi:

- predecessor
- transition
- condition
- merge policy

Node hanya dapat dijalankan apabila seluruh persyaratan terpenuhi.

---

## 26.2 Single Dependency

```
A

↓

B
```

Node B hanya dapat dijalankan setelah A selesai.

---

## 26.3 Multiple Dependency

```
A

B

↓

C
```

Node C menunggu seluruh dependency sesuai Merge Policy.

---

## 26.4 Conditional Dependency

```
Condition

↓

YES → A

NO → B
```

Hanya jalur yang dipilih yang menjadi dependency aktif.

---

## 26.5 Dynamic Readiness

Readiness dihitung secara runtime.

Node dapat berubah:

```
Pending

↓

Ready
```

setelah dependency berubah status.

---

# 27. Capability Invocation

Execution Engine tidak menjalankan pekerjaan secara langsung.

Execution Engine meminta Capability melalui Orchestrator.

---

## 27.1 Invocation Flow

Secara konseptual:

```
Node Execution

↓

Capability

↓

Orchestrator

↓

Agent

↓

Runtime
```

Execution Engine tidak mengetahui implementasi Capability.

---

## 27.2 Invocation Request

Minimal informasi yang dikirim:

- executionId
- nodeExecutionId
- capability
- input
- context
- policy

Format rinci dijelaskan pada IMS-600 Capability Specification.

---

## 27.3 Invocation Result

Capability menghasilkan:

- success
- output
- metrics
- error

Execution Engine melakukan validasi terhadap Output sebelum melanjutkan Workflow.

---

# 28. Input Resolution

Sebelum Node dijalankan, seluruh Input harus berhasil di-resolve.

Execution Engine bertanggung jawab melakukan proses ini.

---

## 28.1 Input Sources

Input dapat berasal dari:

- Workflow Input
- Node Output
- Runtime Context
- Event
- Memory Capability
- Constant

Seluruh sumber harus sesuai Mapping pada Workflow.

---

## 28.2 Validation

Input harus divalidasi terhadap:

- data type
- required field
- schema
- constraint

Node tidak boleh dijalankan apabila Input tidak valid.

---

## 28.3 Resolution Failure

Apabila Input gagal di-resolve:

- Node tidak dijalankan
- Failure Strategy diterapkan
- Event dipublikasikan

---

# 29. Output Resolution

Setelah Node selesai, Output diproses oleh Execution Engine.

---

## 29.1 Output Validation

Output divalidasi terhadap Output Contract.

Validasi meliputi:

- schema
- type
- required field
- constraint

---

## 29.2 Output Publication

Output yang valid dipublikasikan ke Execution Context.

Output tersebut kemudian tersedia melalui Mapping bagi Node berikutnya.

---

## 29.3 Output Failure

Apabila Output tidak sesuai Contract:

- Node dianggap gagal
- Retry dievaluasi
- Failure Strategy diterapkan

---

# 30. Execution Progress

Execution Engine harus mampu menghitung Progress Execution.

Progress digunakan untuk Monitoring dan Observability.

---

## 30.1 Progress Calculation

Progress dapat dihitung berdasarkan:

- jumlah Node selesai
- bobot Node
- Execution Policy

Metode perhitungan merupakan tanggung jawab Engine.

---

## 30.2 Execution Summary

Execution Engine minimal menyimpan informasi berikut.

- totalNode
- completedNode
- runningNode
- failedNode
- pendingNode
- cancelledNode

Informasi ini diperbarui selama Execution berlangsung.

---

## 30.3 Completion Criteria

Execution dinyatakan selesai apabila:

- seluruh Node wajib telah selesai
- seluruh Contract terpenuhi
- seluruh Policy terpenuhi
- Workflow mencapai Exit Node

Baru setelah itu Execution dapat berpindah ke status **Completed**.

---

# 31. Node Execution Constraints

Execution Engine wajib menjaga konsistensi Node Execution.

Node Execution:

- MUST memiliki Node Execution Identifier.
- MUST mengikuti Workflow Graph.
- MUST mematuhi Dependency.
- MUST mematuhi Input Contract.
- MUST mematuhi Output Contract.
- MUST menghasilkan Event sesuai Event Catalog.

Node Execution:

- MUST NOT mengubah Workflow Definition.
- MUST NOT mengubah Capability.
- MUST NOT mengubah Workflow Graph.
- MUST NOT memilih Agent.
- MUST NOT memilih Runtime.

Seluruh keputusan koordinasi tetap mengikuti prinsip:

- **Orchestrator Coordinates**
- **Engine Executes**
- **Capability Based**
- **Contract First**

---

# 32. Parallel Execution Model

Execution Engine mendukung eksekusi beberapa Node secara bersamaan apabila Dependency telah terpenuhi.

Parallel Execution merupakan optimasi runtime.

Workflow tetap menggunakan Graph yang sama.

Execution Engine menentukan bagaimana pekerjaan didistribusikan.

---

## 32.1 Parallel Eligibility

Node dapat dijalankan secara paralel apabila:

- seluruh Dependency terpenuhi
- tidak memiliki konflik Resource
- tidak memiliki Constraint yang saling bertentangan
- memenuhi Execution Policy

Contoh:

```
             A
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
      B      C      D
```

Setelah Node A selesai, Node B, C, dan D dapat dijalankan secara bersamaan.

---

## 32.2 Parallel Context

Setiap Node Execution yang berjalan secara paralel memiliki:

- Node Execution Identifier
- Runtime Context
- Retry Counter
- Timeout
- Metrics

sendiri.

Node yang berjalan secara paralel tidak boleh berbagi Runtime State.

---

## 32.3 Parallel Isolation

Parallel Execution harus menjaga isolasi antar Node.

Node tidak boleh:

- mengubah Output Node lain
- mengubah Retry Counter Node lain
- mengubah Timeout Node lain
- mengakses Variable internal Node lain

Komunikasi hanya melalui Output Mapping yang telah didefinisikan.

---

# 33. Merge Execution

Merge Execution menggabungkan beberapa jalur paralel menjadi satu jalur eksekusi.

Merge dievaluasi oleh Execution Engine.

---

## 33.1 Merge Readiness

Merge Node menjadi Ready apabila Policy yang didefinisikan telah terpenuhi.

Contoh:

- All Completed
- Any Completed
- Majority Completed
- Custom Policy

Workflow menentukan Policy.

Execution Engine melakukan evaluasi.

---

## 33.2 Merge Context

Merge tidak mengubah Output dari Branch.

Merge hanya:

- melakukan sinkronisasi
- mengevaluasi Policy
- melanjutkan Execution

Output tetap mengikuti Mapping pada Workflow.

---

## 33.3 Merge Failure

Apabila salah satu Branch gagal, perilaku Merge mengikuti Failure Strategy.

Contoh:

```
Branch A

Completed

Branch B

Failed

↓

Continue
```

atau

```
↓

Workflow Failed
```

---

# 34. Loop Execution Model

Execution Engine mendukung pengulangan Node maupun Sub Workflow sesuai definisi Workflow.

Loop dievaluasi secara runtime.

---

## 34.1 Loop Context

Setiap iterasi memiliki Context sendiri.

Minimal terdiri dari:

- iteration
- executionId
- nodeExecutionId
- loopIndex

Iterasi tidak boleh saling berbagi Runtime State.

---

## 34.2 Collection Loop

Execution Engine membuat Node Execution baru untuk setiap elemen Collection.

Contoh:

```
Article 1

↓

Summarize

Article 2

↓

Summarize

Article 3

↓

Summarize
```

Setiap Node Execution diperlakukan secara independen.

---

## 34.3 Conditional Loop

Execution Engine mengevaluasi Condition sebelum setiap iterasi.

Loop dihentikan apabila:

- Condition bernilai false
- Maximum Iteration tercapai
- Failure Strategy menghentikan Workflow

---

## 34.4 Infinite Loop Protection

Execution Engine wajib mendeteksi Loop yang tidak dapat berhenti.

Minimal menggunakan:

- Maximum Iteration
- Maximum Duration
- Policy Constraint

Loop tanpa batas tidak boleh dijalankan tanpa mekanisme penghentian.

---

# 35. Retry Execution

Retry merupakan tanggung jawab Execution Engine.

Workflow hanya mendefinisikan Retry Policy.

---

## 35.1 Retry Lifecycle

```
Running

↓

Failed

↓

Retry Scheduled

↓

Running
```

Setiap Retry menghasilkan percobaan eksekusi baru terhadap Node yang sama.

---

## 35.2 Retry Context

Execution Engine menyimpan:

- retryCount
- retryReason
- retryTime
- retryDelay

Informasi tersebut menjadi bagian dari Runtime Context.

---

## 35.3 Retry Validation

Sebelum Retry dilakukan, Engine harus memastikan:

- Retry Policy masih berlaku
- Maximum Attempt belum tercapai
- Error termasuk Retryable Failure
- Resource tersedia

Apabila salah satu syarat tidak terpenuhi, Retry tidak dilakukan.

---

## 35.4 Retry Completion

Retry berakhir apabila:

- Node berhasil
- Maximum Attempt tercapai
- Workflow dibatalkan
- Failure Strategy menghentikan Retry

---

# 36. Timeout Execution

Execution Engine bertanggung jawab mengawasi seluruh Timeout.

Timeout berlaku terhadap:

- Workflow
- Node
- Human Task
- Event Waiting
- Sub Workflow

---

## 36.1 Timeout Monitoring

Execution Engine harus memantau waktu secara terus-menerus selama Execution berlangsung.

Apabila batas waktu tercapai, Engine harus segera mengevaluasi Timeout Policy.

---

## 36.2 Workflow Timeout

Workflow Timeout berlaku terhadap keseluruhan Execution.

Apabila terlampaui:

- Workflow dihentikan
- Failure Strategy diterapkan
- Event dipublikasikan

---

## 36.3 Node Timeout

Node Timeout hanya berlaku terhadap Node tersebut.

Node lain tidak otomatis dihentikan kecuali ditentukan oleh Failure Strategy.

---

## 36.4 Timeout Event

Timeout harus menghasilkan Event.

Minimal:

- WorkflowTimeout
- NodeTimeout

Event mengikuti Event Catalog resmi MMOS.

---

# 37. Waiting Execution

Execution dapat berada pada kondisi menunggu.

Waiting bukan kegagalan.

Waiting merupakan bagian normal dari Lifecycle.

---

## 37.1 Waiting Human Task

Execution menunggu tindakan manusia.

Contoh:

```
Generate Contract

↓

Manager Approval

↓

Continue
```

---

## 37.2 Waiting Event

Execution menunggu Event.

Contoh:

```
payment.completed
```

Execution dilanjutkan setelah Event berhasil dikorelasikan.

---

## 37.3 Waiting Resource

Execution dapat menunggu:

- Worker
- Runtime
- GPU
- External Service

Waiting Resource tidak mengubah Workflow Definition.

---

# 38. Execution Cancellation

Execution dapat dibatalkan kapan saja sebelum mencapai Terminal State.

Cancellation dilakukan oleh Execution Engine.

---

## 38.1 Cancellation Sources

Cancellation dapat berasal dari:

- User
- API
- Scheduler
- Parent Execution
- Policy
- Administrator

---

## 38.2 Graceful Cancellation

Execution Engine memberikan kesempatan kepada Node aktif untuk menyelesaikan proses penghentian yang aman.

Contoh:

- menyelesaikan transaksi
- menutup koneksi
- menyimpan status sementara

---

## 38.3 Immediate Cancellation

Execution Engine segera menghentikan Node yang masih dapat dihentikan.

Node yang tidak mendukung penghentian langsung diperlakukan sesuai implementasi Runtime.

---

## 38.4 Cancellation Result

Setelah Cancellation selesai:

- Status menjadi **Cancelled**
- Resource dilepaskan
- Event dipublikasikan
- Compensation dapat dijalankan apabila diperlukan

---

# 39. Execution Recovery

Execution Engine harus mampu melakukan pemulihan terhadap gangguan yang bersifat sementara.

Recovery dilakukan tanpa mengubah Workflow Definition.

---

## 39.1 Restart Recovery

Execution dapat dilanjutkan setelah Engine kembali tersedia.

Execution Engine harus memulihkan:

- Execution State
- Node State
- Retry Counter
- Context
- Progress

---

## 39.2 Worker Recovery

Apabila Worker gagal, Engine dapat:

- menjadwalkan ulang Node
- memilih Worker lain
- menjalankan Retry

sesuai Policy.

---

## 39.3 Runtime Recovery

Apabila Runtime tidak tersedia, Orchestrator dapat memilih Runtime lain yang kompatibel.

Execution tetap menggunakan Capability yang sama.

---

# 40. Execution Constraints

Execution Engine wajib menjaga konsistensi Runtime.

Execution:

- MUST mengikuti Workflow Graph.
- MUST mematuhi Execution Policy.
- MUST menjaga Runtime Context.
- MUST menghasilkan Event.
- MUST mendukung Retry dan Timeout sesuai Policy.
- MUST menjaga isolasi antar Node Execution.

Execution Engine:

- MUST NOT mengubah Workflow Definition.
- MUST NOT mengubah Workflow Version.
- MUST NOT mengubah Capability Contract.
- MUST NOT mengubah Input maupun Output Contract.
- MUST NOT memilih Agent secara langsung.

Seluruh koordinasi tetap mengikuti prinsip arsitektur MMOS:

- **Orchestrator Coordinates**
- **Engine Executes**
- **Capability Based**
- **Contract First**
- **Runtime Agnostic**
```

---

# 41. Failure Recovery Model

Execution Engine harus mampu menangani kegagalan secara konsisten.

Recovery bertujuan memulihkan Execution apabila memungkinkan, tanpa melanggar Workflow Contract.

Recovery tidak boleh mengubah:

- Workflow Definition
- Workflow Graph
- Capability Contract
- Input Contract
- Output Contract

---

## 41.1 Recovery Classification

Recovery dibagi menjadi beberapa kategori.

- Retry Recovery
- Worker Recovery
- Runtime Recovery
- Queue Recovery
- Engine Recovery
- Manual Recovery
- Compensation Recovery

Kategori yang digunakan bergantung pada jenis kegagalan.

---

## 41.2 Recoverable Failure

Failure berikut umumnya dapat dipulihkan.

- temporary network failure
- runtime unavailable
- worker failure
- transient resource exhaustion
- timeout yang dapat diulang

Execution Engine dapat melakukan Recovery sesuai Policy.

---

## 41.3 Non-Recoverable Failure

Failure berikut tidak boleh dipulihkan secara otomatis.

- invalid workflow
- invalid contract
- invalid input
- invalid mapping
- unsupported capability
- authorization failure

Execution harus berpindah ke **Failed**.

---

# 42. Compensation Execution

Compensation Execution merupakan proses runtime untuk menjalankan langkah kompensasi yang telah didefinisikan pada Workflow.

Execution Engine hanya menjalankan definisi Compensation.

Workflow tetap menjadi sumber definisi Compensation.

---

## 42.1 Compensation Trigger

Compensation dapat dipicu oleh:

- Workflow Failure
- Cancellation
- Manual Request
- Failure Policy
- Parent Workflow

Execution Engine menentukan kapan Compensation dimulai.

---

## 42.2 Compensation Execution Flow

Secara konseptual:

```
Execution Failed

↓

Evaluate Compensation

↓

Execute Compensation

↓

Completed
```

Compensation merupakan Execution yang terpisah dari Node utama.

---

## 42.3 Compensation Context

Compensation memiliki Context sendiri.

Minimal terdiri dari:

- compensationId
- executionId
- workflowId
- nodeId
- traceId

Compensation tidak menggunakan Runtime State dari Node yang telah selesai.

---

## 42.4 Compensation Ordering

Compensation dijalankan sesuai urutan kebalikan dari pekerjaan yang berhasil dilakukan.

Contoh:

```
Reserve Inventory

↓

Charge Payment

↓

Send Email

↓

Failure

↓

Undo Email

↓

Refund Payment

↓

Release Inventory
```

Execution Engine wajib menjaga urutan tersebut.

---

# 43. Resource Allocation

Execution membutuhkan Resource untuk menjalankan Node.

Resource Allocation dilakukan oleh Execution Engine berdasarkan koordinasi Orchestrator.

---

## 43.1 Resource Types

Resource dapat berupa:

- CPU
- Memory
- GPU
- Runtime Slot
- Worker
- Network
- Storage

Workflow tidak mendefinisikan Resource fisik.

---

## 43.2 Allocation Lifecycle

```
Request

↓

Allocate

↓

Use

↓

Release
```

Seluruh Resource harus dilepaskan setelah tidak lagi diperlukan.

---

## 43.3 Allocation Failure

Apabila Resource tidak tersedia:

Execution dapat:

- menunggu
- dijadwalkan ulang
- dipindahkan ke Queue
- gagal

sesuai Execution Policy.

---

# 44. Runtime Binding

Runtime Binding menghubungkan Node Execution dengan Runtime yang dipilih.

Workflow tidak mengetahui Runtime yang digunakan.

Runtime Binding dilakukan sepenuhnya oleh Execution Engine berdasarkan hasil koordinasi Orchestrator.

---

## 44.1 Binding Process

Secara konseptual:

```
Node Execution

↓

Capability

↓

Orchestrator

↓

Runtime Selection

↓

Runtime Binding
```

Binding dilakukan sebelum Invocation.

---

## 44.2 Binding Validation

Sebelum Binding dilakukan, Engine harus memastikan:

- Runtime tersedia
- Capability didukung
- Resource mencukupi
- Version kompatibel

Apabila salah satu syarat gagal, Runtime Binding tidak dilakukan.

---

## 44.3 Runtime Replacement

Apabila Runtime gagal sebelum Invocation dimulai,

Engine dapat melakukan Binding ulang ke Runtime lain yang kompatibel.

Workflow tetap tidak berubah.

---

# 45. Resource Lifecycle

Seluruh Resource mengikuti Lifecycle yang konsisten.

---

## 45.1 Requested

Execution membutuhkan Resource.

Belum ada Resource yang dialokasikan.

---

## 45.2 Allocated

Resource berhasil dialokasikan.

Execution dapat mulai berjalan.

---

## 45.3 Active

Resource sedang digunakan.

Execution Engine harus memonitor penggunaan Resource.

---

## 45.4 Released

Resource telah dilepaskan.

Resource dapat digunakan oleh Execution lain.

---

## 45.5 Resource Leak Prevention

Execution Engine harus memastikan seluruh Resource dilepaskan ketika:

- Execution Completed
- Execution Failed
- Execution Cancelled

Resource tidak boleh tetap aktif setelah Execution berakhir.

---

# 46. Load Distribution

Execution Engine harus mampu mendistribusikan beban secara merata.

Distribusi beban tidak boleh mengubah hasil logis Workflow.

---

## 46.1 Distribution Goals

Tujuan utama:

- mengurangi bottleneck
- meningkatkan throughput
- menjaga fairness
- memaksimalkan Resource Utilization

---

## 46.2 Distribution Scope

Distribusi dapat dilakukan terhadap:

- Worker
- Runtime
- Queue
- Cluster
- Region

Implementasi berada di luar ruang lingkup spesifikasi ini.

---

## 46.3 Rebalancing

Execution Engine dapat memindahkan pekerjaan yang belum dimulai apabila diperlukan.

Node yang sedang berjalan tidak boleh dipindahkan kecuali Runtime mendukung mekanisme tersebut.

---

# 47. Execution Persistence

Execution Engine harus menyimpan informasi Runtime yang diperlukan.

Persistence memastikan Execution dapat dipulihkan apabila terjadi gangguan.

---

## 47.1 Persistent State

Minimal data berikut harus dapat dipersistensikan.

- Execution State
- Node State
- Context
- Retry Counter
- Timeout
- Progress

---

## 47.2 Persistence Timing

Engine sebaiknya melakukan Persistence pada saat:

- State berubah
- Node selesai
- Retry dilakukan
- Timeout terjadi
- Compensation dimulai

---

## 47.3 Recovery Source

Apabila Engine dimulai kembali,

Execution dipulihkan dari Persistent State.

Workflow Definition tetap diambil dari Repository resmi.

---

# 48. High Availability

Execution Engine harus mendukung implementasi High Availability.

Spesifikasi ini tidak menentukan teknologi yang digunakan.

---

## 48.1 Engine Failure

Apabila satu Engine gagal,

Engine lain dapat melanjutkan Execution berdasarkan Persistent State.

---

## 48.2 Worker Failure

Worker yang gagal tidak boleh menyebabkan inkonsistensi Execution.

Recovery mengikuti Retry Policy dan Failure Strategy.

---

## 48.3 Cluster Operation

Execution Engine dapat berjalan dalam konfigurasi multi-node.

Implementasi cluster tidak boleh mengubah:

- Workflow Contract
- Execution Contract
- Capability Contract

---

# 49. Recovery Events

Setiap proses Recovery harus menghasilkan Event.

Minimal Event berikut direkomendasikan.

- ExecutionRecovered
- WorkerRecovered
- RuntimeRecovered
- RetryStarted
- RetryCompleted
- CompensationStarted
- CompensationCompleted
- ResourceAllocated
- ResourceReleased

Seluruh Event harus mengikuti Event Catalog resmi MMOS.

---

# 50. Recovery Constraints

Execution Engine wajib menjaga konsistensi selama Recovery.

Recovery:

- MUST mempertahankan Execution Identifier.
- MUST mempertahankan Workflow Version.
- MUST mempertahankan Trace Identifier.
- MUST memulihkan Execution Context.
- MUST mematuhi Retry Policy.
- MUST mematuhi Failure Strategy.

Recovery:

- MUST NOT mengubah Workflow Definition.
- MUST NOT mengubah Workflow Graph.
- MUST NOT mengubah Capability Contract.
- MUST NOT mengubah Input maupun Output Contract.

Seluruh proses Recovery tetap mengikuti prinsip arsitektur MMOS:

- **Orchestrator Coordinates**
- **Engine Executes**
- **Runtime Agnostic**
- **Capability Based**
- **Contract First**
- **Event Driven**

---

# 51. Runtime Assignment

Execution Engine bertanggung jawab menghubungkan Node Execution dengan Runtime yang dipilih oleh Orchestrator.

Workflow tetap tidak mengetahui Runtime yang digunakan.

Runtime Assignment dilakukan untuk setiap Node Execution.

---

## 51.1 Assignment Principles

Runtime Assignment harus memenuhi prinsip berikut:

- Capability Based
- Runtime Agnostic
- Policy Driven
- Contract First

Execution Engine tidak boleh melakukan Assignment berdasarkan vendor tertentu.

---

## 51.2 Assignment Flow

Secara konseptual:

```
Node Execution

↓

Capability Requirement

↓

Orchestrator

↓

Runtime Selection

↓

Execution Engine

↓

Runtime Assignment
```

Execution Engine hanya menerima hasil koordinasi.

---

## 51.3 Assignment Validation

Sebelum Assignment dilakukan, Engine harus memastikan:

- Runtime tersedia
- Capability didukung
- Version kompatibel
- Policy terpenuhi
- Resource tersedia

Apabila salah satu syarat gagal, Assignment tidak boleh dilakukan.

---

# 52. Runtime Session

Runtime Session merupakan hubungan sementara antara Node Execution dan Runtime.

Session hanya berlaku selama Invocation berlangsung.

---

## 52.1 Session Creation

Session dibuat ketika Invocation dimulai.

Minimal informasi yang dimiliki:

- sessionId
- executionId
- nodeExecutionId
- runtimeId
- capability
- startedAt

---

## 52.2 Session Lifetime

Session berlaku selama Runtime sedang memproses Invocation.

Session berakhir ketika:

- Invocation selesai
- Invocation gagal
- Timeout
- Cancellation

---

## 52.3 Session Isolation

Setiap Runtime Session harus terisolasi.

Session tidak boleh:

- berbagi Runtime Context
- berbagi Retry Counter
- berbagi Invocation State

dengan Session lain.

---

# 53. Resource Reservation

Execution Engine dapat melakukan reservasi Resource sebelum Node dijalankan.

Reservasi membantu menjamin ketersediaan Resource pada saat Execution dimulai.

---

## 53.1 Reservation Scope

Reservasi dapat diterapkan terhadap:

- Worker
- Runtime Slot
- GPU
- CPU
- Memory
- Network Bandwidth

Jenis Resource bergantung pada implementasi Engine.

---

## 53.2 Reservation Lifecycle

```
Requested

↓

Reserved

↓

Allocated

↓

Released
```

Resource yang telah selesai digunakan wajib dilepaskan.

---

## 53.3 Reservation Expiration

Reservasi dapat berakhir apabila:

- melebihi batas waktu
- Execution dibatalkan
- Resource tidak lagi tersedia
- Scheduler membatalkan Assignment

Engine harus membersihkan reservasi yang kedaluwarsa.

---

# 54. Capacity Management

Execution Engine harus mengelola kapasitas Resource agar sistem tetap stabil.

Capacity Management tidak boleh mengubah perilaku Workflow.

---

## 54.1 Capacity Dimensions

Contoh kapasitas yang dapat dipantau:

- Worker Capacity
- Runtime Capacity
- Queue Capacity
- CPU Capacity
- GPU Capacity
- Memory Capacity

---

## 54.2 Capacity Evaluation

Engine dapat mengevaluasi:

- current load
- available capacity
- reserved capacity
- expected workload

Evaluasi dilakukan sebelum Resource dialokasikan.

---

## 54.3 Capacity Exhaustion

Apabila kapasitas tidak mencukupi,

Engine dapat:

- menunda Execution
- memindahkan ke Queue lain
- menjadwalkan ulang
- menerapkan Policy

Workflow tidak menentukan strategi tersebut.

---

# 55. Execution Affinity

Execution Engine dapat menerapkan Affinity sesuai Policy.

Affinity merupakan optimasi operasional.

Workflow tetap tidak mengetahui mekanisme tersebut.

---

## 55.1 Worker Affinity

Execution dapat diutamakan berjalan pada Worker tertentu.

Contoh:

- cache locality
- regional deployment
- hardware capability

---

## 55.2 Runtime Affinity

Capability tertentu dapat memiliki preferensi Runtime.

Preferensi tersebut dievaluasi oleh Orchestrator.

Workflow tetap hanya mendefinisikan Capability.

---

## 55.3 Data Affinity

Execution Engine dapat mempertimbangkan lokasi data untuk mengurangi latensi.

Implementasi berada di luar ruang lingkup spesifikasi ini.

---

# 56. Load Balancing

Execution Engine harus mendukung distribusi beban secara merata.

Load Balancing meningkatkan utilisasi Resource tanpa mengubah hasil logis Workflow.

---

## 56.1 Load Distribution

Distribusi dapat dilakukan berdasarkan:

- Worker
- Runtime
- Cluster
- Region

Strategi implementasi ditentukan oleh Engine.

---

## 56.2 Balancing Objectives

Tujuan Load Balancing meliputi:

- pemerataan beban
- peningkatan throughput
- pengurangan latency
- peningkatan availability

---

## 56.3 Load Reassignment

Execution yang belum berjalan dapat dipindahkan ke Resource lain apabila diperlukan.

Node yang sedang Running tidak boleh dipindahkan kecuali Runtime mendukung migrasi.

---

# 57. Execution Scalability

Execution Engine harus dirancang untuk mendukung skala besar.

Skalabilitas tidak boleh mengubah Contract maupun Workflow Definition.

---

## 57.1 Horizontal Scaling

Execution Engine dapat menambah Worker atau Engine Instance.

Workflow tidak perlu diubah.

---

## 57.2 Vertical Scaling

Engine dapat meningkatkan Resource pada Node tertentu.

Contoh:

- CPU
- Memory
- GPU

Perubahan dilakukan tanpa memengaruhi Workflow.

---

## 57.3 Elastic Scaling

Engine dapat menyesuaikan kapasitas secara dinamis sesuai beban.

Mekanisme elastisitas merupakan tanggung jawab implementasi.

---

# 58. Execution Isolation

Isolation menjamin setiap Execution berjalan secara independen.

Isolation merupakan persyaratan wajib dalam MMOS.

---

## 58.1 Execution Isolation

Execution tidak boleh berbagi:

- Runtime State
- Retry Counter
- Timeout
- Execution Context
- Internal Variable

dengan Execution lain.

---

## 58.2 Tenant Isolation

Execution dari Tenant yang berbeda harus tetap terisolasi.

Engine wajib menjaga:

- keamanan
- integritas
- kerahasiaan data

Implementasi mekanisme isolasi berada di luar ruang lingkup dokumen ini.

---

## 58.3 Failure Isolation

Kegagalan satu Execution tidak boleh menyebabkan Execution lain gagal, kecuali hubungan tersebut memang didefinisikan oleh Workflow.

---

# 59. Runtime Metrics

Execution Engine harus mengumpulkan metrik Runtime.

Metrik digunakan untuk Monitoring dan Observability.

---

## 59.1 Execution Metrics

Contoh metrik:

- execution duration
- queue duration
- scheduling duration
- dispatch duration
- running duration

---

## 59.2 Resource Metrics

Contoh metrik:

- CPU utilization
- GPU utilization
- memory usage
- runtime utilization
- worker utilization

---

## 59.3 Throughput Metrics

Engine dapat mengukur:

- execution per second
- node per second
- completion rate
- retry rate
- failure rate

Metrik ini tidak memengaruhi perilaku Workflow.

---

# 60. Runtime Constraints

Execution Engine wajib menjaga konsistensi selama Assignment dan Resource Management.

Runtime Assignment:

- MUST menggunakan Capability sebagai dasar Assignment.
- MUST mematuhi Policy.
- MUST mematuhi Contract.
- MUST menjaga Isolation.
- MUST melepaskan Resource setelah selesai.

Execution Engine:

- MUST NOT mengubah Workflow Definition.
- MUST NOT mengubah Workflow Graph.
- MUST NOT memilih vendor Runtime secara eksplisit di Workflow.
- MUST NOT melanggar prinsip Runtime Agnostic.

Seluruh mekanisme Assignment tetap mengikuti prinsip arsitektur MMOS:

- **Orchestrator Coordinates**
- **Engine Executes**
- **Capability Based**
- **Contract First**
- **Runtime Agnostic**
- **Everything is Object**

---

# 61. Monitoring Model

Execution Engine harus menyediakan kemampuan Monitoring terhadap seluruh Execution yang sedang maupun telah berjalan.

Monitoring merupakan fungsi observasi.

Monitoring tidak boleh mengubah perilaku Execution.

---

## 61.1 Monitoring Objectives

Monitoring bertujuan untuk:

- mengetahui status Execution
- mengukur performa
- mendeteksi kegagalan
- mengidentifikasi bottleneck
- mendukung operasional sistem

Monitoring tidak berpartisipasi dalam pengambilan keputusan Workflow.

---

## 61.2 Monitoring Scope

Monitoring mencakup:

- Workflow Execution
- Node Execution
- Queue
- Scheduler
- Dispatcher
- Worker
- Runtime
- Resource
- Event

---

## 61.3 Monitoring Frequency

Execution Engine dapat melakukan Monitoring:

- real-time
- near real-time
- periodic

Metode Monitoring merupakan keputusan implementasi.

---

# 62. Execution Metrics

Execution Engine harus menghasilkan metrik yang konsisten.

Metrik digunakan untuk observasi, analisis, dan optimasi operasional.

---

## 62.1 Execution Metrics

Minimal metrik berikut direkomendasikan.

- Execution Count
- Active Execution
- Completed Execution
- Failed Execution
- Cancelled Execution
- Success Rate

---

## 62.2 Timing Metrics

Execution Engine dapat mengukur:

- Queue Time
- Scheduling Time
- Dispatch Time
- Running Time
- Waiting Time
- Total Duration

Semua waktu dihitung berdasarkan Execution Lifecycle.

---

## 62.3 Node Metrics

Node Execution dapat menghasilkan:

- Node Duration
- Retry Count
- Timeout Count
- Failure Count
- Invocation Count

---

## 62.4 Runtime Metrics

Runtime dapat menghasilkan:

- Runtime Utilization
- Runtime Availability
- Runtime Error Rate
- Invocation Latency

Runtime Metrics tidak mengubah Workflow.

---

# 63. Distributed Tracing

Execution harus mendukung Distributed Tracing.

Tracing memungkinkan observasi end-to-end pada sistem terdistribusi.

---

## 63.1 Trace Identity

Minimal identifier berikut digunakan.

- traceId
- correlationId
- executionId
- nodeExecutionId

Identifier tersebut harus dipertahankan selama Execution berlangsung.

---

## 63.2 Trace Propagation

Ketika Execution memanggil komponen lain,

Trace Context harus diteruskan sejauh memungkinkan.

Contoh:

```
Execution

↓

Capability

↓

Agent

↓

Runtime

↓

External Service
```

Seluruh komponen menggunakan Trace Identity yang sama.

---

## 63.3 Parent-Child Trace

Sub Workflow tetap menjadi bagian dari Trace yang sama.

Contoh:

```
Execution A

↓

Execution B

↓

Execution C
```

Execution B dan C tetap memiliki hubungan dengan Trace utama.

---

# 64. Audit Model

Execution Engine harus menyediakan Audit Trail terhadap perubahan penting.

Audit digunakan untuk:

- investigasi
- kepatuhan
- debugging
- forensik

Audit berbeda dengan Monitoring.

---

## 64.1 Audit Events

Minimal perubahan berikut harus diaudit.

- Execution Created
- Execution Started
- Execution Paused
- Execution Resumed
- Execution Completed
- Execution Failed
- Execution Cancelled

---

## 64.2 Node Audit

Node Execution juga menghasilkan Audit.

Minimal:

- Node Started
- Node Completed
- Node Failed
- Node Retried
- Node Cancelled

---

## 64.3 Audit Immutability

Audit Record harus bersifat immutable.

Audit yang telah dibuat tidak boleh diubah.

Apabila diperlukan koreksi, Engine membuat Audit Record baru.

---

# 65. Execution Logging

Execution Engine harus menyediakan Logging operasional.

Logging digunakan untuk membantu observasi dan debugging.

Logging bukan pengganti Audit.

---

## 65.1 Log Categories

Contoh kategori log.

- Scheduler
- Queue
- Dispatcher
- Worker
- Runtime
- Node Execution
- Recovery

---

## 65.2 Structured Logging

Engine sebaiknya menggunakan Structured Logging.

Minimal memuat:

- timestamp
- executionId
- nodeExecutionId
- traceId
- level
- message

---

## 65.3 Log Correlation

Log harus dapat dikorelasikan menggunakan:

- executionId
- traceId
- correlationId

Hal ini memungkinkan pencarian seluruh aktivitas Execution.

---

# 66. Health Monitoring

Execution Engine harus mampu melaporkan kondisi kesehatannya.

Health Monitoring membantu Orchestrator dan Platform mengambil keputusan operasional.

---

## 66.1 Engine Health

Engine dapat melaporkan:

- Healthy
- Degraded
- Unavailable

Status tersebut menggambarkan kondisi operasional Engine.

---

## 66.2 Worker Health

Worker dapat melaporkan:

- Available
- Busy
- Degraded
- Offline

Dispatcher menggunakan informasi ini saat Assignment.

---

## 66.3 Runtime Health

Runtime dapat dilaporkan sebagai:

- Available
- Limited
- Unavailable

Orchestrator mempertimbangkan status tersebut saat Runtime Selection.

---

# 67. Operational Alerts

Execution Engine dapat menghasilkan Alert terhadap kondisi operasional tertentu.

Alert tidak mengubah Execution.

---

## 67.1 Alert Sources

Alert dapat berasal dari:

- Failure Rate tinggi
- Queue Overflow
- Worker Failure
- Runtime Failure
- Timeout Rate tinggi
- Resource Exhaustion

---

## 67.2 Alert Severity

Contoh tingkat keparahan.

- Info
- Warning
- Error
- Critical

Implementasi dapat menggunakan klasifikasi lain yang ekuivalen.

---

## 67.3 Alert Correlation

Alert sebaiknya menyertakan:

- executionId
- traceId
- runtimeId
- workerId

agar mudah dikorelasikan dengan Audit dan Log.

---

# 68. Observability Model

Observability merupakan kombinasi dari:

- Metrics
- Logs
- Traces
- Audit

Keempat komponen tersebut saling melengkapi.

---

## 68.1 Observability Principles

Observability harus:

- non-intrusive
- consistent
- immutable
- correlated
- searchable

---

## 68.2 Data Correlation

Seluruh data observabilitas harus dapat dikaitkan menggunakan identifier yang sama.

Minimal:

- executionId
- traceId
- correlationId

---

## 68.3 Historical Analysis

Execution Engine dapat menyimpan data historis untuk:

- trend analysis
- capacity planning
- performance tuning
- incident investigation

Kebijakan retensi ditentukan oleh implementasi Platform.

---

# 69. Operational Dashboard

Execution Engine dapat menyediakan informasi yang digunakan oleh Dashboard operasional.

Dashboard merupakan representasi visual.

Dashboard bukan bagian dari Execution Engine.

---

## 69.1 Execution Overview

Dashboard dapat menampilkan:

- Running Execution
- Queue Length
- Success Rate
- Failure Rate
- Active Worker

---

## 69.2 Runtime Overview

Dashboard dapat menampilkan:

- Runtime Availability
- Runtime Utilization
- Invocation Rate
- Average Latency

---

## 69.3 Historical Dashboard

Dashboard dapat menyediakan visualisasi historis.

Contoh:

- Execution Trend
- Throughput Trend
- Error Trend
- Resource Trend

Format visualisasi merupakan tanggung jawab Platform.

---

# 70. Monitoring Constraints

Monitoring dan Observability harus mematuhi prinsip MMOS.

Monitoring:

- MUST menghasilkan Metrics.
- MUST menghasilkan Logs.
- MUST menghasilkan Trace.
- MUST menghasilkan Audit.
- MUST menjaga Correlation Identity.

Monitoring:

- MUST NOT mengubah Workflow.
- MUST NOT mengubah Execution.
- MUST NOT mengubah Capability.
- MUST NOT memengaruhi hasil Runtime.

Seluruh kemampuan Monitoring tetap mengikuti prinsip:

- **Event Driven**
- **Contract First**
- **Everything is Object**
- **Runtime Agnostic**
- **Engine Executes**
- **Orchestrator Coordinates**

---

# 71. Execution Versioning

Execution selalu dikaitkan dengan versi Workflow tertentu.

Execution tidak boleh berpindah ke versi Workflow lain selama Lifecycle berlangsung.

Versioning menjamin reproduksibilitas dan konsistensi Runtime.

---

## 71.1 Workflow Version Binding

Setiap Execution MUST menyimpan:

- workflowId
- workflowVersion

Binding tersebut bersifat immutable.

Execution Engine tidak boleh mengganti Workflow Version setelah Execution dibuat.

---

## 71.2 Immutable Execution Definition

Execution dijalankan berdasarkan snapshot Workflow yang telah dipublikasikan.

Perubahan terhadap Workflow setelah Execution dimulai tidak boleh memengaruhi Execution yang sedang berjalan.

Contoh:

```
Workflow v1.0

↓

Execution-001

Running

Workflow diperbarui menjadi v1.1

↓

Execution-001 tetap menggunakan v1.0
```

---

## 71.3 New Execution

Execution baru selalu menggunakan Workflow Version yang dipilih pada saat permintaan Execution dibuat.

Contoh:

```
Workflow v1.0

↓

Execution-100

Workflow v1.1

↓

Execution-101
```

Kedua Execution berjalan secara independen.

---

# 72. Execution Compatibility

Execution Engine harus menjaga kompatibilitas terhadap perubahan sistem.

Compatibility memastikan Execution tetap berjalan walaupun Platform berkembang.

---

## 72.1 Forward Compatibility

Execution Engine SHOULD mendukung Workflow yang dibuat oleh versi spesifikasi sebelumnya selama kontraknya masih kompatibel.

---

## 72.2 Backward Compatibility

Workflow baru tidak boleh merusak Execution yang telah aktif.

Execution yang sedang berjalan harus diselesaikan menggunakan Workflow Version asalnya.

---

## 72.3 Contract Compatibility

Execution hanya dapat dijalankan apabila:

- Input Contract kompatibel
- Output Contract kompatibel
- Capability Contract kompatibel

Execution Engine wajib melakukan validasi sebelum Execution dimulai.

---

# 73. Execution Validation

Execution Engine wajib melakukan validasi sebelum Workflow dijalankan.

Workflow yang tidak valid tidak boleh menghasilkan Execution.

---

## 73.1 Validation Scope

Minimal aspek yang divalidasi:

- Workflow Identifier
- Workflow Version
- Workflow Graph
- Node Identifier
- Capability Reference
- Input Contract
- Output Contract
- Policy
- Mapping

---

## 73.2 Runtime Validation

Sebelum setiap Node dijalankan, Engine harus memverifikasi:

- Dependency
- Input Mapping
- Capability Availability
- Runtime Availability
- Policy Constraint

Validasi dilakukan secara runtime.

---

## 73.3 Validation Failure

Apabila validasi gagal:

- Execution tidak dimulai, atau
- Node tidak dijalankan

Failure harus menghasilkan Event dan Audit Record.

---

# 74. Execution Conformance

Suatu implementasi dianggap sesuai dengan IMS-400 apabila memenuhi seluruh persyaratan pada dokumen ini.

Conformance berlaku terhadap perilaku, bukan implementasi internal.

---

## 74.1 Mandatory Components

Implementasi harus menyediakan minimal komponen berikut:

- Execution Engine
- Scheduler
- Dispatcher
- Queue
- Worker Interface
- Runtime Binding
- Monitoring
- Recovery

---

## 74.2 Mandatory Capabilities

Execution Engine harus mendukung:

- Workflow Execution
- Node Execution
- Retry
- Timeout
- Cancellation
- Compensation
- Recovery
- Monitoring

---

## 74.3 Mandatory Behaviors

Execution Engine harus:

- menjaga State Machine
- menjaga Context
- menjaga Isolation
- menghasilkan Event
- menghasilkan Audit
- menghasilkan Metrics

---

# 75. Security Considerations

Execution Engine harus mempertahankan keamanan selama Runtime berlangsung.

Dokumen ini mendefinisikan prinsip umum, bukan implementasi keamanan tertentu.

---

## 75.1 Execution Identity

Setiap Execution harus memiliki Identity yang unik dan tidak dapat dipalsukan.

Identity digunakan untuk:

- Correlation
- Audit
- Authorization
- Monitoring

---

## 75.2 Context Protection

Execution Context harus dilindungi dari:

- perubahan tidak sah
- akses lintas Tenant
- manipulasi Runtime

Mekanisme perlindungan merupakan tanggung jawab Platform.

---

## 75.3 Secure Communication

Komunikasi antar komponen MMOS sebaiknya menjaga:

- integritas
- autentikasi
- kerahasiaan

Implementasi protokol komunikasi berada di luar ruang lingkup spesifikasi ini.

---

# 76. Performance Considerations

Execution Engine harus mampu beroperasi secara efisien pada berbagai skala.

Performa tidak boleh mengorbankan konsistensi kontrak.

---

## 76.1 Performance Objectives

Tujuan utama:

- latency rendah
- throughput tinggi
- utilisasi Resource optimal
- recovery cepat

---

## 76.2 Scalability

Execution Engine harus mendukung:

- Horizontal Scaling
- Vertical Scaling
- Elastic Scaling

tanpa mengubah Workflow Definition.

---

## 76.3 Bottleneck Detection

Engine sebaiknya mampu mengidentifikasi bottleneck pada:

- Queue
- Scheduler
- Worker
- Runtime
- Resource

Informasi tersebut digunakan untuk optimasi operasional.

---

# 77. Implementation Independence

IMS-400 tidak menentukan implementasi teknis tertentu.

Seluruh keputusan implementasi berada pada Engine selama memenuhi kontrak yang telah didefinisikan.

---

## 77.1 Technology Independence

Dokumen ini tidak mewajibkan:

- bahasa pemrograman
- framework
- database
- message broker
- runtime AI
- container platform

---

## 77.2 Deployment Independence

Execution Engine dapat dijalankan pada:

- single node
- cluster
- cloud
- on-premise
- hybrid

Perilaku Execution harus tetap konsisten.

---

## 77.3 Vendor Independence

Execution tidak boleh bergantung pada vendor tertentu.

Pergantian Runtime atau Platform tidak boleh mengubah Workflow maupun Execution Contract.

---

# 78. Relationship with Other Specifications

IMS-400 merupakan bagian dari keluarga spesifikasi implementasi MMOS.

Dokumen ini harus digunakan bersama spesifikasi lain.

---

## 78.1 Related IMS Documents

Execution bergantung pada:

| Document | Purpose |
|-----------|---------|
| IMS-100 | Base Object Contract |
| IMS-200 | Agent Contract |
| IMS-300 | Workflow Contract |

Execution menjadi dasar bagi:

| Document | Purpose |
|-----------|---------|
| IMS-500 | Memory Specification |
| IMS-600 | Capability Specification |
| IMS-700 | Runtime Specification |
| IMS-800 | Event Specification |
| IMS-900 | Service Contract |

---

## 78.2 Related MAS Documents

IMS-400 mengimplementasikan konsep yang didefinisikan pada:

- MAS-200 Execution Model
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-500 Memory & Knowledge
- MAS-600 Agent Architecture
- MAS-700 AI Runtime

Apabila terjadi konflik, dokumen MAS menjadi referensi arsitektural utama.

---

# 79. Future Extensions

Execution dirancang agar dapat berkembang tanpa merusak kompatibilitas.

Contoh area pengembangan di masa depan:

- Distributed Execution Federation
- Multi-Cluster Scheduling
- Adaptive Resource Allocation
- Predictive Scheduling
- AI-assisted Recovery
- Autonomous Load Balancing
- Cross-Region Execution
- Execution Simulation
- Deterministic Replay
- Cost-aware Execution Optimization

Ekstensi tersebut harus mempertahankan:

- Contract First
- Runtime Agnostic
- Capability Based
- Event Driven

---

# 80. Execution Compliance Summary

Suatu implementasi dinyatakan memenuhi IMS-400 apabila:

- menyediakan Execution Object sesuai IMS-100
- menjalankan Workflow sesuai IMS-300
- menjaga Lifecycle dan State Machine
- mendukung Scheduler, Queue, Dispatcher, dan Worker
- mendukung Retry, Timeout, Recovery, dan Compensation
- menjaga Runtime Context dan Isolation
- menghasilkan Event, Metrics, Logs, Audit, dan Trace
- mempertahankan Version Binding
- mematuhi seluruh Contract MMOS
- mengikuti prinsip:

  - Everything is Object
  - Contract First
  - Event Driven
  - Capability Based
  - Runtime Agnostic
  - Memory Outside Agent
  - Orchestrator Coordinates
  - Engine Executes
  - Immutable Object Identity
  - Repository Pattern

Implementasi yang tidak memenuhi persyaratan tersebut tidak dapat dinyatakan conformant terhadap spesifikasi IMS-400.

---

# 81. Normative Summary

Bagian ini merangkum seluruh persyaratan normatif IMS-400.

Istilah berikut digunakan sesuai makna normatif:

- MUST
- MUST NOT
- SHOULD
- SHOULD NOT
- MAY

---

## 81.1 Execution

Execution MUST:

- memiliki Execution Identifier
- memiliki Workflow Identifier
- memiliki Workflow Version
- memiliki Execution Context
- memiliki Runtime State
- mengikuti Lifecycle resmi
- mengikuti State Machine resmi

Execution MUST NOT:

- mengubah Workflow Definition
- mengubah Workflow Graph
- mengubah Workflow Version
- memilih Runtime
- memilih Agent
- mengubah Capability Contract

---

## 81.2 Execution Engine

Execution Engine MUST:

- membuat Execution
- mengelola Lifecycle
- mengelola Scheduler
- mengelola Queue
- mengelola Dispatcher
- mengelola Worker
- mengelola Runtime Assignment
- mengelola Retry
- mengelola Timeout
- mengelola Recovery
- menghasilkan Event
- menghasilkan Audit
- menghasilkan Metrics
- menghasilkan Trace

Execution Engine MUST NOT:

- mengubah Workflow Definition
- mengubah Workflow Graph
- melanggar Contract
- melanggar Policy

---

## 81.3 Node Execution

Node Execution MUST:

- mengikuti Dependency
- mengikuti Capability Contract
- mengikuti Input Contract
- mengikuti Output Contract
- menghasilkan Runtime Output
- menghasilkan Event

Node Execution MUST NOT:

- mengubah Workflow
- mengubah Graph
- mengubah Capability

---

## 81.4 Runtime

Runtime Assignment MUST:

- berdasarkan Capability
- mematuhi Policy
- menjaga Isolation
- mempertahankan Context

Runtime MUST NOT:

- mengubah Workflow
- mengubah Execution Contract
- mengubah Workflow Version

---

## 81.5 Recovery

Recovery MUST:

- mempertahankan Execution Identity
- mempertahankan Workflow Version
- mempertahankan Trace Context
- mengikuti Failure Policy

Recovery MUST NOT:

- mengubah Workflow Definition
- mengubah Contract
- mengubah Capability

---

# 82. Relationship with Other Specifications

IMS-400 merupakan spesifikasi implementasi untuk Runtime Execution pada MMOS.

Dokumen ini melengkapi spesifikasi sebelumnya dan menjadi fondasi bagi spesifikasi berikutnya.

---

## 82.1 IMS Dependencies

IMS-400 bergantung pada dokumen berikut.

| Document | Status | Purpose |
|-----------|--------|---------|
| IMS-100 Object Specification | COMPLETE | Base Object Contract |
| IMS-200 Agent Specification | COMPLETE | Agent Contract |
| IMS-300 Workflow Specification | COMPLETE | Workflow Definition |

Dokumen berikut memperluas aspek Runtime yang didefinisikan oleh IMS-400.

| Document | Purpose |
|-----------|---------|
| IMS-500 Memory Specification | Runtime Memory Contract |
| IMS-600 Capability Specification | Capability Invocation |
| IMS-700 Runtime Specification | AI Runtime Contract |
| IMS-800 Event Specification | Event Contract |
| IMS-900 Service Contract | Service Interaction |

---

## 82.2 MAS Dependencies

IMS-400 mengimplementasikan konsep-konsep yang berasal dari dokumen Architecture berikut.

- MAS-100 Workspace
- MAS-200 Execution Model
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-500 Memory & Knowledge
- MAS-600 Agent Architecture
- MAS-700 AI Runtime
- MAS-800 Platform
- MAS-900 Developer Platform

Apabila terdapat perbedaan interpretasi, dokumen MAS menjadi referensi arsitektural utama.

---

# 83. Future Extensions

Execution dirancang agar dapat berevolusi tanpa merusak kompatibilitas.

Area pengembangan yang dimungkinkan meliputi:

- Deterministic Replay
- Distributed Execution Federation
- Multi-Region Execution
- Predictive Scheduling
- Adaptive Retry Strategy
- Autonomous Recovery
- AI-assisted Scheduling
- Cost-aware Runtime Selection
- Execution Simulation
- Execution Optimization Engine
- Workflow Replay
- Cross-Cluster Execution

Seluruh ekstensi harus tetap mematuhi:

- Contract First
- Capability Based
- Runtime Agnostic
- Event Driven
- Immutable Identity

---

# 84. Glossary

Istilah dalam dokumen ini mengikuti definisi resmi pada **glossary.md**.

Ringkasan istilah utama:

| Term | Description |
|------|-------------|
| Execution | Runtime instance of a Workflow |
| Execution Engine | Component responsible for runtime execution |
| Scheduler | Component responsible for execution scheduling |
| Dispatcher | Component responsible for execution dispatch |
| Worker | Runtime execution unit |
| Runtime | AI execution environment |
| Queue | Temporary execution buffer |
| Retry | Re-execution after recoverable failure |
| Compensation | Reverse execution defined by Workflow |
| Execution Context | Runtime metadata associated with an Execution |
| Runtime Assignment | Binding between Node Execution and Runtime |

Apabila terjadi konflik definisi, **glossary.md** menjadi referensi utama.

---

# 85. References

Dokumen ini menggunakan referensi resmi MMOS.

### Architecture

- MAS-100 Workspace
- MAS-200 Execution Model
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-500 Memory & Knowledge
- MAS-600 Agent Architecture
- MAS-700 AI Runtime
- MAS-800 Platform
- MAS-900 Developer Platform

### Catalog

- Capability Catalog
- Event Catalog

### Specifications

- IMS-100 Object Specification
- IMS-200 Agent Specification
- IMS-300 Workflow Specification

---

# 86. Conformance Checklist

Implementasi IMS-400 dinyatakan **CONFORMANT** apabila memenuhi seluruh persyaratan berikut.

### Execution

- ✓ Execution Object
- ✓ Execution Context
- ✓ Execution Lifecycle
- ✓ Execution State Machine
- ✓ Parent–Child Execution
- ✓ Execution Isolation

### Runtime

- ✓ Scheduler
- ✓ Queue
- ✓ Dispatcher
- ✓ Worker
- ✓ Runtime Assignment
- ✓ Resource Allocation

### Reliability

- ✓ Retry
- ✓ Timeout
- ✓ Recovery
- ✓ Compensation
- ✓ Persistence

### Observability

- ✓ Metrics
- ✓ Logs
- ✓ Audit
- ✓ Distributed Trace
- ✓ Monitoring

### Compliance

- ✓ Contract First
- ✓ Runtime Agnostic
- ✓ Capability Based
- ✓ Event Driven
- ✓ Immutable Identity
- ✓ Repository Pattern
- ✓ Orchestrator Coordinates
- ✓ Engine Executes

Implementasi yang gagal memenuhi salah satu persyaratan di atas tidak dapat dinyatakan sesuai dengan IMS-400.

---

# 87. Document Status

Document Name

IMS-400 Execution Specification

Version

1.0

Status

COMPLETE

Category

Implementation Specification

Location

```
specs/ims/IMS-400-execution-spec.md
```

Related Specifications

- IMS-100
- IMS-200
- IMS-300
- IMS-500
- IMS-600
- IMS-700
- IMS-800
- IMS-900

---

# END OF DOCUMENT