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
- Phase: Phase 1 (Setup and Auth) in progress. Tasks 1.1, 1.2, and 1.3 completed.
- Next task: Task 1.4 in Tasks.md (Build Signup and Login pages: mobile-first, per Design.md).

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

(Add a new row after each completed task: date, what changed, any decision made.)
