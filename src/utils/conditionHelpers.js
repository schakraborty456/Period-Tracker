import {
  CONDITIONS,
  getConditionById,
  getConditionForRiskFlag,
  getConditionsForRiskFlag,
} from '../data/conditions';

export { getConditionForRiskFlag, getConditionsForRiskFlag };

/**
 * Get 1 or 2 related conditions from the same category (excluding current condition).
 * If the category has fewer than `limit`, supplements with other conditions.
 *
 * @param {string} conditionId
 * @param {number} [limit=2]
 * @returns {Array}
 */
export function getRelatedConditions(conditionId, limit = 2) {
  if (!conditionId || typeof conditionId !== 'string') return [];
  const current = getConditionById(conditionId);
  if (!current) return [];

  // Filter conditions from the same category (excluding current)
  const sameCategory = CONDITIONS.filter(
    (c) => c.category === current.category && c.id.toLowerCase() !== current.id.toLowerCase()
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Supplement from other categories if needed
  const others = CONDITIONS.filter(
    (c) => c.category !== current.category && c.id.toLowerCase() !== current.id.toLowerCase()
  );

  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Check if a condition ID is valid and exists in the library.
 * @param {string} conditionId
 * @returns {boolean}
 */
export function isValidConditionId(conditionId) {
  if (!conditionId || typeof conditionId !== 'string') return false;
  return Boolean(getConditionById(conditionId));
}

/**
 * Reverse lookup: Find all conditions that link to a specific workout ID in relatedWorkoutIds.
 *
 * @param {string} workoutId
 * @returns {Array<object>}
 */
export function getConditionsForWorkout(workoutId) {
  if (!workoutId || typeof workoutId !== 'string') return [];
  const trimmed = workoutId.trim();
  return CONDITIONS.filter(
    (c) => Array.isArray(c.relatedWorkoutIds) && c.relatedWorkoutIds.includes(trimmed)
  );
}

/**
 * Match a red-flag escalation alert (from detectRedFlagEscalation) to the best matching condition.
 *
 * @param {object|string} redFlagOrId - Red flag object with id/type, or string identifier
 * @returns {object|null}
 */
export function getConditionForEscalation(redFlagOrId) {
  if (!redFlagOrId) return null;
  const identifier =
    typeof redFlagOrId === 'string'
      ? redFlagOrId
      : `${redFlagOrId.id || ''} ${redFlagOrId.type || ''}`;
  const normalized = identifier.toLowerCase();

  if (
    normalized.includes('amenorrhea') ||
    normalized.includes('no_period') ||
    normalized.includes('missed')
  ) {
    return getConditionById('irregular-periods') || null;
  }
  if (normalized.includes('bleeding') || normalized.includes('heavy')) {
    return getConditionById('heavy-periods') || null;
  }
  if (normalized.includes('pain') || normalized.includes('cramp')) {
    return getConditionById('dysmenorrhea') || null;
  }
  return null;
}
