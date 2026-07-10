# ADR-002 — Project is Root Aggregate

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS memungkinkan pengguna mengelola banyak pekerjaan AI, workflow, multimedia, dan automation secara bersamaan.

Sebuah organisasi atau pengguna dapat memiliki:

- banyak artikel
- banyak video
- banyak campaign
- banyak workflow
- banyak agent
- banyak asset

Seluruh pekerjaan tersebut harus dikelompokkan dalam satu boundary bisnis yang jelas.

Pada tahap desain muncul beberapa kandidat sebagai root aggregate:

- Workspace
- Organization
- Folder
- Composition
- Project

MMOS membutuhkan satu object yang menjadi root ownership seluruh pekerjaan.

---

# Problem

Composition merupakan pusat operasional (lihat ADR-001), namun Composition tidak cukup untuk:

- mengelola banyak pekerjaan sekaligus,
- mengatur akses pengguna,
- mengelola resource bersama,
- mengelompokkan pekerjaan berdasarkan tujuan bisnis,
- mengatur billing dan quota.

Diperlukan object yang berada satu tingkat di atas Composition.

---

# Decision

Project ditetapkan sebagai Root Aggregate dalam MMOS.

Project menjadi boundary kepemilikan (ownership boundary) seluruh objek bisnis.

Semua Composition harus berada di dalam tepat satu Project.

Tidak ada Composition yang berdiri sendiri.

---

# Why Project

Project merepresentasikan satu unit pekerjaan bisnis.

Contoh:

- Portal Berita
- Campaign Ramadan
- Produk Baru
- Company Profile
- YouTube Channel
- Social Media Brand
- Mobile Application
- Dokumentasi Internal

Setiap Project dapat memiliki banyak Composition yang saling berkaitan.

---

# Responsibilities

Project bertanggung jawab terhadap:

- ownership
- members
- roles
- permissions
- billing
- quota
- storage allocation
- environment
- configuration
- integrations
- lifecycle

Project **tidak** bertanggung jawab menjalankan workflow atau execution.

Project hanya menjadi boundary organisasi.

---

# Ownership Model

Project memiliki:

- Composition
- Asset
- Knowledge Base
- Environment
- Secret
- API Key
- Integration
- Member
- Role
- Policy

Composition kemudian memiliki:

- Workflow
- Execution
- Memory
- Artifact
- Event

Ownership bersifat hierarkis.

---

# Relationship

```
Organization (optional)

└── Project

    ├── Composition

    │     ├── Workflow

    │     ├── Execution

    │     ├── Artifact

    │     ├── Memory

    │     └── Event

    │
    ├── Asset
    ├── Secret
    ├── Environment
    ├── Integration
    └── Members
```

Project menjadi parent seluruh Composition.

Composition tidak boleh berpindah ownership tanpa proses transfer.

---

# Lifecycle

Lifecycle Project:

Created

↓

Configured

↓

Active

↓

Suspended

↓

Archived

↓

Deleted

Menghapus Project berarti seluruh Composition berada dalam proses penghapusan sesuai retention policy.

---

# Architectural Principles

1. Semua Composition harus dimiliki Project.

2. Project menjadi batas ownership.

3. Permission diwariskan dari Project.

4. Billing dihitung pada level Project.

5. Storage dialokasikan pada level Project.

6. Integrasi dikonfigurasi pada level Project.

7. Project dapat memiliki banyak Composition.

8. Composition hanya memiliki satu Project.

---

# Multi-Tenant Support

Project menjadi boundary utama untuk arsitektur multi-tenant.

Setiap Project memiliki:

- storage terpisah
- memory terpisah
- execution terpisah
- configuration terpisah
- quota terpisah
- billing terpisah

Hal ini memastikan isolasi antar tenant.

---

# Security

Seluruh akses dimulai dari Project.

Model akses:

```
User

↓

Project Membership

↓

Role

↓

Permission

↓

Composition

↓

Workflow

↓

Execution
```

Permission tidak diberikan langsung ke Workflow atau Execution.

Permission selalu melalui Project.

---

# Benefits

Dengan Project sebagai Root Aggregate:

- ownership menjadi jelas
- multi-tenant lebih sederhana
- billing lebih mudah
- audit lebih baik
- permission konsisten
- resource isolation lebih kuat
- deployment lebih fleksibel

---

# Consequences

Seluruh object utama harus memiliki referensi Project.

Contoh:

Composition

```
projectId
```

Asset

```
projectId
```

Secret

```
projectId
```

Environment

```
projectId
```

Knowledge Base

```
projectId
```

Hal ini memastikan semua resource berada dalam satu boundary kepemilikan.

---

# Alternatives Considered

## Composition sebagai Root Aggregate

Ditolak.

Composition adalah pusat operasional, bukan boundary organisasi.

---

## Workspace sebagai Root Aggregate

Ditolak.

Workspace terlalu bergantung pada implementasi platform dan tidak memiliki makna domain yang kuat.

---

## Folder sebagai Root Aggregate

Ditolak.

Folder hanya struktur visual dan tidak memiliki tanggung jawab bisnis.

---

## Organization sebagai Root Aggregate

Ditolak.

Organization bersifat opsional.

MMOS harus tetap dapat berjalan untuk pengguna individu (single user).

Organization dapat ditambahkan sebagai lapisan di atas Project tanpa mengubah model domain.

---

# Impact

ADR ini memengaruhi:

- Object Model
- Permission Model
- Security Model
- Billing
- Storage
- Multi-Tenant Architecture
- JSON Schema
- Validator
- Generator
- CLI

Semua implementasi MMOS wajib menjadikan Project sebagai root aggregate untuk seluruh resource bisnis.

---

# Related ADR

ADR-001 — Composition is the Heart

ADR-003 — Orchestrator Never Works

ADR-004 — Engine Separation

ADR-005 — Provider Agnostic

---

# Summary

Project adalah batas kepemilikan (ownership boundary) dalam MMOS.

Project mengelola pengguna, resource, konfigurasi, keamanan, billing, dan lifecycle organisasi.

Di dalam setiap Project terdapat satu atau lebih Composition yang menjadi pusat operasional.

Dengan pemisahan ini:

- **Project** mengelola *siapa* yang memiliki dan mengatur pekerjaan.
- **Composition** mengelola *apa* yang sedang dikerjakan.
- **Workflow** mendefinisikan *bagaimana* pekerjaan dilakukan.
- **Execution** menjalankan *proses* pekerjaan.

Model ini menghasilkan domain yang bersih, mudah diskalakan, dan konsisten untuk implementasi MMOS.