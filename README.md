# 🏛️ Layered Next.js API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)]()

> A reference implementation of Clean Hexagonal Architecture for Next.js App Router API endpoints, featuring dependency injection, optimistic concurrency locking (409 Conflict), idempotency guards, and centralized execution contexts.

---

## 🎯 Executive Summary & Problem Space

In typical Next.js projects, API routes quickly degrade into unstructured "Smart Handlers":
1. Database queries, authorization checks, schema validations, third-party calls, and business logic are coupled into a single massive oute.ts.
2. Unit testing becomes impossible without mocking Next.js internals, request objects, and databases.
3. Rapid concurrent updates cause silent data overwrites (lost updates) because there is no optimistic locking mechanism.
4. Network retries from mobile clients lead to duplicate resource creation because endpoints lack idempotency.

**Layered Next.js API** demonstrates how to build enterprise-grade, decoupled Next.js API endpoints following the **Hexagonal / Onion Architecture** pattern. Business logic remains completely isolated from the HTTP transport layer and database clients.

---

## ⚡ Key Architectural Concepts

- **Clean Layered Separation**:
  - **Domain**: Pure TypeScript entities and strict Zod runtime validation schemas.
  - **Repositories**: Abstract contracts (IRepository<T>) enabling swap-in storage (PostgreSQL, SQLite, DynamoDB, or In-Memory mocks).
  - **Services**: Pure business logic containing zero HTTP, Next.js, or SQL dependencies.
  - **HTTP Context (withContext)**: Higher-order wrapper managing authentication extraction, tenancy, and translating internal errors into standardized HTTP status codes.
- **Optimistic Concurrency Control (OCC)**:
  - Updates require a prev_updated_at fence token.
  - If another client updated the record in the interim, the service throws ConcurrencyError, and withContext automatically returns a clean 409 Conflict.
- **Idempotency Protection**:
  - Protects POST and PATCH mutations against duplicate executions via unique idempotency client keys.

---

## 📊 Architectural Topology

`mermaid
flowchart TD
    Client[HTTP Client] --> NextRoute[Next.js App Router route.ts]
    
    subgraph HTTP_Layer["HTTP Transport Layer"]
        NextRoute --> WithCtx[withContext Wrapper]
        WithCtx --> Idemp[Idempotency Store Check]
    end
    
    subgraph Service_Layer["Core Business Logic"]
        WithCtx --> Service[Domain Service: TaskService]
    end
    
    subgraph Repo_Layer["Data Access Layer"]
        Service --> IRepo[IRepository Interface]
        IRepo -.-> InMemory[InMemoryRepository for Unit Tests]
        IRepo -.-> ProductionDB[Production DB: Postgres/Prisma/Drizzle]
    end
    
    WithCtx --> Normalizer[Error Normalizer]
    Normalizer -->|ConcurrencyError| Resp409[HTTP 409 Conflict]
    Normalizer -->|Auth Failure| Resp401[HTTP 401 Unauthorized]
    Normalizer -->|Success| Resp200[HTTP 200 OK + JSON]
`

---

## 🚀 Installation & Quick Start

`ash
git clone https://github.com/sahejvirsingh/layered-nextjs-api.git
cd layered-nextjs-api
npm install
npm test
`

### Usage Pattern

`	ypescript
// 1. Defining a Clean Service with Dependency Injection
import { TaskService, InMemoryRepository, Task } from "layered-nextjs-api";

const taskRepo = new InMemoryRepository<Task>();
const taskService = new TaskService(taskRepo);

// 2. Creating a task
const task = await taskService.createTask({
  id: "task_1",
  title: "Deploy distributed microservice",
  status: "todo",
  workspace_id: "ws_prod_01"
});

// 3. Simulating Optimistic Concurrency Protection
try {
  // If task.updated_at does not match database record, throws ConcurrencyError!
  await taskService.completeTask("task_1", task.updated_at);
} catch (error) {
  // Gracefully mapped to HTTP 409 in HTTP Context
}
`

---

## 🧪 Testing Strategy

Because business logic has zero framework coupling, tests run in milliseconds without launching Next.js or spinning up a test database:
- **Service Unit Tests**: Run against InMemoryRepository.
- **Concurrency Fuzzing**: Validates that overlapping update attempts always trigger a ConcurrencyError.
- **Idempotency Validation**: Verifies cached mutation responses are replayed on duplicate key submission.

---

## 📄 License
MIT © [Sahejvir Singh](https://github.com/sahejvirsingh)
