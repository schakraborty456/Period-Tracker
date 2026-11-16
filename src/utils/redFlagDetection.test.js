import { describe, it, expect } from 'vitest';
import {
  detectRedFlagEscalation,
  checkDailyLogEscalation,
  RED_FLAG_NO_PERIOD_DAYS,
  RED_FLAG_LONG_BLEEDING_DAYS,
  RED_FLAG_SEVERE_PAIN_SCORE,
} from './redFlagDetection.js';

describe('Red-Flag Escalation Prompt Engine (Task 6.2f)', () => {
  it('returns hasRedFlag: false when cycles and bleeding duration are normal', () => {
    const periods = [
      { id: 'p1', startDate: '2026-04-01', endDate: '2026-04-05', cycleLength: 28 },
    ];
    const dailyLogs = [
      { date: '2026-04-01', flow: 'medium', painScore: 3 },
      { date: '2026-04-02', flow: 'light', painScore: 2 },
    ];

    const result = detectRedFlagEscalation({
      periods,
      dailyLogs,
      today: '2026-04-15', // 14 days after last period
    });

    expect(result.hasRedFlag).toBe(false);
    expect(result.primaryEscalation).toBeNull();
    expect(result.redFlags).toHaveLength(0);
    expect(result.mandatoryDisclaimer).toContain('Possible signs are showing in your pattern');
  });

  describe('Condition 1: No period for 90 or more days (3+ months)', () => {
    it('triggers no_period_3_months when days since last period >= 90', () => {
      const periods = [{ id: 'p1', startDate: '2026-01-01', cycleLength: 28 }];
      const result = detectRedFlagEscalation({
        periods,
        dailyLogs: [],
        today: '2026-04-02', // 91 days later
      });

      expect(result.hasRedFlag).toBe(true);
      expect(result.primaryEscalation.id).toBe('no_period_3_months');
      expect(result.primaryEscalation.daysCount).toBe(91);
      expect(result.primaryEscalation.title).toContain('3+ Months');
      expect(result.primaryEscalation.clinicalAdvice).toContain('secondary amenorrhea');
    });

    it('triggers exactly on day 90 boundary', () => {
      const periods = [{ id: 'p1', startDate: '2026-01-01', cycleLength: 28 }];
      const result = detectRedFlagEscalation({
        periods,
        dailyLogs: [],
        today: '2026-04-01', // exactly 90 days later in non-leap year (31+28+31)
      });

      expect(result.hasRedFlag).toBe(true);
      expect(result.redFlags.some((f) => f.id === 'no_period_3_months')).toBe(true);
    });

    it('does NOT trigger when days since last period < 90', () => {
      const periods = [{ id: 'p1', startDate: '2026-01-10', cycleLength: 28 }];
      const result = detectRedFlagEscalation({
        periods,
        dailyLogs: [],
        today: '2026-04-01', // 81 days later
      });

      expect(result.hasRedFlag).toBe(false);
      expect(result.redFlags.some((f) => f.id === 'no_period_3_months')).toBe(false);
    });
  });

  describe('Condition 2: Bleeding lasting more than 7 consecutive days', () => {
    it('triggers bleeding_over_7_days when consecutive bleeding streak > 7 days', () => {
      const periods = [{ id: 'p1', startDate: '2026-04-01', cycleLength: 28 }];
      // 8 consecutive days of bleeding
      const dailyLogs = [
        { date: '2026-04-01', flow: 'heavy' },
        { date: '2026-04-02', flow: 'heavy' },
        { date: '2026-04-03', flow: 'medium' },
        { date: '2026-04-04', flow: 'medium' },
        { date: '2026-04-05', flow: 'light' },
        { date: '2026-04-06', flow: 'light' },
        { date: '2026-04-07', flow: 'light' },
        { date: '2026-04-08', flow: 'light' }, // 8th consecutive day
      ];

      const result = detectRedFlagEscalation({
        periods,
        dailyLogs,
        today: '2026-04-10',
      });

      expect(result.hasRedFlag).toBe(true);
      const flag = result.redFlags.find((f) => f.id === 'bleeding_over_7_days');
      expect(flag).toBeDefined();
      expect(flag.daysCount).toBe(8);
      expect(flag.title).toContain('More Than 7 Consecutive Days');
      expect(flag.clinicalAdvice).toContain('gynecologist');
    });

    it('does NOT trigger when bleeding streak is exactly 7 days', () => {
      const periods = [{ id: 'p1', startDate: '2026-04-01', cycleLength: 28 }];
      const dailyLogs = [
        { date: '2026-04-01', flow: 'medium' },
        { date: '2026-04-02', flow: 'medium' },
        { date: '2026-04-03', flow: 'medium' },
        { date: '2026-04-04', flow: 'medium' },
        { date: '2026-04-05', flow: 'light' },
        { date: '2026-04-06', flow: 'light' },
        { date: '2026-04-07', flow: 'spotting' }, // 7 days
      ];

      const result = detectRedFlagEscalation({
        periods,
        dailyLogs,
        today: '2026-04-10',
      });

      expect(result.redFlags.some((f) => f.id === 'bleeding_over_7_days')).toBe(false);
    });

    it('detects prolonged bleeding from period record endDate if provided', () => {
      const periods = [
        { id: 'p1', startDate: '2026-04-01', endDate: '2026-04-10', cycleLength: 28 }, // 10 days duration
      ];

      const result = detectRedFlagEscalation({
        periods,
        dailyLogs: [],
        today: '2026-04-15',
      });

      expect(result.hasRedFlag).toBe(true);
      expect(result.redFlags.some((f) => f.id === 'bleeding_over_7_days')).toBe(true);
    });
  });

  describe('Condition 3: Severe acute pain rating (9 or 10)', () => {
    it('triggers severe_pain_acute when painScore is 9 or 10', () => {
      const periods = [{ id: 'p1', startDate: '2026-04-01', cycleLength: 28 }];
      const dailyLogs = [{ date: '2026-04-01', flow: 'medium', painScore: 9 }];

      const result = detectRedFlagEscalation({
        periods,
        dailyLogs,
        today: '2026-04-05',
      });

      expect(result.hasRedFlag).toBe(true);
      const flag = result.redFlags.find((f) => f.id === 'severe_pain_acute');
      expect(flag).toBeDefined();
      expect(flag.title).toContain('Severe / Unbearable Pain');
    });

    it('does NOT trigger acute escalation when painScore is 8 or below', () => {
      const periods = [{ id: 'p1', startDate: '2026-04-01', cycleLength: 28 }];
      const dailyLogs = [{ date: '2026-04-01', flow: 'medium', painScore: 8 }];

      const result = detectRedFlagEscalation({
        periods,
        dailyLogs,
        today: '2026-04-05',
      });

      expect(result.redFlags.some((f) => f.id === 'severe_pain_acute')).toBe(false);
    });
  });

  it('aggregates multiple concurrent red flags correctly', () => {
    // Both 90 days no period AND severe pain logged
    const periods = [{ id: 'p1', startDate: '2026-01-01', cycleLength: 28 }];
    const dailyLogs = [{ date: '2026-04-01', painScore: 10 }];

    const result = detectRedFlagEscalation({
      periods,
      dailyLogs,
      today: '2026-04-05',
    });

    expect(result.hasRedFlag).toBe(true);
    expect(result.redFlags).toHaveLength(2);
    expect(result.redFlags.map((f) => f.id)).toContain('no_period_3_months');
    expect(result.redFlags.map((f) => f.id)).toContain('severe_pain_acute');
  });

  describe('checkDailyLogEscalation', () => {
    it('escalates immediately when painScore >= 9 is logged', () => {
      const res = checkDailyLogEscalation({ painScore: 9 }, 3);
      expect(res.isEscalation).toBe(true);
      expect(res.reason).toContain('severe pain score of 9/10');
    });

    it('escalates when consecutive bleeding days exceed 7', () => {
      const res = checkDailyLogEscalation({ flow: 'light', painScore: 3 }, 8);
      expect(res.isEscalation).toBe(true);
      expect(res.reason).toContain('8 consecutive days');
    });

    it('does not escalate for normal log values', () => {
      const res = checkDailyLogEscalation({ flow: 'medium', painScore: 4 }, 3);
      expect(res.isEscalation).toBe(false);
      expect(res.reason).toBeNull();
    });
  });
});
