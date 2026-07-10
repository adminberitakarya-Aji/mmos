# MMOS v1.0 — Example: Tool Calling

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini memberikan contoh bagaimana **Capability (Tool)** digunakan
oleh Agent di dalam MMOS.

Pada MMOS, Agent **tidak pernah memanggil Tool secara langsung**.

Seluruh akses terhadap Tool dilakukan melalui **Capability Engine**.

Dokumen ini menjelaskan alur konseptual tersebut.

---

# 2. What is a Tool?

Tool adalah layanan eksternal yang dapat digunakan Agent untuk
menyelesaikan suatu pekerjaan.

Contoh:

- Web Search
- Database Query
- Calculator
- Email Service
- CMS
- Image Generator
- OCR
- Translation Service
- Weather API

Dalam MMOS, Tool direpresentasikan sebagai **Capability**.

---

# 3. Architecture Principle

Hubungan antar komponen.

```text
Agent

↓

Execution

↓

Capability Engine

↓

Capability

↓

External Service
```

Agent tidak mengetahui lokasi maupun implementasi Tool.

---

# 4. Example Scenario

User meminta:

```text
Cari berita terbaru mengenai AI
dan buat ringkasannya.
```

Workflow membutuhkan:

1. Search
2. Runtime
3. Summary

---

# 5. Workflow

```text
Receive Request

↓

Search News

↓

Generate Summary

↓

Return Result
```

Task pertama membutuhkan Capability.

Task kedua membutuhkan Runtime.

---

# 6. Capability Flow

```text
Execution

↓

Capability Engine

↓

Search Capability

↓

Search Provider

↓

Search Result
```

Execution menerima hasil tanpa mengetahui implementasi Search Provider.

---

# 7. Runtime Flow

Setelah Search selesai.

```text
Execution

↓

Runtime Engine

↓

LLM

↓

Summary
```

Runtime tidak mengetahui bagaimana Search dilakukan.

---

# 8. Object Relationship

```text
Workflow

↓

Task

↓

Execution

↓

Capability

↓

Result
```

Capability merupakan bagian dari Execution.

---

# 9. Capability Definition

Contoh Capability.

```text
Capability

Name:
Web Search

Input:
Query

Output:
Documents

Policy:
Read Only
```

Capability memiliki kontrak yang jelas.

---

# 10. Provider Abstraction

Capability tidak bergantung pada Provider tertentu.

```text
Search Capability

↓

Provider A

atau

Provider B

atau

Provider C
```

Pergantian Provider tidak mengubah Workflow.

---

# 11. Multiple Capabilities

Satu Workflow dapat menggunakan beberapa Capability.

```text
Workflow

↓

Search

↓

Translation

↓

Image Generation

↓

CMS
```

Semua Capability dipanggil melalui Capability Engine.

---

# 12. Capability Policy

Setiap Capability dapat memiliki Policy.

Contoh:

```text
Retry

Timeout

Authentication

Authorization

Rate Limit

Caching
```

Policy diterapkan oleh Capability Engine.

---

# 13. Error Handling

Jika Capability gagal.

```text
Capability

↓

Failed

↓

Retry

↓

Completed
```

Retry mengikuti Capability Policy.

---

# 14. Provider Failover

Jika Provider tidak tersedia.

```text
Capability

↓

Provider A

↓

Unavailable

↓

Provider B
```

Execution tetap menggunakan Capability yang sama.

---

# 15. Capability Result

Contoh hasil.

Input:

```text
AI Regulation Indonesia
```

Output:

```text
Document List

News

Metadata

References
```

Format ditentukan oleh kontrak Capability.

---

# 16. Event Flow

Capability menghasilkan Event.

```text
CapabilityRequested

↓

CapabilityStarted

↓

CapabilityCompleted
```

Jika gagal.

```text
CapabilityFailed
```

---

# 17. Memory Integration

Hasil Capability dapat disimpan.

```text
Capability

↓

Execution

↓

Memory Engine

↓

Workspace Context
```

Task berikutnya dapat menggunakan hasil tersebut.

---

# 18. Security

Capability Engine bertanggung jawab terhadap:

- Authentication
- Authorization
- Secret Management
- Credential Handling
- API Key
- Access Policy

Agent tidak memiliki akses langsung ke kredensial.

---

# 19. Monitoring

Capability menghasilkan:

- Metrics
- Logs
- Events
- Audit Trail

Contoh Metrics:

- Response Time
- Error Rate
- Retry Count
- Success Rate

---

# 20. Design Principles

Tool Calling pada MMOS mengikuti prinsip:

- Agent tidak memanggil Tool secara langsung.
- Capability menjadi abstraksi terhadap layanan eksternal.
- Capability Engine mengelola seluruh komunikasi.
- Provider dapat diganti tanpa mengubah Workflow.
- Execution tetap independen terhadap implementasi Tool.
- Seluruh aktivitas dapat dimonitor dan diaudit.

---

# 21. Comparison

| Aspect | Runtime | Capability |
|---------|---------|------------|
| AI Model | ✓ | - |
| External Service | - | ✓ |
| Provider Abstraction | ✓ | ✓ |
| Retry Policy | ✓ | ✓ |
| Authentication | - | ✓ |
| Secret Handling | - | ✓ |
| Event Generation | ✓ | ✓ |

---

# 22. Related Documents

- capability-call.md
- runtime-call.md
- capability-state.md
- runtime-state.md
- capability-catalog.md
- engine-overview.md
- MAS-300 Engine Architecture
- MAS-700 AI Runtime

---

# END