# MMOS Image Standards

**Version:** MMOS v1.0  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan standar penggunaan gambar (images) di seluruh proyek MMOS.

Tujuan utama standar ini adalah menjaga konsistensi visual, memudahkan pemeliharaan dokumentasi, dan memastikan seluruh gambar dapat digunakan kembali pada berbagai media seperti dokumentasi, website, presentasi, maupun materi pelatihan.

Dokumen ini hanya mengatur gambar yang menjadi bagian dari dokumentasi dan aset proyek. Gambar yang dihasilkan oleh MMOS sebagai output workflow bukan bagian dari dokumen ini.

---

# Objectives

Standar ini bertujuan untuk:

- Menjaga konsistensi visual.
- Mendukung dokumentasi arsitektur.
- Mendukung branding MMOS.
- Mempermudah penggunaan ulang aset.
- Memisahkan aset dokumentasi dari hasil generasi AI.

---

# Image Categories

## Hero Images

Digunakan sebagai gambar utama pada dokumentasi atau website.

Contoh:

- MMOS Overview
- AI Platform
- Workflow Overview
- Architecture Overview

---

## Illustrations

Menjelaskan konsep atau proses.

Contoh:

- Composition Lifecycle
- Workflow Execution
- Agent Collaboration
- Engine Interaction

---

## Screenshots

Menampilkan contoh implementasi antarmuka.

Contoh:

- Dashboard
- Workflow Editor
- Project Explorer
- Runtime Monitor

Screenshot hanya digunakan sebagai referensi dan tidak menjadi bagian dari model arsitektur.

---

## Thumbnails

Digunakan untuk:

- Artikel
- Tutorial
- Blog
- Dokumentasi
- Video

Thumbnail harus memiliki desain yang sederhana dan mudah dikenali.

---

## Banners

Digunakan pada:

- Website
- Repository
- Presentasi
- Dokumentasi

Banner sebaiknya menampilkan identitas MMOS tanpa memuat detail implementasi teknis.

---

## Background Images

Digunakan sebagai elemen pendukung visual.

Background tidak boleh mengurangi keterbacaan teks.

---

# Image Design Principles

## Consistent

Seluruh gambar harus memiliki gaya visual yang seragam.

---

## Minimal

Hindari elemen dekoratif yang tidak memiliki nilai informasi.

---

## Clean

Gunakan tata letak yang sederhana sehingga fokus tetap pada informasi utama.

---

## Reusable

Satu gambar sebaiknya dapat digunakan di berbagai media tanpa perlu dimodifikasi.

---

## Provider Agnostic

Gambar tidak boleh menampilkan identitas vendor atau provider AI tertentu.

Contoh yang tidak digunakan:

- Logo OpenAI
- Logo Claude
- Logo Gemini
- Logo Ollama
- Logo PostgreSQL
- Logo Docker

Visual hanya menggambarkan konsep MMOS.

---

# Preferred Formats

## Primary

```
SVG
```

Digunakan untuk ilustrasi, diagram sederhana, dan aset yang membutuhkan skalabilitas.

---

## Secondary

```
PNG
```

Digunakan untuk:

- Screenshot
- Thumbnail
- Hero Image

---

## Optional

```
WebP
```

Direkomendasikan untuk website karena ukuran file lebih kecil.

---

## Avoid

Tidak disarankan menggunakan:

- BMP
- TIFF
- GIF (kecuali animasi sederhana jika benar-benar diperlukan)

---

# Recommended Resolution

## Hero Image

```
1920 × 1080
```

---

## Banner

```
1600 × 900
```

---

## Thumbnail

```
1280 × 720
```

---

## Screenshot

Gunakan resolusi asli aplikasi tanpa melakukan peregangan atau distorsi.

---

# Naming Convention

Gunakan format:

```
kebab-case
```

Contoh:

```
hero-overview.png

workflow-illustration.svg

project-dashboard.png

runtime-monitor.png

video-thumbnail.png
```

---

# Visual Style

Seluruh gambar sebaiknya mengikuti karakteristik berikut:

- Modern
- Flat Design
- Minimal
- Professional
- High Contrast
- Mudah dibaca

Hindari efek visual yang berlebihan seperti bayangan berat, tekstur kompleks, atau ornamen yang tidak mendukung informasi.

---

# Text in Images

Jika gambar mengandung teks:

- gunakan istilah resmi MMOS;
- gunakan bahasa yang konsisten dengan dokumentasi;
- hindari paragraf panjang;
- utamakan label singkat dan jelas.

---

# Accessibility

Seluruh gambar sebaiknya:

- memiliki kontras yang baik;
- tetap dapat dipahami ketika dicetak;
- tidak bergantung hanya pada warna untuk menyampaikan informasi;
- memiliki deskripsi (alt text) ketika digunakan pada website atau dokumentasi digital.

---

# Image Source

Sumber gambar dapat berasal dari:

- ilustrasi yang dibuat khusus untuk MMOS;
- screenshot aplikasi MMOS;
- diagram yang diekspor menjadi gambar.

Seluruh aset harus memiliki hak penggunaan yang jelas.

---

# Version Compatibility

Seluruh gambar harus konsisten dengan:

- ADR
- MAS
- IMS
- Object Model
- Capability Catalog
- Event Catalog
- Diagram Standards

Jika terjadi perubahan arsitektur atau istilah resmi, gambar yang terkait harus diperbarui.

---

# Out of Scope

Dokumen ini tidak mengatur:

- gambar yang dihasilkan oleh AI selama workflow;
- aset frontend aplikasi;
- media yang diunggah pengguna;
- hasil produksi konten MMOS.

---

# Review Checklist

Sebelum gambar dipublikasikan, pastikan:

- menggunakan gaya visual MMOS;
- memiliki resolusi yang memadai;
- menggunakan penamaan sesuai standar;
- bebas dari logo atau identitas vendor;
- mudah dipahami tanpa penjelasan tambahan;
- sesuai dengan dokumentasi arsitektur yang berlaku.

---

# Related Documents

- `assets/README.md`
- `assets/diagrams.md`
- `assets/icons.md`
- `docs/architecture/`
- `docs/examples/`