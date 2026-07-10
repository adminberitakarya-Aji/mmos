# MMOS v1.0 — Example: Human-in-the-Loop

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini memberikan contoh bagaimana **Human-in-the-Loop (HITL)**
diimplementasikan di dalam MMOS.

Pada MMOS, manusia merupakan salah satu peserta (participant)
dalam Workflow, sama seperti Agent maupun Capability.

Human-in-the-Loop memungkinkan proses AI dikendalikan,
divalidasi, atau disetujui oleh manusia sebelum Workflow
dilanjutkan.

---

# 2. Human-in-the-Loop Principles

Human-in-the-Loop digunakan ketika:

- membutuhkan persetujuan
- membutuhkan keputusan manusia
- membutuhkan validasi hasil AI
- membutuhkan input tambahan
- memenuhi persyaratan regulasi
- memenuhi proses bisnis

Human bukan bagian dari Runtime.

Human merupakan bagian dari Workflow.

---

# 3. Example Scenario

Sebuah perusahaan menggunakan AI
untuk membuat artikel berita.

Sebelum dipublikasikan,
editor harus memberikan persetujuan.

Workflow:

```text
Generate Article

↓

Human Review

↓

Publish
```

---

# 4. Workflow

```text
Receive Request

↓

Generate Draft

↓

Human Review

↓

Publish

↓

Completed
```

Workflow berhenti sementara
hingga keputusan manusia tersedia.

---

# 5. Human Task

Human direpresentasikan sebagai Task.

```text
Workflow

↓

Task

↓

Human Review
```

Workflow Engine menjadwalkan Task
seperti Task lainnya.

---

# 6. Architecture

```text
Workflow

↓

Execution

↓

Human Task

↓

Human

↓

Decision

↓

Execution Continue
```

Execution tidak mengetahui siapa manusia
yang melakukan Review.

---

# 7. State Transition

Human Task memiliki State.

```text
Created

↓

Assigned

↓

Waiting

↓

Completed
```

Jika dibatalkan.

```text
Waiting

↓

Cancelled
```

---

# 8. Human Assignment

Task dapat diberikan kepada:

- User
- Reviewer
- Editor
- Manager
- Administrator
- Team

Penentuan Assignment mengikuti Workflow Policy.

---

# 9. Human Decision

Contoh keputusan.

```text
Approve

Reject

Request Revision

Escalate
```

Workflow menentukan langkah berikutnya.

---

# 10. Approval Flow

```text
Draft

↓

Review

↓

Approved?

↓

Yes

↓

Publish
```

---

# 11. Rejection Flow

```text
Draft

↓

Review

↓

Rejected

↓

Writer Agent

↓

New Draft

↓

Review
```

Workflow dapat kembali
ke Task sebelumnya.

---

# 12. Revision Flow

```text
Human

↓

Revision Requested

↓

Writer Agent

↓

Updated Draft

↓

Review
```

Workflow dapat berulang
hingga memenuhi persyaratan.

---

# 13. Multiple Reviewers

Workflow dapat menggunakan
lebih dari satu Reviewer.

```text
Writer

↓

Reviewer A

↓

Reviewer B

↓

Publisher
```

Urutan ditentukan oleh Workflow.

---

# 14. Parallel Review

Review juga dapat dilakukan
secara paralel.

```text
             Review

          /          \

Legal          Editorial

          \          /

         Final Decision
```

Workflow menunggu seluruh Review selesai.

---

# 15. Timeout

Human Task dapat memiliki batas waktu.

```text
Waiting

↓

Timeout

↓

Escalation
```

Escalation mengikuti Workflow Policy.

---

# 16. Escalation

Jika Reviewer tidak merespons.

```text
Reviewer

↓

Timeout

↓

Manager

↓

Decision
```

Workflow tidak menentukan siapa Manager.

---

# 17. Memory Usage

Reviewer dapat membaca Context.

```text
Execution

↓

Memory Engine

↓

Context

↓

Reviewer
```

Reviewer juga dapat menambahkan komentar.

```text
Reviewer

↓

Memory Engine

↓

Review Notes
```

---

# 18. Event Flow

Human Task menghasilkan Event.

```text
HumanTaskAssigned

↓

HumanTaskOpened

↓

HumanDecisionSubmitted

↓

HumanTaskCompleted
```

Jika terjadi Timeout.

```text
HumanTaskTimedOut
```

---

# 19. Audit Trail

Audit mencatat:

- Assignment
- Reviewer
- Timestamp
- Decision
- Comment
- Revision
- Approval

Seluruh aktivitas dapat ditelusuri.

---

# 20. Security

Human Task mengikuti:

- Authentication
- Authorization
- Access Control
- Role Validation

Reviewer hanya dapat
mengakses Task yang diberikan.

---

# 21. Example Sequence

```text
Client

↓

Workflow

↓

Writer Agent

↓

Draft

↓

Human Review

↓

Approved

↓

Publisher Agent

↓

Completed
```

---

# 22. Example State

Workflow.

```text
Running

↓

Waiting Human

↓

Running

↓

Completed
```

Execution tetap aktif
selama menunggu keputusan.

---

# 23. Design Principles

Human-in-the-Loop mengikuti prinsip:

- Human merupakan Participant Workflow.
- Human bukan Engine.
- Human bukan Runtime.
- Workflow mengontrol seluruh proses.
- Human Task diperlakukan seperti Task lainnya.
- Seluruh keputusan dicatat sebagai Event dan Audit.
- Human tidak memanggil Agent secara langsung.

---

# 24. Comparison

| Aspect | AI Task | Human Task |
|---------|---------|------------|
| Executed by | Runtime | Human |
| Scheduled by Workflow | ✓ | ✓ |
| Uses Memory | ✓ | ✓ |
| Generates Events | ✓ | ✓ |
| Audit Trail | ✓ | ✓ |
| Can Retry | ✓ | ✓ |
| Requires Authentication | - | ✓ |
| Requires Authorization | - | ✓ |

---

# 25. Related Documents

- workflow-sample.md
- workflow-state.md
- execution-state.md
- memory-read.md
- memory-write.md
- event-flow.md
- MAS-400 Orchestrator
- MAS-600 Agent Architecture

---

# END