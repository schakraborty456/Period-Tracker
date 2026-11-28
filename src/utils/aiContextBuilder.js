/**
 * aiContextBuilder.js - Zero-PII cycle context builder for AI Assistant (Task 6.4b).
 *
 * Prepares sanitized, privacy-safe cycle context for the AI assistant.
 * Strict Zero-PII Policy: NEVER includes name, email, user ID, personal notes,
 * or date of birth. All outputs are piped through sanitizeContext().
 */

import { formatLocalDate, subLocalDays } from './dateHelpers';
import { sanitizeContext } from '../services/ai';

/**
 * Checks whether the user has explicitly granted AI assistant consent.
 *
 * @param {object|null} profile User profile from Firestore
 * @returns {boolean} True if profile.aiConsent === true
 */
export function hasAiConsent(profile) {
  return Boolean(profile && profile.aiConsent === true);
}

/**
 * Extracts and deduplicates symptoms logged in the last N days (default 7 days).
 *
 * @param {Array<object>} dailyLogs Array of daily log records
 * @param {Date|string} [referenceDate=new Date()] Reference anchor date (local)
 * @param {number} [maxDays=7] Number of past calendar days to inspect
 * @returns {Array<string>} Deduplicated array of valid symptom strings
 */
export function getRecentSymptomsFromLogs(dailyLogs = [], referenceDate = new Date(), maxDays = 7) {
  if (!Array.isArray(dailyLogs) || dailyLogs.length === 0) return [];

  const refDateStr = formatLocalDate(referenceDate);
  const cutoffDateStr = formatLocalDate(subLocalDays(referenceDate, maxDays - 1));

  const symptomsSet = new Set();
  dailyLogs.forEach((log) => {
    if (!log || typeof log !== 'object' || !log.date) return;
    // Log must fall within [cutoffDateStr, refDateStr]
    if (log.date >= cutoffDateStr && log.date <= refDateStr) {
      if (Array.isArray(log.symptoms)) {
        log.symptoms.forEach((s) => {
          if (typeof s === 'string' && s.trim()) {
            symptomsSet.add(s.trim());
          }
        });
      }
    }
  });

  return Array.from(symptomsSet);
}

/**
 * Calculates the average pain score (0 to 10) from logs in the last N days (default 7 days).
 *
 * @param {Array<object>} dailyLogs Array of daily log records
 * @param {Date|string} [referenceDate=new Date()] Reference anchor date
 * @param {number} [maxDays=7] Number of past calendar days to inspect
 * @returns {number|null} Average pain score rounded to 1 decimal place, or null if no scores
 */
export function getRecentPainScoreAvg(dailyLogs = [], referenceDate = new Date(), maxDays = 7) {
  if (!Array.isArray(dailyLogs) || dailyLogs.length === 0) return null;

  const refDateStr = formatLocalDate(referenceDate);
  const cutoffDateStr = formatLocalDate(subLocalDays(referenceDate, maxDays - 1));

  const validScores = [];
  dailyLogs.forEach((log) => {
    if (!log || typeof log !== 'object' || !log.date) return;
    if (log.date >= cutoffDateStr && log.date <= refDateStr) {
      if (
        typeof log.painScore === 'number' &&
        !Number.isNaN(log.painScore) &&
        log.painScore >= 0 &&
        log.painScore <= 10
      ) {
        validScores.push(log.painScore);
      }
    }
  });

  if (validScores.length === 0) return null;
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  const avg = sum / validScores.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Builds a sanitized, Zero-PII cycle context payload for the AI assistant.
 * Keeps ONLY:
 * - currentPhase ('menstrual', 'follicular', 'ovulation', 'luteal')
 * - cycleDay (integer 1 to 100)
 * - dietPreference ('veg', 'non-veg', 'eggetarian')
 * - recentSymptoms (array of strings from last 7 days, max 10)
 * - painScoreAvg (number 0 to 10, average of last 7 days)
 * - activeRiskFlags (array of valid flag IDs, max 6)
 *
 * Strictly drops name, email, userId, uid, personal notes, etc.
 *
 * @param {object} params
 * @param {object} [params.profile] User profile record from Firestore
 * @param {object} [params.cycleInfo] Live calculated cycle state (currentPhase, cycleDay)
 * @param {Array<object>} [params.dailyLogs] User's daily logs
 * @param {Array<string|object>} [params.activeRiskFlags] Active risk screening flag IDs or objects
 * @param {Date|string} [params.referenceDate=new Date()] Current reference date
 * @returns {object|null} Sanitized cycle context object
 */
export function buildAiCycleContext({
  profile = {},
  cycleInfo = {},
  dailyLogs = [],
  activeRiskFlags = [],
  referenceDate = new Date(),
} = {}) {
  const currentPhase = cycleInfo?.currentPhase || profile?.currentPhase;
  const cycleDay = cycleInfo?.cycleDay || profile?.cycleDay;
  const dietPreference = profile?.dietPreference;

  const recentSymptoms = getRecentSymptomsFromLogs(dailyLogs, referenceDate, 7);
  const painScoreAvg = getRecentPainScoreAvg(dailyLogs, referenceDate, 7);

  // Normalize activeRiskFlags (array of string IDs or objects with an id property)
  let flagIds = [];
  if (Array.isArray(activeRiskFlags)) {
    flagIds = activeRiskFlags
      .map((item) => (typeof item === 'string' ? item : item?.id))
      .filter(Boolean);
  }

  const rawContext = {
    ...(currentPhase ? { currentPhase } : {}),
    ...(cycleDay ? { cycleDay } : {}),
    ...(dietPreference ? { dietPreference } : {}),
    ...(recentSymptoms.length > 0 ? { recentSymptoms } : {}),
    ...(painScoreAvg !== null && painScoreAvg !== undefined ? { painScoreAvg } : {}),
    ...(flagIds.length > 0 ? { activeRiskFlags: flagIds } : {}),
  };

  return sanitizeContext(rawContext);
}
