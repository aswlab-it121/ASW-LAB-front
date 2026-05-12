# Issue Tracker Frontend

This project is a starter scaffold for a responsive issue tracker built with React + Vite + TypeScript + Tailwind CSS.

Stack
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand (app state)
- fetch-based API layer
- React Hook Form + Zod
- Lucide React icons

Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example` and set `VITE_API_BASE_URL`.

3. Run dev server:

```bash
npm run dev
```

Folder structure overview

- `src/app` — router, providers, stores
- `src/components` — shared UI and layout
- `src/features` — feature-first folders (issues, users, comments, settings)
- `src/lib/api` — centralized API layer and types
- `src/lib/utils` — helpers like `cn()`

Hardcoded user selection

The app replaces authentication with a user selector. See `src/app/store/userStore.ts`. It contains three hardcoded users with `apiKey` fields. The selected user's API key is automatically included in API requests via the HTTP wrapper.

API layer

- `src/lib/api/config.ts` — base URL helper
- `src/lib/api/http.ts` — typed `request` helper using `fetch`, auto-injects `X-API-KEY` header from selected user
- `src/lib/api/types.ts` — shared types like `ApiError` and `PaginatedResponse`

Assumptions about backend endpoints

- `GET /issues` — list issues (supports filters via query params). Returns `{ data: IssueSummary[] }`.
- `GET /issues/:id` — get full issue. Returns `{ data: Issue }`.
- `POST /issues` — create issue, body contains issue payload.
- `PUT /issues/:id` — update issue.
- `DELETE /issues/:id` — delete issue.
- `POST /issues/bulk` — bulk insert issues with array payload.
- `GET /users` and `GET /users/:id` for user profiles.
- `PUT /users/:id` and `POST /users/:id/avatar` for profile updates and avatar uploads.

Next steps

- Flesh out API contracts with backend team and replace placeholder responses.
- Add comment, attachment, activity, watcher feature API modules and pages.
- Add permission helpers and UI guards (scaffolds included in `src/lib` and `features`).
- Add tests and CI, and optional persistence for selected user.
