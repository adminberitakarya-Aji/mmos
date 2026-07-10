# Social Media Content Generation Example

**Version:** MMOS v1.0  
**Category:** Reference Example  
**Status:** Stable

---

# Purpose

Dokumen ini menunjukkan contoh end-to-end bagaimana MMOS menghasilkan konten media sosial dari sebuah ide hingga menjadi paket konten siap dipublikasikan ke berbagai platform.

Contoh ini mengikuti seluruh prinsip arsitektur MMOS:

- Composition sebagai pusat eksekusi
- Workflow bersifat declarative
- Orchestrator hanya melakukan koordinasi
- Engine menjalankan pekerjaan
- Capability sebagai kontrak
- Memory sebagai penyedia konteks
- Provider Agnostic

---

# Scenario

Marketing ingin membuat kampanye media sosial mengenai:

> Promo AI Studio untuk UMKM.

Target platform:

- Instagram
- Facebook
- X
- LinkedIn

Output yang diharapkan:

- Caption
- Hashtag
- Thumbnail
- CTA
- Metadata
- Publishing Package

---

# Composition

```yaml
composition:

  id: cmp_social_001

  name: Social Media Campaign

  type: social-media

  objective:

    Generate multi-platform social media content.

  input:

    topic:
      "Promo AI Studio"

    audience:
      UMKM

    language:
      id

    platforms:

      - instagram
      - facebook
      - x
      - linkedin

    image:
      true
```

---

# Workflow

Workflow terdiri dari beberapa Task.

```
Research

↓

Audience Analysis

↓

Caption Generation

↓

Hashtag Generation

↓

CTA Generation

↓

Image Generation

↓

Platform Adaptation

↓

Package Result
```

---

# Workflow Definition

```yaml
workflow:

  id: wf_social_media

  tasks:

    - research

    - audience_analysis

    - caption

    - hashtag

    - cta

    - image

    - adaptation

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
campaign brief
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

Audience Analysis

Input

```
campaign brief
```

Output

```
audience profile
```

Capability

```
audience.analyze
```

Engine

```
Analytics Engine
```

---

## Task 3

Caption Generation

Input

```
campaign brief

audience profile
```

Output

```
captions
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

Hashtag Generation

Input

```
captions
```

Output

```
hashtags
```

Capability

```
hashtag.generate
```

Engine

```
AI Engine
```

---

## Task 5

CTA Generation

Input

```
captions
```

Output

```
call-to-action
```

Capability

```
cta.generate
```

Engine

```
AI Engine
```

---

## Task 6

Image Generation

Input

```
campaign brief
```

Output

```
social image
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

Platform Adaptation

Input

```
captions

hashtags

cta
```

Output

```
platform specific content
```

Capability

```
content.adapt
```

Engine

```
Content Engine
```

---

## Task 8

Package Result

Input

```
all generated assets
```

Output

```
publishing package
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
| Research Agent | Mengumpulkan informasi kampanye |
| Audience Agent | Analisis target audiens |
| Copywriter Agent | Membuat caption |
| Marketing Agent | Membuat hashtag dan CTA |
| Image Agent | Membuat visual |
| Content Agent | Menyesuaikan format tiap platform |
| Packaging Agent | Menyusun paket publikasi |

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

Analytics Engine

↓

AI Engine

↓

Image Engine

↓

Content Engine

↓

Artifact Engine
```

---

# Memory Usage

## Read

```
Brand Voice

Marketing Guidelines

Previous Campaigns

Target Audience

Brand Assets
```

## Write

```
Campaign History

Generated Captions

Publishing History

Performance Metadata
```

Memory hanya menyediakan konteks dan tidak menjalankan workflow.

---

# Events

```
composition.created

workflow.started

task.started

task.completed

caption.generated

image.generated

artifact.created

workflow.completed

composition.completed
```

Semua event bersifat immutable.

---

# Produced Artifacts

```
instagram.md

facebook.md

x.md

linkedin.md

hashtags.txt

cta.txt

social-image.png

metadata.json

publishing-package.json
```

---

# Object Relationship

```
Project

└── Composition

    ├── Workflow

    │     ├── Research Task

    │     ├── Audience Task

    │     ├── Caption Task

    │     ├── Image Task

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

Analyze Audience

↓

Generate Captions

↓

Generate Hashtags

↓

Generate CTA

↓

Generate Image

↓

Adapt for Platforms

↓

Package Result

↓

Complete Composition
```

---

# Expected Output

```
Instagram Post

Facebook Post

X Post

LinkedIn Post

Social Image

Hashtags

CTA

Publishing Package

Execution Log
```

---

# Architecture Notes

- Composition menjadi root eksekusi kampanye media sosial.
- Workflow mendeskripsikan urutan proses tanpa implementasi.
- Orchestrator hanya mengoordinasikan Engine.
- Setiap Capability diimplementasikan oleh Engine yang sesuai.
- Memory menyediakan konteks kampanye dan brand.
- Event dicatat secara append-only.
- Implementasi bersifat provider agnostic.
```