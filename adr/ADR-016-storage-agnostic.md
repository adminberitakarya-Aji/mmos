# ADR-016 — Storage Agnostic

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS mengelola berbagai jenis data dengan karakteristik yang sangat berbeda, antara lain:

- Project
- Composition
- Workflow
- Execution
- Artifact
- Memory
- Event
- Knowledge
- Logs
- Metrics

Tidak ada satu teknologi penyimpanan (storage) yang optimal untuk seluruh jenis data tersebut.

Contohnya:

- Relational Database untuk transactional data.
- Object Storage untuk Artifact.
- Vector Database untuk Memory.
- Event Store untuk Event.
- Search Index untuk pencarian.

MMOS harus mampu memanfaatkan teknologi storage yang paling sesuai tanpa mengubah Domain Model.

---

# Problem

Apabila Domain Object bergantung langsung pada teknologi storage tertentu, maka akan muncul berbagai masalah:

- vendor lock-in
- sulit melakukan migrasi
- sulit mengganti database
- testing menjadi kompleks
- deployment menjadi tidak fleksibel
- performa tidak optimal untuk berbagai jenis data

Sebagai contoh:

Workflow tidak boleh mengetahui apakah data disimpan di PostgreSQL, MongoDB, atau DynamoDB.

---

# Decision

MMOS menetapkan prinsip **Storage Agnostic**.

Seluruh Domain Object, Workflow, Runtime, dan Engine tidak boleh bergantung pada implementasi storage tertentu.

Storage merupakan detail implementasi.

Domain hanya bergantung pada Repository Contract.

---

# Principle

Prinsip utama ADR ini adalah:

> **Business Knows Data, Infrastructure Knows Storage.**

Domain mengetahui data.

Infrastructure menentukan tempat penyimpanan.

---

# Architecture

```
Domain Object

↓

Repository Contract

↓

Storage Adapter

↓

Physical Storage
```

Domain tidak pernah berkomunikasi langsung dengan database.

---

# Storage Layer

MMOS membagi storage menjadi beberapa lapisan.

## Domain Layer

Berisi:

- Project
- Composition
- Workflow
- Execution
- Artifact
- Event

Layer ini tidak mengetahui storage.

---

## Repository Layer

Berisi kontrak penyimpanan.

Contoh:

```
CompositionRepository

ExecutionRepository

ArtifactRepository

MemoryRepository
```

Repository hanya mendefinisikan operasi.

---

## Storage Adapter

Storage Adapter mengimplementasikan Repository.

Contoh:

```
PostgreSQL Adapter

MySQL Adapter

MongoDB Adapter

Redis Adapter

S3 Adapter

MinIO Adapter

Milvus Adapter

Qdrant Adapter
```

---

## Physical Storage

Implementasi aktual.

Contoh:

- PostgreSQL
- MySQL
- MariaDB
- MongoDB
- DynamoDB
- Redis
- S3
- MinIO
- Azure Blob
- Google Cloud Storage
- Milvus
- Weaviate
- Qdrant
- Elasticsearch

---

# Repository Contract

Repository mendefinisikan operasi standar.

Contoh:

```
Create

Read

Update

Delete

List

Search
```

Implementasi storage bebas menentukan cara operasinya.

---

# Storage Responsibilities

Storage bertanggung jawab terhadap:

- persistence
- indexing
- backup
- replication
- partitioning
- compression
- encryption
- retention

Storage tidak menjalankan business logic.

---

# Domain Responsibilities

Domain bertanggung jawab terhadap:

- validation
- business rules
- ownership
- lifecycle
- relationship

Domain tidak mengetahui:

- SQL
- NoSQL
- Object Storage
- Vector Database

---

# Multi Storage Strategy

MMOS mendukung penggunaan beberapa storage sekaligus.

Contoh:

```
Project

↓

PostgreSQL

Execution

↓

PostgreSQL

Artifact

↓

S3

Memory

↓

Vector Database

Event

↓

Event Store

Logs

↓

OpenSearch
```

Seluruh storage bekerja di balik Repository Contract.

---

# Data Migration

Karena Domain tidak bergantung pada storage:

```
PostgreSQL

↓

Migration

↓

CockroachDB
```

atau

```
MinIO

↓

Migration

↓

Amazon S3
```

tidak memerlukan perubahan pada Domain Model.

---

# Backup and Recovery

Strategi backup merupakan tanggung jawab Storage Layer.

Contoh:

- snapshot
- incremental backup
- point-in-time recovery
- cross-region replication

Workflow dan Domain tidak mengetahui strategi tersebut.

---

# Scalability

Setiap storage dapat diskalakan secara independen.

Contoh:

```
Artifact Storage

↓

Scale Out
```

tanpa memengaruhi:

- Workflow
- Runtime
- Composition
- Execution

---

# Security

Storage bertanggung jawab terhadap:

- encryption at rest
- encryption in transit
- access control
- retention policy
- backup policy

Permission bisnis tetap berada pada Domain Model.

---

# Testing

Repository Contract memungkinkan:

- in-memory repository
- mock repository
- fake repository

untuk keperluan unit testing.

Testing tidak bergantung pada database aktual.

---

# Architectural Principles

1. Domain tidak mengetahui storage.
2. Repository menjadi kontrak penyimpanan.
3. Storage merupakan implementasi.
4. Storage dapat diganti tanpa mengubah Domain.
5. Multi-storage didukung.
6. Repository mudah diuji.
7. Storage bertanggung jawab terhadap persistence.
8. Business logic tidak berada pada storage.

---

# Benefits

Dengan Storage Agnostic:

- vendor lock-in dihindari,
- migrasi storage lebih mudah,
- performa dapat dioptimalkan,
- testing lebih sederhana,
- deployment lebih fleksibel,
- multi-cloud lebih mudah,
- evolusi teknologi storage tidak memengaruhi Domain.

---

# Consequences

Seluruh akses data dalam MMOS harus melalui Repository Contract.

Komponen berikut tidak boleh mengakses storage secara langsung:

- Workflow
- Composition
- Execution
- Agent
- Runtime
- Orchestrator

Semua akses dilakukan melalui Repository atau Service Contract yang sesuai.

---

# Alternatives Considered

## Direct Database Access

Ditolak.

Menghasilkan coupling tinggi terhadap teknologi storage tertentu.

---

## Single Database for Everything

Ditolak.

Setiap jenis data memiliki karakteristik dan kebutuhan penyimpanan yang berbeda.

---

## Storage-Specific Domain Model

Ditolak.

Domain harus tetap independen dari teknologi infrastruktur.

---

# Impact

ADR ini memengaruhi:

- MAS-800 Platform
- MAS-900 Developer Platform
- IMS-900 Service Contract
- Repository Contract
- Storage Adapter
- JSON Schema
- Validator
- Generator
- CLI

Seluruh implementasi MMOS wajib memisahkan Domain Model dari teknologi storage yang digunakan.

---

# Related ADR

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

ADR-006 — Contract First

ADR-009 — Runtime is Stateless

ADR-015 — Human in the Loop

ADR-017 — Deployment Agnostic

---

# Summary

MMOS menerapkan prinsip **Storage Agnostic**, yaitu Domain Model hanya bergantung pada **Repository Contract**, sedangkan implementasi penyimpanan berada pada **Storage Adapter**.

Pendekatan ini memungkinkan MMOS menggunakan berbagai teknologi penyimpanan secara bersamaan, mengganti storage tanpa mengubah Domain Model, serta mengoptimalkan performa, skalabilitas, dan fleksibilitas deployment tanpa mengorbankan konsistensi arsitektur.