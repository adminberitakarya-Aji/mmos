# ADR-019 — Composition Owns Workflow

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

Composition merupakan pusat (heart) dari MMOS sebagaimana ditetapkan pada ADR-001.

Composition merepresentasikan sebuah proses bisnis atau creative pipeline yang lengkap, misalnya:

- Generate Marketing Video
- Produce News Article
- Social Media Campaign
- Podcast Production
- Product Photo Editing

Untuk menyelesaikan sebuah Composition diperlukan satu atau lebih Workflow.

Workflow mendeskripsikan bagaimana Composition dijalankan.

Karena Workflow merupakan implementasi dari sebuah Composition, maka hubungan kepemilikan (ownership) harus didefinisikan secara eksplisit.

---

# Problem

Apabila Workflow dapat berdiri sendiri atau dimiliki oleh object lain, maka akan muncul berbagai masalah:

- Workflow tanpa tujuan bisnis (orphan workflow)
- ownership menjadi tidak jelas
- lifecycle tidak konsisten
- audit menjadi sulit
- dependency sulit ditelusuri
- Composition kehilangan kontrol terhadap prosesnya

Selain itu, jika Workflow dimiliki langsung oleh Project, Execution, atau Runtime, maka Domain Model menjadi ambigu.

---

# Decision

MMOS menetapkan bahwa **Workflow selalu dimiliki oleh Composition**.

Workflow tidak dapat berdiri sendiri.

Workflow tidak dapat dimiliki oleh:

- Project
- Runtime
- Execution
- Engine
- Agent

Workflow hanya dapat berada di dalam sebuah Composition.

---

# Principle

Prinsip utama ADR ini adalah:

> **Every Workflow Belongs to Exactly One Composition.**

Tidak ada Workflow tanpa Composition.

---

# Ownership Model

```
Project

↓

Composition

↓

Workflow

↓

Task
```

Ownership bersifat hierarkis.

---

# Aggregate Boundary

Composition merupakan Aggregate Root bagi seluruh Workflow.

```
Composition

├── Workflow A
├── Workflow B
├── Workflow C
└── Workflow D
```

Seluruh perubahan terhadap Workflow dilakukan melalui Composition.

Workflow tidak dapat dimodifikasi secara independen di luar boundary Composition.

---

# Workflow Lifecycle

Lifecycle Workflow mengikuti Composition.

```
Composition Created

↓

Workflow Created

↓

Workflow Updated

↓

Workflow Executed

↓

Composition Archived

↓

Workflow Archived
```

Workflow tidak memiliki lifecycle independen.

---

# Workflow Identity

Workflow memiliki identity sendiri:

```
workflowId
```

Namun identity tersebut selalu berada dalam konteks Composition.

```
compositionId

↓

workflowId
```

Workflow tidak pernah berpindah ke Composition lain.

---

# Relationship

Relationship utama:

```
Project

↓

Composition

↓

Workflow

↓

Task
```

Execution tidak memiliki Workflow.

Execution hanya mereferensikan Workflow.

```
Execution

↓

workflowId
```

---

# Workflow Reuse

Workflow dapat digunakan kembali melalui mekanisme:

- cloning
- template
- composition template

Namun proses tersebut selalu menghasilkan Workflow baru yang dimiliki oleh Composition baru.

Workflow asli tetap dimiliki Composition asal.

---

# Execution Relationship

Execution selalu berasal dari Workflow milik Composition.

```
Composition

↓

Workflow

↓

Execution
```

Execution tidak boleh dibuat tanpa Workflow.

Workflow tidak boleh dibuat tanpa Composition.

---

# Runtime Responsibility

Runtime hanya membaca Workflow.

Runtime tidak memiliki Workflow.

Runtime tidak boleh:

- membuat Workflow
- memindahkan Workflow
- menghapus Workflow

Runtime hanya menjalankan Workflow yang dimiliki Composition.

---

# Versioning

Perubahan Workflow menghasilkan versi baru di dalam Composition.

Contoh:

```
Composition

↓

Workflow v1

↓

Workflow v2

↓

Workflow v3
```

Seluruh versi tetap berada dalam Composition yang sama.

---

# Deletion

Workflow tidak boleh dihapus secara independen apabila masih menjadi bagian dari Composition aktif.

Apabila Composition dihapus secara logis (soft delete) atau diarsipkan, Workflow mengikuti status tersebut.

Hal ini menjaga konsistensi referensi dan audit.

---

# Security

Hak akses terhadap Workflow mengikuti hak akses Composition.

Contoh:

```
User

↓

Project Permission

↓

Composition Permission

↓

Workflow Access
```

Tidak ada permission langsung pada Workflow di luar Composition.

---

# Architectural Principles

1. Composition adalah pemilik Workflow.
2. Workflow tidak dapat berdiri sendiri.
3. Workflow hanya dimiliki satu Composition.
4. Workflow lifecycle mengikuti Composition.
5. Execution hanya mereferensikan Workflow.
6. Runtime hanya membaca Workflow.
7. Workflow tidak dapat dipindahkan antar Composition.
8. Aggregate boundary berada pada Composition.

---

# Benefits

Dengan Composition sebagai pemilik Workflow:

- ownership menjadi jelas,
- aggregate boundary lebih kuat,
- lifecycle lebih konsisten,
- audit lebih sederhana,
- referential integrity terjaga,
- Workflow tidak menjadi orphan,
- Domain Model lebih mudah dipahami.

---

# Consequences

Seluruh operasi terhadap Workflow harus melalui Composition.

Tidak diperbolehkan:

- membuat Workflow tanpa Composition,
- memindahkan Workflow ke Composition lain,
- memberikan ownership Workflow kepada Runtime, Execution, atau Project.

Composition menjadi satu-satunya Aggregate Root bagi Workflow.

---

# Alternatives Considered

## Workflow sebagai Root Aggregate

Ditolak.

Workflow tidak merepresentasikan tujuan bisnis dan hanya merupakan implementasi dari Composition.

---

## Workflow Dimiliki Project

Ditolak.

Project berisi banyak Composition dan tidak boleh mengelola Workflow secara langsung.

---

## Shared Workflow

Ditolak.

Workflow yang digunakan bersama oleh banyak Composition menyebabkan ownership menjadi ambigu dan menyulitkan versioning serta audit.

---

# Impact

ADR ini memengaruhi:

- Object Model
- Object Catalog
- IMS-100 Object Specification
- IMS-300 Workflow Specification
- Workflow Schema
- Composition Schema
- Execution Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib memperlakukan Composition sebagai pemilik tunggal seluruh Workflow.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-002 — Project is Root Aggregate

ADR-007 — Workflow is Declarative

ADR-008 — Execution is Runtime Unit

ADR-013 — Object Identity is Immutable

ADR-020 — Backward Compatibility

---

# Summary

Dalam MMOS, **Composition merupakan pemilik tunggal (owner) dari seluruh Workflow**. Workflow tidak dapat berdiri sendiri, tidak dapat dimiliki oleh Project, Runtime, maupun Execution, dan seluruh lifecycle-nya mengikuti Composition sebagai Aggregate Root.

Keputusan ini memastikan ownership yang jelas, menjaga referential integrity, mencegah terbentuknya orphan workflow, serta memperkuat konsistensi Domain Model dan batas aggregate dalam arsitektur MMOS.