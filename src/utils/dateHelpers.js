import { format, differenceInCalendarDays, addDays, subDays } from 'date-fns';

/**
 * Parses a YYYY-MM-DD string into a Date at local midnight.
 * Avoids UTC timezone conversion shifts.
 *
 * @param {string|Date} dateInput
 * @returns {Date}
 */
export function parseLocalDate(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  const parts = String(dateInput).split('-');
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    return new Date(year, month, day);
  }

  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Formats a Date object or YYYY-MM-DD string to standard YYYY-MM-DD local format.
 *
 * @param {Date|string} date
 * @returns {string}
 */
export function formatLocalDate(date) {
  const localDate = parseLocalDate(date);
  return format(localDate, 'yyyy-MM-dd');
}

/**
 * Returns difference in calendar days between dateLeft and dateRight (dateLeft - dateRight).
 *
 * @param {string|Date} dateLeft
 * @param {string|Date} dateRight
 * @returns {number}
 */
export function getDaysDifference(dateLeft, dateRight) {
  return differenceInCalendarDays(parseLocalDate(dateLeft), parseLocalDate(dateRight));
}

/**
 * Adds days to a date using local midnight.
 *
 * @param {string|Date} date
 * @param {number} amount
 * @returns {Date}
 */
export function addLocalDays(date, amount) {
  return addDays(parseLocalDate(date), amount);
}

/**
 * Subtracts days from a date using local midnight.
 *
 * @param {string|Date} date
 * @param {number} amount
 * @returns {Date}
 */
export function subLocalDays(date, amount) {
  return subDays(parseLocalDate(date), amount);
}
