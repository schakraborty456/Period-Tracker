import { describe, it, expect } from 'vitest';
import {
  calculateNextPeriod,
  calculateOvulationDate,
  calculateFertileWindow,
  getCycleDay,
  getCurrentPhase,
  calculateCycleSummary,
  getPhaseDetails,
  detectIrregularCycle,
  getCycleLengthsFromPeriods,
  getEffectiveCycleLength,
} from './cycleCalculator.js';
import {
  parseLocalDate,
  formatLocalDate,
  getDaysDifference,
} from './dateHelpers.js';

describe('cycleCalculator - Pure Cycle Logic', () => {
  describe('1. Normal Cycle (28 days, 5 days period)', () => {
    const lastStart = '2026-03-01';
    const cycleLength = 28;
    const periodLength = 5;

    it('calculates the next period start date correctly', () => {
      // 2026-03-01 + 28 days = 2026-03-29
      const next = calculateNextPeriod(lastStart, cycleLength);
      expect(next).toBe('2026-03-29');
    });

    it('calculates the ovulation date correctly (14 days before next period)', () => {
      const next = calculateNextPeriod(lastStart, cycleLength);
      const ovulation = calculateOvulationDate(next);
      // 2026-03-29 - 14 days = 2026-03-15
      expect(ovulation).toBe('2026-03-15');
    });

    it('calculates fertile window (5 days before ovulation to 1 day after)', () => {
      const next = calculateNextPeriod(lastStart, cycleLength);
      const ovulation = calculateOvulationDate(next);
      const window = calculateFertileWindow(ovulation);
      expect(window.startDate).toBe('2026-03-10');
      expect(window.endDate).toBe('2026-03-16');
    });

    it('computes cycle day correctly', () => {
      expect(getCycleDay(lastStart, '2026-03-01')).toBe(1);
      expect(getCycleDay(lastStart, '2026-03-15')).toBe(15);
      expect(getCycleDay(lastStart, '2026-03-28')).toBe(28);
    });

    it('identifies phases accurately throughout the cycle', () => {
      // Menstrual: Days 1 to 5
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-01')).toBe('menstrual');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-05')).toBe('menstrual');

      // Follicular: Days 6 to 13
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-06')).toBe('follicular');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-13')).toBe('follicular');

      // Ovulation: Days 14 to 16 (Ovulation day 15 +/- 1 day)
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-14')).toBe('ovulation');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-15')).toBe('ovulation');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-16')).toBe('ovulation');

      // Luteal: Days 17 to 28
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-17')).toBe('luteal');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-03-28')).toBe('luteal');
    });

    it('provides complete summary for a day inside the cycle', () => {
      const summary = calculateCycleSummary(lastStart, cycleLength, periodLength, '2026-03-15');
      expect(summary.cycleDay).toBe(15);
      expect(summary.currentPhase).toBe('ovulation');
      expect(summary.ovulationDay).toBe(15);
      expect(summary.isFertile).toBe(true);
      expect(summary.isLate).toBe(false);
      expect(summary.daysLate).toBe(0);
      expect(summary.daysUntilNextPeriod).toBe(14);
    });
  });

  describe('2. Short Cycle (21 days, 4 days period)', () => {
    const lastStart = '2026-04-01';
    const cycleLength = 21;
    const periodLength = 4;

    it('calculates short cycle next period and ovulation', () => {
      // 2026-04-01 + 21 days = 2026-04-22
      const next = calculateNextPeriod(lastStart, cycleLength);
      expect(next).toBe('2026-04-22');

      // 2026-04-22 - 14 days = 2026-04-08 (cycle day 8)
      const ovulation = calculateOvulationDate(next);
      expect(ovulation).toBe('2026-04-08');

      const window = calculateFertileWindow(ovulation);
      expect(window.startDate).toBe('2026-04-03');
      expect(window.endDate).toBe('2026-04-09');
    });

    it('identifies phases in a short cycle', () => {
      // Menstrual: Days 1 to 4
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-01')).toBe('menstrual');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-04')).toBe('menstrual');

      // Follicular: Days 5 to 6
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-05')).toBe('follicular');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-06')).toBe('follicular');

      // Ovulation: Days 7 to 9
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-07')).toBe('ovulation');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-08')).toBe('ovulation');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-09')).toBe('ovulation');

      // Luteal: Days 10 to 21
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-10')).toBe('luteal');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-04-21')).toBe('luteal');
    });
  });

  describe('3. Long Cycle (35 days, 6 days period)', () => {
    const lastStart = '2026-05-01';
    const cycleLength = 35;
    const periodLength = 6;

    it('calculates long cycle next period across month boundary', () => {
      // May has 31 days. 2026-05-01 + 35 days = 2026-06-05
      const next = calculateNextPeriod(lastStart, cycleLength);
      expect(next).toBe('2026-06-05');

      // 2026-06-05 - 14 days = 2026-05-22
      const ovulation = calculateOvulationDate(next);
      expect(ovulation).toBe('2026-05-22');

      // Fertile window: 2026-05-17 to 2026-05-23
      const window = calculateFertileWindow(ovulation);
      expect(window.startDate).toBe('2026-05-17');
      expect(window.endDate).toBe('2026-05-23');
    });

    it('identifies phases in a long cycle', () => {
      // Menstrual: Days 1 to 6
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-01')).toBe('menstrual');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-06')).toBe('menstrual');

      // Follicular: Days 7 to 20
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-07')).toBe('follicular');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-20')).toBe('follicular');

      // Ovulation: Days 21 to 23
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-21')).toBe('ovulation');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-22')).toBe('ovulation');
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-23')).toBe('ovulation');

      // Luteal: Day 24 onwards
      expect(getCurrentPhase(lastStart, cycleLength, periodLength, '2026-05-24')).toBe('luteal');
    });
  });

  describe('4. Late Period (cycleDay > cycleLength)', () => {
    const lastStart = '2026-05-01';
    const cycleLength = 28;
    const periodLength = 5;

    it('detects late period state correctly', () => {
      // Expected next period: 2026-05-29
      // Check on 2026-06-03 (5 days late)
      const summary = calculateCycleSummary(lastStart, cycleLength, periodLength, '2026-06-03');

      expect(summary.cycleDay).toBe(34);
      expect(summary.isLate).toBe(true);
      expect(summary.daysLate).toBe(5);
      expect(summary.daysUntilNextPeriod).toBe(-5);
      expect(summary.currentPhase).toBe('luteal');
    });

    it('handles exact next period day (day 29, 0 days until next period)', () => {
      const summary = calculateCycleSummary(lastStart, cycleLength, periodLength, '2026-05-29');
      expect(summary.cycleDay).toBe(29);
      expect(summary.daysUntilNextPeriod).toBe(0);
      expect(summary.isLate).toBe(false);
      expect(summary.daysLate).toBe(0);
    });
  });

  describe('5. Month & Year Boundaries', () => {
    it('handles month boundary with varying days (January 31 days to February)', () => {
      const lastStart = '2026-01-20';
      const next = calculateNextPeriod(lastStart, 28);
      // Jan 20 + 28 days = Feb 17
      expect(next).toBe('2026-02-17');
    });

    it('handles year boundary crossing (December into January)', () => {
      const lastStart = '2026-12-15';
      const next = calculateNextPeriod(lastStart, 28);
      // Dec 15, 2026 + 28 days = Jan 12, 2027
      expect(next).toBe('2027-01-12');

      const ovulation = calculateOvulationDate(next);
      // Jan 12, 2027 - 14 days = Dec 29, 2026
      expect(ovulation).toBe('2026-12-29');

      const window = calculateFertileWindow(ovulation);
      expect(window.startDate).toBe('2026-12-24');
      expect(window.endDate).toBe('2026-12-30');
    });
  });

  describe('6. Leap Year Handling', () => {
    it('accurately accounts for February 29 in a leap year (2024)', () => {
      // 2024 was a leap year (Feb 29 exists)
      const leapStart = '2024-02-10';
      const nextLeap = calculateNextPeriod(leapStart, 28);
      // In 2024 (29 days in Feb): 19 days in Feb + 9 days in March = 28 days -> 2024-03-09
      expect(nextLeap).toBe('2024-03-09');

      // Contrast with non-leap year (2025): 18 days in Feb + 10 days in March = 28 days -> 2025-03-10
      const nonLeapStart = '2025-02-10';
      const nextNonLeap = calculateNextPeriod(nonLeapStart, 28);
      expect(nextNonLeap).toBe('2025-03-10');
    });

    it('correctly calculates cycle day and phase on February 29, 2024', () => {
      const leapStart = '2024-02-10';
      const cycleDay = getCycleDay(leapStart, '2024-02-29');
      // Feb 10 (day 1) to Feb 29 = 20th day of cycle
      expect(cycleDay).toBe(20);

      const phase = getCurrentPhase(leapStart, 28, 5, '2024-02-29');
      expect(phase).toBe('luteal');
    });
  });

  describe('7. Phase Details Helper', () => {
    it('returns color and icons from Design.md', () => {
      expect(getPhaseDetails('menstrual').color).toBe('#E85D75');
      expect(getPhaseDetails('follicular').color).toBe('#6CC299');
      expect(getPhaseDetails('ovulation').color).toBe('#F7C948');
      expect(getPhaseDetails('luteal').color).toBe('#9B8AE0');
    });
  });

  describe('8. Date Helpers', () => {
    it('parses YYYY-MM-DD correctly without timezone shifts', () => {
      const d = parseLocalDate('2026-07-15');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(6); // 0-indexed July
      expect(d.getDate()).toBe(15);
      expect(formatLocalDate(d)).toBe('2026-07-15');
    });

    it('calculates calendar day differences accurately across months', () => {
      expect(getDaysDifference('2026-03-05', '2026-03-01')).toBe(4);
      expect(getDaysDifference('2026-03-01', '2026-02-28')).toBe(1);
    });
  });

  describe('9. Irregular Cycle Detection (Task 2.5)', () => {
    it('detects cycles shorter than 21 days as irregular', () => {
      const result = detectIrregularCycle(19);
      expect(result.isIrregular).toBe(true);
      expect(result.reason).toBe('too_short');
      expect(result.message).toContain('shorter than 21 days');
    });

    it('detects cycles longer than 38 days as irregular', () => {
      const result = detectIrregularCycle(42);
      expect(result.isIrregular).toBe(true);
      expect(result.reason).toBe('too_long');
      expect(result.message).toContain('longer than 38 days');
    });

    it('considers normal 28 day cycle regular', () => {
      const result = detectIrregularCycle(28);
      expect(result.isIrregular).toBe(false);
      expect(result.reason).toBe(null);
    });

    it('detects cycle length variation greater than 7 days', () => {
      // Cycles: 25, 34, 28 -> max 34, min 25 -> variation 9 days (> 7)
      const result = detectIrregularCycle([25, 34, 28]);
      expect(result.isIrregular).toBe(true);
      expect(result.reason).toBe('high_variation');
      expect(result.variation).toBe(9);
    });

    it('considers variation of 7 days or less regular', () => {
      // Cycles: 26, 31, 28 -> max 31, min 26 -> variation 5 days (<= 7)
      const result = detectIrregularCycle([26, 31, 28]);
      expect(result.isIrregular).toBe(false);
      expect(result.variation).toBe(0);
    });
  });

  describe('10. Average of Last 3 Cycles (Task 2.5)', () => {
    it('extracts cycle lengths from consecutive periods', () => {
      const periods = [
        { startDate: '2026-01-01' },
        { startDate: '2026-01-29' }, // 28 days
        { startDate: '2026-02-27' }, // 29 days (2026 Feb has 28 days: Jan 29 to Feb 27 = 29 days)
        { startDate: '2026-03-27' }, // 28 days
      ];
      const lengths = getCycleLengthsFromPeriods(periods);
      expect(lengths).toEqual([28, 29, 28]);
    });

    it('uses fallback when fewer than 3 recorded cycles', () => {
      const result = getEffectiveCycleLength([28], 30);
      expect(result.isAveraged).toBe(false);
      expect(result.effectiveCycleLength).toBe(28);

      const emptyResult = getEffectiveCycleLength([], 30);
      expect(emptyResult.isAveraged).toBe(false);
      expect(emptyResult.effectiveCycleLength).toBe(30);
    });

    it('uses average of last 3 cycles when 3 or more exist', () => {
      // 27 + 29 + 31 = 87 / 3 = 29
      const result = getEffectiveCycleLength([27, 29, 31], 28);
      expect(result.isAveraged).toBe(true);
      expect(result.effectiveCycleLength).toBe(29);
      expect(result.cyclesCount).toBe(3);
    });

    it('uses only the latest 3 cycles when more than 3 exist', () => {
      // [40, 26, 28, 30] -> uses last 3: 26, 28, 30 -> avg = 28
      const result = getEffectiveCycleLength([40, 26, 28, 30], 28);
      expect(result.isAveraged).toBe(true);
      expect(result.effectiveCycleLength).toBe(28);
      expect(result.cyclesCount).toBe(3);
    });

    it('integrates effective cycle and irregular detection into calculateCycleSummary', () => {
      const summary = calculateCycleSummary('2026-03-01', [26, 36, 28], 5, '2026-03-15');
      // [26, 36, 28]: variation 36 - 26 = 10 (> 7) -> isIrregular: true
      // average: (26 + 36 + 28) / 3 = 90 / 3 = 30 days
      expect(summary.isAveraged).toBe(true);
      expect(summary.effectiveCycleLength).toBe(30);
      expect(summary.isIrregular).toBe(true);
      expect(summary.irregularReason).toBe('high_variation');
      expect(summary.nextPeriodDate).toBe('2026-03-31'); // March 1 + 30 days
    });
  });
});

