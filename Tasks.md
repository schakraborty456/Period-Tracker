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
- [ ] 5.6 Deploy to Firebase Hosting
- [ ] 5.7 Nutrition content reviewed by an expert (owner)

## Phase 6: Version 2
- [ ] 6.1 Bangla + English (i18n)
- [ ] 6.2 History calendar and cycle length graph
- [x] 6.2a Expand Daily Log & Firestore with new symptom tags (acne, excess hair growth, hair loss, weight change, dark skin patches), painScore (0–10), and optional sleep/weight
- [x] 6.2b Build utils/riskScreening.js (rule-based flag engine for PCOS, anemia, endometriosis, thyroid, red flags) with comprehensive Vitest unit tests and minimum data gate (>= 3 cycles or 2 months)
- [ ] 6.2c Build Insights page (pages/Insights.jsx) with upfront user consent, medical disclaimer, risk flag cards, and lifestyle-only recommendations (marked "needs expert review")
- [ ] 6.2d Create data/workouts.js and build Workouts page (pages/Workouts.jsx) with phase- and symptom-tailored home routines (cramps relief, PCOS, 10–20 min, Easy/Medium)
- [ ] 6.2e Build Doctor Report export (pages/DoctorReport.jsx) summarizing cycle history, symptom frequency, and pain scores for gynecologist consultations
- [ ] 6.2f Add doctor visit reminders and red-flag escalation prompts (no period for 3 months, bleeding > 7 days)
- [ ] 6.3 Set up AI backend (Cloud Function or Firebase AI Logic), key stored server side
- [ ] 6.4 System prompt, red-flag detection, rate limiting, consent check
- [ ] 6.5 Assistant chat page with suggested questions and disclaimer
- [ ] 6.6 Reminders (period, water) using FCM or email
- [ ] 6.7 Exercise / yoga tips, water tracker improvements
- [ ] 6.8 Irregular cycle alert in the UI
- [ ] 6.9 Dark mode

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
