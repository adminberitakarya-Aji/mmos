# ADR-007 — Workflow is Declarative

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

Workflow merupakan salah satu komponen inti MMOS.

Workflow mendeskripsikan bagaimana sebuah Composition diselesaikan melalui serangkaian Task, Agent, Capability, dan keputusan (Decision).

Pada banyak platform automation, workflow sering berisi logika implementasi secara langsung, seperti:

- script
- source code
- provider API
- SQL
- Python
- JavaScript

Pendekatan tersebut membuat workflow menjadi sulit dipindahkan, sulit divalidasi, dan bergantung pada teknologi tertentu.

MMOS membutuhkan workflow yang bersifat portable, dapat divalidasi, mudah dipahami, dan independen terhadap implementasi.

---

# Problem

Workflow yang bersifat imperatif (implementation-driven) menyebabkan:

- bergantung pada bahasa pemrograman
- sulit dianalisis
- tidak dapat divisualisasikan dengan baik
- sulit divalidasi
- tidak reusable
- tidak portable
- sulit berpindah provider
- sulit diuji sebelum dijalankan

Workflow seharusnya menjelaskan **apa yang harus dilakukan**, bukan **bagaimana implementasinya**.

---

# Decision

MMOS menetapkan bahwa seluruh Workflow bersifat **Declarative**.

Workflow hanya mendeskripsikan:

- tujuan
- urutan pekerjaan
- dependency
- kondisi
- input
- output

Workflow tidak boleh berisi implementasi teknis.

Implementasi dijalankan oleh Runtime dan Engine.

---

# Principle

Prinsip utama ADR ini adalah:

> **Describe What, Never How.**

Workflow mendefinisikan pekerjaan.

Runtime menentukan cara menjalankannya.

---

# Declarative Model

Workflow mendeskripsikan:

```
Task A

↓

Task B

↓

Decision

↓

Task C

↓

Task D
```

Workflow tidak menjelaskan:

- API yang dipanggil
- model AI yang digunakan
- bahasa pemrograman
- provider
- query database
- implementasi internal

---

# Workflow Responsibilities

Workflow bertanggung jawab terhadap:

- task definition
- dependency graph
- execution order
- branching
- looping
- retry policy
- timeout policy
- input mapping
- output mapping

Workflow tidak bertanggung jawab terhadap:

- AI inference
- media rendering
- database access
- storage
- provider selection
- runtime allocation

---

# Execution Model

```
Composition

↓

Workflow

↓

Execution Plan

↓

Runtime

↓

Engine

↓

Capability
```

Workflow menghasilkan Execution Plan.

Runtime mengeksekusi Execution Plan.

---

# Task Definition

Task mendefinisikan:

- identifier
- capability
- input
- output
- dependency
- condition
- retry policy

Task tidak menyimpan implementasi.

Contoh:

```
Task

Capability:
GenerateSummary

Input:
Article

Output:
Summary
```

Workflow tidak mengetahui provider yang menghasilkan ringkasan.

---

# Dependency Graph

Workflow mendukung Directed Acyclic Graph (DAG).

Contoh:

```
Task A

├── Task B

├── Task C

└── Task D
```

Runtime menentukan urutan eksekusi berdasarkan dependency.

---

# Conditional Execution

Workflow mendukung:

- if
- switch
- branch
- parallel
- join
- loop

Namun kondisi hanya mendeskripsikan aturan bisnis.

Implementasi evaluasi dilakukan oleh Workflow Engine.

---

# Reusability

Workflow harus dapat digunakan kembali.

Workflow tidak boleh mengandung:

- API Key
- Endpoint
- Provider Name
- Model Name
- Database Connection

Workflow hanya menggunakan parameter.

---

# Portability

Workflow dapat dipindahkan antar:

- Project
- Environment
- Cloud
- Deployment
- Runtime
- Provider

tanpa perubahan struktur.

---

# Validation

Karena workflow bersifat deklaratif, maka dapat divalidasi sebelum dijalankan.

Validasi meliputi:

- struktur
- dependency
- cycle detection
- missing task
- invalid capability
- invalid input
- invalid output
- schema validation

Workflow yang tidak valid tidak boleh dieksekusi.

---

# Visualization

Workflow deklaratif dapat divisualisasikan menjadi:

- DAG
- Flow Diagram
- BPMN-style Diagram
- Dependency Graph
- Timeline

Visualisasi berasal dari definisi workflow, bukan implementasi.

---

# Runtime Responsibilities

Runtime bertanggung jawab terhadap:

- scheduling
- provider selection
- engine selection
- retry execution
- timeout handling
- resource allocation
- execution monitoring

Runtime tidak mengubah definisi workflow.

---

# Architectural Principles

1. Workflow hanya mendeskripsikan proses.
2. Workflow tidak mengandung implementasi.
3. Workflow bebas dari provider.
4. Workflow bebas dari bahasa pemrograman.
5. Workflow dapat divalidasi sebelum dijalankan.
6. Workflow dapat divisualisasikan.
7. Workflow dapat digunakan kembali.
8. Runtime bertanggung jawab terhadap eksekusi.

---

# Benefits

Dengan Workflow Declarative:

- workflow lebih sederhana
- mudah dipahami
- mudah divalidasi
- mudah diuji
- reusable
- portable
- provider independent
- mudah divisualisasikan
- mudah dioptimalkan

---

# Consequences

Seluruh workflow MMOS harus direpresentasikan sebagai data.

Contoh representasi:

- JSON
- YAML

Workflow tidak boleh berupa:

- Python Script
- JavaScript
- SQL
- Bash Script
- Provider SDK
- Hardcoded API Call

Implementasi selalu dipisahkan dari definisi workflow.

---

# Alternatives Considered

## Imperative Workflow

Ditolak.

Workflow menjadi bergantung pada implementasi dan sulit dipindahkan.

---

## Provider-Specific Workflow

Ditolak.

Workflow harus tetap dapat berjalan meskipun provider berubah.

---

## Script-Based Workflow

Ditolak.

Script tidak dapat divalidasi secara formal, sulit divisualisasikan, dan meningkatkan coupling terhadap teknologi tertentu.

---

# Impact

ADR ini memengaruhi:

- MAS-200 Execution Model
- MAS-300 Engine Architecture
- IMS-300 Workflow Specification
- Workflow Schema
- Execution Schema
- Workflow Validator
- Workflow Generator
- Workflow Designer
- CLI

Seluruh workflow dalam MMOS wajib mengikuti model deklaratif.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-003 — Orchestrator Never Works

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

ADR-006 — Contract First

ADR-008 — Execution is Runtime Unit

---

# Summary

Workflow dalam MMOS merupakan **deskripsi deklaratif** mengenai bagaimana sebuah Composition diselesaikan.

Workflow hanya menjelaskan **apa** yang harus dilakukan, sedangkan Runtime dan Engine menentukan **bagaimana** pekerjaan tersebut dieksekusi.

Dengan memisahkan definisi proses dari implementasinya, MMOS memperoleh workflow yang portabel, tervalidasi, dapat digunakan kembali, mudah divisualisasikan, serta bebas dari ketergantungan terhadap bahasa pemrograman maupun provider tertentu.