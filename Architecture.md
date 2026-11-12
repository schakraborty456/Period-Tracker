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
  pages/           Login, Signup, Onboarding, Dashboard, Log, History, Tips, Assistant, Settings, Insights, Workouts, DoctorReport
  context/         AuthContext, UserDataContext
  hooks/           useAuth, useCycle, useDailyLog
  utils/
    cycleCalculator.js   pure functions, fully unit-tested
    dateHelpers.js
    riskScreening.js     rule-based risk detection, fully unit-tested (V2)
  data/
    nutritionTips.js     phase x diet content (reviewed)
    symptoms.js          symptom options (flow, mood, tags, pain scale)
    riskFlags.js         flag criteria & lifestyle guidance (reviewed) (V2)
    workouts.js          phase & symptom home workout library (V2)
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
  riskConsent: boolean (consent to view risk screening insights)
  createdAt

users/{userId}/periods/{periodId}
  startDate, endDate (nullable), cycleLength (computed once the next period starts)

users/{userId}/dailyLogs/{yyyy-mm-dd}
  flow: "none" | "light" | "medium" | "heavy"
  mood: string
  symptoms: string[] (e.g. cramps, headache, bloating, acne, excess_hair, hair_loss, weight_change, dark_patches)
  painScore: number (0 to 10; 0 = no pain, 10 = severe/unbearable)
  waterGlasses: number
  sleepHours: number (optional)
  weight: number (kg, optional)
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

## 5.1 Risk Screening Engine (rule-based, Version 2)
Defined in `utils/riskScreening.js` as pure, deterministic functions (no AI).

- **Minimum Data Gate**: Flags are evaluated only when the user has recorded >= 3 completed cycles OR >= 60 days (2 months) of daily logs. Returns `{ hasMinimumData: false, message: "Keep logging, we need more data" }` otherwise.
- **Screening Rules**:
  - **PCOS possible signs**: Cycle length frequently > 35 days or irregular (`isIrregular: true`), combined with logged symptoms of acne, excess hair growth, hair loss, or weight gain.
  - **Anemia possible signs**: Bleeding flow recorded as `heavy` combined with logged symptoms of fatigue/tiredness or dizziness.
  - **Endometriosis / severe pain**: Repeated high pain scores (`painScore >= 7`) across 2 or more distinct cycles.
  - **Thyroid possible signs**: Fluctuating/irregular cycle lengths combined with tiredness and weight changes.
  - **Immediate Doctor Referral (Red Flags)**: No period recorded for 90+ days (3 months, not pregnant), or bleeding flow lasting > 7 consecutive days.
- **Output Structure**:
  Returns structured risk flags consumed by `pages/Insights.jsx`, `pages/DoctorReport.jsx`, and forwarded to the AI assistant context. Never outputs a diagnosis.

## 6. AI Flow (Version 2)
1. User sends a question in the Assistant page.
2. Frontend calls the AI backend with: question + context (phase, cycleDay, dietPreference, last 7 days of symptoms, painScore trends, activeRiskFlags IDs). No name or email.
3. Backend adds the system prompt (see Rules.md), calls Gemini, returns the answer.
4. Frontend shows the answer with a disclaimer.
5. If `activeRiskFlags` contains flags (e.g. `possible_pcos_signs`), AI provides gentle lifestyle context (nutrition, stress, workouts) and reminds the user to speak with her gynecologist.
6. Red-flag keywords (heavy bleeding, severe pain, pregnant, fainting, etc.) trigger an immediate doctor-referral message.

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
