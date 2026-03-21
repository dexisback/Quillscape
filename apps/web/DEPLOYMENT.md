# Deployment Checklist (Vercel)

## Vercel project settings

- Framework preset: Next.js
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

## Required backend changes

- Set backend `FRONTEND_URLS` to include your Vercel production domain(s).
- Redeploy backend after updating env.

## Firebase setup

- Add Vercel domain(s) to Firebase Authentication authorized domains.

## Smoke test targets after deploy

- `/`
- `/auth`
- `/home`
- `/post-blogs`
- `/user-profile`
- `/user-settings`
