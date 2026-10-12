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
