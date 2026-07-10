# MMOS Constitution

Version: 1.0

---

# Purpose

Dokumen ini mendefinisikan prinsip-prinsip fundamental yang menjadi dasar seluruh arsitektur MMOS.

Constitution merupakan dokumen dengan prioritas tertinggi dalam MMOS.

Seluruh keputusan desain, implementasi, dan pengembangan harus mematuhi dokumen ini.

Apabila terjadi konflik antara Constitution dan dokumen lainnya, maka Constitution selalu menjadi acuan utama.

---

# Scope

Constitution berlaku untuk seluruh komponen MMOS, termasuk:

- Business Model
- Execution Model
- Engine Architecture
- Orchestrator
- AI Runtime
- Platform
- Developer Platform

Tidak ada komponen yang boleh melanggar Constitution.

---

# Core Principles

MMOS dibangun di atas delapan prinsip utama.

1. Composition is the Heart
2. Composition is the Single Source of Truth
3. Project is the Root Aggregate
4. Asset is Immutable
5. Orchestrator Never Works
6. Engines Communicate Through Objects and Events
7. Everything is Versioned
8. Provider Agnostic by Design

---

# Principle 1 — Composition is the Heart

## Statement

Composition adalah pusat seluruh proses produksi multimedia.

Seluruh aktivitas produksi pada akhirnya bertujuan untuk membuat, memperbarui, atau menghasilkan sebuah Composition.

## Rationale

Composition merepresentasikan struktur akhir sebuah karya multimedia.

Semua komponen lain mendukung terbentuknya Composition.

## Implications

- Workflow menghasilkan Composition.
- Engine bekerja untuk menghasilkan atau memperbarui Composition.
- Render selalu berasal dari Composition.
- Artifact selalu dihasilkan dari Composition.

---

# Principle 2 — Composition is the Single Source of Truth

## Statement

Composition merupakan satu-satunya representasi resmi dari kondisi sebuah karya multimedia.

Tidak boleh ada representasi lain yang dianggap sebagai sumber kebenaran.

## Rationale

Satu sumber kebenaran menghindari inkonsistensi data.

## Implications

- Render membaca Composition.
- Timeline berasal dari Composition.
- Scene dimiliki oleh Composition.
- Engine tidak menyimpan salinan Composition.

---

# Principle 3 — Project is the Root Aggregate

## Statement

Project merupakan Root Aggregate pada Business Model.

Seluruh Business Object berada di dalam atau digunakan oleh Project.

## Rationale

Project menjadi batas transaksi dan konsistensi domain.

## Implications

Project dapat memiliki:

- Composition
- Asset Reference
- Workflow
- Artifact
- Library Reference

Business Object tidak boleh berpindah Project tanpa proses yang eksplisit.

---

# Principle 4 — Asset is Immutable

## Statement

Asset tidak boleh diubah setelah dibuat.

Perubahan terhadap Asset menghasilkan Asset baru.

## Rationale

Immutable Asset memberikan:

- reproducibility
- auditability
- versioning
- rollback

## Implications

- Asset tidak memiliki operasi update.
- Seluruh transformasi menghasilkan Asset baru.
- Asset lama tetap tersedia sebagai histori.

---

# Principle 5 — Orchestrator Never Works

## Statement

Orchestrator hanya mengoordinasikan proses eksekusi.

Orchestrator tidak menjalankan logika bisnis maupun logika AI.

## Responsibilities

Orchestrator hanya boleh:

- membaca Workflow
- menentukan Stage aktif
- mengirim Task ke Engine
- menerima Event
- menentukan langkah berikutnya

## Forbidden

Orchestrator tidak boleh:

- mengedit Composition
- mengubah Asset
- melakukan Rendering
- memilih AI Model
- memanggil AI Provider
- menyimpan Business Object

---

# Principle 6 — Engines Communicate Through Objects and Events

## Statement

Engine tidak boleh saling memanggil secara langsung.

Komunikasi antar Engine dilakukan melalui Business Object dan Event.

## Rationale

Prinsip ini mengurangi coupling dan meningkatkan modularitas.

## Implications

Alur komunikasi selalu berbentuk:

```
Workflow
        │
        ▼
Orchestrator
        │
        ▼
Engine
        │
        ▼
Business Object
        │
        ▼
Event
        │
        ▼
Orchestrator
```

Tidak ada komunikasi langsung:

```
Engine A

↓

Engine B
```

---

# Principle 7 — Everything is Versioned

## Statement

Seluruh perubahan penting harus memiliki versi.

## Applies To

- Composition
- Asset
- Template
- Style
- Workflow
- Prompt
- Artifact

## Rationale

Versioning memungkinkan:

- rollback
- reproducibility
- collaboration
- audit trail

---

# Principle 8 — Provider Agnostic by Design

## Statement

MMOS tidak boleh bergantung pada provider AI tertentu.

Seluruh integrasi AI dilakukan melalui lapisan abstraksi.

## Architecture

```
Task

↓

Capability

↓

Tool

↓

Provider
```

Business Model maupun Workflow tidak mengetahui provider yang digunakan.

## Benefits

- mudah mengganti vendor
- mendukung multi-provider
- mengurangi vendor lock-in
- meningkatkan fleksibilitas

---

# Architectural Rules

Seluruh implementasi MMOS harus mengikuti aturan berikut.

## Business Rules

- Business Object tidak mengetahui Engine.
- Business Object tidak mengetahui Provider.
- Business Object tidak mengetahui Workflow.

---

## Execution Rules

- Workflow bersifat deklaratif.
- Stage terdiri dari Task.
- Task menggunakan Capability.
- Capability diimplementasikan oleh Tool.

---

## Engine Rules

- One Engine, One Responsibility.
- Engine memahami domain.
- Engine tidak saling memanggil.
- Engine menghasilkan Event.

---

## Runtime Rules

- Provider dapat diganti.
- Tool dapat diganti.
- Capability tetap stabil.
- Workflow tetap independen.

---

# Decision Hierarchy

Apabila terjadi konflik desain, urutan prioritas keputusan adalah:

```
Constitution

↓

Business Model

↓

Execution Model

↓

Engine Architecture

↓

Implementation
```

Implementasi tidak boleh mengubah Business Model.

Business Model tidak boleh melanggar Constitution.

---

# Non Goals

MMOS tidak bertujuan untuk:

- menjadi framework AI tertentu
- bergantung pada satu model AI
- bergantung pada satu cloud provider
- menggantikan aplikasi end-user
- menggantikan CMS atau ERP

MMOS adalah platform inti yang menjadi fondasi bagi berbagai aplikasi multimedia.

---

# Governance

Perubahan terhadap Constitution hanya dapat dilakukan apabila:

1. Tidak melanggar prinsip yang sudah ada.
2. Memberikan manfaat jangka panjang.
3. Disetujui melalui Architecture Decision Record (ADR).
4. Didokumentasikan sebelum implementasi dilakukan.

---

# References

- README.md
- 000-overview.md
- MAS-100-business-model.md
- MAS-200-execution-model.md
- MAS-300-engine-architecture.md
- MAS-400-orchestrator.md
- ADR-001 Composition is the Heart
- ADR-002 Project is the Root Aggregate
- ADR-003 Orchestrator Never Works
- ADR-004 Provider Agnostic
- ADR-005 Provider Agnostic Execution