# ADR-013 — Object Identity is Immutable

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS terdiri dari berbagai Domain Object yang saling berhubungan, antara lain:

- Project
- Composition
- Workflow
- Task
- Agent
- Execution
- Memory
- Artifact
- Event
- Capability

Seluruh object tersebut harus dapat direferensikan secara konsisten sepanjang lifecycle-nya.

Identity menjadi fondasi bagi:

- ownership
- relationship
- audit
- event sourcing
- synchronization
- distributed execution

Oleh karena itu MMOS membutuhkan aturan yang jelas mengenai identitas object.

---

# Problem

Apabila Identity suatu object dapat berubah, maka akan muncul berbagai masalah:

- relationship menjadi rusak,
- event tidak dapat ditelusuri,
- audit kehilangan referensi,
- cache menjadi tidak valid,
- sinkronisasi gagal,
- referential integrity hilang,
- replay menjadi tidak akurat.

Identity bukan atribut bisnis.

Identity adalah identitas permanen object.

---

# Decision

MMOS menetapkan bahwa **Identity setiap Domain Object bersifat Immutable**.

Setelah object dibuat:

- ID tidak boleh diubah,
- ID tidak boleh digunakan kembali,
- ID tidak boleh dipindahkan ke object lain.

Perubahan atribut bisnis tidak mengubah Identity.

---

# Principle

Prinsip utama ADR ini adalah:

> **Identity Never Changes, State May Change.**

State dapat berubah.

Identity tetap.

---

# Identity Model

```
Object Created

↓

Generate ID

↓

Persist

↓

Use Forever
```

Identity berlaku selama object masih ada.

---

# Domain Objects

Seluruh object utama wajib memiliki identity unik.

Contoh:

Project

```
projectId
```

Composition

```
compositionId
```

Workflow

```
workflowId
```

Execution

```
executionId
```

Artifact

```
artifactId
```

Memory

```
memoryId
```

Event

```
eventId
```

Capability

```
capabilityId
```

Identity tidak pernah berubah.

---

# Identity vs Business Data

Contoh:

```
Composition

ID:
CMP-001
```

Nama:

```
Product Launch

↓

Summer Campaign

↓

Holiday Campaign
```

Nama dapat berubah.

Identity tetap:

```
CMP-001
```

---

# Relationship

Seluruh relationship menggunakan Identity.

```
Project

↓

Composition ID

↓

Workflow ID

↓

Execution ID

↓

Artifact ID
```

Relationship tidak menggunakan nama object.

---

# Identity Generation

Identity harus:

- unik
- global dalam boundary yang ditentukan
- tidak dapat diprediksi (jika diperlukan)
- stabil
- independen dari business data

Implementasi dapat menggunakan:

- UUID
- ULID
- KSUID
- Snowflake ID

Jenis implementasi tidak memengaruhi model domain.

---

# Identity Ownership

Identity dibuat saat object dibuat.

Identity tidak boleh:

- diganti,
- di-reset,
- dipinjam,
- digunakan kembali.

Walaupun object dihapus, Identity tetap dianggap telah digunakan.

---

# Object Lifecycle

```
Create

↓

Assign Identity

↓

Active

↓

Archived

↓

Deleted
```

Identity tetap menjadi referensi historis meskipun object telah dihapus secara logis.

---

# Event Relationship

Seluruh Event mereferensikan object melalui Identity.

Contoh:

```
CompositionCreated

↓

compositionId
```

Kemudian:

```
WorkflowStarted

↓

compositionId
```

Kemudian:

```
ExecutionCompleted

↓

compositionId
```

Timeline dapat direkonstruksi melalui Identity yang sama.

---

# Distributed System

Karena MMOS mendukung distributed architecture:

- Engine berbeda,
- Runtime berbeda,
- Region berbeda,

maka Identity harus tetap konsisten di seluruh sistem.

Identity tidak boleh bergantung pada lokasi deployment.

---

# Synchronization

Sinkronisasi antar layanan dilakukan menggunakan Identity.

```
Service A

↓

compositionId

↓

Service B

↓

compositionId
```

Identity menjadi referensi tunggal.

---

# Caching

Cache menggunakan Identity sebagai key.

```
compositionId

↓

Cache

↓

Object
```

Perubahan nama atau metadata tidak memengaruhi cache key.

---

# Audit

Audit selalu menggunakan Identity.

Contoh:

```
Composition

↓

Workflow

↓

Execution

↓

Event
```

Seluruh hubungan historis tetap dapat ditelusuri walaupun atribut bisnis berubah.

---

# Security

Permission diberikan terhadap object berdasarkan Identity.

Contoh:

```
User

↓

Role

↓

Permission

↓

compositionId
```

Bukan berdasarkan nama atau atribut lain yang dapat berubah.

---

# Architectural Principles

1. Identity bersifat immutable.
2. Identity bersifat unik.
3. Identity tidak mengandung business meaning.
4. Relationship menggunakan Identity.
5. Audit menggunakan Identity.
6. Event mereferensikan Identity.
7. Identity tidak digunakan kembali.
8. Identity tetap berlaku selama lifecycle historis object.

---

# Benefits

Dengan Identity yang immutable:

- referential integrity terjaga,
- audit lebih akurat,
- event sourcing lebih mudah,
- cache lebih stabil,
- sinkronisasi lebih andal,
- distributed execution lebih sederhana,
- debugging lebih mudah.

---

# Consequences

Seluruh Domain Object wajib memiliki identity permanen.

Perubahan pada:

- nama,
- status,
- metadata,
- owner,
- configuration,

tidak boleh menghasilkan Identity baru.

Identity baru hanya dibuat ketika object baru dibuat.

---

# Alternatives Considered

## Mutable Identifier

Ditolak.

Mengubah identifier akan merusak seluruh relationship yang telah terbentuk.

---

## Business Key sebagai Identity

Ditolak.

Business data dapat berubah sehingga tidak cocok menjadi identity permanen.

---

## Reuse Identifier

Ditolak.

Penggunaan ulang identity menyebabkan konflik audit dan menghilangkan integritas historis.

---

# Impact

ADR ini memengaruhi:

- Object Model
- Object Catalog
- Event Catalog
- IMS-100 Object Specification
- IMS-400 Execution Specification
- IMS-800 Event Specification
- JSON Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib menggunakan identity yang immutable untuk seluruh Domain Object.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-002 — Project is Root Aggregate

ADR-008 — Execution is Runtime Unit

ADR-012 — Event is Immutable

ADR-014 — Event-Driven Architecture

---

# Summary

Setiap Domain Object dalam MMOS memiliki **Identity yang bersifat immutable**, unik, dan independen dari data bisnis.

Identity menjadi dasar seluruh relationship, audit, event, sinkronisasi, keamanan, dan distributed execution. Sementara atribut bisnis dapat berubah sepanjang lifecycle object, identity tetap sama sejak object dibuat hingga menjadi bagian dari riwayat sistem.

Prinsip ini memastikan integritas referensi, konsistensi data, dan kemampuan audit pada seluruh arsitektur MMOS.