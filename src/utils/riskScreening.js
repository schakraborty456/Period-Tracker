import {
  parseLocalDate,
  getDaysDifference,
  formatLocalDate,
} from './dateHelpers.js';
import {
  getCycleLengthsFromPeriods,
  detectIrregularCycle,
} from './cycleCalculator.js';

// ==========================================
// Named Threshold Constants (Rules.md Sec 5.2)
// ==========================================
export const MIN_COMPLETED_CYCLES = 3;
export const MIN_LOG_DAYS = 60;

export const LONG_CYCLE_DAYS = 35; // PCOS / Thyroid boundary (longer than 35 days)
export const SHORT_CYCLE_DAYS = 21; // Normal cycle lower boundary
export const MAX_NORMAL_CYCLE_DAYS = 38; // Standard irregular upper boundary
export const CYCLE_VARIATION_THRESHOLD = 7; // Variation over 7 days is considered irregular

export const SEVERE_PAIN_MIN = 7; // Pain score 7 to 10
export const SEVERE_PAIN_MIN_CYCLES = 2; // Across 2 or more distinct cycles

export const LONG_BLEEDING_DAYS = 7; // Bleeding lasting more than 7 consecutive days
export const NO_PERIOD_DAYS = 90; // No period for 90 or more days (3+ months)

export const MANDATORY_DISCLAIMER =
  'Possible signs are showing in your pattern. This is not a diagnosis. Please see a doctor (gynecologist).';
export const INSUFFICIENT_DATA_MESSAGE = 'Keep logging, we need more data';

/**
 * Checks if a daily log has active bleeding (light, medium, or heavy flow).
 * @param {object} log
 * @returns {boolean}
 */
function isBleedingFlow(log) {
  if (!log) return false;
  const flow = log.flow;
  return flow === 'light' || flow === 'medium' || flow === 'heavy';
}

/**
 * Evaluates whether consecutive daily logs contain a streak of bleeding > threshold days.
 * Also checks completed period records with startDate and endDate.
 *
 * @param {Array<object>} dailyLogs
 * @param {Array<object>} periods
 * @param {number} thresholdDays
 * @returns {{ hasLongBleeding: boolean, maxStreak: number }}
 */
export function checkLongBleedingStreak(dailyLogs = [], periods = [], thresholdDays = LONG_BLEEDING_DAYS) {
  let maxStreak = 0;

  // 1. Check period records if endDate is provided
  if (Array.isArray(periods)) {
    for (const p of periods) {
      if (p?.startDate && p?.endDate) {
        const diff = getDaysDifference(p.endDate, p.startDate);
        const duration = diff + 1;
        if (duration > maxStreak) {
          maxStreak = duration;
        }
      }
    }
  }

  // 2. Check dailyLogs consecutive bleeding days
  if (Array.isArray(dailyLogs) && dailyLogs.length > 0) {
    const validLogs = dailyLogs
      .filter((l) => l && l.date)
      .map((l) => ({ ...l, dateStr: formatLocalDate(l.date) }))
      .sort((a, b) => getDaysDifference(a.dateStr, b.dateStr)); // chronological ascending

    let currentStreak = 0;
    let prevDate = null;

    for (const log of validLogs) {
      const bleeding = isBleedingFlow(log);
      if (bleeding) {
        if (!prevDate) {
          currentStreak = 1;
        } else {
          const dayDiff = getDaysDifference(log.dateStr, prevDate);
          if (dayDiff === 1) {
            // Consecutive day
            currentStreak += 1;
          } else if (dayDiff === 0) {
            // Duplicate entry for same day
          } else {
            // Gap between logs
            currentStreak = 1;
          }
        }
        prevDate = log.dateStr;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
        prevDate = null;
      }
    }
  }

  return {
    hasLongBleeding: maxStreak > thresholdDays,
    maxStreak,
  };
}

/**
 * Pure risk screening evaluation engine (Task 6.2b).
 * Analyzes cycle history and symptom logs for patterns without AI or clinical diagnosis.
 *
 * @param {object} params
 * @param {Array<object>} params.periods - User's recorded period objects
 * @param {Array<object>} params.dailyLogs - User's daily log entries
 * @param {Date|string} [params.today=new Date()] - Reference date for calculation
 * @returns {{ hasEnoughData: boolean, message: string, flags: Array<{ id: string, label: string, reasons: string[] }> }}
 */
export function evaluateRiskFlags({ periods = [], dailyLogs = [], today = new Date() } = {}) {
  const safePeriods = Array.isArray(periods) ? periods : [];
  const safeLogs = Array.isArray(dailyLogs) ? dailyLogs : [];

  // 1. Calculate data sufficiency
  const cycleLengths = getCycleLengthsFromPeriods(safePeriods);
  const completedCyclesCount = cycleLengths.length;

  const uniqueLogDates = new Set(
    safeLogs
      .filter((l) => l && l.date)
      .map((l) => formatLocalDate(l.date))
  );
  const loggedDaysCount = uniqueLogDates.size;

  const hasEnoughData =
    completedCyclesCount >= MIN_COMPLETED_CYCLES || loggedDaysCount >= MIN_LOG_DAYS;

  // Minimum data gate
  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      message: INSUFFICIENT_DATA_MESSAGE,
      flags: [],
    };
  }

  const flags = [];

  // Aggregate cycle statistics
  const irregularCheck = detectIrregularCycle(cycleLengths);
  const hasLongCycles = cycleLengths.some((len) => len > LONG_CYCLE_DAYS);
  const isCyclePatternIrregular = irregularCheck.isIrregular || hasLongCycles;

  // Aggregate symptom and flow presence across logs
  let hasHeavyFlow = false;
  let hasFatigueOrTiredness = false;
  let hasAcne = false;
  let hasExcessHair = false;
  let hasHairLoss = false;
  let hasWeightChange = false;
  let hasDarkSkinPatches = false;

  // Pain score tracking across distinct cycles
  const highPainDates = [];

  for (const log of safeLogs) {
    if (!log) continue;

    // Flow
    if (log.flow === 'heavy') {
      hasHeavyFlow = true;
    }

    // Mood & fatigue
    if (log.mood === 'tired') {
      hasFatigueOrTiredness = true;
    }

    // Symptoms array (safely treat missing as empty array)
    const symptoms = Array.isArray(log.symptoms) ? log.symptoms : [];
    if (symptoms.includes('fatigue')) hasFatigueOrTiredness = true;
    if (symptoms.includes('acne')) hasAcne = true;
    if (symptoms.includes('excess_hair')) hasExcessHair = true;
    if (symptoms.includes('hair_loss')) hasHairLoss = true;
    if (symptoms.includes('weight_change')) hasWeightChange = true;
    if (symptoms.includes('dark_patches')) hasDarkSkinPatches = true;

    // Pain score (clamped 0–10)
    if (typeof log.painScore === 'number' && log.painScore >= SEVERE_PAIN_MIN && log.date) {
      highPainDates.push(formatLocalDate(log.date));
    }
  }

  // Count distinct cycles with severe pain (logs separated by >= 14 days or in distinct period windows)
  let distinctSeverePainCycles = 0;
  if (highPainDates.length > 0) {
    const sortedPainDates = [...new Set(highPainDates)].sort((a, b) =>
      getDaysDifference(a, b)
    );

    distinctSeverePainCycles = 1;
    let lastRecordedPainDate = sortedPainDates[0];

    for (let i = 1; i < sortedPainDates.length; i++) {
      const diff = getDaysDifference(sortedPainDates[i], lastRecordedPainDate);
      if (diff >= 14) {
        distinctSeverePainCycles += 1;
        lastRecordedPainDate = sortedPainDates[i];
      }
    }
  }

  // ----------------------------------------------------
  // FLAG 1: see_doctor_soon (Red Flags)
  // ----------------------------------------------------
  const redFlagReasons = [];

  // Check 1A: No period for >= 90 days
  if (safePeriods.length > 0) {
    // Sort descending by startDate (latest first)
    const sortedByLatest = [...safePeriods]
      .filter((p) => p && p.startDate)
      .sort((a, b) => getDaysDifference(b.startDate, a.startDate));

    if (sortedByLatest.length > 0) {
      const latestPeriodDate = sortedByLatest[0].startDate;
      const daysSinceLatest = getDaysDifference(today, latestPeriodDate);

      if (daysSinceLatest >= NO_PERIOD_DAYS) {
        redFlagReasons.push(
          `No period has been recorded for ${daysSinceLatest} days (over 3 consecutive months).`
        );
      }
    }
  }

  // Check 1B: Bleeding lasting more than 7 consecutive days
  const bleedingCheck = checkLongBleedingStreak(safeLogs, safePeriods, LONG_BLEEDING_DAYS);
  if (bleedingCheck.hasLongBleeding) {
    redFlagReasons.push(
      `Bleeding flow lasted for ${bleedingCheck.maxStreak} consecutive days (longer than 7 days).`
    );
  }

  if (redFlagReasons.length > 0) {
    flags.push({
      id: 'see_doctor_soon',
      label: 'See a Doctor Soon (Important Notice)',
      reasons: redFlagReasons,
    });
  }

  // ----------------------------------------------------
  // FLAG 2: pcos_possible
  // Cycles frequently > 35 days or irregular + acne/excess hair/hair loss/weight change/dark patches
  // ----------------------------------------------------
  const hasPcosSymptoms =
    hasAcne || hasExcessHair || hasHairLoss || hasWeightChange || hasDarkSkinPatches;

  if (isCyclePatternIrregular && hasPcosSymptoms) {
    const reasons = [];
    if (hasLongCycles) {
      reasons.push(
        `Cycles frequently exceed ${LONG_CYCLE_DAYS} days in length.`
      );
    } else if (irregularCheck.isIrregular) {
      reasons.push(
        irregularCheck.message || 'Irregular cycle length variation observed across recorded cycles.'
      );
    }

    const matchedSymptoms = [];
    if (hasAcne) matchedSymptoms.push('acne / breakouts');
    if (hasExcessHair) matchedSymptoms.push('excess hair growth');
    if (hasHairLoss) matchedSymptoms.push('hair thinning / loss');
    if (hasWeightChange) matchedSymptoms.push('weight fluctuations');
    if (hasDarkSkinPatches) matchedSymptoms.push('dark skin patches');

    reasons.push(
      `Symptoms associated with hormonal pattern shifts were logged: ${matchedSymptoms.join(', ')}.`
    );

    flags.push({
      id: 'pcos_possible',
      label: 'Possible Signs of PCOS',
      reasons,
    });
  }

  // ----------------------------------------------------
  // FLAG 3: anemia_possible
  // Heavy bleeding flow + persistent tiredness or fatigue
  // ----------------------------------------------------
  if (hasHeavyFlow && hasFatigueOrTiredness) {
    flags.push({
      id: 'anemia_possible',
      label: 'Possible Signs of Anemia',
      reasons: [
        'Heavy menstrual flow was recorded during bleeding days.',
        'Persistent tiredness or fatigue symptoms were logged alongside heavy bleeding.',
      ],
    });
  }

  // ----------------------------------------------------
  // FLAG 4: severe_pain_possible
  // High pain score (7 to 10) repeatedly across 2+ distinct cycles
  // ----------------------------------------------------
  if (distinctSeverePainCycles >= SEVERE_PAIN_MIN_CYCLES) {
    flags.push({
      id: 'severe_pain_possible',
      label: 'Possible Signs of Severe Pain or Endometriosis',
      reasons: [
        `Severe pain scores (${SEVERE_PAIN_MIN} to 10) were recorded across ${distinctSeverePainCycles} distinct menstrual cycles.`,
        'Pain of this intensity that disrupts daily activities warrants evaluation by a gynecologist.',
      ],
    });
  }

  // ----------------------------------------------------
  // FLAG 5: thyroid_possible
  // Fluctuating cycles + fatigue + weight change
  // ----------------------------------------------------
  if (isCyclePatternIrregular && hasFatigueOrTiredness && hasWeightChange) {
    flags.push({
      id: 'thyroid_possible',
      label: 'Possible Signs of Thyroid Irregularity',
      reasons: [
        'Cycle variation or irregular lengths were observed across cycles.',
        'Persistent fatigue / tiredness was recorded in daily logs.',
        'Weight changes were noted alongside cycle fluctuations.',
      ],
    });
  }

  return {
    hasEnoughData: true,
    message: flags.length > 0 ? MANDATORY_DISCLAIMER : 'No risk patterns flagged in your logged data.',
    flags,
  };
}

