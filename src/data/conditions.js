/**
 * conditions.js - Educational reference library for common period-related conditions.
 *
 * Requirements & Content Rules (Rules.md §5.3):
 * - Educational only: strictly no diagnosis, no "you have X" wording.
 * - Home care is framed strictly as "may help ease discomfort", never as a cure or treatment.
 * - Zero medicine names (no ibuprofen, paracetamol, mefenamic, metformin, etc.).
 * - Zero supplement or herbal recommendations, zero dosages.
 * - Every condition includes: summary, symptoms, whenToSeeDoctor (red flags),
 *   homeComfort (food, sleep, stress, hydration, heatAndMovement), whatDoctorMayCheck,
 *   mythsVsFacts, relatedWorkoutIds, relatedRiskFlagId, and needsReview: true.
 * - All content is marked "Needs expert review".
 */

export const CONDITIONS_REVIEW_STATUS = 'Needs expert review';

export const CONDITIONS_DISCLAIMER =
  'This educational guide provides general information only and is not a medical diagnosis, cure, or treatment. If you experience severe pain, heavy bleeding, or missed cycles, please consult a qualified gynecologist or healthcare professional.';

export const CONDITION_CATEGORIES = [
  { key: 'all', label: 'All Conditions' },
  { key: 'pain-discomfort', label: 'Pain & Discomfort' },
  { key: 'hormonal-systemic', label: 'Hormonal & Systemic' },
  { key: 'flow-blood', label: 'Flow & Blood' },
  { key: 'cycle-irregularity', label: 'Cycle Irregularity' },
];

export const CONDITIONS = [
  {
    id: 'pcos',
    title: 'PCOS / PCOD (Polycystic Ovary Syndrome)',
    shortName: 'PCOS',
    category: 'hormonal-systemic',
    categoryLabel: 'Hormonal & Systemic',
    summary:
      'Polycystic Ovary Syndrome (PCOS), frequently also referred to as PCOD (Polycystic Ovarian Disease), is a common hormonal pattern where ovaries may develop small follicles and cycles become irregular. It is linked with variations in hormone balance, insulin response, and cycle regularity.',
    symptoms: [
      'Irregular, delayed, or missed menstrual cycles',
      'Persistent acne or oily skin, particularly along the jawline',
      'Excess hair growth on the face, chest, or abdomen',
      'Hair thinning or shedding on the scalp',
      'Darkened skin patches around the neck, underarms, or groin',
      'Weight changes that feel challenging to manage',
    ],
    whenToSeeDoctor: [
      'No menstrual period for 90 or more days (3 months) when not pregnant',
      'Bleeding that lasts longer than 7 consecutive days',
      'Unusually heavy bleeding that soaks through a pad or tampon every hour',
      'Severe, sudden, or unmanageable pelvic pain',
      'Unexplained dizziness, extreme fatigue, or fainting',
    ],
    homeComfort: {
      food:
        'Prioritizing balanced meals with complex carbohydrates (such as brown rice, whole wheat roti, oats, and dal), fiber-rich greens (shak), and protein (egg, fish like mach, or lentils) may help ease discomfort by supporting steady daily energy.',
      sleep:
        'Maintaining 7 to 8 hours of quiet, regular nighttime rest may help ease discomfort and support natural metabolic rhythms.',
      stress:
        'Gentle breathing practices, quiet time outdoors, and low-stimulation evenings may help ease discomfort caused by everyday tension.',
      hydration:
        'Drinking 8 to 10 glasses of clean water throughout the day may help ease discomfort and maintain general hydration.',
      heatAndMovement:
        'Applying a gentle warm heating pad on the lower abdomen along with daily brisk walking and light bodyweight movements may help ease discomfort in the pelvic area.',
    },
    whatDoctorMayCheck: [
      'Pelvic ultrasound to visualize the ovaries and uterine lining',
      'Hormonal blood panels (such as LH, FSH, androgen, and prolactin levels)',
      'Fasting blood sugar or insulin screening to evaluate metabolic health',
      'Thyroid screening to check for overlapping cycle influences',
      'Review of cycle history, lifestyle factors, and symptom timelines',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Having PCOS means a person cannot have children.',
        fact:
          'Fact: Many individuals with PCOS conceive naturally or with standard clinical guidance; it is a manageable hormonal pattern, not an absolute barrier.',
      },
      {
        myth: 'Myth: Only individuals with higher body weight develop PCOS.',
        fact:
          'Fact: PCOS affects people of every body shape and size, including those with lean body types.',
      },
      {
        myth: 'Myth: An irregular cycle always indicates PCOS.',
        fact:
          'Fact: Irregular cycles can also be influenced by thyroid variations, nutrition changes, acute stress, or illness; only a doctor can evaluate the true cause.',
      },
    ],
    relatedWorkoutIds: ['pcos-rhythm', 'follicular-mobility'],
    relatedRiskFlagId: 'pcos_possible',
    needsReview: true,
  },

  {
    id: 'pms',
    title: 'PMS (Premenstrual Syndrome)',
    shortName: 'PMS',
    category: 'pain-discomfort',
    categoryLabel: 'Pain & Discomfort',
    summary:
      'Premenstrual Syndrome (PMS) refers to a cluster of physical and emotional shifts that many people experience during the luteal phase, typically 7 to 10 days before menstrual bleeding begins. These shifts usually resolve within a few days after bleeding starts.',
    symptoms: [
      'Abdominal bloating and temporary water retention',
      'Breast tenderness or sensitivity',
      'Mild pelvic cramps or lower back ache before bleeding',
      'Mood swings, emotional sensitivity, or feelings of irritability',
      'Temporary fatigue and changes in daytime energy',
      'Mild headaches or food cravings',
    ],
    whenToSeeDoctor: [
      'Severe emotional distress, hopelessness, or panic that disrupts school, work, or relationships',
      'Severe physical pain that prevents everyday activities',
      'Symptoms that continue all month long without easing once a period begins',
    ],
    homeComfort: {
      food:
        'Enjoying potassium- and magnesium-rich foods like bananas (kola), roasted sesame seeds (til), lentils (dal), and spinach (shak) while moderating excess sodium may help ease discomfort from bloating and fatigue.',
      sleep:
        'Creating an unhurried bedtime routine in a cool, dark room may help ease discomfort from premenstrual sleep restlessness.',
      stress:
        'Light journaling, listening to calming music, and taking quiet screen-free breaks may help ease discomfort and emotional irritability.',
      hydration:
        'Drinking steady amounts of water throughout the day may help ease discomfort by encouraging balanced fluid retention.',
      heatAndMovement:
        'Resting a warm water pack on the lower belly and practicing gentle restorative yoga (such as child’s pose or butterfly stretch) may help ease discomfort in the back and pelvis.',
    },
    whatDoctorMayCheck: [
      'Review of a detailed symptom diary tracked across two or more consecutive cycles',
      'Thyroid blood tests to rule out underlying hormone fluctuations that mirror PMS',
      'Evaluation for Premenstrual Dysphoric Disorder (PMDD) if emotional symptoms are intense',
      'General physical evaluation and blood counts',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: PMS is purely psychological and not a real physical occurrence.',
        fact:
          'Fact: PMS is connected to measurable cyclic hormonal fluctuations and nervous system responses during the luteal phase.',
      },
      {
        myth: 'Myth: Intense, overwhelming emotional distress is just standard PMS.',
        fact:
          'Fact: Severe emotional disruption that stops normal daily life may be PMDD, an accepted medical condition that doctors can help evaluate.',
      },
    ],
    relatedWorkoutIds: ['luteal-grounding', 'bloat-relief'],
    relatedRiskFlagId: null,
    needsReview: true,
  },

  {
    id: 'dysmenorrhea',
    title: 'Period Cramps (Dysmenorrhea)',
    shortName: 'Period Cramps',
    category: 'pain-discomfort',
    categoryLabel: 'Pain & Discomfort',
    summary:
      'Dysmenorrhea is the medical term for menstrual cramps and pelvic pain occurring before or during a period. Primary dysmenorrhea occurs naturally as the uterine muscles contract under the influence of prostaglandins. Secondary dysmenorrhea involves cramping linked to an underlying pelvic condition.',
    symptoms: [
      'Throbbing or aching pelvic pain that starts just before or on the first day of bleeding',
      'Dull ache radiating to the lower back and upper thighs',
      'Mild nausea or loose stools during peak flow hours',
      'Feelings of sluggishness or light fatigue while cramping',
    ],
    whenToSeeDoctor: [
      'Severe or unbearable pelvic pain that does not respond to rest or gentle self-care',
      'Pain scores of 7 to 10 logged repeatedly across multiple cycles',
      'Pelvic pain that begins days before bleeding and continues long after bleeding stops',
      'Pain accompanied by fever, chills, or unusual foul-smelling vaginal discharge',
      'Sudden, sharp, or worsening pelvic pain that feels different from your typical cycle',
    ],
    homeComfort: {
      food:
        'Warm, easily digestible meals like moong dal khichdi, cooked vegetables, and gentle fruits like bananas (kola) while avoiding ice-cold foods may help ease discomfort in the abdomen.',
      sleep:
        'Sleeping in the fetal position with a supportive pillow between the knees may help ease discomfort by relaxing abdominal muscles.',
      stress:
        'Slow, rhythmic abdominal breathing (inhaling gently for 4 seconds, exhaling for 6 seconds) may help ease discomfort by easing muscle tension.',
      hydration:
        'Sipping warm water or warm soups at regular intervals may help ease discomfort and avoid dehydration-triggered muscle tightening.',
      heatAndMovement:
        'Placing a warm water bag or heating pad on the lower tummy or lower back and moving gently through cat-cow and child’s pose stretches may help ease discomfort effectively.',
    },
    whatDoctorMayCheck: [
      'Targeted pelvic examination to evaluate uterine or pelvic tenderness',
      'Pelvic ultrasound to check for anatomical factors like fibroids, polyps, or cysts',
      'Discussion of pain intensity, timing, and impact on school, work, or daily life',
      'Clinical assessment for potential secondary causes, such as endometriosis',
    ],
    mythsVsFacts: [
      {
        myth:
          'Myth: Severe period pain that confines you to bed is normal and must just be tolerated.',
        fact:
          'Fact: While mild cramping is common, severe pain that stops you from attending school or work warrants a professional clinical evaluation.',
      },
      {
        myth: 'Myth: Period cramps will always go away permanently after having a baby.',
        fact:
          'Fact: Childbirth can sometimes change uterine dynamics, but cramps may still continue for many individuals.',
      },
    ],
    relatedWorkoutIds: ['cramps-relief', 'lower-back-soother'],
    relatedRiskFlagId: 'severe_pain_possible',
    needsReview: true,
  },
];

/**
 * Helper: Find condition by ID slug.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getConditionById(id) {
  if (!id) return undefined;
  return CONDITIONS.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

/**
 * Helper: Get conditions filtered by category.
 * @param {string} category - Category key or 'all'
 * @returns {Array}
 */
export function getConditionsByCategory(category) {
  if (!category || category === 'all') {
    return CONDITIONS;
  }
  return CONDITIONS.filter((c) => c.category === category);
}

/**
 * Helper: Search conditions by keyword across title, shortName, summary, and symptoms.
 * @param {string} query
 * @returns {Array}
 */
export function searchConditions(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return CONDITIONS;
  }
  const q = query.trim().toLowerCase();
  return CONDITIONS.filter((c) => {
    const titleMatch = c.title.toLowerCase().includes(q);
    const shortNameMatch = c.shortName.toLowerCase().includes(q);
    const summaryMatch = c.summary.toLowerCase().includes(q);
    const symptomMatch = c.symptoms.some((s) => s.toLowerCase().includes(q));
    const mythMatch = c.mythsVsFacts.some(
      (m) => m.myth.toLowerCase().includes(q) || m.fact.toLowerCase().includes(q)
    );
    return titleMatch || shortNameMatch || summaryMatch || symptomMatch || mythMatch;
  });
}

/**
 * Helper: Find condition matching a risk screening flag ID.
 * @param {string} riskFlagId
 * @returns {object|undefined}
 */
export function getConditionForRiskFlag(riskFlagId) {
  if (!riskFlagId) return undefined;
  return CONDITIONS.find((c) => c.relatedRiskFlagId === riskFlagId);
}

/**
 * Helper: Return all conditions.
 * @returns {Array}
 */
export function getAllConditions() {
  return CONDITIONS;
}
