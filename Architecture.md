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

## 6. AI Flow & Architecture (Version 2 - Task 6.3 onward)

> [!IMPORTANT]
> **Zero-Cost Constraint**: This is a free learning and portfolio project for personal use and demos. **NOTHING paid**. No Cloud Functions, no Google Cloud Billing account linking, and no upgrade to the Blaze plan. The architecture operates 100% on the **free Firebase Spark plan**.

### 6.1 Core Choice: Firebase AI Logic Client SDK (Gemini Developer API)
We utilize **Firebase AI Logic** client-side SDK (`@firebase/ai` / `firebase/ai`) configured with the **Gemini Developer API** provider (`GoogleAIBackend`) on the free Spark plan:
- **Zero Cost / No Credit Card**: Runs completely on the free Spark plan without attaching a billing account.
- **Client-Side Direct Access**: Client app calls Gemini models directly through Firebase's managed gateway (`firebaseml.googleapis.com`), which attaches project authentication tokens internally without exposing raw API keys in client JavaScript.

### 6.2 Firebase Console Enablement Steps (No Billing Required)
1. Ensure your Firebase project is on the **Spark (free) plan** in the [Firebase Console](https://console.firebase.google.com/).
2. In the left navigation menu, go to **Build > AI Logic** (or *AI Services > AI Logic*).
3. Click **Get started**.
4. Select the **Gemini Developer API** provider option (do **NOT** select Agent Platform / Vertex AI, as that requires the Blaze plan).
5. Follow the setup wizard to click **Enable**. The console automatically provisions `firebaseml.googleapis.com` for your project at zero cost.

### 6.3 Firebase App Check Setup (Mandatory from November 2, 2026)
From November 2, 2026, Firebase enforces mandatory App Check for all Firebase AI Logic calls. Unverified requests are rejected at the gateway.

#### 1. Chosen Web Provider: reCAPTCHA v3 (`ReCaptchaV3Provider`)
- **Cost**: 100% Free on the Spark plan (up to 1,000,000 assessments/month at no charge).
- **No Billing Warning**: Avoid Google Cloud reCAPTCHA Enterprise features or Cloud Armor policies that require a Cloud Billing account. Standard reCAPTCHA v3 requires zero billing.
- *(Note on reCAPTCHA Enterprise: While Enterprise has a 10,000 assessment/mo free tier, on the Spark plan it limits risk scores to 4 discrete values and fails with 429 when exceeded. reCAPTCHA v3 is simpler and safer for free portfolio projects).*

#### 2. Web Setup Steps:
1. Register your site at [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) choosing **reCAPTCHA v3**.
2. Add your production domain(s) (e.g. `your-project.web.app`, `your-project.firebaseapp.com`, or Netlify domain). **Do NOT add `localhost`**.
3. In [Firebase Console > App Check > Apps](https://console.firebase.google.com/), select your Web App, click **Register**, select **reCAPTCHA v3**, paste your reCAPTCHA Secret Key, and save.
4. Add the public site key to your client `.env`: `VITE_RECAPTCHA_SITE_KEY=your-site-key`.

#### 3. Local Development with Debug Token (Localhost):
When developing on `localhost`, production reCAPTCHA tokens fail. Use the App Check Debug Provider:
1. In your app initialization (e.g., `src/firebase.js`), enable debug mode during local development:
   ```javascript
   if (import.meta.env.DEV) {
     self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
   }
   ```
2. Start the dev server (`npm run dev`) and open browser DevTools console (`F12`). Look for the log:
   ```text
   AppCheck debug token: "12345678-abcd-1234-ef01-123456789abc"
   ```
3. Copy the UUID token. In **Firebase Console > App Check > Apps tab**, click the 3-dots menu for your Web app -> **Manage debug tokens**.
4. Click **Add debug token**, paste the copied UUID, label it `Localhost Dev`, and save. Localhost requests are now authorized without CAPTCHA challenges.

### 6.4 Rate Limits, Models, and Friendly Error Handling

#### 1. Rate Limits
- **Gateway Per-User Limit**: Firebase AI Logic enforces a default limit of **100 requests per minute (RPM) per user** to prevent client loops from exhausting project quotas.
- **Model Free-Tier Request Limits**:
  - Model: `gemini-1.5-flash` or `gemini-2.0-flash` *(verify exact active model name at build time)*.
  - Free-tier quotas via Gemini Developer API (subject to Google AI Studio limits): ~15 RPM, 1,500 RPD (requests per day), 1,000,000 TPM *(verify exact numbers at build time; do not guess)*.

#### 2. Friendly Quota & Rate Limit Error Handling
When the user or project reaches a rate limit or daily quota, the Firebase SDK throws an error with `code: 'resource-exhausted'` or HTTP `429 RESOURCE_EXHAUSTED`.
The app catches this and displays a calm, friendly alert:
> *"We're receiving a lot of questions right now! You've reached the free-tier question limit. Please take a gentle pause and try asking again in a few minutes."*

### 6.5 Soft Daily Per-User Rate Limiter in Firestore
Because the client SDK connects directly to Gemini without a custom backend server, we implement an application-level **soft rate limiter** in Firestore to pace queries (e.g., max 15 questions per user per day).

#### 1. Document Structure
Path: `users/{userId}/aiUsage/{YYYY-MM-DD}`
```javascript
{
  count: 1,                          // number of queries today
  lastUpdated: serverTimestamp()
}
```

#### 2. Firestore Security Rules
```
match /users/{userId}/aiUsage/{date} {
  // Owner can read their own daily usage count
  allow read: if request.auth != null && request.auth.uid == userId;

  // Create today's doc when starting at count 1
  allow create: if request.auth != null && request.auth.uid == userId
                && request.resource.data.count == 1;

  // Increment strictly by 1 up to soft limit of 15 queries per day
  allow update: if request.auth != null && request.auth.uid == userId
                && request.resource.data.count == resource.data.count + 1
                && request.resource.data.count <= 15;

  // Prevent deletions
  allow delete: if false;
}
```

#### 3. Honest Documentation: Soft Limit
This is honestly documented as a **soft limit**. While Firestore rules strictly prevent updating the database counter beyond 15, a technical user with browser DevTools could technically invoke the client SDK directly. This soft limiter effectively prevents accidental loops, rapid double-clicks, and excessive queries in standard app usage.

### 6.6 Free-Tier Data Terms & Transparent Disclosures
Under Google's Gemini Developer API free-tier terms, Google may use prompt inputs and generated outputs to train and improve its products, and human reviewers may read submitted data.

#### Exact Disclosure Line:
The following exact disclosure must appear prominently in the **AI Consent Screen**, the **Privacy Page**, and the project **README**:
> **"Your question and cycle context are processed by Google and may be reviewed."**

#### Project Context:
- This is a free learning and portfolio project for personal use and demonstrations, **not a medical device or medical advice**.
- We do **not** tell users to avoid real data, but we are completely honest about where data goes.
- Any claim that data "never leaves your device" or is "100% private from AI vendors" is strictly removed.

### 6.7 Context Payload (Zero PII Privacy Principle)
To minimize shared data, the client sends **ONLY** cycle context; **NEVER name, email, account UID, or date of birth**:
```javascript
{
  question: "Why do I feel so tired and craving chocolate today?",
  context: {
    currentPhase: "luteal",            // 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
    cycleDay: 24,                      // number (days into cycle)
    dietPreference: "veg",             // 'veg' | 'non-veg' | 'eggetarian'
    recentSymptoms: ["fatigue", "bloating", "cramps"], // Deduplicated symptoms from last 7 days
    activeRiskFlags: ["pcos_possible"] // Detected pattern IDs from riskScreening.js (or [])
  }
}
```

### 6.8 Multi-Layer Safety Flow
1. **Mandatory AI Consent Check**:
   - The user must explicitly have `profile.aiConsent === true` in Firestore before the AI assistant can be accessed.
   - If `false`, the user is presented with the consent modal including the Google review disclosure.
2. **Pre-Call Client Red-Flag Intercept**:
   - The client scans user input *before* sending anything to the AI.
   - If red-flag symptoms are detected (acute severe pain $\ge 9/10$, bleeding $> 7$ consecutive days, sudden fainting/dizziness, fever with pelvic pain), the UI **immediately short-circuits** and renders the **Urgent Doctor Referral Card** without making any AI call.
3. **System Prompt Guardrails**:
   - Friendly period and nutrition guide, strictly **not a doctor**.
   - Strictly prohibited from diagnosing conditions or recommending prescription medications or supplement doses.
   - Comfort care must strictly say *"may help ease discomfort"*, never cure or treat.
   - Grounded in the app's verified educational Conditions Library: references `/conditions/:id` pages (`/conditions/pcos`, `/conditions/dysmenorrhea`, `/conditions/anemia`, etc.).
4. **Mandatory Post-Response Disclaimer**:
   - Every AI response bubble is permanently anchored with the standard medical disclaimer banner.

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
