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
  pages/           Login, Signup, Onboarding, Dashboard, Log, History, Tips, Assistant, Settings, Insights, Workouts, DoctorReport, Conditions, ConditionDetail
  context/         AuthContext, UserDataContext
  hooks/           useAuth, useCycle, useDailyLog
  utils/
    cycleCalculator.js   pure functions, fully unit-tested
    dateHelpers.js
    riskScreening.js     rule-based risk detection, fully unit-tested (V2)
    redFlagDetection.js  escalation & visit triggers, fully unit-tested (V2)
  data/
    nutritionTips.js     phase x diet content (reviewed)
    symptoms.js          symptom options (flow, mood, tags, pain scale)
    riskFlags.js         flag criteria & lifestyle guidance (reviewed) (V2)
    workouts.js          phase & symptom home workout library (V2)
    conditions.js        educational conditions dataset & comfort care (reviewed) (V2)
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

## 5.2 Conditions Library (Static Educational Content, Version 2)
Defined in `src/data/conditions.js` as an array of static, expert-reviewable educational objects (no AI generation at runtime, zero Firestore dependency).

### 8 Initial Conditions
1. `pcos`: PCOS / PCOD (Polycystic Ovary Syndrome) — category: `hormonal-systemic`
2. `pms`: PMS (Premenstrual Syndrome) — category: `pain-discomfort`
3. `dysmenorrhea`: Period Cramps (Dysmenorrhea) — category: `pain-discomfort`
4. `heavy-periods`: Heavy Periods (Menorrhagia) — category: `flow-blood`
5. `anemia`: Anemia (Iron Deficiency & Menstrual Health) — category: `flow-blood`
6. `endometriosis`: Endometriosis — category: `pain-discomfort`
7. `thyroid`: Thyroid Problems & Cycle Changes — category: `hormonal-systemic`
8. `irregular-periods`: Irregular or Missed Periods — category: `cycle-irregularity`

### Data Shape (`src/data/conditions.js`)
```javascript
{
  id: "pcos",                         // Unique URL slug (/conditions/:id)
  title: "PCOS / PCOD (Polycystic Ovary Syndrome)",
  shortName: "PCOS",
  category: "hormonal-systemic",      // Filter category: 'cycle-irregularity' | 'pain-discomfort' | 'flow-blood' | 'hormonal-systemic'
  categoryLabel: "Hormonal & Systemic",
  summary: "A common hormonal condition where the ovaries may develop small follicles and cycles become irregular...",
  symptoms: [
    "Irregular or infrequent menstrual periods",
    "Acne or oily skin",
    "Excess hair growth on face or body (hirsutism)",
    "Hair thinning on the scalp",
    "Weight changes that feel difficult to manage"
  ],
  whenToSeeDoctor: [
    "Periods are absent for 3 or more months (and not pregnant)",
    "Bleeding is unusually heavy or lasts longer than 7 days",
    "Severe pelvic pain occurs"
  ],
  homeComfort: {
    food: "Focus on complex carbs (brown rice, oats, dal), fiber-rich greens, and protein with each meal to support balanced energy...",
    sleep: "Aim for 7–8 hours of consistent sleep to help regulate cortisol and metabolic rhythm.",
    stress: "Practice gentle deep breathing, slow walking, or restorative yoga to lower daily stress.",
    hydration: "Drink 8–10 glasses of water daily to maintain metabolic balance and hydration.",
    heatAndMovement: "Gentle daily walking and regular light strength training support insulin sensitivity and pelvic circulation."
  },
  whatDoctorMayCheck: [
    "Pelvic ultrasound to view ovaries and uterine lining",
    "Hormonal blood panel (testosterone, LH/FSH ratio, fasting insulin)",
    "Thyroid and metabolic screening to rule out other factors"
  ],
  mythsVsFacts: [
    {
      myth: "PCOS means you can never get pregnant.",
      fact: "Many women with PCOS conceive naturally or with standard medical guidance; it is a manageable condition, not an absolute barrier."
    },
    {
      myth: "Only overweight women get PCOS.",
      fact: "PCOS affects people of all body types, including lean individuals (often called 'lean PCOS')."
    }
  ],
  relatedWorkoutIds: ["pcos-rhythm", "follicular-mobility"], // IDs from src/data/workouts.js
  relatedRiskFlagId: "pcos_possible",                         // Matching flag from src/utils/riskScreening.js
  needsReview: true                                           // Quality control flag
}
```

### UI Pages & Architecture
- **`pages/Conditions.jsx` (`/conditions`)**:
  - Live search input matching condition titles, synonyms (PCOD), summaries, and symptoms.
  - Category filter chips (`All`, `Cycle Irregularity`, `Pain & Discomfort`, `Flow & Blood`, `Hormonal & Systemic`).
  - Condition preview cards with `shortName`, summary snippet, tag badges, and chevron link.
  - Medical disclaimer banner and "Needs expert review" status pill.
- **`pages/ConditionDetail.jsx` (`/conditions/:id`)**:
  - Breadcrumbs navigation (`← Back to Conditions Library`).
  - Hero header with condition badge, title, and plain-language summary.
  - Expandable accordion sections for Common Symptoms, Home Comfort Measures, What a Doctor May Check, and Myths vs. Facts.
  - Prominent red-flag alert card (`See a Doctor If...`) with warm, non-alarmist warning styling.
  - Contextual CTA linking to related workouts in `/workouts` and doctor visit scheduling modal.
  - Matching risk flag callout: if the user's active logs show signs of this condition, shows an informational reminder to consult a gynecologist.

### Integrations
- **Insights Integration**: When a risk flag card (e.g. `pcos_possible`) renders on `/insights`, it displays a button: *"Learn about PCOS in our Library →"* pointing to `/conditions/pcos`.
- **Dashboard & Tips Integration**: Discovery pills/cards on the Dashboard and Tips pages invite users to browse the Conditions Library.
- **Workouts Integration**: Routine viewer displays *"Related Condition: Period Cramps (Dysmenorrhea)"* linking directly to `/conditions/dysmenorrhea`.
- **AI Assistant Integration (V2)**: The AI prompt context is seeded with condition summaries so the Gemini assistant can cite verified library pages (`/conditions/:id`) when responding to questions, maintaining consistency and avoiding misinformation.

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
