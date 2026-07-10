# News Production Example

**Version:** MMOS v1.0  
**Category:** Reference Example  
**Status:** Stable

---

# Purpose

Dokumen ini menunjukkan contoh end-to-end bagaimana MMOS memproduksi sebuah artikel berita mulai dari ide, riset, penulisan, verifikasi, hingga publikasi menggunakan arsitektur MMOS.

Contoh ini mengikuti seluruh keputusan arsitektur MMOS:

- Composition sebagai pusat eksekusi
- Workflow bersifat declarative
- Orchestrator hanya melakukan koordinasi
- Engine menjalankan pekerjaan
- Capability sebagai kontrak
- Memory sebagai penyedia konteks
- Provider Agnostic

---

# Scenario

Editor ingin mempublikasikan berita mengenai:

> Pemerintah meresmikan program AI Nasional untuk mendukung UMKM.

Target output:

- Breaking News
- Bahasa Indonesia
- SEO Friendly
- Faktual
- Memiliki headline
- Ringkasan
- Thumbnail
- Metadata
- Siap dipublikasikan ke CMS

---

# Composition

```yaml
composition:

  id: cmp_news_001

  name: News Production

  type: news

  objective:

    Produce verified news article.

  input:

    topic:
      "Program AI Nasional"

    language:
      id

    category:
      technology

    output:
      article

    publish:
      true
```

---

# Workflow

Workflow produksi berita terdiri dari beberapa Task.

```
Research

↓

Fact Verification

↓

Headline Generation

↓

Article Writing

↓

Editorial Review

↓

SEO Optimization

↓

Thumbnail Generation

↓

Publication Packaging
```

---

# Workflow Definition

```yaml
workflow:

  id: wf_news_production

  tasks:

    - research

    - verification

    - headline

    - writing

    - editorial_review

    - seo

    - thumbnail

    - packaging
```

---

# Task Execution

## Task 1

Research

Input

```
topic
```

Output

```
research notes
```

Capability

```
knowledge.search
```

Engine

```
Knowledge Engine
```

---

## Task 2

Fact Verification

Input

```
research notes
```

Output

```
verified facts
```

Capability

```
knowledge.verify
```

Engine

```
Knowledge Engine
```

---

## Task 3

Headline Generation

Input

```
verified facts
```

Output

```
headline
```

Capability

```
headline.generate
```

Engine

```
AI Engine
```

---

## Task 4

Article Writing

Input

```
verified facts

headline
```

Output

```
news article
```

Capability

```
text.generate
```

Engine

```
AI Engine
```

---

## Task 5

Editorial Review

Input

```
news article
```

Output

```
approved article
```

Capability

```
text.review
```

Engine

```
AI Engine
```

---

## Task 6

SEO Optimization

Input

```
approved article
```

Output

```
seo article
```

Capability

```
seo.optimize
```

Engine

```
SEO Engine
```

---

## Task 7

Thumbnail Generation

Input

```
seo article
```

Output

```
thumbnail
```

Capability

```
image.generate
```

Engine

```
AI Image Engine
```

---

## Task 8

Publication Packaging

Input

```
article

thumbnail
```

Output

```
publication package
```

Capability

```
artifact.package
```

Engine

```
Artifact Engine
```

---

# Agent Assignment

| Agent | Responsibility |
|--------|----------------|
| Research Agent | Mengumpulkan informasi |
| Verification Agent | Memverifikasi fakta |
| Writer Agent | Menulis berita |
| Editor Agent | Review editorial |
| SEO Agent | Optimasi SEO |
| Image Agent | Membuat thumbnail |
| Packaging Agent | Menyiapkan paket publikasi |

---

# Engine Interaction

```
Composition

↓

Orchestrator

↓

Workflow Engine

↓

Knowledge Engine

↓

AI Engine

↓

SEO Engine

↓

Image Engine

↓

Artifact Engine
```

---

# Memory Usage

## Read

```
Editorial Guidelines

Writing Style

Publisher Policy

Previous Coverage

Keyword Trends
```

## Write

```
Published Article

Editorial History

Topic Index

SEO Statistics
```

Memory hanya menyediakan konteks dan tidak menjalankan workflow.

---

# Events

Selama proses akan dihasilkan event berikut.

```
composition.created

workflow.started

task.started

task.completed

article.generated

thumbnail.generated

artifact.created

workflow.completed

composition.completed
```

Semua event bersifat immutable.

---

# Produced Artifacts

```
article.md

headline.txt

summary.txt

thumbnail.png

metadata.json

seo-report.json

publication-package.json
```

---

# Object Relationship

```
Project

└── Composition

    ├── Workflow

    │     ├── Research Task

    │     ├── Verification Task

    │     ├── Writing Task

    │     ├── Review Task

    │     └── Publication Task

    ├── Memory

    ├── Artifact

    └── Events
```

---

# Execution Timeline

```
Create Composition

↓

Research

↓

Verify Facts

↓

Generate Headline

↓

Write Article

↓

Editorial Review

↓

SEO Optimization

↓

Generate Thumbnail

↓

Package Publication

↓

Complete Composition
```

---

# Expected Output

```
Verified News Article

Headline

Summary

SEO Metadata

Thumbnail

Publication Package

Execution Log
```

---

# Architecture Notes

- Composition menjadi root eksekusi produksi berita.
- Workflow hanya mendeskripsikan urutan proses.
- Orchestrator tidak melakukan pekerjaan bisnis.
- Seluruh pekerjaan dilakukan oleh Engine sesuai Capability.
- Memory hanya menyediakan konteks editorial.
- Event dicatat secara append-only.
- Seluruh implementasi bersifat provider agnostic.
```