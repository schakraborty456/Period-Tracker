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

## 4. Conventions
- Language: JavaScript (not TypeScript).
- Dates stored as `YYYY-MM-DD` strings (local date) to avoid timezone bugs.
- Firestore paths: `users/{uid}`, `users/{uid}/periods/{id}`, `users/{uid}/dailyLogs/{date}`.
- Diet values: `"veg"`, `"non-veg"`, `"eggetarian"`.
- Phase values: `"menstrual"`, `"follicular"`, `"ovulation"`, `"luteal"`.

## 5. Current Status
- Phase: Phase 5 (Polish, PWA, and Deploy) in progress. Task 5.1 completed.
- Next task: Task 5.2 in Tasks.md (Privacy policy and consent screens).

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

(Add a new row after each completed task: date, what changed, any decision made.)
