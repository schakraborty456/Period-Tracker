# Architecture

## 1. Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Routing | React Router |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| AI | Gemini API via Firebase AI Logic or Cloud Functions |
| PWA | vite-plugin-pwa |
| Dates | date-fns |
| Charts (V2) | Recharts |
| Testing | Vitest (cycle calculator unit tests) |
| Version control | Git + GitHub |

## 2. High-Level Diagram
```
[ User Browser / PWA ]
        |
        |-- Firebase Auth  (login, session)
        |-- Firestore      (profile, periods, dailyLogs)
        |-- Cloud Function / Firebase AI Logic  --> Gemini API
```
The frontend never holds the Gemini API key. All AI calls go through the server side.

## 3. Folder Structure
```
src/
  components/      reusable UI (Button, Card, PhaseBadge, LogForm, Calendar)
  pages/           Login, Signup, Onboarding, Dashboard, Log, History, Tips, Assistant, Settings
  context/         AuthContext, UserDataContext
  hooks/           useAuth, useCycle, useDailyLog
  utils/
    cycleCalculator.js   pure functions, fully unit-tested
    dateHelpers.js
  data/
    nutritionTips.js     phase x diet content (reviewed)
    symptoms.js          symptom options
  services/
    firestore.js         all DB reads/writes
    aiService.js         calls the AI backend
  i18n/                  en.json, bn.json (V2)
  firebase.js            Firebase init from env vars
  App.jsx
  main.jsx
functions/               Cloud Functions (AI proxy), V2
firestore.rules
```

## 4. Data Model (Firestore)
```
users/{userId}
  name, age
  dietPreference: "veg" | "non-veg" | "eggetarian"
  avgCycleLength: number (default 28)
  avgPeriodLength: number (default 5)
  language: "en" | "bn"
  aiConsent: boolean
  createdAt

users/{userId}/periods/{periodId}
  startDate, endDate (nullable), cycleLength (computed once the next period starts)

users/{userId}/dailyLogs/{yyyy-mm-dd}
  flow: "none" | "light" | "medium" | "heavy"
  mood: string
  symptoms: string[]
  waterGlasses: number
  notes: string
```

## 5. Cycle Calculation (rule-based)
Defined in `utils/cycleCalculator.js` as pure functions.

- `nextPeriodDate = lastPeriodStart + cycleLength`
- `ovulationDate = nextPeriodDate - 14 days`
- `fertileWindow = ovulationDate - 5 days` to `ovulationDate + 1 day`
- Phase for a given day (cycleDay = days since last period start + 1):
  - Menstrual: day 1 to periodLength
  - Follicular: periodLength + 1 to ovulationDay - 1
  - Ovulation: ovulationDay - 1 to ovulationDay + 1
  - Luteal: ovulationDay + 2 to cycleLength
- If the user has 3 or more recorded cycles, use the average of the last 3 for `cycleLength`.
- Irregular flag: cycle lengths vary by more than 7 days, or a cycle is shorter than 21 or longer than 38 days.
- Must handle: cycleDay exceeding cycleLength (late period), leap years, and timezones (use local dates, not UTC timestamps).

## 6. AI Flow (Version 2)
1. User sends a question in the Assistant page.
2. Frontend calls the AI backend with: question + context (phase, cycleDay, dietPreference, last 7 days of symptoms). No name or email.
3. Backend adds the system prompt (see Rules.md), calls Gemini, returns the answer.
4. Frontend shows the answer with a disclaimer.
5. Red-flag keywords (heavy bleeding, severe pain, pregnant, fainting, etc.) trigger a doctor-referral message.

## 7. Security
- Firestore rules: a user can only read and write documents under `users/{their own uid}`.
- Environment variables for all Firebase config (`.env`, never committed).
- Gemini key stored only server side.
- AI requests require a signed-in user and are rate limited.
- Account deletion removes the user doc and all subcollections.

### Firestore rules (starting point)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Deployment
- `npm run build` then `firebase deploy`.
- Environments: local (emulators optional) and production.
