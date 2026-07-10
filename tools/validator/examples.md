# Validator Examples

**Version:** MMOS v1.0  
**Component:** Validator  
**Status:** Stable

---

# Purpose

Dokumen ini memberikan contoh penggunaan MMOS Validator pada berbagai object domain.

Seluruh contoh bertujuan menunjukkan bagaimana Validator memverifikasi object sebelum digunakan oleh Runtime.

Validator hanya melakukan validasi dan tidak mengubah object.

---

# Validation Workflow

Proses validasi secara umum adalah sebagai berikut.

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

Validation Report
```

---

# Example 1 — Validate Composition

Input

```yaml
composition:

  id: cmp-blog-001

  name: Blog Generation

  workflow: wf-blog

  version: "1.0"
```

Validation Result

```
PASS

Schema ............. OK

References ......... OK

Relationships ...... OK

Architecture ....... OK

Compatibility ...... OK
```

---

# Example 2 — Missing Required Field

Input

```yaml
composition:

  name: Blog Generation
```

Validation Result

```
FAILED

Error

Missing required field:

id
```

---

# Example 3 — Invalid Workflow Reference

Input

```yaml
composition:

  id: cmp-blog

  workflow: workflow-not-found
```

Validation Result

```
FAILED

Reference Error

Workflow "workflow-not-found" does not exist.
```

---

# Example 4 — Invalid Capability

Input

```yaml
task:

  capability:

    text.magic
```

Validation Result

```
FAILED

Capability Error

Capability "text.magic" is not registered.
```

---

# Example 5 — Invalid Relationship

Input

```
Workflow

└── Workflow
```

Validation Result

```
FAILED

Relationship Error

Workflow cannot own another Workflow.
```

---

# Example 6 — Invalid Lifecycle

Input

```
Completed

↓

Running
```

Validation Result

```
FAILED

Lifecycle Error

Invalid state transition.
```

---

# Example 7 — Deprecated Version

Input

```yaml
schemaVersion:

  "0.8"
```

Validation Result

```
WARNING

Deprecated schema version.

Migration recommended.
```

---

# Example 8 — Unknown Property

Input

```yaml
composition:

  id: cmp-001

  unknownField:

    value
```

Validation Result

```
FAILED

Schema Error

Unknown property:

unknownField
```

---

# Example 9 — Successful Workflow Validation

Input

```
Composition

└── Workflow

      ├── Task

      ├── Task

      └── Task
```

Validation Result

```
PASS

Workflow Structure Valid
```

---

# Example 10 — Complete Project Validation

Objects

```
Project

Composition

Workflow

Task

Agent

Capability

Memory

Artifact

Event
```

Validation Result

```
PASS

Objects Checked : 9

Errors          : 0

Warnings        : 0

Status          : PASS
```

---

# Example Validation Report

```
MMOS Validator Report

--------------------------------

Validation Time

Objects Checked

Passed

Warnings

Errors

--------------------------------

Schema Validation

PASS

Reference Validation

PASS

Relationship Validation

PASS

Lifecycle Validation

PASS

Architecture Validation

PASS

Compatibility Validation

PASS

--------------------------------

Overall Result

PASS
```

---

# Example Error Report

```
MMOS Validator Report

--------------------------------

Overall Result

FAILED

--------------------------------

Errors

• Missing Composition.id

• Workflow reference not found

• Invalid Capability

--------------------------------

Warnings

• Deprecated schema version

--------------------------------
```

---

# CI/CD Example

Validator dijalankan sebelum proses build.

```
Load Repository

↓

Run Validator

↓

Validation Passed?

      │

      ├── No

      │     ↓

      │   Stop Build

      │

      └── Yes

            ↓

        Continue Build
```

---

# Development Workflow Example

```
Developer

↓

Edit Object

↓

Run Validator

↓

Fix Validation Errors

↓

Commit Changes
```

Validator memberikan umpan balik lebih awal sehingga kesalahan dapat diperbaiki sebelum proses integrasi atau deployment.

---

# Best Practices

- Jalankan validator setiap kali object MMOS berubah.
- Validasi seluruh repository sebelum melakukan release.
- Perbaiki seluruh **Error** sebelum melanjutkan proses build.
- Tinjau seluruh **Warning** untuk menjaga kualitas dokumentasi dan spesifikasi.
- Gunakan validator sebagai bagian dari pipeline CI/CD dan proses pengembangan lokal.

---

# Related Documents

- `tools/validator/README.md`
- `tools/validator/architecture.md`
- `tools/validator/rules.md`
- `specs/schemas/`
- `docs/architecture/`
- `docs/catalog/`