# ADR-018 — API First

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS terdiri dari berbagai komponen yang harus dapat diakses oleh berbagai jenis client, antara lain:

- Web Application
- Mobile Application
- Desktop Application
- CLI
- SDK
- AI Agent
- External System
- Third-party Integration

Selain itu, MMOS juga harus memungkinkan integrasi dengan sistem lain tanpa memerlukan akses langsung ke internal implementation.

Agar seluruh komponen dapat berkembang secara independen, diperlukan kontrak komunikasi yang stabil dan terdokumentasi.

---

# Problem

Apabila komunikasi dilakukan langsung melalui library internal atau akses database, maka akan muncul berbagai masalah:

- tight coupling
- sulit melakukan versioning
- sulit melakukan integrasi
- tidak ada kontrak yang jelas
- perubahan implementation memengaruhi client
- testing menjadi sulit
- dokumentasi tidak konsisten

MMOS membutuhkan antarmuka publik yang menjadi kontrak resmi bagi seluruh consumer.

---

# Decision

MMOS mengadopsi prinsip **API First**.

Seluruh kemampuan yang dapat digunakan dari luar boundary suatu komponen harus diekspos melalui API Contract yang terdokumentasi.

Business Logic dikembangkan berdasarkan API Contract, bukan sebaliknya.

---

# Principle

Prinsip utama ADR ini adalah:

> **Design the Contract Before the Implementation.**

API adalah kontrak.

Implementasi mengikuti kontrak.

---

# Architecture

```
Client

↓

API Contract

↓

Application Service

↓

Domain

↓

Repository
```

Client tidak pernah mengakses Domain secara langsung.

---

# API Responsibilities

API bertanggung jawab terhadap:

- request validation
- authentication
- authorization
- serialization
- response formatting
- version negotiation
- error mapping

API tidak menjalankan business logic.

---

# Domain Responsibilities

Domain bertanggung jawab terhadap:

- business rules
- validation
- object lifecycle
- consistency
- orchestration

Domain tidak mengetahui HTTP, REST, atau GraphQL.

---

# API Contract

Setiap API minimal mendefinisikan:

- endpoint
- request schema
- response schema
- authentication
- authorization
- error model
- version
- documentation

Kontrak harus tersedia sebelum implementasi dimulai.

---

# API Styles

MMOS mendukung berbagai gaya API sesuai kebutuhan.

Contoh:

### REST API

```
POST /compositions

GET /projects/{id}

PATCH /workflow/{id}
```

---

### GraphQL

Untuk kebutuhan query kompleks.

---

### gRPC

Untuk komunikasi internal berperforma tinggi.

---

### WebSocket

Untuk event real-time.

---

### Event API

Untuk komunikasi asynchronous berbasis Event.

---

# API Versioning

Seluruh Public API wajib memiliki versi.

Contoh:

```
/api/v1/projects

/api/v2/projects
```

Perubahan breaking harus menghasilkan versi baru.

Perubahan non-breaking tidak memerlukan versi baru.

---

# Request Validation

Seluruh request harus divalidasi sebelum mencapai Domain.

Validasi meliputi:

- schema
- required field
- type
- format
- permission
- business precondition

Request yang tidak valid ditolak di API Layer.

---

# Response Model

Response harus bersifat konsisten.

Minimal memuat:

```
status

data

metadata

error
```

Response tidak mengekspos struktur internal Domain.

---

# Error Handling

API harus menggunakan model error yang konsisten.

Contoh:

```
400 Validation Error

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Error
```

Error internal tidak boleh membocorkan detail implementasi.

---

# Documentation

Seluruh API harus memiliki dokumentasi yang dapat dihasilkan secara otomatis.

Minimal mencakup:

- endpoint
- parameter
- request
- response
- authentication
- example
- error code

Dokumentasi merupakan bagian dari kontrak.

---

# Authentication

API tidak menentukan metode autentikasi tertentu.

Implementasi dapat menggunakan:

- OAuth2
- OpenID Connect
- JWT
- API Key
- Session Token

Domain tetap independen dari mekanisme autentikasi.

---

# Authorization

Authorization dilakukan berdasarkan:

- Project
- Role
- Permission

API memvalidasi akses sebelum memanggil Application Service.

---

# API Independence

Workflow tidak mengetahui:

- URL
- HTTP Method
- JSON
- GraphQL
- gRPC

Workflow hanya menggunakan Service Contract.

---

# SDK Generation

Karena API bersifat contract-first, SDK dapat dihasilkan secara otomatis.

Contoh:

- TypeScript SDK
- Go SDK
- Java SDK
- Python SDK
- .NET SDK

SDK mengikuti API Contract.

---

# Testing

API Contract memungkinkan:

- contract testing
- integration testing
- mock server
- client generation
- schema validation

Implementasi dapat berubah tanpa memengaruhi consumer selama kontrak tetap sama.

---

# Architectural Principles

1. API adalah kontrak.
2. Implementasi mengikuti API.
3. Domain tidak mengetahui protokol komunikasi.
4. API memiliki versi.
5. API terdokumentasi.
6. Request divalidasi sebelum Domain.
7. Response bersifat konsisten.
8. API dapat menghasilkan SDK.

---

# Benefits

Dengan API First:

- integrasi lebih mudah,
- dokumentasi selalu tersedia,
- client dapat dikembangkan lebih awal,
- testing lebih sederhana,
- evolusi API lebih terkontrol,
- coupling berkurang,
- interoperabilitas meningkat.

---

# Consequences

Seluruh layanan publik MMOS wajib memiliki API Contract sebelum implementasi dimulai.

Tidak diperbolehkan membuat endpoint tanpa:

- schema
- dokumentasi
- version
- authentication policy

API Contract menjadi sumber kebenaran bagi seluruh consumer.

---

# Alternatives Considered

## Code First

Ditolak.

Kontrak menjadi mengikuti implementasi sehingga dokumentasi dan client sering tertinggal.

---

## Database Sharing

Ditolak.

Client tidak boleh mengakses database secara langsung.

---

## Internal Library Integration

Ditolak.

Menghasilkan tight coupling dan menyulitkan versioning.

---

# Impact

ADR ini memengaruhi:

- MAS-800 Platform
- MAS-900 Developer Platform
- API Specification
- OpenAPI Schema
- GraphQL Schema
- SDK Generator
- CLI
- Developer Documentation
- Integration Guide

Seluruh Public API MMOS wajib mengikuti pendekatan API First.

---

# Related ADR

ADR-006 — Contract First

ADR-014 — Event-Driven Architecture

ADR-017 — Deployment Agnostic

ADR-019 — Extensibility by Plugin

ADR-020 — Everything Observable

---

# Summary

MMOS mengadopsi prinsip **API First**, yaitu seluruh antarmuka publik dirancang sebagai **kontrak resmi** sebelum implementasi dilakukan.

API menjadi batas komunikasi antara client dan platform, menyediakan kontrak yang terdokumentasi, terversi, dan konsisten. Dengan pendekatan ini, MMOS memperoleh interoperabilitas yang tinggi, integrasi yang lebih mudah, SDK yang dapat dihasilkan secara otomatis, serta evolusi platform yang tetap terkontrol tanpa merusak kompatibilitas dengan consumer.