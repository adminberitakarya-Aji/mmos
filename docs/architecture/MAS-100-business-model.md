# MAS-100 — Business Model

Version: 1.0

---

# Purpose

MAS-100 mendefinisikan **Business Model** MMOS.

Business Model menjelaskan **apa yang dikelola oleh sistem**, bukan bagaimana sistem bekerja.

Seluruh object bisnis, hubungan antar object, serta batas kepemilikannya didefinisikan pada dokumen ini.

MAS-100 merupakan fondasi seluruh arsitektur MMOS.

---

# Scope

MAS-100 mencakup:

- Business Object
- Ownership
- Relationships
- Aggregate Boundary
- Business Rules

MAS-100 tidak membahas:

- Workflow
- Engine
- AI
- Provider
- Runtime
- Infrastruktur

Semua aspek tersebut dijelaskan pada dokumen MAS berikutnya.

---

# Design Principles

Business Model dibangun berdasarkan prinsip berikut.

## Business First

Model bisnis harus stabil meskipun implementasi berubah.

---

## Composition First

Seluruh proses produksi multimedia berpusat pada Composition.

---

## Object Oriented Domain

Seluruh informasi direpresentasikan sebagai Business Object.

---

## Separation of Concerns

Business Model tidak mengetahui:

- Workflow
- Engine
- AI
- Provider

---

# Business Object Hierarchy

```
Workspace
│
├── Brand
│      │
│      ├── Style
│      └── Template
│
├── Project
│      │
│      ├── Composition
│      │       │
│      │       ├── Timeline
│      │       └── Scene
│      │
│      ├── Render
│      │
│      └── Artifact
│
└── Library
        │
        └── Asset
```

---

# Ownership Rules

Setiap Business Object hanya memiliki satu pemilik (Owner).

Object dapat digunakan oleh object lain melalui reference, tetapi kepemilikan tetap tunggal.

| Object | Owner |
|----------|------|
| Workspace | - |
| Brand | Workspace |
| Project | Workspace |
| Library | Workspace |
| Style | Brand |
| Template | Brand |
| Composition | Project |
| Timeline | Composition |
| Scene | Composition |
| Render | Project |
| Artifact | Project |
| Asset | Library |

---

# Aggregate Boundary

MMOS menggunakan konsep Aggregate.

```
Workspace

├── Brand Aggregate

├── Project Aggregate

└── Library Aggregate
```

Project merupakan **Root Aggregate**.

Composition tidak pernah berdiri sendiri di luar Project.

---

# Core Business Objects

---

# Workspace

## Purpose

Workspace merupakan boundary tertinggi dalam MMOS.

Workspace memisahkan data, konfigurasi, identitas, dan sumber daya antar organisasi atau tenant.

## Responsibilities

Workspace bertanggung jawab terhadap:

- Brand
- Project
- Library
- Workspace Configuration

## Owns

- Brand
- Project
- Library

---

# Brand

## Purpose

Brand merepresentasikan identitas visual dan kreatif.

Brand memastikan seluruh output memiliki karakter yang konsisten.

## Responsibilities

Brand mengelola:

- warna
- typography
- logo
- visual guideline
- creative guideline

## Owns

- Style
- Template

---

# Project

## Purpose

Project merupakan unit kerja utama.

Seluruh produksi multimedia dilakukan di dalam Project.

Project merupakan Root Aggregate.

## Responsibilities

Project mengelola:

- Composition
- Render
- Artifact

Project menggunakan Asset dari Library.

## Owns

- Composition
- Render
- Artifact

## Uses

- Brand
- Asset
- Template

---

# Library

## Purpose

Library merupakan repositori resource yang dapat digunakan kembali.

Library bukan tempat proses produksi.

## Responsibilities

Library menyimpan:

- Asset
- Resource
- Media Collection

## Owns

- Asset

---

# Asset

## Purpose

Asset merupakan material dasar produksi multimedia.

Contoh:

- image
- video
- audio
- music
- icon
- illustration
- document

## Characteristics

Asset bersifat immutable.

Setiap perubahan menghasilkan Asset baru.

Asset tidak memiliki operasi update.

---

# Composition

## Purpose

Composition merupakan representasi resmi sebuah karya multimedia.

Composition adalah Single Source of Truth.

## Responsibilities

Composition mengatur:

- Timeline
- Scene
- Layer
- Sequence

Composition tidak melakukan rendering.

## Owns

- Timeline
- Scene

---

# Timeline

## Purpose

Timeline menentukan urutan kronologis sebuah Composition.

Timeline mendefinisikan:

- waktu
- durasi
- urutan Scene

Timeline tidak menyimpan media.

---

# Scene

## Purpose

Scene merupakan unit terkecil dalam Composition.

Scene merepresentasikan satu bagian visual atau audio.

Contoh:

- opening
- title
- transition
- narration
- ending

---

# Style

## Purpose

Style mendefinisikan aturan visual.

Style digunakan agar seluruh output memiliki identitas yang konsisten.

Contoh:

- font
- color palette
- spacing
- animation rule

---

# Template

## Purpose

Template merupakan blueprint yang dapat digunakan kembali.

Template mempercepat pembuatan Composition baru.

Template tidak menyimpan hasil produksi.

---

# Render

## Purpose

Render merepresentasikan proses menghasilkan output.

Render bukan output.

Render menghasilkan Artifact.

---

# Artifact

## Purpose

Artifact merupakan hasil akhir produksi.

Contoh:

- JPEG
- PNG
- MP4
- MP3
- PDF

Artifact bersifat immutable.

---

# Business Relationships

```
Workspace

├── Brand
│      │
│      ├── Style
│      └── Template
│
├── Library
│      │
│      └── Asset
│
└── Project
       │
       ├── Composition
       │       │
       │       ├── Timeline
       │       └── Scene
       │
       ├── Render
       │
       └── Artifact
```

---

# Business Rules

## Rule 1

Workspace merupakan boundary tertinggi.

---

## Rule 2

Project merupakan Root Aggregate.

---

## Rule 3

Composition merupakan Single Source of Truth.

---

## Rule 4

Asset bersifat immutable.

---

## Rule 5

Artifact bersifat immutable.

---

## Rule 6

Timeline hanya dimiliki Composition.

---

## Rule 7

Scene tidak boleh berada di luar Composition.

---

## Rule 8

Template hanya dimiliki Brand.

---

## Rule 9

Style hanya dimiliki Brand.

---

## Rule 10

Render selalu menghasilkan Artifact.

---

# Business Lifecycle

```
Workspace

↓

Brand

↓

Project

↓

Composition

↓

Render

↓

Artifact
```

Business Lifecycle menjelaskan perjalanan sebuah karya multimedia dari awal hingga menjadi output akhir.

---

# Out of Scope

MAS-100 tidak menjelaskan:

- Workflow
- Stage
- Task
- Capability
- Tool
- Provider
- Event
- Engine
- Memory
- AI Runtime

Semua konsep tersebut dijelaskan pada dokumen MAS berikutnya.

---

# Related Documents

- README.md
- 000-overview.md
- 010-constitution.md
- MAS-200-execution-model.md
- MAS-300-engine-architecture.md
- MAS-400-orchestrator.md
- object-catalog.md

---

# Summary

MAS-100 mendefinisikan seluruh Business Object MMOS beserta hubungan, kepemilikan, dan batas tanggung jawabnya.

Business Model menjadi fondasi yang stabil bagi seluruh lapisan arsitektur lainnya. Seluruh perubahan pada Workflow, Engine, maupun AI Runtime tidak boleh mengubah struktur Business Model yang telah didefinisikan dalam dokumen ini.