# Software Requirement Engineering Management System (SREMS)

A **process-aware Requirement Engineering (RE) lifecycle management system** that digitizes and guides the complete RE workflow—from **Inception → Elicitation (QFD/FAST) → Negotiation → Specification (SRS) → Validation → Management**—with **traceability, collaboration, versioning, and automated outputs**.

---

## Repository Short Description (for GitHub “About” section)

**Minor Project:** Process-aware Requirement Engineering Management System supporting QFD/FAST, negotiation workflow, traceability, and automated SRS generation.

---

## Overview

The **Software Requirement Engineering Management System** is an academic + practical tool focused purely on the **Requirement Engineering phase** of SDLC.  
It replaces manual RE activities (documents, spreadsheets, meetings) with a **workflow-driven platform** aligned with standard RE practices and methodologies like:

- **QFD (Quality Function Deployment)**
- **FAST (Facilitated Application Specification Technique)**

Organizations/teams can select their elicitation approach; the tool **does not force a single methodology**, it **supports both**.

---

## Objectives

- End-to-end RE workflow support
- Multi-technique elicitation (QFD / FAST)
- Structured stakeholder collaboration
- Requirement classification + refinement support
- Negotiation & decision transparency
- Requirement traceability across phases
- Version-controlled requirement evolution
- Automated, standardized **SRS generation**

---

## Core Workflow (RE Lifecycle)

### 1) Inception Phase
Captures the foundation of the project:

- **Stakeholder identification**  
  Stakeholders are selected from registered company/client members (via external **Authentication** and **Admin Panel** services).
- **Project purpose / goals**  
  Product Request defined here (initial version: **v1.0**).
- **High-level problem statement**
- Product initialization with versioning

---

### 2) Elicitation Phase (Company-Dependent Choice)
The organization decides the elicitation technique:

1. **QFD (Quality Function Deployment)**
2. **FAST (Facilitated Application Specification Technique)**

The tool provides both workflows and supports execution without enforcing one.

---

### 3) Raw Requirements Collection
Collects requirements in original form:

- Manual entry for small sets (e.g., 10 requirements)
- **CSV/Excel upload** for large sets (e.g., 1000+)
- At this stage:
  - No functional/non-functional classification
  - No priority sorting
  - Only “as-is” requirements capture

---

### 4) Classification (Elaboration Support — QFD Mode)
If **QFD** is selected, raw requirements are passed through a backend algorithm:

- **Keyword-based classification** (ML enhancement optional if time permits)
- Output categories:
  1. Functional Requirements
  2. Non-Functional Requirements
  3. Excited Requirements

Result: three refined lists/columns generated automatically.

---

### 5) Developer Control & Refinement
Analyst/developer can refine system output:

- Manual override available
- Move requirements across categories
- Reorder requirements (priority refinement)

---

## FAST Workflow (When FAST is Selected)

### 6) FAST Setup (Process-Aware)
Creates a FAST meeting setup aligned with FAST theory:

**Phase 1: Setup**
1. Facilitator definition + participant selection  
   - Facilitator details recorded (single authority to manage flow)  
   - Participants selected from registered members  
   - Role-based selection (Developer, Analyst, QA, Domain Expert)
2. Time & schedule finalization  
   - Meeting date/time  
   - Preparation deadline before meeting
3. Agenda, rules & restrictions  
   - Predefined agenda  
   - Rules (equal voice, no domination)  
   - Scope restrictions

---

### Phase 2: Meeting Creation & Notification (Email Automation)
Automated email system sends:

- Facilitator: detailed mail
- Participants: confirmation + schedule + submission deadline + Product Request PDF  
  (PDF generated from latest Product Request version from Inception)

---

### Phase 3: Individual Workspace Creation
Tool generates personal FAST workspaces for each participant.

Participants submit independent lists (to avoid early bias):

- Objects
- Services
- Performance constraints
- Data entities (optional)

Each entry can include a **Mini-Specification**:
- Clarification
- Short description
- Constraints

---

### Phase 4: Lock & Freeze Mechanism
After the submission deadline:

- Editing disabled
- New entries blocked
- All lists locked

---

### Phase 5: Combined List Generation
Tool merges all participant lists:

- Semantic similarity detection to unify duplicates/near-duplicates
- ML-based union logic optional (if time permits)

Example:
- Participant A: Object → Object1
- Participant B: Object → Object2  
Algorithm merges into a unified entity if semantically similar.

---

### Phase 6: Facilitator Review (Decision Authority)
Facilitator classifies each combined entry as:

1. Accepted
2. Rejected
3. Unresolved → Issue

---

### Phase 7: FAST Outputs
Tool produces final FAST result lists:

1. **Consensus List** (final agreed)
2. **Rejection List** (explicitly rejected)
3. **Issue List** (conflicts/unresolved)

---

## 7) Negotiation Meeting Workflow (Process-Aware)

1. **Member selection**  
   Facilitator selects negotiation participants.
2. **Issue list distribution**  
   Email contains negotiation schedule + roles + Issue List.
3. **Meeting scheduling**  
   Date/time + agenda shared.
4. **Voting phase (Hybrid Model)**  
   After negotiation meeting, voting is initiated.

   - Each stakeholder gets fixed points (e.g., 100) to distribute → **Priority Score (P)** on 0–100
   - Trade-off factors (cost, time, risk, complexity) rated 1–5 → normalized → **Trade-off Score (T)** on 0–100
   - Combined using weights (default):  
     - Priority weight = **0.4**  
     - Trade-off weight = **0.6**
   - Final negotiation score computed from weighted combination, then thresholds decide:
     - Accepted
     - Modified / Re-negotiate
     - Rejected

5. **Decision outcome**  
   Tool applies decision rules and moves items to Consensus / Reject lists accordingly.

---

## 8) Specification Phase (Automated SRS Generation)

The tool generates a standardized **Software Requirements Specification (SRS)**:

- Inception outputs map to **Introduction** (purpose, scope, stakeholders, goals)
- Functional requirements sourced from:
  - FAST services / outputs, or
  - QFD-derived structures (depending on selected technique)
- Non-functional requirements:
  - From QFD, or
  - Added explicitly when FAST is used (performance, security, scalability, reliability, etc.)
- External interfaces:
  - Hybrid input model (predefined categories + manual descriptions)
- Output is consistent, clean, and documentation-ready

---

## 9) Validation Phase

Automated checks + stakeholder approval:

- Conflict detection
- Duplication detection
- Ambiguity checks
- Traceability verification (each requirement linked to origin: inception/elicitation/standards)
- Stakeholder review + approval workflow
- Version-controlled updates for transparency

Result: SRS baseline becomes technically correct + stakeholder-approved.

---

## 10) Management Phase (Cycle-Based Requirement Evolution)

After each RE cycle:

- Tool generates and stores:
  - Consensus List
  - Rejection List
  - Issue List
- Admin gets full visibility for every cycle
- Supports cross-cycle comparison:
  - Compare new consensus list with previous cycles
  - Track evolution, changes, and decisions with traceability

---

## Target Users

- Software Analysts
- Developers
- QA Engineers
- Project Managers
- Domain Experts
- Academic Software Engineering project teams

---

## Academic Note

This is a **Minor Project** based on Software Engineering **Requirement Engineering concepts** and demonstrates implementation of:

- Inception
- Elicitation (QFD / FAST)
- Elaboration & classification support
- Negotiation & decision rules
- Specification (SRS generation)
- Validation & traceability
- Requirement management across cycles

---

## License

Developed for academic and educational purposes under Software Engineering coursework and experimentation.