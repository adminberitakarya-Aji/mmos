# Generator Architecture

**Version:** MMOS v1.0  
**Component:** Generator  
**Status:** Stable

---

# Purpose

Dokumen ini menjelaskan arsitektur Generator pada MMOS.

Generator merupakan komponen developer tool yang bertugas menghasilkan object, template, konfigurasi, dan boilerplate berdasarkan spesifikasi MMOS.

Generator tidak menjalankan workflow dan bukan bagian dari Runtime.

---

# Design Goals

Generator dirancang dengan tujuan berikut.

- Menghasilkan project secara konsisten.
- Mengurangi pekerjaan manual.
- Menghasilkan object sesuai Rich Domain Schema.
- Menghasilkan struktur repository standar.
- Mudah diperluas melalui template dan plugin.
- Tidak bergantung pada provider tertentu.

---

# High-Level Architecture

```
Input

      │

      ▼

Template Loader

      │

      ▼

Object Generator

      │

      ▼

Configuration Generator

      │

      ▼

Documentation Generator

      │

      ▼

Project Writer

      │

      ▼

Generated Project
```

Setiap komponen memiliki tanggung jawab tunggal dan bekerja secara berurutan.

---

# Architecture Components

## Input Processor

Input Processor menerima parameter yang diperlukan untuk proses generation.

Contoh input:

- Project Name
- Composition Type
- Workflow Type
- Template
- Configuration
- CLI Arguments

Output:

```
Generation Request
```

---

## Template Loader

Template Loader memuat template yang digunakan selama proses generation.

Template dapat berupa:

- Project Template
- Composition Template
- Workflow Template
- Documentation Template
- Configuration Template

Output:

```
Template Model
```

---

## Object Generator

Object Generator menghasilkan object MMOS.

Contoh object:

```
Project

Composition

Workflow

Task

Agent

Capability
```

Seluruh object mengikuti Rich Domain Schema.

---

## Configuration Generator

Configuration Generator menghasilkan konfigurasi proyek.

Contoh:

```
Project Configuration

Runtime Configuration

Plugin Configuration

Generator Configuration
```

---

## Documentation Generator

Documentation Generator menghasilkan dokumentasi standar.

Contoh:

```
README.md

Architecture.md

Examples.md

Configuration.md
```

---

## Project Writer

Project Writer menyimpan seluruh hasil generation ke struktur repository.

Contoh:

```
Project

↓

Directories

↓

Objects

↓

Configuration

↓

Documentation
```

Komponen ini tidak melakukan validasi terhadap hasil generation.

---

# Generation Flow

```
Receive Request

↓

Load Templates

↓

Generate Objects

↓

Generate Configuration

↓

Generate Documentation

↓

Write Project

↓

Generation Complete
```

---

# Generation Layers

Generator dibagi menjadi beberapa lapisan.

```
Input Layer

↓

Template Layer

↓

Object Layer

↓

Configuration Layer

↓

Documentation Layer

↓

Output Layer
```

Setiap lapisan memiliki satu tanggung jawab utama.

---

# Object Generation

Generator dapat menghasilkan object berikut.

```
Project

↓

Composition

↓

Workflow

↓

Task

↓

Agent

↓

Capability
```

Hubungan antar object mengikuti Object Model MMOS.

---

# Template Resolution

Generator memilih template berdasarkan tipe object.

Contoh:

```
Composition

↓

Blog Template

↓

Workflow Template

↓

Generated Composition
```

Template dapat diganti tanpa mengubah arsitektur Generator.

---

# Output Structure

Generator menghasilkan struktur repository yang konsisten.

Contoh:

```
Project

README

Configuration

Composition

Workflow

Documentation

Examples
```

---

# Integration

Generator dapat diintegrasikan dengan:

- CLI
- Validator
- IDE Plugin
- CI/CD Pipeline
- Build Process

Alur yang direkomendasikan:

```
Generator

↓

Validator

↓

Runtime
```

Validator memastikan seluruh output Generator sesuai dengan spesifikasi MMOS.

---

# Extensibility

Generator dirancang modular sehingga dapat diperluas melalui plugin.

Contoh:

```
Template Generator

↓

Documentation Generator

↓

SDK Generator

↓

Plugin Generator

↓

API Generator
```

Setiap generator tambahan bekerja secara independen.

---

# Design Principles

Generator mengikuti prinsip berikut.

## Template Driven

Seluruh output dihasilkan dari template yang terdokumentasi.

---

## Deterministic

Input yang sama menghasilkan output yang sama.

---

## Stateless

Generator tidak menyimpan state antar proses generation.

---

## Modular

Setiap komponen memiliki tanggung jawab tunggal.

---

## Extensible

Generator baru dapat ditambahkan tanpa mengubah arsitektur utama.

---

## Provider Agnostic

Generator tidak bergantung pada AI provider, storage, maupun runtime tertentu.

---

# Related Documents

- `tools/generators/README.md`
- `tools/generators/templates.md`
- `tools/generators/examples.md`
- `tools/validator/README.md`
- `tools/cli/README.md`
- `specs/schemas/`
- `docs/architecture/`
```