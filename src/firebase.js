import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Cloud Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase App Check (reCAPTCHA Enterprise - Essentials tier, no billing)
// Must be called BEFORE any Firebase AI Logic initialization.
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
let appCheck = null;

if (typeof window !== 'undefined' || typeof self !== 'undefined') {
  if (import.meta.env.DEV) {
    if (typeof self !== 'undefined') {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    } else if (typeof window !== 'undefined') {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
  }

  if (recaptchaSiteKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('Firebase App Check initialization failed:', err);
      }
    }
  } else if (import.meta.env.DEV) {
    console.warn(
      'Firebase App Check: VITE_RECAPTCHA_SITE_KEY is missing. Skipping App Check initialization.'
    );
  }
}

export { appCheck };

// Initialize Firebase AI Logic with Gemini Developer API backend (GoogleAIBackend) on Spark plan
export const ai = getAI(app, {
  backend: new GoogleAIBackend(),
});

export default app;
