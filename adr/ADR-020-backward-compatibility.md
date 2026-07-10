# ADR-020 — Backward Compatibility

Status: Accepted

Version: 1.0

Date: July 2026

Authors: MMOS Architecture Team

---

# Context

MMOS dirancang sebagai platform jangka panjang yang akan terus berkembang melalui penambahan:

- Capability
- Workflow
- Engine
- Provider
- API
- Plugin
- Object
- Event
- Memory Strategy

Perubahan tersebut tidak boleh merusak Project, Composition, Workflow, maupun Execution yang telah dibuat pada versi sebelumnya.

MMOS harus memiliki strategi evolusi yang memungkinkan platform berkembang tanpa memaksa seluruh pengguna melakukan migrasi secara bersamaan.

---

# Problem

Perubahan yang tidak memperhatikan kompatibilitas akan menyebabkan:

- Workflow lama tidak dapat dijalankan
- Composition lama gagal diproses
- API client rusak
- Plugin tidak dapat dimuat
- Event tidak dapat diproses
- Upgrade menjadi berisiko tinggi
- Pengguna enggan melakukan pembaruan

Platform enterprise harus mampu berevolusi secara bertahap.

---

# Decision

MMOS menetapkan bahwa **Backward Compatibility merupakan prinsip utama dalam evolusi platform**.

Setiap perubahan harus mempertimbangkan kompatibilitas terhadap versi sebelumnya.

Perubahan yang bersifat breaking hanya diperbolehkan melalui mekanisme versioning yang jelas.

---

# Principle

Prinsip utama ADR ini adalah:

> **Evolve Without Breaking Existing Systems.**

Versi baru harus tetap menghormati kontrak yang telah dipublikasikan.

---

# Compatibility Scope

Backward Compatibility berlaku untuk:

- Domain Object
- Workflow Schema
- Composition Schema
- Capability Contract
- API Contract
- Event Schema
- Plugin Contract
- Repository Contract
- Configuration Schema

Seluruh kontrak publik termasuk dalam cakupan kompatibilitas.

---

# Versioning Policy

MMOS menggunakan Semantic Versioning.

```
MAJOR.MINOR.PATCH
```

Contoh:

```
1.0.0

↓

1.1.0

↓

1.2.0

↓

2.0.0
```

---

## PATCH

Digunakan untuk:

- bug fix
- performance improvement
- internal optimization

Tidak boleh mengubah kontrak publik.

---

## MINOR

Digunakan untuk:

- capability baru
- API baru
- optional field baru
- plugin baru
- event baru

Perubahan harus tetap kompatibel.

---

## MAJOR

Digunakan untuk perubahan yang:

- menghapus kontrak
- mengubah schema secara breaking
- mengubah behavior publik
- menghapus feature

Seluruh breaking change hanya diperbolehkan pada Major Version.

---

# API Compatibility

API tidak boleh:

- menghapus endpoint
- mengubah response wajib
- mengubah field wajib
- mengubah arti parameter

Perubahan dilakukan dengan:

- endpoint baru
- API version baru
- optional field

---

# Workflow Compatibility

Workflow lama harus tetap dapat dijalankan.

Contoh:

```
Workflow v1

↓

Runtime v2

↓

Execution Success
```

Runtime baru wajib memahami Workflow versi sebelumnya selama masih berada dalam lifecycle dukungan.

---

# Capability Compatibility

Capability Contract tidak boleh berubah secara breaking.

Contoh:

```
GenerateImage v1
```

Jika diperlukan perubahan besar:

```
GenerateImage v2
```

Workflow lama tetap menggunakan versi sebelumnya hingga dimigrasikan.

---

# Event Compatibility

Event tidak boleh menghapus field yang telah dipublikasikan.

Penambahan field baru diperbolehkan apabila bersifat opsional.

Breaking change memerlukan Event Version baru.

---

# Plugin Compatibility

Plugin harus mendeklarasikan:

```
Supported MMOS Version
```

Plugin Runtime melakukan validasi kompatibilitas sebelum Plugin diaktifkan.

Plugin yang tidak kompatibel tidak dimuat.

---

# Schema Evolution

Schema dapat berkembang melalui:

- optional field
- metadata baru
- extension point

Schema tidak boleh mengubah arti field yang sudah ada.

---

# Deprecation Policy

Feature tidak langsung dihapus.

Tahapan yang wajib diikuti:

```
Supported

↓

Deprecated

↓

Migration Guide

↓

Major Release

↓

Removed
```

Pengguna harus memiliki waktu yang cukup untuk melakukan migrasi.

---

# Migration

Setiap breaking change wajib memiliki:

- migration guide
- compatibility note
- upgrade instruction
- version mapping

Migrasi harus terdokumentasi.

---

# Runtime Compatibility

Runtime baru harus mampu menjalankan:

- Workflow lama
- Execution lama
- Event lama
- Capability lama

selama masih berada dalam rentang versi yang didukung.

---

# Testing

Setiap rilis wajib melakukan:

- backward compatibility testing
- contract testing
- schema validation
- regression testing

Kompatibilitas menjadi bagian dari proses release.

---

# Documentation

Setiap perubahan harus mencantumkan:

- breaking changes
- deprecated features
- migration steps
- compatibility matrix

Dokumentasi merupakan bagian dari strategi kompatibilitas.

---

# Architectural Principles

1. Kontrak publik tidak berubah secara sembarangan.
2. Breaking change hanya pada Major Version.
3. Feature dihapus melalui proses deprecation.
4. Schema berkembang secara kompatibel.
5. Runtime mendukung versi sebelumnya.
6. Migration selalu terdokumentasi.
7. Compatibility diuji pada setiap rilis.
8. Evolusi platform tidak mengorbankan pengguna lama.

---

# Benefits

Dengan Backward Compatibility:

- upgrade lebih aman,
- adopsi lebih cepat,
- risiko produksi berkurang,
- integrasi tetap stabil,
- plugin tetap dapat digunakan,
- Workflow lama tetap berjalan,
- biaya migrasi lebih rendah.

---

# Consequences

Seluruh perubahan pada kontrak publik harus melalui evaluasi kompatibilitas.

Tidak diperbolehkan melakukan breaking change tanpa:

- version baru,
- migration guide,
- release note,
- compatibility review.

Backward Compatibility menjadi salah satu kriteria wajib sebelum suatu perubahan dapat dirilis.

---

# Alternatives Considered

## Breaking Changes by Default

Ditolak.

Menghasilkan upgrade yang mahal, berisiko, dan mengurangi kepercayaan pengguna terhadap platform.

---

## No Versioning

Ditolak.

Menyulitkan evolusi platform dan menyebabkan kontrak publik tidak dapat dikelola.

---

## Fork for Every Major Change

Ditolak.

Menghasilkan fragmentasi platform dan meningkatkan biaya pemeliharaan.

---

# Impact

ADR ini memengaruhi:

- CHANGELOG
- Release Policy
- Versioning Policy
- API Specification
- Workflow Schema
- Capability Catalog
- Event Catalog
- Plugin Runtime
- Migration Guide
- Developer Documentation

Seluruh evolusi MMOS wajib mengikuti kebijakan kompatibilitas yang ditetapkan dalam ADR ini.

---

# Related ADR

ADR-006 — Contract First

ADR-010 — Capability as Contract

ADR-012 — Event is Immutable

ADR-018 — API First

ADR-019 — Composition Owns Workflow

---

# Summary

MMOS menetapkan **Backward Compatibility** sebagai prinsip utama dalam evolusi platform. Setiap perubahan terhadap kontrak publik harus mempertahankan kompatibilitas dengan versi sebelumnya atau menggunakan mekanisme versioning yang jelas apabila perubahan bersifat breaking.

Keputusan ini memastikan bahwa Workflow, Composition, API, Capability, Event, dan Plugin dapat terus digunakan lintas versi, sehingga platform dapat berkembang secara berkelanjutan tanpa mengganggu sistem yang telah berjalan.