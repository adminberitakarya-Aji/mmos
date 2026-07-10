# MMOS v1.0 — Workflow Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan struktur **Workflow** di dalam MMOS.

Workflow merupakan representasi deklaratif dari suatu proses bisnis
yang terdiri atas sekumpulan Task beserta hubungan, aturan transisi,
percabangan, sinkronisasi, dan kondisi penyelesaiannya.

Workflow **tidak menjalankan pekerjaan**.

Workflow hanya mendeskripsikan proses yang akan dijalankan oleh
Execution Engine.

---

# 2. Objectives

Workflow Diagram bertujuan untuk:

- Menjelaskan struktur internal Workflow
- Menjelaskan hubungan Workflow dengan Object lain
- Menjelaskan pola percabangan
- Menjelaskan pola paralel
- Menjadi referensi implementasi Workflow Engine

---

# 3. Workflow Principles

Workflow pada MMOS mengikuti prinsip:

- Declarative
- Deterministic
- Event Driven
- Engine Independent
- Runtime Independent
- Provider Agnostic

Workflow tidak mengetahui implementasi Agent maupun Runtime.

---

# 4. Workflow Position

Workflow berada di bawah Composition.

```text
Workspace
    │
    ▼
Project
    │
    ▼
Composition
    │
    ▼
Workflow
```

Satu Composition memiliki satu Workflow utama.

---

# 5. High-Level Workflow Structure

```text
Composition
      │
      ▼
Workflow
      │
      ▼
+----------------------+
|       Task           |
+----------------------+
      │
      ▼
+----------------------+
|   Transition Rule    |
+----------------------+
      │
      ▼
Next Task
```

Workflow mengendalikan perpindahan antar Task.

---

# 6. Internal Structure

Workflow terdiri dari:

```text
Workflow

├── Metadata
├── Variables
├── Input
├── Output
├── Policy
├── Entry Task
├── Task Collection
├── Transition Rules
└── Exit Conditions
```

Workflow tidak menyimpan Runtime State.

---

# 7. Task Relationship

```text
Workflow

├── Task A
├── Task B
├── Task C
└── Task D
```

Workflow memiliki satu atau lebih Task.

Task dapat digunakan kembali pada Workflow lain.

---

# 8. Transition Relationship

```text
Task A

↓

Transition

↓

Task B
```

Transition menentukan Task berikutnya.

Transition bukan Task.

---

# 9. Sequential Workflow

Workflow paling sederhana.

```text
Start

↓

Task A

↓

Task B

↓

Task C

↓

End
```

Task dijalankan satu per satu.

---

# 10. Parallel Workflow

Workflow dapat memiliki cabang paralel.

```text
             Start
               │
               ▼
            Task A
          ┌────┴────┐
          ▼         ▼
      Task B     Task C
          └────┬────┘
               ▼
            Task D
               ▼
              End
```

Task B dan Task C dapat berjalan bersamaan.

Workflow melanjutkan setelah seluruh cabang selesai.

---

# 11. Conditional Workflow

Workflow dapat memiliki percabangan.

```text
Task A
   │
   ▼
Condition
 ┌──┴──┐
 │     │
 ▼     ▼
Yes   No
 │     │
 ▼     ▼
B      C
```

Percabangan mengikuti Transition Rule.

---

# 12. Loop Workflow

Workflow dapat mengulang Task.

```text
Task A

↓

Task B

↓

Condition

↓

Retry?

↓

Yes

↓

Task B
```

Loop dikendalikan oleh Workflow,
bukan oleh Agent.

---

# 13. Human-in-the-Loop

Workflow dapat memasukkan Human Task.

```text
Writer Agent

↓

Human Review

↓

Publisher Agent
```

Human Task diperlakukan sama seperti Task lainnya.

---

# 14. Execution Relationship

Workflow menghasilkan Execution.

```text
Workflow

↓

Execution

↓

Task Execution
```

Workflow tidak menjalankan Runtime.

---

# 15. Runtime Relationship

```text
Workflow

↓

Execution

↓

Runtime
```

Workflow tidak mengetahui Provider AI.

---

# 16. Capability Relationship

```text
Workflow

↓

Execution

↓

Capability
```

Capability digunakan oleh Execution sesuai kebutuhan Task.

---

# 17. Memory Relationship

Workflow menggunakan Context melalui Memory.

```text
Workflow

↓

Execution

↓

Memory Engine

↓

Context
```

Workflow tidak mengakses Storage secara langsung.

---

# 18. Event Relationship

Workflow menghasilkan Event.

```text
Workflow Started

↓

Task Started

↓

Task Completed

↓

Workflow Completed
```

Event digunakan untuk observability.

---

# 19. Lifecycle Overview

```text
Created

↓

Validated

↓

Ready

↓

Running

↓

Completed
```

Detail lifecycle dijelaskan pada
`workflow-state.md`.

---

# 20. Dependency Rules

Workflow hanya bergantung pada:

- Composition
- Task
- Transition Rule

Workflow tidak bergantung pada:

- Runtime
- Capability Provider
- Storage
- AI Model

---

# 21. Design Constraints

Workflow harus memenuhi aturan berikut:

- Memiliki tepat satu Entry Point.
- Memiliki minimal satu Exit Path.
- Tidak boleh memiliki Task yang tidak dapat dicapai (unreachable task).
- Seluruh loop harus memiliki Exit Condition.
- Setiap Transition harus mengarah ke Task yang valid.

---

# 22. Design Principles

Workflow mengikuti prinsip:

- Workflow bersifat deklaratif.
- Workflow mendeskripsikan proses, bukan implementasi.
- Workflow tidak menjalankan AI.
- Workflow tidak memanggil Engine lain.
- Workflow menghasilkan Execution.
- Workflow dapat digunakan kembali (reusable).
- Workflow dapat divalidasi sebelum dijalankan.

---

# 23. Relationship with Other Diagrams

```text
Object Model
      │
      ▼
Workflow Diagram
      │
      ▼
Execution Diagram
      │
      ▼
Runtime Diagram
```

Workflow Diagram menjadi penghubung antara model objek dan proses eksekusi.

---

# 24. Related Documents

- object-model.md
- execution-diagram.md
- workflow-execution.md
- workflow-state.md
- task-state.md
- MAS-400 Orchestrator
- IMS-300 Workflow Specification

---

# END