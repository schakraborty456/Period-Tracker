import { describe, it, expect } from 'vitest';
import {
  checkAiRedFlags,
  RED_FLAG_CATEGORIES,
  RED_FLAG_PRIORITY,
  RED_FLAG_MESSAGES,
  RED_FLAG_CONDITION_IDS,
  SELF_HARM_KEYWORDS,
  FAINTING_KEYWORDS,
  HEAVY_BLEEDING_KEYWORDS,
  SEVERE_PAIN_KEYWORDS,
  PREGNANCY_CONCERN_KEYWORDS,
} from './aiRedFlagCheck';
import { getAllConditions } from '../data/conditions';

describe('aiRedFlagCheck.js - Pre-call Red-Flag Scanner (Task 6.4a)', () => {
  describe('Input validation & edge cases', () => {
    it('returns isRedFlag false for null, undefined, empty string, or whitespace', () => {
      expect(checkAiRedFlags(null)).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags(undefined)).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags('')).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags('    ')).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });
    });

    it('returns isRedFlag false for non-string inputs', () => {
      expect(checkAiRedFlags(12345)).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags({})).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags([])).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });
    });
  });

  describe('Condition ID Validation', () => {
    it('maps conditionId strictly to real condition IDs from getAllConditions() or null', () => {
      const realConditionIds = new Set(getAllConditions().map((c) => c.id));

      Object.entries(RED_FLAG_CONDITION_IDS).forEach(([category, conditionId]) => {
        if (conditionId !== null) {
          expect(
            realConditionIds.has(conditionId),
            `Category "${category}" mapped to invalid conditionId "${conditionId}"`
          ).toBe(true);
        }
      });

      expect(RED_FLAG_CONDITION_IDS[RED_FLAG_CATEGORIES.HEAVY_BLEEDING]).toBe('heavy-periods');
      expect(RED_FLAG_CONDITION_IDS[RED_FLAG_CATEGORIES.SEVERE_PAIN]).toBe('dysmenorrhea');
      expect(RED_FLAG_CONDITION_IDS[RED_FLAG_CATEGORIES.FAINTING]).toBeNull();
      expect(RED_FLAG_CONDITION_IDS[RED_FLAG_CATEGORIES.PREGNANCY_CONCERN]).toBeNull();
      expect(RED_FLAG_CONDITION_IDS[RED_FLAG_CATEGORIES.SELF_HARM]).toBeNull();
    });
  });

  describe('Safety & Medical Rules for Messages', () => {
    const BANNED_DRUG_NAMES = [
      'ibuprofen',
      'paracetamol',
      'aspirin',
      'mefenamic',
      'metformin',
      'naproxen',
      'tylenol',
      'advil',
      'panadol',
    ];

    it('contains no medicine names in any message', () => {
      Object.entries(RED_FLAG_MESSAGES).forEach(([cat, msg]) => {
        const lower = msg.toLowerCase();
        BANNED_DRUG_NAMES.forEach((drug) => {
          expect(lower).not.toContain(drug);
        });
      });
    });

    it('contains no telephone or helpline numbers in any message', () => {
      Object.entries(RED_FLAG_MESSAGES).forEach(([cat, msg]) => {
        // Must not contain numeric strings of 3 or more digits (like 988, 911, 102, etc.)
        expect(msg).not.toMatch(/\b\d{3,}\b/);
      });
    });

    it('self_harm message kindly asks the user to talk to a trusted person or doctor right away and not handle it alone', () => {
      const msg = RED_FLAG_MESSAGES[RED_FLAG_CATEGORIES.SELF_HARM].toLowerCase();
      expect(msg).toContain('trusted person');
      expect(msg).toContain('doctor');
      expect(msg).toContain('right away');
      expect(msg).toContain('alone');
    });

    it('other categories recommend checking with a doctor soon and seeking care right away for severe signs', () => {
      const nonSelfHarm = [
        RED_FLAG_CATEGORIES.FAINTING,
        RED_FLAG_CATEGORIES.HEAVY_BLEEDING,
        RED_FLAG_CATEGORIES.SEVERE_PAIN,
        RED_FLAG_CATEGORIES.PREGNANCY_CONCERN,
      ];

      nonSelfHarm.forEach((cat) => {
        const msg = RED_FLAG_MESSAGES[cat];
        expect(msg.toLowerCase()).toContain('doctor');
        expect(msg.toLowerCase()).toContain('right away');
        expect(msg.toLowerCase()).toContain('not a medical diagnosis');
      });
    });
  });

  describe('Category Detection: English, Bangla, and Banglish', () => {
    describe('Category: self_harm', () => {
      it('detects English self-harm phrases', () => {
        const queries = [
          'I am having thoughts of self-harm lately',
          'I feel so hopeless and I want to die',
          'I don t want to live anymore with this pain',
          'I am afraid I might hurt myself tonight',
          'Feeling suicidal before my period',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
          expect(res.conditionId).toBeNull();
        });
      });

      it('detects all required English self-harm phrases', () => {
        const requiredEnglishPhrases = [
          'suicide',
          'suicidal',
          'kill myself',
          'killing myself',
          'want to die',
          'wanna die',
          'end my life',
          'ending it all',
          'hurt myself',
          'harm myself',
          'no reason to live',
          'better off dead',
        ];

        requiredEnglishPhrases.forEach((phrase) => {
          const res = checkAiRedFlags(`I feel like ${phrase} today`);
          expect(res.isRedFlag, `Failed to detect English phrase: "${phrase}"`).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
        });
      });

      it('detects Bangla script self-harm phrases', () => {
        const queries = [
          'আমার আর বাঁচতে ইচ্ছে করছে না',
          'নিজেকে শেষ করে দিতে ইচ্ছে করছে খুব',
          'আমার মরে যেতে ইচ্ছে করছে',
          'কষ্ট সহ্য হচ্ছে না বাঁচতে চাই না',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
        });
      });

      it('detects all required Bangla script self-harm phrases and spelling variants', () => {
        const requiredBanglaPhrases = [
          'আত্মহত্যা',
          'মরে যেতে ইচ্ছে করছে',
          'নিজেকে মেরে ফেলতে ইচ্ছে করছে',
          'বাঁচতে ইচ্ছে করছে না',
          // spelling variants
          'মরে যেতে ইচ্ছা করছে',
          'মরে যেতে ইচ্ছে করসে',
          'মরে যেতে ইচ্ছা করসে',
          'নিজেকে মেরে ফেলতে ইচ্ছা করছে',
          'নিজেকে মেরে ফেলতে ইচ্ছে করসে',
          'নিজেকে মেরে ফেলতে ইচ্ছা করসে',
          'বাঁচতে ইচ্ছা করছে না',
          'বাঁচতে ইচ্ছে করসে না',
          'বাঁচতে ইচ্ছা করসে না',
        ];

        requiredBanglaPhrases.forEach((phrase) => {
          const res = checkAiRedFlags(`আমার ${phrase} এখন`);
          expect(res.isRedFlag, `Failed to detect Bangla phrase: "${phrase}"`).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
        });
      });

      it('detects Banglish (romanized Bangla) self-harm phrases', () => {
        const queries = [
          'amar bachte ichha korche na r',
          'nijeke sesh kore dite icche korche',
          'suicide korte chai khub kosto hocche',
          'morte chai ami',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
        });
      });

      it('detects all required Banglish self-harm phrases and spelling variants', () => {
        const requiredBanglishPhrases = [
          'morte ichha korche',
          'mere felte ichha',
          'nijeke mere felbo',
          'atmohatya',
          'jibon shesh kore dite',
          // spelling variants (ichchha, icche, korse, korche)
          'morte icche korche',
          'morte ichchha korche',
          'morte ichha korse',
          'morte icche korse',
          'morte ichchha korse',
          'mere felte icche',
          'mere felte ichchha',
          'mere felte ichha korche',
          'mere felte icche korche',
          'mere felte ichchha korche',
          'mere felte ichha korse',
          'mere felte icche korse',
          'mere felte ichchha korse',
          'jibon sesh kore dite',
          'atmohotya',
          'bachte ichha korche na',
          'bachte icche korche na',
          'bachte ichchha korche na',
          'bachte ichha korse na',
          'bachte icche korse na',
          'bachte ichchha korse na',
        ];

        requiredBanglishPhrases.forEach((phrase) => {
          const res = checkAiRedFlags(`amar ${phrase} khub kosto`);
          expect(res.isRedFlag, `Failed to detect Banglish phrase: "${phrase}"`).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
        });
      });
    });

    describe('Category: fainting', () => {
      it('detects English fainting and dizziness phrases', () => {
        const queries = [
          'I fainted in the bathroom during my period',
          'Sudden severe dizziness and feeling like passing out',
          'I lost consciousness for a few seconds',
          'I felt faint after bleeding today',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.FAINTING);
          expect(res.conditionId).toBeNull();
        });
      });

      it('detects Bangla script fainting phrases', () => {
        const queries = [
          'রক্তপাতের পর মাথা ঘুরে পড়ে গেছি',
          'আজ সকালে হঠাৎ জ্ঞান হারিয়েছি',
          'অজ্ঞান হয়ে গেছি বাথরুমে',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.FAINTING);
        });
      });

      it('detects Banglish fainting phrases', () => {
        const queries = [
          'ami matha ghure pore gechi',
          'gyan hariechi hotat kore',
          'ogyan hoye gechi bleeding er somoy',
          'ghure porechi shorir khub durbol',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.FAINTING);
        });
      });
    });

    describe('Category: heavy_bleeding', () => {
      it('detects English heavy bleeding phrases and maps to heavy-periods', () => {
        const queries = [
          'I have been soaking a pad every hour since morning',
          'My period is bleeding for more than 7 days now',
          'I am bleeding heavily and passing large blood clots',
          'Very heavy bleeding soaking pads every hour',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.HEAVY_BLEEDING);
          expect(res.conditionId).toBe('heavy-periods');
        });
      });

      it('detects Bangla script heavy bleeding phrases', () => {
        const queries = [
          'আমার প্রচুর রক্তপাত হচ্ছে থামছে না',
          'প্রতি ঘন্টায় প্যাড ভিজে যাচ্ছে',
          '৭ দিনের বেশি রক্তপাত হচ্ছে আজ ১০ দিন',
          'বড় রক্তের চাকা বের হচ্ছে',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.HEAVY_BLEEDING);
          expect(res.conditionId).toBe('heavy-periods');
        });
      });

      it('detects Banglish heavy bleeding phrases', () => {
        const queries = [
          'onek bleeding hocche thamar naam nei',
          'onek rokto jacche ghontay ghontay pad lagche',
          'khub beshi bleeding ar boro boro clot jacche',
          '7 diner beshi bleeding hocche',
          'prochur rokto ber hocche',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.HEAVY_BLEEDING);
          expect(res.conditionId).toBe('heavy-periods');
        });
      });
    });

    describe('Category: severe_pain', () => {
      it('detects English severe pain phrases and maps to dysmenorrhea', () => {
        const queries = [
          'I have unbearable pain that makes me cry',
          'Severe cramps and I cannot stand the pain',
          'My pain score 10 and nothing helps',
          'Excruciating cramps in my pelvis',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SEVERE_PAIN);
          expect(res.conditionId).toBe('dysmenorrhea');
        });
      });

      it('detects Bangla script severe pain phrases', () => {
        const queries = [
          'আমার পেটে অসহ্য ব্যথা সহ্য করতে পারছি না',
          'তীব্র ব্যথা হচ্ছে তলপেটে',
          'প্রচন্ড ব্যথা পিরিয়ডের সময়',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SEVERE_PAIN);
          expect(res.conditionId).toBe('dysmenorrhea');
        });
      });

      it('detects Banglish severe pain phrases', () => {
        const queries = [
          'asohyo byatha hocche pete',
          'oshojjo betha kichutei komche na',
          'khub beshi byatha sojjo korte parchi na',
          'extreme betha ar cramping',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.SEVERE_PAIN);
          expect(res.conditionId).toBe('dysmenorrhea');
        });
      });
    });

    describe('Category: pregnancy_concern', () => {
      it('detects English pregnancy concern phrases', () => {
        const queries = [
          'I am pregnant and bleeding today',
          'I have a missed period might be pregnant',
          'Could I be pregnant, my period is late and I feel nausea',
          'Positive pregnancy test bleeding from morning',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.PREGNANCY_CONCERN);
          expect(res.conditionId).toBeNull();
        });
      });

      it('detects Bangla script pregnancy concern phrases', () => {
        const queries = [
          'প্রেগন্যান্ট এবং রক্তপাত হচ্ছে এখন',
          'গর্ভবতী অবস্থায় রক্তপাত দেখা দিয়েছে',
          'পিরিয়ড মিস প্রেগন্যান্ট হওয়ার সম্ভাবনা আছে',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.PREGNANCY_CONCERN);
        });
      });

      it('detects Banglish pregnancy concern phrases', () => {
        const queries = [
          'pregnant and bleeding ki korbo',
          'shomvobto pregnant ar bleeding hocche',
          'pregnancy niye chinta period miss hoyeche',
          'pregnant obosthay rokto ber hocche',
        ];
        queries.forEach((q) => {
          const res = checkAiRedFlags(q);
          expect(res.isRedFlag).toBe(true);
          expect(res.category).toBe(RED_FLAG_CATEGORIES.PREGNANCY_CONCERN);
        });
      });
    });
  });

  describe('Priority Order Resolution', () => {
    it('prioritizes self_harm over all other categories', () => {
      const query = 'I have unbearable pain, heavy bleeding, and thoughts of self-harm';
      const res = checkAiRedFlags(query);
      expect(res.isRedFlag).toBe(true);
      expect(res.category).toBe(RED_FLAG_CATEGORIES.SELF_HARM);
      expect(res.conditionId).toBeNull();
    });

    it('prioritizes fainting over heavy_bleeding, severe_pain, and pregnancy_concern', () => {
      const query = 'I fainted from unbearable pain and heavy bleeding';
      const res = checkAiRedFlags(query);
      expect(res.isRedFlag).toBe(true);
      expect(res.category).toBe(RED_FLAG_CATEGORIES.FAINTING);
    });

    it('prioritizes heavy_bleeding over severe_pain and pregnancy_concern', () => {
      const query = 'I have unbearable pain and I am soaking a pad every hour';
      const res = checkAiRedFlags(query);
      expect(res.isRedFlag).toBe(true);
      expect(res.category).toBe(RED_FLAG_CATEGORIES.HEAVY_BLEEDING);
      expect(res.conditionId).toBe('heavy-periods');
    });

    it('prioritizes severe_pain over pregnancy_concern', () => {
      const query = 'I might be pregnant and have unbearable pain';
      const res = checkAiRedFlags(query);
      expect(res.isRedFlag).toBe(true);
      expect(res.category).toBe(RED_FLAG_CATEGORIES.SEVERE_PAIN);
      expect(res.conditionId).toBe('dysmenorrhea');
    });
  });

  describe('False Positive Prevention (Normal Questions Must NOT Trigger)', () => {
    const safeQueries = [
      'what should I eat during periods',
      'cramps tips',
      'mild pain',
      'I feel tired',
      'is it normal to have PMS',
      'how much water should I drink in follicular phase',
      'bleeding started today on cycle day 28',
      'normal period length',
      'is light spotting normal after ovulation',
      'tips for fatigue and low energy',
      'slight cramps in morning',
      'mild betha pete ki khabo',
      'cramps relief yoga poses',
      'feeling sleepy today',
      'what foods help with bloating',
      'I am dying to know about cramps',
    ];

    safeQueries.forEach((query) => {
      it(`does not trigger red flag for: "${query}"`, () => {
        const res = checkAiRedFlags(query);
        expect(res).toEqual({
          isRedFlag: false,
          category: null,
          message: null,
          conditionId: null,
        });
      });
    });

    it('does not trigger on metaphorical expressions like "I am dying to know about cramps"', () => {
      expect(checkAiRedFlags('I am dying to know about cramps')).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });
    });

    it('does not trigger on plain mild words alone (pain, bleeding, tired)', () => {
      expect(checkAiRedFlags('just standard period pain')).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags('my bleeding is light today')).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });

      expect(checkAiRedFlags('feeling tired during luteal')).toEqual({
        isRedFlag: false,
        category: null,
        message: null,
        conditionId: null,
      });
    });
  });
});
