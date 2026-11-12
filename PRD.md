# PRD: Period Tracker + Nutrition Guide (with AI Assistant)

## 1. Overview
A web app (installable as a PWA) where each user logs her period data and gets **personalized** cycle predictions, phase-wise nutrition and lifestyle guidance, and an AI assistant that answers questions using her own cycle data.

## 2. Problem
- Many women do not know what to eat or do in each phase of their cycle.
- Generic chatbots (ChatGPT, Gemini) give general answers and know nothing about the user's own cycle.
- Existing trackers rarely focus on Bangla-friendly, locally familiar food (dal, shak, mach, gur, til, kola).

## 3. Target Users
- Primary: girls and women aged 15 to 45, in India and Bangladesh.
- Secondary: anyone who wants to understand their cycle better.
- Languages: English first, Bangla in Version 2.

## 4. Goals
- Let every user input her own data and get results specific to her.
- Give accurate, rule-based cycle prediction.
- Give phase-wise nutrition and self-care tips (veg / non-veg aware).
- Provide an AI assistant that uses the user's phase and logs for context.
- Keep user data private and secure.

## 5. Non-Goals
- Not a medical diagnosis tool (screening for risk flags only; never diagnoses conditions like PCOS, anemia, endometriosis, or thyroid issues).
- No medical prescriptions, medicine advice, or supplement dosage recommendations.
- Not a contraception or fertility planning tool (no "safe days" claims).
- No social features or public sharing in V1.

## 6. User Stories
- As a user, I can sign up and log in so my data is saved privately.
- As a user, I enter my last period date, cycle length, and period length so the app can predict my next period.
- As a user, I see which phase I am in today and what to eat.
- As a user, I log daily symptoms, mood, flow, water intake, and pain score (0–10).
- As a user, I can view past cycles on a calendar and graph.
- As a user with sufficient data (at least 3 cycles or 2 months of logs), I can view risk screening insights to identify possible signs of PCOS, anemia, endometriosis, or thyroid issues so I can consult a gynecologist.
- As a user, I can access home workout routines tailored to my phase and symptoms (e.g., cat-cow and child's pose for cramps; walking, surya namaskar, and strength training for PCOS) to manage discomfort naturally.
- As a user, I can export a structured Doctor Report summarizing my cycle history, symptoms, and pain scores to bring to my doctor appointment.
- As a user, I can ask the AI assistant questions and get answers based on my phase, symptoms, and active risk screening context.
- As a user, I can delete my account and all my data.

## 7. Features by Version

### Version 1 (MVP)
1. Signup / login (Firebase Auth, email + password)
2. Onboarding form: last period date, cycle length, period length, age, veg / non-veg
3. Cycle calculator: next period, ovulation window, current phase (rule-based)
4. Dashboard: current phase, days until next period, phase nutrition tips
5. Daily log: symptoms, mood, flow, water
6. Mobile-first UI + PWA install
7. Disclaimer, privacy policy, delete-my-data

### Version 2
1. Risk screening & pattern insights (rule-based detection of possible signs of PCOS, anemia, endometriosis, thyroid issues; minimum 3 cycles / 2 months of logs required; consent & medical disclaimer gate; strictly no diagnosis)
2. Phase & symptom home workouts (cramps relief: cat-cow, child's pose, butterfly stretch; PCOS-supportive: walking, surya namaskar, strength training; 10–20 min, Easy/Medium)
3. Doctor Report export (structured summary of cycle history, symptoms, and pain scores for gynecologist visits)
4. AI assistant chat (Gemini, personalized with user data and risk screening context)
5. History calendar and cycle graph
6. Reminder notifications (period, water, doctor appointment)
7. Bangla + English
8. Irregular cycle alert in the UI

### Version 3
1. AI pattern insights (for example, "your PMS usually starts 3 days before your period")
2. AI daily smart tip
3. Myths vs facts, hygiene guide
4. Private / discreet mode
5. Ask an expert (optional)

## 8. Functional Requirements
- FR1: Only the signed-in user can read or write her own data.
- FR2: Cycle prediction must be deterministic (formula), never AI-generated.
- FR3: Nutrition content comes from a reviewed static content file, filtered by phase and diet preference.
- FR4: AI assistant must receive only the minimum required context (phase, diet, recent symptoms, active risk flags), never name or email.
- FR5: AI answers must include a disclaimer and must redirect to a doctor for red-flag symptoms.
- FR6: Risk screening must be purely deterministic (rule-based pure functions) using cycle history and symptom logs; never AI-generated. AI is only permitted to explain a detected flag in simple words.
- FR7: Minimum data rule: Risk flags are only computed and displayed once the user has at least 3 completed cycles or 60 days (2 months) of logs. Before this threshold, the UI must display "Keep logging, we need more data".
- FR8: Mandatory risk screening wording: Always state "Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist)." Never declare or diagnose any condition.
- FR9: Lifestyle-only guidance: Remedies are strictly limited to food, sleep, stress management, hydration, and light home workouts. No medicines, supplement dosages, or curative claims ("needs expert review").

## 9. Non-Functional Requirements
- Mobile-first, fast load (under 3 seconds on 4G).
- Accessible (readable contrast, large tap targets).
- Secure: Firestore security rules, no API keys in frontend code for AI.
- Works offline for already-loaded pages (PWA).

## 10. Success Metrics
- Onboarding completion rate.
- Weekly active users who log at least 3 days per week.
- Share of AI chats that receive a thumbs-up.
- Zero security-rule violations in testing.

## 11. Risks
| Risk | Mitigation |
|---|---|
| Wrong health advice | Doctor / nutritionist review, rule-based core, AI safety prompt |
| Privacy breach | Strict Firestore rules, minimal data to AI, consent screen |
| Inaccurate prediction for irregular cycles | Show ranges, use average of recent cycles, show an irregular cycle alert |
| AI cost / abuse | Rate limiting, server-side key |

## 12. Disclaimer (to show in app)
This app provides general information only and is not a substitute for professional medical advice. If you have severe pain, very heavy bleeding, or missed periods, please consult a doctor.
