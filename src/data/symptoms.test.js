import { describe, it, expect } from 'vitest';
import {
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  getDefaultDailyLog,
  getFlowDetails,
  getMoodDetails,
  getSymptomDetails,
} from './symptoms.js';

describe('Daily Symptoms & Options (Task 6.2a)', () => {
  it('contains all required symptoms including new V2 tags', () => {
    const symptomIds = SYMPTOM_OPTIONS.map((s) => s.id);

    // Core V1 symptoms
    expect(symptomIds).toContain('cramps');
    expect(symptomIds).toContain('headache');
    expect(symptomIds).toContain('bloating');
    expect(symptomIds).toContain('fatigue');

    // New V2 tags for risk screening / wellness (Task 6.2a)
    expect(symptomIds).toContain('acne');
    expect(symptomIds).toContain('excess_hair');
    expect(symptomIds).toContain('hair_loss');
    expect(symptomIds).toContain('weight_change');
    expect(symptomIds).toContain('dark_patches');
  });

  it('provides complete metadata for each symptom option', () => {
    SYMPTOM_OPTIONS.forEach((sym) => {
      expect(sym.id).toBeDefined();
      expect(typeof sym.id).toBe('string');
      expect(sym.label).toBeDefined();
      expect(typeof sym.label).toBe('string');
      expect(sym.category).toBeDefined();
      expect(sym.icon).toBeDefined();
    });
  });

  it('returns default daily log structure with null/empty for new fields', () => {
    const defaults = getDefaultDailyLog('2026-11-12');
    expect(defaults).toEqual({
      date: '2026-11-12',
      flow: 'none',
      mood: '',
      symptoms: [],
      painScore: null,
      sleepHours: null,
      weight: null,
      waterGlasses: 4,
      notes: '',
    });
  });

  it('retrieves correct details by id', () => {
    expect(getFlowDetails('medium').label).toBe('Medium Flow');
    expect(getMoodDetails('happy').emoji).toBe('😊');
    expect(getSymptomDetails('excess_hair').label).toContain('Excess Hair');
    expect(getSymptomDetails('nonexistent')).toBeNull();
  });
});

