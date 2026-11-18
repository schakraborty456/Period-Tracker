import { describe, it, expect } from 'vitest';
import { getRelatedConditions, isValidConditionId } from './conditionHelpers';

describe('Condition Helpers (Task 6.2k)', () => {
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
    it('returns true for all 8 real condition IDs', () => {
      const validIds = [
        'pcos',
        'pms',
        'dysmenorrhea',
        'heavy-periods',
        'anemia',
        'endometriosis',
        'thyroid',
        'irregular-periods',
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
});
