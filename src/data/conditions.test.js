import { describe, it, expect } from 'vitest';
import {
  CONDITIONS,
  CONDITIONS_REVIEW_STATUS,
  CONDITIONS_DISCLAIMER,
  CONDITION_CATEGORIES,
  getConditionById,
  getConditionsByCategory,
  searchConditions,
  filterConditions,
  getConditionForRiskFlag,
  getConditionsForRiskFlag,
  getAllConditions,
} from './conditions';
import { WORKOUT_ROUTINES } from './workouts';
import { RISK_FLAGS } from './riskFlags';

// Banned words list per Rules.md §5.3, Task 6.2g, and Task 6.2h instructions
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
  { word: 'iron tablets', regex: /\biron\s+tablets?\b/i },
  { word: 'anti-inflammatory', regex: /\banti-?inflammator(y|ies)\b/i },
  { word: 'detox', regex: /\bdetox(ification|ing|s)?\b/i },
  { word: 'balance hormones', regex: /\bbalance\s+(\w+\s+)?hormones?\b/i },
  { word: 'boost immunity', regex: /\bboost(s|ing)?\s+immunity\b/i },
  { word: 'reduces', regex: /\breduces?\b/i },
  { word: 'prevents', regex: /\bprevents?\b/i },
  { word: 'improves fertility', regex: /\bimprove(s|d|ing)?\s+fertility\b/i },
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

describe('Conditions Library Complete 11 Conditions & Schema (Tasks 6.2g, 6.2h, 6.2i, 6.2m)', () => {
  const EXPECTED_IDS = [
    'pcos',
    'pms',
    'dysmenorrhea',
    'heavy-periods',
    'anemia',
    'endometriosis',
    'thyroid',
    'irregular-periods',
    'fibroids',
    'adenomyosis',
    'pmdd',
  ];

  it('contains exactly the 11 planned conditions with expected IDs', () => {
    expect(CONDITIONS.length).toBe(11);
    const ids = CONDITIONS.map((c) => c.id);
    EXPECTED_IDS.forEach((expectedId) => {
      expect(ids).toContain(expectedId);
    });
  });

  it('guarantees unique condition IDs across all entries', () => {
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

  it('validates relatedRiskFlagId matches the specific mappings requested in Task 6.2h', () => {
    const validRiskFlagIds = new Set(Object.keys(RISK_FLAGS));

    CONDITIONS.forEach((condition) => {
      if (condition.relatedRiskFlagId !== null) {
        expect(
          validRiskFlagIds.has(condition.relatedRiskFlagId),
          `Condition "${condition.id}" references invalid relatedRiskFlagId "${condition.relatedRiskFlagId}"`
        ).toBe(true);
      }
    });

    // Check specific flag pairings per Task 6.2h & 6.2m
    expect(getConditionById('heavy-periods')?.relatedRiskFlagId).toBe('anemia_possible');
    expect(getConditionById('anemia')?.relatedRiskFlagId).toBe('anemia_possible');
    expect(getConditionById('endometriosis')?.relatedRiskFlagId).toBe('severe_pain_possible');
    expect(getConditionById('thyroid')?.relatedRiskFlagId).toBe('thyroid_possible');
    expect(getConditionById('irregular-periods')?.relatedRiskFlagId).toBe('see_doctor_soon');
    expect(getConditionById('fibroids')?.relatedRiskFlagId).toBe('anemia_possible');
    expect(getConditionById('adenomyosis')?.relatedRiskFlagId).toBe('severe_pain_possible');
    expect(getConditionById('pmdd')?.relatedRiskFlagId).toBeNull();
  });

  it('verifies specific content rules for fibroids, adenomyosis, and pmdd (Task 6.2m)', () => {
    const fibroids = getConditionById('fibroids');
    const adenomyosis = getConditionById('adenomyosis');
    const pmdd = getConditionById('pmdd');

    expect(fibroids).toBeDefined();
    expect(adenomyosis).toBeDefined();
    expect(pmdd).toBeDefined();

    // pmdd whenToSeeDoctor must mention seeing a doctor when mood symptoms feel severe or include thoughts of self-harm / harming yourself
    const pmddRedFlags = pmdd.whenToSeeDoctor.join(' ').toLowerCase();
    expect(
      pmddRedFlags.includes('harming yourself') || pmddRedFlags.includes('self-harm')
    ).toBe(true);
    expect(pmddRedFlags).toContain('severe');

    // fibroids and adenomyosis make NO claims about fertility outcomes or causes
    const fibroidsText = JSON.stringify(fibroids).toLowerCase();
    expect(fibroidsText).not.toContain('infertility');
    expect(fibroidsText).not.toContain('infertile');
    expect(fibroidsText).not.toContain('cure');

    const adenoText = JSON.stringify(adenomyosis).toLowerCase();
    expect(adenoText).not.toContain('infertility');
    expect(adenoText).not.toContain('infertile');
    expect(adenoText).not.toContain('cure');
  });

  it('verifies specific content rules for anemia and heavy periods', () => {
    const anemia = getConditionById('anemia');
    const heavy = getConditionById('heavy-periods');

    expect(anemia).toBeDefined();
    expect(heavy).toBeDefined();

    // Anemia food mentions Indian/Bengali sources
    const anemiaFood = anemia.homeComfort.food.toLowerCase();
    expect(anemiaFood).toContain('dal');
    expect(anemiaFood).toContain('shak');
    expect(anemiaFood).toContain('gur');
    expect(anemiaFood).toContain('til');
    expect(anemiaFood).toContain('egg');
    expect(anemiaFood).toContain('mach');
    expect(anemiaFood).toContain('meat');

    // Anemia explicitly states blood test is the only way to know
    const anemiaSummaryAndFacts = (anemia.summary + ' ' + JSON.stringify(anemia.mythsVsFacts)).toLowerCase();
    expect(anemiaSummaryAndFacts).toContain('blood test');

    // Both heavy-periods and anemia whenToSeeDoctor include soaking a pad every hour and dizziness/fainting
    [heavy, anemia].forEach((cond) => {
      const redFlags = cond.whenToSeeDoctor.join(' ').toLowerCase();
      expect(redFlags).toContain('every hour');
      const hasDizzinessOrFaint = redFlags.includes('dizziness') || redFlags.includes('faint');
      expect(hasDizzinessOrFaint).toBe(true);
    });
  });

  it('verifies irregular-periods includes causes and pregnancy consideration', () => {
    const irregular = getConditionById('irregular-periods');
    expect(irregular).toBeDefined();
    const text = (irregular.summary + ' ' + irregular.whenToSeeDoctor.join(' ')).toLowerCase();
    expect(text).toContain('pregnancy');
    expect(text).toContain('stress');
  });

  it('verifies endometriosis makes NO claims about fertility outcomes or causes', () => {
    const endo = getConditionById('endometriosis');
    expect(endo).toBeDefined();
    const allText = JSON.stringify(endo).toLowerCase();
    expect(allText).not.toContain('infertility');
    expect(allText).not.toContain('infertile');
    expect(allText).not.toContain('barren');
    expect(allText).not.toContain('cure');
  });

  it('passes strict banned-words check across all 11 conditions, reporting exact condition and field', () => {
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

  it('uses whole-word matching so that "health", "healthy", and "healthcare" are never falsely flagged', () => {
    const mockCondition = {
      id: 'test-condition',
      title: 'Women Health Guide',
      shortName: 'Health',
      summary: 'Promoting healthy habits and consulting healthcare professionals for health concerns.',
      symptoms: ['Changes in healthy cycle rhythm', 'General health observations'],
      whenToSeeDoctor: ['Contact healthcare provider for severe signs'],
      homeComfort: {
        food: 'Healthy food choices may help ease discomfort',
        sleep: 'Healthy rest routines may help ease discomfort',
        stress: 'Healthy relaxation may help ease discomfort',
        hydration: 'Healthy water intake may help ease discomfort',
        heatAndMovement: 'Healthy stretching may help ease discomfort',
      },
      whatDoctorMayCheck: ['Complete health screening and treatment options discussion'],
      mythsVsFacts: [
        {
          myth: 'Myth about health',
          fact: 'Fact supporting healthy living and healthcare guidance',
        },
      ],
    };

    const violations = scanConditionForBannedWords(mockCondition);
    expect(
      violations,
      `Banned words scanner should not flag whole words like "health" or "healthy": ${JSON.stringify(violations)}`
    ).toEqual([]);
  });

  it('strictly flags health claims including anti-inflammatory, detox, balance hormones, boost immunity, reduces, prevents, and improves fertility', () => {
    const testCases = [
      { text: 'This anti-inflammatory tea soothes cramps.', bannedWord: 'anti-inflammatory' },
      { text: 'A quick detox routine cleanses the body.', bannedWord: 'detox' },
      { text: 'Eat this food to balance hormones naturally.', bannedWord: 'balance hormones' },
      { text: 'These habits boost immunity during periods.', bannedWord: 'boost immunity' },
      { text: 'This stretch reduces pain instantly.', bannedWord: 'reduces' },
      { text: 'Regular exercise prevents cramps completely.', bannedWord: 'prevents' },
      { text: 'This diet improves fertility fast.', bannedWord: 'improves fertility' },
    ];

    testCases.forEach(({ text, bannedWord }) => {
      const mockCondition = {
        id: 'mock-claim-test',
        title: 'Mock Guide',
        shortName: 'Mock',
        summary: text,
      };
      const violations = scanConditionForBannedWords(mockCondition);
      expect(
        violations.some((v) => v.bannedWord === bannedWord),
        `Expected scanner to flag banned word "${bannedWord}" in "${text}"`
      ).toBe(true);
    });
  });

  describe('Helper Functions across all 11 Conditions', () => {
    it('getConditionById returns the correct condition or undefined', () => {
      expect(getConditionById('heavy-periods')?.shortName).toBe('Heavy Periods');
      expect(getConditionById('AnEmIa')?.shortName).toBe('Anemia');
      expect(getConditionById('fibroids')?.shortName).toBe('Fibroids');
      expect(getConditionById('adenomyosis')?.shortName).toBe('Adenomyosis');
      expect(getConditionById('pmdd')?.shortName).toBe('PMDD');
      expect(getConditionById('non-existent')).toBeUndefined();
      expect(getConditionById(null)).toBeUndefined();
    });

    it('getConditionsByCategory filters correctly across all 4 categories', () => {
      const all = getConditionsByCategory('all');
      expect(all.length).toBe(11);

      const hormonal = getConditionsByCategory('hormonal-systemic');
      expect(hormonal.map((c) => c.id).sort()).toEqual(['pcos', 'pmdd', 'thyroid'].sort());

      const pain = getConditionsByCategory('pain-discomfort');
      expect(pain.map((c) => c.id).sort()).toEqual(
        ['adenomyosis', 'dysmenorrhea', 'endometriosis', 'pms'].sort()
      );

      const flow = getConditionsByCategory('flow-blood');
      expect(flow.map((c) => c.id).sort()).toEqual(
        ['anemia', 'fibroids', 'heavy-periods'].sort()
      );

      const cycle = getConditionsByCategory('cycle-irregularity');
      expect(cycle.map((c) => c.id)).toEqual(['irregular-periods']);
    });

    it('searchConditions finds conditions across all 11 entries', () => {
      expect(searchConditions('thyroid').some((c) => c.id === 'thyroid')).toBe(true);
      expect(searchConditions('iron').some((c) => c.id === 'anemia')).toBe(true);
      expect(searchConditions('endometriosis').some((c) => c.id === 'endometriosis')).toBe(true);
      expect(searchConditions('clots').some((c) => c.id === 'heavy-periods')).toBe(true);
      expect(searchConditions('amenorrhea').some((c) => c.id === 'irregular-periods')).toBe(true);
      expect(searchConditions('fibroid').some((c) => c.id === 'fibroids')).toBe(true);
      expect(searchConditions('myometrium').some((c) => c.id === 'adenomyosis')).toBe(true);
      expect(searchConditions('dysphoric').some((c) => c.id === 'pmdd')).toBe(true);
      expect(searchConditions('nonexistentxyz')).toEqual([]);
    });

    it('getConditionForRiskFlag and getConditionsForRiskFlag return matching conditions', () => {
      // First match
      expect(getConditionForRiskFlag('see_doctor_soon')?.id).toBe('irregular-periods');
      expect(getConditionForRiskFlag('thyroid_possible')?.id).toBe('thyroid');

      // Multiple matches
      const anemiaMatches = getConditionsForRiskFlag('anemia_possible');
      expect(anemiaMatches.length).toBe(3);
      expect(anemiaMatches.map((c) => c.id).sort()).toEqual(
        ['anemia', 'fibroids', 'heavy-periods'].sort()
      );

      const painMatches = getConditionsForRiskFlag('severe_pain_possible');
      expect(painMatches.length).toBe(3);
      expect(painMatches.map((c) => c.id).sort()).toEqual(
        ['adenomyosis', 'dysmenorrhea', 'endometriosis'].sort()
      );

      expect(getConditionsForRiskFlag('non_existent')).toEqual([]);
    });

    it('getAllConditions returns all 11 conditions', () => {
      expect(getAllConditions()).toBe(CONDITIONS);
      expect(getAllConditions().length).toBe(11);
    });

    describe('filterConditions (combined category & search query logic)', () => {
      it('returns all conditions when no filter or empty params are provided', () => {
        expect(filterConditions().length).toBe(11);
        expect(filterConditions({ category: 'all', query: '' }).length).toBe(11);
      });

      it('filters correctly by category only', () => {
        const painConditions = filterConditions({ category: 'pain-discomfort' });
        expect(painConditions.length).toBe(4);
        expect(painConditions.map((c) => c.id).sort()).toEqual(
          ['adenomyosis', 'dysmenorrhea', 'endometriosis', 'pms'].sort()
        );

        const flowConditions = filterConditions({ category: 'flow-blood' });
        expect(flowConditions.length).toBe(3);
        expect(flowConditions.map((c) => c.id).sort()).toEqual(
          ['anemia', 'fibroids', 'heavy-periods'].sort()
        );
      });

      it('filters correctly by search query only across title, summary, symptoms, and myths', () => {
        const queryResults = filterConditions({ query: 'palpitations' });
        expect(queryResults.length).toBe(1);
        expect(queryResults[0].id).toBe('anemia');

        const pcosResults = filterConditions({ query: 'pcod' });
        expect(pcosResults.length).toBe(1);
        expect(pcosResults[0].id).toBe('pcos');
      });

      it('combines category filter and search query correctly', () => {
        // In 'flow-blood', searching 'coin' should match only heavy-periods
        const coinCombined = filterConditions({
          category: 'flow-blood',
          query: 'coin',
        });
        expect(coinCombined.length).toBe(1);
        expect(coinCombined[0].id).toBe('heavy-periods');

        // In 'flow-blood', searching 'clots' matches both heavy-periods and fibroids
        const clotsCombined = filterConditions({
          category: 'flow-blood',
          query: 'clots',
        });
        expect(clotsCombined.length).toBe(2);
        expect(clotsCombined.map((c) => c.id).sort()).toEqual(
          ['fibroids', 'heavy-periods'].sort()
        );

        // In 'pain-discomfort', searching 'luteal' should match only pms
        const pmsCombined = filterConditions({
          category: 'pain-discomfort',
          query: 'luteal',
        });
        expect(pmsCombined.length).toBe(1);
        expect(pmsCombined[0].id).toBe('pms');
      });

      it('returns empty array when category and search query do not overlap', () => {
        // 'thyroid' is in 'hormonal-systemic', not in 'pain-discomfort'
        const mismatch = filterConditions({
          category: 'pain-discomfort',
          query: 'thyroid',
        });
        expect(mismatch).toEqual([]);
      });

      it('returns empty array when query does not match any condition', () => {
        const noMatch = filterConditions({ query: 'nonexistentquery999xyz' });
        expect(noMatch).toEqual([]);
      });

      it('handles whitespace and mixed casing smoothly', () => {
        const trimmed = filterConditions({ query: '   EndoMetriosis   ' });
        expect(trimmed.length).toBe(2);
        expect(trimmed.map((c) => c.id).sort()).toEqual(['adenomyosis', 'endometriosis'].sort());

        const dysmenorrhea = filterConditions({ query: '   DysMenORRhea   ' });
        expect(dysmenorrhea.length).toBe(1);
        expect(dysmenorrhea[0].id).toBe('dysmenorrhea');
      });
    });
  });
});
