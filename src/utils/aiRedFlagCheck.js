/**
 * aiRedFlagCheck.js - Pre-call red-flag symptom scanner for AI Assistant (Task 6.4a).
 *
 * Scans user question input before dispatching to the AI model. If critical red-flag
 * symptoms are detected in English, Bangla script, or Banglish (romanized Bangla),
 * immediately intercepts with calm clinical advice recommending prompt doctor care.
 *
 * Rules:
 * - Priority order: self_harm -> fainting -> heavy_bleeding -> severe_pain -> pregnancy_concern
 * - Gentle, non-diagnostic guidance
 * - Zero medicine recommendations
 * - Zero helpline telephone numbers
 * - Zero console logging of user text
 */

export const RED_FLAG_CATEGORIES = {
  SELF_HARM: 'self_harm',
  FAINTING: 'fainting',
  HEAVY_BLEEDING: 'heavy_bleeding',
  SEVERE_PAIN: 'severe_pain',
  PREGNANCY_CONCERN: 'pregnancy_concern',
};

// Priority order: self_harm first, then fainting, heavy_bleeding, severe_pain, pregnancy_concern
export const RED_FLAG_PRIORITY = [
  RED_FLAG_CATEGORIES.SELF_HARM,
  RED_FLAG_CATEGORIES.FAINTING,
  RED_FLAG_CATEGORIES.HEAVY_BLEEDING,
  RED_FLAG_CATEGORIES.SEVERE_PAIN,
  RED_FLAG_CATEGORIES.PREGNANCY_CONCERN,
];

// ============================================================================
// KEYWORD DICTIONARIES (English, Bangla Script, Banglish)
// ============================================================================

export const SELF_HARM_KEYWORDS = [
  // English
  'thoughts of self harm',
  'thought of self harm',
  'thoughts of self-harm',
  'thought of self-harm',
  'self harm',
  'self-harm',
  'harm myself',
  'harming myself',
  'hurt myself',
  'hurting myself',
  'kill myself',
  'killing myself',
  'want to die',
  'wanna die',
  'wishing to die',
  'wish i was dead',
  'wish i were dead',
  'don t want to live',
  'dont want to live',
  'do not want to live',
  'no reason to live',
  'better off dead',
  'end my life',
  'ending my life',
  'ending it all',
  'suicide',
  'suicidal',

  // Bangla Script
  'বাঁচতে ইচ্ছে করছে না',
  'বাঁচতে ইচ্ছা করছে না',
  'বাঁচতে ইচ্ছে করসে না',
  'বাঁচতে ইচ্ছা করসে না',
  'বাঁচতে চাই না',
  'আর বাঁচতে চাই না',
  'মরে যেতে ইচ্ছে করছে',
  'মরে যেতে ইচ্ছা করছে',
  'মরে যেতে ইচ্ছে করসে',
  'মরে যেতে ইচ্ছা করসে',
  'মরে যেতে চাই',
  'নিজেকে মেরে ফেলতে ইচ্ছে করছে',
  'নিজেকে মেরে ফেলতে ইচ্ছা করছে',
  'নিজেকে মেরে ফেলতে ইচ্ছে করসে',
  'নিজেকে মেরে ফেলতে ইচ্ছা করসে',
  'নিজেকে মেরে ফেলতে ইচ্ছে',
  'নিজেকে মেরে ফেলতে ইচ্ছা',
  'নিজেকে মেরে ফেলব',
  'নিজেকে মেরে ফেলবো',
  'জীবন শেষ করে দিতে',
  'জীবন শেষ করতে',
  'নিজেকে শেষ করে দিতে ইচ্ছে করছে',
  'নিজেকে শেষ করে দিতে ইচ্ছা করছে',
  'নিজেকে শেষ করে দিতে',
  'নিজেকে শেষ করতে',
  'নিজেকে আঘাত',
  'আত্মহত্যা',

  // Banglish (Romanized Bangla)
  'bachte ichha korche na',
  'bachte icche korche na',
  'bachte ichchha korche na',
  'bachte ichha korse na',
  'bachte icche korse na',
  'bachte ichchha korse na',
  'bachte chai na',
  'r bachte chai na',
  'ar bachte chai na',
  'morte ichha korche',
  'morte icche korche',
  'morte ichchha korche',
  'morte ichha korse',
  'morte icche korse',
  'morte ichchha korse',
  'morte chai',
  'more jete chai',
  'more jete ichha korche',
  'more jete icche korche',
  'more jete ichchha korche',
  'more jete ichha korse',
  'more jete icche korse',
  'more jete ichchha korse',
  'mere felte ichha',
  'mere felte icche',
  'mere felte ichchha',
  'mere felte ichha korche',
  'mere felte icche korche',
  'mere felte ichchha korche',
  'mere felte ichha korse',
  'mere felte icche korse',
  'mere felte ichchha korse',
  'nijeke mere felte ichha',
  'nijeke mere felte icche',
  'nijeke mere felte ichchha',
  'nijeke mere felbo',
  'mere felbo nijeke',
  'jibon shesh kore dite',
  'jibon sesh kore dite',
  'jibon shesh korte',
  'jibon sesh korte',
  'atmohatya',
  'atmohotya',
  'atmahata',
  'suicide korte chai',
  'suicide korbo',
  'suicide korar ichha',
  'suicide korar icche',
  'suicide korar ichchha',
  'nijeke sesh kore dite ichhe korche',
  'nijeke sesh kore dite ichha korche',
  'nijeke shesh kore dite ichhe korche',
  'nijeke shesh kore dite ichha korche',
  'nijeke sesh kore dite',
  'nijeke shesh kore dite',
  'nijeke sesh korte',
  'nijeke shesh korte',
  'nijeke aghat',
];

export const FAINTING_KEYWORDS = [
  // English
  'fainting',
  'fainted',
  'feel faint',
  'feeling faint',
  'felt faint',
  'passed out',
  'passing out',
  'pass out',
  'lost consciousness',
  'losing consciousness',
  'lose consciousness',
  'severe dizziness',
  'extreme dizziness',
  'sudden dizziness',
  'dizziness and bleeding',
  'dizzy and bleeding',
  'blacked out',
  'blacking out',

  // Bangla Script
  'জ্ঞান হারিয়েছি',
  'জ্ঞান হারিয়েছি',
  'জ্ঞান হারানো',
  'অজ্ঞান হয়ে গেছি',
  'অজ্ঞান হয়ে যাওয়া',
  'মাথা ঘুরে পড়ে গেছি',
  'মাথা ঘুরে পড়ে গেছি',
  'মাথা ঘুরে পড়ে যাওয়া',

  // Banglish (Romanized Bangla)
  'ghure poriechi',
  'ghure pore gechi',
  'ghure porechi',
  'matha ghure pore gechi',
  'matha ghure porechi',
  'matha ghurche pore jacchi',
  'matha ghure pore jaoa',
  'gyan hariechi',
  'gyan hariyechi',
  'ogyan hoye gechi',
  'agyan hoye gechi',
];

export const HEAVY_BLEEDING_KEYWORDS = [
  // English
  'soaking a pad every hour',
  'soaking through a pad every hour',
  'soaking through a pad in an hour',
  'soaking pads every hour',
  'soaking a tampon every hour',
  'soaking every hour',
  'pad every hour',
  'pad an hour',
  'pads an hour',
  'bleeding for many days',
  'bleeding for more than 7 days',
  'bleeding more than 7 days',
  'bleeding over 7 days',
  'bleeding for over 7 days',
  'bleeding longer than 7 days',
  'bleeding 7 days',
  'bleeding a lot',
  'bleeding heavily',
  'bleeding heavy',
  'heavy bleeding',
  'very heavy bleeding',
  'excessive bleeding',
  'unusually heavy bleeding',
  'bleeding nonstop',
  'bleeding non stop',
  'large blood clots',
  'huge blood clots',
  'passing large clots',
  'passing big clots',

  // Bangla Script
  'প্রচুর রক্তপাত',
  'প্রচুর রক্ত',
  'অনেক রক্ত',
  'অতিরিক্ত রক্তপাত',
  'অতিরিক্ত রক্ত',
  'খুব বেশি রক্তপাত',
  'প্রতি ঘন্টায় প্যাড ভিজে',
  'প্রতি ঘণ্টায় প্যাড ভিজে',
  '১ ঘন্টায় প্যাড',
  'এক ঘন্টায় প্যাড',
  '৭ দিনের বেশি রক্তপাত',
  'সাত দিনের বেশি রক্তপাত',
  'অনেক দিন ধরে রক্তপাত',
  'বড় রক্তের চাকা',
  'রক্তের বড় ক্লট',

  // Banglish (Romanized Bangla)
  'soaking a pad every hour',
  'onek bleeding',
  'onek rokto',
  'onek blood',
  'khub beshi bleeding',
  'khub beshi rokto',
  'prochur rokto',
  'prochur bleeding',
  'otirikto rokto',
  'otirikto bleeding',
  'ghontay ghontay pad',
  'ghontay pad vije',
  'prottek ghontay pad',
  '7 diner beshi bleeding',
  '7 diner beshi rokto',
  'sat diner beshi bleeding',
  'sat diner beshi rokto',
  'onek din dhore bleeding',
  'onek din dhore rokto',
  'boro boro clot',
  'boro rokter clot',
];

export const SEVERE_PAIN_KEYWORDS = [
  // English
  'unbearable pain',
  'unbearable cramps',
  'unbearable period pain',
  'severe pain',
  'severe cramps',
  'severe period pain',
  'severe pelvic pain',
  'extreme pain',
  'extreme cramps',
  'excruciating pain',
  'excruciating cramps',
  'pain score 9',
  'pain score 10',
  'pain 9 10',
  'pain is 9',
  'pain is 10',
  'pain 9/10',
  'pain 10/10',
  'cannot stand the pain',
  'cant stand the pain',
  'can t stand the pain',
  'can t bear the pain',
  'cant bear the pain',
  'cannot bear the pain',

  // Bangla Script
  'অসহ্য ব্যথা',
  'অসহ্য পেটের ব্যথা',
  'অসহ্য যন্ত্রণা',
  'তীব্র ব্যথা',
  'তীব্র পেটের ব্যথা',
  'তীব্র যন্ত্রণা',
  'প্রচন্ড ব্যথা',
  'প্রচণ্ড ব্যথা',
  'প্রচন্ড পেটের ব্যথা',
  'অসহনীয় ব্যথা',

  // Banglish (Romanized Bangla)
  'asohyo byatha',
  'asohyo betha',
  'oshojjo betha',
  'osohyo betha',
  'asojjo byatha',
  'asojjo betha',
  'khub beshi byatha',
  'khub beshi betha',
  'extreme byatha',
  'extreme betha',
  'prochondo byatha',
  'prochondo betha',
  'prochondro byatha',
  'prochondro betha',
  'tibro byatha',
  'tibro betha',
  'shojjo korte parchi na byatha',
  'sojjo hocche na betha',
  'sojjo korte parchi na betha',
];

export const PREGNANCY_CONCERN_KEYWORDS = [
  // English
  'missed period with pregnancy fear',
  'missed period might be pregnant',
  'missed period think i am pregnant',
  'missed period think im pregnant',
  'missed period and pregnant',
  'think i am pregnant',
  'think im pregnant',
  'might be pregnant',
  'could i be pregnant',
  'could be pregnant',
  'fear i am pregnant',
  'fear of pregnancy',
  'pregnancy fear',
  'pregnant and bleeding',
  'bleeding while pregnant',
  'bleeding in pregnancy',
  'bleeding during pregnancy',
  'positive pregnancy test bleeding',

  // Bangla Script
  'প্রেগন্যান্ট এবং রক্তপাত',
  'প্রেগন্যান্ট অবস্থায় রক্তপাত',
  'গর্ভবতী অবস্থায় রক্তপাত',
  'গর্ভবতী রক্তপাত',
  'পিরিয়ড মিস প্রেগন্যান্ট',
  'মাসিক বন্ধ প্রেগন্যান্ট',
  'প্রেগন্যান্সি টেস্ট পজিটিভ রক্তপাত',
  'প্রেগন্যান্সি নিয়ে ভয়',

  // Banglish (Romanized Bangla)
  'pregnant and bleeding',
  'bleeding in pregnancy',
  'shomvobto pregnant',
  'somvobto pregnant',
  'pregnant mone hocche',
  'period miss pregnant',
  'period bondho pregnant',
  'pregnant obosthay bleeding',
  'pregnant obosthay rokto',
  'pregnancy niye chinta',
  'pregnancy voy',
  'pregnancy bhoy',
];

// Category keyword map
const CATEGORY_KEYWORDS = {
  [RED_FLAG_CATEGORIES.SELF_HARM]: SELF_HARM_KEYWORDS,
  [RED_FLAG_CATEGORIES.FAINTING]: FAINTING_KEYWORDS,
  [RED_FLAG_CATEGORIES.HEAVY_BLEEDING]: HEAVY_BLEEDING_KEYWORDS,
  [RED_FLAG_CATEGORIES.SEVERE_PAIN]: SEVERE_PAIN_KEYWORDS,
  [RED_FLAG_CATEGORIES.PREGNANCY_CONCERN]: PREGNANCY_CONCERN_KEYWORDS,
};

// Gentle, non-diagnostic messages
export const RED_FLAG_MESSAGES = {
  [RED_FLAG_CATEGORIES.SELF_HARM]:
    'If you are having thoughts of harming yourself, please talk to a trusted person or a doctor right away. You do not have to handle this alone, and caring support is available.',
  [RED_FLAG_CATEGORIES.FAINTING]:
    'Fainting, sudden dizziness, or collapsing is an important sign to check with a doctor promptly. If symptoms feel acute or severe, please get medical care right away. This is general guidance, not a medical diagnosis.',
  [RED_FLAG_CATEGORIES.HEAVY_BLEEDING]:
    'Bleeding very heavily, soaking through pads every hour, or bleeding for more than 7 days is worth checking with a doctor (gynecologist) promptly. If bleeding is sudden or accompanied by dizziness, please get medical care right away. This is general guidance, not a medical diagnosis.',
  [RED_FLAG_CATEGORIES.SEVERE_PAIN]:
    'Severe or unbearable pelvic pain is worth checking with a doctor (gynecologist) promptly. If pain is sudden, acute, or accompanied by fever, please get medical care right away. This is general guidance, not a medical diagnosis.',
  [RED_FLAG_CATEGORIES.PREGNANCY_CONCERN]:
    'Concerns about pregnancy or bleeding while potentially pregnant are worth checking with a doctor or healthcare provider promptly. If you experience severe pain or sudden heavy bleeding, please get medical care right away. This is general guidance, not a medical diagnosis.',
};

// Map each category to a verified conditionId from getAllConditions() or null
export const RED_FLAG_CONDITION_IDS = {
  [RED_FLAG_CATEGORIES.SELF_HARM]: null,
  [RED_FLAG_CATEGORIES.FAINTING]: null,
  [RED_FLAG_CATEGORIES.HEAVY_BLEEDING]: 'heavy-periods',
  [RED_FLAG_CATEGORIES.SEVERE_PAIN]: 'dysmenorrhea',
  [RED_FLAG_CATEGORIES.PREGNANCY_CONCERN]: null,
};

/**
 * Normalizes input text for red flag matching:
 * lowercase, strip punctuation, collapse whitespace, and trim.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।'"’‘“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scans input question text for critical red-flag signs.
 * Evaluates priority order and returns standardized red-flag assessment.
 *
 * @param {string} text User query text
 * @returns {{
 *   isRedFlag: boolean,
 *   category: string | null,
 *   message: string | null,
 *   conditionId: string | null
 * }}
 */
export function checkAiRedFlags(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      isRedFlag: false,
      category: null,
      message: null,
      conditionId: null,
    };
  }

  const clean = normalizeText(text);
  if (!clean) {
    return {
      isRedFlag: false,
      category: null,
      message: null,
      conditionId: null,
    };
  }

  // Evaluate in strict priority order
  for (const category of RED_FLAG_PRIORITY) {
    const keywords = CATEGORY_KEYWORDS[category] || [];
    for (const kw of keywords) {
      const cleanKw = normalizeText(kw);
      if (cleanKw && clean.includes(cleanKw)) {
        return {
          isRedFlag: true,
          category,
          message: RED_FLAG_MESSAGES[category] || null,
          conditionId: RED_FLAG_CONDITION_IDS[category] || null,
        };
      }
    }
  }

  return {
    isRedFlag: false,
    category: null,
    message: null,
    conditionId: null,
  };
}
