# MMOS Assets

**Version:** MMOS v1.0  
**Status:** Stable

---

# Purpose

Folder `assets/` merupakan lokasi penyimpanan seluruh aset visual yang digunakan oleh proyek MMOS.

Aset ini digunakan untuk mendukung dokumentasi, presentasi, website, dan materi teknis tanpa menjadi bagian dari implementasi runtime MMOS.

Folder ini **tidak** berisi source code maupun spesifikasi domain.

---

# Objectives

Folder ini bertujuan untuk:

- Menyediakan aset visual yang konsisten.
- Menjadi source of truth untuk seluruh diagram.
- Menyimpan ikon yang digunakan pada dokumentasi.
- Menyimpan gambar referensi dan ilustrasi.
- Menjaga konsistensi branding MMOS.

---

# Repository Structure

```text
assets/

├── README.md
├── diagrams.md
├── images.md
└── icons.md
```

---

# Asset Categories

## Diagrams

Berisi standar pembuatan diagram arsitektur MMOS.

Contoh:

- System Context
- Container Diagram
- Component Diagram
- Object Relationship
- Workflow
- Runtime
- Memory
- Event Flow
- Deployment

---

## Images

Berisi standar penggunaan gambar.

Contoh:

- Hero Image
- Illustration
- Thumbnail
- Screenshot
- Banner
- Background

---

## Icons

Berisi standar ikon yang digunakan pada dokumentasi.

Contoh:

- Project
- Composition
- Workflow
- Task
- Agent
- Engine
- Runtime
- Memory
- Artifact
- Capability
- Event

---

# Design Principles

Seluruh aset mengikuti prinsip berikut.

## Consistent

Seluruh diagram dan ikon menggunakan gaya visual yang sama.

---

## Technology Agnostic

Diagram tidak bergantung pada provider, vendor, maupun implementasi tertentu.

---

## Documentation First

Diagram dibuat untuk menjelaskan arsitektur, bukan implementasi.

---

## Reusable

Aset dapat digunakan kembali pada dokumentasi, website, presentasi, maupun materi pelatihan.

---

## Versioned

Perubahan aset mengikuti versi MMOS.

---

# Naming Convention

Gunakan nama file dengan format berikut.

```
kebab-case
```

Contoh:

```
system-context.svg

container-diagram.svg

workflow-execution.svg

memory-overview.png

engine-icons.svg
```

---

# Preferred Formats

## Diagram

- SVG
- PDF
- PNG (export)

---

## Images

- PNG
- JPG
- WebP

---

## Icons

- SVG
- PNG

---

# Source Files

Apabila menggunakan aplikasi desain, source file disimpan secara terpisah dari hasil ekspor.

Contoh:

```
diagram.drawio

architecture.fig

icons.ai
```

Hasil ekspor digunakan pada dokumentasi.

---

# Version Compatibility

Seluruh aset harus konsisten dengan:

- ADR
- MAS
- IMS
- Object Model
- Capability Catalog
- Event Catalog

Jika terdapat perubahan arsitektur, aset visual juga harus diperbarui.

---

# Out of Scope

Folder ini tidak digunakan untuk:

- Source code
- Runtime assets
- Frontend assets
- Backend assets
- Binary dependencies
- Media yang dihasilkan pengguna

---

# Related Documents

- `docs/overview/000-overview.md`
- `docs/overview/010-constitution.md`
- `docs/architecture/`
- `docs/catalog/`
- `docs/examples/`

---

# Maintenance

Seluruh aset visual harus:

- mengikuti keputusan Architecture Decision Record (ADR);
- mencerminkan model domain MMOS yang terbaru;
- memiliki gaya visual yang konsisten;
- mudah dipahami oleh pengembang maupun pengguna non-teknis; dan
- diperbarui bersamaan dengan perubahan dokumentasi arsitektur.