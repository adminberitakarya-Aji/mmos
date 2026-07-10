# MMOS v1.0 — Capability Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan **Capability Diagram** MMOS.

Capability merupakan abstraksi terhadap seluruh kemampuan (capabilities)
yang digunakan oleh Workflow dan Execution untuk berinteraksi dengan
layanan di luar MMOS.

Capability menyediakan antarmuka yang konsisten sehingga Workflow,
Agent, dan Execution tidak bergantung pada implementasi provider
atau teknologi tertentu.

Capability **bukan Tool**, **bukan API**, dan **bukan Service**.
Capability adalah kontrak (contract) yang mendeskripsikan suatu
kemampuan bisnis atau teknis.

---

# 2. Objectives

Capability Diagram bertujuan untuk:

- Menjelaskan posisi Capability dalam MMOS
- Menjelaskan struktur internal Capability Engine
- Menjelaskan hubungan Capability dengan Execution
- Menjelaskan abstraction layer terhadap Provider
- Menjadi referensi implementasi Capability Engine

---

# 3. Capability Principles

Capability mengikuti prinsip:

- Contract Based
- Provider Agnostic
- Stateless
- Reusable
- Discoverable
- Observable
- Secure by Design

Capability mendefinisikan **apa** yang dapat dilakukan,
bukan **bagaimana** implementasinya.

---

# 4. Capability Position

Capability digunakan oleh Execution.

```text
Workflow
      │
      ▼
Task
      │
      ▼
Execution
      │
      ▼
Capability Engine
      │
      ▼
Capability
```

Execution menjadi satu-satunya pihak
yang menggunakan Capability.

---

# 5. High-Level Capability Model

```text
Execution
      │
      ▼
Capability Engine
      │
      ▼
Capability Registry
      │
      ▼
Capability
      │
      ▼
Provider Adapter
      │
      ▼
External Service
```

Capability Engine menjadi pusat seluruh
proses pemanggilan Capability.

---

# 6. Internal Structure

Capability terdiri dari:

```text
Capability

├── Identity
├── Name
├── Version
├── Category
├── Contract
├── Policy
├── Parameters
├── Provider Mapping
├── Metadata
└── Status
```

Capability tidak mengandung implementasi Provider.

---

# 7. Capability Engine Components

Secara logis Capability Engine terdiri dari:

```text
Capability Engine

├── Capability Registry
├── Capability Resolver
├── Provider Resolver
├── Provider Adapter
├── Policy Manager
├── Secret Manager
├── Retry Manager
└── Capability State Manager
```

Komponen ini telah dijelaskan pada
`component-diagram.md`.

---

# 8. Capability Registry

Seluruh Capability didaftarkan
ke Registry.

```text
Capability Registry

├── Search
├── OCR
├── Email
├── Storage
├── CMS
├── Payment
└── Custom Capability
```

Registry menjadi sumber kebenaran
mengenai Capability yang tersedia.

---

# 9. Capability Resolution

Execution meminta suatu Capability.

```text
Execution

↓

Capability Resolver

↓

Capability Contract

↓

Provider Resolver
```

Resolver menentukan implementasi yang tepat.

---

# 10. Provider Abstraction

Capability tidak mengetahui implementasi Provider.

```text
Capability

↓

Provider Adapter

├── REST API
├── GraphQL
├── gRPC
├── SDK
├── CLI
└── Plugin
```

Provider dapat diganti tanpa
mengubah Workflow.

---

# 11. External Service Relationship

Provider Adapter berkomunikasi
dengan layanan eksternal.

```text
Capability

↓

Provider Adapter

↓

External Service
```

Contoh layanan:

- Search Engine
- OCR Service
- Email Gateway
- Object Storage
- CMS
- Payment Gateway

---

# 12. Capability Invocation

Alur dasar pemanggilan.

```text
Execution

↓

Capability Engine

↓

Capability

↓

Provider Adapter

↓

External Service

↓

Response

↓

Execution
```

Execution menerima hasil melalui
Capability Engine.

---

# 13. Runtime Relationship

Capability tidak memanggil Runtime.

```text
Execution

├── Runtime
└── Capability
```

Keduanya merupakan layanan independen.

---

# 14. Memory Relationship

Capability tidak mengakses Memory.

```text
Execution

↓

Memory

↓

Execution

↓

Capability
```

Execution menyediakan data
yang dibutuhkan Capability.

---

# 15. Event Relationship

Capability menghasilkan Event.

```text
Capability Invoked

↓

Provider Selected

↓

Capability Completed
```

Jika gagal.

```text
Capability Failed
```

Seluruh Event dipublikasikan
melalui Event Engine.

---

# 16. Capability Lifecycle

```text
Registered

↓

Resolved

↓

Invoked

↓

Completed
```

Kemungkinan akhir lainnya:

```text
Failed

Timed Out

Disabled
```

Detail lifecycle dijelaskan pada
`capability-state.md`.

---

# 17. Security

Capability menerapkan:

- Authentication
- Authorization
- Secret Management
- API Credential Isolation
- Access Policy

Credential tidak diketahui
oleh Workflow maupun Agent.

---

# 18. Monitoring

Capability menghasilkan:

- Invocation Count
- Latency
- Success Rate
- Failure Rate
- Retry Count
- Provider Usage
- Error Metrics

Monitoring dilakukan
secara independen.

---

# 19. Dependency Rules

Capability dapat bergantung pada:

- Capability Registry
- Provider Adapter
- Secret Manager
- Policy Manager

Capability tidak boleh bergantung pada:

- Workflow
- Runtime
- Memory Store
- AI Provider
- Event Store

Execution menjadi penghubung
antara Capability dan Engine lain.

---

# 20. Scalability

Capability Engine dapat
diperbanyak.

```text
Execution

↓

Capability Engine

 ┌────┼────┐
 ▼    ▼    ▼
C1   C2   C3
```

Seluruh Worker menggunakan
Registry dan Policy yang sama.

---

# 21. Design Principles

Capability mengikuti prinsip:

- Capability adalah kontrak kemampuan.
- Capability tidak mengetahui Provider.
- Capability tidak mengetahui Workflow.
- Capability tidak mengetahui Runtime.
- Capability dapat memiliki banyak implementasi.
- Capability dapat digunakan kembali oleh banyak Workflow.
- Capability menghasilkan Event dan Metrics.

---

# 22. Relationship with Other Diagrams

```text
Execution Diagram
        │
        ▼
Capability Diagram
        │
        ▼
Provider Adapter
        │
        ▼
External Service
```

Capability menjadi lapisan abstraksi
antara Execution dan layanan eksternal.

---

# 23. Related Documents

- execution-diagram.md
- runtime-diagram.md
- capability-call.md
- capability-state.md
- capability-catalog.md
- component-diagram.md
- engine-overview.md
- MAS-300 Engine Architecture

---

# END