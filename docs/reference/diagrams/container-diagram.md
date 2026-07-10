# MMOS v1.0 — Container Diagram

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan **Container Diagram** MMOS.

Container Diagram menunjukkan bagaimana sistem MMOS dipecah menjadi
beberapa **logical containers (Engine)** beserta hubungan di antaranya.

Dokumen ini merupakan **Level-2 Architecture** dan berada satu tingkat di
bawah **System Context Diagram**.

Pada MMOS, istilah **Container** mengacu pada **logical application
container**, **bukan Docker Container**.

---

# 2. Objectives

Container Diagram bertujuan untuk:

- Memisahkan tanggung jawab setiap Engine
- Menunjukkan hubungan antar Engine
- Menjelaskan aliran komunikasi
- Menjadi dasar Deployment
- Menjadi dasar Scalability

---

# 3. Architecture Principles

Container Diagram mengikuti prinsip:

- Separation of Concerns
- Single Responsibility
- Independent Scaling
- Stateless First
- Provider Agnostic
- Event Driven
- API First

---

# 4. Logical Container View

```text
                    +----------------------+
                    |      API Gateway     |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |     Orchestrator     |
                    +----------+-----------+
                               |
      -----------------------------------------------------
      |         |           |          |          |        |
      v         v           v          v          v        v
+-----------+ +-----------+ +---------+ +--------+ +---------+ +---------+
| Workflow  | |Execution  | |Runtime  | |Memory  | |Capability| | Event   |
|  Engine   | |  Engine   | | Engine  | | Engine | |  Engine  | | Engine  |
+-----------+ +-----------+ +---------+ +--------+ +---------+ +---------+
```

Setiap Engine merupakan Container logis yang memiliki tanggung jawab
sendiri.

---

# 5. API Gateway

Tanggung jawab:

- Entry Point
- Authentication
- Authorization
- Routing
- Request Validation
- API Versioning

API Gateway tidak menjalankan Workflow.

---

# 6. Orchestrator

Orchestrator bertanggung jawab terhadap:

- Coordination
- Scheduling
- Dispatching
- Lifecycle Coordination

Orchestrator **tidak menjalankan pekerjaan**.

Prinsip ini mengikuti ADR-003.

---

# 7. Workflow Engine

Workflow Engine bertanggung jawab untuk:

- Workflow Definition
- Workflow Validation
- Workflow Scheduling
- Workflow State

Workflow tidak menjalankan AI.

---

# 8. Execution Engine

Execution Engine bertanggung jawab terhadap:

- Execution Lifecycle
- Task Scheduling
- Retry
- Timeout
- Error Handling

Execution merupakan unit kerja utama.

---

# 9. Runtime Engine

Runtime Engine bertanggung jawab terhadap:

- AI Provider Selection
- Prompt Delivery
- Model Invocation
- Response Collection
- Runtime Policy

Runtime tidak mengetahui Workflow.

---

# 10. Capability Engine

Capability Engine bertanggung jawab terhadap:

- Tool Invocation
- External Service
- Authentication
- Secret Management
- Provider Selection

Capability menjadi abstraction layer
untuk seluruh layanan eksternal.

---

# 11. Memory Engine

Memory Engine bertanggung jawab terhadap:

- Context Loading
- Context Saving
- Memory Version
- Memory Policy
- Knowledge Access

Memory menjadi satu-satunya akses ke Context.

---

# 12. Event Engine

Event Engine bertanggung jawab terhadap:

- Event Publication
- Event Distribution
- Event Persistence
- Subscription
- Replay

Event Engine tidak mengubah Workflow.

---

# 13. Communication Model

Komunikasi antar Engine.

```text
API Gateway

↓

Orchestrator

↓

Workflow

↓

Execution

↓

Runtime

↓

Execution

↓

Workflow

↓

Gateway
```

Komunikasi tambahan.

```text
Execution

↓

Memory

↓

Execution
```

```text
Execution

↓

Capability

↓

Execution
```

```text
Execution

↓

Event
```

---

# 14. Dependency Rules

Dependency yang diperbolehkan.

```text
Gateway

↓

Orchestrator

↓

Workflow

↓

Execution
```

Execution dapat menggunakan:

- Runtime
- Memory
- Capability
- Event

Runtime tidak memanggil Capability.

Capability tidak memanggil Runtime.

Memory tidak memanggil Workflow.

Event tidak memanggil Engine lain.

---

# 15. Container Independence

Setiap Engine harus dapat:

- dikembangkan sendiri
- diuji sendiri
- dijalankan sendiri
- diskalakan sendiri
- dimonitor sendiri

Selama kontraknya dipenuhi.

---

# 16. Scaling

Container dapat diperbanyak.

```text
Execution Engine

↓

Replica-1

Replica-2

Replica-3
```

Engine lain tidak perlu ikut diperbanyak.

---

# 17. Failure Isolation

Jika Runtime gagal.

```text
Runtime

↓

Failure
```

Workflow, Memory, dan Event tetap berjalan.

Gangguan dibatasi pada Engine terkait.

---

# 18. Deployment Relationship

Container Diagram menjadi dasar untuk:

- Docker Deployment
- Kubernetes Deployment
- Cluster Mode
- High Availability
- Multi Region

Deployment tidak mengubah hubungan antar Engine.

---

# 19. Observability

Setiap Container menghasilkan:

- Metrics
- Logs
- Events
- Audit Data
- Health Check

Monitoring dilakukan secara independen.

---

# 20. Security

Setiap Container menerapkan:

- Authentication
- Authorization
- Encryption
- Secret Isolation
- Access Policy

Keamanan diterapkan pada setiap batas komunikasi.

---

# 21. Design Principles

Container Diagram mengikuti prinsip:

- Engine Separation
- Independent Lifecycle
- Independent Scaling
- Contract-Based Communication
- Provider Agnostic
- Stateless First
- Infrastructure Agnostic

---

# 22. Related Documents

- system-context.md
- component-diagram.md
- engine-overview.md
- deployment-overview.md
- docker-reference.md
- kubernetes-reference.md

---

# END