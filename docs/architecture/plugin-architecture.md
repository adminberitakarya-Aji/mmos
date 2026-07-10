# Plugin - Architecture

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang sebagai platform jangka panjang yang akan terus berkembang.

Seiring waktu akan muncul kebutuhan baru seperti:

- AI Provider baru
- Media Engine baru
- Storage Adapter baru
- Capability baru
- Workflow Action baru
- Integration Connector baru
- Authentication Provider baru
- Custom Business Module

Platform tidak boleh mengharuskan perubahan pada Core setiap kali fitur baru ditambahkan.

MMOS membutuhkan mekanisme ekstensi yang aman, terstruktur, dan terisolasi.

---

# Problem

Apabila seluruh fitur baru harus ditambahkan langsung ke Core Platform, maka akan terjadi:

- Core menjadi semakin besar (Monolithic Core)
- Tight Coupling
- Sulit melakukan upgrade
- Sulit menjaga backward compatibility
- Sulit melakukan maintenance
- Risiko bug meningkat
- Release menjadi semakin lambat

Platform harus dapat berkembang tanpa mengubah fondasi arsitektur.

---

# Decision

MMOS menetapkan bahwa seluruh fitur yang bersifat **opsional**, **provider-specific**, atau **domain-specific** harus diimplementasikan sebagai **Plugin**.

Core MMOS hanya menyediakan:

- Domain Model
- Runtime
- Orchestrator
- Workflow Engine
- Event System
- Plugin Runtime
- Contract

Seluruh implementasi tambahan berada di luar Core.

---

# Principle

Prinsip utama ADR ini adalah:

> **Extend the Platform, Never Modify the Core.**

Fitur baru ditambahkan.

Core tetap stabil.

---

# Architecture

```
MMOS Core

↓

Plugin Runtime

↓

Plugin

↓

Capability

↓

Provider
```

Plugin berinteraksi dengan Core melalui Contract.

Plugin tidak mengakses Core secara langsung.

---

# Plugin Responsibilities

Plugin bertanggung jawab terhadap:

- implementasi capability
- provider integration
- custom workflow action
- external connector
- storage adapter
- AI model adapter
- authentication adapter

Plugin tidak mengubah Domain Model.

---

# Core Responsibilities

Core bertanggung jawab terhadap:

- execution
- workflow
- orchestration
- contracts
- security
- lifecycle
- event system
- plugin loading

Core tidak mengetahui implementasi Plugin.

---

# Plugin Contract

Setiap Plugin wajib mendefinisikan:

- Plugin ID
- Name
- Version
- Author
- Description
- Required MMOS Version
- Dependencies
- Exposed Capabilities
- Configuration Schema

Plugin tanpa Contract tidak dapat dimuat.

---

# Plugin Lifecycle

```
Installed

↓

Validated

↓

Loaded

↓

Activated

↓

Running

↓

Disabled

↓

Unloaded
```

Lifecycle Plugin dikelola oleh Plugin Runtime.

---

# Plugin Discovery

Plugin ditemukan melalui Plugin Registry.

```
Plugin Directory

↓

Plugin Manifest

↓

Validation

↓

Registration

↓

Activation
```

Core tidak melakukan hardcode terhadap Plugin.

---

# Plugin Isolation

Plugin berjalan dalam boundary sendiri.

Plugin tidak boleh:

- mengakses internal state Core
- memodifikasi Domain Object
- mem-bypass Runtime
- memodifikasi Workflow Engine

Seluruh komunikasi dilakukan melalui Contract.

---

# Plugin Categories

Plugin dapat berupa:

### AI Provider

- OpenAI
- Anthropic
- Gemini
- DeepSeek

---

### Media Engine

- FFmpeg
- ImageMagick
- Stable Diffusion

---

### Storage Adapter

- PostgreSQL
- MongoDB
- Redis
- Qdrant
- Milvus

---

### Integration

- Slack
- Discord
- WhatsApp
- Telegram
- Microsoft Teams
- Email

---

### Authentication

- OAuth2
- OpenID Connect
- LDAP
- SAML

---

### Workflow Extension

- Custom Task
- Custom Validator
- Custom Trigger
- Custom Scheduler

---

# Version Compatibility

Plugin wajib mendeklarasikan kompatibilitas.

Contoh:

```
MMOS >=1.0

MMOS <2.0
```

Plugin Runtime melakukan validasi sebelum Plugin diaktifkan.

---

# Dependency Management

Plugin dapat bergantung pada Plugin lain.

Contoh:

```
Video Plugin

↓

FFmpeg Plugin
```

Circular dependency tidak diperbolehkan.

---

# Configuration

Seluruh konfigurasi Plugin berada di luar kode.

Contoh:

- API Key
- Endpoint
- Timeout
- Retry Policy

Plugin tidak boleh menggunakan hardcoded configuration.

---

# Security

Plugin memiliki permission terbatas.

Plugin hanya dapat mengakses:

- Capability yang didaftarkan
- API yang diizinkan
- Resource yang diberikan Runtime

Plugin tidak memiliki hak administratif terhadap Core.

---

# Failure Isolation

Apabila Plugin gagal:

```
Plugin Failure

↓

Disable Plugin

↓

Core Continues Running
```

Kegagalan Plugin tidak boleh menyebabkan Core berhenti.

---

# Observability

Plugin wajib menghasilkan:

- logs
- metrics
- events
- health status

Plugin mengikuti standar observability MMOS.

---

# Testing

Setiap Plugin harus dapat diuji secara independen.

Minimal mendukung:

- contract testing
- integration testing
- compatibility testing

Core tidak bergantung pada implementasi Plugin.

---

# Architectural Principles

1. Core bersifat minimal.
2. Ekstensi dilakukan melalui Plugin.
3. Plugin mengikuti Contract.
4. Plugin berjalan terisolasi.
5. Plugin dapat ditambah tanpa mengubah Core.
6. Plugin dapat dihapus tanpa memengaruhi Core.
7. Plugin memiliki lifecycle sendiri.
8. Plugin Runtime mengelola seluruh Plugin.

---

# Benefits

Dengan Plugin Architecture:

- Core tetap kecil.
- Upgrade lebih mudah.
- Provider baru mudah ditambahkan.
- Integrasi berkembang lebih cepat.
- Risiko perubahan lebih rendah.
- Vendor lock-in berkurang.
- Komunitas dapat membuat ekstensi sendiri.

---

# Consequences

Seluruh fitur baru harus dievaluasi:

Jika fitur bersifat umum dan fundamental, maka menjadi bagian dari Core.

Jika fitur bersifat opsional, provider-specific, atau domain-specific, maka harus diimplementasikan sebagai Plugin.

Perubahan pada Core hanya dilakukan apabila benar-benar memengaruhi arsitektur dasar MMOS.

---

# Alternatives Considered

## Monolithic Core

Ditolak.

Menghasilkan platform yang sulit dipelihara dan dikembangkan.

---

## Fork-Based Extension

Ditolak.

Setiap kustomisasi menghasilkan versi platform yang berbeda dan sulit di-upgrade.

---

## Direct Source Modification

Ditolak.

Merusak stabilitas Core dan menghilangkan kompatibilitas antarversi.

---

# Impact

ADR ini memengaruhi:

- MAS-300 Engine Architecture
- MAS-700 AI Runtime
- MAS-900 Developer Platform
- Plugin SDK
- Plugin Runtime
- Capability Registry
- Extension Registry
- CLI
- Developer Documentation

Seluruh implementasi ekstensi MMOS wajib menggunakan Plugin Contract dan Plugin Runtime.

---

# Related ADR

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

ADR-010 — Capability as Contract

ADR-017 — Deployment Agnostic

ADR-018 — API First

ADR-020 — Everything Observable

---

# Summary

MMOS menerapkan prinsip **Extensibility by Plugin**, yaitu seluruh fitur yang bersifat opsional, provider-specific, atau domain-specific dikembangkan sebagai **Plugin** yang berjalan di atas Plugin Runtime.

Core MMOS tetap kecil, stabil, dan independen, sedangkan kemampuan baru dapat ditambahkan, diperbarui, atau dihapus tanpa mengubah fondasi arsitektur. Pendekatan ini memastikan MMOS tetap modular, mudah diperluas, aman, dan berkelanjutan untuk evolusi jangka panjang.