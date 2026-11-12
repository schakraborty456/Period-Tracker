/**
 * riskFlags.js - Risk screening flag metadata, non-diagnostic messaging,
 * doctor consultation questions, and lifestyle-only recommendations.
 *
 * All guidance is lifestyle only (food, sleep, stress management, hydration, gentle home movement).
 * Strictly NO medicines, NO supplement dosages, and NO curative claims.
 * Every guidance entry is marked "needs expert review".
 */

export const MANDATORY_RISK_DISCLAIMER =
  'Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist).';

export const REVIEW_STATUS_LABEL = 'Needs expert review';

export const RISK_FLAGS = {
  see_doctor_soon: {
    id: 'see_doctor_soon',
    title: 'Prompt Doctor Consultation Advised',
    badge: 'Important Notice',
    category: 'Clinical Attention',
    severity: 'alert', // Red flag alert
    icon: '🩺',
    color: '#D64545',
    summary:
      'A critical cycle pattern was detected: either no period for 90 or more days (not pregnant) or bleeding lasting more than 7 consecutive days.',
    mandatoryDisclaimer: MANDATORY_RISK_DISCLAIMER,
    reviewStatus: REVIEW_STATUS_LABEL,
    lifestyleRecommendations: [
      {
        category: 'Immediate Action',
        icon: '🏥',
        title: 'Schedule a Gynecologist Appointment',
        text: 'Prolonged absence of bleeding (amenorrhea) or continuous bleeding beyond 7 days requires direct clinical evaluation to safeguard your health.',
      },
      {
        category: 'Symptom Logging',
        icon: '📝',
        title: 'Maintain Daily Symptom Log',
        text: 'Record daily bleeding flow intensity, pad or tampon counts, and any accompanying discomfort (cramps, dizziness, fever) to share with your clinician.',
      },
      {
        category: 'Hydration & Nutrition',
        icon: '💧',
        title: 'Gentle Hydration & Nourishing Meals',
        text: 'Drink plenty of water and consume comforting, easily digestible meals (warm dal, khichdi, seasonal fruits) to preserve stamina while awaiting your medical consultation.',
      },
      {
        category: 'Rest',
        icon: '🛌',
        title: 'Restorative Physical Rest',
        text: 'Avoid heavy physical exertion, heavy lifting, or strenuous workouts while experiencing prolonged bleeding.',
      },
    ],
    doctorDiscussionPoints: [
      'Tell your doctor exactly how many consecutive days you have been bleeding, or the date of your last spontaneous period.',
      'Mention any symptoms like severe cramps, fatigue, dizziness, fever, or pregnancy test results.',
      'Bring your cycle history and daily log timeline to the consultation.',
    ],
  },

  pcos_possible: {
    id: 'pcos_possible',
    title: 'Possible Signs of PCOS Pattern',
    badge: 'Pattern Notice',
    category: 'Cycle & Hormonal Rhythm',
    severity: 'warning',
    icon: '🌸',
    color: '#F5A524',
    summary:
      'Your logged cycle history indicates longer or irregular cycle lengths alongside logged androgenic skin or hair changes (acne, excess hair, hair loss, or weight change).',
    mandatoryDisclaimer: MANDATORY_RISK_DISCLAIMER,
    reviewStatus: REVIEW_STATUS_LABEL,
    lifestyleRecommendations: [
      {
        category: 'Nutrition',
        icon: '🥗',
        title: 'Balanced Whole Foods & Fiber',
        text: 'Focus on balanced meals featuring complex carbohydrates and high fiber (lentils/dal, oats, brown rice, green leafy vegetables) combined with protein to support steady insulin sensitivity.',
      },
      {
        category: 'Movement',
        icon: '🚶‍♀️',
        title: 'Regular Moderate Movement',
        text: 'Engage in 20–30 minutes of regular, enjoyable activity most days: brisk walking, Surya Namaskar, gentle bodyweight strength, or dance.',
      },
      {
        category: 'Sleep & Stress',
        icon: '🌙',
        title: 'Consistent Sleep & Stress Support',
        text: 'Aim for 7–8 hours of restful sleep each night. Practice relaxing evening routines like deep breathing or yoga nidra to support hormonal balance.',
      },
      {
        category: 'Hydration',
        icon: '💧',
        title: 'Consistent Daily Hydration',
        text: 'Drink 6–8 glasses of water daily to support digestion, natural detoxification, and skin hydration.',
      },
    ],
    doctorDiscussionPoints: [
      'Share your cycle duration trends over the past several months (highlighting cycles longer than 35 days).',
      'Discuss logged symptoms such as acne, facial hair changes, hair shedding, or unexplained weight shifts.',
      'Ask if baseline blood work (LH/FSH ratio, fasting glucose, testosterone) or a pelvic ultrasound is advisable.',
    ],
  },

  anemia_possible: {
    id: 'anemia_possible',
    title: 'Possible Signs of Anemia',
    badge: 'Pattern Notice',
    category: 'Flow & Energy Levels',
    severity: 'warning',
    icon: '🩸',
    color: '#E85D75',
    summary:
      'Heavy menstrual flow was recorded during bleeding days alongside recurring symptoms of fatigue, tiredness, or dizziness.',
    mandatoryDisclaimer: MANDATORY_RISK_DISCLAIMER,
    reviewStatus: REVIEW_STATUS_LABEL,
    lifestyleRecommendations: [
      {
        category: 'Nutrition',
        icon: '🥬',
        title: 'Natural Iron-Rich Foods',
        text: 'Incorporate iron-rich whole foods into your routine: spinach (palong shak), red amaranth (lal shak), lentils (masoor dal), beetroot, pomegranate, sesame seeds (til), and jaggery (gur).',
      },
      {
        category: 'Absorption',
        icon: '🍋',
        title: 'Pair Iron with Vitamin C',
        text: 'Squeeze fresh lemon juice over your meals or eat amla/oranges alongside iron sources to improve absorption. Avoid drinking strong black tea or coffee right with meals as tannins reduce iron uptake.',
      },
      {
        category: 'Rest & Recovery',
        icon: '🛌',
        title: 'Gentle Pacing on Heavy Days',
        text: 'Listen to your body during heavy flow days. Take short resting breaks and prioritize restorative downtime rather than pushing through exhaustion.',
      },
      {
        category: 'Hydration',
        icon: '💧',
        title: 'Fluid Replacement',
        text: 'Drink water, coconut water, or fresh fruit infusions throughout the day to replenish fluid volume during heavy bleeding periods.',
      },
    ],
    doctorDiscussionPoints: [
      'Report how many days per cycle feature heavy flow, and how often you change pads or tampons.',
      'Describe feelings of lightheadedness, breathlessness on climbing stairs, or lingering exhaustion.',
      'Ask your doctor if a Complete Blood Count (CBC) and serum ferritin test are recommended to check iron stores.',
    ],
  },

  severe_pain_possible: {
    id: 'severe_pain_possible',
    title: 'Possible Signs of Severe Pain / Endometriosis',
    badge: 'Pattern Notice',
    category: 'Pain & Pelvic Wellness',
    severity: 'warning',
    icon: '⚡',
    color: '#9B8AE0',
    summary:
      'High pain scores (7 to 10 on a 10-point scale) were recorded repeatedly across 2 or more distinct menstrual cycles.',
    mandatoryDisclaimer: MANDATORY_RISK_DISCLAIMER,
    reviewStatus: REVIEW_STATUS_LABEL,
    lifestyleRecommendations: [
      {
        category: 'Gentle Stretches',
        icon: '🧘‍♀️',
        title: 'Pelvic Relieving Poses',
        text: 'Practice gentle, tension-releasing yoga postures such as Child’s Pose (Balasana), Cat-Cow (Marjaryasana), and Reclining Butterfly Pose (Supta Baddha Konasana) to ease lower back and pelvic tightness.',
      },
      {
        category: 'Thermal Comfort',
        icon: '🔥',
        title: 'Warm Abdominal Compress',
        text: 'Apply a hot water bottle, heating pad, or warm towel over your lower abdomen or sacrum to relax pelvic muscle spasms and increase regional blood circulation.',
      },
      {
        category: 'Warm Infusions',
        icon: '🍵',
        title: 'Soothing Warm Beverages',
        text: 'Sip warm water, ginger tea, or chamomile infusion to relax digestive and uterine cramping.',
      },
      {
        category: 'Posture & Rest',
        icon: '🛌',
        title: 'Restful Side-Sleeping',
        text: 'Rest on your side with knees slightly drawn up and a supportive pillow between your knees to take pressure off your pelvic floor and lower spine.',
      },
    ],
    doctorDiscussionPoints: [
      'Share your documented pain severity ratings (7–10/10) and whether pain occurs before, during, or after bleeding.',
      'Describe whether the pain limits your attendance at work, school, or daily household routines.',
      'Ask your gynecologist for a detailed clinical evaluation regarding possible underlying causes such as endometriosis or adenomyosis.',
    ],
  },

  thyroid_possible: {
    id: 'thyroid_possible',
    title: 'Possible Signs of Thyroid Irregularity',
    badge: 'Pattern Notice',
    category: 'Metabolic & Cycle Rhythm',
    severity: 'warning',
    icon: '🦋',
    color: '#6CC299',
    summary:
      'Cycle variations and unpredictable lengths were logged alongside ongoing fatigue and logged weight changes.',
    mandatoryDisclaimer: MANDATORY_RISK_DISCLAIMER,
    reviewStatus: REVIEW_STATUS_LABEL,
    lifestyleRecommendations: [
      {
        category: 'Nutrition',
        icon: '🥑',
        title: 'Wholesome, Nutrient-Dense Meals',
        text: 'Eat balanced, unrefined meals including whole grains, seasonal vegetables, eggs or legumes, seeds (pumpkin/sunflower), and nuts for steady metabolic support.',
      },
      {
        category: 'Daily Routine',
        icon: '⏰',
        title: 'Consistent Daily Rhythm',
        text: 'Maintain consistent daily meal times, wake-up times, and sleep hours to support the body’s circadian and metabolic clock.',
      },
      {
        category: 'Gentle Activity',
        icon: '🚶‍♀️',
        title: 'Low-Stress Physical Movement',
        text: 'Opt for gentle physical activities like daily walking, slow yoga, or light stretching that nurture energy without causing overexertion.',
      },
      {
        category: 'Stress Relief',
        icon: '🌿',
        title: 'Mindful Downtime',
        text: 'Dedicate 10–15 minutes daily to calming activities: quiet breathing, nature walks, or listening to tranquil music to reduce chronic stress.',
      },
    ],
    doctorDiscussionPoints: [
      'Show your cycle irregularities alongside logged weight changes and fatigue patterns.',
      'Note if you experience unusual sensitivity to cold or heat, skin dryness, or mood swings.',
      'Ask your healthcare provider if a routine thyroid profile (TSH, Free T3, Free T4) is warranted.',
    ],
  },
};

/**
 * Returns full metadata and lifestyle recommendations for a given risk flag ID.
 *
 * @param {string} flagId
 * @returns {object|null}
 */
export function getRiskFlagDetails(flagId) {
  if (!flagId || !RISK_FLAGS[flagId]) {
    return null;
  }
  return RISK_FLAGS[flagId];
}

/**
 * Returns all risk flag metadata as an array.
 *
 * @returns {Array<object>}
 */
export function getAllRiskFlags() {
  return Object.values(RISK_FLAGS);
}
