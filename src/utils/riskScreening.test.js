import { describe, it, expect } from 'vitest';
import {
  evaluateRiskFlags,
  checkLongBleedingStreak,
  MIN_COMPLETED_CYCLES,
  MIN_LOG_DAYS,
  LONG_CYCLE_DAYS,
  SEVERE_PAIN_MIN,
  LONG_BLEEDING_DAYS,
  NO_PERIOD_DAYS,
  MANDATORY_DISCLAIMER,
  INSUFFICIENT_DATA_MESSAGE,
} from './riskScreening.js';

describe('Risk Screening Engine (Task 6.2b)', () => {
  // Helper to generate consecutive normal periods (3 completed cycles)
  const createNormalPeriods = (cycleLength = 28) => [
    { id: 'p4', startDate: '2026-04-01' },
    { id: 'p3', startDate: '2026-03-04' }, // 28 days
    { id: 'p2', startDate: '2026-02-04' }, // 28 days
    { id: 'p1', startDate: '2026-01-07' }, // 28 days
  ];

  // Helper to generate 60 days of daily logs
  const createDailyLogsCount = (count = 60, defaultData = {}) => {
    const logs = [];
    for (let i = 1; i <= count; i++) {
      const month = String(Math.floor((i - 1) / 28) + 1).padStart(2, '0');
      const day = String(((i - 1) % 28) + 1).padStart(2, '0');
      logs.push({
        date: `2026-${month}-${day}`,
        flow: 'none',
        mood: 'calm',
        symptoms: [],
        painScore: null,
        waterGlasses: 4,
        ...defaultData,
      });
    }
    return logs;
  };

  describe('1. Threshold Constants Verification', () => {
    it('exports all expected clinical and gating threshold constants', () => {
      expect(MIN_COMPLETED_CYCLES).toBe(3);
      expect(MIN_LOG_DAYS).toBe(60);
      expect(LONG_CYCLE_DAYS).toBe(35);
      expect(SEVERE_PAIN_MIN).toBe(7);
      expect(LONG_BLEEDING_DAYS).toBe(7);
      expect(NO_PERIOD_DAYS).toBe(90);
      expect(MANDATORY_DISCLAIMER).toContain('Possible signs are showing in your pattern');
      expect(MANDATORY_DISCLAIMER).toContain('This is not a diagnosis');
      expect(INSUFFICIENT_DATA_MESSAGE).toBe('Keep logging, we need more data');
    });
  });

  describe('2. Minimum Data Gate', () => {
    it('returns hasEnoughData false when no periods and no logs are passed', () => {
      const result = evaluateRiskFlags({});
      expect(result.hasEnoughData).toBe(false);
      expect(result.message).toBe('Keep logging, we need more data');
      expect(result.flags).toEqual([]);
    });

    it('returns hasEnoughData false when only 1 or 2 cycles are completed and logs < 60 days', () => {
      // 2 periods = only 1 completed cycle
      const periods = [
        { startDate: '2026-02-28' },
        { startDate: '2026-01-31' },
      ];
      const logs = createDailyLogsCount(20);

      const result = evaluateRiskFlags({ periods, dailyLogs: logs });
      expect(result.hasEnoughData).toBe(false);
      expect(result.message).toBe('Keep logging, we need more data');
      expect(result.flags).toHaveLength(0);
    });

    it('returns hasEnoughData true when 3 completed cycles exist (even with few daily logs)', () => {
      const periods = createNormalPeriods(28); // 4 periods = 3 completed cycles (latest is 2026-04-01)
      const logs = [{ date: '2026-04-01', flow: 'light' }];

      // Pass today close to latest period (e.g. 2026-04-15, only 14 days later)
      const result = evaluateRiskFlags({ periods, dailyLogs: logs, today: '2026-04-15' });
      expect(result.hasEnoughData).toBe(true);
      expect(result.flags).toEqual([]);
      expect(result.message).toContain('No risk patterns flagged');
    });

    it('returns hasEnoughData true when 60 unique log days exist (even without 3 completed cycles)', () => {
      const periods = [{ startDate: '2026-03-01' }]; // only 1 period
      const logs = createDailyLogsCount(60);

      const result = evaluateRiskFlags({ periods, dailyLogs: logs, today: '2026-03-10' });
      expect(result.hasEnoughData).toBe(true);
    });
  });

  describe('3. Red Flag: see_doctor_soon', () => {
    it('triggers when no period has been recorded for 90 or more days', () => {
      const periods = [
        { startDate: '2026-05-01' },
        { startDate: '2026-04-01' },
        { startDate: '2026-03-01' },
        { startDate: '2026-02-01' },
      ];
      // 90 days after May 1, 2026 is July 30, 2026
      const today = '2026-07-30';

      const result = evaluateRiskFlags({ periods, today });
      expect(result.hasEnoughData).toBe(true);
      const flag = result.flags.find((f) => f.id === 'see_doctor_soon');
      expect(flag).toBeDefined();
      expect(flag.label).toContain('See a Doctor Soon');
      expect(flag.reasons.some((r) => r.includes('90 days') || r.includes('3 consecutive months'))).toBe(true);
    });

    it('does NOT trigger 90-day alert on boundary (89 days after last period)', () => {
      const periods = [
        { startDate: '2026-05-01' },
        { startDate: '2026-04-01' },
        { startDate: '2026-03-01' },
        { startDate: '2026-02-01' },
      ];
      // 89 days after May 1, 2026 is July 29, 2026
      const today = '2026-07-29';

      const result = evaluateRiskFlags({ periods, today });
      const flag = result.flags.find((f) => f.id === 'see_doctor_soon');
      expect(flag).toBeUndefined();
    });

    it('triggers when bleeding lasts for more than 7 consecutive days in daily logs (8 days)', () => {
      const periods = createNormalPeriods(28);
      const bleedingLogs = [
        { date: '2026-04-01', flow: 'heavy' },
        { date: '2026-04-02', flow: 'heavy' },
        { date: '2026-04-03', flow: 'medium' },
        { date: '2026-04-04', flow: 'medium' },
        { date: '2026-04-05', flow: 'light' },
        { date: '2026-04-06', flow: 'light' },
        { date: '2026-04-07', flow: 'light' },
        { date: '2026-04-08', flow: 'light' }, // 8th consecutive day
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: bleedingLogs,
        today: '2026-04-10',
      });

      const flag = result.flags.find((f) => f.id === 'see_doctor_soon');
      expect(flag).toBeDefined();
      expect(flag.reasons.some((r) => r.includes('8 consecutive days') || r.includes('longer than 7 days'))).toBe(true);
    });

    it('does NOT trigger long bleeding alert when bleeding is exactly 7 consecutive days (boundary)', () => {
      const periods = createNormalPeriods(28);
      const bleedingLogs = [
        { date: '2026-04-01', flow: 'medium' },
        { date: '2026-04-02', flow: 'medium' },
        { date: '2026-04-03', flow: 'medium' },
        { date: '2026-04-04', flow: 'medium' },
        { date: '2026-04-05', flow: 'light' },
        { date: '2026-04-06', flow: 'light' },
        { date: '2026-04-07', flow: 'light' }, // exactly 7 days
      ];

      const streak = checkLongBleedingStreak(bleedingLogs, periods, 7);
      expect(streak.hasLongBleeding).toBe(false);
      expect(streak.maxStreak).toBe(7);

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: bleedingLogs,
        today: '2026-04-10',
      });
      const flag = result.flags.find((f) => f.id === 'see_doctor_soon');
      expect(flag).toBeUndefined();
    });
  });

  describe('4. PCOS Risk Pattern: pcos_possible', () => {
    it('triggers when cycles are longer than 35 days and acne or excess hair is logged', () => {
      // 3 cycles each 38 days long (> 35 days)
      const periods = [
        { startDate: '2026-04-26' },
        { startDate: '2026-03-19' }, // 38 days
        { startDate: '2026-02-09' }, // 38 days
        { startDate: '2026-01-02' }, // 38 days
      ];
      const logs = [
        { date: '2026-04-10', symptoms: ['acne', 'excess_hair'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-05-01',
      });

      const pcos = result.flags.find((f) => f.id === 'pcos_possible');
      expect(pcos).toBeDefined();
      expect(pcos.label).toBe('Possible Signs of PCOS');
      expect(pcos.reasons.some((r) => r.includes('35 days'))).toBe(true);
      expect(pcos.reasons.some((r) => r.includes('acne') && r.includes('excess hair'))).toBe(true);
      expect(result.message).toBe(MANDATORY_DISCLAIMER);
    });

    it('triggers when cycles are highly irregular (variation > 7 days) and hair loss or weight change is logged', () => {
      // cycles: 26d, 36d, 27d (variation: 36 - 26 = 10 > 7 days)
      const periods = [
        { startDate: '2026-03-30' },
        { startDate: '2026-03-04' }, // 26 days
        { startDate: '2026-01-27' }, // 36 days
        { startDate: '2026-01-01' }, // 26 days
      ];
      const logs = [
        { date: '2026-03-15', symptoms: ['hair_loss', 'weight_change'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-05',
      });

      const pcos = result.flags.find((f) => f.id === 'pcos_possible');
      expect(pcos).toBeDefined();
      expect(pcos.reasons.some((r) => r.includes('hair thinning') || r.includes('weight fluctuations'))).toBe(true);
    });

    it('does NOT trigger PCOS flag if cycles are regular 28 days even if acne is logged', () => {
      const periods = createNormalPeriods(28); // strictly 28 days
      const logs = [
        { date: '2026-03-15', symptoms: ['acne'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-05',
      });

      expect(result.flags.find((f) => f.id === 'pcos_possible')).toBeUndefined();
    });

    it('does NOT trigger PCOS flag if cycles are long but no androgenic symptoms are logged', () => {
      const periods = [
        { startDate: '2026-04-26' },
        { startDate: '2026-03-19' }, // 38 days
        { startDate: '2026-02-09' }, // 38 days
        { startDate: '2026-01-02' }, // 38 days
      ];
      // Only generic headache logged, no acne, excess hair, hair loss, or weight change
      const logs = [
        { date: '2026-04-10', symptoms: ['headache', 'bloating'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-05-01',
      });

      expect(result.flags.find((f) => f.id === 'pcos_possible')).toBeUndefined();
    });
  });

  describe('5. Anemia Risk Pattern: anemia_possible', () => {
    it('triggers when heavy bleeding is logged together with fatigue/tiredness', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        { date: '2026-04-01', flow: 'heavy', symptoms: ['fatigue'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      const anemia = result.flags.find((f) => f.id === 'anemia_possible');
      expect(anemia).toBeDefined();
      expect(anemia.label).toBe('Possible Signs of Anemia');
      expect(anemia.reasons.some((r) => r.includes('Heavy menstrual flow'))).toBe(true);
      expect(anemia.reasons.some((r) => r.includes('fatigue'))).toBe(true);
    });

    it('triggers when heavy bleeding is logged with mood set to tired', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        { date: '2026-04-01', flow: 'heavy', mood: 'tired', symptoms: [] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      expect(result.flags.find((f) => f.id === 'anemia_possible')).toBeDefined();
    });

    it('does NOT trigger anemia flag when flow is only medium or light even with fatigue', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        { date: '2026-04-01', flow: 'medium', symptoms: ['fatigue'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      expect(result.flags.find((f) => f.id === 'anemia_possible')).toBeUndefined();
    });

    it('does NOT trigger anemia flag when flow is heavy but user reports energetic mood with no fatigue', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        { date: '2026-04-01', flow: 'heavy', mood: 'energetic', symptoms: [] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      expect(result.flags.find((f) => f.id === 'anemia_possible')).toBeUndefined();
    });
  });

  describe('6. Severe Pain / Endometriosis: severe_pain_possible', () => {
    it('triggers when severe pain score (>= 7) is recorded across 2 or more distinct cycles', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        // Cycle 1 severe pain (Feb 5)
        { date: '2026-02-05', flow: 'heavy', painScore: 8, symptoms: ['cramps'] },
        // Cycle 2 severe pain (March 5, 28 days later)
        { date: '2026-03-05', flow: 'heavy', painScore: 7, symptoms: ['cramps'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      const pain = result.flags.find((f) => f.id === 'severe_pain_possible');
      expect(pain).toBeDefined();
      expect(pain.label).toContain('Severe Pain or Endometriosis');
      expect(pain.reasons.some((r) => r.includes('7 to 10'))).toBe(true);
      expect(pain.reasons.some((r) => r.includes('2 distinct menstrual cycles'))).toBe(true);
    });

    it('does NOT trigger if painScore is high on consecutive days of the SAME cycle', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        // Both days are in the SAME cycle (March 4 and March 5, difference = 1 < 14 days)
        { date: '2026-03-04', flow: 'heavy', painScore: 9 },
        { date: '2026-03-05', flow: 'medium', painScore: 8 },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      expect(result.flags.find((f) => f.id === 'severe_pain_possible')).toBeUndefined();
    });

    it('does NOT trigger if painScore is moderate (e.g. 6) across cycles', () => {
      const periods = createNormalPeriods(28);
      const logs = [
        { date: '2026-02-05', painScore: 6 },
        { date: '2026-03-05', painScore: 6 },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-10',
      });

      expect(result.flags.find((f) => f.id === 'severe_pain_possible')).toBeUndefined();
    });
  });

  describe('7. Thyroid Irregularity: thyroid_possible', () => {
    it('triggers when irregular cycle variation is combined with fatigue and weight change', () => {
      // cycles: 24d, 36d, 26d (variation = 12 > 7 days)
      const periods = [
        { startDate: '2026-03-28' },
        { startDate: '2026-03-04' }, // 24 days
        { startDate: '2026-01-27' }, // 36 days
        { startDate: '2026-01-01' }, // 26 days
      ];
      const logs = [
        { date: '2026-02-10', symptoms: ['fatigue', 'weight_change'] },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-05',
      });

      const thyroid = result.flags.find((f) => f.id === 'thyroid_possible');
      expect(thyroid).toBeDefined();
      expect(thyroid.label).toBe('Possible Signs of Thyroid Irregularity');
      expect(thyroid.reasons.some((r) => r.includes('fatigue'))).toBe(true);
      expect(thyroid.reasons.some((r) => r.includes('Weight changes'))).toBe(true);
    });

    it('does NOT trigger thyroid flag if weight_change is absent (only fatigue and irregular)', () => {
      const periods = [
        { startDate: '2026-03-28' },
        { startDate: '2026-03-04' }, // 24 days
        { startDate: '2026-01-27' }, // 36 days
        { startDate: '2026-01-01' },
      ];
      const logs = [
        { date: '2026-02-10', symptoms: ['fatigue'] }, // no weight change
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-05',
      });

      expect(result.flags.find((f) => f.id === 'thyroid_possible')).toBeUndefined();
    });
  });

  describe('8. Multiple Flags Co-occurrence & Non-Diagnostic Formatting', () => {
    it('triggers multiple flags simultaneously and never uses diagnostic wording', () => {
      // Irregular long cycles (> 35 days, variation > 7)
      const periods = [
        { startDate: '2026-04-20' },
        { startDate: '2026-03-12' }, // 39 days
        { startDate: '2026-01-25' }, // 46 days
        { startDate: '2026-01-01' }, // 24 days
      ];

      const logs = [
        // Cycle 1: Heavy bleeding + severe pain + fatigue + acne
        {
          date: '2026-01-02',
          flow: 'heavy',
          painScore: 8,
          symptoms: ['fatigue', 'acne', 'weight_change'],
        },
        // Cycle 2: Heavy bleeding + severe pain (40 days later)
        {
          date: '2026-03-13',
          flow: 'heavy',
          painScore: 9,
          symptoms: ['fatigue', 'weight_change'],
        },
      ];

      const result = evaluateRiskFlags({
        periods,
        dailyLogs: logs,
        today: '2026-04-25',
      });

      expect(result.hasEnoughData).toBe(true);
      const flagIds = result.flags.map((f) => f.id);

      // Should trigger PCOS, Anemia, Severe Pain, and Thyroid flags
      expect(flagIds).toContain('pcos_possible');
      expect(flagIds).toContain('anemia_possible');
      expect(flagIds).toContain('severe_pain_possible');
      expect(flagIds).toContain('thyroid_possible');

      // Check non-diagnostic mandatory message
      expect(result.message).toBe(MANDATORY_DISCLAIMER);

      // Verify no diagnosis statements anywhere in output
      const jsonStr = JSON.stringify(result);
      expect(jsonStr).not.toContain('You have PCOS');
      expect(jsonStr).not.toContain('You have anemia');
      expect(jsonStr).not.toContain('You have endometriosis');
      expect(jsonStr).not.toContain('You have a thyroid disorder');
    });
  });

  describe('9. Robustness Against Legacy / Missing Fields', () => {
    it('handles legacy logs missing painScore, sleepHours, and weight without throwing', () => {
      const periods = createNormalPeriods(28);
      const legacyLogs = [
        { date: '2026-02-05', flow: 'light' }, // no symptoms, no painScore
        { date: '2026-03-05', symptoms: null, flow: null }, // nulls
        null, // null log item
        undefined, // undefined log item
        { date: '2026-04-01' }, // only date
      ];

      expect(() => {
        const result = evaluateRiskFlags({
          periods,
          dailyLogs: legacyLogs,
          today: '2026-04-10',
        });
        expect(result.hasEnoughData).toBe(true);
      }).not.toThrow();
    });
  });
});
