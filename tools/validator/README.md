# MMOS Validator

**Version:** MMOS v1.0  
**Status:** Stable

---

# Purpose

Validator merupakan komponen yang bertanggung jawab untuk memastikan seluruh objek MMOS memenuhi spesifikasi domain sebelum diproses oleh Runtime maupun Engine.

Validator merupakan alat pengembang (developer tool) dan bukan bagian dari business runtime.

Validator tidak mengubah data. Validator hanya melakukan pemeriksaan terhadap struktur, relasi, dan konsistensi objek.

---

# Objectives

Validator bertujuan untuk:

- Memvalidasi seluruh object MMOS.
- Memastikan kesesuaian dengan Rich Domain Schema.
- Memastikan konsistensi antar object.
- Mengurangi kesalahan sebelum eksekusi.
- Menjadi bagian dari proses CI/CD.
- Mendukung pengembangan plugin dan ekstensi.

---

# Scope

Validator digunakan untuk memeriksa seluruh spesifikasi MMOS.

Contohnya:

- Composition
- Workflow
- Task
- Agent
- Execution
- Runtime
- Capability
- Memory
- Artifact
- Event

Validator tidak melakukan eksekusi workflow maupun business logic.

---

# Repository Structure

```text
tools/
└── validator/
    ├── README.md
    ├── architecture.md
    ├── rules.md
    └── examples.md
```

---

# Responsibilities

Validator bertanggung jawab untuk:

- membaca object MMOS;
- memvalidasi struktur object;
- memvalidasi schema;
- memvalidasi relasi antar object;
- memvalidasi referensi object;
- memvalidasi dependency;
- menghasilkan laporan validasi.

Validator tidak:

- menjalankan workflow;
- memanggil AI provider;
- mengakses Memory Runtime;
- mengubah object yang divalidasi.

---

# Validation Targets

Validator dapat memeriksa:

```
Composition

Workflow

Task

Agent

Execution

Runtime

Capability

Memory

Artifact

Event
```

---

# Validation Types

## Schema Validation

Memastikan object sesuai dengan Rich Domain Schema.

Contoh:

- field wajib tersedia;
- tipe data benar;
- format nilai valid;
- enumerasi sesuai spesifikasi.

---

## Reference Validation

Memastikan seluruh referensi object valid.

Contoh:

- Workflow dimiliki Composition.
- Task dimiliki Workflow.
- Capability tersedia.
- Agent tersedia.

---

## Relationship Validation

Memastikan hubungan antar object konsisten.

Contoh:

```
Project

↓

Composition

↓

Workflow

↓

Task
```

Tidak boleh terdapat relasi yang melanggar model domain.

---

## Dependency Validation

Memastikan dependency dapat dipenuhi.

Contoh:

```
Task

↓

Capability

↓

Engine
```

Capability harus memiliki implementasi Engine yang sesuai.

---

## Rule Validation

Memastikan seluruh Architecture Decision Record (ADR) dipatuhi.

Contoh:

- Composition sebagai pusat eksekusi.
- Workflow bersifat declarative.
- Orchestrator tidak menjalankan pekerjaan.
- Capability sebagai kontrak.
- Event bersifat immutable.

---

# Validation Output

Validator menghasilkan laporan seperti:

```
Validation Summary

Objects Checked

Passed

Warnings

Errors

Validation Time
```

Status akhir:

```
PASS

WARNING

FAILED
```

---

# Integration

Validator dapat digunakan pada:

- local development;
- CI/CD pipeline;
- pre-commit hook;
- build process;
- release validation.

---

# Design Principles

Validator mengikuti prinsip berikut.

## Read Only

Validator tidak mengubah object.

---

## Deterministic

Input yang sama menghasilkan hasil validasi yang sama.

---

## Provider Agnostic

Validator tidak bergantung pada provider AI maupun vendor tertentu.

---

## Schema First

Seluruh validasi mengacu pada Rich Domain Schema.

---

## Fast Feedback

Kesalahan dilaporkan sedini mungkin agar mudah diperbaiki.

---

# Related Documents

Validator menggunakan spesifikasi berikut sebagai acuan:

- ADR
- MAS
- IMS
- Rich Domain Schema
- Object Model
- Capability Catalog
- Event Catalog

---

# Out of Scope

Validator tidak bertanggung jawab untuk:

- menjalankan workflow;
- membuat artifact;
- mengelola memory runtime;
- menghasilkan konten AI;
- melakukan deployment.

---

# Future Extensions

Validator dirancang agar dapat diperluas melalui plugin, misalnya:

- custom validation rule;
- organization policy;
- naming convention;
- security validation;
- performance validation;
- compatibility validation.

Seluruh ekstensi tetap mengikuti model domain MMOS dan tidak mengubah prinsip dasar validator.