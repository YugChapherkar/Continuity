# CONTINUITY — Spring Boot Backend & RAG Engine

Enterprise backend for CONTINUITY — Digital Handoff & Platform Continuity Management.

## Technology Stack
- **Java 21**
- **Spring Boot 3.3.5**
- **Spring Data JPA & PostgreSQL**
- **Flyway Database Migrations** (V1 Schema, V2 Seed Data, V3 Task Deadlines, V4 Team Roster)
- **Spring Security** (Stateless persona-based identity & role/ownership enforcement)
- **Google Gen AI Java SDK** (`com.google.genai:google-genai`)
- **SpringDoc OpenAPI / Swagger 3**
- **Maven 3.10**

---

## Quickstart

### 1. Configure Environment (Optional)
If using Docker PostgreSQL:
```bash
docker compose up -d
```
By default, the application runs out-of-the-box using the embedded file database (`continuity_db`).

To enable AI summary capabilities:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Run the Backend
```bash
mvn spring-boot:run
```
The REST API starts on `http://localhost:8080`.
- Swagger UI (Interactive API docs): `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health check: `http://localhost:8080/api/health`

### 3. Run Automated Tests
```bash
mvn test
```
Runs 19 automated integration tests covering:
- Task operational deadlines & overdue checks
- Pre-submission handoff completeness scoring (0–100%)
- Snapshot version uploads & diff calculations
- Optimistic locking / concurrent edit conflict protection (409 Conflict)
- Complete handoff signoff and tamper-evident audit ledger entries

---

## 🏛️ System Design & Backend Architecture

### 💡 Core System Design Prompt
> **"Design a resilient, high-concurrency backend service in Java 21 & Spring Boot 3 for managing digital shift rotations and engineering handoffs. The service must calculate real-time handoff completeness scores, generate SHA-256 tamper-evident package hashes, protect concurrent code snapshot uploads using optimistic concurrency control (409 Conflict), track task deadlines with overdue flags, and provide contextual grounded question answering using Gemini RAG over historical decisions."**

### 🧩 Core Backend Services & Design Patterns
1. **`HandoffService`**:
   - Calculates automated completeness scores across 4 weighted dimensions:
     - Executive Briefing depth $\ge 20$ chars (+30%)
     - Completed milestones attached (+25%)
     - Non-empty runbook commands (+25%)
     - Next steps specified (+20%)
   - Generates SHA-256 tree hashes for tamper-evident ledger storage.
2. **`VersionService`**:
   - Implements snapshot diff calculation (`Myers` diff algorithm).
   - Enforces optimistic concurrency via `baseVersionId` validation, rejecting stale edits with `409 Conflict`.
3. **`TaskService`**:
   - Manages workspace tasks and operational deadlines (`LocalDateTime`).
   - Automatically computes `isOverdue` status when `deadline < now()` and task state $\ne$ `Done`.
4. **`RagAssistantService`**:
   - Integrates `com.google.genai:google-genai` SDK to ingest ADRs, handoff packages, and code diffs into grounded answers for incoming engineers.

### 🌐 Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/users` | List active team members & roster |
| `GET` | `/api/projects` | List all workspaces & active versions |
| `POST` | `/api/projects/{id}/versions` | Upload snapshot with optimistic concurrency guard |
| `GET` | `/api/projects/{id}/diff` | Myers diff between two snapshot versions |
| `GET` | `/api/handoffs` | List all handoff dossiers |
| `POST` | `/api/handoffs` | Dispatch verified handoff package (SHA-256 signed) |
| `POST` | `/api/handoffs/{id}/accept` | Signoff and accept primary custodianship |
| `GET` | `/api/tasks` | Workspace tasks with deadlines and overdue status |
| `POST` | `/api/assistant/query` | Gemini RAG query answering across project history |
