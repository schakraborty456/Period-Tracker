import { describe, it, expect } from 'vitest';
import {
  getRelatedConditions,
  isValidConditionId,
  getConditionsForWorkout,
  getConditionsForRiskFlag,
  getConditionForEscalation,
} from './conditionHelpers';
import { RISK_FLAGS } from '../data/riskFlags';
import { WORKOUT_ROUTINES } from '../data/workouts';

describe('Condition Helpers (Tasks 6.2k, 6.2l)', () => {
  describe('getRelatedConditions', () => {
    it('returns empty array when condition ID is null, undefined, or empty', () => {
      expect(getRelatedConditions(null)).toEqual([]);
      expect(getRelatedConditions(undefined)).toEqual([]);
      expect(getRelatedConditions('')).toEqual([]);
      expect(getRelatedConditions('   ')).toEqual([]);
    });

    it('returns empty array for an unknown condition ID', () => {
      expect(getRelatedConditions('non-existent-id')).toEqual([]);
    });

    it('picks related conditions from the same category first', () => {
      // dysmenorrhea is in 'pain-discomfort', which also contains 'pms' and 'endometriosis'
      const related = getRelatedConditions('dysmenorrhea', 2);
      expect(related.length).toBe(2);
      expect(related.map((c) => c.id)).not.toContain('dysmenorrhea');
      expect(related.every((c) => c.category === 'pain-discomfort')).toBe(true);
      expect(related.map((c) => c.id).sort()).toEqual(['endometriosis', 'pms'].sort());
    });

    it('supplements with other conditions when category has fewer than limit', () => {
      // irregular-periods is the only condition in 'cycle-irregularity'
      const related = getRelatedConditions('irregular-periods', 2);
      expect(related.length).toBe(2);
      expect(related.map((c) => c.id)).not.toContain('irregular-periods');
    });

    it('respects the limit argument', () => {
      const one = getRelatedConditions('anemia', 1);
      expect(one.length).toBe(1);
      expect(one[0].id).toBe('heavy-periods'); // Both in 'flow-blood'

      const two = getRelatedConditions('pcos', 2);
      expect(two.length).toBe(2);
      expect(two[0].id).toBe('thyroid'); // Both in 'hormonal-systemic'
    });
  });

  describe('isValidConditionId', () => {
    it('returns true for all 11 real condition IDs', () => {
      const validIds = [
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
      validIds.forEach((id) => {
        expect(isValidConditionId(id)).toBe(true);
      });
    });

    it('handles case-insensitivity', () => {
      expect(isValidConditionId('PCOS')).toBe(true);
      expect(isValidConditionId('AnEmIa')).toBe(true);
    });

    it('returns false for invalid or empty inputs', () => {
      expect(isValidConditionId('')).toBe(false);
      expect(isValidConditionId(null)).toBe(false);
      expect(isValidConditionId(undefined)).toBe(false);
      expect(isValidConditionId('unknown-condition')).toBe(false);
    });
  });

  describe('getConditionsForWorkout (reverse workout lookup - Task 6.2l)', () => {
    it('returns empty array when workout ID is null, undefined, empty, or whitespace', () => {
      expect(getConditionsForWorkout(null)).toEqual([]);
      expect(getConditionsForWorkout(undefined)).toEqual([]);
      expect(getConditionsForWorkout('')).toEqual([]);
      expect(getConditionsForWorkout('   ')).toEqual([]);
    });

    it('returns empty array for an unknown workout ID', () => {
      expect(getConditionsForWorkout('non-existent-workout')).toEqual([]);
    });

    it('finds all conditions that link to cramps-relief', () => {
      const conditions = getConditionsForWorkout('cramps-relief');
      const ids = conditions.map((c) => c.id);
      expect(ids).toContain('dysmenorrhea');
      expect(ids).toContain('heavy-periods');
      expect(ids).toContain('endometriosis');
    });

    it('finds all conditions that link to pcos-rhythm', () => {
      const conditions = getConditionsForWorkout('pcos-rhythm');
      const ids = conditions.map((c) => c.id);
      expect(ids).toContain('pcos');
      expect(ids).toContain('thyroid');
      expect(ids).toContain('irregular-periods');
    });

    it('finds all conditions that link to bloat-relief', () => {
      const conditions = getConditionsForWorkout('bloat-relief');
      const ids = conditions.map((c) => c.id);
      expect(ids).toContain('pms');
    });

    it('verifies reverse integrity for all workouts in WORKOUT_ROUTINES', () => {
      WORKOUT_ROUTINES.forEach((workout) => {
        const conditions = getConditionsForWorkout(workout.id);
        conditions.forEach((condition) => {
          expect(condition.relatedWorkoutIds).toContain(workout.id);
        });
      });
    });
  });

  describe('getConditionsForRiskFlag (flag-to-conditions mapping - Task 6.2l)', () => {
    it('returns empty array for null, undefined, or non-existent risk flag ID', () => {
      expect(getConditionsForRiskFlag(null)).toEqual([]);
      expect(getConditionsForRiskFlag(undefined)).toEqual([]);
      expect(getConditionsForRiskFlag('')).toEqual([]);
      expect(getConditionsForRiskFlag('unknown_flag')).toEqual([]);
    });

    it('maps every real risk flag ID to at least one condition in the library', () => {
      const flagIds = Object.keys(RISK_FLAGS);
      expect(flagIds.length).toBeGreaterThanOrEqual(5);

      flagIds.forEach((flagId) => {
        const matched = getConditionsForRiskFlag(flagId);
        expect(matched.length).toBeGreaterThan(0);
        matched.forEach((c) => {
          expect(c.relatedRiskFlagId).toBe(flagId);
        });
      });
    });

    it('maps anemia_possible to multiple conditions (heavy-periods, anemia, and fibroids)', () => {
      const conditions = getConditionsForRiskFlag('anemia_possible');
      const ids = conditions.map((c) => c.id);
      expect(ids.length).toBe(3);
      expect(ids).toContain('heavy-periods');
      expect(ids).toContain('anemia');
      expect(ids).toContain('fibroids');
    });

    it('maps severe_pain_possible to multiple conditions (dysmenorrhea, endometriosis, and adenomyosis)', () => {
      const conditions = getConditionsForRiskFlag('severe_pain_possible');
      const ids = conditions.map((c) => c.id);
      expect(ids.length).toBe(3);
      expect(ids).toContain('dysmenorrhea');
      expect(ids).toContain('endometriosis');
      expect(ids).toContain('adenomyosis');
    });

    it('maps pcos_possible to pcos condition', () => {
      const conditions = getConditionsForRiskFlag('pcos_possible');
      expect(conditions.map((c) => c.id)).toEqual(['pcos']);
    });

    it('maps thyroid_possible to thyroid condition', () => {
      const conditions = getConditionsForRiskFlag('thyroid_possible');
      expect(conditions.map((c) => c.id)).toEqual(['thyroid']);
    });

    it('maps see_doctor_soon to irregular-periods condition', () => {
      const conditions = getConditionsForRiskFlag('see_doctor_soon');
      expect(conditions.map((c) => c.id)).toEqual(['irregular-periods']);
    });
  });

  describe('getConditionForEscalation (Task 6.2l)', () => {
    it('returns null for null, undefined, empty, or unmapped values', () => {
      expect(getConditionForEscalation(null)).toBeNull();
      expect(getConditionForEscalation(undefined)).toBeNull();
      expect(getConditionForEscalation('')).toBeNull();
      expect(getConditionForEscalation('unrelated_alert')).toBeNull();
      expect(getConditionForEscalation({ id: 'random' })).toBeNull();
    });

    it('maps amenorrhea / 90-day missed period escalation to irregular-periods', () => {
      const byString = getConditionForEscalation('no_period_3_months');
      expect(byString).not.toBeNull();
      expect(byString.id).toBe('irregular-periods');

      const byObject = getConditionForEscalation({
        id: 'no_period_3_months',
        type: 'amenorrhea',
      });
      expect(byObject).not.toBeNull();
      expect(byObject.id).toBe('irregular-periods');
    });

    it('maps bleeding > 7 days escalation to heavy-periods', () => {
      const byString = getConditionForEscalation('bleeding_over_7_days');
      expect(byString).not.toBeNull();
      expect(byString.id).toBe('heavy-periods');

      const byObject = getConditionForEscalation({
        id: 'bleeding_over_7_days',
        type: 'prolonged_bleeding',
      });
      expect(byObject).not.toBeNull();
      expect(byObject.id).toBe('heavy-periods');
    });

    it('maps severe acute pain escalation to dysmenorrhea', () => {
      const byString = getConditionForEscalation('severe_pain_acute');
      expect(byString).not.toBeNull();
      expect(byString.id).toBe('dysmenorrhea');

      const byObject = getConditionForEscalation({
        id: 'severe_pain_acute',
        type: 'acute_pain',
      });
      expect(byObject).not.toBeNull();
      expect(byObject.id).toBe('dysmenorrhea');
    });
  });
});
