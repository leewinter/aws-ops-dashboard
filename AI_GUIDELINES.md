# AI & Contributor Guidelines

This repository is a growing TypeScript / Node.js workspace.
The following conventions should be followed when **writing, refactoring, or extending code** — especially by AI-assisted tools.

## 📁 Workspace Structure

This repo follows a clear separation of concerns:

### `packages/`
- Shared, reusable logic
- Domain models, utilities, common libraries
- No direct infrastructure or runtime assumptions
- Should be safe to import from any service or consumer

Examples:
- domain models
- validation logic
- logging utilities
- shared types
- integration helpers

### `consumers/`
- Event-driven components
- Event bus / message queue consumers
- Stateless where possible
- Should delegate business logic to shared packages or services

Examples:
- EventBridge consumers
    - Product Update Consumer
    - Product Inventory Consumer
    - Digital Asset Consumer 

### `services/`
- API-driven services
- HTTP
- Authentication, routing, request handling
    - Currently @vendia/serverless-express
- Thin controllers preferred

Examples:
- REST APIs
    - S3 pre-signed object upload
- Internal service-to-service APIs
    - EDIFACT to CSV tool for VPC internal use by n8n

---

## 🧱 Architectural Patterns (Preferred)

Wherever practical, prefer the following patterns:

### Repository Pattern
- Abstract data access behind repositories
- Repositories should encapsulate persistence logic
- Services and consumers should not directly query databases

Example:
```ts
interface OrderRepository {
  getById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
```

### Adapters
- Used to integrate with external systems (APIs, queues, SDKs)
- Keep third-party dependencies isolated
- Makes swapping providers easier

Examples:
- External API clients
- Payment gateways
- File storage adapters

### Providers
- Used for infrastructure concerns
- Configuration, environment, credentials, connections
- Should be injectable and mockable

Examples:
- Database connections
- Feature flags
- Secrets providers

## 🧪 Testing Expectations

- New functionality should include tests where feasible
- Prefer unit tests over integration tests unless integration is required
- Shared packages should aim for strong test coverage
- Repositories, adapters, and providers should be easy to mock

Common tools:
- Vitest / Jest
- Test doubles / mocks
- In-memory or local test implementations

## ✨ General Principles

- Prefer composition over inheritance
- Keep functions small and focused
- Avoid leaking infrastructure concerns into domain logic
- Favour explicit dependencies over globals
- Keep APIs thin and orchestration-focused
- Shared logic belongs in packages/, not duplicated

## 🤖 Guidance for AI Agents

When modifying this repository:
- Respect existing folder boundaries
- Reuse existing abstractions before creating new ones
- Do not introduce new patterns without strong justification
- Prefer extending existing packages over adding one-off logic
- When unsure, follow existing conventions in nearby code

If something is ambiguous:
- Ask for clarification rather than guessing