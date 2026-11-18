import { CONDITIONS, getConditionById } from '../data/conditions';

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
