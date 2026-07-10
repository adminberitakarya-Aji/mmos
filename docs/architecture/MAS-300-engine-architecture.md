# MAS-300 — Engine Architecture

Version: 1.0

---

# Purpose

MAS-300 mendefinisikan arsitektur Engine pada MMOS.

Engine merupakan komponen yang mengimplementasikan domain bisnis dan mengeksekusi pekerjaan yang telah didefinisikan oleh Execution Model.

Engine **bukan** Business Object.

Engine **bukan** Workflow.

Engine **bukan** Orchestrator.

Engine adalah pelaksana (executor) domain.

---

# Scope

MAS-300 mencakup:

- Engine Architecture
- Engine Responsibilities
- Engine Communication
- Engine Lifecycle
- Domain Ownership
- Engine Principles

MAS-300 tidak mencakup:

- Business Object
- Workflow Definition
- Memory
- AI Runtime
- Infrastructure

---

# Architecture Philosophy

MMOS memisahkan tiga konsep utama.

```
Business

↓

Execution

↓

Engine
```

Business mendefinisikan object.

Execution mendefinisikan proses.

Engine mengimplementasikan proses tersebut.

---

# Definition

Engine adalah komponen domain yang bertanggung jawab mengimplementasikan Capability terhadap Business Object sesuai Workflow yang dikoordinasikan oleh Orchestrator.

Setiap Engine hanya memahami satu domain.

Engine tidak mengetahui keseluruhan sistem.

---

# Core Principles

## Principle 1

One Engine, One Responsibility.

Satu Engine hanya memiliki satu domain utama.

---

## Principle 2

Engine Never Orchestrates.

Engine tidak menentukan urutan pekerjaan.

Urutan pekerjaan ditentukan oleh Workflow dan Orchestrator.

---

## Principle 3

Engine Never Talks Directly to Another Engine.

Engine tidak pernah memanggil Engine lain.

Komunikasi dilakukan melalui:

- Business Object
- Event

---

## Principle 4

Engine Owns Domain Logic.

Seluruh logika domain berada di Engine.

Bukan di Workflow.

Bukan di Orchestrator.

---

## Principle 5

Engine is Replaceable.

Implementasi Engine dapat berubah tanpa mengubah Business Model.

---

# Engine Architecture

```
                  Workflow
                      │
                      ▼
               Orchestrator
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 Asset Engine   Composition Engine   AI Engine
      │               │                │
      └───────────────┼────────────────┘
                      ▼
               Business Object
                      │
                      ▼
                    Event
                      │
                      ▼
               Orchestrator
```

Engine tidak saling berkomunikasi secara langsung.

---

# Core Engines

MMOS memiliki tujuh Core Engine.

```
Context Engine

Asset Engine

Composition Engine

AI Engine

Render Engine

Library Engine

Billing Engine
```

---

# Context Engine

## Purpose

Menyediakan konteks bagi seluruh proses eksekusi.

Context dapat berasal dari:

- Workspace
- Brand
- Project
- User Preference
- Style
- Template

Context Engine tidak mengambil keputusan.

Context Engine hanya menyediakan informasi.

---

## Responsibilities

- Load Context
- Resolve Context
- Merge Context
- Validate Context

---

## Does Not

- Generate AI
- Render
- Modify Composition

---

# Asset Engine

## Purpose

Mengelola seluruh Asset.

Asset Engine memahami seluruh lifecycle Asset.

---

## Responsibilities

- Import Asset
- Validate Asset
- Extract Metadata
- Transform Asset
- Store Asset
- Asset Versioning

---

## Uses

- Asset
- Library

---

## Does Not

- Render
- Generate AI
- Edit Composition

---

# Composition Engine

## Purpose

Mengelola Composition.

Composition Engine merupakan domain utama produksi multimedia.

---

## Responsibilities

- Create Composition
- Manage Timeline
- Manage Scene
- Validate Composition
- Update Composition

---

## Uses

- Composition
- Timeline
- Scene

---

## Does Not

- Render
- Call AI Provider
- Manage Asset Storage

---

# AI Engine

## Purpose

Mengimplementasikan seluruh Capability AI.

AI Engine merupakan satu-satunya Engine yang mengetahui Tool dan Provider.

---

## Responsibilities

- Resolve Capability
- Select Tool
- Select Provider
- Execute AI Request
- Normalize Response

---

## Uses

- Capability
- Tool
- Provider

---

## Does Not

- Manage Workflow
- Manage Business Object
- Render Video

---

# Render Engine

## Purpose

Menghasilkan output akhir.

Render Engine membaca Composition kemudian menghasilkan Artifact.

---

## Responsibilities

- Render Image
- Render Video
- Render Audio
- Export Output

---

## Uses

- Composition
- Render
- Artifact

---

## Does Not

- Edit Composition
- Execute AI
- Modify Asset

---

# Library Engine

## Purpose

Mengelola seluruh resource yang dapat digunakan kembali.

---

## Responsibilities

- Index Library
- Search Resource
- Categorize Resource
- Reuse Resource

---

## Uses

- Library
- Asset

---

## Does Not

- Execute Workflow
- Render
- Generate AI

---

# Billing Engine

## Purpose

Mengelola penggunaan resource.

---

## Responsibilities

- AI Usage
- Render Usage
- Storage Usage
- Quota
- Credit
- Subscription

---

## Does Not

- Execute AI
- Manage Composition
- Modify Business Object

---

# Engine Responsibilities

```
Context Engine
        │
        ▼
Provide Context

Asset Engine
        │
        ▼
Manage Asset

Composition Engine
        │
        ▼
Manage Composition

AI Engine
        │
        ▼
Execute Capability

Render Engine
        │
        ▼
Generate Artifact

Library Engine
        │
        ▼
Manage Resource

Billing Engine
        │
        ▼
Track Consumption
```

---

# Engine Communication

Engine tidak boleh memanggil Engine lain.

Yang diperbolehkan:

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

↓

Engine
```

Yang dilarang:

```
AI Engine

↓

Render Engine
```

atau

```
Composition Engine

↓

Asset Engine
```

Seluruh koordinasi dilakukan oleh Orchestrator.

---

# Engine Lifecycle

```
Receive Task

↓

Load Context

↓

Load Business Object

↓

Execute Domain Logic

↓

Update Business Object

↓

Publish Event

↓

Completed
```

Engine tidak menentukan Task berikutnya.

---

# Engine Boundaries

| Engine | Domain |
|---------|---------|
| Context Engine | Context |
| Asset Engine | Asset |
| Composition Engine | Composition |
| AI Engine | Capability |
| Render Engine | Rendering |
| Library Engine | Library |
| Billing Engine | Usage |

Tidak boleh ada dua Engine yang memiliki domain yang sama.

---

# Engine Rules

## Rule 1

Engine hanya memiliki satu domain.

---

## Rule 2

Engine tidak saling memanggil.

---

## Rule 3

Engine menerima Task dari Orchestrator.

---

## Rule 4

Engine mengubah Business Object sesuai domainnya.

---

## Rule 5

Engine selalu menghasilkan Event.

---

## Rule 6

Engine tidak mengetahui Workflow secara keseluruhan.

---

## Rule 7

Engine tidak mengetahui UI.

---

## Rule 8

Engine tidak mengetahui API.

---

## Rule 9

Engine dapat diganti tanpa mengubah Business Model.

---

## Rule 10

AI Provider hanya diketahui AI Engine.

---

# Relationship with MAS-200

MAS-200 mendefinisikan pekerjaan.

MAS-300 mengimplementasikan pekerjaan tersebut.

```
Workflow

↓

Task

↓

Capability

↓

Engine

↓

Business Object
```

---

# Relationship with MAS-400

Orchestrator hanya mengoordinasikan.

Engine yang bekerja.

```
Workflow

↓

Orchestrator

↓

Engine

↓

Event

↓

Orchestrator
```

Engine tidak pernah mengambil alih peran Orchestrator.

---

# Out of Scope

MAS-300 tidak membahas:

- Memory
- AI Runtime
- Prompt
- Template
- Platform
- Authentication
- Infrastructure

---

# Related Documents

- README.md
- 000-overview.md
- 010-constitution.md
- MAS-100-business-model.md
- MAS-200-execution-model.md
- MAS-400-orchestrator.md
- object-catalog.md
- capability-catalog.md
- event-catalog.md

---

# Summary

MAS-300 mendefinisikan tujuh Core Engine MMOS sebagai pelaksana domain yang independen.

Arsitektur ini memastikan bahwa:

- Business tetap stabil.
- Workflow tetap deklaratif.
- Orchestrator hanya mengoordinasikan.
- Engine hanya fokus pada domainnya masing-masing.
- Tidak ada komunikasi langsung antar Engine.
- AI Provider hanya diketahui oleh AI Engine.

Pemisahan tanggung jawab ini menjadikan MMOS modular, mudah diuji, mudah dikembangkan, dan tetap konsisten dengan Constitution yang menjadi fondasi arsitektur.