# MMOS CLI Examples

**Version:** MMOS v1.0  
**Component:** CLI  
**Status:** Stable

---

# Purpose

Dokumen ini memberikan contoh penggunaan MMOS CLI pada berbagai aktivitas pengembangan.

Seluruh contoh menggunakan command yang didefinisikan pada `commands.md` dan mengikuti arsitektur MMOS v1.0.

Contoh-contoh berikut bersifat ilustratif dan tidak bergantung pada implementasi CLI tertentu.

---

# Development Workflow

Alur kerja yang direkomendasikan.

```
Initialize Project

↓

Generate Objects

↓

Validate Project

↓

Fix Issues

↓

Ready for Development
```

---

# Example 1 — Create a New Project

Command

```text
mmos init blog-platform
```

Output

```text
✔ Project created

blog-platform/

├── docs/

├── specs/

├── assets/

├── tools/

├── README.md

└── mmos.config.yaml
```

---

# Example 2 — Display Project Information

Command

```text
mmos info
```

Output

```text
Project

Name            : blog-platform

Version         : 1.0

Schema Version  : 1.0

Objects         : 12

Status          : Ready
```

---

# Example 3 — Generate a Composition

Command

```text
mmos generate composition
```

Output

```text
✔ Composition generated

Name

Blog Generation
```

---

# Example 4 — Generate a Workflow

Command

```text
mmos generate workflow
```

Output

```text
✔ Workflow generated

Research

↓

Planning

↓

Writing

↓

Review

↓

Publish
```

---

# Example 5 — Generate an Agent

Command

```text
mmos generate agent
```

Output

```text
✔ Agent generated

Writer Agent
```

---

# Example 6 — Validate the Project

Command

```text
mmos validate
```

Output

```text
Validation Summary

Objects Checked : 24

Errors          : 0

Warnings        : 0

Status          : PASS
```

---

# Example 7 — Validate a Workflow

Command

```text
mmos validate workflow
```

Output

```text
Workflow Validation

Schema        PASS

References    PASS

Relationships PASS

Status        PASS
```

---

# Example 8 — List Available Templates

Command

```text
mmos template list
```

Output

```text
Available Templates

• Blog Generation

• News Production

• Social Media

• Video Production

• Multimodal Content
```

---

# Example 9 — Show Configuration

Command

```text
mmos config show
```

Output

```yaml
project:

  name: blog-platform

generator:

  templates: default

validator:

  enabled: true

logging:

  level: info
```

---

# Example 10 — Use a Custom Configuration

Command

```text
mmos validate --config custom.yaml
```

Output

```text
Using configuration

custom.yaml

Validation completed

PASS
```

---

# Example 11 — Verbose Output

Command

```text
mmos validate --verbose
```

Output

```text
Loading configuration...

Loading schemas...

Checking references...

Checking relationships...

Checking architecture rules...

Generating report...

PASS
```

---

# Example 12 — Validation Failure

Command

```text
mmos validate
```

Output

```text
FAILED

Errors

• Missing Composition.id

• Workflow reference not found

• Invalid Capability
```

---

# Example 13 — Invalid Command

Command

```text
mmos generate magic
```

Output

```text
ERROR

Unknown command:

generate magic

Use:

mmos help
```

---

# Example 14 — Development Pipeline

```text
Developer

↓

mmos init

↓

mmos generate

↓

mmos validate

↓

Commit

↓

CI/CD
```

---

# Example 15 — CI/CD Pipeline

```text
Checkout Repository

↓

mmos validate

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

# Example 16 — Complete Project Bootstrap

Commands

```text
mmos init demo-project

mmos generate composition

mmos generate workflow

mmos generate agent

mmos validate
```

Result

```text
✔ Project initialized

✔ Composition generated

✔ Workflow generated

✔ Agent generated

✔ Validation passed

Project ready for development
```

---

# Best Practices

- Inisialisasi project menggunakan `mmos init`.
- Gunakan Generator untuk membuat object baru.
- Jalankan Validator sebelum melakukan commit.
- Perbaiki seluruh **Error** sebelum melanjutkan pengembangan.
- Integrasikan CLI ke dalam pipeline CI/CD.
- Gunakan file konfigurasi project agar seluruh anggota tim menggunakan konfigurasi yang sama.

---

# Related Documents

- `tools/cli/README.md`
- `tools/cli/commands.md`
- `tools/cli/configuration.md`
- `tools/generators/README.md`
- `tools/validator/README.md`
- `docs/architecture/`
- `specs/schemas/`
```