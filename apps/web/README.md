# Quillscape Next Frontend (`apps/web`)

Next.js App Router frontend for Quillscape.

## Local development

1. Copy `.env.example` to `.env.local` and fill values.
2. Start dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Required in `.env.local` (and Vercel Project Environment Variables):

- `NEXT_PUBLIC_API_BASE_URL` — **Local:** full URL of your API (e.g. `http://localhost:4000`). If this is missing or wrong, the browser will call the Next app itself and you’ll see **no posts**. **Production:** your deployed API URL (same as Vercel env).
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Local API + CORS

- Run the backend on a port **other than 3000** (Next uses 3000), e.g. `PORT=4000 npm start` in `apps/backend`.
- Backend CORS **merges** `FRONTEND_URL` / `FRONTEND_URLS` with known origins and **always allows** `http://localhost:*` and `http://127.0.0.1:*` for dev.
- If posts work on Vercel but not locally: check `.env.local` has `NEXT_PUBLIC_API_BASE_URL` pointing at a running API, and open DevTools → Network for failed `/blogs/public` requests.

### Hitting Render / production API from `localhost:3000`

If the browser error says `Access-Control-Allow-Origin` is only your production domain, the **deployed** API on Render is still on an **old** CORS setup or only has `FRONTEND_URL` set.

1. **Redeploy** `apps/backend` so the latest `index.js` CORS runs, **or**
2. On Render → **Environment**, set **`FRONTEND_URLS`** (note the **S**) to a comma-separated list, e.g.  
   `https://quillscape.amaanworks.me,http://localhost:3000,http://127.0.0.1:3000`  
   (Older servers use this list **instead of** `defaultOrigins` when the var is set.)

## Vercel deployment

Deploy `apps/web` as the project root.

- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`

## Production integration checklist

- Backend CORS: set `FRONTEND_URL` or `FRONTEND_URLS` for production; localhost is always merged in for dev.
- Firebase Authentication authorized domains must include your Vercel domain.
- `NEXT_PUBLIC_API_BASE_URL` must point to the production backend API.
