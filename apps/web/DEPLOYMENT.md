# Deployment Checklist (Vercel)

## Vercel project settings

- Framework preset: Next.js
- Production branch: `next-refactor`
- Root directory: `apps/web`
- Install command: `npm install`
- Build command: `npm run build`
- Output command: default
- Start command: `npm run start`

## Required frontend environment variables

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `REVALIDATE_SECRET` (used by `/api/revalidate/public-blogs`)
- `PUBLIC_FEED_SYNC_SECRET` (shared secret for `/api/internal/public-feed/sync` and `/api/internal/public-feed/seed`)
- `KV_REDIS_URL` (from Vercel Redis/KV integration — auto-populated when Redis DB is connected to the project)

### About `KV_REDIS_URL`

- **Auto-populated:** When you connect a Vercel Redis/KV instance to this project in the Vercel dashboard, `KV_REDIS_URL` is automatically made available to the runtime.
- **No manual env var needed:** You do **not** need to manually add it to Environment Variables settings; it's a managed connection string.
- **Verified at runtime:** The app will throw a clear error at first request if the connection is missing (e.g., if Redis is not connected to the environment).

## Migration from REST-token mode

If upgrading from `KV_REST_API_URL` + `KV_REST_API_TOKEN`:

1. Remove `KV_REST_API_URL` and `KV_REST_API_TOKEN` from environment variables (if present).
2. Ensure Vercel Redis is connected to this project (check Storage in Vercel dashboard).
3. Redeploy. `KV_REDIS_URL` will be available automatically.

## Required backend changes

- Set backend `FRONTEND_URLS` to include your Vercel production domain(s).
- Set backend `NEXT_REVALIDATE_URL` to your frontend endpoint:
  `https://<your-domain>/api/revalidate/public-blogs`
- Set backend `NEXT_REVALIDATE_SECRET` to the same value as frontend `REVALIDATE_SECRET`.
- Set backend `PUBLIC_FEED_SYNC_URL` to:
  `https://<your-domain>/api/internal/public-feed/sync`
- Set backend `PUBLIC_FEED_SYNC_SECRET` to the same value as frontend `PUBLIC_FEED_SYNC_SECRET`.
- Redeploy backend after updating env.

## One-time public feed seed (after deploy)

Run once after both frontend and backend are deployed:

```bash
curl -X POST "https://<your-domain>/api/internal/public-feed/seed" \
  -H "x-feed-sync-secret: <PUBLIC_FEED_SYNC_SECRET>"
```

Expected response:
```json
{
  "ok": true,
  "seeded": true,
  "hash": "a1b2c3d4",
  "cachedAt": "2025-03-25T...",
  "count": 42
}
```

## Firebase setup

- Add Vercel domain(s) to Firebase Authentication authorized domains.

## Smoke test targets after deploy

- `/`
- `/auth`
- `/feed`
- `/home`
- `/post-blogs`
- `/user-profile`
- `/user-settings`

## Troubleshooting

- **Seed fails with 503:** Redis replica write failed. Check Redis connection in Vercel dashboard (Storage > Vercel Redis).
- **Sync silently fails:** Check server logs (`https://vercel.com/<team>/<project>/analytics/function-logs`) for `[sync-endpoint]` errors.
- **Feed page shows empty:** Verify seed has been run and Redis contains data via `readPublicFeedReplica()`.
