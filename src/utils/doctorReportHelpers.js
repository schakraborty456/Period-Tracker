import { formatLocalDate, getDaysDifference } from './dateHelpers.js';
import {
  getCycleLengthsFromPeriods,
  getEffectiveCycleLength,
  detectIrregularCycle,
} from './cycleCalculator.js';
import {
  evaluateRiskFlags,
  checkLongBleedingStreak,
  SEVERE_PAIN_MIN,
  LONG_BLEEDING_DAYS,
  NO_PERIOD_DAYS,
} from './riskScreening.js';
import { SYMPTOM_OPTIONS, FLOW_OPTIONS } from '../data/symptoms.js';
import { getRiskFlagDetails } from '../data/riskFlags.js';

/**
 * Maps a symptom ID to its human-readable label and icon.
 * @param {string} symptomId
 * @returns {{ label: string, icon: string }}
 */
export function getSymptomMeta(symptomId) {
  const match = SYMPTOM_OPTIONS.find((s) => s.id === symptomId);
  if (match) {
    return { label: match.label, icon: match.icon };
  }
  // Fallback titleized label
  const formatted = symptomId
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { label: formatted, icon: '•' };
}

/**
 * Compiles a comprehensive, objective clinical summary for gynecologist consultations.
 *
 * @param {object} params
 * @param {object} params.profile - User profile { name, age, avgCycleLength, avgPeriodLength }
 * @param {Array<object>} params.periods - List of user periods
 * @param {Array<object>} params.dailyLogs - List of daily logs
 * @param {string} [params.today] - Optional 'YYYY-MM-DD'
 * @returns {object} Structured clinical report data
 */
export function generateDoctorReportData({
  profile = {},
  periods = [],
  dailyLogs = [],
  today = formatLocalDate(new Date()),
} = {}) {
  // 1. Patient Profile
  const patientInfo = {
    name: profile.name || 'Anonymous Patient',
    age: profile.age ? Number(profile.age) : null,
    baselineCycleLength: Number(profile.avgCycleLength || 28),
    baselinePeriodLength: Number(profile.avgPeriodLength || 5),
    dietPreference: profile.dietPreference || 'not specified',
    reportDate: today,
  };

  // 2. Periods & Cycle History
  const sortedPeriods = [...periods]
    .filter((p) => p && p.startDate)
    .sort((a, b) => (a.startDate > b.startDate ? -1 : 1)); // descending

  const cycleLengths = getCycleLengthsFromPeriods(sortedPeriods);
  const totalCompletedCycles = cycleLengths.length;

  let effectiveAvgCycle = patientInfo.baselineCycleLength;
  if (cycleLengths.length > 0) {
    const avgResult = getEffectiveCycleLength(cycleLengths, patientInfo.baselineCycleLength);
    effectiveAvgCycle = avgResult.effectiveCycleLength;
  }

  const cycleVariation =
    cycleLengths.length > 0
      ? {
          min: Math.min(...cycleLengths),
          max: Math.max(...cycleLengths),
          range: Math.max(...cycleLengths) - Math.min(...cycleLengths),
        }
      : { min: effectiveAvgCycle, max: effectiveAvgCycle, range: 0 };

  const irregularCheck = detectIrregularCycle(cycleLengths);

  // Table of recent completed cycles (up to last 6)
  const recentCyclesTable = [];
  for (let i = 0; i < sortedPeriods.length; i++) {
    const current = sortedPeriods[i];
    const prevInTime = sortedPeriods[i - 1]; // chronologically later period that marked the end of current cycle

    let durationDays = null;
    if (current.endDate) {
      durationDays = getDaysDifference(current.endDate, current.startDate) + 1;
    }

    recentCyclesTable.push({
      startDate: current.startDate,
      endDate: current.endDate || null,
      bleedingDuration: durationDays,
      cycleLength: current.cycleLength || (prevInTime ? getDaysDifference(prevInTime.startDate, current.startDate) : null),
    });

    if (recentCyclesTable.length >= 6) break;
  }

  // 3. Bleeding & Flow Metrics
  const flowCounts = {
    none: 0,
    spotting: 0,
    light: 0,
    medium: 0,
    heavy: 0,
  };

  const validLogs = dailyLogs.filter((l) => l && l.date);
  validLogs.forEach((l) => {
    if (l.flow && flowCounts[l.flow] !== undefined) {
      flowCounts[l.flow] += 1;
    }
  });

  const totalBleedingDaysLogged =
    flowCounts.spotting + flowCounts.light + flowCounts.medium + flowCounts.heavy;

  const streakResult = checkLongBleedingStreak(dailyLogs, periods);

  // 4. Pain Score Profile (0 to 10 scale)
  const painLogs = validLogs.filter(
    (l) => l.painScore !== null && l.painScore !== undefined && !isNaN(Number(l.painScore))
  );

  let maxPainScore = null;
  let avgPainScore = null;
  let severePainDaysCount = 0; // >= 7

  if (painLogs.length > 0) {
    const scores = painLogs.map((l) => Number(l.painScore));
    maxPainScore = Math.max(...scores);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    avgPainScore = Number((sum / scores.length).toFixed(1));
    severePainDaysCount = scores.filter((s) => s >= SEVERE_PAIN_MIN).length;
  }

  // 5. Symptom Frequency Tallies
  const symptomTallyMap = {};
  validLogs.forEach((l) => {
    if (Array.isArray(l.symptoms)) {
      l.symptoms.forEach((symptomId) => {
        if (!symptomId) return;
        symptomTallyMap[symptomId] = (symptomTallyMap[symptomId] || 0) + 1;
      });
    }
  });

  const sortedSymptoms = Object.entries(symptomTallyMap)
    .map(([id, count]) => {
      const meta = getSymptomMeta(id);
      return {
        id,
        count,
        label: meta.label,
        icon: meta.icon,
      };
    })
    .sort((a, b) => b.count - a.count);

  // 6. Risk Screening Engine Evaluation (Pure rule-based)
  const screeningResult = evaluateRiskFlags({
    periods,
    dailyLogs,
    today,
  });

  // Enrich flags with full metadata
  const enrichedFlags = screeningResult.flags.map((flag) => {
    const details = getRiskFlagDetails(flag.id);
    return {
      ...flag,
      details,
    };
  });

  // 7. Clinical Discussion Points Generator
  const discussionPoints = [];

  // Red Flag: Long bleeding or Amenorrhea (checked directly and via flags)
  if (streakResult.maxStreak > LONG_BLEEDING_DAYS) {
    discussionPoints.push(
      `Discuss continuous bleeding streak of ${streakResult.maxStreak} consecutive days (exceeds 7-day normal threshold).`
    );
  }

  const daysSinceLastPeriod = sortedPeriods[0]?.startDate
    ? getDaysDifference(today, sortedPeriods[0].startDate)
    : null;

  if (daysSinceLastPeriod && daysSinceLastPeriod >= NO_PERIOD_DAYS) {
    discussionPoints.push(
      `Discuss secondary amenorrhea: ${daysSinceLastPeriod} days since last period start date (exceeds 90-day threshold).`
    );
  }

  // PCOS signs
  if (
    screeningResult.flags.some((f) => f.id === 'pcos_possible') ||
    (effectiveAvgCycle > 35 && (symptomTallyMap['acne'] || symptomTallyMap['excess_hair']))
  ) {
    discussionPoints.push(
      'Inquire about pelvic ultrasound and hormone evaluation (LH/FSH, fasting insulin, androgen levels) due to prolonged/irregular cycles and logged dermatological changes.'
    );
  }

  // Anemia signs
  if (
    screeningResult.flags.some((f) => f.id === 'anemia_possible') ||
    (flowCounts.heavy > 0 && symptomTallyMap['fatigue'] > 0)
  ) {
    discussionPoints.push(
      `Request a Complete Blood Count (CBC) and serum ferritin test due to ${flowCounts.heavy} logged heavy bleeding days accompanied by persistent fatigue.`
    );
  }

  // Severe Pain / Endometriosis
  if (
    screeningResult.flags.some((f) => f.id === 'severe_pain_possible') ||
    severePainDaysCount >= 2 ||
    (maxPainScore !== null && maxPainScore >= SEVERE_PAIN_MIN)
  ) {
    discussionPoints.push(
      `Evaluate for possible endometriosis or secondary dysmenorrhea: recorded maximum pain score of ${maxPainScore}/10 with ${severePainDaysCount} severe pain days.`
    );
  }

  // Thyroid signs
  if (
    screeningResult.flags.some((f) => f.id === 'thyroid_possible') ||
    (irregularCheck.isIrregular && symptomTallyMap['fatigue'] > 0 && symptomTallyMap['weight_change'] > 0)
  ) {
    discussionPoints.push(
      'Request routine thyroid function screening (TSH, Free T4) due to fluctuating cycle durations, unexplained weight changes, and fatigue.'
    );
  }

  // Generic discussion point if list is short
  if (discussionPoints.length === 0) {
    discussionPoints.push(
      'Review cycle duration stability and routine preventive gynecological check-up.',
      'Discuss logged symptom frequencies and non-pharmacological self-care strategies.'
    );
  }

  return {
    patientInfo,
    cycleMetrics: {
      totalCompletedCycles,
      effectiveAvgCycle,
      cycleVariation,
      isIrregular: irregularCheck.isIrregular,
      irregularMessage: irregularCheck.message,
      recentCyclesTable,
      daysSinceLastPeriod: sortedPeriods[0]?.startDate
        ? getDaysDifference(today, sortedPeriods[0].startDate)
        : null,
      lastPeriodStartDate: sortedPeriods[0]?.startDate || null,
    },
    flowMetrics: {
      flowCounts,
      totalBleedingDaysLogged,
      maxBleedingStreak: streakResult.maxStreak,
    },
    painMetrics: {
      totalPainEntriesLogged: painLogs.length,
      maxPainScore,
      avgPainScore,
      severePainDaysCount,
    },
    symptomMetrics: {
      totalLoggedDays: validLogs.length,
      symptoms: sortedSymptoms,
    },
    screeningMetrics: {
      hasEnoughData: screeningResult.hasEnoughData,
      gateMessage: screeningResult.message,
      flags: enrichedFlags,
    },
    discussionPoints,
  };
}
