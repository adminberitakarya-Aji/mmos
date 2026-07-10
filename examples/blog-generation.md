# Blog Generation Example

**Version:** MMOS v1.0  
**Category:** Reference Example  
**Status:** Stable

---

# Purpose

Dokumen ini menunjukkan contoh end-to-end bagaimana MMOS menghasilkan sebuah artikel blog menggunakan Composition, Workflow, Agent, Capability, Engine, Memory, dan Event.

Contoh ini bersifat implementasi referensi dan tidak bergantung pada provider AI tertentu.

---

# Scenario

User ingin membuat artikel blog mengenai:

> "10 Manfaat Artificial Intelligence untuk UMKM"

Output yang diharapkan:

- SEO Friendly
- ±1500 kata
- Bahasa Indonesia
- Memiliki heading H1–H3
- Meta Description
- Featured Image
- Markdown

---

# Composition

```yaml
composition:

  id: cmp_blog_001

  name: Blog Generation

  type: blog

  objective:

    Generate SEO friendly article.

  input:

    topic:
      "10 Manfaat Artificial Intelligence untuk UMKM"

    language:
      id

    length:
      1500

    output:
      markdown

    image:
      true
```

---

# Workflow

Workflow terdiri dari beberapa Task.

```
Research

↓

Outline

↓

Draft

↓

Review

↓

SEO Optimization

↓

Image Generation

↓

Package Result
```

---

# Workflow Definition

```yaml
workflow:

  id: wf_blog_generation

  tasks:

    - research

    - outline

    - writing

    - review

    - seo

    - image

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
research document
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

Outline

Input

```
research
```

Output

```
outline
```

Capability

```
text.plan
```

Engine

```
AI Engine
```

---

## Task 3

Writing

Input

```
outline
```

Output

```
draft article
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

## Task 4

Review

Input

```
draft
```

Output

```
reviewed article
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

## Task 5

SEO Optimization

Input

```
reviewed article
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

## Task 6

Image Generation

Input

```
seo article
```

Output

```
featured image
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

## Task 7

Packaging

Input

```
article

image
```

Output

```
blog package
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
| Writer Agent | Menulis artikel |
| Reviewer Agent | Memeriksa kualitas |
| SEO Agent | Optimasi SEO |
| Image Agent | Membuat gambar |
| Packaging Agent | Menyusun hasil akhir |

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

Workflow menggunakan Memory pada beberapa tahap.

## Read

```
Writing Style

Brand Voice

Previous Articles

Keyword History
```

## Write

```
Generated Article

Keyword Statistics

Generation History
```

Memory hanya menyediakan konteks.

Memory tidak menjalankan workflow.

---

# Events

Selama proses akan dihasilkan event.

```
composition.created

workflow.started

task.started

task.completed

artifact.created

workflow.completed

composition.completed
```

Semua event bersifat immutable.

---

# Produced Artifacts

```
article.md

metadata.json

featured-image.png

seo-report.json

generation-log.json
```

---

# Object Relationship

```
Project

└── Composition

    ├── Workflow

    │     ├── Task

    │     ├── Task

    │     └── Task

    │

    ├── Memory

    ├── Artifact

    └── Events
```

---

# Execution Timeline

```
Create Composition

↓

Create Workflow

↓

Execute Research

↓

Generate Outline

↓

Generate Draft

↓

Review

↓

Optimize SEO

↓

Generate Image

↓

Package Result

↓

Complete Composition
```

---

# Expected Output

```
Article (Markdown)

SEO Metadata

Featured Image

Generation Report

Execution Log
```

---

# Architecture Notes

- Composition adalah root eksekusi.
- Workflow bersifat deklaratif.
- Orchestrator hanya melakukan koordinasi.
- Engine menjalankan pekerjaan sesuai Capability.
- Memory hanya menyediakan konteks.
- Event dicatat secara append-only.
- Seluruh implementasi bersifat provider agnostic.