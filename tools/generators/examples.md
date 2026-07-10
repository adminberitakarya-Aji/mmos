# Generator Examples

**Version:** MMOS v1.0  
**Component:** Generator  
**Status:** Stable

---

# Purpose

Dokumen ini memberikan contoh penggunaan MMOS Generator untuk menghasilkan object, konfigurasi, dokumentasi, dan struktur project secara otomatis.

Seluruh contoh menggunakan model domain MMOS yang telah didefinisikan pada ADR, MAS, IMS, dan Rich Domain Schema.

Generator hanya menghasilkan artefak. Seluruh hasil generation sebaiknya divalidasi menggunakan MMOS Validator sebelum digunakan.

---

# Generation Workflow

Proses generation secara umum.

```
Generation Request

↓

Template Selection

↓

Generate Objects

↓

Generate Configuration

↓

Generate Documentation

↓

Write Output

↓

Run Validator
```

---

# Example 1 — Create New Project

Input

```
Project Name

MMOS Demo
```

Generated Output

```
mmos-demo/

README.md

docs/

specs/

assets/

tools/
```

Status

```
Generation Completed
```

---

# Example 2 — Generate Composition

Input

```
Composition Type

Blog Generation
```

Generated Output

```yaml
composition:

  id: cmp-blog

  name: Blog Generation

  type: blog

  workflow: wf-blog
```

Status

```
Composition Generated
```

---

# Example 3 — Generate Workflow

Input

```
Workflow Type

News Production
```

Generated Output

```
Research

↓

Verification

↓

Writing

↓

Review

↓

Packaging
```

Status

```
Workflow Generated
```

---

# Example 4 — Generate Agent

Input

```
Agent

Writer Agent
```

Generated Output

```yaml
agent:

  id: writer-agent

  role:

    Writer

  capabilities:

    - text.generate
```

Status

```
Agent Generated
```

---

# Example 5 — Generate Capability

Input

```
Capability

image.generate
```

Generated Output

```yaml
capability:

  name:

    image.generate

  engine:

    AI Image Engine
```

Status

```
Capability Generated
```

---

# Example 6 — Generate Schema

Input

```
Object

Workflow
```

Generated Output

```
workflow.schema.json
```

Status

```
Schema Generated
```

---

# Example 7 — Generate Documentation

Input

```
Project Documentation
```

Generated Output

```
README.md

Architecture.md

Examples.md
```

Status

```
Documentation Generated
```

---

# Example 8 — Generate Complete Project

Input

```
Project

↓

Composition

↓

Workflow

↓

Agents

↓

Documentation
```

Generated Output

```
README.md

docs/

specs/

assets/

tools/

composition.yaml

workflow.yaml

agents.yaml
```

Status

```
Project Generated
```

---

# Example 9 — Generate Example Project

Input

```
Template

Video Production
```

Generated Output

```
Composition

Workflow

Tasks

Agents

Configuration

Documentation
```

Status

```
Example Project Generated
```

---

# Example 10 — Generator + Validator

Generation Pipeline

```
Generator

↓

Generate Project

↓

Validator

↓

Validation Passed?

      │

      ├── No

      │     ↓

      │   Fix Objects

      │

      └── Yes

            ↓

        Ready for Runtime
```

Generator menghasilkan object, sedangkan Validator memastikan seluruh object memenuhi spesifikasi MMOS.

---

# Example Generation Report

```
MMOS Generator Report

--------------------------------

Project

MMOS Demo

--------------------------------

Objects Generated

Composition : 1

Workflow : 1

Tasks : 6

Agents : 4

Capabilities : 6

Schemas : 4

Documents : 8

--------------------------------

Status

SUCCESS
```

---

# Example Error Report

```
MMOS Generator Report

--------------------------------

Status

FAILED

--------------------------------

Reason

Template not found

--------------------------------

Requested Template

video-production

--------------------------------

Suggestion

Verify template availability.
```

---

# Development Workflow Example

```
Developer

↓

Create Generation Request

↓

Run Generator

↓

Review Generated Objects

↓

Run Validator

↓

Commit Changes
```

Generator dan Validator digunakan bersama untuk memastikan struktur project yang dihasilkan tetap konsisten dan valid.

---

# Best Practices

- Gunakan template resmi MMOS.
- Jalankan Validator setelah proses generation selesai.
- Hindari mengubah output generator secara manual sebelum divalidasi.
- Simpan template yang dapat digunakan kembali daripada menduplikasi struktur.
- Pastikan seluruh output tetap konsisten dengan Rich Domain Schema.

---

# Related Documents

- `tools/generators/README.md`
- `tools/generators/architecture.md`
- `tools/generators/templates.md`
- `tools/validator/README.md`
- `tools/cli/README.md`
- `specs/schemas/`
- `docs/architecture/`
- `docs/catalog/`
```