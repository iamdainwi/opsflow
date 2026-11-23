# Software Requirements Specification (SRS) — OpsFlow

**Project Name:** OpsFlow — Enterprise Service Request & Approval Workflow System  
**Tech Stack:** NestJS, TypeScript, Next.js (Optional Web Client), PostgreSQL (Prisma ORM), Redis, Docker  
**Target Role Alignment:** Enterprise Full-Stack / Backend Engineering & Technology Consulting

---

## 1. Project Overview

**OpsFlow** is a role-based internal service request, ticket routing, and multi-tier approval workflow platform. It enables employees to raise operational/IT service requests, managers to review and approve/reject requests with full audit traceability, and administrators to monitor system-wide SLA metrics in real time.

---

## 2. User Roles & Personas

| Role         | Description                                                     | Core Permissions                                                                                                                                               |
| :----------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EMPLOYEE** | Standard organization member raising service/access requests.   | Register/Login, create tickets, view own tickets, comment on own tickets, view ticket status history.                                                          |
| **MANAGER**  | Department lead or approver responsible for reviewing requests. | All `EMPLOYEE` permissions + view department/assigned queue, assign tickets, transition tickets (`IN_REVIEW`, `APPROVED`, `REJECTED`), view dashboard metrics. |
| **ADMIN**    | System administrator overseeing platform governance and users.  | All `MANAGER` permissions + manage user roles, view global audit logs, configure SLA thresholds, view system-wide analytics.                                   |

---

## 3. Functional Requirements (FR)

### 3.1 Authentication & Role-Based Access Control (RBAC)

- **FR-1.1 User Registration & Login:** Users must be able to register with `fullName`, `email`, and `password`, and authenticate using `email` and `password` to receive a signed JWT access token.
- **FR-1.2 Password Security:** Passwords must be salted and hashed using `bcrypt` (minimum 10 salt rounds) prior to database persistence; plaintext passwords must never be stored or logged.
- **FR-1.3 Route Protection & Role Guards:** All protected endpoints must validate the Bearer JWT token via Passport guards and enforce endpoint-level RBAC (`@Roles(Role.MANAGER, Role.ADMIN)`).
- **FR-1.4 Admin Role Management:** Only users with the `ADMIN` role can promote or demote another user's role (`EMPLOYEE` $\leftrightarrow$ `MANAGER` $\leftrightarrow$ `ADMIN`).

### 3.2 Service Ticket Lifecycle Management

- **FR-2.1 Ticket Creation:** Authenticated users can create a service ticket specifying `title`, `description`, `category` (e.g., `IT_ACCESS`, `INFRASTRUCTURE`, `PROCUREMENT`), and `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). Default status upon creation is `OPEN`.
- **FR-2.2 Ticket Listing & Filtering:** Users can retrieve paginated lists of tickets (`page`, `limit`) filtered by `status`, `priority`, `category`, or `assigneeId`.
  - `EMPLOYEE` users can only query tickets they created.
  - `MANAGER` and `ADMIN` users can query all tickets across the organization.
- **FR-2.3 Ticket Assignment:** `MANAGER` and `ADMIN` users can assign or reassign an `OPEN` or `IN_REVIEW` ticket to a valid reviewer.
- **FR-2.4 State Machine Transitions:** Ticket status transitions must strictly follow valid workflow rules:
  - `OPEN` $\rightarrow$ `IN_REVIEW` (Manager/Admin)
  - `IN_REVIEW` $\rightarrow$ `APPROVED` or `REJECTED` (Manager/Admin only)
  - `OPEN` $\rightarrow$ `APPROVED` or `REJECTED` (Manager/Admin fast-track)
  - `REJECTED` $\rightarrow$ `OPEN` (Employee re-submission with updated details)
  - Terminal state `APPROVED` cannot transition back to `OPEN`.

### 3.3 Immutable Audit Trail & Traceability

- **FR-3.1 Automatic Audit Logging:** Every state-changing operation (ticket creation, assignment change, status transition, role update) must automatically generate an immutable record in the `AuditLog` table containing `ticketId`, `actorId`, `action`, `previousState`, `newState`, and `timestamp`.
- **FR-3.2 Atomic Persistence:** Ticket updates and their corresponding audit log entries must execute within a single **PostgreSQL ACID transaction** (`prisma.$transaction`). If audit logging fails, the ticket update must roll back.
- **FR-3.3 Audit History Retrieval:** Authorized users can fetch the chronological audit timeline for any ticket they have permission to view.

### 3.4 Dashboard Analytics & Caching

- **FR-4.1 Aggregated Metrics Endpoint:** Provide a `GET /tickets/stats` endpoint returning ticket counts grouped by `status` and `priority`, plus average resolution turnaround time.
- **FR-4.2 Cache-Aside Execution:** The stats endpoint must first query **Redis** (`tickets:dashboard:stats`). On a cache hit, return cached JSON immediately; on a cache miss, query PostgreSQL, populate Redis with a 120-second TTL, and return the result.
- **FR-4.3 Event-Driven Cache Invalidation:** Any ticket creation or status update must immediately invalidate (`DEL`) the `tickets:dashboard:stats` key in Redis to prevent stale dashboard metrics.

### 3.5 API Documentation & Health Checks

- **FR-5.1 OpenAPI / Swagger Specification:** Expose interactive API documentation at `/api/docs` detailing request DTOs, response schemas, and Bearer auth headers.
- **FR-5.2 System Health Endpoint:** Expose `GET /health` verifying live connectivity to both **PostgreSQL** and **Redis**.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Scalability

- **NFR-1.1 API Latency:** 95th percentile (`p95`) response time must be **< 50 ms** for Redis-cached endpoints and **< 200 ms** for indexed PostgreSQL read/write queries under standard load.
- **NFR-1.2 Database Indexing:** Composite and single-column B-Tree indexes must be defined on high-query columns (`Ticket(status, createdAt)`, `Ticket(creatorId)`, `AuditLog(ticketId)`).
- **NFR-1.3 Stateless Horizontal Scalability:** The NestJS backend must store zero in-memory session state (relying strictly on stateless JWTs and externalized Redis/PostgreSQL stores) so multiple container replicas can run behind a load balancer.

### 4.2 Security & Data Integrity

- **NFR-2.1 Strict Input Validation:** All incoming request bodies and query parameters must be validated using `class-validator` DTOs with `whitelist: true` and `forbidNonWhitelisted: true` to strip/reject unexpected payloads.
- **NFR-2.2 Rate Limiting:** Implement Redis-backed sliding-window rate limiting (e.g., max **60 requests/minute** per IP/user on general endpoints and **10 requests/minute** on `/auth/login`) to mitigate brute-force and DoS attacks.
- **NFR-2.3 SQL Injection Prevention:** All database operations must use parameterized queries via Prisma ORM; raw string-concatenated SQL is prohibited.
- **NFR-2.4 Secret Management:** Database credentials, Redis URLs, and JWT signing secrets must be injected via environment variables (`.env`) and excluded from version control (`.gitignore`).

### 4.3 Reliability & Maintainability

- **NFR-3.1 Standardized Error Handling:** Implement a global exception filter returning uniform JSON error envelopes (`statusCode`, `timestamp`, `path`, `message`) without leaking stack traces in production.
- **NFR-3.2 Modular Architecture:** Codebase must follow NestJS domain-driven module isolation (`AuthModule`, `TicketsModule`, `AuditModule`, `RedisModule`, `PrismaModule`) with clean separation between Controllers (HTTP layer) and Services (business logic).
- **NFR-3.3 Automated Testing:** Unit tests (Jest) must cover core RBAC rules, state-machine transition validations, and cache invalidation logic with $\ge 80\%$ service-layer coverage.

### 4.4 Portability & DevOps

- **NFR-4.1 Containerized Deployment:** Provide a multi-stage `Dockerfile` and `docker-compose.yml` orchestrating the NestJS API, PostgreSQL 16, and Redis 7 so the entire stack boots locally with a single `docker compose up --build` command.
- **NFR-4.2 Reproducible Schema Migrations:** All database schema changes must be tracked via versioned Prisma migration files (`prisma/migrations/`) rather than manual DDL edits.
- **NFR-4.3 CI Pipeline:** Configure a GitHub Actions workflow that automatically runs linting, TypeScript compilation (`tsc --noEmit`), and unit tests on every pull request and push to `main`.

---

## 5. Summary of Interview Talking Points Covered by This SRS

- **Why PostgreSQL + Prisma?** Relational integrity between users, tickets, and foreign-keyed audit logs, plus atomic ACID transactions (`$transaction`) when updating ticket status and writing audit trails simultaneously.
- **Why Redis?** Solves two distinct bottlenecks: low-latency **cache-aside** aggregation for dashboard metrics (with explicit write invalidation) and **atomic counter rate-limiting** (`INCR` + `EXPIRE`) on authentication endpoints.
- **Why NestJS?** Enforces clean enterprise architecture (Dependency Injection, Guards, Pipes, Interceptors, DTO validation) that mirrors large-scale client delivery codebases.
