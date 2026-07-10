# IMS-300 Workflow Specification

Version: 1.0

Status: Draft

Location:

specs/ims/IMS-300-workflow-spec.md

---

# 1. Purpose

Dokumen ini mendefinisikan spesifikasi resmi Workflow pada MMOS.

Workflow merupakan object yang mendeskripsikan bagaimana sekumpulan Task dieksekusi untuk mencapai sebuah tujuan bisnis.

Workflow tidak melakukan eksekusi secara langsung.

Workflow hanya merupakan deklarasi (declarative execution model).

Eksekusi dilakukan oleh Workflow Engine yang dikoordinasikan oleh Orchestrator.

Dokumen ini melengkapi:

- IMS-100 Object Specification
- IMS-200 Agent Specification

serta seluruh dokumen MAS Architecture.

---

# 2. Scope

Dokumen ini mencakup:

- Workflow Object
- Workflow Lifecycle
- Workflow Structure
- Workflow Node
- Workflow Edge
- Execution Graph
- Input Mapping
- Output Mapping
- Dependency Model
- Retry Policy
- Failure Strategy
- Compensation
- Parallel Execution
- Conditional Execution

Dokumen implementasi engine berada pada dokumen lain.

---

# 3. Workflow Definition

Workflow adalah Object yang mendefinisikan urutan pekerjaan yang harus dijalankan oleh MMOS.

Workflow bersifat immutable setelah dipublikasikan.

Perubahan Workflow dilakukan melalui pembuatan versi baru.

Workflow memiliki Object Identity sendiri sebagaimana seluruh MMOS Object.

Workflow tidak menyimpan state runtime.

Runtime State disimpan oleh Execution Engine.

---

# 4. Design Principles

Workflow mengikuti prinsip-prinsip berikut.

## 4.1 Declarative

Workflow mendeskripsikan:

- apa yang dikerjakan
- urutan pekerjaan
- dependensi
- kondisi transisi

Workflow tidak mendeskripsikan bagaimana engine mengimplementasikan eksekusi.

---

## 4.2 Engine Independent

Workflow tidak bergantung pada:

- OpenAI
- Claude
- Gemini
- Qwen
- DeepSeek
- Llama

Workflow hanya menggunakan Capability.

Engine memilih Runtime yang sesuai.

---

## 4.3 Agent Independent

Workflow tidak bergantung pada Agent tertentu.

Node hanya meminta Capability.

Orchestrator memilih Agent yang memenuhi Capability tersebut.

---

## 4.4 Event Driven

Setiap perubahan Workflow menghasilkan Event.

Contoh:

- WorkflowCreated
- WorkflowStarted
- WorkflowPaused
- WorkflowResumed
- WorkflowCompleted
- WorkflowFailed
- WorkflowCancelled

Workflow Engine wajib mempublikasikan event sesuai Event Catalog.

---

## 4.5 Contract First

Workflow harus dapat divalidasi sebelum dieksekusi.

Seluruh kontrak meliputi:

- Input
- Output
- Capability
- Dependency
- Retry
- Compensation

harus tervalidasi pada tahap deployment atau publishing.

---

# 5. Workflow Object

Workflow merupakan turunan dari Base Object.

Workflow memiliki metadata standar sesuai IMS-100.

Selain metadata umum, Workflow memiliki atribut berikut.

| Field | Required | Description |
|--------|----------|-------------|
| workflowId | Yes | Immutable Workflow Identifier |
| name | Yes | Workflow Name |
| version | Yes | Semantic Version |
| description | No | Workflow Description |
| namespace | Yes | Logical Namespace |
| labels | No | Metadata Labels |
| annotations | No | Additional Metadata |
| inputs | Yes | Workflow Input Contract |
| outputs | Yes | Workflow Output Contract |
| nodes | Yes | Collection of Workflow Nodes |
| edges | Yes | Workflow Connections |
| policies | No | Workflow Policies |
| timeout | No | Maximum Execution Duration |
| compensation | No | Compensation Definition |
| status | Yes | Draft, Published, Deprecated |

---

# 6. Workflow Responsibilities

Workflow bertanggung jawab terhadap:

- mendefinisikan urutan pekerjaan
- mendefinisikan dependency
- mendefinisikan input contract
- mendefinisikan output contract
- mendefinisikan execution graph
- mendefinisikan transisi
- mendefinisikan policy

Workflow tidak bertanggung jawab terhadap:

- memilih Agent
- memilih Runtime
- menyimpan Memory
- melakukan Scheduling
- menjalankan LLM
- melakukan Retry secara fisik
- melakukan Monitoring

Seluruh tanggung jawab tersebut berada pada Engine yang sesuai.

---

# 7. Workflow Lifecycle

Workflow memiliki lifecycle sebagai berikut.

```
Draft
   │
   ▼
Validated
   │
   ▼
Published
   │
   ├──────────────► Deprecated
   │
   ▼
Archived
```

## Draft

Workflow masih dapat diubah.

Belum dapat dieksekusi.

---

## Validated

Workflow telah lolos validasi kontrak.

Belum tersedia untuk produksi.

---

## Published

Workflow dapat digunakan oleh Orchestrator.

Workflow bersifat immutable.

---

## Deprecated

Workflow masih tersedia untuk kompatibilitas namun tidak direkomendasikan untuk deployment baru.

---

## Archived

Workflow tidak lagi digunakan dan hanya dipertahankan untuk kebutuhan historis.

---

# 8. Workflow Graph Model

Workflow direpresentasikan sebagai Directed Graph.

Setiap Node merepresentasikan sebuah unit pekerjaan.

Setiap Edge merepresentasikan hubungan antar Node.

Graph harus bersifat deterministic sehingga Engine dapat menentukan urutan eksekusi tanpa ambigu.

Workflow Engine tidak diperbolehkan mengubah struktur Graph pada saat runtime.

Graph yang dieksekusi harus identik dengan Graph yang telah dipublikasikan.

---

## 8.1 Directed Graph

Workflow menggunakan Directed Acyclic Graph (DAG) sebagai model dasar.

```
Start
   │
   ▼
Task A
 ├──────► Task B
 │
 └──────► Task C
            │
            ▼
         Task D
            │
            ▼
           End
```

Setiap Edge memiliki arah yang jelas.

Arah tersebut menunjukkan urutan eksekusi.

---

## 8.2 Graph Properties

Workflow Graph harus memenuhi aturan berikut.

- memiliki tepat satu Entry Node
- memiliki minimal satu Exit Node
- seluruh Node dapat dicapai dari Entry Node
- seluruh Exit Node dapat dicapai
- tidak memiliki orphan node
- tidak memiliki duplicate node identifier
- tidak memiliki edge yang tidak valid
- tidak memiliki dependency yang kontradiktif

---

## 8.3 Graph Validation

Sebelum Workflow dipublikasikan, Graph wajib divalidasi.

Validasi minimal meliputi:

- duplicate node
- invalid edge
- missing node
- unreachable node
- circular dependency
- invalid transition
- missing input contract
- missing output contract
- duplicate edge
- invalid capability reference

Workflow yang gagal divalidasi tidak boleh dipublikasikan.

---

# 9. Workflow Node

Node merupakan unit pekerjaan terkecil dalam Workflow.

Node bersifat deklaratif.

Node tidak menjalankan pekerjaan secara langsung.

Node hanya mendeskripsikan:

- pekerjaan
- capability
- dependency
- input
- output
- policy

Eksekusi dilakukan oleh Workflow Engine.

---

## 9.1 Node Structure

Setiap Node minimal memiliki atribut berikut.

| Field | Required | Description |
|--------|----------|-------------|
| nodeId | Yes | Immutable Node Identifier |
| name | Yes | Human Readable Name |
| type | Yes | Node Type |
| capability | Yes | Required Capability |
| inputs | Yes | Input Mapping |
| outputs | Yes | Output Mapping |
| dependsOn | No | Dependency List |
| timeout | No | Node Timeout |
| retry | No | Retry Policy |
| compensation | No | Compensation Node |
| condition | No | Conditional Expression |
| metadata | No | Additional Metadata |

---

## 9.2 Node Identity

Node Identity harus unik di dalam satu Workflow.

Contoh:

```
extract_news

summarize_article

generate_image

publish_article
```

Identifier tidak boleh berubah selama Workflow Version tersebut masih berlaku.

---

## 9.3 Node Responsibility

Node hanya bertanggung jawab mendeklarasikan pekerjaan.

Node tidak:

- memilih Agent
- memilih Runtime
- menyimpan Memory
- melakukan Retry
- menjalankan Prompt
- memanggil API

Seluruh implementasi tersebut berada pada Engine.

---

# 10. Node Types

MMOS mendefinisikan beberapa jenis Node standar.

Engine dapat menambahkan Node Type baru sepanjang tetap mengikuti Contract.

---

## 10.1 Task Node

Task Node merupakan Node paling umum.

Node ini meminta sebuah Capability tertentu.

Contoh:

```
Summarize Article

↓

Capability

text.summarize
```

---

## 10.2 Condition Node

Condition Node digunakan untuk menentukan jalur eksekusi.

Contoh:

```
IF confidence > 0.8

YES → Publish

NO → Human Review
```

Condition tidak melakukan pekerjaan bisnis.

Condition hanya mengevaluasi ekspresi.

---

## 10.3 Parallel Node

Parallel Node membuka beberapa jalur eksekusi secara bersamaan.

```
         Parallel

       /     |     \

 Image  Audio  Summary
```

Seluruh cabang dianggap independen kecuali ditentukan sebaliknya.

---

## 10.4 Merge Node

Merge Node menyatukan beberapa jalur.

Merge dapat menunggu:

- seluruh cabang selesai
- sebagian cabang selesai
- jumlah minimum cabang

sesuai Policy.

---

## 10.5 Loop Node

Loop Node digunakan untuk mengulang sekumpulan Node.

Loop harus memiliki batas yang jelas.

Loop tanpa batas tidak diperbolehkan.

---

## 10.6 Sub Workflow Node

Workflow dapat memanggil Workflow lain.

Sub Workflow diperlakukan sebagai satu Node.

```
Main Workflow

↓

Generate Content

↓

Publish Workflow

↓

Finish
```

Sub Workflow memiliki Input dan Output Contract sendiri.

---

## 10.7 Human Task Node

Human Task digunakan ketika intervensi manusia diperlukan.

Contoh:

- approval
- legal review
- editorial review
- moderation

Engine akan menghentikan eksekusi sampai Event yang sesuai diterima.

---

## 10.8 Event Node

Event Node menunggu Event tertentu.

Contoh:

- payment.completed
- upload.finished
- email.received

Workflow akan dilanjutkan setelah Event memenuhi kontrak yang ditentukan.

---

# 11. Workflow Edge

Edge mendefinisikan hubungan antar Node.

Edge tidak membawa logika bisnis.

Edge hanya mendefinisikan transisi eksekusi.

---

## 11.1 Edge Structure

| Field | Required | Description |
|--------|----------|-------------|
| edgeId | Yes | Immutable Edge Identifier |
| source | Yes | Source Node |
| target | Yes | Target Node |
| type | Yes | Transition Type |
| condition | No | Transition Condition |
| priority | No | Transition Priority |
| metadata | No | Additional Metadata |

---

## 11.2 Transition Types

MMOS mendefinisikan Transition berikut.

- Success
- Failure
- Always
- Timeout
- Cancel
- Manual
- Conditional

Engine dapat menambahkan implementasi lain tanpa mengubah kontrak dasar.

---

# 12. Dependency Rules

Workflow menggunakan dependency eksplisit.

Node hanya dapat dijalankan apabila seluruh dependency telah terpenuhi.

Contoh:

```
A

↓

B

↓

C
```

Node C tidak boleh dimulai sebelum Node B selesai.

---

## 12.1 Multiple Dependency

Node dapat memiliki lebih dari satu dependency.

```
A ─┐

   ├──► D

B ─┘
```

Node D baru dapat dimulai setelah seluruh dependency terpenuhi sesuai kebijakan Merge yang berlaku.

---

## 12.2 Circular Dependency

Circular Dependency tidak diperbolehkan.

Contoh yang tidak valid:

```
A → B → C → A
```

Workflow yang mengandung siklus harus ditolak pada proses validasi.

---

## 12.3 Self Dependency

Node tidak boleh bergantung pada dirinya sendiri.

```
A → A
```

Konfigurasi tersebut dianggap tidak valid.

---

# 13. Entry dan Exit Node

Setiap Workflow wajib memiliki Entry Node.

Entry Node merupakan titik awal eksekusi.

Workflow juga wajib memiliki minimal satu Exit Node.

Exit Node menandakan berakhirnya Workflow.

---

## 13.1 Entry Node Rules

Entry Node:

- hanya satu
- tidak memiliki incoming edge
- wajib dapat menjangkau seluruh Graph

---

## 13.2 Exit Node Rules

Exit Node:

- tidak memiliki outgoing edge
- dapat lebih dari satu
- mewakili hasil akhir Workflow

Contoh:

```
Completed

Failed

Cancelled
```

Semua Exit Node harus dapat dicapai melalui jalur Graph yang valid.

---

# 14. Input Contract

Workflow memiliki Input Contract yang mendefinisikan seluruh data yang diperlukan sebelum eksekusi dimulai.

Input Contract bersifat statis dan menjadi bagian dari definisi Workflow.

Workflow Engine wajib melakukan validasi Input sebelum membuat Execution Instance.

Workflow tidak boleh dijalankan apabila Input Contract tidak terpenuhi.

---

## 14.1 Input Sources

Input dapat berasal dari berbagai sumber.

Contoh:

- API Request
- Event Payload
- Parent Workflow
- Scheduled Trigger
- Human Input
- External Service
- Memory Lookup

Workflow tidak bergantung pada sumber tertentu.

Engine bertanggung jawab menyediakan nilai Input sesuai kontrak.

---

## 14.2 Input Structure

Setiap Input minimal memiliki atribut berikut.

| Field | Required | Description |
|--------|----------|-------------|
| name | Yes | Input Name |
| type | Yes | Data Type |
| required | Yes | Mandatory Flag |
| default | No | Default Value |
| description | No | Description |
| validation | No | Validation Rules |

Contoh:

```
article

type: Object

required: true
```

---

## 14.3 Input Validation

Workflow Engine wajib memvalidasi seluruh Input.

Minimal meliputi:

- required field
- data type
- enum
- minimum
- maximum
- pattern
- object structure
- array constraint

Workflow tidak boleh mulai dieksekusi apabila validasi gagal.

---

# 15. Output Contract

Output Contract mendefinisikan hasil yang dihasilkan oleh Workflow.

Output menjadi kontrak resmi antara Workflow dan Consumer.

Output tidak boleh berubah tanpa perubahan versi Workflow.

---

## 15.1 Output Structure

Setiap Output memiliki atribut berikut.

| Field | Required | Description |
|--------|----------|-------------|
| name | Yes | Output Name |
| type | Yes | Output Type |
| description | No | Description |

Contoh:

```
summary

type: string
```

---

## 15.2 Output Validation

Workflow Engine wajib memastikan Output sesuai kontrak.

Contoh validasi:

- type
- required
- schema
- enum
- object structure

Output yang tidak valid dianggap sebagai Execution Failure.

---

# 16. Input Mapping

Input Mapping mendefinisikan bagaimana Input Workflow diteruskan ke setiap Node.

Node tidak secara otomatis menerima seluruh Input Workflow.

Node hanya menerima data yang secara eksplisit dipetakan.

Hal ini menjaga isolasi antar Node dan mengurangi ketergantungan yang tidak diperlukan.

---

## 16.1 Mapping Sources

Input Mapping dapat berasal dari:

- Workflow Input
- Output Node sebelumnya
- Memory
- Event
- Constant Value
- Runtime Context

---

## 16.2 Mapping Rules

Setiap Mapping harus memenuhi aturan berikut.

- source harus valid
- target harus ada
- type harus kompatibel
- mapping tidak ambigu
- tidak menghasilkan konflik nama

Engine wajib memvalidasi seluruh Mapping sebelum eksekusi.

---

## 16.3 Mapping Example

```
Workflow Input

article

↓

Extract Title

↓

title

↓

Summarizer

↓

summary
```

Workflow Engine bertanggung jawab melakukan resolusi Mapping tersebut.

---

# 17. Output Mapping

Output Mapping mendefinisikan bagaimana Output dari suatu Node diteruskan ke Node lain atau menjadi Output Workflow.

Output Mapping dilakukan secara eksplisit.

Engine tidak boleh melakukan implicit mapping.

---

## 17.1 Node to Node

```
Node A

↓

output.text

↓

Node B

↓

input.content
```

---

## 17.2 Node to Workflow

```
Final Node

↓

summary

↓

Workflow Output
```

Workflow selesai setelah seluruh Output wajib berhasil dipetakan.

---

## 17.3 Mapping Validation

Output Mapping dianggap valid apabila:

- source tersedia
- target tersedia
- data type kompatibel
- tidak terjadi konflik

---

# 18. Data Flow

Workflow menggunakan Data Flow eksplisit.

Data hanya berpindah melalui Mapping yang telah didefinisikan.

Tidak diperbolehkan adanya akses implisit terhadap Output Node lain.

Contoh:

```
Node A

↓

Output

↓

Mapping

↓

Node B Input
```

Node C tidak dapat mengakses Output Node A apabila Mapping tidak didefinisikan.

---

## 18.1 Immutable Data Flow

Data yang telah dihasilkan suatu Node dianggap immutable.

Node berikutnya dapat menggunakan Output tersebut, namun tidak boleh mengubah nilai aslinya.

Apabila diperlukan transformasi, harus dibuat Output baru.

---

## 18.2 Context Propagation

Selain Data Flow, Engine dapat meneruskan Runtime Context.

Runtime Context bukan bagian dari Workflow Contract.

Contoh Runtime Context:

- executionId
- workflowId
- traceId
- correlationId
- tenantId
- requestId

Context digunakan untuk kebutuhan operasional dan observabilitas.

---

# 19. Variable Scope

Workflow mendefinisikan ruang lingkup (scope) variabel secara eksplisit.

Variabel hanya berlaku pada scope tempat variabel tersebut dideklarasikan.

Engine tidak boleh mengekspos variabel di luar scope yang ditentukan.

---

## 19.1 Workflow Scope

Workflow Scope tersedia selama keseluruhan eksekusi Workflow.

Variabel pada scope ini dapat digunakan oleh seluruh Node melalui Mapping.

Contoh:

- articleId
- tenantId
- language
- configuration

---

## 19.2 Node Scope

Node Scope hanya berlaku selama Node tersebut dieksekusi.

Output Node harus dipublikasikan melalui Output Mapping agar dapat digunakan oleh Node lain.

Variabel internal Node tidak boleh diakses langsung.

---

## 19.3 Sub Workflow Scope

Sub Workflow memiliki Scope sendiri.

Workflow induk dan Sub Workflow hanya berkomunikasi melalui Input Contract dan Output Contract.

Tidak diperbolehkan berbagi variabel internal secara langsung.

---

# 20. Graph Validation Rules

Workflow wajib lolos validasi sebelum dipublikasikan.

Minimal Engine harus melakukan pemeriksaan terhadap:

- valid Entry Node
- valid Exit Node
- duplicate Node Identifier
- duplicate Edge Identifier
- orphan Node
- unreachable Node
- circular dependency
- invalid transition
- invalid Capability
- invalid Input Mapping
- invalid Output Mapping
- incompatible data type
- missing required contract
- invalid Sub Workflow reference
- invalid policy reference

Apabila salah satu pemeriksaan gagal, Workflow harus ditolak dan tidak boleh memasuki status **Published**.

---

# 21. Execution Policy

Execution Policy mendefinisikan aturan umum yang digunakan oleh Workflow Engine selama proses eksekusi.

Policy bersifat deklaratif.

Workflow hanya mendefinisikan policy.

Workflow Engine bertanggung jawab mengimplementasikan policy tersebut.

Policy dapat diterapkan pada tingkat:

- Workflow
- Node
- Transition

Apabila terjadi konflik, prioritas kebijakan adalah:

```
Node Policy
    │
    ▼
Workflow Policy
    │
    ▼
Engine Default
```

---

## 21.1 Workflow Policy Structure

Workflow dapat memiliki sekumpulan policy.

Contoh kategori policy:

- Timeout
- Retry
- Compensation
- Concurrency
- Scheduling
- Error Handling
- Resource Limit
- Security

Implementasi detail ditentukan oleh Engine tanpa mengubah kontrak Workflow.

---

# 22. Timeout Policy

Timeout membatasi lamanya eksekusi.

Timeout dapat diterapkan pada:

- Workflow
- Node
- Human Task
- Sub Workflow

Timeout dihitung oleh Workflow Engine.

Workflow tidak menghitung waktu secara mandiri.

---

## 22.1 Workflow Timeout

Workflow Timeout menentukan batas maksimum durasi seluruh Workflow.

Contoh:

```
Workflow Timeout

30 Minutes
```

Apabila batas waktu terlampaui, Engine harus mengakhiri Workflow sesuai Failure Policy.

---

## 22.2 Node Timeout

Setiap Node dapat memiliki Timeout sendiri.

Contoh:

```
Generate Image

Timeout

120 Seconds
```

Node yang melewati batas waktu dianggap gagal.

---

## 22.3 Timeout Resolution

Apabila Workflow Timeout dan Node Timeout sama-sama didefinisikan:

- Node Timeout berlaku untuk Node tersebut.
- Workflow Timeout tetap berlaku untuk keseluruhan Workflow.

Engine harus mengevaluasi keduanya secara independen.

---

# 23. Retry Policy

Retry Policy mendefinisikan aturan pengulangan ketika sebuah Node gagal dieksekusi.

Retry hanya berlaku untuk kegagalan yang dikategorikan sebagai retryable.

Workflow tidak menentukan mekanisme retry.

Workflow hanya mendefinisikan kebijakan.

---

## 23.1 Retry Attributes

Retry Policy dapat memiliki atribut berikut.

| Field | Description |
|--------|-------------|
| maxAttempts | Maximum Retry Count |
| delay | Initial Delay |
| backoff | Backoff Strategy |
| retryCondition | Retry Condition |
| jitter | Random Delay |

---

## 23.2 Retry Strategy

MMOS mendukung beberapa strategi.

### Fixed

```
Retry

5s

5s

5s
```

---

### Linear

```
5s

10s

15s
```

---

### Exponential

```
5s

10s

20s

40s
```

---

### Exponential with Jitter

Backoff eksponensial dengan variasi acak untuk mengurangi kemungkinan terjadinya lonjakan permintaan secara bersamaan.

---

## 23.3 Retryable Failure

Retry hanya boleh dilakukan terhadap kegagalan yang dapat dipulihkan.

Contoh:

- temporary network failure
- service unavailable
- timeout
- rate limit
- transient runtime error

Retry tidak boleh dilakukan terhadap:

- invalid input
- invalid contract
- authorization failure
- schema mismatch
- unsupported capability

---

# 24. Failure Strategy

Failure Strategy mendefinisikan tindakan yang dilakukan ketika Node atau Workflow mengalami kegagalan.

Failure Strategy dievaluasi oleh Workflow Engine.

---

## 24.1 Fail Fast

Workflow langsung dihentikan.

```
Node Failed

↓

Workflow Failed
```

Strategi ini sesuai untuk proses yang tidak memiliki jalur pemulihan.

---

## 24.2 Continue

Workflow tetap berjalan.

Node yang gagal ditandai sebagai Failed.

Node berikutnya hanya dieksekusi apabila dependency masih terpenuhi.

---

## 24.3 Ignore

Failure dicatat.

Workflow tetap berjalan tanpa menghasilkan error.

Strategi ini hanya boleh digunakan untuk pekerjaan yang bersifat opsional.

---

## 24.4 Manual Recovery

Workflow dihentikan sementara.

Menunggu keputusan manusia.

```
Failed

↓

Human Review

↓

Resume
```

---

## 24.5 Compensation

Workflow menjalankan langkah-langkah kompensasi yang telah didefinisikan.

Compensation dibahas pada bagian berikut.

---

# 25. Compensation Model

Compensation digunakan untuk membatalkan atau mengurangi dampak dari pekerjaan yang telah berhasil dilakukan sebelumnya.

Compensation bukan rollback database.

Compensation merupakan Workflow yang secara eksplisit mengembalikan sistem ke kondisi bisnis yang konsisten.

---

## 25.1 Compensation Node

Setiap Node dapat memiliki Compensation Node.

Contoh:

```
Reserve Inventory

↓

Compensation

Release Inventory
```

Compensation hanya dijalankan apabila diperlukan.

---

## 25.2 Compensation Workflow

Workflow juga dapat memiliki Compensation Workflow.

```
Order Workflow

↓

Compensation Workflow
```

Compensation Workflow merupakan Workflow independen dengan Input dan Output Contract sendiri.

---

## 25.3 Compensation Order

Compensation dijalankan dalam urutan kebalikan dari urutan eksekusi yang berhasil.

Contoh:

```
A

↓

B

↓

C

Failure

↓

Undo C

↓

Undo B

↓

Undo A
```

Engine bertanggung jawab menjaga urutan kompensasi.

---

# 26. Error Classification

Workflow Engine harus mengelompokkan kegagalan ke dalam kategori yang konsisten.

Kategori minimal meliputi:

- Validation Error
- Contract Error
- Capability Error
- Runtime Error
- Resource Error
- Timeout Error
- Dependency Error
- External Service Error
- Security Error
- Internal Engine Error

Klasifikasi ini digunakan untuk menentukan Retry Policy dan Failure Strategy.

---

# 27. Cancellation

Workflow dapat dibatalkan sebelum selesai.

Pembatalan dapat berasal dari:

- User
- API
- Orchestrator
- Parent Workflow
- Policy
- Engine

Cancellation harus menghasilkan Event sesuai Event Catalog.

---

## 27.1 Graceful Cancellation

Engine memberikan kesempatan kepada Node yang sedang berjalan untuk menyelesaikan pekerjaannya atau melakukan proses penghentian yang aman.

---

## 27.2 Immediate Cancellation

Engine segera menghentikan seluruh pekerjaan yang memungkinkan untuk dihentikan.

Node yang tidak mendukung penghentian langsung akan diselesaikan sesuai implementasi Engine.

---

## 27.3 Cancellation Result

Setelah pembatalan selesai:

- Workflow Status menjadi **Cancelled**
- Execution dihentikan
- Event dipublikasikan
- Resource sementara dibersihkan sesuai kebijakan Engine
- Compensation dapat dijalankan apabila didefinisikan oleh Workflow

---

# 28. Conditional Execution

Workflow mendukung eksekusi berdasarkan kondisi tertentu.

Conditional Execution memungkinkan Workflow memilih jalur eksekusi sesuai hasil evaluasi suatu ekspresi.

Evaluasi dilakukan oleh Workflow Engine.

Workflow hanya mendefinisikan ekspresi dan transisi yang tersedia.

---

## 28.1 Condition Expression

Condition harus menghasilkan nilai Boolean.

```
true

atau

false
```

Engine bertanggung jawab mengevaluasi ekspresi tersebut.

Bahasa ekspresi yang digunakan merupakan implementasi Engine dan tidak menjadi bagian dari kontrak Workflow.

---

## 28.2 Conditional Transition

Setiap Transition dapat memiliki Condition.

Contoh:

```
Score >= 80

↓

Publish
```

```
Score < 80

↓

Human Review
```

Hanya satu jalur yang dapat dipilih untuk setiap evaluasi Condition, kecuali Workflow secara eksplisit mendukung Multi-Branch Execution.

---

## 28.3 Default Transition

Condition Node dapat memiliki Default Transition.

Default Transition digunakan apabila tidak ada Condition yang terpenuhi.

Contoh:

```
Condition

├── Yes
├── No
└── Default
```

Workflow yang memiliki kemungkinan tidak menemukan jalur transisi sebaiknya mendefinisikan Default Transition.

---

# 29. Parallel Execution

Workflow mendukung eksekusi paralel terhadap beberapa Node yang independen.

Parallel Execution meningkatkan efisiensi dengan menjalankan beberapa pekerjaan secara bersamaan.

Workflow hanya mendeklarasikan struktur paralel.

Workflow Engine menentukan mekanisme implementasinya.

---

## 29.1 Parallel Branch

Parallel Branch dimulai dari Parallel Node.

Contoh:

```
            Parallel

        /      |      \

 Image      Summary     Audio
```

Masing-masing Branch memiliki lifecycle sendiri.

---

## 29.2 Parallel Completion

Workflow dapat menentukan kapan Branch dianggap selesai.

Mode yang didukung meliputi:

- All Completed
- Any Completed
- Majority Completed
- Custom Policy

Policy dipilih pada Merge Node.

---

## 29.3 Independent Failure

Kegagalan pada satu Branch tidak selalu menyebabkan seluruh Workflow gagal.

Perilaku tersebut ditentukan oleh Failure Strategy.

Contoh:

```
Branch A

Success

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

# 30. Merge Behavior

Merge Node bertanggung jawab menyatukan beberapa Branch menjadi satu jalur eksekusi.

Merge tidak mengubah Output Branch.

Merge hanya melakukan sinkronisasi eksekusi.

---

## 30.1 All Branches

Merge menunggu seluruh Branch selesai.

```
A

B

C

↓

Merge
```

Workflow hanya dapat dilanjutkan setelah semua Branch selesai sesuai Policy.

---

## 30.2 Any Branch

Merge dapat dilanjutkan setelah salah satu Branch selesai.

Contoh:

```
A Finished

↓

Merge
```

Branch lain dapat tetap berjalan atau dihentikan sesuai Policy.

---

## 30.3 Majority

Merge dapat dilanjutkan setelah jumlah minimum Branch selesai.

Contoh:

```
5 Branch

3 Finished

↓

Continue
```

---

## 30.4 Custom Merge Policy

Workflow dapat menggunakan Merge Policy khusus.

Implementasi Policy dilakukan oleh Engine tanpa mengubah kontrak Workflow.

---

# 31. Loop Execution

Workflow mendukung pengulangan terhadap sekumpulan Node.

Loop digunakan ketika pekerjaan perlu dilakukan lebih dari satu kali.

Loop harus memiliki batas yang dapat diverifikasi.

---

## 31.1 Fixed Loop

Jumlah iterasi telah diketahui.

Contoh:

```
Repeat

5 Times
```

---

## 31.2 Collection Loop

Loop dilakukan untuk setiap elemen dalam Collection.

Contoh:

```
Articles

↓

For Each

↓

Summarize
```

Setiap iterasi diperlakukan sebagai Execution Context yang terpisah.

---

## 31.3 Conditional Loop

Loop berhenti ketika Condition tidak lagi terpenuhi.

Contoh:

```
While

confidence < target
```

Workflow Engine wajib memastikan Loop dapat berhenti.

---

## 31.4 Maximum Iteration

Workflow dapat menentukan jumlah iterasi maksimum.

Contoh:

```
Maximum Iteration

100
```

Apabila batas tercapai, Engine harus menghentikan Loop sesuai Failure Strategy.

---

# 32. Sub Workflow

Workflow dapat menggunakan Workflow lain sebagai bagian dari eksekusi.

Sub Workflow diperlakukan sebagai Node khusus.

---

## 32.1 Isolation

Sub Workflow memiliki:

- Workflow Identity
- Execution Context
- Input Contract
- Output Contract

sendiri.

Workflow induk tidak dapat mengakses state internal Sub Workflow.

---

## 32.2 Input Contract

Workflow induk hanya dapat mengirim data melalui Input Contract.

Contoh:

```
Parent Workflow

↓

Input Mapping

↓

Sub Workflow
```

---

## 32.3 Output Contract

Sub Workflow hanya dapat mengembalikan data melalui Output Contract.

Workflow induk tidak boleh membaca variabel internal Sub Workflow.

---

## 32.4 Nested Workflow

Workflow dapat memanggil Sub Workflow secara bertingkat.

Contoh:

```
Workflow A

↓

Workflow B

↓

Workflow C
```

Engine harus menjaga Execution Context masing-masing Workflow tetap terisolasi.

---

# 33. Human Interaction

Workflow dapat berhenti sementara untuk menunggu tindakan manusia.

Human Interaction diperlakukan sebagai Node khusus.

---

## 33.1 Human Approval

Contoh:

```
Generate Contract

↓

Manager Approval

↓

Publish
```

Workflow akan menunggu Event persetujuan sebelum dilanjutkan.

---

## 33.2 Human Input

Workflow dapat meminta Input tambahan.

Contoh:

- revisi dokumen
- konfirmasi data
- validasi hasil AI
- klasifikasi manual

Input tersebut harus divalidasi sesuai Input Contract Node.

---

## 33.3 Human Timeout

Human Task dapat memiliki Timeout.

Apabila Timeout tercapai, Workflow mengikuti Failure Strategy yang telah ditentukan.

---

# 34. Event Waiting

Workflow dapat menunggu Event dari sistem lain.

Event Waiting digunakan untuk proses yang bersifat asynchronous.

---

## 34.1 Event Subscription

Workflow mendefinisikan Event yang akan ditunggu.

Contoh:

- payment.completed
- file.uploaded
- email.received
- deployment.finished

---

## 34.2 Event Correlation

Workflow Engine harus memastikan Event yang diterima sesuai dengan Execution Instance yang benar.

Proses pencocokan dilakukan menggunakan informasi korelasi seperti:

- executionId
- workflowId
- correlationId
- businessKey

Mekanisme pencocokan merupakan tanggung jawab Engine.

---

## 34.3 Event Timeout

Workflow dapat menentukan batas waktu menunggu Event.

Apabila Event tidak diterima sebelum Timeout berakhir, Engine harus menjalankan Failure Strategy yang sesuai.

---

# 35. Workflow Versioning

Workflow mengikuti prinsip Immutable Version.

Workflow yang telah dipublikasikan tidak boleh diubah.

Perubahan apa pun terhadap definisi Workflow harus dilakukan melalui versi baru.

Hal ini menjamin reproduksibilitas eksekusi dan kompatibilitas historis.

---

## 35.1 Version Identity

Setiap Workflow Version memiliki:

- workflowId
- version

Kombinasi keduanya harus unik.

Contoh:

```
workflowId

content-pipeline

version

1.0.0
```

```
workflowId

content-pipeline

version

1.1.0
```

Kedua Workflow tersebut merupakan dua versi yang berbeda.

---

## 35.2 Immutable Definition

Setelah Workflow berada pada status **Published**, atribut berikut tidak boleh diubah:

- Graph
- Node
- Edge
- Input Contract
- Output Contract
- Capability Reference
- Policy
- Transition

Perubahan hanya dapat dilakukan melalui versi baru.

---

## 35.3 Version Compatibility

Workflow Engine harus mampu menjalankan beberapa versi Workflow secara bersamaan.

Contoh:

```
Workflow A

v1.0.0

Running

Workflow A

v2.0.0

Running
```

Masing-masing Execution harus menggunakan definisi Workflow sesuai versinya.

---

# 36. Workflow Validation

Workflow wajib divalidasi sebelum dipublikasikan.

Validasi dilakukan terhadap struktur, kontrak, dan konsistensi Graph.

Workflow yang tidak lolos validasi tidak boleh memasuki status **Published**.

---

## 36.1 Structural Validation

Engine minimal harus memverifikasi:

- Workflow Identifier
- Version
- Entry Node
- Exit Node
- Node Identifier
- Edge Identifier
- Duplicate Object
- Missing Object
- Invalid Reference

---

## 36.2 Contract Validation

Contract Validation meliputi:

- Input Contract
- Output Contract
- Capability Contract
- Sub Workflow Contract
- Transition Contract
- Policy Contract

Seluruh kontrak harus valid sebelum Workflow dapat digunakan.

---

## 36.3 Graph Validation

Graph Validation meliputi:

- orphan node
- unreachable node
- cycle detection
- invalid dependency
- duplicate edge
- invalid merge
- invalid loop
- invalid transition

---

## 36.4 Runtime Validation

Sebelum Execution dibuat, Engine harus melakukan validasi terhadap:

- Workflow Status
- Input Contract
- Runtime Availability
- Capability Availability
- Policy Compatibility

Apabila salah satu pemeriksaan gagal, Execution tidak boleh dibuat.

---

# 37. Workflow Metadata

Workflow dapat memiliki Metadata tambahan.

Metadata tidak memengaruhi perilaku Workflow kecuali digunakan secara eksplisit oleh Engine.

---

## 37.1 Labels

Labels digunakan untuk klasifikasi.

Contoh:

```
team=editorial

environment=production

department=marketing
```

---

## 37.2 Annotations

Annotations digunakan untuk informasi tambahan.

Contoh:

- owner
- documentation
- repository
- contact
- notes

Engine tidak diwajibkan memahami isi Annotation.

---

## 37.3 Tags

Workflow dapat memiliki daftar Tag.

Contoh:

```
news

image

translation

publishing
```

Tag digunakan untuk kebutuhan pencarian dan organisasi.

---

# 38. Security Considerations

Workflow tidak menyimpan kredensial maupun informasi sensitif.

Workflow hanya mereferensikan kontrak yang diperlukan.

Pengelolaan rahasia dilakukan oleh Runtime atau Engine.

---

## 38.1 Secret Reference

Workflow dapat mereferensikan Secret melalui identifier.

Contoh:

```
secretRef

openai-production
```

Workflow tidak boleh menyimpan nilai Secret secara langsung.

---

## 38.2 Permission

Workflow dapat mendeklarasikan kebutuhan Permission.

Contoh:

- publish.article
- read.memory
- invoke.capability
- access.storage

Engine bertanggung jawab melakukan proses otorisasi.

---

## 38.3 Tenant Isolation

Pada implementasi Multi-Tenant:

- Workflow Definition dapat dibagikan.
- Execution Context harus terisolasi.
- Data antar Tenant tidak boleh saling terlihat.
- Memory tetap mengikuti arsitektur "Memory Outside Agent".

---

# 39. Observability

Workflow harus dapat diamati selama siklus hidup eksekusinya.

Observability merupakan tanggung jawab Engine, namun Workflow menyediakan identitas dan metadata yang diperlukan.

---

## 39.1 Traceability

Setiap Execution harus dapat ditelusuri menggunakan identifier seperti:

- workflowId
- workflowVersion
- executionId
- traceId
- correlationId

Identifier tersebut memungkinkan pelacakan end-to-end.

---

## 39.2 Metrics

Workflow Engine dapat menghasilkan metrik seperti:

- execution count
- success rate
- failure rate
- retry count
- average duration
- queue time
- timeout count

Workflow hanya mendefinisikan identitas yang menjadi sumber metrik tersebut.

---

## 39.3 Logging

Engine harus menghasilkan log yang dapat dikorelasikan dengan Execution.

Minimal setiap log mengandung:

- timestamp
- executionId
- workflowId
- nodeId (jika ada)
- severity
- message

Format log merupakan tanggung jawab implementasi Engine.

---

## 39.4 Audit Trail

Workflow Engine harus mampu menyediakan Audit Trail terhadap perubahan penting, antara lain:

- Workflow Published
- Workflow Deprecated
- Workflow Archived
- Workflow Started
- Workflow Completed
- Workflow Failed
- Workflow Cancelled

Audit Trail harus bersifat append-only dan tidak boleh diubah setelah dicatat.

---

# 40. Workflow Constraints

Agar Workflow tetap konsisten dengan prinsip MMOS, batasan berikut berlaku.

Workflow:

- tidak mengandung kode yang dapat dieksekusi
- tidak memilih Runtime
- tidak memilih Agent
- tidak memanggil LLM secara langsung
- tidak mengakses Memory secara langsung
- tidak menyimpan Execution State
- tidak menyimpan Secret
- tidak mengandung logika implementasi Engine
- tidak bergantung pada vendor AI tertentu

Seluruh implementasi operasional tetap menjadi tanggung jawab Engine sesuai prinsip:

- Orchestrator Coordinates
- Engine Executes
- Runtime Agnostic
- Capability Based
- Contract First

---

# 41. Workflow States

Workflow Execution memiliki sekumpulan State standar yang digunakan oleh seluruh Engine.

State merepresentasikan kondisi eksekusi, bukan definisi Workflow.

Definisi Workflow tetap immutable.

---

## 41.1 State Model

Workflow Execution mengikuti State Machine berikut.

```
Created
    │
    ▼
Queued
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

State Transition hanya boleh dilakukan sesuai aturan yang didefinisikan.

---

## 41.2 Created

Execution telah dibuat.

Workflow belum dijadwalkan untuk dijalankan.

---

## 41.3 Queued

Execution menunggu Resource yang diperlukan.

Contoh:

- Worker
- Runtime
- Capability
- External Resource

---

## 41.4 Running

Workflow sedang dieksekusi.

Node dapat berada pada status yang berbeda selama Workflow berada pada state ini.

---

## 41.5 Paused

Workflow dihentikan sementara.

Contoh penyebab:

- Human Approval
- Waiting Event
- Manual Pause
- Maintenance
- Policy

Selama Pause tidak boleh ada Node baru yang dimulai.

---

## 41.6 Completed

Seluruh Node wajib telah selesai sesuai kontrak.

Workflow menghasilkan Output yang valid.

---

## 41.7 Failed

Workflow dihentikan akibat kegagalan yang tidak dapat dipulihkan.

Failure harus dicatat sebagai Event.

---

## 41.8 Cancelled

Workflow dihentikan sebelum selesai.

Cancellation dapat memicu Compensation apabila didefinisikan.

---

# 42. Node States

Setiap Node memiliki Lifecycle sendiri.

Node State independen terhadap Node lain.

---

## 42.1 Node State Machine

```
Pending

↓

Ready

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

## 42.2 Pending

Dependency belum terpenuhi.

Node belum dapat dijalankan.

---

## 42.3 Ready

Seluruh dependency telah terpenuhi.

Node siap dipilih oleh Engine.

---

## 42.4 Running

Node sedang diproses oleh Agent yang dipilih Orchestrator.

---

## 42.5 Completed

Node berhasil menghasilkan Output sesuai Contract.

---

## 42.6 Failed

Node gagal.

Workflow Engine akan menentukan langkah berikutnya berdasarkan Failure Strategy.

---

## 42.7 Cancelled

Node dihentikan sebelum selesai.

---

# 43. State Transition Rules

Workflow Engine harus memastikan seluruh transisi mengikuti aturan berikut.

---

## 43.1 Valid Transition

Contoh transisi yang valid.

```
Created

↓

Queued

↓

Running

↓

Completed
```

---

## 43.2 Invalid Transition

Contoh berikut tidak diperbolehkan.

```
Completed

↓

Running
```

```
Cancelled

↓

Running
```

```
Failed

↓

Completed
```

Execution yang telah berakhir tidak boleh diaktifkan kembali.

---

## 43.3 Terminal State

State berikut merupakan Terminal State.

- Completed
- Failed
- Cancelled

Tidak boleh ada transisi keluar dari Terminal State.

---

# 44. Workflow Events

Seluruh perubahan penting harus menghasilkan Event.

Event mengikuti Event Catalog resmi MMOS.

Workflow Engine wajib mempublikasikan Event secara konsisten.

---

## 44.1 Lifecycle Events

Minimal Event berikut harus tersedia.

- WorkflowCreated
- WorkflowQueued
- WorkflowStarted
- WorkflowPaused
- WorkflowResumed
- WorkflowCompleted
- WorkflowFailed
- WorkflowCancelled

---

## 44.2 Node Events

Minimal Event berikut harus tersedia.

- NodeStarted
- NodeCompleted
- NodeFailed
- NodeRetried
- NodeCancelled
- NodeTimeout

---

## 44.3 System Events

Workflow Engine dapat menghasilkan Event tambahan.

Contoh:

- RuntimeUnavailable
- CapabilityUnavailable
- QueueOverflow
- RetryScheduled
- CompensationStarted
- CompensationCompleted

---

# 45. Correlation Model

Setiap Workflow Execution harus dapat dikorelasikan dengan seluruh aktivitas yang berkaitan.

Model korelasi memungkinkan pelacakan end-to-end pada sistem terdistribusi.

---

## 45.1 Execution Identity

Minimal identifier yang digunakan:

- executionId
- workflowId
- workflowVersion
- traceId
- correlationId

Identifier tersebut harus bersifat immutable selama Execution berlangsung.

---

## 45.2 Parent-Child Relationship

Apabila Workflow memanggil Sub Workflow, hubungan Parent dan Child harus dipertahankan.

Contoh:

```
Workflow A

Execution-100

↓

Workflow B

Execution-245
```

Execution-245 tetap menyimpan referensi ke Parent Execution.

---

## 45.3 Distributed Correlation

Ketika Workflow berinteraksi dengan sistem eksternal, informasi korelasi harus diteruskan sejauh memungkinkan.

Contoh:

- HTTP Header
- Message Metadata
- Event Metadata
- gRPC Metadata

Implementasi teknis merupakan tanggung jawab Engine.

---

# 46. Idempotency

Workflow harus mendukung operasi yang aman terhadap pengulangan permintaan.

Idempotency mencegah pekerjaan yang sama dieksekusi lebih dari sekali akibat Retry atau gangguan jaringan.

---

## 46.1 Workflow Idempotency

Execution dapat memiliki Idempotency Key.

Apabila permintaan identik diterima kembali, Engine dapat mengembalikan Execution yang telah ada sesuai kebijakan implementasi.

---

## 46.2 Node Idempotency

Node yang berinteraksi dengan sistem eksternal sebaiknya bersifat idempotent.

Contoh:

- pembayaran
- pengiriman email
- pembuatan invoice
- publikasi konten

Implementasi berada pada Capability atau Engine.

---

## 46.3 Idempotency Scope

Idempotency dapat diterapkan pada:

- Workflow
- Node
- Capability Invocation
- External API

Scope ditentukan oleh implementasi Engine.

---

# 47. Deterministic Execution

Workflow harus menghasilkan perilaku yang dapat diprediksi ketika dijalankan dengan definisi Workflow, Input, dan kondisi yang sama.

Engine tidak boleh mengubah Graph maupun Contract selama Execution berlangsung.

---

## 47.1 Deterministic Graph

Graph yang dipublikasikan merupakan satu-satunya sumber kebenaran.

Engine tidak boleh:

- menambah Node
- menghapus Node
- mengubah Edge
- mengubah Dependency

selama Workflow berjalan.

---

## 47.2 Deterministic Contract

Input Contract dan Output Contract harus tetap konsisten selama satu Execution.

Perubahan kontrak hanya dapat dilakukan melalui versi Workflow yang baru.

---

## 47.3 Engine Responsibility

Engine dapat mengoptimalkan cara eksekusi, seperti:

- penjadwalan
- alokasi Worker
- pemilihan Runtime
- strategi antrean

namun optimasi tersebut tidak boleh mengubah hasil logis Workflow maupun melanggar kontrak yang telah ditetapkan.

---

# 48. Scheduling Model

Workflow dapat dijalankan melalui berbagai mekanisme pemicu (trigger).

Workflow hanya mendeklarasikan jenis Trigger yang didukung.

Workflow Engine bertanggung jawab melakukan penjadwalan dan inisiasi Execution.

---

## 48.1 Manual Trigger

Workflow dijalankan secara eksplisit oleh pengguna atau sistem.

Contoh:

- API Request
- CLI
- Dashboard
- SDK

Manual Trigger menghasilkan satu Execution baru untuk setiap permintaan yang valid.

---

## 48.2 Scheduled Trigger

Workflow dapat dijalankan berdasarkan jadwal.

Contoh:

- Every Hour
- Daily
- Weekly
- Monthly
- Cron Expression

Interpretasi jadwal merupakan tanggung jawab Engine.

---

## 48.3 Event Trigger

Workflow dapat dimulai setelah Event tertentu diterima.

Contoh:

- article.created
- payment.completed
- image.uploaded
- deployment.finished

Event harus sesuai dengan Event Contract yang telah didefinisikan.

---

## 48.4 Parent Workflow Trigger

Workflow dapat dijalankan oleh Workflow lain sebagai Sub Workflow.

Execution baru harus mewarisi Context yang diperlukan dari Parent Workflow melalui Input Contract.

---

# 49. Concurrency Model

Workflow mendukung eksekusi secara bersamaan sesuai kemampuan Engine.

Concurrency tidak boleh mengubah hasil logis Workflow.

---

## 49.1 Workflow Concurrency

Beberapa Execution dari Workflow yang sama dapat berjalan secara bersamaan.

Contoh:

```
Workflow A

Execution-001

Running

Execution-002

Running

Execution-003

Running
```

Setiap Execution harus memiliki Context yang terisolasi.

---

## 49.2 Node Concurrency

Node yang tidak memiliki dependency dapat dijalankan secara paralel.

Contoh:

```
        A

      / | \

     B  C  D
```

Engine bertanggung jawab menentukan jumlah Worker yang digunakan.

---

## 49.3 Concurrency Limit

Workflow dapat menentukan batas maksimum Execution yang diizinkan.

Contoh:

```
Maximum Concurrent Execution

100
```

Perilaku ketika batas tercapai ditentukan oleh Engine.

---

## 49.4 Resource Contention

Apabila beberapa Execution membutuhkan Resource yang sama, Engine bertanggung jawab melakukan koordinasi agar tidak terjadi konflik.

Strategi implementasi berada di luar ruang lingkup dokumen ini.

---

# 50. Resource Requirements

Workflow dapat mendeklarasikan kebutuhan Resource secara logis.

Workflow tidak menentukan implementasi fisik Resource.

---

## 50.1 Runtime Requirement

Workflow dapat menyatakan kebutuhan Runtime tertentu melalui Capability Requirement.

Workflow tidak boleh menyebut vendor AI secara langsung.

Contoh:

```
Capability

text.summarize
```

Bukan:

```
OpenAI GPT

Claude

Gemini
```

---

## 50.2 Compute Requirement

Workflow dapat mendeklarasikan kebutuhan komputasi secara umum.

Contoh:

- CPU Intensive
- Memory Intensive
- GPU Preferred

Engine memutuskan bagaimana kebutuhan tersebut dipenuhi.

---

## 50.3 External Dependency

Workflow dapat bergantung pada layanan eksternal.

Ketergantungan tersebut harus dinyatakan melalui Capability atau Service Contract.

Workflow tidak boleh memanggil layanan eksternal secara langsung.

---

# 51. Service Interaction

Workflow dapat berinteraksi dengan layanan lain melalui kontrak resmi MMOS.

Seluruh interaksi harus mengikuti prinsip **Contract First**.

---

## 51.1 Service Contract

Workflow hanya mengenali Service Contract.

Workflow tidak mengetahui implementasi Service.

Contoh:

```
Storage Service

Notification Service

Translation Service
```

Implementasi Service berada di luar Workflow.

---

## 51.2 Capability Invocation

Workflow meminta pekerjaan melalui Capability.

Contoh:

```
Capability

image.generate
```

Workflow tidak mengetahui Agent maupun Runtime yang akan dipilih.

---

## 51.3 External Integration

Integrasi dengan sistem eksternal dilakukan melalui Engine atau Service.

Workflow hanya mendefinisikan kontrak Input dan Output.

---

# 52. Runtime Independence

Workflow harus dapat dijalankan pada Runtime yang berbeda tanpa perubahan definisi.

Hal ini merupakan implementasi prinsip **Runtime Agnostic**.

---

## 52.1 Runtime Selection

Workflow tidak memilih Runtime.

Orchestrator memilih Runtime berdasarkan:

- Capability
- Policy
- Availability
- Resource
- Cost
- Preference

---

## 52.2 Runtime Replacement

Runtime dapat diganti tanpa mengubah Workflow.

Contoh:

```
OpenAI

↓

Claude
```

atau

```
Gemini

↓

Qwen
```

Selama Capability tetap terpenuhi, Workflow tidak berubah.

---

## 52.3 Runtime Failure

Apabila Runtime tidak tersedia, Engine dapat memilih Runtime lain yang kompatibel sesuai Policy.

Workflow tidak perlu dimodifikasi.

---

# 53. Capability Resolution

Workflow mendefinisikan Capability yang dibutuhkan, bukan implementasinya.

Capability Resolution dilakukan sebelum Node dijalankan.

---

## 53.1 Resolution Process

Secara konseptual, prosesnya adalah:

```
Workflow Node

↓

Capability

↓

Orchestrator

↓

Agent

↓

Runtime
```

Workflow berhenti pada tingkat Capability.

---

## 53.2 Resolution Failure

Apabila Capability tidak dapat dipenuhi:

- Node dianggap gagal.
- Failure Strategy diterapkan.
- Event dipublikasikan.
- Retry dapat dilakukan apabila memenuhi Retry Policy.

---

## 53.3 Capability Compatibility

Capability yang dipilih harus kompatibel dengan:

- Input Contract
- Output Contract
- Version Requirement
- Policy Requirement

Validasi dilakukan sebelum Invocation.

---

# 54. Deployment Considerations

Workflow harus dapat dipublikasikan dan dikelola sebagai artefak independen.

Deployment tidak mengubah isi Workflow.

---

## 54.1 Deployment Unit

Workflow diperlakukan sebagai Deployment Unit.

Satu Deployment dapat berisi satu atau lebih Workflow sesuai kebutuhan implementasi.

---

## 54.2 Publishing

Sebelum dipublikasikan, Workflow harus:

- tervalidasi
- memiliki versi
- memiliki identitas
- memiliki kontrak lengkap

Workflow yang belum memenuhi persyaratan tersebut tidak boleh dipublikasikan.

---

## 54.3 Rollback

Rollback dilakukan dengan mengaktifkan kembali versi Workflow sebelumnya.

Workflow yang telah dipublikasikan tidak boleh dimodifikasi untuk keperluan Rollback.

---

## 54.4 Deprecation

Workflow dapat ditandai sebagai **Deprecated**.

Workflow yang berstatus Deprecated:

- tetap dapat dijalankan oleh Execution yang telah ada
- tidak direkomendasikan untuk Deployment baru
- tetap mempertahankan kompatibilitas kontrak hingga diarsipkan

---

# 55. Workflow Portability

Workflow harus dapat dipindahkan antar lingkungan tanpa mengubah definisi Workflow.

Portabilitas merupakan implementasi dari prinsip:

- Runtime Agnostic
- Contract First
- Capability Based

Perbedaan implementasi hanya berada pada konfigurasi Engine.

---

## 55.1 Environment Independence

Workflow tidak boleh mengandung informasi spesifik lingkungan.

Contoh yang tidak boleh disimpan di dalam Workflow:

- hostname
- IP Address
- API Endpoint
- database connection
- credential
- secret
- vendor runtime

Seluruh konfigurasi tersebut merupakan tanggung jawab Deployment dan Engine.

---

## 55.2 Configuration Injection

Nilai yang bergantung pada lingkungan harus disediakan saat Deployment atau Execution.

Contoh:

```
Environment

↓

Configuration

↓

Execution Context
```

Workflow tetap tidak berubah.

---

## 55.3 Environment Compatibility

Workflow yang sama harus dapat dijalankan pada berbagai lingkungan.

Contoh:

- Development
- Testing
- Staging
- Production

Perbedaan hanya berada pada konfigurasi operasional.

---

# 56. Workflow Composition

Workflow dapat disusun dari beberapa Workflow yang lebih kecil.

Pendekatan ini mendukung prinsip modularitas dan penggunaan ulang (reusability).

---

## 56.1 Composition Principles

Workflow yang baik memiliki karakteristik berikut:

- modular
- reusable
- loosely coupled
- contract driven
- capability oriented

Workflow yang terlalu besar sebaiknya dipecah menjadi beberapa Sub Workflow.

---

## 56.2 Composition Boundary

Komunikasi antar Workflow hanya dilakukan melalui:

- Input Contract
- Output Contract
- Event
- Service Contract

Workflow tidak boleh mengakses state internal Workflow lain.

---

## 56.3 Reusable Workflow

Workflow dapat digunakan kembali oleh berbagai Workflow lain.

Contoh:

```
Generate Summary

↓

Content Pipeline

Marketing Pipeline

Knowledge Pipeline
```

Seluruh Workflow menggunakan kontrak yang sama.

---

# 57. Workflow Templates

Workflow dapat dijadikan Template untuk membangun Workflow lain.

Template bukan Execution.

Template merupakan definisi awal yang dapat digunakan kembali.

---

## 57.1 Template Characteristics

Template dapat berisi:

- Graph
- Node Structure
- Policy
- Contract
- Metadata

Template tidak memiliki Execution State.

---

## 57.2 Template Instantiation

Workflow baru dapat dibuat berdasarkan Template.

Proses instansiasi menghasilkan Workflow baru dengan Identity dan Version sendiri.

Template asli tidak berubah.

---

## 57.3 Template Compatibility

Perubahan terhadap Template tidak memengaruhi Workflow yang telah dibuat sebelumnya.

Setiap Workflow mempertahankan definisinya masing-masing.

---

# 58. Workflow Interoperability

Workflow harus mampu berinteraksi dengan komponen MMOS lainnya melalui kontrak resmi.

Interoperabilitas dilakukan tanpa ketergantungan langsung terhadap implementasi internal.

---

## 58.1 Agent Interaction

Workflow tidak berinteraksi langsung dengan Agent.

Alur interaksi bersifat konseptual sebagai berikut:

```
Workflow

↓

Capability

↓

Orchestrator

↓

Agent
```

Pemilihan Agent sepenuhnya menjadi tanggung jawab Orchestrator.

---

## 58.2 Memory Interaction

Workflow tidak mengakses Memory secara langsung.

Apabila diperlukan akses Memory, Workflow meminta Capability yang sesuai.

Contoh:

```
Workflow

↓

Capability

memory.retrieve
```

Arsitektur **Memory Outside Agent** tetap dipertahankan.

---

## 58.3 Event Interaction

Workflow dapat:

- menghasilkan Event
- menunggu Event
- melanjutkan Execution berdasarkan Event

Seluruh Event harus mengikuti Event Contract resmi MMOS.

---

# 59. Compliance Requirements

Seluruh implementasi Workflow harus memenuhi prinsip arsitektur MMOS yang telah ditetapkan.

Dokumen ini tidak menggantikan dokumen arsitektur, tetapi menjadi spesifikasi implementasi Workflow.

---

## 59.1 Mandatory Requirements

Implementasi Workflow wajib memenuhi ketentuan berikut:

- Everything is Object
- Contract First
- Event Driven
- Runtime Agnostic
- Capability Based
- Memory Outside Agent
- Orchestrator Coordinates
- Engine Executes
- Repository Pattern
- Service Contract
- Immutable Object Identity

Pelanggaran terhadap salah satu prinsip dianggap sebagai implementasi yang tidak sesuai spesifikasi.

---

## 59.2 Implementation Independence

Dokumen ini tidak mewajibkan:

- bahasa pemrograman tertentu
- framework tertentu
- message broker tertentu
- database tertentu
- runtime AI tertentu

Seluruh keputusan implementasi berada pada masing-masing Engine selama tetap mematuhi kontrak yang didefinisikan.

---

## 59.3 Forward Compatibility

Workflow harus dirancang agar tetap kompatibel dengan evolusi MMOS di masa mendatang.

Penambahan fitur baru tidak boleh merusak kontrak Workflow yang telah dipublikasikan.

Perubahan yang bersifat tidak kompatibel harus dilakukan melalui versi baru.

---

# 60. Conformance

Suatu implementasi dinyatakan sesuai dengan spesifikasi IMS-300 apabila memenuhi seluruh persyaratan berikut.

---

## 60.1 Workflow Definition

Implementasi harus mendukung:

- Workflow Object
- Workflow Graph
- Node
- Edge
- Input Contract
- Output Contract
- Policy
- Metadata

---

## 60.2 Execution Semantics

Implementasi harus mendukung:

- Directed Graph Execution
- Dependency Resolution
- Conditional Execution
- Parallel Execution
- Merge
- Loop
- Sub Workflow
- Human Task
- Event Waiting

---

## 60.3 Validation

Implementasi harus menyediakan validasi terhadap:

- Workflow Structure
- Graph
- Contract
- Capability Reference
- Mapping
- Policy

Workflow yang gagal divalidasi tidak boleh dipublikasikan.

---

## 60.4 Lifecycle

Implementasi harus mendukung Lifecycle resmi Workflow:

- Draft
- Validated
- Published
- Deprecated
- Archived

serta Lifecycle Execution:

- Created
- Queued
- Running
- Paused
- Completed
- Failed
- Cancelled

---

## 60.5 Interoperability

Implementasi harus mampu berinteraksi dengan komponen MMOS melalui:

- Capability
- Event
- Service Contract
- Repository
- Execution Engine

tanpa ketergantungan langsung terhadap implementasi internal masing-masing komponen.

---

# 61. Normative Summary

Bagian ini merangkum persyaratan normatif dari spesifikasi Workflow.

Kata kunci berikut digunakan sesuai arti normatifnya.

- MUST
- MUST NOT
- SHOULD
- SHOULD NOT
- MAY

---

## 61.1 Workflow Definition

Workflow MUST:

- memiliki Workflow Identifier
- memiliki Version
- memiliki Input Contract
- memiliki Output Contract
- memiliki Graph yang valid
- memiliki minimal satu Entry Node
- memiliki minimal satu Exit Node

Workflow MUST NOT:

- menyimpan Runtime State
- menyimpan Secret
- memilih Runtime
- memilih Agent
- bergantung pada vendor AI tertentu

---

## 61.2 Graph

Workflow Graph MUST:

- bersifat directed
- memiliki struktur yang valid
- bebas dari circular dependency
- bebas dari orphan node
- bebas dari duplicate identifier

Workflow Engine MUST menolak Graph yang tidak memenuhi persyaratan tersebut.

---

## 61.3 Node

Setiap Node MUST:

- memiliki Identifier unik
- memiliki Node Type
- memiliki Capability
- memiliki Input Mapping
- memiliki Output Mapping

Node MUST NOT melakukan implementasi pekerjaan secara langsung.

---

## 61.4 Execution

Workflow Engine MUST:

- memvalidasi Workflow
- memvalidasi Contract
- memvalidasi Mapping
- mempublikasikan Event
- menjaga Execution State
- menerapkan Policy

Workflow MUST tetap bersifat deklaratif.

---

## 61.5 Compatibility

Workflow SHOULD:

- reusable
- modular
- portable
- runtime agnostic
- capability based

Workflow SHOULD NOT:

- memiliki dependency implementasi
- mengandung konfigurasi lingkungan
- mengandung logika vendor tertentu

---

# 62. Relationship with Other Specifications

Dokumen ini merupakan bagian dari keluarga spesifikasi MMOS.

IMS-300 tidak berdiri sendiri dan harus digunakan bersama spesifikasi lainnya.

---

## 62.1 IMS Dependencies

IMS-300 bergantung pada dokumen berikut.

| Document | Status | Purpose |
|-----------|--------|---------|
| IMS-100 Object Specification | COMPLETE | Base Object Contract |
| IMS-200 Agent Specification | COMPLETE | Universal Agent Contract |

Dokumen IMS berikut akan memperluas spesifikasi Workflow pada aspek implementasi.

| Document | Purpose |
|-----------|---------|
| IMS-400 Execution Specification | Execution Model |
| IMS-500 Memory Specification | Memory Contract |
| IMS-600 Capability Specification | Capability Contract |
| IMS-700 Runtime Specification | Runtime Contract |
| IMS-800 Event Specification | Event Contract |
| IMS-900 Service Contract | Service Interaction |

---

## 62.2 MAS Dependencies

Spesifikasi ini mengacu pada seluruh dokumen Architecture (MAS).

Secara khusus:

- MAS-200 Execution Model
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-500 Memory & Knowledge
- MAS-600 Agent Architecture
- MAS-700 AI Runtime

IMS-300 tidak menggantikan dokumen Architecture, tetapi mengkonkretkan konsep-konsep tersebut ke dalam kontrak Workflow yang dapat diimplementasikan.

---

# 63. Future Extensions

MMOS dirancang agar Workflow dapat berkembang tanpa merusak kompatibilitas.

Ekstensi harus mengikuti prinsip **Forward Compatibility** dan **Contract First**.

Contoh area pengembangan di masa mendatang meliputi:

- Dynamic Workflow Composition
- Adaptive Workflow Optimization
- Distributed Workflow Federation
- Workflow Marketplace
- Visual Workflow Designer
- Workflow Analytics
- AI-assisted Workflow Authoring
- Workflow Simulation
- Policy Engine Integration
- Multi-cluster Workflow Execution

Seluruh ekstensi harus mempertahankan kompatibilitas terhadap Workflow yang telah dipublikasikan.

---

# 64. Glossary

Istilah pada dokumen ini mengikuti definisi resmi pada **glossary.md**.

Ringkasan istilah yang paling sering digunakan:

| Term | Description |
|------|-------------|
| Workflow | Declarative definition of execution |
| Execution | Runtime instance of a Workflow |
| Node | Smallest executable workflow unit |
| Edge | Transition between nodes |
| Capability | Logical function requested by a node |
| Agent | Capability provider selected by Orchestrator |
| Runtime | AI execution environment |
| Policy | Declarative execution rule |
| Mapping | Explicit data flow definition |
| Contract | Formal interface specification |

Apabila terjadi perbedaan definisi, **glossary.md** menjadi referensi utama.

---

# 65. References

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

---

# 66. Document Status

Document Name

IMS-300 Workflow Specification

Version

1.0

Status

COMPLETE

Category

Implementation Specification

Location

```
specs/ims/IMS-300-workflow-spec.md
```

Related Specifications

- IMS-100
- IMS-200
- IMS-400
- IMS-500
- IMS-600
- IMS-700
- IMS-800
- IMS-900

---

# END OF DOCUMENT