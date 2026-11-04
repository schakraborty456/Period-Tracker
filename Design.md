# Design

## 1. Principles
- **Calm and warm:** soft colors, rounded shapes, no clinical or harsh look.
- **Mobile-first:** most users will be on phones. Design for 360px width first.
- **Simple:** one clear action per screen. Avoid clutter.
- **Respectful tone:** friendly, non-judgmental, never alarming.
- **Inclusive:** readable fonts, good contrast, large tap targets (minimum 44px).

## 2. Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary | Rose | #E11D74 |
| Primary soft | Light rose | #FDE7F0 |
| Background | Warm off-white | #FFF8FA |
| Surface (cards) | White | #FFFFFF |
| Text main | Deep plum | #2D1B2E |
| Text muted | Gray plum | #7A6A7C |
| Success | Green | #3FA672 |
| Warning | Amber | #F5A524 |
| Danger | Red | #D64545 |

### Phase colors
| Phase | Color | Hex |
|---|---|---|
| Menstrual | Rose red | #E85D75 |
| Follicular | Fresh green | #6CC299 |
| Ovulation | Sunny yellow | #F7C948 |
| Luteal | Lavender | #9B8AE0 |

Do not rely on color alone. Always show the phase name as text too.

## 3. Typography
- Headings: Poppins (600)
- Body: Inter (400, 500)
- For Bangla (V2): Hind Siliguri or Noto Sans Bengali
- Base size 16px, line height 1.5

## 4. Layout and Spacing
- Spacing scale: Tailwind default (4, 8, 12, 16, 24, 32)
- Cards: `rounded-2xl`, soft shadow, 16px padding
- Max content width 480px on mobile, centered; up to 960px on desktop
- Bottom navigation bar on mobile with 4 tabs: Home, Log, History, Assistant (Settings under profile)

## 5. Screens
1. **Login / Signup:** logo, email, password, primary button, link to switch.
2. **Onboarding (3 steps):** (a) last period date and lengths, (b) diet preference and age, (c) consent and disclaimer.
3. **Dashboard:**
   - Hero card: current phase (colored), cycle day, "Next period in X days"
   - Cycle ring or progress bar showing the 4 phases
   - Today's nutrition card ("Eat today" and "Avoid or reduce")
   - Quick log button
4. **Daily Log:** flow selector, mood emojis, symptom chips, water counter, notes.
5. **History (V2):** monthly calendar with colored phase dots and a cycle length graph.
6. **Tips:** phase tabs with nutrition, exercise, and self-care tips.
7. **Assistant (V2):** chat UI with suggested questions, disclaimer under each answer.
8. **Settings:** profile, language, notifications, privacy, delete account.

## 6. Components
- Button (primary, secondary, ghost), Input, Select, DatePicker
- Card, PhaseBadge, ProgressRing
- Chip (selectable symptoms), EmojiSelector (mood)
- Toast, Modal, BottomNav, Skeleton loader
- DisclaimerBanner

## 7. States to Design
- Loading (skeletons), empty (no logs yet), error (friendly message), offline notice.
- Late period state: "Your period is X days late" with a gentle message, no alarm.

## 8. Accessibility
- Contrast ratio at least 4.5:1 for text.
- Labels on all inputs, visible focus states.
- Support screen readers (aria labels on icons).
- Respect reduced motion.

## 9. Dark Mode and Private Mode
- Dark mode (V2): deep plum background, same accent colors adjusted for contrast.
- Private mode (V3): neutral app name and icon, hides the word "period" on the home screen and notifications.

## 10. Content Tone Examples
- Good: "You're in your luteal phase. Your body may feel more tired today. Try magnesium-rich foods like banana and almonds."
- Avoid: medical claims, fear-based language, "you must" phrasing.
