# Validator Architecture

**Version:** MMOS v1.0  
**Component:** Developer Tools  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan arsitektur Validator pada MMOS.

Validator merupakan komponen pengembang (developer tool) yang bertugas memverifikasi bahwa seluruh object MMOS memenuhi spesifikasi domain sebelum digunakan oleh Runtime.

Validator **bukan** bagian dari runtime dan **tidak** menjalankan workflow.

---

# Design Goals

Validator dirancang dengan tujuan berikut.

- Memvalidasi seluruh object MMOS.
- Memastikan konsistensi Rich Domain Schema.
- Memberikan umpan balik yang cepat kepada developer.
- Mendukung otomatisasi pada CI/CD.
- Mudah diperluas dengan validator tambahan.
- Tidak bergantung pada provider tertentu.

---

# High-Level Architecture

```
MMOS Objects

        │

        ▼

Object Loader

        │

        ▼

Schema Validator

        │

        ▼

Reference Validator

        │

        ▼

Relationship Validator

        │

        ▼

Rule Validator

        │

        ▼

Validation Report
```

Validator bekerja secara berurutan sehingga setiap tahap memvalidasi aspek yang berbeda dari object MMOS.

---

# Architecture Components

## Object Loader

Object Loader bertanggung jawab membaca object yang akan divalidasi.

Input dapat berasal dari:

- JSON
- YAML
- Rich Domain Schema
- Repository MMOS

Output:

```
Object Model
```

---

## Schema Validator

Schema Validator memeriksa kesesuaian object terhadap Rich Domain Schema.

Validasi meliputi:

- required fields;
- data type;
- enum;
- format;
- constraints.

Contoh:

```
Composition

↓

composition.schema.json
```

---

## Reference Validator

Reference Validator memastikan seluruh referensi object valid.

Contoh:

```
Workflow

↓

Composition
```

```
Task

↓

Workflow
```

```
Capability

↓

Engine
```

Referensi yang hilang menghasilkan error.

---

## Relationship Validator

Relationship Validator memeriksa hubungan antar object.

Contoh:

```
Project

└── Composition

      └── Workflow

            └── Task
```

Validator memastikan hubungan tersebut sesuai dengan Object Model MMOS.

---

## Rule Validator

Rule Validator memeriksa kepatuhan terhadap aturan arsitektur.

Contoh:

- Workflow dimiliki Composition.
- Task dimiliki Workflow.
- Event bersifat immutable.
- Capability digunakan sebagai kontrak.
- Orchestrator tidak memiliki business logic.

Rule berasal dari ADR, MAS, IMS, dan Rich Domain Schema.

---

## Validation Report

Tahap terakhir menghasilkan laporan validasi.

Contoh:

```
PASS

WARNING

FAILED
```

Laporan juga dapat berisi:

- jumlah object;
- jumlah error;
- jumlah warning;
- lokasi error;
- ringkasan validasi.

---

# Validation Flow

```
Load Objects

↓

Validate Schema

↓

Validate References

↓

Validate Relationships

↓

Validate Rules

↓

Generate Report
```

Apabila ditemukan kesalahan fatal, validator dapat menghentikan proses pada tahap yang sesuai.

---

# Validation Layers

Validator terdiri dari beberapa lapisan.

```
Input Layer

↓

Schema Layer

↓

Reference Layer

↓

Relationship Layer

↓

Rule Layer

↓

Report Layer
```

Setiap lapisan memiliki tanggung jawab tunggal.

---

# Error Classification

Validator mengelompokkan hasil validasi menjadi beberapa tingkat.

## Error

Kesalahan yang menyebabkan object tidak valid.

Contoh:

- field wajib tidak tersedia;
- referensi object tidak ditemukan;
- relasi tidak sesuai.

---

## Warning

Kondisi yang masih dapat diproses tetapi perlu diperhatikan.

Contoh:

- deskripsi kosong;
- metadata tidak lengkap;
- field opsional belum diisi.

---

## Information

Informasi tambahan yang tidak memengaruhi validasi.

Contoh:

- jumlah object;
- durasi validasi;
- statistik repository.

---

# Extensibility

Validator dirancang modular sehingga setiap validator dapat ditambahkan tanpa mengubah komponen lain.

Contoh:

```
Schema Validator

↓

Security Validator

↓

Naming Validator

↓

Organization Validator

↓

Custom Validator
```

Setiap validator bekerja secara independen.

---

# Integration

Validator dapat diintegrasikan dengan:

- CLI MMOS;
- Generator;
- IDE Plugin;
- CI/CD Pipeline;
- Git Hook;
- Build Process.

Validator menjadi langkah awal sebelum object digunakan oleh Runtime.

---

# Design Principles

Validator mengikuti prinsip berikut.

## Read Only

Tidak mengubah object yang diperiksa.

---

## Stateless

Tidak menyimpan state antar proses validasi.

---

## Deterministic

Input yang sama selalu menghasilkan output yang sama.

---

## Modular

Setiap validator memiliki tanggung jawab tunggal.

---

## Extensible

Validator baru dapat ditambahkan tanpa mengubah arsitektur utama.

---

## Provider Agnostic

Validator tidak bergantung pada AI provider, database, storage, maupun runtime tertentu.

---

# Related Documents

- `tools/validator/README.md`
- `tools/validator/rules.md`
- `tools/validator/examples.md`
- `specs/schemas/`
- `docs/architecture/`
- `docs/catalog/`
- `docs/adr/`