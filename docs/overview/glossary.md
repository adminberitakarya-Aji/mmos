# MMOS Glossary

Version: Draft v1.0  
Document: `reference/glossary.md`  
Status: IN PROGRESS (Part 1 of 4)

---

# 1. Purpose

Glossary merupakan kamus resmi istilah yang digunakan dalam seluruh spesifikasi MMOS.

Dokumen ini memastikan seluruh arsitek, developer, QA, technical writer, dan stakeholder menggunakan terminologi yang konsisten.

Glossary menjadi **Single Source of Truth** untuk seluruh istilah pada MMOS.

---

# 2. Scope

Glossary mencakup:

- Business Terms
- Architecture Terms
- Execution Terms
- AI Terms
- Runtime Terms
- Platform Terms
- Infrastructure Terms

Glossary tidak mendefinisikan implementasi teknis.

---

# 3. Naming Convention

Seluruh istilah resmi menggunakan aturan berikut.

- Nama menggunakan PascalCase untuk Object.
- Capability menggunakan `<Category>.<Action>`.
- Event menggunakan Past Tense.
- Engine menggunakan akhiran **Engine**.
- Runtime menggunakan akhiran **Runtime**.

Contoh.

```
Workflow

Task

Capability

Execution

AI Runtime

Workflow Engine

Execution Engine

TaskCompleted

Image.Generate
```

---

# 4. Business Terms

## Business

Entitas tertinggi yang merepresentasikan organisasi atau unit bisnis yang menggunakan MMOS.

---

## Organization

Representasi organisasi yang mengelola satu atau lebih Workspace.

---

## Workspace

Area kerja yang berisi Project, Asset, Workflow, Template, dan pengguna.

---

## Project

Kumpulan pekerjaan yang memiliki tujuan bisnis tertentu.

Project menjadi container utama seluruh Workflow.

---

## Composition

Definisi lengkap suatu produk multimedia yang terdiri dari Workflow, Asset, Template, dan konfigurasi.

Composition bukan hasil render.

Composition adalah blueprint pekerjaan.

---

## Campaign

Sekelompok Composition atau Workflow yang dijalankan untuk tujuan bisnis tertentu.

---

## User

Aktor yang menggunakan Platform MMOS.

---

## Role

Kumpulan hak akses yang dimiliki User.

---

## Permission

Hak untuk melakukan operasi tertentu pada Object MMOS.

---

# 5. Execution Terms

## Workflow

Urutan proses bisnis yang terdiri dari beberapa Stage.

Workflow mendefinisikan **apa yang terjadi**.

---

## Stage

Kelompok Task yang berada pada fase tertentu.

Stage digunakan untuk mengelompokkan proses.

---

## Task

Unit pekerjaan terkecil yang dijalankan oleh Execution Engine.

Task meminta satu Capability.

---

## Execution

Instance yang sedang menjalankan Workflow.

Execution memiliki lifecycle sendiri.

---

## Queue

Tempat penyimpanan sementara pekerjaan sebelum diproses.

---

## Scheduler

Komponen yang menjalankan pekerjaan berdasarkan waktu atau aturan tertentu.

---

## Retry

Proses menjalankan kembali pekerjaan yang gagal.

---

## Timeout

Batas maksimum waktu eksekusi.

---

# 6. AI Terms

## AI

Artificial Intelligence yang digunakan untuk menghasilkan atau memproses informasi.

---

## Model

Model AI yang menjalankan inference.

Contoh.

- GPT
- Gemini
- Claude
- Qwen
- DeepSeek

Model bukan Capability.

---

## Provider

Penyedia layanan AI.

Contoh.

- OpenAI
- Anthropic
- Google
- Alibaba
- DeepSeek

Provider dipilih oleh AI Runtime.

---

## Tool

Implementasi teknis yang digunakan Runtime untuk menjalankan Capability.

Tool dapat menggunakan satu atau beberapa Provider.

---

## Inference

Proses menjalankan Model AI untuk menghasilkan output.

---

## Prompt

Input yang diberikan kepada Model AI.

Prompt bukan Workflow.

---

## Context

Informasi tambahan yang digunakan AI untuk menghasilkan jawaban.

Context dapat berasal dari Memory atau Knowledge.

---

## Embedding

Representasi numerik dari data yang digunakan untuk Semantic Search.

---

## Vector

Representasi matematis hasil Embedding.

---

# 7. Capability Terms

## Capability

Kontrak kemampuan yang dapat dipanggil oleh Task.

Capability mendeskripsikan **apa** yang dilakukan.

Bukan **bagaimana** cara melakukannya.

---

## Capability Registry

Daftar resmi seluruh Capability yang tersedia.

---

## Capability Resolution

Proses AI Runtime memilih Tool, Provider, dan Model untuk menjalankan Capability.

---

## Contract

Definisi input dan output yang stabil.

Contract menjadi dasar komunikasi antar komponen.

---

## Version

Identitas perubahan menggunakan Semantic Versioning.

---

# 8. Engine Terms

## Engine

Komponen yang memiliki tanggung jawab spesifik.

Engine menjalankan logika sistem.

---

## Workflow Engine

Engine yang menjalankan Workflow.

---

## Execution Engine

Engine yang mengelola Execution.

---

## Task Engine

Engine yang menjalankan Task.

---

## Memory Engine

Engine yang mengelola Memory.

---

## Knowledge Engine

Engine yang mengelola Knowledge.

---

## Asset Engine

Engine yang mengelola Asset.

---

## Rendering Engine

Engine yang menghasilkan output multimedia.

---

## Notification Engine

Engine yang mengirim notifikasi.

---

## Billing Engine

Engine yang mengelola penggunaan dan biaya.

---

## Monitoring Engine

Engine yang mengumpulkan metrik operasional.

---

## Part 1 Summary

Bagian ini mendefinisikan istilah dasar yang digunakan di seluruh spesifikasi MMOS, meliputi:

- Business Terms
- Execution Terms
- AI Terms
- Capability Terms
- Engine Terms

Seluruh dokumen MMOS v1.0 wajib menggunakan istilah pada Glossary ini secara konsisten.

---

END OF PART 1/4

Next:

MMOS Glossary — Part 2/4

# 9. Runtime Terms

## AI Runtime

Komponen yang bertanggung jawab menjalankan Capability.

AI Runtime melakukan:

- Capability Resolution
- Tool Selection
- Provider Selection
- Model Selection
- Execution
- Retry
- Fallback

AI Runtime tidak mengandung logika bisnis.

---

## Runtime Context

Kumpulan informasi yang digunakan AI Runtime selama proses eksekusi.

Runtime Context dapat berisi:

- User Context
- Workflow Context
- Memory Context
- Knowledge Context
- Configuration

---

## Runtime Configuration

Konfigurasi yang digunakan AI Runtime.

Contoh:

- Default Provider
- Default Model
- Retry Policy
- Timeout
- Cost Limit

---

## Runtime Resolution

Proses menentukan implementasi terbaik untuk suatu Capability.

Contoh.

```
Capability

↓

Tool

↓

Provider

↓

Model

↓

Execution
```

---

## Runtime Registry

Daftar seluruh Runtime Component yang aktif.

---

## Runtime Policy

Aturan yang digunakan Runtime ketika memilih implementasi.

Contoh.

- Lowest Cost
- Fastest Response
- Highest Quality
- Preferred Provider
- Regional Compliance

---

# 10. Memory & Knowledge Terms

## Memory

Informasi yang disimpan untuk digunakan kembali oleh AI.

Memory dapat berupa:

- Conversation Memory
- User Memory
- Project Memory
- Workflow Memory

---

## Short-Term Memory

Memory yang hanya berlaku selama satu Execution.

---

## Long-Term Memory

Memory yang disimpan lintas Workflow dan Execution.

---

## Knowledge

Informasi yang berasal dari dokumen, basis pengetahuan, atau sumber eksternal.

Knowledge bukan Memory.

---

## Knowledge Base

Kumpulan Knowledge yang telah diindeks.

---

## Knowledge Retrieval

Proses mengambil Knowledge yang relevan.

---

## Semantic Search

Pencarian berdasarkan makna, bukan hanya kata kunci.

---

## Vector Database

Penyimpanan Embedding yang digunakan untuk Semantic Search.

---

## Retrieval

Proses memperoleh informasi dari Memory atau Knowledge.

---

# 11. Asset Terms

## Asset

Objek digital yang digunakan atau dihasilkan oleh MMOS.

Contoh:

- Image
- Video
- Audio
- Document

---

## Asset Metadata

Informasi deskriptif mengenai Asset.

Contoh:

- Resolution
- Duration
- Format
- Size
- Creator

---

## Asset Version

Versi dari suatu Asset.

---

## Asset Reference

Referensi ke lokasi penyimpanan Asset.

---

## Thumbnail

Representasi kecil dari Image atau Video.

---

## Render

Proses menghasilkan Asset akhir.

---

## Rendering

Proses mengubah Composition menjadi output multimedia.

---

# 12. Template Terms

## Template

Blueprint yang dapat digunakan ulang untuk membuat Workflow atau Composition.

---

## Template Version

Versi dari Template.

---

## Template Registry

Daftar seluruh Template.

---

## Template Validation

Proses memastikan Template valid.

---

## Template Publishing

Proses mempublikasikan Template agar dapat digunakan.

---

# 13. Event Terms

## Event

Representasi fakta bahwa sesuatu telah terjadi.

Event selalu menggunakan Past Tense.

---

## Publisher

Komponen yang menghasilkan Event.

---

## Subscriber

Komponen yang menerima Event.

---

## Event Bus

Infrastruktur distribusi Event.

---

## Topic

Kanal distribusi Event.

---

## Event Payload

Informasi utama yang dibawa Event.

---

## Correlation ID

Identifier yang menghubungkan seluruh Event dalam satu proses bisnis.

---

## Causation ID

Identifier Event yang menjadi penyebab Event lain.

---

## Replay

Menjalankan ulang Event yang telah disimpan.

---

## Dead Letter Queue (DLQ)

Tempat penyimpanan Event yang gagal diproses setelah Retry maksimum.

---

# 14. Platform Terms

## Platform

Keseluruhan sistem MMOS.

---

## Platform Service

Layanan pendukung Platform.

Contoh:

- Authentication
- Notification
- Billing
- Monitoring

---

## API

Application Programming Interface yang digunakan untuk komunikasi eksternal.

---

## SDK

Software Development Kit untuk pengembang aplikasi.

---

## Plugin

Komponen tambahan yang memperluas kemampuan Platform.

---

## Registry

Daftar resmi suatu komponen.

Contoh:

- Engine Registry
- Capability Registry
- Template Registry
- Event Registry

---

## Configuration

Sekumpulan parameter yang mengatur perilaku Platform.

---

# 15. Security Terms

## Authentication

Proses memverifikasi identitas.

---

## Authorization

Proses menentukan hak akses.

---

## Access Control

Mekanisme pembatasan akses terhadap Resource.

---

## Audit Trail

Catatan seluruh aktivitas penting.

---

## Encryption

Proses melindungi data menggunakan kriptografi.

---

## Secret

Data sensitif seperti API Key atau Token.

Secret tidak boleh muncul pada Event maupun Capability Contract.

---

# 16. Infrastructure Terms

## Service Discovery

Mekanisme menemukan lokasi Service atau Engine.

---

## Load Balancer

Komponen yang mendistribusikan request ke beberapa instance.

---

## Queue

Media antrean untuk pekerjaan asynchronous.

---

## Cache

Penyimpanan sementara untuk meningkatkan performa.

---

## Storage

Media penyimpanan permanen.

---

## Monitoring

Proses pengamatan kondisi sistem secara real-time.

---

## Logging

Pencatatan aktivitas sistem.

---

## Metrics

Data numerik mengenai performa sistem.

---

## Tracing

Pelacakan request lintas Engine menggunakan Correlation ID.

---

## Health Check

Pemeriksaan kondisi operasional suatu Engine atau Service.

---

## Part 2 Summary

Part 2 mendefinisikan istilah yang berkaitan dengan:

- AI Runtime
- Memory & Knowledge
- Asset
- Template
- Event
- Platform
- Security
- Infrastructure

Istilah-istilah ini menjadi acuan standar bagi seluruh komponen teknis MMOS dan harus digunakan secara konsisten pada seluruh spesifikasi.

---

END OF PART 2/4

Next:

MMOS Glossary — Part 3/4

# 17. Object Terms

## Object

Unit data utama di dalam MMOS yang merepresentasikan entitas bisnis, eksekusi, AI, maupun platform.

Setiap Object memiliki:

- Identity
- Lifecycle
- Metadata
- Version
- State

---

## Object ID

Identifier unik yang dimiliki setiap Object.

Object ID tidak berubah selama lifecycle Object.

---

## Object Type

Kategori resmi dari suatu Object.

Contoh:

- Business Object
- Execution Object
- AI Object
- Asset Object
- Knowledge Object
- Platform Object

---

## Object State

Status operasional suatu Object.

Contoh:

```
Draft

Active

Archived

Deleted
```

---

## Object Lifecycle

Urutan perubahan state suatu Object sejak dibuat hingga dihentikan.

---

## Object Metadata

Informasi tambahan mengenai Object.

Contoh:

- Creator
- Created Time
- Updated Time
- Tags
- Labels
- Owner

---

## Object Reference

Referensi menuju Object lain tanpa menyimpan salinan datanya.

---

## Object Registry

Daftar resmi seluruh Object yang tersedia pada Platform.

---

# 18. Architecture Terms

## Architecture

Struktur keseluruhan MMOS beserta hubungan antar komponennya.

---

## Layer

Sekelompok komponen yang memiliki tanggung jawab tertentu.

Contoh:

- Business Layer
- Execution Layer
- Engine Layer
- Runtime Layer
- Platform Layer
- Infrastructure Layer

---

## Component

Bagian modular dari suatu Layer.

---

## Module

Sekelompok Component yang membentuk fungsi tertentu.

---

## Service

Komponen yang menyediakan fungsi tertentu melalui Contract.

---

## Contract

Kesepakatan komunikasi antara dua komponen.

Contract harus stabil.

---

## Interface

Definisi operasi yang disediakan suatu Component.

---

## Dependency

Hubungan penggunaan antara dua komponen.

MMOS hanya memperbolehkan dependency satu arah.

---

## Coupling

Tingkat ketergantungan antar komponen.

MMOS mengutamakan Loose Coupling.

---

## Cohesion

Hubungan internal dalam satu komponen.

MMOS mengutamakan High Cohesion.

---

## Composition

Teknik membangun sistem dari beberapa komponen independen.

---

# 19. Integration Terms

## Integration

Proses menghubungkan MMOS dengan sistem lain.

---

## Connector

Adaptor yang menghubungkan MMOS ke layanan eksternal.

---

## External Service

Service di luar Platform MMOS.

---

## API Gateway

Komponen yang menjadi pintu masuk seluruh API eksternal.

---

## Webhook

Mekanisme pengiriman Event melalui HTTP.

---

## Callback

Pemanggilan kembali setelah proses selesai.

---

## Endpoint

Alamat komunikasi suatu Service.

---

## Request

Permintaan yang dikirim ke suatu Service.

---

## Response

Jawaban dari suatu Service.

---

# 20. Execution Control Terms

## Orchestrator

Komponen yang mengoordinasikan Workflow, Engine, dan Runtime.

Orchestrator tidak mengerjakan AI.

---

## Coordinator

Komponen yang mengatur urutan proses.

---

## Dispatcher

Komponen yang menentukan tujuan suatu request.

---

## Scheduler

Komponen yang menjalankan pekerjaan berdasarkan waktu.

---

## Queue Manager

Komponen yang mengelola antrean pekerjaan.

---

## Worker

Komponen yang menjalankan pekerjaan aktual.

---

## Executor

Komponen yang mengeksekusi suatu Task.

---

# 21. AI Processing Terms

## Generation

Proses menghasilkan konten baru menggunakan AI.

---

## Transformation

Proses mengubah konten yang sudah ada.

---

## Enhancement

Proses meningkatkan kualitas suatu Asset.

---

## Classification

Proses mengelompokkan data.

---

## Detection

Proses menemukan objek atau pola.

---

## Extraction

Proses mengambil informasi tertentu.

---

## Translation

Proses menerjemahkan konten.

---

## Summarization

Proses membuat ringkasan.

---

## Rewriting

Proses menulis ulang konten.

---

## Rendering

Proses menghasilkan output multimedia akhir.

---

# 22. Data Terms

## Data

Informasi yang diproses oleh MMOS.

---

## Structured Data

Data dengan skema tetap.

---

## Unstructured Data

Data tanpa struktur tetap.

Contoh:

- Image
- Video
- Audio
- Document

---

## Metadata

Informasi yang menjelaskan data.

---

## Schema

Definisi struktur data.

---

## Payload

Isi utama Request, Response, atau Event.

---

## Serialization

Proses mengubah Object menjadi format pertukaran data.

---

## Deserialization

Proses mengubah data menjadi Object.

---

# 23. Operational Terms

## Availability

Kemampuan sistem untuk tetap tersedia.

---

## Reliability

Kemampuan sistem bekerja secara konsisten.

---

## Scalability

Kemampuan sistem menangani peningkatan beban.

---

## Fault Tolerance

Kemampuan sistem tetap berjalan saat terjadi kegagalan.

---

## High Availability

Kemampuan sistem meminimalkan downtime.

---

## Observability

Kemampuan memahami kondisi internal sistem melalui:

- Metrics
- Logs
- Traces

---

## Monitoring

Pengamatan kondisi sistem secara terus-menerus.

---

## Alert

Pemberitahuan ketika terjadi kondisi tertentu.

---

## Incident

Gangguan yang memerlukan penanganan.

---

# 24. Development Terms

## SDK

Software Development Kit.

---

## CLI

Command Line Interface.

---

## API

Application Programming Interface.

---

## Plugin

Komponen tambahan yang memperluas Platform.

---

## Extension

Komponen tambahan yang mengikuti Contract MMOS.

---

## Package

Distribusi perangkat lunak.

---

## Library

Kumpulan fungsi yang dapat digunakan ulang.

---

## Framework

Kerangka kerja yang menyediakan struktur aplikasi.

---

## Part 3 Summary

Part 3 mendefinisikan istilah yang berkaitan dengan:

- Object
- Architecture
- Integration
- Execution Control
- AI Processing
- Data
- Operations
- Development

Istilah-istilah ini menjadi dasar komunikasi teknis antar arsitek, developer, QA, DevOps, dan dokumentasi MMOS sehingga seluruh spesifikasi menggunakan kosakata yang seragam.

---

END OF PART 3/4

Next:

MMOS Glossary — Part 4/4 (Final)

# 25. Governance Terms

## Governance

Sekumpulan kebijakan yang mengatur bagaimana MMOS dikembangkan, dioperasikan, dan dipelihara.

Governance memastikan seluruh komponen mengikuti standar arsitektur yang sama.

---

## Architecture Review

Proses evaluasi perubahan terhadap arsitektur MMOS.

Architecture Review dilakukan sebelum perubahan besar dirilis.

---

## Architecture Board

Tim atau mekanisme yang bertanggung jawab menjaga konsistensi arsitektur MMOS.

---

## Standard

Aturan resmi yang wajib diikuti oleh seluruh implementasi MMOS.

---

## Policy

Aturan operasional yang mengendalikan perilaku Platform.

Contoh:

- Security Policy
- Runtime Policy
- Billing Policy
- Retention Policy

---

## Compliance

Kesesuaian implementasi terhadap standar dan kebijakan MMOS.

---

## Deprecation

Status suatu komponen yang masih didukung tetapi tidak lagi direkomendasikan untuk penggunaan baru.

---

## Retirement

Status akhir suatu komponen yang sudah tidak digunakan lagi.

---

# 26. Versioning Terms

## Semantic Versioning

Standar penomoran versi menggunakan format:

```
MAJOR.MINOR.PATCH
```

---

## Major Version

Perubahan yang menyebabkan Breaking Change.

---

## Minor Version

Penambahan fitur tanpa Breaking Change.

---

## Patch Version

Perbaikan bug atau dokumentasi tanpa mengubah kontrak.

---

## Backward Compatibility

Kemampuan versi baru untuk tetap mendukung implementasi versi sebelumnya.

---

## Breaking Change

Perubahan yang menyebabkan implementasi lama tidak lagi kompatibel.

---

# 27. Documentation Terms

## Specification

Dokumen resmi yang mendefinisikan standar MMOS.

---

## Reference

Dokumen teknis yang menjadi acuan implementasi.

---

## Example

Contoh implementasi yang bersifat informatif.

---

## Guideline

Rekomendasi praktik terbaik.

Guideline bukan aturan wajib.

---

## Best Practice

Pendekatan yang direkomendasikan berdasarkan pengalaman implementasi.

---

## Normative

Bagian dokumen yang bersifat wajib.

---

## Informative

Bagian dokumen yang bersifat penjelasan atau contoh.

---

# 28. Reserved Words

Istilah berikut memiliki arti khusus di MMOS dan tidak boleh digunakan dengan makna yang berbeda.

| Reserved Word | Meaning |
|---------------|---------|
| Object | Entitas utama MMOS |
| Workflow | Definisi proses bisnis |
| Stage | Kelompok Task |
| Task | Unit kerja terkecil |
| Execution | Instance Workflow |
| Capability | Kontrak kemampuan |
| Engine | Komponen pemrosesan |
| Runtime | Komponen eksekusi Capability |
| Provider | Penyedia layanan AI |
| Model | Model AI |
| Tool | Implementasi Capability |
| Memory | Penyimpanan konteks AI |
| Knowledge | Basis pengetahuan |
| Event | Fakta yang telah terjadi |
| Asset | Objek multimedia |
| Template | Blueprint yang dapat digunakan ulang |
| Composition | Blueprint produk multimedia |

Istilah-istilah tersebut harus digunakan secara konsisten di seluruh dokumen MMOS.

---

# 29. Acronyms

| Acronym | Meaning |
|----------|---------|
| MMOS | Multimedia Multi-Agent Operating System |
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| SDK | Software Development Kit |
| CLI | Command Line Interface |
| UI | User Interface |
| UX | User Experience |
| JSON | JavaScript Object Notation |
| HTTP | Hypertext Transfer Protocol |
| REST | Representational State Transfer |
| RPC | Remote Procedure Call |
| TLS | Transport Layer Security |
| JWT | JSON Web Token |
| DLQ | Dead Letter Queue |
| KPI | Key Performance Indicator |
| SLA | Service Level Agreement |
| GPU | Graphics Processing Unit |
| CPU | Central Processing Unit |

---

# 30. Terminology Rules

Seluruh dokumen MMOS wajib mengikuti aturan berikut.

## Rule 1

Satu istilah hanya memiliki satu definisi resmi.

---

## Rule 2

Tidak menggunakan sinonim untuk istilah inti.

Contoh.

Benar.

```
Execution
```

Salah.

```
Job

Process

Run
```

---

## Rule 3

Nama Object menggunakan PascalCase.

Contoh.

```
Workflow

Execution

Capability
```

---

## Rule 4

Capability menggunakan format.

```
<Category>.<Action>
```

Contoh.

```
Image.Generate

Video.Render

Knowledge.Search
```

---

## Rule 5

Event menggunakan Past Tense.

Contoh.

```
ExecutionCompleted

WorkflowStarted

AssetUploaded
```

---

## Rule 6

Engine menggunakan suffix **Engine**.

Contoh.

```
Workflow Engine

Task Engine

Rendering Engine
```

---

## Rule 7

Runtime menggunakan suffix **Runtime**.

Contoh.

```
AI Runtime
```

---

## Rule 8

Nama Provider mengikuti nama resmi vendor.

Contoh.

```
OpenAI

Anthropic

Google

Alibaba

DeepSeek
```

---

# 31. Cross Reference

Glossary digunakan oleh seluruh dokumen MMOS.

| Document | Relationship |
|----------|--------------|
| MAS-100 Workspace Definition | Menggunakan Business Terms |
| MAS-200 Execution Model | Menggunakan Execution Terms |
| MAS-300 Engine Architecture | Menggunakan Engine Terms |
| MAS-400 Orchestrator | Menggunakan Orchestrator Terms |
| MAS-500 Memory & Knowledge | Menggunakan Memory & Knowledge Terms |
| MAS-700 AI Runtime | Menggunakan Runtime Terms |
| Object Catalog | Menggunakan Object Terms |
| Capability Catalog | Menggunakan Capability Terms |
| Event Catalog | Menggunakan Event Terms |
| Engine Interaction | Menggunakan Engine & Interaction Terms |

Glossary menjadi referensi terminologi resmi bagi seluruh spesifikasi MMOS.

---

# 32. Glossary Principles

Glossary MMOS dibangun berdasarkan prinsip berikut.

1. **Single Source of Truth** — Setiap istilah hanya memiliki satu definisi resmi.
2. **Consistency** — Istilah yang sama digunakan di seluruh dokumen.
3. **Technology Agnostic** — Definisi tidak bergantung pada vendor atau teknologi tertentu.
4. **Architecture First** — Terminologi mengikuti arsitektur MMOS, bukan implementasi.
5. **Business Friendly** — Dapat dipahami oleh stakeholder bisnis maupun teknis.
6. **Extensible** — Istilah baru dapat ditambahkan tanpa mengubah definisi yang sudah ada.

---

# 33. Document Summary

Glossary merupakan kamus resmi seluruh terminologi MMOS.

Dokumen ini menjadi acuan utama bagi:

- Architecture Team
- Platform Developer
- Engine Developer
- Runtime Developer
- Workflow Developer
- SDK Developer
- Plugin Developer
- QA Engineer
- DevOps Engineer
- Technical Writer
- Product Manager

Dengan adanya Glossary, seluruh spesifikasi MMOS menggunakan bahasa yang konsisten sehingga mengurangi ambiguitas dalam desain, implementasi, dokumentasi, dan komunikasi lintas tim.

---

# Document Status

Document

```
reference/glossary.md
```

Version

```
Draft v1.0
```

Status

```
COMPLETE
```

Review Status

```
Ready for Architecture Review
```

Dependencies

- MAS-100 Workspace Definition
- MAS-200 Execution Model
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-500 Memory & Knowledge
- MAS-700 AI Runtime
- Object Catalog
- Capability Catalog
- Event Catalog
- Engine Interaction

Next Document

```
reference/error-codes.md
```

---

END OF DOCUMENT

MMOS Glossary

**Status: COMPLETE**

MMOS v1.0 Specification