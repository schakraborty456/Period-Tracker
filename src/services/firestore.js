import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

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
