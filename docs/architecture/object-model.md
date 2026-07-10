# MMOS Object Model

Version: Draft v1.0

---

# Purpose

Object Model mendefinisikan hubungan antar object di dalam MMOS.

Dokumen ini melengkapi Object Catalog dengan menjelaskan:

- ownership
- aggregation
- dependency
- cardinality
- lifecycle relationship

Object Model menjadi acuan implementasi database, API, SDK, dan Engine.

---

# Design Principles

1. Project adalah Root Aggregate.
2. Setiap object hanya memiliki satu owner.
3. Tidak ada circular ownership.
4. Business Object bersifat persisten.
5. Runtime Object bersifat sementara.
6. Dependency selalu mengarah ke bawah.
7. Business Layer tidak bergantung pada AI Layer.

---

# Aggregate Hierarchy

Workspace
└── Project
    ├── Composition
    │   ├── Asset
    │   ├── Template
    │   └── Context
    ├── Workflow
    │   ├── Stage
    │   │   └── Task
    │   └── Execution
    │       └── Job
    ├── Memory
    ├── Knowledge
    ├── Billing
    └── Event

---

# Business Ownership

Workspace
owns
0..N Project

Project
owns
0..N Composition

Project
owns
0..N Workflow

Project
owns
0..N Asset

Project
owns
0..N Memory

Project
owns
0..N Knowledge

Project
owns
0..N Execution History

---

# Composition Model

Composition

contains

0..N Asset

uses

0..1 Template

generates

0..N Execution

publishes

0..N Output

---

# Workflow Model

Workflow

contains

1..N Stage

Stage

contains

1..N Task

Task

references

1 Capability

Capability

implemented by

1..N Tool

Tool

executed through

1 Provider

Provider

offers

1..N Model

---

# Runtime Model

Execution

contains

1..N Job

Job

creates

0..N Event

Job

uses

Runtime Context

Job

produces

Output

---

# Knowledge Model

Project

owns

Memory

Project

owns

Knowledge

Execution

reads

Memory

Execution

reads

Knowledge

Execution

creates

Context

Context

lives only during execution.

---

# Asset Model

Project

owns

Asset Collection

Asset Collection

contains

0..N Asset

Asset

contains

0..N Version

---

# Security Model

Organization

owns

Workspace

Workspace

contains

0..N User

User

assigned

0..N Role

Role

contains

0..N Permission

---

# Cardinality

Workspace
1 → N Project

Project
1 → N Composition

Project
1 → N Workflow

Project
1 → N Asset

Workflow
1 → N Stage

Stage
1 → N Task

Execution
1 → N Job

Capability
1 → N Tool

Provider
1 → N Model

Asset
1 → N Version

Organization
1 → N Workspace

Workspace
1 → N User

---

# Dependency Rules

Business
↓

Execution
↓

Capability
↓

Tool
↓

Provider
↓

Model

Dependency tidak boleh mengarah ke atas.

---

# Object Lifetime

Persistent

Workspace
Project
Composition
Workflow
Asset
Knowledge
Memory

Temporary

Execution
Job
Runtime Context
Session
Queue
Cache

---

# Validation Rules

Project wajib memiliki Workspace.

Composition wajib memiliki Project.

Workflow wajib memiliki minimal satu Stage.

Stage wajib memiliki minimal satu Task.

Task wajib mereferensikan Capability.

Capability tidak boleh mereferensikan Business Object.

Runtime Object tidak boleh dimiliki Business Object.

Circular ownership tidak diperbolehkan.

---

# Summary

Project adalah Root Aggregate.

Seluruh Business Object berada di bawah Project.

Workflow adalah blueprint.

Execution adalah runtime.

Capability adalah abstraksi AI.

Provider dapat diganti tanpa mengubah Business Object.