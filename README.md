# 🏛️ Layered Next.js API

A reference implementation of Clean Architecture applied to Next.js App Router API endpoints.

## ✨ Features

- **Separation of Concerns**: Strictly delineates Domain (Zod/Types), Repositories (Data Access), Services (Business Logic), and HTTP Context.
- **Dependency Injection**: Services accept interfaces (IRepository), allowing for instant 100% in-memory testability.
- **Optimistic Concurrency (LWW)**: Natively enforces Last-Write-Wins and throws HTTP 409 Conflicts when a client submits a stale updated_at timestamp.
- **Idempotency Engine**: Prevents duplicate executions of non-safe mutations (POST/PATCH) via idempotency keys.
- **Context Injection**: Uses a higher-order withContext function to authenticate and wrap errors consistently.

## 🚀 Architecture

`mermaid
flowchart TD
    HTTP[HTTP Route Handler] --> withContext[withContext Wrapper]
    withContext --> Service[Business Service]
    Service --> Repo[Repository Interface]
    Repo -.-> DB[Production Database]
    Repo -.-> Mem[InMemory Store for Unit Tests]
`

## 💡 Usage

`ash
npm install
npm test
`

## 📄 License
MIT
