# Generator Templates

**Version:** MMOS v1.0  
**Component:** Generator  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan standar template yang digunakan oleh MMOS Generator.

Template merupakan cetak biru (blueprint) yang digunakan Generator untuk menghasilkan object, konfigurasi, dokumentasi, maupun struktur project secara konsisten.

Template tidak berisi implementasi bisnis dan tidak digunakan oleh Runtime.

---

# Objectives

Template dirancang untuk:

- Menghasilkan object yang konsisten.
- Mengurangi pekerjaan manual.
- Menstandarkan struktur project.
- Mendukung proses scaffolding.
- Mempermudah pemeliharaan generator.
- Memungkinkan ekstensi melalui template baru.

---

# Template Architecture

Seluruh template mengikuti alur berikut.

```
Generation Request

↓

Template Selection

↓

Template Resolution

↓

Template Rendering

↓

Generated Output
```

Template hanya mendeskripsikan bentuk output yang akan dihasilkan.

---

# Template Categories

Generator menyediakan beberapa kategori template.

## Project Template

Digunakan untuk membuat struktur project MMOS.

Contoh output:

```
README.md

docs/

specs/

assets/

tools/
```

---

## Composition Template

Menghasilkan template Composition.

Contoh:

```
Blog Generation

News Production

Video Production

Multimodal Content
```

---

## Workflow Template

Menghasilkan Workflow sesuai tipe Composition.

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

## Task Template

Menghasilkan Task beserta konfigurasi awal.

Contoh:

```
Research Task

Writing Task

Review Task

Rendering Task
```

---

## Agent Template

Menghasilkan Agent sesuai perannya.

Contoh:

```
Research Agent

Writer Agent

SEO Agent

Image Agent
```

---

## Capability Template

Menghasilkan Capability berdasarkan Capability Catalog.

Contoh:

```
text.generate

image.generate

video.render
```

---

## Schema Template

Menghasilkan Rich Domain Schema.

Contoh:

```
composition.schema.json

workflow.schema.json

task.schema.json
```

---

## Documentation Template

Menghasilkan dokumentasi standar.

Contoh:

```
README.md

Architecture.md

Examples.md
```

---

## Configuration Template

Menghasilkan konfigurasi project.

Contoh:

```
project.yaml

runtime.yaml

plugins.yaml
```

---

# Template Lifecycle

```
Create

↓

Load

↓

Resolve

↓

Render

↓

Generate

↓

Complete
```

Template tidak berubah selama proses rendering.

---

# Template Resolution

Generator memilih template berdasarkan tipe object.

Contoh:

```
Composition Type

↓

Blog

↓

Blog Template

↓

Generated Composition
```

Contoh lain:

```
Workflow Type

↓

Video Production

↓

Workflow Template

↓

Generated Workflow
```

---

# Template Variables

Template dapat menggunakan variabel.

Contoh:

```
Project Name

Composition Name

Workflow Name

Agent Name

Capability Name

Version
```

Nilai variabel berasal dari Generation Request.

---

# Template Constraints

Template harus memenuhi ketentuan berikut.

- Menghasilkan object yang valid.
- Mengikuti Rich Domain Schema.
- Menggunakan terminologi resmi MMOS.
- Tidak menghasilkan object di luar model domain.
- Tidak bergantung pada provider tertentu.

---

# Template Organization

Setiap template hanya memiliki satu tanggung jawab.

Contoh:

```
Project Template

↓

Composition Template

↓

Workflow Template

↓

Task Template
```

Hindari satu template yang menghasilkan banyak jenis object dengan tanggung jawab berbeda.

---

# Generated Objects

Template dapat menghasilkan object berikut.

```
Project

Composition

Workflow

Task

Agent

Capability

Memory

Artifact

Event
```

Seluruh object harus sesuai dengan Object Model MMOS.

---

# Generated Documents

Template dokumentasi dapat menghasilkan:

```
README.md

Architecture.md

Examples.md

Configuration.md

Reference.md
```

---

# Generated Configuration

Template konfigurasi dapat menghasilkan:

```
Project Configuration

Runtime Configuration

Plugin Configuration

Generator Configuration
```

---

# Extensibility

Generator mendukung penambahan template baru.

Contoh:

```
Organization Template

↓

SDK Template

↓

Plugin Template

↓

API Template

↓

Documentation Template
```

Template tambahan tidak boleh mengubah struktur dasar Generator.

---

# Design Principles

Template mengikuti prinsip berikut.

## Declarative

Template hanya mendeskripsikan output yang dihasilkan.

---

## Reusable

Satu template dapat digunakan oleh banyak project.

---

## Modular

Setiap template memiliki satu tanggung jawab.

---

## Versioned

Template mengikuti versi MMOS.

---

## Deterministic

Input yang sama menghasilkan output yang sama.

---

## Provider Agnostic

Template tidak mengandung implementasi provider tertentu.

---

# Version Compatibility

Seluruh template harus konsisten dengan:

- ADR
- MAS
- IMS
- Rich Domain Schema
- Object Model
- Capability Catalog
- Event Catalog

Perubahan pada model domain harus diikuti dengan pembaruan template terkait.

---

# Best Practices

- Gunakan template resmi MMOS.
- Hindari duplikasi template dengan fungsi yang sama.
- Pisahkan template berdasarkan tanggung jawabnya.
- Gunakan variabel daripada nilai yang di-hardcode.
- Pastikan seluruh output dapat divalidasi oleh MMOS Validator.

---

# Related Documents

- `tools/generators/README.md`
- `tools/generators/architecture.md`
- `tools/generators/examples.md`
- `tools/validator/README.md`
- `specs/schemas/`
- `docs/architecture/`
- `docs/catalog/`
```