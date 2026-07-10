# MMOS CLI Commands

**Version:** MMOS v1.0  
**Component:** CLI  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan command yang disediakan oleh MMOS CLI.

Command digunakan untuk mengelola project, menghasilkan object, menjalankan validator, serta mengakses informasi pengembangan MMOS.

Seluruh command bersifat developer-oriented dan tidak digunakan oleh Runtime.

---

# Command Structure

Format umum command adalah:

```text
mmos <command> [subcommand] [options]
```

Contoh:

```text
mmos init demo-project

mmos generate workflow

mmos validate

mmos info
```

---

# Global Options

Seluruh command mendukung opsi berikut.

| Option | Description |
|----------|-------------|
| `--help` | Menampilkan bantuan |
| `--version` | Menampilkan versi MMOS CLI |
| `--verbose` | Menampilkan output detail |
| `--quiet` | Menampilkan output minimum |
| `--config <file>` | Menggunakan file konfigurasi tertentu |

---

# Project Commands

## Initialize Project

Membuat project MMOS baru.

```text
mmos init <project-name>
```

Contoh:

```text
mmos init blog-platform
```

Output:

```
Project Created
```

---

## Open Project

Menggunakan project yang sudah ada.

```text
mmos open <directory>
```

Contoh:

```text
mmos open ./demo-project
```

---

## Project Information

Menampilkan informasi project.

```text
mmos info
```

Contoh output:

```
Project Name

Version

Schema Version

Objects

Templates
```

---

# Generator Commands

## Generate Composition

```text
mmos generate composition
```

---

## Generate Workflow

```text
mmos generate workflow
```

---

## Generate Task

```text
mmos generate task
```

---

## Generate Agent

```text
mmos generate agent
```

---

## Generate Capability

```text
mmos generate capability
```

---

## Generate Schema

```text
mmos generate schema
```

---

## Generate Documentation

```text
mmos generate docs
```

---

## Generate Complete Project

```text
mmos generate project
```

---

# Validator Commands

## Validate Entire Project

```text
mmos validate
```

---

## Validate Composition

```text
mmos validate composition
```

---

## Validate Workflow

```text
mmos validate workflow
```

---

## Validate Schema

```text
mmos validate schema
```

---

## Validate Repository

```text
mmos validate repository
```

---

# Template Commands

## List Templates

```text
mmos template list
```

---

## Show Template

```text
mmos template show <name>
```

---

## Validate Template

```text
mmos template validate
```

---

# Configuration Commands

## Show Configuration

```text
mmos config show
```

---

## Set Configuration

```text
mmos config set
```

---

## Reset Configuration

```text
mmos config reset
```

---

# Utility Commands

## Show Version

```text
mmos version
```

---

## Show Help

```text
mmos help
```

---

## List Available Commands

```text
mmos commands
```

---

## Show Environment

```text
mmos doctor
```

Menampilkan informasi lingkungan pengembangan dan membantu mendeteksi konfigurasi yang tidak sesuai.

---

# Output Format

CLI menghasilkan output yang mudah dibaca manusia dan dapat diproses oleh alat otomatis.

Contoh:

```
SUCCESS

Project Generated
```

```
WARNING

Deprecated Template
```

```
ERROR

Workflow Not Found
```

Untuk kebutuhan otomatisasi, implementasi CLI dapat menyediakan format keluaran tambahan seperti JSON tanpa mengubah perilaku command.

---

# Exit Codes

| Code | Meaning |
|------:|---------|
| 0 | Success |
| 1 | Validation Error |
| 2 | Invalid Command |
| 3 | Configuration Error |
| 4 | Internal Error |

---

# Command Naming Rules

Seluruh command mengikuti prinsip berikut.

- Menggunakan kata kerja.
- Konsisten di seluruh CLI.
- Mudah dipahami.
- Tidak bergantung pada provider tertentu.

Contoh:

```
init

generate

validate

config

template

info
```

---

# Typical Development Workflow

```text
mmos init demo-project

↓

mmos generate composition

↓

mmos generate workflow

↓

mmos validate

↓

Ready for Development
```

---

# Design Principles

CLI command mengikuti prinsip berikut.

## Predictable

Perilaku command harus konsisten.

---

## Composable

Command dapat digunakan bersama dalam script atau pipeline.

---

## Idempotent

Command yang aman untuk dijalankan berulang tidak menghasilkan perubahan yang tidak diharapkan.

---

## Script Friendly

Command dapat digunakan pada:

- Shell Script
- CI/CD Pipeline
- Automation
- Build Process

---

# Related Documents

- `tools/cli/README.md`
- `tools/cli/configuration.md`
- `tools/cli/examples.md`
- `tools/generators/README.md`
- `tools/validator/README.md`
- `docs/architecture/`
- `specs/schemas/`