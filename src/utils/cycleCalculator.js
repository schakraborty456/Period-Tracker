import {
  parseLocalDate,
  formatLocalDate,
  getDaysDifference,
  addLocalDays,
  subLocalDays,
} from './dateHelpers.js';

/**
 * Calculates the predicted start date of the next period.
 * Formula: nextPeriodDate = lastPeriodStart + cycleLength days.
 *
 * @param {string|Date} lastPeriodStartDate - Start date of the last period (YYYY-MM-DD or Date)
 * @param {number} [cycleLength=28] - Total cycle length in days
 * @returns {string} Predicted next period date (YYYY-MM-DD)
 */
export function calculateNextPeriod(lastPeriodStartDate, cycleLength = 28) {
  const cleanCycle = Number(cycleLength) || 28;
  const nextDate = addLocalDays(lastPeriodStartDate, cleanCycle);
  return formatLocalDate(nextDate);
}

/**
 * Calculates the estimated ovulation date.
 * Formula: ovulationDate = nextPeriodDate - 14 days (luteal phase is standard 14 days).
 *
 * @param {string|Date} nextPeriodDate - Next expected period start date
 * @returns {string} Estimated ovulation date (YYYY-MM-DD)
 */
export function calculateOvulationDate(nextPeriodDate) {
  const ovDate = subLocalDays(nextPeriodDate, 14);
  return formatLocalDate(ovDate);
}

/**
 * Calculates the fertile window.
 * Formula: from (ovulationDate - 5 days) to (ovulationDate + 1 day).
 *
 * @param {string|Date} ovulationDate - Estimated ovulation date
 * @returns {{ startDate: string, endDate: string }} Fertile window range
 */
export function calculateFertileWindow(ovulationDate) {
  const startDate = subLocalDays(ovulationDate, 5);
  const endDate = addLocalDays(ovulationDate, 1);

  return {
    startDate: formatLocalDate(startDate),
    endDate: formatLocalDate(endDate),
  };
}

/**
 * Calculates the current day of the cycle.
 * Day 1 is the first day of the period.
 * Formula: cycleDay = days since last period start + 1.
 *
 * @param {string|Date} lastPeriodStartDate
 * @param {string|Date} [targetDate=new Date()]
 * @returns {number} Cycle day (1-indexed)
 */
export function getCycleDay(lastPeriodStartDate, targetDate = new Date()) {
  const daysDiff = getDaysDifference(targetDate, lastPeriodStartDate);
  return daysDiff + 1;
}

/**
 * Determines the cycle phase for a given day.
 *
 * Rules:
 * - Menstrual: Day 1 through periodLength
 * - Follicular: Day (periodLength + 1) through (ovulationDay - 2)
 * - Ovulation: (ovulationDay - 1) through (ovulationDay + 1)
 * - Luteal: (ovulationDay + 2) through cycleLength (and remaining days if late)
 *
 * @param {string|Date} lastPeriodStartDate
 * @param {number} [cycleLength=28]
 * @param {number} [periodLength=5]
 * @param {string|Date} [targetDate=new Date()]
 * @returns {'menstrual'|'follicular'|'ovulation'|'luteal'}
 */
export function getCurrentPhase(
  lastPeriodStartDate,
  cycleLength = 28,
  periodLength = 5,
  targetDate = new Date()
) {
  const cycle = Number(cycleLength) || 28;
  const period = Number(periodLength) || 5;

  const cycleDay = getCycleDay(lastPeriodStartDate, targetDate);

  // 1. Menstrual phase: Day 1 through periodLength
  if (cycleDay >= 1 && cycleDay <= period) {
    return 'menstrual';
  }

  // Calculate ovulation day in this cycle:
  // nextPeriod starts on cycleDay (cycle + 1)
  // ovulation is (cycle + 1) - 14 days
  const ovulationDay = cycle + 1 - 14;

  // 2. Ovulation window: [ovulationDay - 1, ovulationDay + 1]
  const ovStart = Math.max(period + 1, ovulationDay - 1);
  const ovEnd = ovulationDay + 1;

  if (cycleDay >= ovStart && cycleDay <= ovEnd) {
    return 'ovulation';
  }

  // 3. Follicular phase: between end of period and start of ovulation window
  if (cycleDay > period && cycleDay < ovStart) {
    return 'follicular';
  }

  // 4. Luteal phase: after ovulation window (including late period days)
  return 'luteal';
}

/**
 * Detects whether a set of cycle lengths is considered irregular.
 *
 * Per Architecture.md:
 * - Cycle length shorter than 21 days or longer than 38 days.
 * - Cycle lengths vary by more than 7 days between the longest and shortest.
 *
 * @param {number|number[]} cycleInput - A single cycle length or an array of cycle lengths
 * @returns {{ isIrregular: boolean, reason: string|null, variation: number, message: string|null }}
 */
export function detectIrregularCycle(cycleInput) {
  if (cycleInput === undefined || cycleInput === null) {
    return { isIrregular: false, reason: null, variation: 0, message: null };
  }

  const rawArray = Array.isArray(cycleInput) ? cycleInput : [cycleInput];
  const validLengths = rawArray.map(Number).filter((n) => !isNaN(n) && n > 0);

  if (validLengths.length === 0) {
    return { isIrregular: false, reason: null, variation: 0, message: null };
  }

  // 1. Check boundary rule (< 21 or > 38 days)
  const tooShort = validLengths.some((l) => l < 21);
  const tooLong = validLengths.some((l) => l > 38);

  if (tooShort || tooLong) {
    return {
      isIrregular: true,
      reason: tooShort ? 'too_short' : 'too_long',
      variation: 0,
      message: tooShort
        ? 'A cycle shorter than 21 days is considered irregular.'
        : 'A cycle longer than 38 days is considered irregular.',
    };
  }

  // 2. Check variation rule (variation > 7 days)
  if (validLengths.length >= 2) {
    const minLen = Math.min(...validLengths);
    const maxLen = Math.max(...validLengths);
    const variation = maxLen - minLen;

    if (variation > 7) {
      return {
        isIrregular: true,
        reason: 'high_variation',
        variation,
        message: `Cycle lengths vary by ${variation} days (a variation over 7 days is considered irregular).`,
      };
    }
  }

  return {
    isIrregular: false,
    reason: null,
    variation: 0,
    message: null,
  };
}

/**
 * Extracts consecutive cycle lengths (in days) from an array of recorded periods.
 *
 * @param {Array<{ startDate: string }>} periods - Array of periods with startDate
 * @returns {number[]} Array of completed cycle lengths in chronological order
 */
export function getCycleLengthsFromPeriods(periods) {
  if (!periods || periods.length < 2) return [];

  // Sort chronologically ascending (oldest first)
  const sorted = [...periods].sort((a, b) =>
    getDaysDifference(a.startDate, b.startDate)
  );

  const lengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = getDaysDifference(sorted[i].startDate, sorted[i - 1].startDate);
    if (len > 0) {
      lengths.push(len);
    }
  }

  return lengths;
}

/**
 * Calculates the effective cycle length to use for predictions:
 * - If 3 or more completed cycle lengths exist, uses the average of the last 3.
 * - Otherwise falls back to provided default (or 28 days).
 *
 * @param {number[]} cycleLengths - Completed cycle lengths
 * @param {number} [fallbackCycleLength=28]
 * @returns {{ effectiveCycleLength: number, isAveraged: boolean, cyclesCount: number }}
 */
export function getEffectiveCycleLength(cycleLengths, fallbackCycleLength = 28) {
  const fallback = Number(fallbackCycleLength) || 28;

  if (!cycleLengths || cycleLengths.length === 0) {
    return {
      effectiveCycleLength: fallback,
      isAveraged: false,
      cyclesCount: 0,
    };
  }

  const valid = cycleLengths.map(Number).filter((n) => !isNaN(n) && n > 0);

  if (valid.length >= 3) {
    const last3 = valid.slice(-3);
    const sum = last3.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / 3);
    return {
      effectiveCycleLength: avg,
      isAveraged: true,
      cyclesCount: last3.length,
    };
  }

  if (valid.length > 0) {
    const sum = valid.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / valid.length);
    return {
      effectiveCycleLength: avg,
      isAveraged: false,
      cyclesCount: valid.length,
    };
  }

  return {
    effectiveCycleLength: fallback,
    isAveraged: false,
    cyclesCount: 0,
  };
}

/**
 * Returns user-facing phase information and styling tokens.
 *
 * @param {'menstrual'|'follicular'|'ovulation'|'luteal'} phase
 * @returns {{ name: string, color: string, badgeBg: string, icon: string, description: string }}
 */
export function getPhaseDetails(phase) {
  const phases = {
    menstrual: {
      name: 'Menstrual Phase',
      color: '#E85D75',
      badgeBg: '#FDE7F0',
      icon: '🩸',
      description: 'Your body is resetting. Prioritize rest, hydration, and iron-rich foods.',
    },
    follicular: {
      name: 'Follicular Phase',
      color: '#6CC299',
      badgeBg: '#E8F7F0',
      icon: '🌱',
      description: 'Estrogen and energy levels rise. Great time for fresh produce, light exercise, and new projects.',
    },
    ovulation: {
      name: 'Ovulation Phase',
      color: '#F7C948',
      badgeBg: '#FEF8E7',
      icon: '✨',
      description: 'Peak energy and confidence. Support your body with antioxidant-rich foods and plenty of water.',
    },
    luteal: {
      name: 'Luteal Phase',
      color: '#9B8AE0',
      badgeBg: '#F2F0FB',
      icon: '🌙',
      description: 'Progesterone peaks. Focus on grounding foods, magnesium, and restorative self-care.',
    },
  };

  return phases[phase] || phases.menstrual;
}

/**
 * Calculates a complete cycle summary for dashboard and logging.
 * Supports cycle history to automatically apply 3-cycle average and irregular cycle detection.
 *
 * @param {string|Date} lastPeriodStartDate
 * @param {number|number[]|object} cycleInput - Single cycle length, array of lengths, or options object
 * @param {number} [periodLength=5]
 * @param {string|Date} [targetDate=new Date()]
 * @returns {object} Full cycle calculation state
 */
export function calculateCycleSummary(
  lastPeriodStartDate,
  cycleInput = 28,
  periodLength = 5,
  targetDate = new Date()
) {
  let fallbackCycle = 28;
  let cycleHistory = [];

  if (Array.isArray(cycleInput)) {
    cycleHistory = cycleInput;
    fallbackCycle = cycleInput[cycleInput.length - 1] || 28;
  } else if (typeof cycleInput === 'object' && cycleInput !== null) {
    fallbackCycle = Number(cycleInput.cycleLength) || 28;
    cycleHistory = cycleInput.cycleHistory || [];
  } else {
    fallbackCycle = Number(cycleInput) || 28;
    cycleHistory = [fallbackCycle];
  }

  const { effectiveCycleLength, isAveraged, cyclesCount } = getEffectiveCycleLength(
    cycleHistory,
    fallbackCycle
  );

  const cycle = effectiveCycleLength;
  const period = Number(periodLength) || 5;

  const cycleDay = getCycleDay(lastPeriodStartDate, targetDate);
  const nextPeriodDate = calculateNextPeriod(lastPeriodStartDate, cycle);
  const ovulationDate = calculateOvulationDate(nextPeriodDate);
  const fertileWindow = calculateFertileWindow(ovulationDate);
  const currentPhase = getCurrentPhase(lastPeriodStartDate, cycle, period, targetDate);
  const phaseDetails = getPhaseDetails(currentPhase);

  const daysUntilNextPeriod = getDaysDifference(nextPeriodDate, targetDate);
  const isLate = daysUntilNextPeriod < 0;
  const daysLate = isLate ? Math.abs(daysUntilNextPeriod) : 0;

  const targetDateStr = formatLocalDate(targetDate);
  const isFertile = targetDateStr >= fertileWindow.startDate && targetDateStr <= fertileWindow.endDate;

  const ovulationDay = cycle + 1 - 14;

  // Irregular cycle analysis
  const irregularStatus = detectIrregularCycle(
    cycleHistory.length > 0 ? cycleHistory : [cycle]
  );

  return {
    cycleDay,
    currentPhase,
    phaseDetails,
    nextPeriodDate,
    daysUntilNextPeriod,
    isLate,
    daysLate,
    ovulationDate,
    ovulationDay,
    fertileWindow,
    isFertile,
    // Task 2.5 additions:
    effectiveCycleLength,
    isAveraged,
    cyclesCount,
    isIrregular: irregularStatus.isIrregular,
    irregularReason: irregularStatus.reason,
    irregularMessage: irregularStatus.message,
    cycleVariation: irregularStatus.variation,
  };
}
