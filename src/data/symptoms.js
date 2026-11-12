/**
 * Daily symptom, mood, flow, and wellness options.
 *
 * Per Architecture.md and Design.md:
 * - flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy'
 * - mood: string
 * - symptoms: string[]
 * - waterGlasses: number
 * - notes: string
 */

export const FLOW_OPTIONS = [
  {
    id: 'none',
    label: 'No Flow',
    sublabel: 'Dry / No bleeding',
    icon: '⚪',
    color: '#7A6A7C',
  },
  {
    id: 'spotting',
    label: 'Spotting',
    sublabel: 'A few drops / pantyliner',
    icon: '💧',
    color: '#E85D75',
  },
  {
    id: 'light',
    label: 'Light Flow',
    sublabel: '1–2 regular pads or tampons',
    icon: '🩸',
    color: '#E85D75',
  },
  {
    id: 'medium',
    label: 'Medium Flow',
    sublabel: 'Normal steady flow',
    icon: '🩸🩸',
    color: '#D64545',
  },
  {
    id: 'heavy',
    label: 'Heavy Flow',
    sublabel: 'Heavy bleeding / frequent change',
    icon: '🩸🩸🩸',
    color: '#B32424',
  },
];

export const MOOD_OPTIONS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'tired', label: 'Tired', emoji: '🥱' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
  { id: 'sad', label: 'Sad / Teary', emoji: '🥺' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'crampy', label: 'Crampy', emoji: '😣' },
];

export const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Abdominal Cramps', category: 'pelvic', icon: '⚡' },
  { id: 'headache', label: 'Headache / Migraine', category: 'head', icon: '🤕' },
  { id: 'bloating', label: 'Bloating & Gas', category: 'digestion', icon: '🎈' },
  { id: 'backache', label: 'Lower Backache', category: 'body', icon: '🦴' },
  { id: 'tender_breasts', label: 'Tender Breasts', category: 'body', icon: '🌸' },
  { id: 'fatigue', label: 'Extreme Fatigue', category: 'body', icon: '🛌' },
  { id: 'acne', label: 'Acne / Breakouts', category: 'skin', icon: '✨' },
  { id: 'excess_hair', label: 'Excess Hair Growth', category: 'body', icon: '🪒' },
  { id: 'hair_loss', label: 'Hair Loss / Thinning', category: 'head', icon: '💇' },
  { id: 'weight_change', label: 'Weight Change', category: 'body', icon: '⚖️' },
  { id: 'dark_patches', label: 'Dark Skin Patches', category: 'skin', icon: '🟤' },
  { id: 'cravings', label: 'Sweet / Salty Cravings', category: 'digestion', icon: '🍫' },
  { id: 'nausea', label: 'Nausea / Upset Stomach', category: 'digestion', icon: '🤢' },
  { id: 'insomnia', label: 'Sleep Trouble', category: 'mind', icon: '🌙' },
  { id: 'hot_flashes', label: 'Hot Flashes / Sweats', category: 'body', icon: '🔥' },
  { id: 'joint_pain', label: 'Joint / Muscle Ache', category: 'body', icon: '💪' },
];

/**
 * Returns default empty daily log object
 * @param {string} date - 'YYYY-MM-DD'
 */
export function getDefaultDailyLog(date) {
  return {
    date: date || '',
    flow: 'none',
    mood: '',
    symptoms: [],
    painScore: null,
    sleepHours: null,
    weight: null,
    waterGlasses: 4,
    notes: '',
  };
}

export function getFlowDetails(flowId) {
  return FLOW_OPTIONS.find((f) => f.id === flowId) || FLOW_OPTIONS[0];
}

export function getMoodDetails(moodId) {
  return MOOD_OPTIONS.find((m) => m.id === moodId) || null;
}

export function getSymptomDetails(symptomId) {
  return SYMPTOM_OPTIONS.find((s) => s.id === symptomId) || null;
}
