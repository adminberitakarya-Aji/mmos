# MAS-600 Agent Architecture

Version : Draft v1.0  
Document : `architecture/MAS-600-agent-architecture.md`  
Status : IN PROGRESS (Part 1 of 10)

---

# 1. Purpose

MAS-600 mendefinisikan **Agent Architecture** pada MMOS.

Dokumen ini menjadi spesifikasi resmi mengenai bagaimana Agent dibangun, dikelola, dijalankan, berkolaborasi, dan berinteraksi dengan seluruh komponen MMOS.

MAS-600 merupakan fondasi kemampuan Autonomous Intelligence pada MMOS.

---

# 2. Objectives

MAS-600 memiliki tujuan berikut.

## AG-001 Standard Agent Model

Seluruh Agent mengikuti model yang sama.

---

## AG-002 Provider Agnostic

Agent tidak bergantung pada Provider AI tertentu.

---

## AG-003 Runtime Independent

Agent dapat dijalankan pada AI Runtime mana pun yang mendukung MMOS.

---

## AG-004 Capability Driven

Seluruh kemampuan Agent berasal dari Capability.

Agent tidak memiliki kemampuan bawaan selain Reasoning.

---

## AG-005 Event Driven

Seluruh aktivitas Agent menghasilkan Event.

---

## AG-006 Composable

Agent dapat disusun menjadi Agent yang lebih kompleks.

---

## AG-007 Multi-Agent Ready

Agent dapat bekerja sama dengan Agent lain.

---

## AG-008 Secure

Agent mengikuti Security Policy MMOS.

---

# 3. Scope

MAS-600 mencakup:

- Agent Architecture
- Agent Object
- Agent Lifecycle
- Agent Planning
- Agent Reasoning
- Capability Binding
- Tool Invocation
- Delegation
- Collaboration
- Agent Governance
- Agent Security
- Agent Contracts

Tidak mencakup:

- AI Runtime
- Foundation Models
- Workflow Definition
- Memory Implementation
- Knowledge Implementation

---

# 4. Architecture Position

```
Business Layer

↓

Workflow Layer

↓

Execution Layer

↓

Orchestrator

↓

Agent Layer

↓

AI Runtime

↓

Foundation Models
```

Agent berada di antara **Orchestrator** dan **AI Runtime**.

---

# 5. Design Philosophy

MMOS memandang Agent sebagai:

> **Unit of Intelligent Execution**

Agent bukan sekadar Prompt.

Agent bukan Chatbot.

Agent bukan LLM.

Agent adalah entitas yang memiliki tujuan, kemampuan, perilaku, dan siklus hidup.

---

# 6. Design Principles

## AG-P01 Capability First

Agent memperoleh kemampuan melalui Capability.

---

## AG-P02 Stateless Execution

State permanen disimpan pada Memory Engine.

Agent tidak menyimpan state internal jangka panjang.

---

## AG-P03 Orchestrator Controlled

Agent tidak mengatur Workflow.

Seluruh koordinasi dilakukan oleh Orchestrator.

---

## AG-P04 Runtime Independent

Agent dapat dijalankan pada Runtime yang berbeda.

---

## AG-P05 Provider Agnostic

Agent tidak mengetahui Provider AI.

---

## AG-P06 Explainable Decision

Keputusan Agent harus dapat ditelusuri.

---

## AG-P07 Secure by Default

Setiap aksi Agent mengikuti Security Policy.

---

## AG-P08 Event Driven

Seluruh perubahan status menghasilkan Event.

---

## AG-P09 Contract First

Komunikasi menggunakan Contract resmi MMOS.

---

## AG-P10 Composable

Agent dapat menjadi bagian dari Agent lain.

---

# 7. Agent Definition

Agent adalah Object yang mampu:

- memahami Goal
- melakukan Planning
- memilih Capability
- menggunakan Tool
- meminta bantuan Agent lain
- menghasilkan Output

Agent bukan sekadar Prompt Template.

---

# 8. Core Concepts

MAS-600 terdiri atas lima konsep utama.

```
Goal

↓

Planning

↓

Reasoning

↓

Capability

↓

Execution
```

Kelima konsep tersebut membentuk perilaku dasar setiap Agent.

---

# 9. Agent Characteristics

Seluruh Agent MMOS memiliki karakteristik berikut.

- Goal Driven
- Capability Driven
- Event Driven
- Stateless
- Context Aware
- Provider Independent
- Model Independent
- Secure
- Observable
- Extensible

---

# 10. Agent Architecture

```
                  +----------------------+
                  |     Orchestrator     |
                  +----------+-----------+
                             |
                             v
                  +----------------------+
                  |        Agent         |
                  +----------+-----------+
                             |
      +----------+-----------+-----------+----------+
      |          |           |           |          |
      v          v           v           v          v
   Planning   Reasoning  Capability   Tool Use   Memory
                             |
                             v
                  +----------------------+
                  |     AI Runtime       |
                  +----------+-----------+
                             |
                             v
                  +----------------------+
                  | Foundation Models    |
                  +----------------------+
```

Agent menjadi pusat eksekusi cerdas yang menghubungkan Orchestrator dengan AI Runtime.

---

# 11. Agent Responsibilities

Agent bertanggung jawab terhadap:

- memahami Goal
- membuat rencana
- memilih Capability
- memanggil Tool
- meminta Context
- menghasilkan Output
- melaporkan Status

Agent **tidak bertanggung jawab** terhadap:

- penyimpanan Memory
- orkestrasi Workflow
- manajemen Infrastruktur
- pemilihan AI Provider

---

# 12. Agent Boundaries

Batas tanggung jawab Agent.

| Responsibility | Agent | Orchestrator | Runtime |
|----------------|:-----:|:------------:|:-------:|
| Goal Execution | ✓ | | |
| Workflow Coordination | | ✓ | |
| Capability Selection | ✓ | | |
| Tool Invocation | ✓ | | |
| Memory Storage | | | ✓* |
| AI Inference | | | ✓ |
| Provider Selection | | ✓ | |

> *Penyimpanan dilakukan melalui Memory Engine yang digunakan AI Runtime.

---

# 13. Agent Layer

Agent Layer terdiri atas beberapa komponen.

```
Agent Layer

├── Planning
├── Reasoning
├── Capability Resolver
├── Tool Manager
├── Memory Adapter
├── Runtime Adapter
└── Event Publisher
```

Seluruh komponen berkomunikasi melalui Contract MMOS.

---

# 14. High-Level Interaction

```
User Request

↓

Workflow

↓

Execution

↓

Orchestrator

↓

Agent

↓

Memory & Knowledge

↓

AI Runtime

↓

Foundation Model

↓

Response
```

Agent selalu bekerja menggunakan Context yang telah disiapkan oleh Intelligence Layer.

---

# 15. Agent Goals

Setiap Agent memiliki Goal yang jelas.

Contoh.

```
Research Agent

↓

Mengumpulkan informasi
```

```
Writer Agent

↓

Menulis artikel
```

```
Reviewer Agent

↓

Melakukan review
```

```
Publisher Agent

↓

Mempublikasikan hasil
```

Goal menjadi dasar seluruh proses Planning.

---

# 16. Agent Identity

Setiap Agent memiliki identitas unik.

Contoh.

```
AGT-000001
```

Field minimum.

| Field | Description |
|--------|-------------|
| Agent ID | Identifier |
| Name | Nama Agent |
| Type | Jenis Agent |
| Version | Versi |
| Status | Status |
| Owner | Pemilik |
| Workspace | Workspace |
| Created At | Waktu dibuat |

Identity bersifat immutable.

---

# 17. Architecture Goals

MAS-600 dirancang untuk mencapai tujuan berikut.

- Agent yang modular.
- Agent yang dapat digunakan ulang.
- Agent yang dapat bekerja sama.
- Agent yang aman.
- Agent yang dapat dijelaskan perilakunya.
- Agent yang independen dari Runtime dan Provider.
- Agent yang mendukung implementasi Enterprise dan Multi-Agent.

---

# Part 1 Summary

Part 1 mendefinisikan fondasi konseptual **Agent Architecture** pada MMOS.

Topik yang dibahas meliputi:

- Purpose
- Objectives
- Scope
- Architecture Position
- Design Philosophy
- Design Principles
- Agent Definition
- Core Concepts
- Agent Characteristics
- High-Level Architecture
- Responsibilities
- Boundaries
- Agent Layer
- High-Level Interaction
- Agent Goals
- Agent Identity
- Architecture Goals

Bagian ini menetapkan bahwa **Agent merupakan Unit of Intelligent Execution** yang berada di antara Orchestrator dan AI Runtime, memperoleh kemampuan melalui Capability, menggunakan Context dari Intelligence Layer, dan beroperasi berdasarkan Contract serta Event MMOS.

---

END OF PART 1/10

Next:

**MAS-600 Agent Architecture — Part 2/10**

# MAS-600 Agent Architecture

Version : Draft v1.0  
Document : `architecture/MAS-600-agent-architecture.md`  
Status : IN PROGRESS (Part 2 of 10)

---

# 18. Agent Model

MAS-600 mendefinisikan **Agent** sebagai Object utama pada Agent Layer.

Setiap Agent memiliki struktur yang konsisten sehingga dapat dijalankan oleh Runtime mana pun yang mendukung MMOS.

Model Agent terdiri dari:

- Identity
- Metadata
- Goal
- State
- Capability
- Policy
- Context
- Runtime Configuration

---

# 19. Agent Object

Agent direpresentasikan sebagai Agent Object.

```
Agent

├── Identity
├── Metadata
├── Goal
├── Capability
├── Policy
├── State
├── Context
├── Runtime Configuration
└── Events
```

Agent Object merupakan bagian dari MMOS Object Catalog.

---

# 20. Agent Metadata

Metadata menjelaskan karakteristik Agent.

| Field | Description |
|--------|-------------|
| Agent ID | Identifier |
| Name | Nama Agent |
| Display Name | Nama tampilan |
| Description | Deskripsi |
| Version | Versi |
| Owner | Pemilik |
| Workspace | Workspace |
| Project | Project |
| Tags | Label |
| Status | Status |

Metadata tidak memengaruhi perilaku Agent.

---

# 21. Agent Types

MMOS tidak membatasi jenis Agent, namun mendefinisikan tipe dasar berikut.

| Agent Type | Description |
|------------|-------------|
| Assistant Agent | Membantu pengguna |
| Research Agent | Mengumpulkan informasi |
| Writer Agent | Membuat konten |
| Reviewer Agent | Melakukan evaluasi |
| Planner Agent | Menyusun rencana |
| Coordinator Agent | Mengoordinasikan Agent lain |
| Executor Agent | Menjalankan Task |
| Integration Agent | Berinteraksi dengan sistem eksternal |
| Monitoring Agent | Mengawasi proses |
| Custom Agent | Implementasi khusus |

---

# 22. Agent Identity

Identity bersifat immutable.

Field minimum.

| Field | Description |
|--------|-------------|
| Agent ID | Identifier unik |
| Namespace | Namespace |
| Version | Versi |
| Owner | Pemilik |
| Created At | Waktu dibuat |

Identity tidak berubah selama siklus hidup Agent.

---

# 23. Agent State Model

Setiap Agent memiliki State.

```
Created

↓

Initialized

↓

Ready

↓

Running

↓

Waiting

↓

Completed
```

Apabila terjadi kesalahan.

```
Running

↓

Failed
```

State dikelola oleh Agent Runtime.

---

# 24. Agent Lifecycle

Lifecycle standar.

```
Create

↓

Initialize

↓

Load Capability

↓

Receive Goal

↓

Planning

↓

Execution

↓

Complete

↓

Terminate
```

Seluruh perubahan Lifecycle menghasilkan Event.

---

# 25. Agent Status

Status operasional Agent.

| Status | Description |
|---------|-------------|
| Created | Baru dibuat |
| Initializing | Sedang inisialisasi |
| Ready | Siap digunakan |
| Running | Sedang bekerja |
| Waiting | Menunggu |
| Paused | Dijeda |
| Completed | Selesai |
| Failed | Gagal |
| Terminated | Dihentikan |

Status berbeda dengan Lifecycle.

---

# 26. Agent Configuration

Setiap Agent memiliki konfigurasi.

Contoh.

| Configuration | Description |
|--------------|-------------|
| Default Model | Model AI |
| Temperature | Kreativitas |
| Max Token | Batas Token |
| Retry Policy | Aturan Retry |
| Timeout | Timeout |
| Memory Policy | Kebijakan Memory |
| Security Policy | Kebijakan Security |

Konfigurasi dapat diwariskan dari Workspace atau Project.

---

# 27. Agent Profile

Agent memiliki Profile yang mendeskripsikan identitas logisnya.

Contoh.

```
Research Agent

Domain:
Technology

Language:
Indonesia

Style:
Professional

Priority:
High
```

Profile digunakan saat Planning dan Capability Selection.

---

# 28. Agent Role

Role menentukan tanggung jawab Agent.

Contoh.

| Role | Responsibility |
|------|----------------|
| Researcher | Mengumpulkan data |
| Writer | Menulis |
| Reviewer | Memvalidasi |
| Coordinator | Mengoordinasikan |
| Executor | Menjalankan aksi |
| Observer | Monitoring |

Satu Agent dapat memiliki lebih dari satu Role.

---

# 29. Agent Persona

Persona memengaruhi gaya interaksi Agent, bukan logika bisnis.

Contoh.

- Formal
- Professional
- Friendly
- Technical
- Analytical
- Creative

Persona bersifat opsional.

---

# 30. Agent Goal

Goal adalah tujuan utama yang harus dicapai Agent.

Contoh.

```
Menulis artikel SEO
```

```
Menganalisis laporan keuangan
```

```
Melakukan review kode
```

Goal bersifat dinamis dan diberikan saat Runtime.

---

# 31. Goal Object

Goal direpresentasikan sebagai Object.

| Field | Description |
|--------|-------------|
| Goal ID | Identifier |
| Name | Nama Goal |
| Description | Deskripsi |
| Priority | Prioritas |
| Deadline | Batas waktu |
| Constraints | Batasan |
| Success Criteria | Kriteria keberhasilan |

Goal menjadi input utama proses Planning.

---

# 32. Success Criteria

Setiap Goal memiliki indikator keberhasilan.

Contoh.

```
Research

↓

Minimal 10 sumber
```

```
Writer

↓

Artikel 2.000 kata
```

```
Reviewer

↓

Tidak ada Critical Issue
```

Agent menggunakan Success Criteria saat mengevaluasi hasil.

---

# 33. Constraints

Goal dapat memiliki Constraints.

Contoh.

- Maksimum Token
- Maksimum Biaya
- Bahasa
- Deadline
- Provider tertentu
- Workspace tertentu
- Capability tertentu

Constraints wajib dipatuhi selama Execution.

---

# 34. Agent Context

Agent menerima Context dari Context Assembler.

```
System Context

+

Memory

+

Knowledge

+

Workflow Context

+

Goal
```

Agent tidak mengambil Context secara langsung.

---

# 35. Runtime Configuration

Runtime Configuration menentukan bagaimana Agent dijalankan.

| Property | Description |
|----------|-------------|
| Runtime | AI Runtime |
| Model | Foundation Model |
| Provider | AI Provider |
| Max Context | Batas Context |
| Timeout | Waktu maksimum |
| Retry | Jumlah Retry |
| Streaming | Dukungan Streaming |

MAS-600 hanya mendefinisikan Contract, bukan implementasi Runtime.

---

# 36. Agent Object Relationships

Hubungan Agent dengan Object MMOS.

```
Workspace
    │
    ▼
Project
    │
    ▼
Workflow
    │
    ▼
Execution
    │
    ▼
Task
    │
    ▼
Agent
    │
 ┌──┼───────────────┐
 ▼  ▼               ▼
Goal Capability   Context
```

Agent menjadi pusat eksekusi pada tingkat Task.

---

# 37. Agent Model Principles

Model Agent mengikuti prinsip berikut.

1. Agent adalah First-Class Object.
2. Identity bersifat immutable.
3. Goal diberikan saat Runtime.
4. Capability menentukan kemampuan Agent.
5. Context berasal dari Intelligence Layer.
6. State dikelola melalui Lifecycle.
7. Configuration dapat diwariskan.
8. Seluruh perubahan menghasilkan Event.
9. Agent bersifat Provider Agnostic.
10. Agent dapat digunakan kembali pada Workflow yang berbeda.

---

## Part 2 Summary

Part 2 mendefinisikan **Agent Model** sebagai spesifikasi formal Object Agent dalam MMOS.

Topik yang dibahas meliputi:

- Agent Model
- Agent Object
- Metadata
- Agent Types
- Identity
- State Model
- Lifecycle
- Status
- Configuration
- Profile
- Role
- Persona
- Goal
- Goal Object
- Success Criteria
- Constraints
- Context
- Runtime Configuration
- Object Relationships
- Agent Model Principles

Dengan model ini, setiap Agent memiliki struktur yang konsisten, dapat dipindahkan antar Runtime, serta dapat dikelola oleh Orchestrator dan Intelligence Layer tanpa bergantung pada implementasi AI tertentu.

---

END OF PART 2/10

Next:

**MAS-600 Agent Architecture — Part 3/10**

# MAS-600 Agent Architecture

Version : Draft v1.0  
Document : `architecture/MAS-600-agent-architecture.md`  
Status : IN PROGRESS (Part 3 of 10)

---

# 38. Agent Planning

Planning adalah proses menyusun langkah-langkah untuk mencapai Goal.

Planning dilakukan setelah Agent menerima:

- Goal
- Context
- Constraints
- Available Capabilities

Planning menghasilkan **Execution Plan**.

---

# 39. Planning Objectives

Tujuan Planning.

- Memahami Goal
- Memecah pekerjaan
- Menentukan urutan Task
- Memilih Capability
- Mengidentifikasi Tool
- Mengurangi risiko kegagalan
- Mengoptimalkan biaya dan waktu

---

# 40. Planning Architecture

```
Goal

↓

Context

↓

Constraint Analysis

↓

Task Decomposition

↓

Capability Selection

↓

Execution Plan
```

Planning dilakukan sebelum Execution dimulai.

---

# 41. Planning Components

Planning terdiri atas beberapa komponen.

```
Planning Engine

├── Goal Analyzer
├── Constraint Analyzer
├── Task Decomposer
├── Capability Resolver
├── Dependency Analyzer
└── Plan Builder
```

Planning Engine merupakan bagian logis dari Agent.

---

# 42. Goal Analysis

Agent menganalisis Goal untuk memahami:

- Objective
- Scope
- Priority
- Deadline
- Constraints
- Expected Output

Output:

```
Structured Goal
```

---

# 43. Constraint Analysis

Constraint menentukan batasan Planning.

Contoh.

| Constraint | Description |
|------------|-------------|
| Budget | Maksimum biaya |
| Time | Maksimum waktu |
| Token | Maksimum Token |
| Provider | AI Provider tertentu |
| Capability | Capability yang diizinkan |
| Security | Tingkat keamanan |

Constraint selalu divalidasi sebelum Plan dibuat.

---

# 44. Task Decomposition

Goal besar dipecah menjadi Task yang lebih kecil.

Contoh.

```
Generate SEO Article

↓

Research

↓

Outline

↓

Draft

↓

Review

↓

Finalize
```

Task harus bersifat independen sejauh memungkinkan.

---

# 45. Task Dependency

Task dapat memiliki ketergantungan.

```
Research

↓

Outline

↓

Writing

↓

Review

↓

Publish
```

Task berikutnya tidak dijalankan sebelum Dependency terpenuhi.

---

# 46. Planning Strategies

MMOS mendukung beberapa strategi Planning.

| Strategy | Description |
|----------|-------------|
| Sequential | Berurutan |
| Parallel | Paralel |
| Conditional | Berdasarkan kondisi |
| Iterative | Berulang |
| Hierarchical | Bertingkat |

Strategi dipilih berdasarkan Goal.

---

# 47. Sequential Planning

```
Task A

↓

Task B

↓

Task C
```

Cocok untuk pekerjaan yang memiliki Dependency tinggi.

---

# 48. Parallel Planning

```
        Goal

      /   |   \

Task A Task B Task C

      \   |   /

     Merge Result
```

Task independen dapat dijalankan secara bersamaan.

---

# 49. Conditional Planning

```
Condition?

├── Yes → Task A
└── No  → Task B
```

Agent memilih jalur berdasarkan kondisi Runtime.

---

# 50. Hierarchical Planning

```
Goal

↓

Sub Goal

↓

Task

↓

Action
```

Digunakan untuk pekerjaan yang kompleks.

---

# 51. Execution Plan

Planning menghasilkan Execution Plan.

Field minimum.

| Field | Description |
|--------|-------------|
| Plan ID | Identifier |
| Goal ID | Goal terkait |
| Tasks | Daftar Task |
| Dependencies | Ketergantungan |
| Required Capabilities | Capability |
| Estimated Cost | Estimasi biaya |
| Estimated Time | Estimasi waktu |

Execution Plan bersifat immutable setelah disetujui, kecuali dilakukan proses replanning.

---

# 52. Dynamic Replanning

Apabila kondisi berubah, Agent dapat melakukan Replanning.

Contoh.

```
Task Failed

↓

Analyze Failure

↓

Update Plan

↓

Continue Execution
```

Replanning tidak mengubah Goal, tetapi dapat mengubah urutan atau strategi Task.

---

# 53. Agent Reasoning

Reasoning adalah proses pengambilan keputusan berdasarkan Context dan Goal.

Reasoning digunakan untuk:

- memilih tindakan
- mengevaluasi alternatif
- menentukan Capability
- memutuskan langkah berikutnya

Reasoning bukan proses AI Inference, tetapi proses logis Agent.

---

# 54. Reasoning Architecture

```
Goal

+

Context

+

Memory

+

Knowledge

↓

Reasoning

↓

Decision
```

Reasoning menggunakan Context yang telah disiapkan oleh Intelligence Layer.

---

# 55. Reasoning Components

```
Reasoning Engine

├── Context Evaluator
├── Decision Analyzer
├── Alternative Evaluator
├── Risk Analyzer
└── Decision Builder
```

---

# 56. Decision Model

Model keputusan Agent.

```
Observe

↓

Analyze

↓

Evaluate

↓

Decide

↓

Execute

↓

Observe Again
```

Model ini memungkinkan Agent beradaptasi terhadap perubahan.

---

# 57. Decision Criteria

Keputusan Agent mempertimbangkan beberapa faktor.

| Criteria | Description |
|----------|-------------|
| Goal Alignment | Kesesuaian dengan Goal |
| Context Relevance | Relevansi Context |
| Capability Availability | Capability tersedia |
| Security Compliance | Kepatuhan keamanan |
| Cost | Estimasi biaya |
| Time | Estimasi waktu |
| Success Probability | Probabilitas keberhasilan |

---

# 58. Decision Outcomes

Hasil Reasoning dapat berupa.

- Execute Task
- Skip Task
- Retry Task
- Request Context
- Request Capability
- Delegate Task
- Escalate Error
- Complete Goal

Seluruh keputusan menghasilkan Event.

---

# 59. Reasoning Modes

MMOS mendukung beberapa Mode Reasoning.

| Mode | Description |
|------|-------------|
| Reactive | Berdasarkan kondisi saat ini |
| Deliberative | Berdasarkan analisis mendalam |
| Rule-Based | Berdasarkan aturan |
| Goal-Based | Berdasarkan Goal |
| Hybrid | Kombinasi beberapa pendekatan |

Hybrid menjadi mode yang direkomendasikan.

---

# 60. Planning & Reasoning Principles

Planning dan Reasoning mengikuti prinsip berikut.

1. Goal menjadi dasar seluruh keputusan.
2. Planning dilakukan sebelum Execution.
3. Reasoning dilakukan sebelum setiap keputusan penting.
4. Constraint tidak boleh dilanggar.
5. Capability dipilih berdasarkan kebutuhan.
6. Replanning diperbolehkan apabila kondisi berubah.
7. Seluruh keputusan harus dapat dijelaskan (Explainable).
8. Planning tidak bergantung pada Provider AI.
9. Reasoning menggunakan Context dari Intelligence Layer.
10. Seluruh perubahan Plan menghasilkan Event.

---

## Part 3 Summary

Part 3 mendefinisikan mekanisme **Planning** dan **Reasoning** pada Agent.

Topik yang dibahas meliputi:

- Agent Planning
- Planning Objectives
- Planning Architecture
- Planning Components
- Goal Analysis
- Constraint Analysis
- Task Decomposition
- Task Dependency
- Planning Strategies
- Sequential, Parallel, Conditional, dan Hierarchical Planning
- Execution Plan
- Dynamic Replanning
- Agent Reasoning
- Reasoning Architecture
- Reasoning Components
- Decision Model
- Decision Criteria
- Decision Outcomes
- Reasoning Modes
- Planning & Reasoning Principles

Dengan arsitektur ini, setiap Agent mampu mengubah Goal menjadi Execution Plan yang terstruktur, mengambil keputusan secara konsisten berdasarkan Context, serta beradaptasi melalui Replanning tanpa melanggar prinsip-prinsip MMOS.

---

END OF PART 3/10

Next:

**MAS-600 Agent Architecture — Part 4/10**