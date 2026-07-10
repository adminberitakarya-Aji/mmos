# ADR-017 — Deployment Agnostic

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang sebagai platform AI orchestration yang dapat digunakan pada berbagai skala organisasi, mulai dari:

- Developer Laptop
- Single Server
- On-Premise Cluster
- Private Cloud
- Public Cloud
- Hybrid Cloud
- Multi Cloud
- Edge Environment

Setiap organisasi memiliki kebutuhan deployment yang berbeda, baik dari sisi infrastruktur, keamanan, regulasi, maupun biaya operasional.

Agar MMOS dapat diadopsi secara luas, arsitektur tidak boleh bergantung pada platform deployment tertentu.

---

# Problem

Apabila arsitektur bergantung pada satu platform deployment tertentu, maka akan muncul berbagai masalah:

- vendor lock-in
- sulit berpindah cloud
- deployment menjadi mahal
- tidak dapat digunakan secara on-premise
- sulit melakukan disaster recovery
- sulit melakukan hybrid deployment
- testing menjadi tidak konsisten

Sebagai contoh:

Workflow tidak boleh mengetahui apakah Runtime berjalan di Kubernetes, Docker Compose, atau Serverless.

---

# Decision

MMOS menetapkan prinsip **Deployment Agnostic**.

Seluruh Domain Model, Workflow, Runtime, Engine, dan Capability tidak boleh memiliki ketergantungan terhadap platform deployment tertentu.

Deployment merupakan tanggung jawab Infrastructure Layer.

---

# Principle

Prinsip utama ADR ini adalah:

> **Build Once, Deploy Anywhere.**

Business Model tetap sama.

Environment dapat berubah.

---

# Architecture

```
Domain

↓

Runtime

↓

Infrastructure Adapter

↓

Deployment Platform
```

Domain tidak mengetahui lokasi maupun cara sistem dijalankan.

---

# Supported Deployment

MMOS harus dapat dijalankan pada:

### Development

- Local Machine
- Docker Compose

### Server

- Linux Server
- Windows Server

### Container

- Docker
- Podman

### Orchestration

- Kubernetes
- OpenShift
- Nomad

### Cloud

- AWS
- Azure
- Google Cloud
- Alibaba Cloud
- Tencent Cloud
- OCI

### Serverless

- Cloud Run
- Azure Functions
- AWS Lambda (untuk workload tertentu)

### Edge

- Edge Node
- Private Appliance

---

# Deployment Independence

Workflow tidak boleh mengetahui:

- hostname
- IP Address
- Kubernetes Namespace
- Docker Container
- Cloud Provider
- Region
- Availability Zone

Semua informasi tersebut berada pada Infrastructure Layer.

---

# Runtime Independence

Runtime hanya mengetahui:

- Execution
- Workflow
- Capability
- Memory
- Event

Runtime tidak mengetahui platform deployment.

---

# Infrastructure Layer

Infrastructure bertanggung jawab terhadap:

- networking
- scheduling
- container orchestration
- auto scaling
- service discovery
- configuration
- secret management
- deployment topology

Business logic tidak berada pada layer ini.

---

# Configuration

Seluruh konfigurasi deployment harus berada di luar kode aplikasi.

Contoh:

- Environment Variable
- Configuration File
- Secret Manager
- Configuration Service

Tidak diperbolehkan melakukan hardcode terhadap:

- endpoint
- hostname
- region
- credential
- deployment path

---

# Service Discovery

Komunikasi antar komponen menggunakan Service Contract.

Implementasi service discovery dapat berupa:

- DNS
- Service Mesh
- Kubernetes Service
- Consul
- Eureka

Domain tidak mengetahui mekanismenya.

---

# Scalability

Deployment harus mendukung:

- Horizontal Scaling
- Vertical Scaling
- Auto Scaling

Karena Runtime bersifat stateless (ADR-009), seluruh Runtime dapat diperbanyak tanpa mengubah Domain Model.

---

# High Availability

Deployment harus memungkinkan:

```
Load Balancer

↓

Runtime A

Runtime B

Runtime C
```

Apabila satu Runtime gagal, Runtime lain dapat melanjutkan pekerjaan berdasarkan Execution State yang tersimpan.

---

# Disaster Recovery

Deployment harus mendukung:

- backup
- restore
- failover
- cross-region deployment

Strategi disaster recovery merupakan tanggung jawab Infrastructure.

---

# Security

Keamanan deployment meliputi:

- TLS
- Secret Management
- Network Policy
- Firewall
- Identity Provider
- Certificate Management

Domain Model tidak mengetahui implementasi keamanan tersebut.

---

# Observability

Deployment harus menyediakan:

- logging
- metrics
- tracing
- health check
- readiness check
- liveness check

Observability tidak memengaruhi Business Logic.

---

# CI/CD

MMOS harus dapat diintegrasikan dengan pipeline CI/CD apa pun.

Contoh:

- GitHub Actions
- GitLab CI
- Jenkins
- Azure DevOps
- CircleCI
- ArgoCD
- FluxCD

Pipeline deployment tidak menjadi bagian dari Domain Architecture.

---

# Architectural Principles

1. Domain tidak mengetahui deployment.
2. Workflow bebas dari platform.
3. Runtime bebas dari platform.
4. Deployment merupakan tanggung jawab Infrastructure.
5. Konfigurasi berada di luar aplikasi.
6. Deployment dapat dipindahkan tanpa mengubah Domain.
7. Multi-cloud didukung.
8. On-premise dan cloud memiliki model yang sama.

---

# Benefits

Dengan Deployment Agnostic:

- vendor lock-in dihindari,
- deployment lebih fleksibel,
- migrasi cloud lebih mudah,
- biaya operasional lebih terkendali,
- adopsi enterprise lebih luas,
- disaster recovery lebih baik,
- pengembangan dan operasional menjadi lebih sederhana.

---

# Consequences

Seluruh implementasi MMOS harus memisahkan:

- Domain
- Runtime
- Infrastructure
- Deployment

Business logic tidak boleh mengandung informasi mengenai platform deployment.

---

# Alternatives Considered

## Kubernetes-Only Architecture

Ditolak.

Membatasi adopsi MMOS pada organisasi yang menggunakan Kubernetes.

---

## Cloud-Specific Architecture

Ditolak.

Menghasilkan vendor lock-in dan menyulitkan migrasi.

---

## On-Premise-Only Architecture

Ditolak.

Tidak mendukung kebutuhan cloud-native dan hybrid deployment.

---

# Impact

ADR ini memengaruhi:

- MAS-700 AI Runtime
- MAS-800 Platform
- MAS-900 Developer Platform
- Deployment Reference Architecture
- Infrastructure Adapter
- Configuration System
- Service Discovery
- DevOps Guide
- CLI
- Installation Package

Seluruh implementasi MMOS wajib memisahkan Domain Architecture dari mekanisme deployment dan infrastruktur.

---

# Related ADR

ADR-009 — Runtime is Stateless

ADR-016 — Storage Agnostic

ADR-018 — API First

ADR-019 — Extensibility by Plugin

---

# Summary

MMOS menerapkan prinsip **Deployment Agnostic**, yaitu seluruh Business Logic, Workflow, Runtime, dan Domain Model tidak bergantung pada platform deployment tertentu.

Dengan memisahkan Domain dari Infrastructure, MMOS dapat dijalankan pada berbagai lingkungan seperti local development, on-premise, Kubernetes, public cloud, hybrid cloud, maupun edge environment tanpa perubahan pada model arsitektur. Prinsip ini memastikan fleksibilitas, portabilitas, dan keberlanjutan platform dalam jangka panjang.