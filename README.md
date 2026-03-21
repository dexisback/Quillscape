# Quillscape Monorepo

## Active apps

- `apps/web`: Next.js frontend (active deployment target)
- `apps/backend`: Express API backend

Legacy Vite frontend has been removed from the repo.

## Local run commands

From repo root:

- `npm run dev:web`
- `npm run dev:backend`

## Deployment

- Frontend: deploy `apps/web` to Vercel.
- Backend: deploy `apps/backend` to your API host (currently Render).
- Ensure backend `FRONTEND_URLS` includes your Vercel domain(s).
