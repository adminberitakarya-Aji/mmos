# MMOS CLI

**Version:** MMOS v1.0  
**Component:** Developer Tools  
**Status:** Stable

---

# Purpose

MMOS CLI (Command Line Interface) merupakan antarmuka utama bagi developer untuk berinteraksi dengan MMOS melalui command line.

CLI menyediakan cara yang konsisten untuk membuat project, menghasilkan object, menjalankan validator, mengelola konfigurasi, serta melakukan berbagai tugas pengembangan tanpa harus berinteraksi langsung dengan implementasi internal.

CLI merupakan developer tool dan bukan bagian dari Runtime MMOS.

---

# Objectives

MMOS CLI dirancang untuk:

- Mempermudah pengembangan project MMOS.
- Menyediakan antarmuka yang konsisten.
- Mengintegrasikan Generator dan Validator.
- Mengotomatisasi pekerjaan yang berulang.
- Mendukung workflow CI/CD.
- Menjadi entry point seluruh developer tools MMOS.

---

# Repository Structure

```text
tools/
└── cli/
    ├── README.md
    ├── commands.md
    ├── configuration.md
    └── examples.md
```

---

# Responsibilities

CLI bertanggung jawab untuk:

- menjalankan Generator;
- menjalankan Validator;
- membuat project baru;
- menghasilkan object MMOS;
- memvalidasi repository;
- menampilkan informasi project;
- mengelola konfigurasi CLI.

CLI tidak bertanggung jawab untuk:

- menjalankan Runtime;
- mengeksekusi Workflow;
- memanggil AI Provider;
- menjalankan Engine.

---

# Architecture Overview

CLI bertindak sebagai lapisan presentasi (presentation layer) bagi developer.

```
Developer

↓

MMOS CLI

↓

Generator

↓

Validator

↓

Project Repository
```

CLI hanya mengoordinasikan developer tools dan tidak mengandung business logic MMOS.

---

# Core Features

## Project Management

Membuat dan mengelola project MMOS.

Contoh:

- Create Project
- Initialize Repository
- Display Project Information

---

## Object Generation

Menghasilkan object MMOS.

Contoh:

- Composition
- Workflow
- Task
- Agent
- Capability
- Schema

---

## Validation

Menjalankan Validator terhadap repository atau object tertentu.

Contoh:

- Validate Project
- Validate Schema
- Validate Composition
- Validate Workflow

---

## Configuration

Mengelola konfigurasi CLI.

Contoh:

- Default Template
- Output Directory
- Generator Settings
- Validator Settings

---

## Information

Menampilkan informasi project.

Contoh:

- Version
- Installed Components
- Available Templates
- Available Commands

---

# Typical Development Flow

CLI mendukung alur kerja berikut.

```
Create Project

↓

Generate Objects

↓

Validate Project

↓

Fix Issues

↓

Ready for Development
```

---

# Integration

CLI mengintegrasikan beberapa developer tools.

```
MMOS CLI

├── Generator

├── Validator

└── Configuration
```

CLI menjadi entry point tunggal bagi seluruh developer tools.

---

# Design Principles

CLI mengikuti prinsip berikut.

## Simple

Command mudah dipahami dan mudah diingat.

---

## Consistent

Seluruh command mengikuti pola penamaan yang konsisten.

---

## Extensible

Command baru dapat ditambahkan tanpa mengubah arsitektur CLI.

---

## Stateless

CLI tidak menyimpan state project selama eksekusi.

---

## Script Friendly

CLI dapat digunakan pada:

- shell script;
- automation;
- CI/CD pipeline;
- build process.

---

## Provider Agnostic

CLI tidak bergantung pada AI provider, runtime, maupun storage tertentu.

---

# Typical Workflow

Contoh alur penggunaan CLI.

```
Initialize Project

↓

Generate Objects

↓

Run Validator

↓

Resolve Validation Issues

↓

Commit Repository
```

---

# Relationship with Other Tools

| Tool | Responsibility |
|------|----------------|
| CLI | Entry point developer |
| Generator | Menghasilkan object dan template |
| Validator | Memvalidasi object dan repository |

CLI tidak menggantikan Generator maupun Validator, tetapi mengoordinasikan penggunaannya.

---

# Out of Scope

CLI tidak bertanggung jawab untuk:

- menjalankan Runtime;
- mengelola Memory;
- mengeksekusi Workflow;
- mengontrol Engine;
- menghasilkan konten AI;
- melakukan deployment.

---

# Future Extensions

CLI dirancang agar dapat diperluas melalui command tambahan.

Contoh:

- Plugin Management
- Template Marketplace
- Project Upgrade
- Repository Migration
- Documentation Generator
- SDK Generator
- Package Manager

Seluruh ekstensi tetap mengikuti prinsip arsitektur MMOS.

---

# Related Documents

- `tools/cli/commands.md`
- `tools/cli/configuration.md`
- `tools/cli/examples.md`
- `tools/generators/README.md`
- `tools/validator/README.md`
- `docs/architecture/`
- `specs/schemas/`