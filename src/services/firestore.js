import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDaysDifference, formatLocalDate } from '../utils/dateHelpers';
import { getCycleLengthsFromPeriods, getEffectiveCycleLength } from '../utils/cycleCalculator';

/**
 * Saves or updates a user profile in `users/{userId}`.
 */
export async function saveUserProfile(userId, profileData) {
  const userRef = doc(db, 'users', userId);
  const data = {
    name: profileData.name || '',
    age: Number(profileData.age),
    dietPreference: profileData.dietPreference || 'non-veg',
    avgCycleLength: Number(profileData.avgCycleLength || profileData.cycleLength || 28),
    avgPeriodLength: Number(profileData.avgPeriodLength || profileData.periodLength || 5),
    language: profileData.language || 'en',
    aiConsent: Boolean(profileData.aiConsent),
    ...(profileData.riskConsent !== undefined ? { riskConsent: Boolean(profileData.riskConsent) } : {}),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, data, { merge: true });
  return data;
}

/**
 * Updates risk screening consent status in `users/{userId}`.
 *
 * @param {string} userId
 * @param {boolean} riskConsent
 * @returns {Promise<boolean>}
 */
export async function updateRiskConsent(userId, riskConsent) {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      riskConsent: Boolean(riskConsent),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return Boolean(riskConsent);
}

/**
 * Updates AI assistant consent status in `users/{userId}`.
 *
 * @param {string} userId
 * @param {boolean} aiConsent
 * @returns {Promise<boolean>}
 */
export async function updateAiConsent(userId, aiConsent) {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      aiConsent: Boolean(aiConsent),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return Boolean(aiConsent);
}

// ============================================================================
// AI USAGE RATE LIMITING (Task 6.4c)
// ============================================================================

/**
 * Soft daily question cap for the Gemini AI assistant.
 * Note: this limit is an application-level soft counter governed by this single
 * constant and can be adjusted here.
 */
export const AI_DAILY_LIMIT = 50;

export const AI_LIMIT_REACHED_MESSAGE =
  "You have reached today's question limit. Please come back tomorrow.";

export const AI_USAGE_ERROR_MESSAGE =
  'Unable to verify your daily question limit. Please check your connection and try again.';

export const AI_QUESTIONS_REMAINING_LABEL = 'questions remaining today.';

/**
 * Formats a friendly message for remaining questions.
 *
 * @param {number} remaining
 * @returns {string}
 */
export function getRemainingQuestionsMessage(remaining) {
  if (remaining <= 0) {
    return AI_LIMIT_REACHED_MESSAGE;
  }
  if (remaining === 1) {
    return '1 question remaining today.';
  }
  return `${remaining} questions remaining today.`;
}

/**
 * Normalizes usage rate-limiting errors into standard Error objects with code 'usage-error'
 * without leaking technical details or sensitive user data.
 *
 * @param {Error|any} error
 * @returns {Error}
 */
export function normalizeUsageError(error) {
  if (error?.code === 'usage-error') {
    return error;
  }
  const err = new Error(AI_USAGE_ERROR_MESSAGE);
  err.code = 'usage-error';
  return err;
}

/**
 * Reads the user's AI usage count for today's local date.
 * Path: users/{userId}/aiUsage/{YYYY-MM-DD}
 *
 * @param {string} userId
 * @param {string|Date} [date] Optional local date override
 * @returns {Promise<{ count: number, limit: number, remaining: number }>}
 */
export async function getAiUsageToday(userId, date) {
  try {
    const todayStr = typeof date === 'string' ? date : formatLocalDate(date || new Date());
    const usageRef = doc(db, 'users', userId, 'aiUsage', todayStr);
    const snap = await getDoc(usageRef);
    const count = snap.exists() ? Number(snap.data()?.count || 0) : 0;
    return {
      count,
      limit: AI_DAILY_LIMIT,
      remaining: Math.max(0, AI_DAILY_LIMIT - count),
    };
  } catch (error) {
    throw normalizeUsageError(error);
  }
}

/**
 * Atomically reserves a daily AI question slot by incrementing users/{userId}/aiUsage/{YYYY-MM-DD}
 * using a Firestore transaction.
 *
 * Plan for use:
 * The chat page will call reserveAiQuestion BEFORE every AI call, so failed calls also
 * count and a loop cannot spam the model.
 *
 * Stores ONLY { count, updatedAt }. Never stores question text, answer text, or any user content.
 *
 * @param {string} userId
 * @param {string|Date} [date] Optional local date override
 * @returns {Promise<{ allowed: boolean, used: number, remaining: number }>}
 */
export async function reserveAiQuestion(userId, date) {
  try {
    const todayStr = typeof date === 'string' ? date : formatLocalDate(date || new Date());
    const usageRef = doc(db, 'users', userId, 'aiUsage', todayStr);

    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(usageRef);
      const currentCount = snap.exists() ? Number(snap.data()?.count || 0) : 0;

      if (currentCount >= AI_DAILY_LIMIT) {
        return {
          allowed: false,
          used: currentCount,
          remaining: 0,
        };
      }

      const newCount = currentCount + 1;
      transaction.set(
        usageRef,
        {
          count: newCount,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return {
        allowed: true,
        used: newCount,
        remaining: Math.max(0, AI_DAILY_LIMIT - newCount),
      };
    });
  } catch (error) {
    throw normalizeUsageError(error);
  }
}

/**
 * Fetches the user profile from `users/{userId}`.
 */
export async function getUserProfile(userId) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Adds a new period record to `users/{userId}/periods`.
 */
export async function addPeriod(userId, periodData) {
  const periodsRef = collection(db, 'users', userId, 'periods');
  const docRef = await addDoc(periodsRef, {
    startDate: periodData.startDate, // YYYY-MM-DD
    endDate: periodData.endDate || null, // YYYY-MM-DD or null
    cycleLength: periodData.cycleLength ? Number(periodData.cycleLength) : null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Fetches all period records for a user ordered by startDate descending.
 */
export async function getUserPeriods(userId) {
  const periodsRef = collection(db, 'users', userId, 'periods');
  const q = query(periodsRef, orderBy('startDate', 'desc'));
  const querySnap = await getDocs(q);

  return querySnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Compound helper: Saves onboarding profile and first period record to Firestore.
 */
export async function saveOnboardingData(userId, data) {
  // 1. Save user profile
  const userRef = doc(db, 'users', userId);
  const profilePayload = {
    name: data.name || '',
    age: Number(data.age),
    dietPreference: data.dietPreference || 'non-veg',
    avgCycleLength: Number(data.cycleLength || 28),
    avgPeriodLength: Number(data.periodLength || 5),
    language: data.language || 'en',
    aiConsent: Boolean(data.aiConsent),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profilePayload);

  // 2. Add first period record if lastPeriodDate was provided
  if (data.lastPeriodDate) {
    await addDoc(collection(db, 'users', userId, 'periods'), {
      startDate: data.lastPeriodDate,
      endDate: null,
      cycleLength: Number(data.cycleLength || 28),
      createdAt: serverTimestamp(),
    });
  }

  return profilePayload;
}

/**
 * Saves or updates a daily log record in `users/{userId}/dailyLogs/{yyyy-mm-dd}`.
 */
export async function saveDailyLog(userId, date, logData) {
  const logRef = doc(db, 'users', userId, 'dailyLogs', date);
  const payload = {
    date,
    flow: logData.flow || 'none',
    mood: logData.mood || '',
    symptoms: Array.isArray(logData.symptoms) ? logData.symptoms : [],
    painScore:
      logData.painScore !== undefined && logData.painScore !== null && logData.painScore !== ''
        ? Math.min(10, Math.max(0, Number(logData.painScore)))
        : null,
    sleepHours:
      logData.sleepHours !== undefined && logData.sleepHours !== null && logData.sleepHours !== ''
        ? Math.min(24, Math.max(0, Number(logData.sleepHours)))
        : null,
    weight:
      logData.weight !== undefined && logData.weight !== null && logData.weight !== ''
        ? Math.max(0, Number(logData.weight))
        : null,
    waterGlasses: Math.max(0, Number(logData.waterGlasses) || 0),
    notes: (logData.notes || '').slice(0, 500),
    updatedAt: serverTimestamp(),
  };

  await setDoc(logRef, payload, { merge: true });
  return payload;
}

/**
 * Fetches a single daily log for a user by date.
 */
export async function getDailyLog(userId, date) {
  const logRef = doc(db, 'users', userId, 'dailyLogs', date);
  const docSnap = await getDoc(logRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Fetches recent daily logs for a user ordered by date descending.
 *
 * @param {string} userId
 * @param {number} [limitCount=30]
 * @returns {Promise<Array>}
 */
export async function getUserDailyLogs(userId, limitCount = 30) {
  const logsRef = collection(db, 'users', userId, 'dailyLogs');
  const q = query(logsRef, orderBy('date', 'desc'), limit(limitCount));
  const querySnap = await getDocs(q);

  return querySnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Automatically creates a new period record, calculates the completed cycle length
 * of the previous period, updates the user's cycle average, and syncs Firestore (Task 4.3).
 *
 * @param {string} userId
 * @param {string} newStartDate - 'YYYY-MM-DD'
 * @returns {Promise<{ isNew: boolean, periodId: string, cycleLength: number|null, newAvgCycleLength: number|null }>}
 */
export async function recordNewPeriodAndRecalculate(userId, newStartDate) {
  // 1. Fetch current user periods and profile
  const [periods, profile] = await Promise.all([
    getUserPeriods(userId),
    getUserProfile(userId),
  ]);

  // 2. Prevent duplicate period records for the exact same start date
  const existingPeriod = periods.find((p) => p.startDate === newStartDate);
  if (existingPeriod) {
    return {
      isNew: false,
      periodId: existingPeriod.id,
      cycleLength: existingPeriod.cycleLength || null,
      newAvgCycleLength: profile?.avgCycleLength || 28,
    };
  }

  // 3. Find the immediately preceding period chronologically
  const precedingPeriods = periods
    .filter((p) => p.startDate < newStartDate)
    .sort((a, b) => (a.startDate > b.startDate ? -1 : 1));

  const previousPeriod = precedingPeriods[0] || null;
  let completedCycleLength = null;

  // 4. If previous period exists, compute its completed cycle length and update it
  if (previousPeriod) {
    completedCycleLength = getDaysDifference(newStartDate, previousPeriod.startDate);
    if (completedCycleLength > 0) {
      const prevDocRef = doc(db, 'users', userId, 'periods', previousPeriod.id);
      await updateDoc(prevDocRef, {
        cycleLength: completedCycleLength,
        updatedAt: serverTimestamp(),
      });
      previousPeriod.cycleLength = completedCycleLength;
    }
  }

  // 5. Create the new period document
  const newPeriodRef = await addDoc(collection(db, 'users', userId, 'periods'), {
    startDate: newStartDate,
    endDate: null,
    cycleLength: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 6. Recalculate cycle averages with all updated periods
  const allUpdatedPeriods = [
    { id: newPeriodRef.id, startDate: newStartDate, cycleLength: null },
    ...periods.map((p) => (p.id === previousPeriod?.id ? previousPeriod : p)),
  ];

  const cycleLengths = getCycleLengthsFromPeriods(allUpdatedPeriods);
  let newAvgCycleLength = profile?.avgCycleLength || 28;

  if (cycleLengths.length > 0) {
    const avgResult = getEffectiveCycleLength(cycleLengths, profile?.avgCycleLength || 28);
    newAvgCycleLength = avgResult.effectiveCycleLength;

    // Update user profile with new avgCycleLength
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avgCycleLength: newAvgCycleLength,
      updatedAt: serverTimestamp(),
    });
  }

  return {
    isNew: true,
    periodId: newPeriodRef.id,
    cycleLength: completedCycleLength,
    newAvgCycleLength,
  };
}

/**
 * Saves or updates a doctor visit reminder in `users/{userId}/doctorVisits` (Task 6.2f).
 *
 * @param {string} userId
 * @param {object} visitData
 * @param {string} [visitId]
 * @returns {Promise<{ id: string, date: string, status: string, [key: string]: any }>}
 */
export async function saveDoctorVisit(userId, visitData, visitId = null) {
  const payload = {
    date: visitData.date, // 'YYYY-MM-DD'
    time: visitData.time || '', // '10:30 AM'
    doctorName: (visitData.doctorName || '').slice(0, 100),
    clinic: (visitData.clinic || '').slice(0, 100),
    reason: (visitData.reason || '').slice(0, 200),
    notes: (visitData.notes || '').slice(0, 500),
    status: visitData.status || 'scheduled', // 'scheduled' | 'completed' | 'cancelled'
    checklist: Array.isArray(visitData.checklist) ? visitData.checklist : [],
    updatedAt: serverTimestamp(),
  };

  if (visitId) {
    const visitRef = doc(db, 'users', userId, 'doctorVisits', visitId);
    await setDoc(visitRef, payload, { merge: true });
    return { id: visitId, ...payload };
  } else {
    payload.createdAt = serverTimestamp();
    const visitsRef = collection(db, 'users', userId, 'doctorVisits');
    const docRef = await addDoc(visitsRef, payload);
    return { id: docRef.id, ...payload };
  }
}

/**
 * Fetches all doctor visit records for a user ordered by date descending.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserDoctorVisits(userId) {
  const visitsRef = collection(db, 'users', userId, 'doctorVisits');
  const q = query(visitsRef, orderBy('date', 'desc'));
  const querySnap = await getDocs(q);

  return querySnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Fetches the next scheduled upcoming doctor visit on or after today (Task 6.2f).
 *
 * @param {string} userId
 * @param {string} [todayStr]
 * @returns {Promise<object|null>}
 */
export async function getUpcomingDoctorVisit(userId, todayStr = null) {
  const allVisits = await getUserDoctorVisits(userId);
  const refDate = todayStr || formatLocalDate(new Date());

  const upcoming = allVisits
    .filter((v) => v.status === 'scheduled' && v.date && v.date >= refDate)
    .sort((a, b) => (a.date > b.date ? 1 : -1)); // chronologically earliest first

  return upcoming[0] || null;
}

/**
 * Updates status of a doctor visit reminder (e.g. 'completed', 'cancelled').
 *
 * @param {string} userId
 * @param {string} visitId
 * @param {string} status - 'scheduled' | 'completed' | 'cancelled'
 * @returns {Promise<boolean>}
 */
export async function updateDoctorVisitStatus(userId, visitId, status) {
  const visitRef = doc(db, 'users', userId, 'doctorVisits', visitId);
  await updateDoc(visitRef, {
    status,
    updatedAt: serverTimestamp(),
  });
  return true;
}

/**
 * Deletes a doctor visit document.
 *
 * @param {string} userId
 * @param {string} visitId
 * @returns {Promise<boolean>}
 */
export async function deleteDoctorVisit(userId, visitId) {
  const visitRef = doc(db, 'users', userId, 'doctorVisits', visitId);
  await deleteDoc(visitRef);
  return true;
}

/**
 * Permanently deletes all user data from Cloud Firestore (Task 5.1 & GDPR).
 * Deletes all subcollection docs in `users/{userId}/periods`, `users/{userId}/dailyLogs`,
 * and `users/{userId}/doctorVisits`, then deletes the user document in `users/{userId}`.
 *
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function deleteUserAllData(userId) {
  // 1. Delete all period records
  const periodsRef = collection(db, 'users', userId, 'periods');
  const periodsSnap = await getDocs(periodsRef);
  const periodDeletions = periodsSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(periodDeletions);

  // 2. Delete all daily log records
  const logsRef = collection(db, 'users', userId, 'dailyLogs');
  const logsSnap = await getDocs(logsRef);
  const logDeletions = logsSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(logDeletions);

  // 3. Delete all doctor visit records (Task 6.2f)
  const visitsRef = collection(db, 'users', userId, 'doctorVisits');
  const visitsSnap = await getDocs(visitsRef);
  const visitDeletions = visitsSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(visitDeletions);

  // 4. Delete all AI usage records (Task 6.4c)
  const aiUsageRef = collection(db, 'users', userId, 'aiUsage');
  const aiUsageSnap = await getDocs(aiUsageRef);
  const aiUsageDeletions = aiUsageSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(aiUsageDeletions);

  // 5. Delete user profile doc
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);

  return true;
}
