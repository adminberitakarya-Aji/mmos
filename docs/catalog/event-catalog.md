# MMOS Event Catalog

Version: Draft v1.0  
Document: `reference/event-catalog.md`  
Status: IN PROGRESS (Part 1 of 5)

---

# 1. Purpose

Event Catalog mendefinisikan seluruh Event yang digunakan di dalam MMOS.

Event merupakan mekanisme komunikasi standar antar komponen MMOS dalam arsitektur Event-Driven.

Event digunakan untuk:

- Memberitahukan perubahan state
- Mengoordinasikan proses asynchronous
- Menghubungkan Engine
- Menghubungkan Platform Service
- Mendukung observability
- Mendukung audit trail

Event bukan Business Object.

Event bukan Workflow.

Event merupakan representasi fakta bahwa sesuatu telah terjadi di dalam sistem.

---

# 2. Scope

Dokumen ini mendefinisikan:

- Struktur Event
- Jenis Event
- Klasifikasi Event
- Penamaan Event
- Event Contract
- Event Lifecycle
- Event Registry
- Event Versioning
- Event Routing
- Event Delivery

Dokumen ini tidak mendefinisikan:

- Workflow
- Task
- Capability
- Engine
- Provider
- Model

---

# 3. Architecture Position

Event berada pada Platform Layer.

```
Business

↓

Workflow

↓

Execution

↓

Engine

↓

Event

↓

Platform

↓

Subscriber
```

Event dihasilkan oleh perubahan state.

Event tidak menjalankan proses.

Event hanya menginformasikan bahwa sesuatu telah terjadi.

---

# 4. Event Principles

## EV-001 Event Represents Fact

Event selalu menyatakan fakta.

Contoh

Benar

```
ProjectCreated
```

Salah

```
CreateProject
```

Command menggunakan kata kerja.

Event menggunakan fakta yang telah terjadi.

---

## EV-002 Immutable

Event tidak boleh diubah setelah dipublikasikan.

---

## EV-003 Append Only

Event hanya dapat ditambahkan.

Event tidak boleh diedit.

---

## EV-004 Timestamped

Setiap Event wajib memiliki waktu kejadian.

---

## EV-005 Provider Agnostic

Event tidak boleh bergantung pada Provider AI.

---

## EV-006 Engine Agnostic

Event tidak mengetahui Engine lain.

---

## EV-007 Observable

Seluruh Event dapat dipantau.

---

## EV-008 Replayable

Event dapat diputar ulang apabila diperlukan.

---

## EV-009 Idempotent

Subscriber harus mampu menerima Event yang sama lebih dari sekali.

---

## EV-010 Loosely Coupled

Publisher tidak mengetahui Subscriber.

Subscriber tidak mengetahui Publisher.

---

# 5. Event Classification

MMOS membagi Event menjadi beberapa kategori.

| Category | Description |
|----------|-------------|
| Business | Perubahan Business Object |
| Workflow | Perubahan Workflow |
| Execution | Runtime Execution |
| AI Runtime | AI Runtime Event |
| Asset | Asset Management |
| Template | Template Management |
| Memory | Memory & Knowledge |
| Platform | Platform Service |
| Security | Security |
| Notification | Notification |
| Billing | Billing |
| System | Internal System |

---

# 6. Event Object

Seluruh Event menggunakan struktur yang sama.

| Field | Type | Required | Description |
|------|------|:-------:|-------------|
| id | UUID | ✔ | Event Identifier |
| name | String | ✔ | Event Name |
| category | Enum | ✔ | Event Category |
| version | String | ✔ | Event Version |
| source | String | ✔ | Event Producer |
| timestamp | DateTime | ✔ | Event Time |
| payload | Object | ✔ | Event Payload |
| metadata | Object | Optional | Metadata |
| correlation_id | UUID | Optional | Correlation |
| causation_id | UUID | Optional | Parent Event |

---

# 7. Event Identity

Setiap Event mempunyai nama unik.

Format

```
<Object><PastTense>
```

Contoh

```
ProjectCreated

WorkflowStarted

TaskCompleted

ImageGenerated

VideoRendered

ExecutionFailed
```

Event selalu menggunakan Past Tense.

---

# 8. Business Events

Business Event menunjukkan perubahan Business Object.

## Project

```
ProjectCreated

ProjectUpdated

ProjectArchived

ProjectDeleted
```

---

## Workspace

```
WorkspaceCreated

WorkspaceUpdated

WorkspaceDeleted
```

---

## Composition

```
CompositionCreated

CompositionUpdated

CompositionApproved

CompositionPublished

CompositionArchived

CompositionDeleted
```

---

## Campaign

```
CampaignCreated

CampaignStarted

CampaignPaused

CampaignCompleted

CampaignArchived
```

---

# 9. Workflow Events

Workflow menghasilkan Event berikut.

```
WorkflowCreated

WorkflowUpdated

WorkflowActivated

WorkflowStarted

WorkflowPaused

WorkflowResumed

WorkflowCompleted

WorkflowCancelled

WorkflowFailed
```

---

## Stage Events

```
StageStarted

StageCompleted

StageSkipped

StageFailed
```

---

## Task Events

```
TaskCreated

TaskStarted

TaskCompleted

TaskCancelled

TaskFailed

TaskRetried
```

---

# 10. Execution Events

Execution merupakan Runtime Event.

```
ExecutionCreated

ExecutionQueued

ExecutionStarted

ExecutionProgressUpdated

ExecutionCompleted

ExecutionCancelled

ExecutionFailed

ExecutionTimedOut
```

Execution Event menjadi dasar monitoring Runtime.

---

## Part 1 Summary

Part 1 mendefinisikan fondasi Event Catalog yang terdiri dari:

- Purpose
- Scope
- Architecture Position
- Event Principles
- Event Classification
- Event Object
- Event Identity
- Business Events
- Workflow Events
- Execution Events

---

END OF PART 1/5

Next:

MMOS Event Catalog — Part 2/5

# 11. AI Runtime Events

AI Runtime menghasilkan Event selama proses resolusi Capability dan eksekusi AI.

## Capability Resolution

```
CapabilityResolved

CapabilityResolutionFailed
```

---

## Tool Resolution

```
ToolSelected

ToolSelectionFailed
```

---

## Provider Resolution

```
ProviderSelected

ProviderUnavailable

ProviderFallbackStarted

ProviderFallbackCompleted

ProviderFallbackFailed
```

---

## Model Resolution

```
ModelSelected

ModelChanged

ModelUnavailable
```

---

## Runtime Execution

```
InferenceStarted

InferenceStreaming

InferenceCompleted

InferenceCancelled

InferenceFailed

InferenceTimedOut
```

---

## Response Processing

```
ResponseValidated

ResponseRejected

ResponseCached

ResponseStored
```

---

# 12. Capability Events

Capability menghasilkan Event ketika digunakan oleh Runtime.

```
CapabilityInvoked

CapabilityStarted

CapabilityCompleted

CapabilityFailed

CapabilityRetried

CapabilityTimedOut

CapabilityCancelled
```

Capability Event digunakan untuk:

- Monitoring
- Audit Trail
- Performance Analysis
- Cost Analysis

---

# 13. Asset Events

Asset Event menunjukkan perubahan Asset.

## Asset Lifecycle

```
AssetCreated

AssetUploaded

AssetUpdated

AssetArchived

AssetDeleted
```

---

## Asset Processing

```
AssetValidated

AssetConverted

AssetCompressed

AssetEncrypted

AssetDecrypted

AssetIndexed
```

---

## Image Events

```
ImageGenerated

ImageEdited

ImageUpscaled

ImageResized

ImageCropped

BackgroundRemoved

ThumbnailGenerated
```

---

## Video Events

```
VideoGenerated

VideoEdited

VideoMerged

VideoRendered

VideoConverted

SubtitleGenerated

FrameExtracted
```

---

## Audio Events

```
AudioGenerated

AudioTranscribed

AudioTranslated

AudioEnhanced

VoiceCloned
```

---

## Document Events

```
DocumentGenerated

DocumentParsed

DocumentConverted

DocumentValidated

OCRCompleted
```

---

# 14. Template Events

Template merupakan Business Asset.

```
TemplateCreated

TemplateUpdated

TemplateValidated

TemplatePublished

TemplateArchived

TemplateDeleted
```

---

## Template Version

```
TemplateVersionCreated

TemplateVersionActivated

TemplateVersionDeprecated
```

---

# 15. Memory Events

Memory Event digunakan oleh Memory Engine.

```
MemoryStored

MemoryUpdated

MemoryDeleted

MemoryRetrieved

MemoryExpired
```

---

## Knowledge Events

```
KnowledgeIndexed

KnowledgeUpdated

KnowledgeRemoved

KnowledgeRetrieved

KnowledgeEmbedded
```

---

## Context Events

```
ContextBuilt

ContextExpanded

ContextMerged

ContextExpired
```

---

# 16. Search Events

Search menghasilkan Event berikut.

```
SearchStarted

SearchCompleted

SearchCancelled

SearchFailed
```

---

## Semantic Search

```
SemanticSearchCompleted

VectorSearchCompleted

KnowledgeSearchCompleted

AssetSearchCompleted
```

---

# 17. Platform Events

Platform Event berasal dari komponen Platform.

## User

```
UserCreated

UserUpdated

UserDeleted

UserActivated

UserSuspended
```

---

## Organization

```
OrganizationCreated

OrganizationUpdated

OrganizationDeleted
```

---

## Workspace

```
WorkspaceMemberAdded

WorkspaceMemberRemoved

WorkspaceRoleChanged
```

---

## API

```
ApiKeyCreated

ApiKeyRevoked

ApiRequestReceived

ApiRequestCompleted

ApiRequestRejected
```

---

## SDK

```
SDKConnected

SDKDisconnected

SDKUpdated
```

---

## Plugin

```
PluginInstalled

PluginUpdated

PluginEnabled

PluginDisabled

PluginRemoved
```

---

# 18. Notification Events

Notification menggunakan Event terpisah agar tidak bergantung pada Workflow.

```
NotificationQueued

NotificationSent

NotificationDelivered

NotificationRead

NotificationFailed
```

---

## Email

```
EmailQueued

EmailSent

EmailDelivered

EmailFailed
```

---

## Push Notification

```
PushNotificationQueued

PushNotificationSent

PushNotificationDelivered

PushNotificationFailed
```

---

## Webhook

```
WebhookTriggered

WebhookDelivered

WebhookFailed
```

---

# 19. Billing Events

Billing Event digunakan oleh Platform.

```
SubscriptionCreated

SubscriptionUpdated

SubscriptionCancelled

InvoiceCreated

InvoicePaid

InvoiceFailed

CreditPurchased

CreditConsumed

RefundProcessed
```

---

# 20. Security Events

Security menghasilkan Event berikut.

```
AuthenticationSucceeded

AuthenticationFailed

AuthorizationFailed

PermissionGranted

PermissionRevoked

AccessDenied

SecurityViolationDetected

SecurityAlertRaised
```

---

## Audit Events

```
AuditRecorded

AuditExported

AuditArchived
```

---

## Part 2 Summary

Part 2 mendefinisikan kategori Event operasional yang digunakan oleh AI Runtime dan Platform, meliputi:

- AI Runtime Events
- Capability Events
- Asset Events
- Template Events
- Memory Events
- Search Events
- Platform Events
- Notification Events
- Billing Events
- Security Events

Seluruh Event pada bagian ini mengikuti prinsip **immutable**, **append-only**, dan **provider agnostic** yang telah didefinisikan pada Part 1.

---

END OF PART 2/5

Next:

MMOS Event Catalog — Part 3/5

# 21. Event Contract

Seluruh Event pada MMOS harus mengikuti kontrak (contract) yang konsisten sehingga dapat diproses oleh seluruh Engine, Runtime, SDK, Plugin, maupun API.

## Required Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique Event Identifier |
| name | String | Event Name |
| category | Enum | Event Category |
| version | String | Event Version |
| source | String | Event Producer |
| timestamp | DateTime | Event Timestamp |
| payload | Object | Event Payload |

---

## Optional Fields

| Field | Description |
|--------|-------------|
| metadata | Additional Metadata |
| correlation_id | Correlation Identifier |
| causation_id | Parent Event Identifier |
| tenant_id | Multi Tenant Identifier |
| project_id | Project Identifier |
| workflow_id | Workflow Identifier |
| execution_id | Execution Identifier |
| user_id | User Identifier |

---

# 22. Event Payload

Payload berisi informasi utama dari Event.

Contoh

```json
{
  "id":"evt_001",
  "name":"WorkflowCompleted",
  "timestamp":"2026-07-09T09:30:00Z",
  "payload":{
      "workflow_id":"wf_100",
      "duration":135,
      "status":"completed"
  }
}
```

Payload hanya berisi data yang diperlukan oleh Subscriber.

Payload tidak boleh berisi objek internal Runtime.

---

# 23. Event Metadata

Metadata digunakan untuk kebutuhan observability.

Contoh metadata.

```json
{
    "trace_id":"...",
    "request_id":"...",
    "tenant_id":"...",
    "environment":"production",
    "region":"ap-southeast-1",
    "runtime_version":"1.0.0"
}
```

Metadata bersifat opsional.

---

# 24. Correlation & Causation

MMOS mendukung pelacakan Event menggunakan dua identifier.

## Correlation ID

Correlation ID digunakan untuk menghubungkan seluruh Event yang berasal dari satu proses bisnis.

Contoh

```
ProjectCreated

↓

WorkflowStarted

↓

ExecutionStarted

↓

ExecutionCompleted
```

Seluruh Event di atas memiliki Correlation ID yang sama.

---

## Causation ID

Causation ID menunjukkan Event penyebab.

Contoh

```
WorkflowStarted

↓

TaskStarted

↓

CapabilityInvoked

↓

InferenceStarted
```

Setiap Event menyimpan ID Event sebelumnya.

---

# 25. Event Lifecycle

Lifecycle Event.

```
Created

↓

Published

↓

Delivered

↓

Processed

↓

Archived

↓

Expired
```

---

## Created

Event baru dibuat.

---

## Published

Event dipublikasikan ke Event Bus.

---

## Delivered

Event diterima Subscriber.

---

## Processed

Subscriber selesai memproses Event.

---

## Archived

Event dipindahkan ke penyimpanan arsip.

---

## Expired

Retention Event telah berakhir.

---

# 26. Event Delivery

MMOS mendukung beberapa metode pengiriman Event.

| Delivery Mode | Description |
|---------------|-------------|
| Fire and Forget | Publisher tidak menunggu respons |
| At Least Once | Event minimal diterima sekali |
| At Most Once | Event dikirim maksimal sekali |
| Exactly Once* | Didukung apabila Platform mendukung |

\*Exactly Once bergantung pada implementasi Platform.

---

# 27. Event Ordering

Ordering diperlukan untuk Event tertentu.

MMOS mendukung:

- Ordered per Aggregate
- Ordered per Execution
- Ordered per Workflow

Contoh

```
WorkflowStarted

↓

StageStarted

↓

TaskStarted

↓

TaskCompleted

↓

StageCompleted

↓

WorkflowCompleted
```

Urutan tersebut harus dipertahankan.

---

# 28. Event Routing

Routing dilakukan berdasarkan kategori Event.

```
Business Event

↓

Business Subscriber
```

```
Execution Event

↓

Monitoring Engine
```

```
Asset Event

↓

Asset Service
```

```
Billing Event

↓

Billing Service
```

Routing dilakukan oleh Event Bus.

Publisher tidak mengetahui Subscriber.

---

# 29. Event Subscription

Subscriber dapat berlangganan berdasarkan.

- Category
- Event Name
- Wildcard
- Aggregate
- Workflow
- Project
- Tenant

Contoh

```
Workflow.*

Execution.*

Asset.*

Notification.*
```

---

# 30. Event Filtering

Subscriber dapat memfilter Event berdasarkan.

- Tenant
- Workspace
- User
- Project
- Workflow
- Category
- Event Name
- Metadata

Filtering dilakukan sebelum Event diproses.

---

# 31. Event Retry

Retry dilakukan apabila Subscriber gagal memproses Event.

Retry Policy.

- Immediate
- Fixed Interval
- Exponential Backoff
- Manual Retry

Retry tidak boleh menghasilkan Event duplikat yang memengaruhi Business State.

---

# 32. Dead Letter Queue

Event yang gagal diproses setelah retry maksimum dipindahkan ke Dead Letter Queue (DLQ).

```
Event

↓

Retry

↓

Retry

↓

Retry

↓

Dead Letter Queue
```

DLQ digunakan untuk.

- Investigation
- Recovery
- Manual Replay

---

# 33. Event Replay

MMOS mendukung Event Replay.

Replay digunakan untuk.

- Rebuild Projection
- Restore Read Model
- Debugging
- Disaster Recovery

Replay tidak boleh mengubah isi Event.

---

# 34. Event Idempotency

Subscriber harus mampu menerima Event yang sama lebih dari satu kali.

Contoh.

```
InvoicePaid
```

Apabila Event dikirim ulang.

Subscriber tidak boleh membuat Invoice kedua.

---

# 35. Event Retention

Retention ditentukan oleh Platform Policy.

Contoh.

| Category | Retention |
|----------|-----------|
| Business | 7 Tahun |
| Audit | 10 Tahun |
| Runtime | 90 Hari |
| Notification | 30 Hari |
| Monitoring | 30 Hari |

Platform dapat mengubah Retention sesuai kebijakan organisasi.

---

# 36. Event Security

Seluruh Event mengikuti kebijakan keamanan MMOS.

Minimal meliputi.

- Authentication
- Authorization
- Encryption in Transit
- Encryption at Rest
- Audit Logging
- Access Control

Event tidak boleh membawa Secret, Password, API Key, atau Credential dalam Payload.

---

# 37. Event Observability

Seluruh Event harus dapat diamati.

Data minimal.

- Event ID
- Event Name
- Timestamp
- Producer
- Subscriber
- Processing Time
- Retry Count
- Delivery Status

Observability digunakan untuk monitoring dan troubleshooting.

---

# 38. Event Performance Guidelines

Target performa Event Bus.

| Metric | Target |
|---------|-------:|
| Publish Latency | < 100 ms |
| Delivery Latency | < 500 ms |
| Retry Latency | Configurable |
| Event Throughput | Platform Dependent |

Target dapat berubah sesuai implementasi Platform.

---

## Part 3 Summary

Part 3 mendefinisikan spesifikasi teknis Event, meliputi:

- Event Contract
- Event Payload
- Metadata
- Correlation & Causation
- Event Lifecycle
- Delivery
- Ordering
- Routing
- Subscription
- Filtering
- Retry
- Dead Letter Queue
- Replay
- Idempotency
- Retention
- Security
- Observability
- Performance Guidelines

Bagian ini menjadi fondasi implementasi arsitektur **Event-Driven** pada MMOS.

---

END OF PART 3/5

Next:

MMOS Event Catalog — Part 4/5

# 39. Event Versioning

Seluruh Event menggunakan **Semantic Versioning**.

Format:

```
MAJOR.MINOR.PATCH
```

Contoh:

```
1.0.0
1.1.0
2.0.0
```

---

## MAJOR Version

Digunakan apabila terjadi perubahan yang **tidak kompatibel (breaking change)**.

Contoh:

- Payload berubah
- Nama field berubah
- Struktur Event berubah
- Kontrak berubah

---

## MINOR Version

Digunakan apabila terdapat penambahan yang tetap kompatibel.

Contoh:

- Penambahan field optional
- Penambahan metadata
- Penambahan category baru

---

## PATCH Version

Digunakan untuk:

- Perbaikan dokumentasi
- Koreksi typo
- Perbaikan definisi tanpa mengubah kontrak

---

# 40. Event Registry

Seluruh Event harus terdaftar di Event Registry.

Event Registry merupakan sumber resmi (Single Source of Truth) seluruh Event yang tersedia di MMOS.

## Registry Information

Minimal berisi:

| Field | Description |
|--------|-------------|
| Event ID | Unique Identifier |
| Event Name | Nama Event |
| Category | Kategori |
| Version | Versi |
| Status | Status |
| Producer | Event Producer |
| Subscribers | Subscriber |
| Payload Schema | Skema Payload |
| Documentation | Dokumentasi |

---

# 41. Event Discovery

Platform dapat menemukan Event berdasarkan:

- Event ID
- Event Name
- Category
- Producer
- Subscriber
- Version
- Tags

Discovery dilakukan melalui Event Registry.

---

# 42. Event Naming Convention

Seluruh Event mengikuti pola berikut.

## Aggregate Events

```
<Object><PastTense>
```

Contoh:

```
ProjectCreated

ProjectUpdated

ProjectDeleted
```

---

## Workflow Events

```
WorkflowStarted

WorkflowCompleted

WorkflowCancelled
```

---

## Execution Events

```
ExecutionQueued

ExecutionStarted

ExecutionCompleted

ExecutionFailed
```

---

## Runtime Events

```
CapabilityInvoked

InferenceStarted

ProviderSelected

ModelSelected
```

---

## Asset Events

```
ImageGenerated

VideoRendered

AudioEnhanced

DocumentConverted
```

---

# 43. Reserved Event Verbs

MMOS menggunakan daftar kata kerja baku.

```
Created

Updated

Deleted

Started

Completed

Failed

Cancelled

Paused

Resumed

Queued

Validated

Generated

Rendered

Converted

Uploaded

Downloaded

Stored

Retrieved

Indexed

Published

Archived

Activated

Deactivated

Approved

Rejected

Expired
```

Tidak diperbolehkan menggunakan sinonim berbeda.

Contoh:

Benar

```
ProjectCreated
```

Salah

```
ProjectAdded

ProjectMade

ProjectInserted
```

---

# 44. Event Dependency Rules

Event memiliki dependency satu arah.

```
Business

↓

Workflow

↓

Execution

↓

Capability

↓

Runtime

↓

Platform
```

Event tidak boleh memiliki dependency melingkar (Circular Dependency).

Contoh yang salah.

```
WorkflowStarted

↓

ExecutionStarted

↓

WorkflowStarted
```

---

# 45. Event Processing Rules

Subscriber harus mengikuti aturan berikut.

## Rule 1

Tidak mengubah isi Event.

---

## Rule 2

Tidak mengirim kembali Event yang sama.

---

## Rule 3

Harus bersifat Idempotent.

---

## Rule 4

Apabila gagal harus mengembalikan status gagal.

---

## Rule 5

Tidak boleh melakukan blocking terhadap Publisher.

---

## Rule 6

Harus menghasilkan log observability.

---

# 46. Event Bus Requirements

Platform Event Bus minimal mendukung:

- Publish
- Subscribe
- Retry
- Dead Letter Queue
- Replay
- Ordering
- Filtering
- Monitoring
- Metrics
- Security

Implementasi Event Bus dapat berupa:

- Kafka
- RabbitMQ
- NATS
- Google Pub/Sub
- Azure Event Grid
- AWS EventBridge
- Implementasi internal MMOS

Event Catalog tidak bergantung pada implementasi tertentu.

---

# 47. Event Bus Architecture

```
Publisher

↓

Event Bus

↓

Topic

↓

Subscription

↓

Subscriber
```

Publisher hanya mengetahui Event Bus.

Subscriber hanya mengetahui Subscription.

Publisher tidak mengetahui Subscriber.

---

# 48. Event Topics

Topik direkomendasikan mengikuti kategori Event.

```
business.*

workflow.*

execution.*

runtime.*

asset.*

memory.*

knowledge.*

platform.*

notification.*

billing.*

security.*

system.*
```

Contoh:

```
workflow.started

workflow.completed

execution.failed

asset.image.generated

billing.invoice.created
```

---

# 49. Event Categories Matrix

| Category | Producer | Typical Subscriber |
|----------|----------|--------------------|
| Business | Business Service | Workflow Engine |
| Workflow | Workflow Engine | Execution Engine |
| Execution | Execution Engine | Runtime Monitor |
| Runtime | AI Runtime | Monitoring |
| Asset | Asset Service | Media Engine |
| Template | Template Service | Workflow Engine |
| Memory | Memory Engine | AI Runtime |
| Knowledge | Knowledge Engine | AI Runtime |
| Platform | Platform Service | Admin Service |
| Notification | Notification Service | Email/Push Gateway |
| Billing | Billing Service | Finance Service |
| Security | Security Service | Audit Service |

---

# 50. Event Governance

Penambahan Event baru harus memenuhi persyaratan berikut.

- Memiliki Business Justification
- Tidak menduplikasi Event lain
- Mengikuti Naming Convention
- Memiliki Payload Schema
- Memiliki Documentation
- Memiliki Version
- Memiliki Owner
- Direview Architecture Board

---

## Perubahan Event

Perubahan Event harus:

- Menggunakan Semantic Versioning
- Menjaga Backward Compatibility
- Didokumentasikan
- Direview sebelum dirilis

---

## Penghapusan Event

Event tidak boleh langsung dihapus.

Urutan yang benar.

```
Active

↓

Deprecated

↓

Retired
```

---

# 51. Event Documentation Requirements

Setiap Event wajib memiliki dokumentasi minimum.

- Purpose
- Description
- Producer
- Subscriber
- Payload
- Version
- Category
- Lifecycle
- Error Handling
- Example
- Version History

Event tanpa dokumentasi tidak boleh digunakan pada Production.

---

# 52. Event Best Practices

Gunakan Event untuk merepresentasikan fakta.

Gunakan nama yang jelas.

Jangan memasukkan logika bisnis ke dalam Event.

Jangan menyimpan informasi sensitif.

Jangan mengubah Event setelah dipublikasikan.

Gunakan Payload sekecil mungkin.

Gunakan Correlation ID untuk pelacakan.

Gunakan Causation ID untuk mengetahui hubungan antar Event.

Dokumentasikan seluruh Event.

---

## Part 4 Summary

Part 4 mendefinisikan aspek tata kelola dan standar implementasi Event, meliputi:

- Event Versioning
- Event Registry
- Event Discovery
- Naming Convention
- Reserved Verbs
- Dependency Rules
- Processing Rules
- Event Bus
- Event Topics
- Event Categories Matrix
- Event Governance
- Documentation Requirements
- Best Practices

Bagian ini memastikan seluruh Event pada MMOS memiliki standar yang konsisten, mudah ditemukan, mudah dipantau, dan tetap kompatibel seiring evolusi platform.

---

END OF PART 4/5

Next:

MMOS Event Catalog — Part 5/5 (Final)

# 53. Event Error Model

Seluruh Event yang berhubungan dengan kegagalan harus mengikuti Error Model MMOS.

## Error Event Structure

| Field | Description |
|--------|-------------|
| event_id | Event Identifier |
| error_code | Standard Error Code |
| error_category | Error Category |
| message | Human Readable Message |
| retryable | Retry Recommendation |
| timestamp | Error Time |

---

## Standard Error Categories

| Category | Description |
|----------|-------------|
| Validation | Data tidak valid |
| Authentication | Autentikasi gagal |
| Authorization | Otorisasi gagal |
| Network | Gangguan jaringan |
| Timeout | Timeout |
| Runtime | Runtime Error |
| Provider | Provider Error |
| Storage | Storage Error |
| Internal | Internal Error |
| Unknown | Unknown Error |

---

## Standard Failure Events

```
WorkflowFailed

StageFailed

TaskFailed

ExecutionFailed

CapabilityFailed

InferenceFailed

ProviderUnavailable

ProviderFallbackFailed

NotificationFailed

WebhookFailed

InvoiceFailed

AuthenticationFailed

AuthorizationFailed
```

Failure Event harus tetap mengikuti Event Contract.

---

# 54. Event Audit

Seluruh Event dapat menjadi bagian dari Audit Trail.

Audit minimal menyimpan informasi berikut.

| Field | Description |
|--------|-------------|
| Event ID | Unique Identifier |
| Event Name | Nama Event |
| Producer | Penghasil Event |
| Timestamp | Waktu |
| User | User (jika ada) |
| Tenant | Tenant |
| Correlation ID | Korelasi |
| Causation ID | Penyebab |

Audit Event tidak boleh dimodifikasi setelah disimpan.

---

# 55. Event Monitoring

Platform harus mampu memonitor seluruh Event.

Minimal metrik yang dicatat.

- Publish Rate
- Delivery Rate
- Success Rate
- Failure Rate
- Retry Count
- Processing Time
- Queue Length
- Dead Letter Count
- Replay Count

Monitoring digunakan oleh Platform Operations.

---

# 56. Event Metrics

MMOS mendefinisikan metrik standar.

| Metric | Description |
|---------|-------------|
| Total Published | Jumlah Event dipublikasikan |
| Total Delivered | Jumlah Event diterima |
| Total Processed | Jumlah Event diproses |
| Total Failed | Jumlah Event gagal |
| Average Latency | Rata-rata waktu pengiriman |
| Retry Count | Jumlah Retry |
| DLQ Count | Jumlah Dead Letter Queue |
| Replay Count | Jumlah Replay |

---

# 57. Event Examples

## Example 1 — Project Creation

```
ProjectCreated

↓

WorkflowStarted

↓

ExecutionStarted

↓

ExecutionCompleted
```

---

## Example 2 — AI Image Generation

```
TaskStarted

↓

CapabilityInvoked

↓

ProviderSelected

↓

ModelSelected

↓

InferenceStarted

↓

ImageGenerated

↓

InferenceCompleted

↓

TaskCompleted
```

---

## Example 3 — Provider Fallback

```
CapabilityInvoked

↓

ProviderSelected

↓

ProviderUnavailable

↓

ProviderFallbackStarted

↓

ProviderSelected

↓

InferenceStarted

↓

InferenceCompleted
```

Workflow tidak mengetahui proses fallback.

---

## Example 4 — Video Rendering

```
VideoRenderingStarted

↓

FrameGenerated

↓

AudioMerged

↓

SubtitleGenerated

↓

VideoRendered

↓

ExecutionCompleted
```

---

## Example 5 — Notification

```
ExecutionCompleted

↓

NotificationQueued

↓

NotificationSent

↓

NotificationDelivered
```

---

# 58. Cross Reference

Event Catalog berhubungan dengan dokumen MMOS berikut.

| Document | Relationship |
|----------|--------------|
| Object Catalog | Event merupakan salah satu Object Platform |
| Object Model | Menjelaskan relasi Event dengan Object lain |
| Capability Catalog | Capability menghasilkan Event |
| MAS-200 Execution Model | Execution menghasilkan Execution Event |
| MAS-300 Engine Architecture | Engine mempublikasikan Event |
| MAS-400 Orchestrator | Orchestrator mengoordinasikan Event Flow |
| MAS-500 Memory & Knowledge | Memory menghasilkan Memory Event |
| MAS-700 AI Runtime | Runtime menghasilkan AI Runtime Event |

---

# 59. Architecture Summary

Event merupakan mekanisme komunikasi utama antar komponen MMOS.

```
Business Layer

↓

Execution Layer

↓

Capability

↓

AI Runtime

↓

Platform Event Bus

↓

Subscribers
```

Karakteristik utama Event.

- Immutable
- Append Only
- Observable
- Replayable
- Idempotent
- Versioned
- Provider Agnostic
- Engine Agnostic

---

# 60. Event Design Rules

Seluruh Event MMOS wajib mengikuti aturan berikut.

## Rule 1

Event selalu merepresentasikan fakta yang telah terjadi.

---

## Rule 2

Nama Event menggunakan Past Tense.

---

## Rule 3

Event tidak boleh diubah setelah dipublikasikan.

---

## Rule 4

Event tidak mengandung logika bisnis.

---

## Rule 5

Event tidak bergantung pada Provider.

---

## Rule 6

Publisher tidak mengetahui Subscriber.

---

## Rule 7

Subscriber harus Idempotent.

---

## Rule 8

Event harus dapat direplay.

---

## Rule 9

Event harus memiliki Schema yang stabil.

---

## Rule 10

Event harus terdokumentasi.

---

# 61. Key Principles

Event Catalog dibangun berdasarkan prinsip berikut.

1. Event Represents Fact.
2. Immutable.
3. Append Only.
4. Timestamped.
5. Observable.
6. Replayable.
7. Idempotent.
8. Loosely Coupled.
9. Provider Agnostic.
10. Engine Agnostic.

Prinsip-prinsip tersebut menjadi dasar seluruh implementasi Event pada MMOS.

---

# 62. Glossary

| Term | Definition |
|------|------------|
| Event | Fakta bahwa sesuatu telah terjadi |
| Publisher | Komponen yang menghasilkan Event |
| Subscriber | Komponen yang menerima Event |
| Event Bus | Infrastruktur distribusi Event |
| Topic | Kanal distribusi Event |
| Payload | Informasi utama Event |
| Correlation ID | Penghubung seluruh Event dalam satu proses |
| Causation ID | Penunjuk Event penyebab |
| Replay | Menjalankan ulang Event yang telah tersimpan |
| Dead Letter Queue | Penyimpanan Event yang gagal diproses |

---

# 63. Document Summary

Event Catalog mendefinisikan seluruh Event standar yang digunakan di MMOS.

Dokumen ini menjadi acuan bagi:

- Platform Developer
- Engine Developer
- Workflow Developer
- Runtime Developer
- SDK Developer
- Plugin Developer
- API Developer
- QA Engineer
- Architecture Reviewer
- DevOps Engineer

Event menjadi fondasi komunikasi antar komponen dalam arsitektur Event-Driven MMOS sehingga setiap perubahan state dapat dipublikasikan, diamati, diaudit, dan diproses secara konsisten.

---

# Document Status

Document

```
reference/event-catalog.md
```

Version

```
Draft v1.0
```

Status

```
COMPLETE
```

Review Status

```
Ready for Architecture Review
```

Dependencies

- Object Catalog
- Object Model
- Capability Catalog
- MAS-200 Execution Model
- MAS-300 Engine Architecture
- MAS-400 Orchestrator
- MAS-700 AI Runtime

Next Document

```
reference/engine-interaction.md
```

---

END OF DOCUMENT

MMOS Event Catalog

**Status: COMPLETE**

MMOS v1.0 Specification