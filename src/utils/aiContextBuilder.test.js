import { describe, it, expect, vi } from 'vitest';
import {
  hasAiConsent,
  getRecentSymptomsFromLogs,
  getRecentPainScoreAvg,
  buildAiCycleContext,
} from './aiContextBuilder';
import { RISK_FLAGS } from '../data/riskFlags';

// Mock firebase to prevent real App Check initialization during unit tests
vi.mock('../firebase', () => ({
  ai: { __mockAiInstance: true },
}));

describe('aiContextBuilder.js - Zero-PII Context Builder (Task 6.4b)', () => {
  describe('hasAiConsent()', () => {
    it('returns true when profile.aiConsent is strictly true', () => {
      expect(hasAiConsent({ aiConsent: true })).toBe(true);
    });

    it('returns false for false, null, undefined, non-boolean, or missing aiConsent', () => {
      expect(hasAiConsent(null)).toBe(false);
      expect(hasAiConsent(undefined)).toBe(false);
      expect(hasAiConsent({})).toBe(false);
      expect(hasAiConsent({ aiConsent: false })).toBe(false);
      expect(hasAiConsent({ aiConsent: 'true' })).toBe(false);
      expect(hasAiConsent({ aiConsent: 1 })).toBe(false);
    });
  });

  describe('getRecentSymptomsFromLogs()', () => {
    const referenceDate = '2026-11-20'; // Reference date: 2026-11-20

    it('extracts and deduplicates symptoms from the last 7 days', () => {
      const dailyLogs = [
        { date: '2026-11-20', symptoms: ['cramps', 'bloating'] },
        { date: '2026-11-19', symptoms: ['headache', 'fatigue'] },
        { date: '2026-11-15', symptoms: ['cramps', 'acne'] }, // 5 days ago (in range)
        { date: '2026-11-14', symptoms: ['fatigue', 'backache'] }, // 6 days ago (in range: 7th day)
        { date: '2026-11-13', symptoms: ['ignored_symptom'] }, // 7 days ago (outside 7-day range [14-20])
        { date: '2026-11-10', symptoms: ['old_symptom'] }, // 10 days ago (outside range)
        { date: '2026-11-22', symptoms: ['future_symptom'] }, // Future date (outside range)
      ];

      const symptoms = getRecentSymptomsFromLogs(dailyLogs, referenceDate, 7);

      expect(symptoms).toContain('cramps');
      expect(symptoms).toContain('bloating');
      expect(symptoms).toContain('headache');
      expect(symptoms).toContain('fatigue');
      expect(symptoms).toContain('acne');
      expect(symptoms).toContain('backache');

      // Older or future symptoms excluded
      expect(symptoms).not.toContain('ignored_symptom');
      expect(symptoms).not.toContain('old_symptom');
      expect(symptoms).not.toContain('future_symptom');

      // Deduplicated (e.g. cramps appears once)
      expect(symptoms.filter((s) => s === 'cramps').length).toBe(1);
    });

    it('returns empty array when dailyLogs is empty, missing, or malformed', () => {
      expect(getRecentSymptomsFromLogs([], referenceDate)).toEqual([]);
      expect(getRecentSymptomsFromLogs(null, referenceDate)).toEqual([]);
      expect(getRecentSymptomsFromLogs(undefined, referenceDate)).toEqual([]);
      expect(getRecentSymptomsFromLogs([{}], referenceDate)).toEqual([]);
      expect(getRecentSymptomsFromLogs([{ date: '2026-11-20' }], referenceDate)).toEqual([]);
    });
  });

  describe('getRecentPainScoreAvg()', () => {
    const referenceDate = '2026-11-20';

    it('calculates average pain score for logs within the 7-day window', () => {
      const dailyLogs = [
        { date: '2026-11-20', painScore: 6 },
        { date: '2026-11-18', painScore: 4 },
        { date: '2026-11-14', painScore: 8 }, // 6 days ago (in range)
        { date: '2026-11-12', painScore: 10 }, // 8 days ago (outside range)
      ];

      // Average of [6, 4, 8] = 18 / 3 = 6.0
      const avg = getRecentPainScoreAvg(dailyLogs, referenceDate, 7);
      expect(avg).toBe(6);
    });

    it('handles painScore of 0 correctly (not treating 0 as falsy missing)', () => {
      const dailyLogs = [
        { date: '2026-11-20', painScore: 0 },
        { date: '2026-11-19', painScore: 2 },
      ];
      // Average of [0, 2] = 1.0
      const avg = getRecentPainScoreAvg(dailyLogs, referenceDate, 7);
      expect(avg).toBe(1);
    });

    it('returns null when no logs have valid pain scores in range', () => {
      expect(getRecentPainScoreAvg([], referenceDate)).toBeNull();
      expect(
        getRecentPainScoreAvg(
          [{ date: '2026-11-20', painScore: null }, { date: '2026-11-19' }],
          referenceDate
        )
      ).toBeNull();
      expect(
        getRecentPainScoreAvg([{ date: '2026-11-10', painScore: 8 }], referenceDate)
      ).toBeNull();
    });

    it('rounds to 1 decimal place', () => {
      const dailyLogs = [
        { date: '2026-11-20', painScore: 5 },
        { date: '2026-11-19', painScore: 4 },
        { date: '2026-11-18', painScore: 4 },
      ];
      // Average of 13 / 3 = 4.3333... -> 4.3
      const avg = getRecentPainScoreAvg(dailyLogs, referenceDate, 7);
      expect(avg).toBe(4.3);
    });
  });

  describe('buildAiCycleContext() - Zero-PII Context Payload', () => {
    const referenceDate = '2026-11-20';

    it('builds sanitized context payload with allowed cycle data', () => {
      const profile = {
        name: 'Jane Doe', // PII
        email: 'jane@example.com', // PII
        uid: 'user_12345', // PII
        userId: 'user_12345', // PII
        displayName: 'Jane D', // PII
        dietPreference: 'veg',
        currentPhase: 'luteal',
        cycleDay: 21,
      };

      const cycleInfo = {
        currentPhase: 'luteal',
        cycleDay: 22, // cycleInfo takes precedence over profile
      };

      const dailyLogs = [
        { date: '2026-11-20', symptoms: ['cramps', 'bloating'], painScore: 4, notes: 'Secret log notes' },
        { date: '2026-11-18', symptoms: ['fatigue'], painScore: 6 },
      ];

      const activeRiskFlags = ['pcos_possible'];

      const context = buildAiCycleContext({
        profile,
        cycleInfo,
        dailyLogs,
        activeRiskFlags,
        referenceDate,
      });

      // Allowed fields are present and sanitized
      expect(context).toEqual({
        currentPhase: 'luteal',
        cycleDay: 22,
        dietPreference: 'veg',
        recentSymptoms: expect.arrayContaining(['cramps', 'bloating', 'fatigue']),
        painScoreAvg: 5,
        activeRiskFlags: ['pcos_possible'],
      });

      // ZERO PII: name, email, uid, userId, displayName, notes are never present
      expect(context.name).toBeUndefined();
      expect(context.email).toBeUndefined();
      expect(context.uid).toBeUndefined();
      expect(context.userId).toBeUndefined();
      expect(context.displayName).toBeUndefined();
      expect(context.notes).toBeUndefined();
    });

    it('supports activeRiskFlags as objects with an id property', () => {
      const activeRiskFlags = [
        { id: 'pcos_possible', title: 'PCOS Possible' },
        { id: 'anemia_possible', title: 'Anemia' },
      ];

      const context = buildAiCycleContext({
        profile: { dietPreference: 'non-veg' },
        activeRiskFlags,
      });

      expect(context.activeRiskFlags).toEqual(['pcos_possible', 'anemia_possible']);
    });

    it('filters out invalid or unknown risk flag IDs', () => {
      const activeRiskFlags = ['pcos_possible', 'invalid_flag_xyz', 'fake_flag_123'];

      const context = buildAiCycleContext({
        profile: { dietPreference: 'eggetarian' },
        activeRiskFlags,
      });

      expect(context.activeRiskFlags).toEqual(['pcos_possible']);
    });

    it('handles empty inputs gracefully', () => {
      const context = buildAiCycleContext({});
      expect(context).toEqual({});
    });
  });
});
