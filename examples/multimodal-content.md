# Multimodal Content Example

**Version:** MMOS v1.0  
**Category:** Reference Example  
**Status:** Stable

---

# Purpose

Dokumen ini menunjukkan contoh end-to-end bagaimana MMOS menghasilkan konten multimodal dari satu Composition.

Satu Composition menghasilkan beberapa Artifact sekaligus, meliputi:

- Blog Article
- News Article
- Social Media Content
- Short Video
- Images
- Metadata

Seluruh proses tetap mengikuti prinsip MMOS:

- Composition sebagai pusat eksekusi
- Workflow bersifat declarative
- Orchestrator hanya melakukan koordinasi
- Engine menjalankan pekerjaan
- Capability sebagai kontrak
- Memory sebagai penyedia konteks
- Provider Agnostic

---

# Scenario

Tim marketing ingin membuat kampanye peluncuran produk baru.

Input:

> AI Studio resmi diluncurkan untuk membantu UMKM membuat konten menggunakan Artificial Intelligence.

Target output:

- Website Article
- News Article
- Instagram Post
- Facebook Post
- X Post
- LinkedIn Post
- Video Shorts
- Thumbnail
- Featured Image
- Metadata
- Publishing Package

---

# Composition

```yaml
composition:

  id: cmp_multimodal_001

  name: Product Launch Campaign

  type: multimodal

  objective:

    Produce multiple content formats from a single source.

  input:

    topic:
      "AI Studio Launch"

    language:
      id

    channels:

      - website
      - news
      - social
      - video

    image:
      true

    video:
      true
```

---

# Workflow

Workflow produksi multimodal.

```
Research

↓

Knowledge Extraction

↓

Content Planning

↓

Blog Generation

↓

News Generation

↓

Social Content Generation

↓

Video Production

↓

Image Generation

↓

Metadata Generation

↓

Package Result
```

---

# Workflow Definition

```yaml
workflow:

  id: wf_multimodal

  tasks:

    - research

    - extraction

    - planning

    - blog

    - news

    - social

    - video

    - image

    - metadata

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

Knowledge Extraction

Input

```
research document
```

Output

```
structured knowledge
```

Capability

```
knowledge.extract
```

Engine

```
Knowledge Engine
```

---

## Task 3

Content Planning

Input

```
structured knowledge
```

Output

```
content plan
```

Capability

```
content.plan
```

Engine

```
Planning Engine
```

---

## Task 4

Blog Generation

Input

```
content plan
```

Output

```
blog article
```

Capability

```
blog.generate
```

Engine

```
AI Engine
```

---

## Task 5

News Generation

Input

```
content plan
```

Output

```
news article
```

Capability

```
news.generate
```

Engine

```
AI Engine
```

---

## Task 6

Social Media Generation

Input

```
content plan
```

Output

```
social contents
```

Capability

```
social.generate
```

Engine

```
AI Engine
```

---

## Task 7

Video Production

Input

```
content plan
```

Output

```
short video
```

Capability

```
video.generate
```

Engine

```
Video Engine
```

---

## Task 8

Image Generation

Input

```
content plan
```

Output

```
images
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

## Task 9

Metadata Generation

Input

```
generated artifacts
```

Output

```
metadata
```

Capability

```
metadata.generate
```

Engine

```
Metadata Engine
```

---

## Task 10

Package Result

Input

```
all artifacts
```

Output

```
campaign package
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
| Planning Agent | Menyusun rencana konten |
| Blog Agent | Membuat artikel blog |
| News Agent | Membuat artikel berita |
| Social Agent | Membuat konten media sosial |
| Video Agent | Membuat video |
| Image Agent | Membuat gambar |
| Metadata Agent | Menyusun metadata |
| Packaging Agent | Menyiapkan paket distribusi |

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

Planning Engine

↓

AI Engine

↓

Video Engine

↓

AI Image Engine

↓

Metadata Engine

↓

Artifact Engine
```

---

# Memory Usage

## Read

```
Brand Guidelines

Visual Identity

Writing Style

Editorial Policy

Marketing Templates

Previous Campaigns

Audience Profile

SEO Knowledge
```

## Write

```
Campaign History

Generated Artifacts

Publishing History

Performance Metadata

Execution Log
```

Memory hanya menyediakan konteks dan tidak mengandung logika bisnis.

---

# Events

```
composition.created

workflow.started

task.started

task.completed

blog.generated

news.generated

social.generated

video.generated

image.generated

metadata.generated

artifact.created

workflow.completed

composition.completed
```

Seluruh event bersifat immutable.

---

# Produced Artifacts

```
blog.md

news.md

instagram.md

facebook.md

x.md

linkedin.md

video.mp4

thumbnail.png

featured-image.png

metadata.json

campaign-package.json

execution-log.json
```

---

# Object Relationship

```
Project

└── Composition

    ├── Workflow

    │     ├── Research Task
    │     ├── Planning Task
    │     ├── Blog Task
    │     ├── News Task
    │     ├── Social Task
    │     ├── Video Task
    │     ├── Image Task
    │     ├── Metadata Task
    │     └── Packaging Task

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

Extract Knowledge

↓

Plan Content

↓

Generate Blog

↓

Generate News

↓

Generate Social Content

↓

Generate Video

↓

Generate Images

↓

Generate Metadata

↓

Package Campaign

↓

Complete Composition
```

---

# Expected Output

```
Website Article

News Article

Instagram Post

Facebook Post

X Post

LinkedIn Post

Short Video

Featured Image

Thumbnail

Metadata

Campaign Package

Execution Log
```

---

# Architecture Notes

- Satu Composition dapat menghasilkan banyak Artifact dalam satu eksekusi.
- Workflow bersifat declarative dan hanya mendefinisikan urutan proses.
- Orchestrator tidak menjalankan logika bisnis, hanya mengoordinasikan Workflow dan Engine.
- Setiap Task dieksekusi oleh Engine melalui Capability yang sesuai.
- Artifact dapat berupa teks, gambar, audio, video, maupun metadata.
- Memory digunakan sebagai penyedia konteks lintas seluruh proses produksi.
- Seluruh Event dicatat secara append-only untuk mendukung audit trail dan observability.
- Implementasi tetap provider agnostic sehingga dapat menggunakan berbagai AI provider, media engine, maupun storage backend tanpa mengubah model domain MMOS.