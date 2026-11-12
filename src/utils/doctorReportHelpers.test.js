import { describe, it, expect } from 'vitest';
import {
  generateDoctorReportData,
  getSymptomMeta,
} from './doctorReportHelpers.js';

describe('Doctor Report Helper Functions (Task 6.2e)', () => {
  it('maps known and unknown symptoms to icons and labels', () => {
    const cramps = getSymptomMeta('cramps');
    expect(cramps.label).toBe('Abdominal Cramps');
    expect(cramps.icon).toBe('⚡');

    const acne = getSymptomMeta('acne');
    expect(acne.label).toBe('Acne / Breakouts');

    const custom = getSymptomMeta('mild_pelvic_pressure');
    expect(custom.label).toBe('Mild Pelvic Pressure');
    expect(custom.icon).toBe('•');
  });

  it('handles empty or sparse data safely without crashing', () => {
    const report = generateDoctorReportData({
      profile: {},
      periods: [],
      dailyLogs: [],
      today: '2026-11-12',
    });

    expect(report.patientInfo.name).toBe('Anonymous Patient');
    expect(report.cycleMetrics.totalCompletedCycles).toBe(0);
    expect(report.flowMetrics.totalBleedingDaysLogged).toBe(0);
    expect(report.painMetrics.maxPainScore).toBeNull();
    expect(report.painMetrics.avgPainScore).toBeNull();
    expect(report.symptomMetrics.symptoms).toEqual([]);
    expect(report.screeningMetrics.hasEnoughData).toBe(false);
    expect(report.discussionPoints.length).toBeGreaterThan(0);
  });

  it('aggregates cycle metrics, pain scores, flow counts, and symptoms accurately', () => {
    const profile = {
      name: 'Aditi Roy',
      age: 26,
      avgCycleLength: 29,
      avgPeriodLength: 5,
      dietPreference: 'veg',
    };

    const periods = [
      { id: 'p3', startDate: '2026-04-01', endDate: '2026-04-05', cycleLength: 30 },
      { id: 'p2', startDate: '2026-03-02', endDate: '2026-03-07', cycleLength: 28 },
      { id: 'p1', startDate: '2026-02-02', endDate: '2026-02-06', cycleLength: 31 },
      { id: 'p0', startDate: '2026-01-02', endDate: '2026-01-07', cycleLength: 30 },
    ];

    const dailyLogs = [
      {
        date: '2026-04-01',
        flow: 'heavy',
        painScore: 8,
        symptoms: ['cramps', 'fatigue', 'headache'],
      },
      {
        date: '2026-04-02',
        flow: 'heavy',
        painScore: 7,
        symptoms: ['cramps', 'fatigue'],
      },
      {
        date: '2026-04-03',
        flow: 'medium',
        painScore: 4,
        symptoms: ['cramps', 'bloating'],
      },
      {
        date: '2026-04-04',
        flow: 'light',
        painScore: 2,
        symptoms: ['bloating'],
      },
      {
        date: '2026-04-05',
        flow: 'spotting',
        painScore: 0,
        symptoms: [],
      },
    ];

    const report = generateDoctorReportData({
      profile,
      periods,
      dailyLogs,
      today: '2026-04-10',
    });

    // Patient info
    expect(report.patientInfo.name).toBe('Aditi Roy');
    expect(report.patientInfo.age).toBe(26);

    // Cycle metrics
    expect(report.cycleMetrics.totalCompletedCycles).toBe(3);
    expect(report.cycleMetrics.lastPeriodStartDate).toBe('2026-04-01');
    expect(report.cycleMetrics.recentCyclesTable.length).toBe(4);

    // Flow metrics
    expect(report.flowMetrics.flowCounts.heavy).toBe(2);
    expect(report.flowMetrics.flowCounts.medium).toBe(1);
    expect(report.flowMetrics.flowCounts.light).toBe(1);
    expect(report.flowMetrics.flowCounts.spotting).toBe(1);
    expect(report.flowMetrics.totalBleedingDaysLogged).toBe(5);

    // Pain metrics
    expect(report.painMetrics.totalPainEntriesLogged).toBe(5);
    expect(report.painMetrics.maxPainScore).toBe(8);
    expect(report.painMetrics.avgPainScore).toBe(4.2); // (8+7+4+2+0)/5 = 21/5 = 4.2
    expect(report.painMetrics.severePainDaysCount).toBe(2); // 8 and 7

    // Symptom ranking (cramps: 3, fatigue: 2, bloating: 2, headache: 1)
    expect(report.symptomMetrics.symptoms[0].id).toBe('cramps');
    expect(report.symptomMetrics.symptoms[0].count).toBe(3);

    // Screening engine integration
    expect(report.screeningMetrics.hasEnoughData).toBe(true);
    expect(Array.isArray(report.screeningMetrics.flags)).toBe(true);

    // Discussion points
    expect(report.discussionPoints.length).toBeGreaterThan(0);
  });

  it('triggers specific discussion points when risk flags or red flags are detected', () => {
    const profile = { name: 'Priya', age: 29 };

    // Prolonged bleeding > 7 days
    const periods = [
      { id: 'p1', startDate: '2026-04-01', endDate: '2026-04-10', cycleLength: 28 }, // 10 days bleeding
      { id: 'p2', startDate: '2026-03-04', endDate: '2026-03-09', cycleLength: 28 },
      { id: 'p3', startDate: '2026-02-04', endDate: '2026-02-09', cycleLength: 28 },
    ];

    const dailyLogs = [
      { date: '2026-04-01', flow: 'heavy', symptoms: ['fatigue'] },
      { date: '2026-04-02', flow: 'heavy', symptoms: ['fatigue'] },
    ];

    const report = generateDoctorReportData({
      profile,
      periods,
      dailyLogs,
      today: '2026-04-15',
    });

    const discussionText = report.discussionPoints.join(' ');
    expect(discussionText).toContain('bleeding streak');
    expect(discussionText).toContain('Complete Blood Count');
  });
});
