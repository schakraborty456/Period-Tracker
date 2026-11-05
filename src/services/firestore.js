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
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDaysDifference } from '../utils/dateHelpers';
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
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, data, { merge: true });
  return data;
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
 * Permanently deletes all user data from Cloud Firestore (Task 5.1).
 * Deletes all subcollection docs in `users/{userId}/periods` and `users/{userId}/dailyLogs`,
 * then deletes the user document in `users/{userId}`.
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

  // 3. Delete user profile doc
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);

  return true;
}
