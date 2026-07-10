# MMOS Generator

**Version:** MMOS v1.0  
**Status:** Stable

---

# Purpose

Generator merupakan komponen developer tool yang bertanggung jawab menghasilkan object, konfigurasi, template, dan artefak MMOS secara otomatis berdasarkan spesifikasi yang telah divalidasi.

Generator membantu developer membangun project MMOS secara konsisten, mengurangi pekerjaan berulang, serta memastikan seluruh output mengikuti standar arsitektur MMOS.

Generator bukan bagian dari Runtime dan tidak menjalankan workflow.

---

# Objectives

Generator dirancang untuk:

- Menghasilkan object MMOS secara otomatis.
- Menghasilkan template project.
- Menghasilkan file konfigurasi.
- Menghasilkan Rich Domain Schema boilerplate.
- Menghasilkan dokumentasi standar.
- Menghasilkan kode awal (scaffold) yang konsisten.
- Mempercepat proses pengembangan.

---

# Scope

Generator dapat menghasilkan berbagai jenis artefak, antara lain:

- Project
- Composition
- Workflow
- Task
- Agent
- Capability
- Plugin
- Schema
- Configuration
- Documentation
- Example Project

Generator tidak melakukan:

- eksekusi workflow;
- validasi object;
- pemanggilan AI provider;
- deployment aplikasi.

---

# Repository Structure

```text
tools/
└── generators/
    ├── README.md
    ├── architecture.md
    ├── templates.md
    └── examples.md
```

---

# Generator Categories

## Project Generator

Membuat struktur project MMOS baru.

Contoh:

```
mmos init my-project
```

Output:

```
Project

README

Configuration

Composition

Workflow

Examples
```

---

## Composition Generator

Menghasilkan template Composition.

Contoh:

```
Blog Generation

News Production

Video Production
```

---

## Workflow Generator

Membuat workflow sesuai tipe Composition.

Contoh:

```
Research

↓

Planning

↓

Execution

↓

Packaging
```

---

## Agent Generator

Menghasilkan definisi Agent beserta konfigurasi awal.

Contoh:

- Research Agent
- Writer Agent
- Review Agent
- Image Agent

---

## Capability Generator

Membuat Capability sesuai Capability Catalog.

Contoh:

```
text.generate

image.generate

video.render
```

---

## Schema Generator

Menghasilkan Rich Domain Schema boilerplate.

Contoh:

```
composition.schema.json

workflow.schema.json

task.schema.json
```

---

## Documentation Generator

Menghasilkan dokumentasi standar.

Contoh:

```
README.md

Architecture.md

Examples.md
```

---

# Generation Flow

Generator bekerja melalui tahapan berikut.

```
Input

↓

Template Selection

↓

Object Generation

↓

Configuration Generation

↓

Documentation Generation

↓

Output
```

---

# Input Sources

Generator dapat menggunakan berbagai sumber input.

Contoh:

- Rich Domain Schema
- Template
- Configuration
- Existing Project
- CLI Parameter

---

# Generated Outputs

Generator dapat menghasilkan:

```
Project Structure

Configuration

Schemas

Templates

Markdown Documentation

Sample Workflow

Sample Composition

Example Project
```

---

# Integration

Generator dapat digunakan bersama:

- Validator
- CLI
- IDE Plugin
- CI/CD
- Build Process

Urutan penggunaan yang direkomendasikan:

```
Generator

↓

Validator

↓

Runtime
```

---

# Design Principles

Generator mengikuti prinsip berikut.

## Template Driven

Seluruh output dihasilkan dari template yang terdokumentasi.

---

## Deterministic

Input yang sama menghasilkan output yang sama.

---

## Extensible

Generator baru dapat ditambahkan tanpa mengubah arsitektur inti.

---

## Idempotent

Menjalankan generator berulang kali terhadap input yang sama tidak menghasilkan struktur yang inkonsisten.

---

## Provider Agnostic

Generator tidak bergantung pada AI provider maupun teknologi tertentu.

---

## Convention Over Configuration

Generator mengikuti konvensi MMOS sehingga developer tidak perlu melakukan konfigurasi yang berlebihan.

---

# Relationship with Validator

Generator dan Validator memiliki tanggung jawab yang berbeda.

| Component | Responsibility |
|-----------|----------------|
| Generator | Menghasilkan object dan template |
| Validator | Memastikan object sesuai spesifikasi |

Generator sebaiknya dijalankan sebelum Validator pada tahap inisialisasi project, sedangkan Validator digunakan sebelum proses build atau runtime.

---

# Out of Scope

Generator tidak bertanggung jawab untuk:

- menjalankan workflow;
- mengelola runtime;
- mengakses memory;
- menghasilkan konten AI;
- melakukan deployment.

---

# Future Extensions

Generator dirancang agar dapat diperluas melalui plugin.

Contoh ekstensi:

- Custom Project Generator
- Organization Template Generator
- Documentation Generator
- SDK Generator
- API Generator
- Plugin Generator
- Test Generator

Seluruh ekstensi tetap mengikuti model domain dan standar arsitektur MMOS.

---

# Related Documents

- `tools/generators/architecture.md`
- `tools/generators/templates.md`
- `tools/generators/examples.md`
- `tools/validator/README.md`
- `tools/cli/README.md`
- `specs/schemas/`
- `docs/architecture/`