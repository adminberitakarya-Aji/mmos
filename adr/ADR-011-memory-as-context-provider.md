# ADR-011 — Memory as Context Provider

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

Agen AI memerlukan konteks agar dapat menghasilkan keputusan yang relevan dan konsisten.

Tanpa konteks, setiap permintaan diperlakukan sebagai permintaan baru sehingga:

- tidak memahami riwayat,
- tidak mengetahui tujuan pekerjaan,
- tidak mengenali artifact sebelumnya,
- tidak dapat melakukan reasoning berkelanjutan.

MMOS membutuhkan mekanisme penyedia konteks yang dapat digunakan oleh seluruh Workflow, Agent, dan Runtime tanpa menjadikan Memory sebagai pusat logika bisnis.

---

# Problem

Pada banyak sistem AI, Memory sering digunakan sebagai tempat penyimpanan seluruh state aplikasi.

Akibatnya:

- business state bercampur dengan AI context,
- memory menjadi sulit dipelihara,
- data sulit divalidasi,
- ownership tidak jelas,
- retrieval menjadi lambat,
- scalability menurun.

Selain itu, tidak semua informasi layak dimasukkan ke Memory.

MMOS harus memisahkan antara **business data** dan **AI context**.

---

# Decision

MMOS menetapkan bahwa **Memory adalah Context Provider**.

Memory bertugas menyediakan konteks yang relevan untuk proses reasoning dan execution.

Memory bukan sumber kebenaran (Source of Truth).

Source of Truth tetap berada pada Object Domain seperti:

- Composition
- Workflow
- Execution
- Artifact
- Project

---

# Principle

Prinsip utama ADR ini adalah:

> **Memory Provides Context, Domain Provides Truth.**

Memory membantu proses berpikir.

Domain menyimpan fakta bisnis.

---

# Architecture

```
Composition

↓

Execution

↓

Runtime

↓

Memory Engine

↓

Relevant Context

↓

AI Engine
```

Memory berada pada jalur penyedia konteks.

Memory tidak menjalankan Workflow.

---

# Responsibilities

Memory bertanggung jawab terhadap:

- context retrieval
- semantic search
- similarity search
- embedding storage
- context ranking
- knowledge retrieval
- context aggregation

Memory tidak bertanggung jawab terhadap:

- workflow execution
- business validation
- artifact ownership
- project management
- execution state

---

# Memory Model

Memory terdiri atas beberapa jenis:

## Working Memory

Konteks sementara selama Execution berlangsung.

Contoh:

- intermediate result
- temporary variables
- current conversation

Lifecycle mengikuti Execution.

---

## Episodic Memory

Menyimpan riwayat aktivitas.

Contoh:

- previous executions
- user interactions
- execution history

Digunakan untuk pembelajaran dan referensi.

---

## Semantic Memory

Menyimpan pengetahuan umum.

Contoh:

- documentation
- manuals
- knowledge base
- FAQ

Digunakan untuk retrieval berbasis makna.

---

## Reference Memory

Berisi referensi terhadap Object Domain.

Contoh:

- Composition ID
- Artifact ID
- Workflow ID

Memory menyimpan referensi, bukan menggandakan object.

---

# Context Retrieval

Runtime dapat meminta:

```
Retrieve Context
```

Memory Engine melakukan:

```
Embedding Search

↓

Ranking

↓

Filtering

↓

Context Assembly

↓

Return Context
```

Runtime menerima konteks yang relevan.

---

# Context Window

Memory hanya mengirimkan konteks yang diperlukan.

Bukan seluruh isi database.

Proses seleksi mempertimbangkan:

- similarity
- relevance
- recency
- priority
- policy

---

# Ownership

Memory selalu berada dalam boundary Project.

Hubungan utama:

```
Project

↓

Composition

↓

Memory Reference
```

Memory tidak dimiliki langsung oleh Runtime.

---

# Relationship with Execution

Execution dapat:

- membaca Memory,
- menambahkan Memory,
- memperbarui Working Memory.

Namun Execution tidak menjadi pemilik Memory.

---

# Persistence

Memory dapat disimpan pada:

- Vector Database
- Document Store
- Object Storage
- Relational Database

Implementasi storage tidak memengaruhi domain model.

---

# Retrieval Strategy

Memory Engine dapat menggunakan:

- semantic search
- keyword search
- hybrid search
- metadata filtering
- graph traversal

Strategi retrieval merupakan detail implementasi.

Workflow tidak mengetahuinya.

---

# Context Lifecycle

```
Knowledge

↓

Indexed

↓

Embedded

↓

Stored

↓

Retrieved

↓

Injected

↓

Used
```

Context bersifat dinamis.

Knowledge tetap berada pada storage.

---

# Security

Memory harus mengikuti permission Project.

Pengguna hanya dapat mengambil konteks dari resource yang memiliki hak akses.

Memory Engine tidak boleh mengembalikan context lintas Project.

---

# Architectural Principles

1. Memory menyediakan konteks.
2. Memory bukan source of truth.
3. Memory terpisah dari domain object.
4. Retrieval dilakukan berdasarkan relevansi.
5. Memory dapat digunakan oleh seluruh Engine.
6. Memory bersifat provider-agnostic.
7. Memory mengikuti ownership Project.
8. Context selalu dibangun saat runtime.

---

# Benefits

Dengan Memory sebagai Context Provider:

- AI memiliki konteks yang lebih baik.
- Domain model tetap bersih.
- Retrieval dapat dioptimalkan.
- Memory dapat berkembang secara independen.
- Knowledge mudah digunakan kembali.
- Skalabilitas meningkat.
- Audit lebih sederhana.

---

# Consequences

Seluruh komponen MMOS harus mengikuti aturan berikut:

Business data tetap berada pada Domain Object.

Memory hanya menyimpan:

- embedding
- context
- knowledge
- reference
- retrieval metadata

Memory tidak boleh menjadi tempat penyimpanan utama business object.

---

# Alternatives Considered

## Memory sebagai Database Utama

Ditolak.

Business object harus tetap berada pada Domain Model agar ownership dan konsistensi tetap terjaga.

---

## Runtime Menyimpan Seluruh Context

Ditolak.

Runtime bersifat stateless (ADR-009).

---

## Workflow Mengelola Memory Sendiri

Ditolak.

Workflow hanya mendeskripsikan proses.

Memory merupakan layanan independen.

---

# Impact

ADR ini memengaruhi:

- MAS-500 Memory & Knowledge
- MAS-700 AI Runtime
- IMS-500 Memory Specification
- Memory Schema
- Execution Schema
- Capability Schema
- Memory Engine
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib memperlakukan Memory sebagai penyedia konteks, bukan sebagai sumber kebenaran domain.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-005 — Provider Agnostic

ADR-007 — Workflow is Declarative

ADR-009 — Runtime is Stateless

ADR-010 — Capability as Contract

ADR-012 — Event is Immutable

---

# Summary

Memory dalam MMOS berfungsi sebagai **Context Provider** yang menyediakan informasi relevan bagi Runtime dan AI Engine selama proses execution.

Memory bukan tempat penyimpanan utama business object maupun execution state. Source of truth tetap berada pada Domain Object, sedangkan Memory mengoptimalkan proses reasoning melalui retrieval, ranking, dan penyusunan konteks yang relevan.

Pemisahan ini menghasilkan arsitektur yang bersih, mudah diskalakan, konsisten, dan mendukung kemampuan AI yang lebih cerdas tanpa mengorbankan integritas model domain.