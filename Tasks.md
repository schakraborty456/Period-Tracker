# Tasks

Work in order. One task at a time. Tick the box when done and update Memory.md.

## Phase 0: Preparation (owner does this)
- [x] 0.1 Create a Firebase project in the Firebase console
- [x] 0.2 Add a Web App and copy the config keys
- [ ] 0.3 Enable Authentication (Email/Password)
- [ ] 0.4 Create a Firestore database (production mode)
- [x] 0.5 Create a GitHub repo
- [ ] 0.6 Install Node.js and Firebase CLI

## Phase 1: Setup and Auth (V1)
- [x] 1.1 Create Vite + React project, install Tailwind CSS, React Router, date-fns
- [x] 1.2 Set up `firebase.js` with environment variables and add `.env.example`
- [x] 1.3 Build AuthContext (signup, login, logout, session persistence)
- [x] 1.4 Build Signup and Login pages (mobile-first, per Design.md)
- [x] 1.5 Add protected routes and a placeholder Dashboard
- [x] 1.6 Write initial `firestore.rules` (user can only access own data)

## Phase 2: Onboarding and Cycle Logic (V1)
- [x] 2.1 Build 3-step Onboarding form (dates, lengths, diet, age, consent)
- [x] 2.2 Save profile and first period to Firestore through `services/firestore.js`
- [x] 2.3 Write `utils/cycleCalculator.js` (next period, ovulation, fertile window, current phase)
- [x] 2.4 Write unit tests for the calculator (normal, short, long, late, boundaries, leap year)
- [x] 2.5 Add irregular-cycle detection and the average of the last 3 cycles

## Phase 3: Dashboard and Nutrition (V1)
- [x] 3.1 Create `data/nutritionTips.js` (4 phases x veg / non-veg / eggetarian), marked "needs review"
- [x] 3.2 Build Dashboard: phase card, cycle day, days until next period, phase ring
- [x] 3.3 Show today's nutrition and self-care tips filtered by diet
- [x] 3.4 Build Tips page with phase tabs
- [x] 3.5 Add late-period state and disclaimer banner

## Phase 4: Daily Log (V1)
- [x] 4.1 Build Daily Log form (flow, mood, symptoms, water, notes)
- [x] 4.2 Save and load logs by date
- [x] 4.3 Detect a new period start and create a period record, update cycle averages
- [x] 4.4 Show recent logs on the Dashboard

## Phase 5: Polish, PWA, and Deploy (V1)
- [x] 5.1 Settings page (profile edit, delete account and data)
- [x] 5.2 Privacy policy and consent screens
- [x] 5.3 Add vite-plugin-pwa (manifest, icons, offline shell)
- [x] 5.4 Accessibility and responsive review
- [x] 5.5 Test Firestore security rules (own data allowed, other users blocked)
- [ ] 5.6 Deploy to Firebase Hosting (Deploy last: only after all features, AI and security hardening are done)
- [ ] 5.7 Nutrition content reviewed by an expert (owner)

## Phase 6: Version 2
- [ ] 6.1 Bangla + English (i18n)
- [ ] 6.2 History calendar and cycle length graph
- [x] 6.2a Expand Daily Log & Firestore with new symptom tags (acne, excess hair growth, hair loss, weight change, dark skin patches), painScore (0–10), and optional sleep/weight
- [x] 6.2b Build utils/riskScreening.js (rule-based flag engine for PCOS, anemia, endometriosis, thyroid, red flags) with comprehensive Vitest unit tests and minimum data gate (>= 3 cycles or 2 months)
- [x] 6.2c Build Insights page (pages/Insights.jsx) with upfront user consent, medical disclaimer, risk flag cards, and lifestyle-only recommendations (marked "needs expert review")
- [x] 6.2d Create data/workouts.js and build Workouts page (pages/Workouts.jsx) with phase- and symptom-tailored home routines (cramps relief, PCOS, 10–20 min, Easy/Medium)
- [x] 6.2e Build Doctor Report export (pages/DoctorReport.jsx) summarizing cycle history, symptom frequency, and pain scores for gynecologist consultations
- [x] 6.2f Add doctor visit reminders and red-flag escalation prompts (no period for 3 months, bleeding > 7 days)
- [x] 6.2g Define Conditions Library schema and write initial 3 conditions in `src/data/conditions.js` (PCOS/PCOD, PMS, Period Cramps/Dysmenorrhea) with helper functions and automated banned-words & schema Vitest test suite (created early in `src/data/conditions.test.js`)
- [x] 6.2h Add remaining 5 conditions to `src/data/conditions.js` (Heavy periods, Anemia, Endometriosis, Thyroid problems & cycle changes, Irregular or missed periods)
- [x] 6.2i Extend automated banned-words & data schema Vitest test suite (`src/data/conditions.test.js`) to cover all 8 conditions, whole-word matching verification, and risk flag linkages
- [x] 6.2j Build Conditions Library list page (`pages/Conditions.jsx`) with live search, category filter chips, condition preview cards, medical disclaimer, and register `/conditions` route in App.jsx
- [x] 6.2k Build Condition Detail page (`pages/ConditionDetail.jsx`) at `/conditions/:id` with expandable sections (symptoms, doctor red flags, comfort care, clinical tests, myths vs facts, related workouts link, matching risk flag banner), 44px tap targets, and expert review badge
- [x] 6.2l Integrate Conditions Library entry points across app: link matching Insights risk flag cards to `/conditions/:id`, add library discovery cards on Dashboard, Tips page, and related condition links in Workouts
- [x] 6.2m Add fibroids, adenomyosis, pmdd
- [x] 6.3a SDK and App Check setup: Configure Firebase AI Logic client SDK (`firebase/ai`) with Gemini Developer API (`GoogleAIBackend`) on the free Spark plan and App Check with reCAPTCHA Enterprise (`ReCaptchaEnterpriseProvider`, score-based key in Essentials tier, no billing) with debug token for localhost development (`self.FIREBASE_APPCHECK_DEBUG_TOKEN = true`). Gracefully handle missing key with dev-only warning. Export `ai` from `src/firebase.js`. Configure `.env.example`.
- [ ] 6.3b AI service with system prompt: Create `src/services/ai.js`. Configure `getGenerativeModel` with a STABLE (non-preview) model from Firebase AI Logic supported models (such as `gemini-2.5-flash` or `gemini-2.5-flash-lite`, verify at build time; no preview models) and set `maxOutputTokens`. Dynamically import the 11 verified conditions from `src/data/conditions.js` and inject their IDs/titles into system instruction for strict `/conditions/:id` Markdown linking. Add non-diagnostic, educational-only, "may help ease discomfort" comfort care guardrails.
- [ ] 6.4a Pre-call red-flag short-circuit: Build client-side red-flag check in `src/utils/aiRedFlagCheck.js` scanning question text before API call. If red-flag symptoms are detected (severe pain >= 9/10, bleeding > 7 days, fainting/dizziness, fever with pelvic pain), immediately intercept and show Urgent Doctor Referral Card without making any AI request.
- [ ] 6.4b AI consent gate & zero-PII context builder: Check `profile.aiConsent` before allowing assistant access. Present consent modal with mandatory disclosure: *"Your question and cycle context are processed by Google and may be reviewed."* Build sanitized cycle context payload (`currentPhase`, `cycleDay`, `dietPreference`, recent 7-day symptoms, active risk flags); never send name, email, or user ID.
- [ ] 6.4c Firestore soft daily rate counter: Implement daily query tracking at `users/{userId}/aiUsage/{YYYY-MM-DD}` (up to 15 queries/day). Note: application-level soft limit under current wildcard rules. Add friendly 429 / `resource-exhausted` rate-limit handling ("We're receiving a lot of questions right now...").
- [ ] 6.5a Assistant chat page (`pages/Assistant.jsx`): Build mobile-first chat UI with header, message history bubbles (user vs assistant), auto-scroll, loading indicator with calm pulsing animation, text input with submit button, and register `/assistant` route in `App.jsx`.
- [ ] 6.5b Suggested questions, condition links & disclaimer banner: Add quick-tap suggested question chips tailored to current cycle phase, rich Markdown link rendering for `/conditions/:id` pages, persistent medical disclaimer banner under AI responses, and bottom navigation / dashboard entry points.
- [ ] 6.6 Reminders: in-app cycle phase countdowns, late period card, and doctor visit calendar integration (Push & email notifications out of scope: requires paid or server-side services)
- [ ] 6.7 Exercise / yoga tips, water tracker improvements
- [ ] 6.8 Irregular cycle alert in the UI
- [ ] 6.9 Dark mode

## Security hardening (do later, after AI works)
- [ ] (1) Replace the wildcard Firestore rule with explicit subcollection rules (profile, periods, dailyLogs, doctorVisits, aiUsage) so owner cannot bypass aiUsage counter
- [ ] (2) aiUsage soft daily cap rule plus updated rules tests
- [ ] (3) Friendly rate-limit error handling
- [ ] (4) Privacy page and README wording about Google processing AI questions
- [ ] (5) Re-verify the model name against the Firebase AI Logic supported models page

## Phase 7: Version 3
- [ ] 7.1 AI pattern insights from logs
- [ ] 7.2 AI daily smart tip on the Dashboard
- [ ] 7.3 Myths vs facts and hygiene guide
- [ ] 7.4 Private / discreet mode
- [ ] 7.5 Ask an expert (optional)

## Done Definition (for every task)
- Works on mobile width (360px) and desktop
- Loading, empty, and error states handled
- No secrets in code
- Lint and tests pass
- Tasks.md and Memory.md updated
