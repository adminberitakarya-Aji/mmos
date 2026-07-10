# MMOS v1.0 — Single Node Deployment

Version: 1.0

Status: REFERENCE

---

# 1. Purpose

Dokumen ini menjelaskan deployment MMOS pada lingkungan **Single Node**.

Model ini menempatkan seluruh komponen MMOS pada satu mesin fisik atau
virtual tanpa mengubah arsitektur logis MMOS.

Single Node Deployment merupakan konfigurasi paling sederhana yang tetap
mempertahankan seluruh konsep Engine Separation.

Dokumen ini tidak bergantung pada Docker, Kubernetes, maupun Platform
Cloud tertentu.

---

# 2. Objectives

Single Node Deployment ditujukan untuk:

- Development
- Local Testing
- Internal Application
- Small Team
- Proof of Concept (PoC)
- Demonstration
- Functional Validation

Deployment ini **bukan** ditujukan untuk High Availability.

---

# 3. Deployment Characteristics

Karakteristik utama:

- Satu Server
- Satu Operating System
- Satu Network Domain
- Seluruh Engine berjalan secara lokal
- Infrastruktur minimal
- Konfigurasi sederhana

---

# 4. Logical Architecture

```text
                    Client
                       │
                API Gateway
                       │
                Orchestrator
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
Workflow Engine   Execution Engine   Runtime Engine
     │                 │                 │
Capability Engine   Memory Engine    Event Engine
     │
Monitoring Engine
     │
Audit Engine
```

Seluruh Engine berada pada satu mesin namun tetap merupakan komponen yang
terpisah secara logis.

---

# 5. Physical Architecture

```text
+------------------------------------------------+
|                Single Server                   |
|                                                |
|  API Gateway                                  |
|  Orchestrator                                 |
|  Workflow Engine                              |
|  Execution Engine                             |
|  Runtime Engine                               |
|  Capability Engine                            |
|  Memory Engine                                |
|  Event Engine                                 |
|  Monitoring Engine                            |
|  Audit Engine                                 |
|                                                |
|  Database                                     |
|  Object Storage                               |
|  Event Storage                                |
|                                                |
+------------------------------------------------+
```

---

# 6. Process Model

Implementasi dapat menggunakan:

- Multiple Processes
- Multiple Services
- Multiple Containers
- Single Binary dengan Engine Modular

Pilihan implementasi tidak mengubah Architecture MMOS.

---

# 7. Storage Layout

Single Node dapat menggunakan Storage lokal.

Contoh:

```text
Storage

├── Metadata
├── Memory
├── Event
├── Audit
├── Configuration
└── Logs
```

Seluruh Storage berada pada mesin yang sama.

---

# 8. Communication Model

Komunikasi antar Engine dapat menggunakan:

- In-Process Call
- Local IPC
- Local HTTP
- Local gRPC
- Internal Event Bus

Karena seluruh Engine berada pada satu Host, latensi komunikasi relatif rendah.

---

# 9. Runtime Flow

```text
Client

↓

API Gateway

↓

Orchestrator

↓

Workflow Engine

↓

Execution Engine

↓

Runtime Engine

↓

AI Provider
```

Jika Task membutuhkan layanan eksternal:

```text
Execution Engine

↓

Capability Engine

↓

External Service
```

---

# 10. Memory Flow

```text
Execution Engine

↓

Memory Engine

↓

Local Storage

↓

Memory Response
```

Memory Engine tetap menjadi satu-satunya komponen yang mengakses Memory Storage.

---

# 11. Event Flow

```text
Execution Engine

↓

Event Engine

↓

Subscriber

↓

Monitoring

↓

Audit
```

Walaupun berada pada satu mesin, komunikasi tetap menggunakan Event Engine.

---

# 12. Security Model

Single Node mendukung:

- Authentication
- Authorization
- TLS (opsional)
- Secret Management
- API Key
- Access Control

Implementasi keamanan tetap mengikuti Platform Policy.

---

# 13. Resource Sharing

Seluruh Engine berbagi:

- CPU
- Memory
- Storage
- Network

Perencanaan kapasitas perlu memperhatikan beban masing-masing Engine.

---

# 14. Failure Characteristics

Kegagalan satu Engine tidak selalu menghentikan Engine lain.

Contoh:

```text
Capability Engine

↓

Failure
```

Workflow Engine masih dapat:

- membaca Memory
- menerima Request
- menjalankan Workflow yang tidak memerlukan Capability tersebut

Namun jika Server gagal, seluruh sistem ikut berhenti.

---

# 15. Scalability

Single Node hanya mendukung:

- Vertical Scaling

Contoh:

- CPU lebih banyak
- RAM lebih besar
- Storage lebih cepat
- GPU lebih kuat

Horizontal Scaling tidak tersedia pada model ini.

---

# 16. Monitoring

Monitoring minimal meliputi:

- CPU Usage
- Memory Usage
- Disk Usage
- Engine Health
- Queue Length
- Response Time
- Error Rate

Monitoring dapat dijalankan pada server yang sama.

---

# 17. Backup Strategy

Data yang perlu dicadangkan:

- Metadata
- Memory
- Audit
- Event
- Configuration

Backup dilakukan secara berkala sesuai kebijakan Platform.

---

# 18. Advantages

Keunggulan Single Node Deployment:

- Mudah dipasang
- Biaya rendah
- Latensi rendah
- Administrasi sederhana
- Cocok untuk pengembangan
- Debugging lebih mudah

---

# 19. Limitations

Keterbatasan:

- Tidak High Availability
- Single Point of Failure
- Horizontal Scaling tidak tersedia
- Kapasitas bergantung pada satu mesin
- Tidak cocok untuk beban enterprise yang tinggi

---

# 20. Recommended Use Cases

Single Node direkomendasikan untuk:

- Pengembangan lokal
- Continuous Integration
- QA Environment
- Internal Automation
- Proof of Concept
- Pelatihan
- Demonstrasi

---

# 21. Migration Path

Single Node dapat ditingkatkan menjadi Cluster Deployment tanpa mengubah:

- Workflow
- Execution
- Runtime
- Capability
- Memory
- Event Model

Perubahan hanya terjadi pada lapisan infrastruktur.

---

# 22. Relationship with Other Deployment Models

```text
Local Development

        ↓

Single Node

        ↓

Cluster Mode

        ↓

High Availability

        ↓

Multi Region
```

Single Node menjadi langkah awal menuju deployment yang lebih besar.

---

# 23. Reference Documents

Dokumen ini berkaitan dengan:

- deployment-overview.md
- cluster-mode.md
- high-availability.md
- multi-region.md
- engine-overview.md

---

# 24. Design Principles

Single Node Deployment mengikuti prinsip:

- Simple by Default
- Modular Architecture
- Engine Isolation
- Infrastructure Independence
- Stateless First
- Easy Migration
- Operational Simplicity

---

# END