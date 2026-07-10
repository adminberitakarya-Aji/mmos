# ADR-015 — Human in the Loop

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang untuk mengotomatisasi berbagai proses menggunakan AI, Workflow, Agent, dan Capability.

Meskipun sebagian besar pekerjaan dapat dilakukan secara otomatis, terdapat banyak situasi yang tetap membutuhkan keputusan manusia.

Contohnya:

- persetujuan dokumen
- validasi hasil AI
- review konten
- approval publikasi
- persetujuan pembayaran
- eskalasi keamanan
- intervensi ketika AI gagal mengambil keputusan

MMOS harus mendukung kolaborasi antara AI dan manusia sebagai bagian dari Workflow yang sama.

---

# Problem

Apabila seluruh proses dipaksa berjalan secara otomatis, maka akan muncul berbagai risiko:

- AI mengambil keputusan yang tidak seharusnya
- kesalahan tidak dapat dicegah sebelum dipublikasikan
- tidak ada mekanisme approval
- tidak memenuhi kebutuhan audit
- sulit memenuhi regulasi bisnis
- tidak dapat menangani exception yang memerlukan pertimbangan manusia

Sebaliknya, apabila seluruh proses bergantung pada manusia, maka manfaat otomatisasi akan hilang.

MMOS membutuhkan model yang menggabungkan otomatisasi dan intervensi manusia secara terstruktur.

---

# Decision

MMOS mengadopsi prinsip **Human in the Loop (HITL)**.

Manusia diperlakukan sebagai **participant** dalam Workflow, sama seperti Agent atau Capability.

Workflow dapat berhenti sementara dan menunggu tindakan manusia sebelum melanjutkan proses.

---

# Principle

Prinsip utama ADR ini adalah:

> **Automation by Default, Human by Decision.**

AI mengerjakan pekerjaan operasional.

Manusia mengambil keputusan yang memerlukan pertimbangan.

---

# Architecture

```
Workflow

↓

Task

↓

Human Task

↓

Waiting

↓

Decision

↓

Continue Workflow
```

Human Task merupakan bagian resmi dari Workflow.

---

# Human Task

Human Task mendefinisikan:

- assignee
- role
- action
- deadline
- priority
- approval policy
- timeout policy

Human Task bukan implementasi UI.

Human Task hanyalah definisi proses.

---

# Workflow Example

```
Generate Article

↓

AI Review

↓

Human Approval

↓

Publish
```

atau

```
Generate Image

↓

Human Selection

↓

Video Rendering
```

Workflow tetap bersifat deklaratif.

---

# Human Decision

Keputusan manusia dapat berupa:

- Approve
- Reject
- Revise
- Escalate
- Cancel
- Delegate

Workflow menentukan langkah berikutnya berdasarkan keputusan tersebut.

---

# Execution State

Saat menunggu manusia:

```
Running

↓

Waiting for Human

↓

Approved

↓

Running

↓

Completed
```

Execution tetap aktif selama menunggu keputusan.

---

# Assignment Model

Human Task dapat ditugaskan kepada:

- User
- Team
- Role
- Group

Runtime bertanggung jawab melakukan assignment berdasarkan kebijakan yang berlaku.

---

# Timeout Policy

Human Task dapat memiliki batas waktu.

Contoh:

```
Waiting

↓

Timeout

↓

Auto Reject
```

atau

```
Waiting

↓

Timeout

↓

Escalate
```

atau

```
Waiting

↓

Timeout

↓

Auto Approve
```

Kebijakan timeout merupakan bagian dari Workflow.

---

# Audit

Seluruh tindakan manusia menghasilkan Event.

Contoh:

```
Approval Requested

↓

Approved

↓

Workflow Continued
```

atau

```
Approval Requested

↓

Rejected

↓

Workflow Terminated
```

Seluruh keputusan dapat diaudit.

---

# Identity

Keputusan manusia harus mencatat:

- userId
- timestamp
- action
- comment
- executionId
- compositionId

Seluruh informasi menjadi bagian dari audit trail.

---

# Notification

Runtime dapat mempublikasikan Event:

```
Human Task Created
```

Subscriber kemudian dapat:

- mengirim email
- mengirim push notification
- mengirim Slack
- mengirim Microsoft Teams
- mengirim webhook

Workflow tidak mengetahui mekanisme notifikasi.

---

# Security

Hanya pengguna yang memiliki permission dapat menyelesaikan Human Task.

Permission mengikuti model:

```
Project

↓

Role

↓

Permission

↓

Human Task
```

Runtime wajib melakukan validasi hak akses sebelum menerima keputusan.

---

# Retry

Apabila Human Task gagal diproses karena kesalahan teknis:

```
Retry Delivery
```

Namun keputusan manusia sendiri tidak boleh diulang secara otomatis.

Runtime hanya dapat mengulang proses penyampaian tugas, bukan mengubah hasil keputusan.

---

# Observability

Human Task menghasilkan informasi seperti:

- waiting duration
- response time
- approval rate
- rejection rate
- escalation count

Data tersebut digunakan untuk monitoring dan analitik proses.

---

# Architectural Principles

1. Manusia merupakan participant dalam Workflow.
2. Human Task adalah bagian dari Workflow.
3. Workflow dapat berhenti menunggu manusia.
4. Keputusan manusia menghasilkan Event.
5. Human Task mengikuti permission Project.
6. Runtime mengelola assignment.
7. Workflow tetap deklaratif.
8. Seluruh keputusan dapat diaudit.

---

# Benefits

Dengan Human in the Loop:

- AI tetap berada dalam kendali manusia.
- Workflow memenuhi kebutuhan bisnis.
- Approval menjadi bagian resmi dari proses.
- Audit menjadi lengkap.
- Risiko kesalahan AI berkurang.
- Regulasi lebih mudah dipenuhi.
- Otomatisasi tetap maksimal tanpa menghilangkan kontrol manusia.

---

# Consequences

Seluruh Workflow yang membutuhkan validasi manusia harus menggunakan Human Task.

Human Task tidak boleh diimplementasikan sebagai script khusus atau logika di luar Workflow.

Semua interaksi manusia harus menjadi bagian resmi dari model Workflow MMOS.

---

# Alternatives Considered

## Fully Automated Workflow

Ditolak.

Tidak semua keputusan dapat atau boleh diambil oleh AI.

---

## External Approval System

Ditolak.

Approval menjadi terpisah dari Workflow sehingga audit dan observability tidak lengkap.

---

## Manual Workflow Outside MMOS

Ditolak.

Menghilangkan kemampuan tracking, monitoring, dan replay dari sistem.

---

# Impact

ADR ini memengaruhi:

- MAS-200 Execution Model
- MAS-600 Agent Architecture
- IMS-300 Workflow Specification
- IMS-400 Execution Specification
- Event Catalog
- Workflow Schema
- Execution Schema
- Human Task Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib memperlakukan Human Task sebagai bagian resmi dari Workflow, bukan sebagai proses eksternal.

---

# Related ADR

ADR-007 — Workflow is Declarative

ADR-008 — Execution is Runtime Unit

ADR-012 — Event is Immutable

ADR-014 — Event-Driven Architecture

ADR-016 — Storage Agnostic

---

# Summary

MMOS mengadopsi prinsip **Human in the Loop (HITL)**, yaitu manusia menjadi participant resmi dalam Workflow bersama AI, Agent, dan Capability.

Workflow dapat berhenti sementara untuk menunggu keputusan manusia, kemudian melanjutkan proses berdasarkan hasil keputusan tersebut. Seluruh interaksi manusia tercatat sebagai Event, mengikuti mekanisme audit, permission, dan observability yang sama dengan komponen lainnya.

Dengan pendekatan ini, MMOS mampu menggabungkan otomatisasi AI dan pengambilan keputusan manusia dalam satu model workflow yang konsisten, terukur, dan dapat diaudit.