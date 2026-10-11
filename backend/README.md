# CONTINUITY — Spring Boot Backend & RAG Engine

Enterprise backend for CONTINUITY — Digital Handoff & Platform Continuity Management.

## Technology Stack
- **Java 21**
- **Spring Boot 3.3.5**
- **Spring Data JPA & PostgreSQL**
- **Flyway Database Migrations** (V1 Schema, V2 Baseline Seed)
- **Spring Security** (Stateless persona-based identity & role/ownership enforcement)
- **Google Gen AI Java SDK** (`com.google.genai:google-genai`)
- **SpringDoc OpenAPI / Swagger 3**
- **Maven 3.10**

---

## Quickstart

### 1. Start PostgreSQL (Docker)
```bash
cd backend
docker compose up -d
```

### 2. Configure Environment
Copy `.env.example` or export environment variables:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run the Backend
```bash
mvn spring-boot:run
```
The REST API starts on `http://localhost:8080`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health check: `http://localhost:8080/api/health`

### 4. Run Automated Tests
```bash
mvn test
```
Runs 15 automated integration tests including snapshot uploads, diff calculations, optimistic concurrency / stale base version conflict checks (409 Conflict), handoff lifecycle, and grounded RAG citations.
