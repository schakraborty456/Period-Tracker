# Rules (for the AI coding agent and contributors)

Read this file, PRD.md, Architecture.md, Design.md, Memory.md, and Tasks.md before starting any task.

## 1. Workflow Rules
1. Work on **one task at a time** from Tasks.md. Do not build features that were not asked for.
2. After finishing a task, stop, summarize what changed, and wait for the next instruction.
3. Update Tasks.md (tick the box) and Memory.md (log decisions) after each task.
4. Ask before changing the tech stack, data model, or folder structure.
5. Make small, reviewable changes. Suggest a clear git commit message at the end of each task.

## 2. Tech Rules
- Use React (Vite) with functional components and hooks only.
- Use Tailwind CSS for styling. No other CSS framework.
- Use Firebase v9+ modular SDK.
- Use plain JavaScript unless told otherwise.
- Keep components small and reusable. One component per file.
- All Firestore reads and writes go through `services/firestore.js`. No direct DB calls inside components.
- Handle loading, empty, and error states for every data-driven screen.

## 3. Security Rules (non-negotiable)
- Never hardcode API keys or secrets. Use environment variables (`VITE_...` for Firebase config only).
- Never commit `.env`. Keep `.env.example` with placeholder values.
- The Gemini API key must **never** exist in frontend code. Call it only through Cloud Functions or Firebase AI Logic.
- Firestore rules must restrict each user to her own data. Test the rules.
- Never log sensitive user data (dates, symptoms) to the console in production.
- Never send name, email, or user ID to the AI. Send only the minimum context needed.

## 4. Cycle Logic Rules
- Cycle calculation lives only in `utils/cycleCalculator.js` as pure functions.
- **Never use AI for dates or predictions.**
- Write unit tests (Vitest) for: normal cycle, short cycle, long cycle, late period, month and year boundaries, leap year.
- Use local dates (date-fns), not UTC timestamps, to avoid off-by-one-day bugs.
- Always show predictions as estimates ("expected around"), not guarantees.

## 5. Health Content Rules
- Nutrition tips come only from `data/nutritionTips.js`. Do not invent health facts.
- Content must be marked as "needs expert review" until reviewed by a doctor or nutritionist.
- No diagnosis, no medicine or dosage advice, no supplement recommendations beyond food.
- Do not present fertile window or ovulation as contraception advice.
- Use gentle, neutral language. Avoid fear-based wording.
- Show a disclaimer on the dashboard, in the AI assistant, and on the Tips page.

## 5.1 Red-Flag Symptoms (always recommend seeing a doctor)
Very heavy bleeding (soaking a pad every hour), severe or unbearable pain, fainting or dizziness with bleeding, period missed for 3 or more months (not pregnant), bleeding lasting more than 7 days, pregnancy or suspected pregnancy, fever with pelvic pain.

## 6. AI Assistant Rules
System prompt must include:
- You are a friendly period and nutrition information assistant, not a doctor.
- Use the provided context (phase, cycle day, diet preference, recent symptoms) to personalize answers.
- Do not diagnose conditions or prescribe medicine.
- If red-flag symptoms are mentioned, advise seeing a doctor promptly.
- Keep answers short, simple, and kind. Reply in the user's language.
- Stay on topic (periods, cycle, nutrition, self-care). Politely decline unrelated requests.
- Always end with a short disclaimer.

Also:
- Rate limit AI calls per user.
- Require sign-in and `aiConsent = true` before any AI call.

## 7. Privacy Rules
- Collect only the data the app needs.
- Show a privacy policy and get consent during onboarding.
- Provide "Delete my account and data" in Settings.
- No third-party analytics or ads that receive health data.

## 8. Code Quality Rules
- Meaningful names, short functions, comments only where logic is not obvious.
- No unused code or dead imports.
- Accessible markup (labels, aria attributes, semantic HTML).
- Mobile-first responsive styles.
- Run lint and tests before marking a task done.

## 9. UI Rules
- Follow Design.md for colors, fonts, and spacing.
- Never rely on color alone. Always add text labels.
- All user-facing text goes through the i18n layer once V2 starts (no hardcoded strings after that).
