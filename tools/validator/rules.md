# Validator Rules

**Version:** MMOS v1.0  
**Component:** Validator  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan aturan (validation rules) yang digunakan oleh MMOS Validator untuk memastikan seluruh object memenuhi spesifikasi domain.

Seluruh aturan berasal dari:

- ADR (Architecture Decision Records)
- MAS (MMOS Architecture Specification)
- IMS (Implementation Model Specification)
- Rich Domain Schema

Validator hanya melakukan pemeriksaan (validation) dan tidak melakukan perubahan terhadap object.

---

# Validation Categories

Validator membagi aturan menjadi beberapa kategori.

```
Schema Rules

↓

Reference Rules

↓

Relationship Rules

↓

Lifecycle Rules

↓

Architecture Rules

↓

Naming Rules

↓

Compatibility Rules
```

---

# 1. Schema Rules

Schema Rules memastikan setiap object sesuai dengan Rich Domain Schema.

## Rules

- Seluruh required field harus tersedia.
- Tipe data harus sesuai.
- Nilai enum harus valid.
- Format field harus sesuai spesifikasi.
- Object tidak boleh memiliki struktur yang tidak dikenal apabila schema melarang additional properties.

Contoh:

```
✓ Valid

Composition.id

Composition.name

Composition.workflow
```

```
✗ Invalid

Missing id

Invalid enum

Wrong data type
```

---

# 2. Reference Rules

Reference Rules memastikan seluruh referensi object valid.

## Rules

Workflow harus mereferensikan Composition yang ada.

Task harus berada di dalam Workflow.

Agent harus tersedia sebelum digunakan.

Capability harus terdaftar pada Capability Catalog.

Event harus sesuai Event Catalog.

Artifact harus memiliki owner yang valid.

---

# 3. Relationship Rules

Relationship Rules memastikan hubungan antar object sesuai dengan Object Model MMOS.

Model yang diperbolehkan:

```
Project

└── Composition

      ├── Workflow

      │     ├── Task

      │     └── Task

      ├── Memory

      ├── Artifact

      └── Event
```

Relationship berikut tidak diperbolehkan:

- Task memiliki Task.
- Workflow memiliki Workflow.
- Event memiliki Workflow.
- Artifact memiliki Composition.
- Agent memiliki Workflow.

---

# 4. Lifecycle Rules

Validator memastikan state object mengikuti lifecycle yang telah ditentukan.

Contoh:

## Composition

```
Created

↓

Validated

↓

Ready

↓

Running

↓

Completed

↓

Archived
```

State tidak boleh melompat secara tidak valid.

---

## Workflow

```
Draft

↓

Ready

↓

Running

↓

Completed
```

---

## Task

```
Pending

↓

Queued

↓

Running

↓

Completed

↓

Failed
```

---

# 5. Architecture Rules

Validator memastikan seluruh Architecture Decision Record dipatuhi.

## ADR-001

Composition adalah pusat eksekusi.

---

## ADR-002

Project merupakan root aggregate.

---

## ADR-003

Orchestrator hanya melakukan koordinasi.

---

## ADR-004

Provider bersifat agnostic.

---

## ADR-005

Capability merupakan kontrak.

---

## ADR-006

Workflow bersifat declarative.

---

## ADR-007

Memory hanya menyediakan konteks.

---

## ADR-008

Runtime bersifat stateless.

---

## ADR-009

Event bersifat immutable.

---

## ADR-010

Artifact merupakan hasil eksekusi.

---

# 6. Naming Rules

Validator memastikan penamaan object konsisten.

## Identifier

Harus unik dalam ruang lingkup yang sesuai.

---

## File Names

Menggunakan:

```
kebab-case
```

---

## Object Names

Menggunakan nama yang deskriptif.

Contoh:

```
Blog Generation

News Production

Image Generation
```

Hindari nama generik seperti:

```
Task1

Workflow2

AgentX
```

---

# 7. Compatibility Rules

Validator memastikan kompatibilitas antar versi.

## Rules

- Schema version harus dikenali.
- Object version harus kompatibel.
- Deprecated field menghasilkan warning.
- Breaking change menghasilkan error.

---

# Validation Severity

Validator mengelompokkan hasil validasi menjadi tiga tingkat.

## Error

Object tidak dapat digunakan.

Contoh:

- Required field hilang.
- Reference tidak ditemukan.
- Relationship tidak valid.
- Schema tidak sesuai.

---

## Warning

Object masih valid tetapi memerlukan perhatian.

Contoh:

- Metadata kosong.
- Deskripsi belum tersedia.
- Field deprecated masih digunakan.

---

## Information

Informasi tambahan.

Contoh:

- Jumlah object.
- Lama proses validasi.
- Statistik repository.

---

# Validation Order

Validator memproses aturan dengan urutan berikut.

```
Load Object

↓

Schema Validation

↓

Reference Validation

↓

Relationship Validation

↓

Lifecycle Validation

↓

Architecture Validation

↓

Compatibility Validation

↓

Generate Report
```

Validasi dilakukan secara bertahap agar kesalahan dapat dilaporkan sedini mungkin.

---

# Rule Sources

Seluruh aturan validasi harus mengacu pada dokumen resmi MMOS.

- ADR
- MAS
- IMS
- Rich Domain Schema
- Object Model
- Capability Catalog
- Event Catalog

Validator tidak boleh menggunakan aturan yang tidak didefinisikan pada dokumentasi resmi.

---

# Custom Rules

Validator dapat mendukung aturan tambahan melalui mekanisme ekstensi.

Contoh:

- Organization Policy
- Internal Naming Convention
- Security Policy
- Documentation Policy
- Plugin Validation

Custom Rule tidak boleh mengubah aturan inti MMOS.

---

# Rule Priority

Apabila terjadi konflik, prioritas aturan adalah:

```
ADR

↓

MAS

↓

IMS

↓

Rich Domain Schema

↓

Object Catalog

↓

Capability Catalog

↓

Event Catalog

↓

Custom Rules
```

Aturan dengan prioritas lebih tinggi selalu menjadi acuan.

---

# Related Documents

- `tools/validator/README.md`
- `tools/validator/architecture.md`
- `tools/validator/examples.md`
- `specs/schemas/`
- `docs/architecture/`
- `docs/catalog/`