# CONTRIBUTING

Thank you for your interest in contributing to MMOS (Multimedia Multi-Agent Orchestration System).

MMOS is an architecture-first project. Every contribution should preserve the architectural principles and design decisions that define the platform.

---

# Code of Conduct

Contributors are expected to:

* Be respectful.
* Provide constructive feedback.
* Discuss technical decisions objectively.
* Focus on improving the project.
* Respect documented architecture decisions.

---

# Before Contributing

Before opening a Pull Request, please read:

* README.md
* docs/overview/010-constitution.md
* docs/architecture/*
* Architecture Decision Records (ADR)

Documentation is the primary source of truth.

---

# Contribution Principles

MMOS follows these principles:

* Architecture First
* Documentation Driven
* Contract First
* Provider Agnostic
* Engine Separation
* Backward Compatibility whenever possible

New implementations must follow the published specifications.

---

# Repository Structure

Contributions should be made in the appropriate area.

* `docs/overview` — Project overview and governance.
* `docs/architecture` — MAS architecture documents.
* `docs/catalog` — Object, Capability, and Event catalogs.
* `docs/reference` — Reference architecture, diagrams, deployment, examples, and state machines.
* `docs/interaction` — Engine interaction.
* `specs/ims` — Implementation specifications.
* `specs/schemas` — JSON Schema definitions.
* `adr` — Architecture Decision Records.
* `tools` — Validators, generators, and CLI.

---

# Contribution Workflow

1. Create an Issue.
2. Discuss the proposed change.
3. Create a feature branch.
4. Implement the change.
5. Update documentation if required.
6. Submit a Pull Request.
7. Address review comments.
8. Merge after approval.

---

# Pull Request Requirements

Every Pull Request should:

* solve one logical problem,
* include clear documentation,
* avoid unrelated changes,
* preserve compatibility,
* follow repository conventions.

Large architectural changes require an ADR.

---

# Documentation Standards

Documentation should:

* use clear and consistent terminology,
* follow existing document structure,
* avoid duplicated definitions,
* reference related documents where appropriate.

---

# Coding Standards

Implementation should:

* be modular,
* follow engine boundaries,
* avoid tight coupling,
* remain provider agnostic,
* follow published contracts.

---

# Architecture Changes

Any change affecting:

* Object Model
* Engine responsibilities
* Workflow execution
* Runtime behavior
* Memory model
* Capability contracts
* Event architecture

must be documented through an ADR before implementation.

---

# Issue Reporting

When reporting issues include:

* environment,
* expected behavior,
* actual behavior,
* reproduction steps,
* logs if available.

---

# License

By contributing to MMOS, you agree that your contributions are licensed under the project's license.

Thank you for helping improve MMOS.
