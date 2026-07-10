# Video Production Example

**Version:** MMOS v1.0  
**Category:** Reference Example  
**Status:** Stable

---

# Purpose

Dokumen ini menunjukkan contoh end-to-end bagaimana MMOS menghasilkan video dari sebuah ide hingga menjadi paket video siap dipublikasikan.

Contoh ini menggunakan seluruh komponen utama MMOS:

- Composition
- Workflow
- Task
- Capability
- Agent
- Engine
- Memory
- Artifact
- Event

Seluruh implementasi bersifat provider agnostic.

---

# Scenario

Marketing ingin membuat video promosi berdurasi 60 detik mengenai:

> AI Studio membantu UMKM membuat konten dalam hitungan menit.

Target platform:

- TikTok
- Instagram Reels
- YouTube Shorts

Output yang diharapkan:

- Script
- Storyboard
- Voice Over
- Subtitle
- Video 9:16
- Thumbnail
- Metadata
- Publishing Package

---

# Composition

```yaml
composition:

  id: cmp_video_001

  name: Video Production

  type: video

  objective:

    Generate short-form promotional video.

  input:

    topic:
      "AI Studio untuk UMKM"

    duration:
      60

    language:
      id

    aspect_ratio:
      "9:16"

    subtitle:
      true

    voice_over:
      true
```

---

# Workflow

Workflow produksi video terdiri dari beberapa Task.

```
Research

↓

Script Writing

↓

Storyboard Creation

↓

Scene Generation

↓

Voice Over Generation

↓

Subtitle Generation

↓

Video Rendering

↓

Thumbnail Generation

↓

Package Result
```

---

# Workflow Definition

```yaml
workflow:

  id: wf_video_production

  tasks:

    - research

    - script

    - storyboard

    - scene_generation

    - voice_over

    - subtitle

    - rendering

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
research brief
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

Script Writing

Input

```
research brief
```

Output

```
video script
```

Capability

```
script.generate
```

Engine

```
AI Engine
```

---

## Task 3

Storyboard Creation

Input

```
video script
```

Output

```
storyboard
```

Capability

```
storyboard.generate
```

Engine

```
Creative Engine
```

---

## Task 4

Scene Generation

Input

```
storyboard
```

Output

```
video scenes
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

## Task 5

Voice Over Generation

Input

```
video script
```

Output

```
voice over
```

Capability

```
speech.generate
```

Engine

```
Audio Engine
```

---

## Task 6

Subtitle Generation

Input

```
video script
```

Output

```
subtitle
```

Capability

```
subtitle.generate
```

Engine

```
Media Engine
```

---

## Task 7

Video Rendering

Input

```
video scenes

voice over

subtitle
```

Output

```
rendered video
```

Capability

```
video.render
```

Engine

```
Rendering Engine
```

---

## Task 8

Thumbnail Generation

Input

```
rendered video
```

Output

```
thumbnail
```

Capability

```
thumbnail.generate
```

Engine

```
AI Image Engine
```

---

## Task 9

Package Result

Input

```
video

thumbnail

metadata
```

Output

```
video package
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
| Research Agent | Mengumpulkan referensi |
| Script Agent | Menulis naskah |
| Storyboard Agent | Membuat storyboard |
| Video Agent | Menghasilkan scene video |
| Audio Agent | Membuat voice over |
| Subtitle Agent | Membuat subtitle |
| Rendering Agent | Merender video |
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

Creative Engine

↓

Video Engine

↓

Audio Engine

↓

Media Engine

↓

Rendering Engine

↓

Artifact Engine
```

---

# Memory Usage

## Read

```
Brand Guidelines

Visual Identity

Previous Videos

Voice Style

Music Preferences

Template Library
```

## Write

```
Video History

Rendering Metadata

Production Log

Publishing History
```

Memory hanya menyediakan konteks dan tidak menjalankan workflow.

---

# Events

```
composition.created

workflow.started

task.started

task.completed

script.generated

storyboard.generated

video.generated

audio.generated

subtitle.generated

video.rendered

artifact.created

workflow.completed

composition.completed
```

Seluruh event bersifat immutable.

---

# Produced Artifacts

```
video.mp4

script.md

storyboard.json

voice-over.wav

subtitle.srt

thumbnail.png

metadata.json

render-report.json

publishing-package.json
```

---

# Object Relationship

```
Project

└── Composition

    ├── Workflow

    │     ├── Research Task

    │     ├── Script Task

    │     ├── Storyboard Task

    │     ├── Video Task

    │     ├── Audio Task

    │     ├── Rendering Task

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

Generate Script

↓

Create Storyboard

↓

Generate Video Scenes

↓

Generate Voice Over

↓

Generate Subtitle

↓

Render Video

↓

Generate Thumbnail

↓

Package Result

↓

Complete Composition
```

---

# Expected Output

```
Vertical Video (9:16)

Script

Storyboard

Voice Over

Subtitle

Thumbnail

Publishing Package

Execution Log
```

---

# Architecture Notes

- Composition menjadi root eksekusi produksi video.
- Workflow mendefinisikan urutan proses tanpa mengandung implementasi.
- Orchestrator hanya mengoordinasikan seluruh Engine.
- Setiap Task dijalankan oleh Engine melalui Capability yang sesuai.
- Memory menyediakan konteks produksi seperti brand guideline, template, dan histori video.
- Seluruh Artifact dihasilkan secara bertahap selama workflow berlangsung.
- Event dicatat secara append-only untuk mendukung audit dan observability.
- Implementasi bersifat provider agnostic sehingga dapat menggunakan berbagai AI provider maupun rendering engine tanpa mengubah model domain.