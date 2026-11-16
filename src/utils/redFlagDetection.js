import { formatLocalDate, getDaysDifference } from './dateHelpers.js';
import {
  checkLongBleedingStreak,
  NO_PERIOD_DAYS,
  LONG_BLEEDING_DAYS,
  MANDATORY_DISCLAIMER,
} from './riskScreening.js';

export const RED_FLAG_NO_PERIOD_DAYS = NO_PERIOD_DAYS; // 90 days (3 months)
export const RED_FLAG_LONG_BLEEDING_DAYS = LONG_BLEEDING_DAYS; // 7 days
export const RED_FLAG_SEVERE_PAIN_SCORE = 9; // Pain score 9 or 10

/**
 * Pure rule-based detection for critical red-flag conditions that warrant
 * prompt medical escalation with a gynecologist (Rules.md Sec 5.1 & Task 6.2f).
 *
 * Checks:
 * 1. No period for >= 90 days (3+ months, not pregnant)
 * 2. Continuous bleeding lasting more than 7 consecutive days
 * 3. Severe acute pain score (9 or 10 on a 10-point scale)
 *
 * @param {object} params
 * @param {Array<object>} params.periods - User's recorded period objects
 * @param {Array<object>} params.dailyLogs - User's daily log entries
 * @param {string|Date} [params.today=new Date()] - Reference date (YYYY-MM-DD or Date)
 * @returns {{
 *   hasRedFlag: boolean,
 *   primaryEscalation: object|null,
 *   redFlags: Array<{
 *     id: string,
 *     title: string,
 *     severity: 'urgent' | 'warning',
 *     reason: string,
 *     clinicalAdvice: string,
 *     daysCount: number|null
 *   }>,
 *   mandatoryDisclaimer: string
 * }}
 */
export function detectRedFlagEscalation({
  periods = [],
  dailyLogs = [],
  today = new Date(),
} = {}) {
  const safePeriods = Array.isArray(periods) ? periods : [];
  const safeLogs = Array.isArray(dailyLogs) ? dailyLogs : [];
  const todayStr = formatLocalDate(today);

  const redFlags = [];

  // ----------------------------------------------------
  // 1. Check: No period for 90 or more days (3 months)
  // ----------------------------------------------------
  if (safePeriods.length > 0) {
    const sortedByLatest = [...safePeriods]
      .filter((p) => p && p.startDate)
      .sort((a, b) => getDaysDifference(b.startDate, a.startDate));

    if (sortedByLatest.length > 0) {
      const latestPeriodDate = sortedByLatest[0].startDate;
      const daysSinceLatest = getDaysDifference(todayStr, latestPeriodDate);

      if (daysSinceLatest >= RED_FLAG_NO_PERIOD_DAYS) {
        redFlags.push({
          id: 'no_period_3_months',
          type: 'amenorrhea',
          title: 'Period Missed for 3+ Months (90+ Days)',
          severity: 'urgent',
          reason: `It has been ${daysSinceLatest} days since your last recorded period start date (${latestPeriodDate}).`,
          clinicalAdvice:
            'A period missed for 3 or more months (when not pregnant) is medically considered secondary amenorrhea. We strongly advise consulting a gynecologist to evaluate your hormonal balance and uterine health.',
          daysCount: daysSinceLatest,
        });
      }
    }
  }

  // ----------------------------------------------------
  // 2. Check: Continuous bleeding for more than 7 days
  // ----------------------------------------------------
  const streakResult = checkLongBleedingStreak(
    safeLogs,
    safePeriods,
    RED_FLAG_LONG_BLEEDING_DAYS
  );

  if (streakResult.maxStreak > RED_FLAG_LONG_BLEEDING_DAYS) {
    redFlags.push({
      id: 'bleeding_over_7_days',
      type: 'prolonged_bleeding',
      title: 'Bleeding Lasting More Than 7 Consecutive Days',
      severity: 'urgent',
      reason: `Continuous bleeding was tracked for ${streakResult.maxStreak} consecutive days (exceeds the 7-day normal threshold).`,
      clinicalAdvice:
        'Bleeding lasting longer than 7 days can increase the risk of iron deficiency/anemia and may indicate underlying hormonal or structural factors. Please schedule an evaluation with a gynecologist.',
      daysCount: streakResult.maxStreak,
    });
  }

  // ----------------------------------------------------
  // 3. Check: Severe acute pain score (9 or 10)
  // ----------------------------------------------------
  const severePainLogs = safeLogs.filter(
    (l) => l && typeof l.painScore === 'number' && l.painScore >= RED_FLAG_SEVERE_PAIN_SCORE
  );

  if (severePainLogs.length > 0) {
    const maxScore = Math.max(...severePainLogs.map((l) => l.painScore));
    redFlags.push({
      id: 'severe_pain_acute',
      type: 'severe_pain',
      title: 'Severe / Unbearable Pain Rating (9–10 / 10)',
      severity: 'urgent',
      reason: `You recorded a peak pain intensity score of ${maxScore} out of 10 across ${severePainLogs.length} day(s).`,
      clinicalAdvice:
        'Pain this intense that severely restricts normal activity should not be normalized. Please consult a doctor to evaluate for conditions like endometriosis, adenomyosis, or pelvic inflammation.',
      daysCount: severePainLogs.length,
    });
  }

  const hasRedFlag = redFlags.length > 0;
  const primaryEscalation = hasRedFlag ? redFlags[0] : null;

  return {
    hasRedFlag,
    primaryEscalation,
    redFlags,
    mandatoryDisclaimer: MANDATORY_DISCLAIMER,
  };
}

/**
 * Checks whether an individual daily log entry triggers an immediate
 * red-flag prompt upon logging (e.g. painScore >= 9).
 *
 * @param {object} logData
 * @param {number} consecutiveBleedingDays
 * @returns {{ isEscalation: boolean, reason: string|null }}
 */
export function checkDailyLogEscalation(logData = {}, consecutiveBleedingDays = 0) {
  if (!logData) return { isEscalation: false, reason: null };

  if (typeof logData.painScore === 'number' && logData.painScore >= RED_FLAG_SEVERE_PAIN_SCORE) {
    return {
      isEscalation: true,
      reason: `You recorded a severe pain score of ${logData.painScore}/10. Please consider consulting a doctor if pain persists.`,
    };
  }

  if (consecutiveBleedingDays > RED_FLAG_LONG_BLEEDING_DAYS) {
    return {
      isEscalation: true,
      reason: `You have logged bleeding for ${consecutiveBleedingDays} consecutive days (longer than 7 days). A doctor's review is recommended.`,
    };
  }

  return { isEscalation: false, reason: null };
}
