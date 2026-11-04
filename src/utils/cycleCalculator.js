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
 *
 * @param {string|Date} lastPeriodStartDate
 * @param {number} [cycleLength=28]
 * @param {number} [periodLength=5]
 * @param {string|Date} [targetDate=new Date()]
 * @returns {object} Full cycle calculation state
 */
export function calculateCycleSummary(
  lastPeriodStartDate,
  cycleLength = 28,
  periodLength = 5,
  targetDate = new Date()
) {
  const cycle = Number(cycleLength) || 28;
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
  };
}
