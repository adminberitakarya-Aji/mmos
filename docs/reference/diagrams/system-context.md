# MMOS v1.0 — System Context Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan **System Context** MMOS.

System Context menunjukkan posisi MMOS terhadap aktor eksternal,
platform eksternal, AI Provider, dan sistem lain.

Diagram ini merupakan level tertinggi (Level-1 Architecture)
dan tidak menjelaskan implementasi internal MMOS.

---

# 2. Objectives

System Context bertujuan untuk:

- Menentukan batas (System Boundary)
- Mengidentifikasi External Actors
- Mengidentifikasi External Systems
- Menunjukkan arah komunikasi
- Menjelaskan posisi MMOS dalam ekosistem

---

# 3. System Boundary

```text
+------------------------------------------------------+
|                                                      |
|                     MMOS Platform                    |
|                                                      |
|  API Gateway                                         |
|  Orchestrator                                        |
|  Workflow Engine                                     |
|  Execution Engine                                    |
|  Runtime Engine                                      |
|  Capability Engine                                   |
|  Memory Engine                                       |
|  Event Engine                                        |
|                                                      |
+------------------------------------------------------+
```

Seluruh komponen di atas berada di dalam batas MMOS.

---

# 4. External Actors

MMOS berinteraksi dengan berbagai aktor.

```text
User

Administrator

Developer

Operator

Automation System
```

Aktor tersebut tidak menjadi bagian dari MMOS.

---

# 5. External Systems

MMOS dapat berinteraksi dengan:

```text
AI Providers

Business Applications

Identity Provider

Storage Services

Monitoring Platform

Notification Services

External APIs
```

Seluruh sistem tersebut berada di luar batas MMOS.

---

# 6. High-Level Context

```text
                    +----------------+
                    |     User       |
                    +----------------+
                           |
                           |
                           v
                 +----------------------+
                 |      MMOS            |
                 |----------------------|
                 | API Gateway          |
                 | Orchestrator         |
                 | Workflow             |
                 | Execution            |
                 | Runtime              |
                 | Capability           |
                 | Memory               |
                 | Event                |
                 +----------------------+
                    |     |      |
        ------------      |      ------------
        |                 |                 |
        v                 v                 v
+---------------+  +---------------+  +----------------+
| AI Providers  |  | External APIs |  | Identity/Auth  |
+---------------+  +---------------+  +----------------+
        |
        v
+----------------+
| Storage System |
+----------------+
```

---

# 7. AI Provider Relationship

MMOS tidak bergantung pada satu Provider.

```text
Runtime Engine

↓

AI Provider Interface

↓

OpenAI

Anthropic

Google

Azure

Local Model

Provider Lain
```

Provider dapat diganti tanpa mengubah Workflow.

---

# 8. Capability Relationship

Capability menghubungkan MMOS
dengan layanan eksternal.

```text
Capability Engine

↓

Capability

↓

CMS

Search

OCR

Payment

Email

Storage

REST API
```

Capability menjadi abstraction layer.

---

# 9. Identity Relationship

Autentikasi dilakukan oleh sistem identitas.

```text
User

↓

Identity Provider

↓

MMOS
```

MMOS tidak mengharuskan implementasi Identity tertentu.

---

# 10. Storage Relationship

Storage berada di luar Engine.

```text
Memory Engine

↓

Storage

------------------

Event Engine

↓

Storage

------------------

Audit

↓

Storage
```

Engine tidak menyimpan State permanen.

---

# 11. Monitoring Relationship

Monitoring bersifat eksternal.

```text
MMOS

↓

Metrics

↓

Monitoring Platform
```

Monitoring tidak memengaruhi Workflow.

---

# 12. Event Relationship

Event dapat dikirim ke sistem lain.

```text
Event Engine

↓

Subscribers

↓

Business System
```

Subscriber tidak mengubah Workflow.

---

# 13. Developer Interaction

Developer menggunakan MMOS melalui:

```text
SDK

CLI

REST API

gRPC

Portal
```

Media akses bergantung implementasi Platform.

---

# 14. Administrator Interaction

Administrator mengelola:

- Configuration
- Policy
- Runtime
- Capability
- Monitoring
- Security

Administrator tidak menjalankan Workflow.

---

# 15. Security Boundary

Boundary keamanan meliputi:

```text
Authentication

Authorization

Encryption

Audit

Secret Management
```

Seluruh komunikasi eksternal melewati kontrol keamanan.

---

# 16. Communication Model

Komunikasi dilakukan melalui:

```text
Synchronous

Asynchronous

Event Driven
```

Pemilihan model mengikuti kebutuhan proses.

---

# 17. System Responsibility

MMOS bertanggung jawab terhadap:

- Workflow Orchestration
- Agent Coordination
- Runtime Management
- Capability Management
- Memory Management
- Event Management

MMOS tidak bertanggung jawab terhadap implementasi sistem eksternal.

---

# 18. External Responsibility

Sistem eksternal bertanggung jawab terhadap:

- AI Processing
- Authentication
- Search
- Payment
- Email
- Storage
- Notification

MMOS hanya menggunakan layanan tersebut melalui kontrak yang telah ditentukan.

---

# 19. Design Principles

System Context mengikuti prinsip:

- Clear System Boundary
- Loose Coupling
- Provider Agnostic
- Externalized Services
- Engine Separation
- Contract-Based Integration

---

# 20. Related Documents

- engine-overview.md
- runtime-overview.md
- deployment-overview.md
- object-relationship.md
- capability-call.md
- runtime-call.md

---

# END