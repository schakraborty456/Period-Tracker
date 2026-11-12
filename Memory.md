# Memory

Persistent project context. The AI agent should read this at the start of every session and update it after every meaningful change.

## 1. Project Summary
A period tracker and nutrition guide web app (React + Tailwind + Firebase) with a personalized AI assistant (Gemini). Users enter their own cycle data and get predictions, phase-wise nutrition tips, daily logs, and AI answers based on their data.

Built as a portfolio / resume project to show full-stack, AI integration, and security skills.

## 2. Owner Context
- Builder is a student/early-career developer using Antigravity to write code.
- Prefers simple explanations. Communicates in Bangla (romanized) and English.
- Wants to understand the project step by step, one feature at a time.

## 3. Decisions Made
| Decision | Choice | Reason |
|---|---|---|
| Frontend | React (Vite) + Tailwind | Requested by owner, simple and fast |
| Backend | Firebase (Auth, Firestore, Hosting) | No custom backend needed, free tier |
| AI | Gemini API via Firebase AI Logic or Cloud Functions | Same Google ecosystem, free tier, key stays server side |
| Prediction logic | Rule-based formula, no AI | Accuracy and trust |
| Nutrition content | Static reviewed content file | Safe, free, no AI errors |
| App type | PWA (installable website) | Works on all devices, one codebase |
| Build order | V1 without AI first, AI added in V2 | Working app first, then AI on top of real data |
| Languages | English first, Bangla in V2 | Reduce V1 scope |
| Risk screening | Rule-based formula only, no AI | Pure pattern detection for PCOS, anemia, endometriosis, thyroid signs; never diagnoses; requires >= 3 cycles or 2 months of logs; lifestyle guidance only; placed before AI assistant in V2 |
| Home workouts | Static reviewed library by phase & symptom | Gentle movements (cramps: cat-cow, child's pose; PCOS: walking, surya namaskar; 10–20 min, Easy/Medium); non-medicinal relief |

## 4. Conventions
- Language: JavaScript (not TypeScript).
- Dates stored as `YYYY-MM-DD` strings (local date) to avoid timezone bugs.
- Firestore paths: `users/{uid}`, `users/{uid}/periods/{id}`, `users/{uid}/dailyLogs/{date}`.
- Diet values: `"veg"`, `"non-veg"`, `"eggetarian"`.
- Phase values: `"menstrual"`, `"follicular"`, `"ovulation"`, `"luteal"`.
- Pain score range: `0` (no pain) to `10` (unbearable pain).
- Extra symptom tag keys: `"acne"`, `"excess_hair"`, `"hair_loss"`, `"weight_change"`, `"dark_patches"`.
- Risk screening wording convention: Always *"Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist)."* Never declare a medical diagnosis.

## 5. Current Status
- Phase: Phase 5 (Tasks 5.1–5.5 completed) & Phase 6 (Tasks 6.2a–6.2d completed).
- Next task: Task 6.2e in Tasks.md (Build Doctor Report export summarizing cycle history, symptom frequency, and pain scores for gynecologist consultations).

## 6. Open Questions
- Who will review the nutrition content (doctor / nutritionist)?
- Which sign-in methods to support beyond email/password (Google)?
- Final app name and logo.
- Notification method for reminders (Firebase Cloud Messaging vs email).

## 7. Known Risks and Notes
- Health content must be reviewed by an expert before public launch.
- AI answers must never be treated as medical advice.
- Irregular cycles make predictions less accurate; always show ranges or "around" wording.

## 8. Change Log
| Date | Change |
|---|---|
| 2026-11-04 | Project planned. Created PRD, Architecture, Design, Rules, Memory, Tasks. |
| 2026-11-05 | Completed Task 1.1: Created Vite + React project, configured Tailwind CSS with Design.md design tokens, installed React Router and date-fns, created folder structure from Architecture.md with placeholders, added .gitignore. Verified build and dev server. |
| 2026-11-05 | Completed Task 1.2: Installed Firebase SDK, created .env with config, added .env.example, configured src/firebase.js with modular v9+ auth and firestore instances. |
| 2026-11-05 | Completed Task 1.3: Built AuthContext and useAuth hook managing signup, login, logout, and auth state persistence via onAuthStateChanged. Wrapped App in AuthProvider. |
| 2026-11-05 | Completed Task 1.4: Created reusable Button and Input components, built mobile-first Login and Signup pages per Design.md with validation, loading states, friendly error messages, and configured routes in App.jsx. |
| 2026-11-05 | Completed Task 1.5: Built ProtectedRoute component to guard private routes based on auth state, created mobile-first placeholder Dashboard with user info & sign out, and updated routing in App.jsx. |
| 2026-11-05 | Completed Task 1.6: Wrote initial firestore.rules restricting access strictly to authenticated users for their own document tree (`/users/{userId}/**`), added firebase.json. Phase 1 complete! |
| 2026-11-05 | Completed Task 2.1: Built 3-step mobile-first Onboarding form (Cycle details with date validation, About You with age and diet cards, Consent & medical disclaimer), added route in App.jsx. |
| 2026-11-05 | Completed Task 2.2: Built services/firestore.js with modular v9+ functions (saveUserProfile, getUserProfile, addPeriod, getUserPeriods, saveOnboardingData) and connected onboarding submission and dashboard data retrieval. |
| 2026-11-05 | Completed Task 2.3: Built pure date helper utilities in dateHelpers.js and deterministic cycle calculation functions in cycleCalculator.js (next period, ovulation, fertile window, cycle day, phase identification, late handling). |
| 2026-11-05 | Completed Task 2.4: Installed Vitest and configured npm test in package.json. Wrote comprehensive unit tests covering normal, short, long, late cycles, month/year boundaries, and leap year (all 19 tests pass). |
| 2026-11-05 | Completed Task 2.5: Implemented detectIrregularCycle (<21 or >38 days, or >7 days variation), getCycleLengthsFromPeriods, and 3-cycle averaging (getEffectiveCycleLength). Integrated into Dashboard with respectful irregular notice and added 10 unit tests (29 passing). Phase 2 complete! |
| 2026-11-05 | Completed Task 3.1: Created data/nutritionTips.js with 4 cycle phases x 3 diet options (veg, non-veg, eggetarian) featuring locally familiar foods (dal, shak, mach, gur, til, kola), marked "needs expert review", helper functions, and 8 automated unit tests (37 passing total). |
| 2026-11-05 | Completed Task 3.2: Built reusable PhaseBadge, Card, CycleRing (SVG 4-phase dial with day marker), and mobile BottomNav. Elevated Dashboard with Phase Hero Card, live countdown, 4-phase breakdown strip, and quick log action. |
| 2026-11-05 | Completed Task 3.3: Built TodayNutritionCard component with interactive diet toggles (Non-Veg, Veg, Eggetarian), Eat vs Avoid tabs, self-care suggestions, and content review status badge. Integrated into Dashboard under cycle status. |
| 2026-11-05 | Completed Task 3.4: Built full Tips page (src/pages/Tips.jsx) with interactive 4-phase tabs, live user current-phase highlight, diet preference filter, Eat vs Avoid food cards with Indian/Bengali items, movement guidance, and disclaimer. Connected to /tips route in App.jsx. |
| 2026-11-05 | Completed Task 3.5: Built reusable DisclaimerBanner component (medical & review disclaimer per PRD Sec 12) and LatePeriodCard component (reassuring guidance, reasons for natural cycle fluctuations, prompt to log period start date). Added to Dashboard and Tips pages. Phase 3 complete! |
| 2026-11-05 | Completed Task 4.1: Built comprehensive Daily Log form (src/pages/Log.jsx) with flow selector cards (none, spotting, light, medium, heavy), mood emoji chips, 12 symptom tags, interactive water tracker with glass indicators, personal notes, and day-by-day date navigator. Connected to /log route in App.jsx. |
| 2026-11-05 | Completed Task 4.2: Implemented Firestore saveDailyLog, getDailyLog, and getUserDailyLogs query functions with input sanitization and merge support. Verified multi-date load/save logic in Log page and added automated integration test suite in firestore.test.js (43 passing tests total). |
| 2026-11-05 | Completed Task 4.3: Implemented shouldSuggestNewPeriod in cycleCalculator.js and recordNewPeriodAndRecalculate in firestore.js. When active flow is logged for a new cycle, automatically calculates completed previous cycle length, creates period record, recalculates 3-cycle average, and syncs profile. Added 7 unit tests (50 passing tests total). |
| 2026-11-05 | Completed Task 4.4: Built RecentLogsCard component displaying recent daily logs with relative dates (Today, Yesterday), flow level, mood emojis, water intake, symptom tags, and notes snippet, plus inviting empty state with quick log CTA. Connected to Dashboard. Phase 4 complete! |
| 2026-11-05 | Completed Task 5.1: Built Settings page (src/pages/Settings.jsx) with profile and cycle editing, diet switcher, AI consent controls, sign out, and full GDPR-compliant "Delete Account & All Data" modal flow (wiping Firestore periods, dailyLogs, profile, and Auth account). Added deleteUserAllData with tests (51 passing tests). |
| 2026-11-05 | Completed Task 5.2: Built comprehensive Privacy Policy and Data Security page (src/pages/Privacy.jsx) covering zero data monetization, strict Firestore security rules isolation, AI anonymization guardrails, and GDPR erasure rights. Linked from /privacy route, Settings, Onboarding step 3, Signup, and Login. |
| 2026-11-06 | Completed Task 5.3: Installed and configured vite-plugin-pwa in vite.config.js with autoUpdate, standalone mobile manifest (name, colors, orientation), Workbox caching strategy for offline shell and Google fonts, generated 192px/512px/maskable PNG icons and SVG favicon in public/, and added PWA meta tags in index.html. |
| 2026-11-06 | Completed Task 5.4: Conducted comprehensive accessibility (a11y) and responsiveness audit per Design.md and WCAG AA guidelines. Upgraded all interactive touch targets (back buttons, date navigators, water steppers, nutrition tabs) to minimum 44px hit areas. Added global visible focus ring (:focus-visible) and prefers-reduced-motion override in index.css. Enhanced phase badge contrast with dedicated dark text colors (#9F1239, #065F46, #854D0E, #581C87). All 51 tests pass. |
| 2026-11-06 | Completed Task 5.5: Tested and verified Firestore security rules (firestore.rules). Built rules simulator and comprehensive automated test suite (src/services/firestoreRules.test.js) validating: authenticated owner access to profile, periods, and dailyLogs; cross-user isolation (Bob blocked from Alice's records); unauthenticated access prevention; and global default-deny on non-user collections. Verified integrity and syntax against open rules. All 69 tests pass. |
| 2026-11-12 | Planned "Risk Screening + Home Workouts" feature for Version 2: Updated PRD.md, Rules.md, Architecture.md, Tasks.md, and Memory.md. Feature uses pure deterministic rules (no AI detection), minimum data threshold (>= 3 cycles or 2 months of logs), explicit consent and medical disclaimer, lifestyle-only guidance, and doctor referral prompts; structured tasks 6.2a–6.2f added before AI assistant. |
| 2026-11-12 | Completed Task 6.2a: Expanded Daily Log form (src/pages/Log.jsx) and Firestore service (src/services/firestore.js) with 0–10 pain intensity slider/stepper, 5 new symptom tags (acne, excess hair growth, hair loss, weight change, dark skin patches), and optional sleep duration and body weight inputs. Ensured full backwards compatibility for legacy logs missing new fields, preserved 44px hit areas, and added unit tests in firestore.test.js and symptoms.test.js (74 tests passing). |
| 2026-11-12 | Completed Task 6.2b: Created pure rule-based risk screening engine (src/utils/riskScreening.js) with named constants, minimum data gate (3 completed cycles or 60 log days), non-diagnostic phrasing ("Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist)."), and rule-based detectors for PCOS, Anemia, Severe Pain/Endometriosis, Thyroid irregularity, and 90-day/7-day red flags. Added 24 Vitest unit tests in riskScreening.test.js (98 tests passing). |
| 2026-11-12 | Completed Task 6.2c: Created data/riskFlags.js with lifestyle-only recommendations (marked "needs expert review") and doctor discussion points. Built mobile-first Insights page (src/pages/Insights.jsx) featuring upfront user consent gate, mandatory non-diagnostic disclaimer ("Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist)."), minimum data progress tracker (cycles & days), flag detail cards, collapsible self-care guidance, consent revocation modal, added /insights route in App.jsx, bottom navigation link in BottomNav.jsx, and settings integration. (107 tests passing). |
| 2026-11-12 | Completed Task 6.2d: Created data/workouts.js with 7 phase- and symptom-tailored home routines (cramps relief, PCOS rhythm, follicular mobility, ovulation sculpt, luteal grounding, bloat relief, back soother; 10–20 min, Easy/Medium, marked "needs expert review"). Built Workouts page (src/pages/Workouts.jsx) with current-phase recommendation, phase & symptom filtering, interactive step-by-step routine viewer/player, safety notice, URL query param support (?symptom=, ?phase=), registered /workouts route in App.jsx, and linked from Insights, Tips, and Dashboard. Added 10 unit tests in workouts.test.js (117 tests passing). |

(Add a new row after each completed task: date, what changed, any decision made.)
