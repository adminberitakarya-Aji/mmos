# MMOS CLI Configuration

**Version:** MMOS v1.0  
**Component:** CLI  
**Status:** Stable

---

# Purpose

Dokumen ini mendefinisikan konfigurasi yang digunakan oleh MMOS CLI.

Konfigurasi memungkinkan developer menyesuaikan perilaku CLI tanpa mengubah implementasi internal maupun source code.

Seluruh konfigurasi hanya berlaku untuk developer tools dan tidak memengaruhi Runtime MMOS.

---

# Objectives

Konfigurasi CLI bertujuan untuk:

- Menyediakan konfigurasi yang konsisten.
- Mendukung berbagai lingkungan pengembangan.
- Mengurangi konfigurasi manual.
- Memudahkan otomatisasi.
- Mendukung integrasi dengan Generator dan Validator.

---

# Configuration Hierarchy

Prioritas konfigurasi adalah sebagai berikut.

```
CLI Arguments

↓

Environment Variables

↓

Project Configuration

↓

User Configuration

↓

Default Configuration
```

Konfigurasi dengan prioritas lebih tinggi akan menggantikan konfigurasi di bawahnya.

---

# Configuration File

Secara default CLI menggunakan file konfigurasi berikut.

```text
mmos.config.yaml
```

Lokasi file:

```text
<project-root>/mmos.config.yaml
```

CLI juga dapat menggunakan file lain melalui opsi:

```text
--config <file>
```

---

# Example Configuration

```yaml
project:

  name: demo-project

generator:

  templates: default

validator:

  enabled: true

output:

  directory: ./output

logging:

  level: info
```

Konfigurasi di atas hanya merupakan contoh struktur.

---

# Configuration Sections

## Project

Konfigurasi project.

Contoh:

```yaml
project:

  name:

  version:

  schemaVersion:
```

---

## Generator

Mengatur perilaku Generator.

Contoh:

```yaml
generator:

  templates:

  overwrite:

  outputDirectory:
```

---

## Validator

Mengatur Validator.

Contoh:

```yaml
validator:

  enabled:

  failOnWarning:

  reportFormat:
```

---

## CLI

Mengatur perilaku CLI.

Contoh:

```yaml
cli:

  interactive:

  color:

  telemetry:
```

---

## Logging

Mengatur output log.

Contoh:

```yaml
logging:

  level:

  timestamps:
```

---

## Output

Mengatur lokasi hasil generation.

Contoh:

```yaml
output:

  directory:

  overwrite:
```

---

# Environment Variables

CLI dapat membaca konfigurasi dari environment variables.

Contoh:

```text
MMOS_CONFIG

MMOS_HOME

MMOS_OUTPUT

MMOS_LOG_LEVEL
```

Environment variables dapat digunakan untuk kebutuhan otomatisasi maupun CI/CD.

---

# CLI Arguments

CLI arguments memiliki prioritas tertinggi.

Contoh:

```text
mmos validate --config custom.yaml
```

```text
mmos generate project --output ./generated
```

```text
mmos validate --verbose
```

---

# Default Configuration

Jika tidak ada konfigurasi yang diberikan, CLI menggunakan nilai bawaan.

Contoh:

| Setting | Default |
|----------|---------|
| Templates | `default` |
| Validator | Enabled |
| Logging | `info` |
| Output Directory | `./output` |
| Interactive Mode | Enabled |

---

# Configuration Validation

Sebelum digunakan, konfigurasi harus divalidasi.

Validasi meliputi:

- struktur konfigurasi;
- tipe data;
- nilai enum;
- referensi template;
- direktori output.

Konfigurasi yang tidak valid harus menghasilkan pesan kesalahan yang jelas.

---

# Configuration Resolution

Urutan pemrosesan konfigurasi.

```
Load Default

↓

Load User Configuration

↓

Load Project Configuration

↓

Load Environment Variables

↓

Apply CLI Arguments

↓

Resolved Configuration
```

Konfigurasi akhir digunakan oleh seluruh komponen CLI.

---

# Security Considerations

File konfigurasi sebaiknya tidak berisi:

- API Key
- Access Token
- Password
- Secret
- Credential

Informasi sensitif sebaiknya disediakan melalui mekanisme secret management atau environment variables yang aman.

---

# Design Principles

Konfigurasi mengikuti prinsip berikut.

## Explicit

Konfigurasi mudah dipahami dan tidak ambigu.

---

## Minimal

Hanya konfigurasi yang benar-benar diperlukan yang disediakan.

---

## Portable

Konfigurasi dapat digunakan di berbagai sistem operasi dan lingkungan.

---

## Deterministic

Konfigurasi yang sama menghasilkan perilaku CLI yang sama.

---

## Provider Agnostic

Konfigurasi tidak bergantung pada AI provider, database, storage, maupun runtime tertentu.

---

# Best Practices

- Simpan konfigurasi project di root repository.
- Gunakan environment variables untuk nilai yang bergantung pada lingkungan.
- Jangan menyimpan informasi sensitif di dalam file konfigurasi.
- Gunakan konfigurasi default jika tidak diperlukan penyesuaian.
- Validasi konfigurasi sebelum menjalankan Generator atau Validator.

---

# Related Documents

- `tools/cli/README.md`
- `tools/cli/commands.md`
- `tools/cli/examples.md`
- `tools/generators/README.md`
- `tools/validator/README.md`
- `docs/architecture/`
- `specs/schemas/`