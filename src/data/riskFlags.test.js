import { describe, it, expect } from 'vitest';
import {
  RISK_FLAGS,
  MANDATORY_RISK_DISCLAIMER,
  REVIEW_STATUS_LABEL,
  getRiskFlagDetails,
  getAllRiskFlags,
} from './riskFlags.js';

describe('Risk Flags Data & Lifestyle Guidance (Task 6.2c)', () => {
  const expectedFlagIds = [
    'see_doctor_soon',
    'pcos_possible',
    'anemia_possible',
    'severe_pain_possible',
    'thyroid_possible',
  ];

  it('defines all 5 required risk screening flags', () => {
    expectedFlagIds.forEach((id) => {
      expect(RISK_FLAGS[id]).toBeDefined();
      expect(RISK_FLAGS[id].id).toBe(id);
      expect(RISK_FLAGS[id].title).toBeTruthy();
      expect(RISK_FLAGS[id].summary).toBeTruthy();
    });
  });

  it('enforces the mandatory non-diagnostic disclaimer for every flag', () => {
    expectedFlagIds.forEach((id) => {
      const flag = RISK_FLAGS[id];
      expect(flag.mandatoryDisclaimer).toBe(
        'Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist).'
      );
      expect(flag.mandatoryDisclaimer).toBe(MANDATORY_RISK_DISCLAIMER);
    });
  });

  it('marks every flag with the "needs expert review" status label', () => {
    expect(REVIEW_STATUS_LABEL).toBe('Needs expert review');
    expectedFlagIds.forEach((id) => {
      expect(RISK_FLAGS[id].reviewStatus).toBe('Needs expert review');
    });
  });

  it('contains lifestyle-only recommendations (no medicines, no supplement dosages, no cure claims)', () => {
    const prohibitedKeywords = [
      'prescription',
      'medication',
      'medicine',
      'cure',
      '500mg',
      'mg/day',
      'dose',
      'antibiotic',
      'birth control',
      'contraceptive pill',
    ];

    expectedFlagIds.forEach((id) => {
      const flag = RISK_FLAGS[id];
      expect(Array.isArray(flag.lifestyleRecommendations)).toBe(true);
      expect(flag.lifestyleRecommendations.length).toBeGreaterThanOrEqual(3);

      flag.lifestyleRecommendations.forEach((rec) => {
        expect(rec.category).toBeTruthy();
        expect(rec.title).toBeTruthy();
        expect(rec.text).toBeTruthy();
        expect(rec.icon).toBeTruthy();

        // Check against prohibited medical/curative claims
        const lowerText = rec.text.toLowerCase();
        prohibitedKeywords.forEach((forbidden) => {
          expect(lowerText).not.toContain(forbidden);
        });
      });
    });
  });

  it('includes practical doctor discussion points for each flag', () => {
    expectedFlagIds.forEach((id) => {
      const flag = RISK_FLAGS[id];
      expect(Array.isArray(flag.doctorDiscussionPoints)).toBe(true);
      expect(flag.doctorDiscussionPoints.length).toBeGreaterThanOrEqual(2);
      flag.doctorDiscussionPoints.forEach((point) => {
        expect(typeof point).toBe('string');
        expect(point.length).toBeGreaterThan(15);
      });
    });
  });

  it('retrieves flag details via getRiskFlagDetails', () => {
    const pcos = getRiskFlagDetails('pcos_possible');
    expect(pcos).toBeDefined();
    expect(pcos.id).toBe('pcos_possible');

    const unknown = getRiskFlagDetails('unknown_flag');
    expect(unknown).toBeNull();

    const empty = getRiskFlagDetails(null);
    expect(empty).toBeNull();
  });

  it('returns all flags via getAllRiskFlags', () => {
    const all = getAllRiskFlags();
    expect(all).toHaveLength(5);
    expect(all.map((f) => f.id)).toEqual(expectedFlagIds);
  });
});

