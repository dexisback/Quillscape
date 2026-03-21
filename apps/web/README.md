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

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Vercel deployment

Deploy `apps/web` as the project root.

- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`

## Production integration checklist

- Backend CORS must allow your Vercel frontend URL via backend env `FRONTEND_URLS`.
- Firebase Authentication authorized domains must include your Vercel domain.
- `NEXT_PUBLIC_API_BASE_URL` must point to the production backend API.
