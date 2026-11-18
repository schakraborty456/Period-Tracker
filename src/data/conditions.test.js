import { describe, it, expect } from 'vitest';
import {
  CONDITIONS,
  CONDITIONS_REVIEW_STATUS,
  CONDITIONS_DISCLAIMER,
  CONDITION_CATEGORIES,
  getConditionById,
  getConditionsByCategory,
  searchConditions,
  getConditionForRiskFlag,
  getAllConditions,
} from './conditions';
import { WORKOUT_ROUTINES } from './workouts';
import { RISK_FLAGS } from './riskFlags';

// Banned words list per Rules.md §5.3 and Task 6.2g instructions
const BANNED_PATTERNS = [
  { word: 'cure', regex: /\bcures?\b/i },
  { word: 'treat', regex: /\btreats?\b/i },
  { word: 'treatment', regex: /\btreatments?\b/i },
  { word: 'heal', regex: /\bheal(s|ing|ed)?\b/i },
  { word: 'guaranteed', regex: /\bguarantee(d|s)?\b/i },
  { word: 'diagnose you', regex: /\bdiagnos(e|ing|ed)\s+you\b/i },
  { word: 'ibuprofen', regex: /\bibuprofen\b/i },
  { word: 'paracetamol', regex: /\bparacetamol\b/i },
  { word: 'mefenamic', regex: /\bmefenamic\b/i },
  { word: 'metformin', regex: /\bmetformin\b/i },
  { word: 'aspirin', regex: /\baspirin\b/i },
  { word: 'pills', regex: /\bpills?\b/i },
  { word: 'supplement', regex: /\bsupplements?\b/i },
  { word: 'herbal', regex: /\bherbal\b/i },
];

/**
 * Recursively inspect all string fields in a condition object.
 * Returns array of { conditionId, fieldPath, bannedWord, snippet }.
 */
function scanConditionForBannedWords(condition) {
  const violations = [];

  function checkString(text, fieldPath) {
    if (typeof text !== 'string') return;
    for (const { word, regex } of BANNED_PATTERNS) {
      // Exception: "treatment" or "treat" is allowed inside what a doctor may check / clinical check context
      const isDoctorCheckField =
        fieldPath.includes('whatDoctorMayCheck') || fieldPath.toLowerCase().includes('what a doctor may check');
      if (isDoctorCheckField && (word === 'treatment' || word === 'treat')) {
        continue;
      }

      if (regex.test(text)) {
        violations.push({
          conditionId: condition.id,
          fieldPath,
          bannedWord: word,
          snippet: text.length > 80 ? text.substring(0, 80) + '...' : text,
        });
      }
    }
  }

  // Scan specific known fields
  checkString(condition.title, 'title');
  checkString(condition.shortName, 'shortName');
  checkString(condition.summary, 'summary');

  condition.symptoms?.forEach((sym, idx) => {
    checkString(sym, `symptoms[${idx}]`);
  });

  condition.whenToSeeDoctor?.forEach((item, idx) => {
    checkString(item, `whenToSeeDoctor[${idx}]`);
  });

  if (condition.homeComfort) {
    Object.entries(condition.homeComfort).forEach(([key, val]) => {
      checkString(val, `homeComfort.${key}`);
    });
  }

  condition.whatDoctorMayCheck?.forEach((item, idx) => {
    checkString(item, `whatDoctorMayCheck[${idx}]`);
  });

  condition.mythsVsFacts?.forEach((item, idx) => {
    checkString(item.myth, `mythsVsFacts[${idx}].myth`);
    checkString(item.fact, `mythsVsFacts[${idx}].fact`);
  });

  return violations;
}

describe('Conditions Library Data Structure & Initial 3 Conditions (Task 6.2g)', () => {
  it('contains the first 3 planned conditions: pcos, pms, dysmenorrhea', () => {
    expect(CONDITIONS.length).toBeGreaterThanOrEqual(3);
    const ids = CONDITIONS.map((c) => c.id);
    expect(ids).toContain('pcos');
    expect(ids).toContain('pms');
    expect(ids).toContain('dysmenorrhea');
  });

  it('guarantees unique condition IDs', () => {
    const ids = CONDITIONS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('verifies every condition has all required fields per Architecture.md §5.2', () => {
    const validCategories = [
      'cycle-irregularity',
      'pain-discomfort',
      'flow-blood',
      'hormonal-systemic',
    ];

    CONDITIONS.forEach((condition) => {
      // Basic identifier fields
      expect(typeof condition.id).toBe('string');
      expect(condition.id.trim()).not.toBe('');
      expect(typeof condition.title).toBe('string');
      expect(condition.title.trim()).not.toBe('');
      expect(typeof condition.shortName).toBe('string');
      expect(validCategories).toContain(condition.category);
      expect(typeof condition.categoryLabel).toBe('string');

      // Educational summary & symptoms
      expect(typeof condition.summary).toBe('string');
      expect(condition.summary.length).toBeGreaterThan(30);
      expect(Array.isArray(condition.symptoms)).toBe(true);
      expect(condition.symptoms.length).toBeGreaterThanOrEqual(3);
      condition.symptoms.forEach((s) => expect(typeof s).toBe('string'));

      // When to see a doctor (red flags)
      expect(Array.isArray(condition.whenToSeeDoctor)).toBe(true);
      expect(condition.whenToSeeDoctor.length).toBeGreaterThanOrEqual(2);
      condition.whenToSeeDoctor.forEach((rf) => expect(typeof rf).toBe('string'));

      // Home comfort object
      expect(condition.homeComfort).toBeDefined();
      expect(typeof condition.homeComfort.food).toBe('string');
      expect(typeof condition.homeComfort.sleep).toBe('string');
      expect(typeof condition.homeComfort.stress).toBe('string');
      expect(typeof condition.homeComfort.hydration).toBe('string');
      expect(typeof condition.homeComfort.heatAndMovement).toBe('string');

      // Check home comfort phrasing rule: must include "may help ease discomfort"
      Object.entries(condition.homeComfort).forEach(([key, val]) => {
        expect(
          val.toLowerCase().includes('may help ease discomfort'),
          `Condition "${condition.id}" homeComfort.${key} must include "may help ease discomfort"`
        ).toBe(true);
      });

      // What a doctor may check
      expect(Array.isArray(condition.whatDoctorMayCheck)).toBe(true);
      expect(condition.whatDoctorMayCheck.length).toBeGreaterThanOrEqual(2);
      condition.whatDoctorMayCheck.forEach((testItem) => expect(typeof testItem).toBe('string'));

      // Myths vs Facts
      expect(Array.isArray(condition.mythsVsFacts)).toBe(true);
      expect(condition.mythsVsFacts.length).toBeGreaterThanOrEqual(1);
      condition.mythsVsFacts.forEach((mf) => {
        expect(typeof mf.myth).toBe('string');
        expect(typeof mf.fact).toBe('string');
      });

      // Links & references
      expect(Array.isArray(condition.relatedWorkoutIds)).toBe(true);
      expect(condition.relatedWorkoutIds.length).toBeGreaterThanOrEqual(1);

      // needsReview must be strictly true
      expect(condition.needsReview).toBe(true);
    });
  });

  it('validates relatedWorkoutIds point to real existing routines in workouts.js', () => {
    const validWorkoutIds = new Set(WORKOUT_ROUTINES.map((w) => w.id));

    CONDITIONS.forEach((condition) => {
      condition.relatedWorkoutIds.forEach((workoutId) => {
        expect(
          validWorkoutIds.has(workoutId),
          `Condition "${condition.id}" references invalid workoutId "${workoutId}"`
        ).toBe(true);
      });
    });
  });

  it('validates relatedRiskFlagId points to real existing flags in riskFlags.js or is null', () => {
    const validRiskFlagIds = new Set(Object.keys(RISK_FLAGS));

    CONDITIONS.forEach((condition) => {
      if (condition.relatedRiskFlagId !== null) {
        expect(
          validRiskFlagIds.has(condition.relatedRiskFlagId),
          `Condition "${condition.id}" references invalid relatedRiskFlagId "${condition.relatedRiskFlagId}"`
        ).toBe(true);
      }
    });
  });

  it('explicitly mentions PCOD in the PCOS entry title or summary', () => {
    const pcos = getConditionById('pcos');
    expect(pcos).toBeDefined();
    const text = `${pcos.title} ${pcos.summary}`.toUpperCase();
    expect(text.includes('PCOD')).toBe(true);
  });

  it('passes strict banned-words check across all fields, reporting exact condition and field', () => {
    const allViolations = [];

    CONDITIONS.forEach((condition) => {
      const violations = scanConditionForBannedWords(condition);
      allViolations.push(...violations);
    });

    const report = allViolations
      .map(
        (v) =>
          `[${v.conditionId}] Field "${v.fieldPath}" contains banned word "${v.bannedWord}": "${v.snippet}"`
      )
      .join('\n');

    expect(
      allViolations.length,
      `Banned words found in Conditions Library:\n${report}`
    ).toBe(0);
  });

  describe('Helper Functions', () => {
    it('getConditionById returns the correct condition or undefined', () => {
      expect(getConditionById('pcos')?.shortName).toBe('PCOS');
      expect(getConditionById('PCOS')?.shortName).toBe('PCOS'); // Case-insensitive
      expect(getConditionById('non-existent')).toBeUndefined();
      expect(getConditionById(null)).toBeUndefined();
    });

    it('getConditionsByCategory filters correctly', () => {
      const all = getConditionsByCategory('all');
      expect(all.length).toBe(CONDITIONS.length);

      const hormonal = getConditionsByCategory('hormonal-systemic');
      expect(hormonal.every((c) => c.category === 'hormonal-systemic')).toBe(true);
      expect(hormonal.some((c) => c.id === 'pcos')).toBe(true);

      const pain = getConditionsByCategory('pain-discomfort');
      expect(pain.some((c) => c.id === 'dysmenorrhea')).toBe(true);
      expect(pain.some((c) => c.id === 'pms')).toBe(true);
    });

    it('searchConditions finds conditions by keyword across title, shortName, summary, and symptoms', () => {
      expect(searchConditions('PCOD').some((c) => c.id === 'pcos')).toBe(true);
      expect(searchConditions('cramps').some((c) => c.id === 'dysmenorrhea')).toBe(true);
      expect(searchConditions('luteal').some((c) => c.id === 'pms')).toBe(true);
      expect(searchConditions('nonexistentkeywordxyz')).toEqual([]);
      expect(searchConditions('').length).toBe(CONDITIONS.length);
    });

    it('getConditionForRiskFlag matches risk flag IDs', () => {
      expect(getConditionForRiskFlag('pcos_possible')?.id).toBe('pcos');
      expect(getConditionForRiskFlag('severe_pain_possible')?.id).toBe('dysmenorrhea');
      expect(getConditionForRiskFlag('non_existent')).toBeUndefined();
    });

    it('getAllConditions returns all conditions', () => {
      expect(getAllConditions()).toBe(CONDITIONS);
    });
  });
});
