# MMOS v1.0 — Example: Multi-Agent Collaboration

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini memberikan contoh bagaimana beberapa Agent dapat
berkolaborasi dalam satu Workflow menggunakan arsitektur MMOS.

Contoh ini bertujuan memperlihatkan bagaimana:

- Agent bekerja secara independen
- Workflow mengatur koordinasi
- Execution mengelola proses
- Memory menjadi media berbagi Context
- Event mencatat seluruh aktivitas

Dokumen ini bersifat konseptual dan tidak bergantung pada implementasi
bahasa pemrograman tertentu.

---

# 2. Scenario

Sebuah organisasi media ingin menghasilkan artikel berita lengkap.

Proses dilakukan oleh beberapa Agent.

```text
Reporter Agent

↓

Fact Checker Agent

↓

Editor Agent

↓

Publisher Agent
```

Setiap Agent memiliki tanggung jawab yang berbeda.

---

# 3. Agent Responsibilities

## Reporter Agent

Bertugas:

- Mengumpulkan informasi
- Menyusun draft awal

Output:

```text
Draft Article
```

---

## Fact Checker Agent

Bertugas:

- Memverifikasi fakta
- Menandai informasi yang tidak valid

Output:

```text
Verified Draft
```

---

## Editor Agent

Bertugas:

- Memperbaiki tata bahasa
- Menyesuaikan gaya penulisan
- Menyusun struktur artikel

Output:

```text
Edited Article
```

---

## Publisher Agent

Bertugas:

- Menyiapkan artikel untuk dipublikasikan
- Menambahkan metadata
- Menghasilkan hasil akhir

Output:

```text
Published Article
```

---

# 4. Overall Workflow

```text
Receive Request

↓

Reporter Agent

↓

Fact Checker Agent

↓

Editor Agent

↓

Publisher Agent

↓

Complete
```

Workflow menentukan urutan Agent.

Agent tidak memanggil Agent lain secara langsung.

---

# 5. Architecture

```text
               Workflow

                   │

      ┌────────────┼────────────┐

Reporter      Fact Checker      Editor

                   │

             Publisher
```

Workflow Engine bertanggung jawab mengatur urutan eksekusi.

---

# 6. Execution Model

Workflow menghasilkan beberapa Execution.

```text
Workflow

↓

Execution-1

↓

Reporter

------------

Execution-2

↓

Fact Checker

------------

Execution-3

↓

Editor

------------

Execution-4

↓

Publisher
```

Setiap Execution berdiri sendiri.

---

# 7. Runtime Usage

Setiap Agent menggunakan Runtime.

```text
Reporter

↓

Runtime

↓

LLM

------------

Editor

↓

Runtime

↓

LLM
```

Runtime dapat menggunakan Provider yang berbeda sesuai Runtime Policy.

---

# 8. Memory Collaboration

Agent berbagi Context melalui Memory.

```text
Reporter

↓

Memory

↓

Fact Checker

↓

Memory

↓

Editor

↓

Memory

↓

Publisher
```

Agent tidak bertukar data secara langsung.

---

# 9. Event Flow

Seluruh proses menghasilkan Event.

```text
WorkflowStarted

↓

ReporterCompleted

↓

FactCheckerCompleted

↓

EditorCompleted

↓

PublisherCompleted

↓

WorkflowCompleted
```

Event digunakan untuk Monitoring dan Audit.

---

# 10. Shared Context

Contoh isi Memory.

```text
Workspace

Project

Draft Article

Verified Facts

Editorial Notes
```

Seluruh Agent membaca Context yang relevan melalui Memory Engine.

---

# 11. Capability Usage

Beberapa Agent dapat menggunakan Capability.

Contoh:

Reporter Agent

```text
Search Capability

News API

Web Search
```

Fact Checker

```text
Knowledge Base

Verification Service
```

Publisher

```text
CMS

Media Storage

Notification
```

Capability diakses melalui Capability Engine.

---

# 12. Object Relationship

```text
Composition

↓

Workflow

↓

Agent

↓

Execution

↓

Runtime

↓

Capability

↓

Result
```

Memory dan Event mendukung seluruh proses.

---

# 13. Sequence Overview

```text
Client

↓

Workflow

↓

Reporter

↓

Fact Checker

↓

Editor

↓

Publisher

↓

Client
```

Workflow menjadi pengendali utama.

---

# 14. Failure Scenario

Misalkan Fact Checker gagal.

```text
Reporter

↓

Completed

↓

Fact Checker

↓

Failed

↓

Retry

↓

Completed

↓

Editor
```

Workflow tidak melanjutkan ke Agent berikutnya sampai kebijakan Retry selesai dijalankan.

---

# 15. Parallel Execution

Workflow juga dapat menjalankan Agent secara paralel.

Contoh:

```text
             Workflow

          /            \

Reporter            Image Agent

          \            /

             Editor
```

Kedua Agent berjalan bersamaan sebelum Editor dimulai.

---

# 16. Human Interaction

Workflow dapat meminta persetujuan manusia.

```text
Editor

↓

Human Review

↓

Approved

↓

Publisher
```

Human Review diperlakukan sebagai Task dalam Workflow.

---

# 17. Scalability

Banyak Workflow dapat berjalan bersamaan.

```text
Workflow A

Workflow B

Workflow C

Workflow D
```

Setiap Workflow memiliki Correlation ID sendiri.

---

# 18. Observability

Seluruh Agent menghasilkan:

- Logs
- Metrics
- Events
- Audit Trail

Seluruh aktivitas dapat ditelusuri berdasarkan:

- Workflow ID
- Execution ID
- Correlation ID

---

# 19. Design Principles

Contoh ini menunjukkan bahwa:

- Workflow mengatur kolaborasi.
- Agent tidak saling memanggil secara langsung.
- Memory menjadi media berbagi Context.
- Capability digunakan melalui Capability Engine.
- Runtime menjalankan AI.
- Event mencatat seluruh aktivitas.
- Orchestrator hanya melakukan koordinasi.

---

# 20. Comparison with Simple Agent

| Aspect | Simple Agent | Multi-Agent |
|----------|--------------|-------------|
| Number of Agents | 1 | Multiple |
| Workflow | Linear | Linear atau Parallel |
| Shared Memory | Minimal | Ya |
| Capability | Opsional | Umumnya digunakan |
| Human Review | Tidak | Opsional |
| Coordination | Sederhana | Workflow Engine |
| Complexity | Rendah | Menengah hingga Tinggi |

---

# 21. Related Documents

- simple-agent.md
- workflow-sample.md
- agent-execution.md
- workflow-execution.md
- memory-read.md
- memory-write.md
- event-flow.md
- MAS-600 Agent Architecture

---

# END