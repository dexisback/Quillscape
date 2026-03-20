import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, setPersistence, browserSessionPersistence, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Only initialize when a valid config is present (prevents SSR build errors without env vars)
let app: FirebaseApp | null = null
let auth: Auth | null = null

if (firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)

  if (typeof window !== "undefined") {
    setPersistence(auth, browserSessionPersistence)
  }
}

export { auth }
