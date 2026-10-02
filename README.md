# Client Project Tracker

A small full-stack app for a digital agency to track client projects: their status, priority and timelines.

- **Backend:** Laravel 12 (PHP 8.2) REST API with a MySQL database
- **Frontend:** React 19 + TypeScript, built with Vite, styled with Tailwind CSS, data fetching via TanStack Query
- **Tests:** PHPUnit feature tests for the API, Vitest + Testing Library for the frontend

## Features

- Full CRUD for projects (`GET/POST /projects`, `GET/PUT/DELETE /projects/:id`)
- Validation on both client and server, with field-level error messages
- Search across client name, project name and description
- Filter by status and priority
- Sort by any column; status and priority sort by their logical order (e.g. High > Medium > Low), not alphabetically
- Overdue projects (past their due date and not completed) are highlighted
- Responsive layout: a table on desktop, cards on mobile
- Loading, empty, error and "no results" states, plus success notices

---

## Requirements

| Tool | Version |
| --- | --- |
| PHP | 8.2+ (with `pdo_mysql`) |
| Composer | 2.x |
| MySQL / MariaDB | MySQL 8 or MariaDB 10.4+ (XAMPP works) |
| Node.js | 20.19+ or 22.12+ |

## Setup

### 1. Database

Create an empty database:

```sql
CREATE DATABASE client_project_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env          # Windows (cmd): copy .env.example .env
php artisan key:generate
```

Edit `DB_*` values in `backend/.env` if your MySQL credentials are not the defaults (`root`, no password, `127.0.0.1:3306`). Then:

```bash
php artisan migrate --seed    # creates tables and loads the 12 sample projects from test_data.json
php artisan serve             # API at http://127.0.0.1:8000
```

### 3. Frontend (React)

In a second terminal:

```bash
cd frontend
npm install
npm run dev                   # app at http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the Laravel server, so no CORS configuration is needed in development.

### Running the tests

```bash
cd backend && php artisan test     # 24 API tests; uses in-memory SQLite, so MySQL is not needed
cd frontend && npm test            # 14 unit/component tests
```

To reset the sample data at any time: `php artisan migrate:fresh --seed`.

---

## API Reference

All responses are JSON. Request and response bodies use camelCase, matching the provided `test_data.json`.

| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| GET | `/projects` | List projects | `200` |
| GET | `/projects/:id` | Get one project | `200` |
| POST | `/projects` | Create a project | `201` |
| PUT | `/projects/:id` | Replace a project | `200` |
| DELETE | `/projects/:id` | Delete a project | `204` |

### Project object

```json
{
  "id": 1,
  "clientName": "Acme Corporation",
  "projectName": "Corporate Website Redesign",
  "description": "Redesign and modernize the company's corporate website.",
  "status": "In Progress",
  "priority": "High",
  "startDate": "2026-06-01",
  "dueDate": "2026-07-15",
  "createdAt": "2026-10-02T05:26:24+00:00",
  "updatedAt": "2026-10-02T05:26:24+00:00"
}
```

Single resources are wrapped as `{ "data": { ... } }` and lists as `{ "data": [ ... ] }`.

### Request body (POST and PUT)

| Field | Rules |
| --- | --- |
| `clientName` | required, string, max 255 |
| `projectName` | required, string, max 255 |
| `description` | optional, string, max 5000 |
| `status` | required, one of `Planning`, `In Progress`, `On Hold`, `Completed` |
| `priority` | required, one of `Low`, `Medium`, `High` |
| `startDate` | optional, `YYYY-MM-DD` |
| `dueDate` | optional, `YYYY-MM-DD`, must be on or after `startDate` |

`PUT` is a full replacement, so it takes the same body as `POST`.

### Query parameters for `GET /projects`

| Param | Example | Notes |
| --- | --- | --- |
| `search` | `?search=portal` | Matches client name, project name or description |
| `status` | `?status=In Progress` | Must be a valid status |
| `priority` | `?priority=High` | Must be a valid priority |
| `sortBy` | `?sortBy=dueDate` | `clientName`, `projectName`, `status`, `priority`, `startDate`, `dueDate`, `createdAt` (default) |
| `sortDir` | `?sortDir=asc` | `asc` or `desc` (default) |

### Errors

| Status | When | Body |
| --- | --- | --- |
| `400` | Request body is not valid JSON | `{ "message": "The request body is not valid JSON: Syntax error." }` |
| `404` | Project does not exist | `{ "message": "Project not found." }` |
| `422` | Validation failed | `{ "message": "...", "errors": { "field": ["..."] } }` |

Example `422`:

```json
{
  "message": "The client name field is required. (and 1 more error)",
  "errors": {
    "clientName": ["The client name field is required."],
    "dueDate": ["The due date cannot be earlier than the start date."]
  }
}
```

---

## Project Structure

```
backend/
  app/Enums/                  ProjectStatus, ProjectPriority (string-backed enums)
  app/Models/Project.php      Eloquent model, enum casts, search and sort scopes
  app/Http/Controllers/       ProjectController (thin: delegates to requests, model, resource)
  app/Http/Requests/          ProjectRequest (create/update rules), ListProjectsRequest (query params)
  app/Http/Resources/         ProjectResource (DB snake_case -> API camelCase)
  bootstrap/app.php           API routing (no /api prefix) and JSON error handling
  database/migrations/        projects table
  database/seeders/           Seeds from database/data/test_data.json
  routes/api.php              Route::apiResource('projects', ...)
  tests/Feature/              ProjectApiTest

frontend/src/
  api/                        fetch wrapper with typed ApiError, project endpoints
  hooks/                      TanStack Query hooks (queries + mutations), debounce
  components/                 ProjectList, ProjectForm, ProjectFormModal, DeleteProjectDialog, toolbar, badges, modal
  lib/                        Client-side validation and date helpers
  types/                      Shared Project types and constants
```

## Technical Decisions

**Laravel conventions throughout the API.** Validation lives in Form Requests, serialisation in an API Resource, and the controller only coordinates them. Each piece has one job and can be tested on its own. There is no separate service or repository layer: with simple CRUD it would only pass calls through. If business rules grow (notifications, audit logs, permissions), that layer is where they would go.

**PHP enums as the single source of truth for status and priority.** The same enum drives the validation rule (`Rule::enum`), the model cast, the error messages and the sort order. Adding a new status is a one-line change. Values are stored as strings rather than MySQL `ENUM` columns, so changing them needs no schema migration.

**Meaningful sort order.** Sorting priority alphabetically would give "High, Low, Medium", which is useless to a project manager. The `sortByField` scope uses a parameterised `CASE` expression to sort by the enum's declared order. A secondary sort on `id` keeps results stable.

**camelCase API, snake_case database.** The API contract matches the provided `test_data.json`, while the database follows Laravel conventions. The mapping happens in exactly two places: `ProjectRequest::toModelAttributes()` going in and `ProjectResource` going out.

**Routes at `/projects`, not `/api/projects`.** The spec defines endpoints at the root, so the API prefix is removed in `bootstrap/app.php`.

**Consistent JSON errors.** Every exception renders as JSON, whatever the client's `Accept` header. 404s return "Project not found." instead of Laravel's default message, which exposes the model class name. Invalid query parameters (such as `?status=Done`) return a 422 rather than being silently ignored.

**Validation on both sides.** The frontend mirrors the server's rules for instant feedback, but the server is the source of truth. Server-side 422 errors are mapped back onto the matching form fields, so a rule that exists only on the server still shows up in the right place.

**Optional dates.** Only client name and project name are required by the spec. A project in "Planning" may not have dates yet, so `startDate` and `dueDate` are nullable. The due-date rule only applies when both are present.

**Server-side search, filter and sort.** This keeps the frontend simple and scales to more projects than fit in one response. Search input is debounced (300 ms), and TanStack Query keeps the previous results on screen while new ones load, so the list doesn't flicker.

**TanStack Query for server state.** It handles caching, loading and error states, and invalidation after create, update and delete, so no hand-written global store is needed. The edit dialog fetches `GET /projects/:id` so users always edit the latest data rather than a possibly stale list row.

**Accessibility.** Modals use the native `<dialog>` element, which provides focus trapping and Escape-to-close. Inputs have labels, and errors are linked to their fields with `aria-describedby`/`aria-invalid`.

**Tests run on SQLite in memory.** API tests run fast and need no database setup. The queries are portable (the `CASE` sort works in both engines), and the app itself was verified against MySQL.

## Trade-offs and What I'd Do Next

- **Pagination:** the list returns all matching projects, which is fine at this scale. For a real agency I'd add cursor or page pagination (`->paginate()`; Laravel Resources already emit `meta`/`links`).
- **Authentication:** out of scope here; Laravel Sanctum would be the natural addition.
- **Shared types:** the frontend types are written by hand to match the API. An OpenAPI spec could generate them and remove the risk of drift.
- **Docker:** not included. Laravel Sail or a small `docker-compose.yml` (PHP, MySQL, Node) would make setup one command.
- **Optimistic updates** for delete and edit, to make the UI feel faster.

## AI Usage Disclosure

I used AI assistance (Claude Code) while building this project for scaffolding, drafting code and tests, and writing documentation. I reviewed, ran and tested all of the code, and I can explain and defend every decision described above.
