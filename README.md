# Salary Calculator API

A RESTful API for managing company employee hierarchies and calculating salaries based on seniority and supervisory bonus rates.

## Tech Stack

- TypeScript
- NestJS
- Drizzle ORM
- SQLite (`node:sqlite`)
- Zod
- Vitest
- Supertest
- Oxlint
- Oxfmt
- pnpm

## API Endpoints

| Method   | Endpoint                    | Description                                       |
| -------- | --------------------------- | ------------------------------------------------- |
| `GET`    | `/employees`                | Retrieve a list of all employees                  |
| `POST`   | `/employees`                | Create a new employee                             |
| `GET`    | `/employees/salaries`       | Retrieve all employees with calculated salaries   |
| `GET`    | `/employees/salaries/total` | Retrieve the total sum of all calculated salaries |
| `GET`    | `/employees/:id`            | Retrieve an employee by ID                        |
| `GET`    | `/employees/:id/salary`     | Retrieve an employee with calculated salary by ID |
| `PATCH`  | `/employees/:id`            | Update an existing employee by ID                 |
| `DELETE` | `/employees/:id`            | Delete an employee by ID                          |

## How to Run

### Requirements:

- Node.js 24+
- pnpm 12+

### Install dependencies:

```bash
pnpm install
```

### Create environment file:

```bash
cp .env.example .env
```

### Set port and database file in `.env`:

```env
PORT=3000
DB_FILE_NAME=db.sqlite
```

### Run database migrations:

```bash
pnpm db:migrate
```

### Start the development server:

```bash
pnpm start:dev
```

The API runs on [http://localhost:3000](http://localhost:3000).

### Run tests:

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Run linter and formatter check
pnpm quality
```

## Solution Overview

### Architecture

- **Layered design**: Controller -> Service -> Repository (`drizzle-orm`) -> Database (`node:sqlite`).
- **Decoupled calculation engine**: Salary math (seniority caps, subordinate bonuses) is pure and isolated from DB and HTTP layers.
- **Hierarchy guards**: Recursive queries for subordinate lookups; service enforces tree validity (cycle prevention, demotion blocking, self-assignment checks, etc).
- **Validation**: Zod via `StandardSchemaValidationPipe` handles all input validation.

### Advantages

- **Zero-infra setup**: Built-in `node:sqlite` + Drizzle means no Docker or external DB required to run or test.
- **Pure business logic**: Salary calculation has no side effects, making it fast and easy to test.
- **Isolated tests**: In-memory SQLite with migrations powers fast e2e tests.

### Drawbacks & Production Improvements

- **Floating-point money**: Production payroll should use big-int cents or a decimal library to prevent precision errors.
- **In-memory tree traversal**: Salary queries load all employees into memory. Needs Redis caching, batching, or background workers at scale.
- **SQLite concurrency**: Single-file SQLite cannot scale horizontally; needs PostgreSQL with connection pooling.
- **Missing Auth & Audit Log**: Needs JWT for access control and an audit log to track salary and staff history.
