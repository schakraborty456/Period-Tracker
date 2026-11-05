import { describe, it, expect } from 'vitest';
import {
  NUTRITION_METADATA,
  NUTRITION_TIPS,
  getNutritionTips,
  getPhaseOverview,
} from './nutritionTips.js';

describe('nutritionTips - Phase x Diet Content Integrity', () => {
  it('has mandatory metadata marked as "needs expert review"', () => {
    expect(NUTRITION_METADATA.reviewStatus).toBe('needs expert review');
    expect(NUTRITION_METADATA.disclaimer).toBeTruthy();
    expect(typeof NUTRITION_METADATA.disclaimer).toBe('string');
  });

  const phases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
  const diets = ['non-veg', 'veg', 'eggetarian'];

  it.each(phases)('contains valid content for phase: %s', (phase) => {
    const phaseData = NUTRITION_TIPS[phase];
    expect(phaseData).toBeDefined();
    expect(phaseData.phaseName).toBeTruthy();
    expect(phaseData.theme).toBeTruthy();
    expect(phaseData.overview).toBeTruthy();

    diets.forEach((diet) => {
      const dietData = phaseData.diets[diet];
      expect(dietData).toBeDefined();
      expect(dietData.title).toBeTruthy();
      expect(dietData.focus).toBeTruthy();
      expect(Array.isArray(dietData.eat)).toBe(true);
      expect(dietData.eat.length).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(dietData.avoid)).toBe(true);
      expect(dietData.avoid.length).toBeGreaterThanOrEqual(2);
      expect(dietData.selfCare).toBeTruthy();

      // Check structure of eat items
      dietData.eat.forEach((item) => {
        expect(item.food).toBeTruthy();
        expect(item.reason).toBeTruthy();
        expect(item.icon).toBeTruthy();
      });

      // Check structure of avoid items
      dietData.avoid.forEach((item) => {
        expect(item.item).toBeTruthy();
        expect(item.reason).toBeTruthy();
      });
    });
  });

  describe('getNutritionTips helper', () => {
    it('returns exact tips for menstrual phase and non-veg diet', () => {
      const tips = getNutritionTips('menstrual', 'non-veg');
      expect(tips.phase).toBe('menstrual');
      expect(tips.dietPreference).toBe('non-veg');
      expect(tips.metadata.reviewStatus).toBe('needs expert review');
      expect(tips.eat.length).toBeGreaterThan(0);
      expect(tips.avoid.length).toBeGreaterThan(0);
      expect(tips.selfCare).toBeTruthy();
    });

    it('falls back gracefully on invalid phase or diet input', () => {
      const tips = getNutritionTips('invalid_phase', 'unknown_diet');
      expect(tips.phase).toBe('menstrual');
      expect(tips.dietPreference).toBe('non-veg');
    });
  });

  describe('getPhaseOverview helper', () => {
    it('returns all diets for a phase along with metadata', () => {
      const overview = getPhaseOverview('luteal');
      expect(overview.phaseName).toBe('Luteal Phase');
      expect(overview.diets.veg).toBeDefined();
      expect(overview.diets['non-veg']).toBeDefined();
      expect(overview.diets.eggetarian).toBeDefined();
      expect(overview.metadata.reviewStatus).toBe('needs expert review');
    });
  });
});
