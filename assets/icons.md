# MMOS Icon Standards

**Version:** MMOS v1.0  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan standar ikon (icons) yang digunakan di seluruh proyek MMOS.

Ikon digunakan untuk membantu mengidentifikasi object, komponen, dan konsep utama MMOS secara konsisten pada dokumentasi, website, presentasi, maupun antarmuka pengguna.

Ikon merupakan representasi visual dan tidak memiliki makna implementasi.

---

# Objectives

Standar ini bertujuan untuk:

- Menjaga konsistensi visual.
- Mempermudah identifikasi object MMOS.
- Mendukung dokumentasi arsitektur.
- Mendukung branding MMOS.
- Memungkinkan penggunaan ulang pada berbagai media.

---

# Design Principles

## Simple

Ikon harus sederhana dan mudah dikenali.

---

## Consistent

Seluruh ikon menggunakan gaya visual yang sama.

---

## Scalable

Ikon tetap jelas pada ukuran kecil maupun besar.

---

## Minimal

Hindari detail yang tidak diperlukan.

---

## Semantic

Setiap ikon harus merepresentasikan satu konsep utama.

---

## Provider Agnostic

Ikon tidak boleh menggunakan identitas vendor tertentu.

Contoh yang tidak digunakan:

- Logo OpenAI
- Logo Anthropic
- Logo Google
- Logo Microsoft
- Logo Docker
- Logo Kubernetes

---

# Standard Icon Set

## Project

Merepresentasikan root container MMOS.

Contoh visual:

```
📁
```

---

## Composition

Merepresentasikan pusat eksekusi MMOS.

Contoh visual:

```
🧩
```

---

## Workflow

Merepresentasikan urutan proses.

Contoh visual:

```
🔀
```

---

## Task

Merepresentasikan unit pekerjaan.

Contoh visual:

```
✓
```

---

## Agent

Merepresentasikan AI Agent.

Contoh visual:

```
🤖
```

---

## Orchestrator

Merepresentasikan komponen koordinasi.

Contoh visual:

```
🎼
```

---

## Engine

Merepresentasikan mesin eksekusi.

Contoh visual:

```
⚙️
```

---

## Runtime

Merepresentasikan lingkungan eksekusi.

Contoh visual:

```
▶️
```

---

## Capability

Merepresentasikan kontrak kemampuan.

Contoh visual:

```
🔧
```

---

## Memory

Merepresentasikan penyedia konteks.

Contoh visual:

```
🧠
```

---

## Artifact

Merepresentasikan hasil produksi.

Contoh visual:

```
📄
```

---

## Event

Merepresentasikan kejadian pada sistem.

Contoh visual:

```
📡
```

---

## Storage

Merepresentasikan media penyimpanan.

Contoh visual:

```
🗄️
```

---

## API

Merepresentasikan antarmuka sistem.

Contoh visual:

```
🔌
```

---

## User

Merepresentasikan pengguna.

Contoh visual:

```
👤
```

---

# Recommended Style

Seluruh ikon sebaiknya memiliki karakteristik berikut.

- Flat Design
- Outline atau Filled (pilih salah satu dan konsisten)
- Minimal
- Modern
- Professional
- Mudah dikenali

Jangan mencampurkan berbagai gaya ikon dalam satu dokumen.

---

# Preferred Formats

## Primary

```
SVG
```

Direkomendasikan untuk seluruh ikon karena bersifat scalable.

---

## Secondary

```
PNG
```

Digunakan apabila SVG tidak tersedia.

---

## Avoid

Tidak disarankan menggunakan:

- JPG
- GIF
- BMP

---

# Recommended Sizes

## Small

```
16 × 16 px
```

---

## Medium

```
24 × 24 px
```

---

## Standard UI

```
32 × 32 px
```

---

## Documentation

```
64 × 64 px
```

---

## Presentation

```
128 × 128 px
```

---

# Naming Convention

Gunakan format:

```
kebab-case
```

Contoh:

```
project.svg

composition.svg

workflow.svg

task.svg

agent.svg

engine.svg

memory.svg

artifact.svg

event.svg

runtime.svg

storage.svg

api.svg
```

---

# Color Usage

Ikon sebaiknya tetap mudah dikenali baik dalam warna maupun monokrom.

Untuk dokumentasi teknis, gunakan satu palet warna yang konsisten.

Jangan menggunakan warna sebagai satu-satunya pembeda makna.

---

# Accessibility

Seluruh ikon harus:

- tetap terbaca pada ukuran kecil;
- memiliki kontras yang baik;
- dapat digunakan pada latar terang maupun gelap;
- memiliki label atau teks pendamping jika digunakan pada dokumentasi atau antarmuka.

---

# Version Compatibility

Seluruh ikon harus konsisten dengan:

- ADR
- MAS
- IMS
- Object Model
- Capability Catalog
- Event Catalog
- Diagram Standards

Apabila terdapat object baru pada model domain MMOS, ikon yang sesuai harus ditambahkan sebagai bagian dari standar ini.

---

# Out of Scope

Dokumen ini tidak mengatur:

- logo perusahaan;
- logo vendor AI;
- logo teknologi pihak ketiga;
- favicon website;
- ikon yang dihasilkan oleh pengguna.

---

# Review Checklist

Sebelum ikon digunakan, pastikan:

- menggunakan gaya visual yang konsisten;
- mewakili object MMOS yang benar;
- mengikuti penamaan standar;
- tersedia dalam format SVG;
- dapat digunakan pada dokumentasi maupun UI;
- bebas dari identitas vendor atau teknologi tertentu.

---

# Related Documents

- `assets/README.md`
- `assets/diagrams.md`
- `assets/images.md`
- `docs/architecture/`
- `docs/catalog/`
- `docs/examples/`