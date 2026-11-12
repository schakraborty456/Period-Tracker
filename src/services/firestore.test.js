import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveDailyLog,
  getDailyLog,
  getUserDailyLogs,
  recordNewPeriodAndRecalculate,
  deleteUserAllData,
} from './firestore';
import { getDefaultDailyLog } from '../data/symptoms';

// Mock Firebase modular SDK
vi.mock('../firebase', () => ({
  db: { __mockDb: true },
}));

const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDoc = vi.fn((db, ...pathSegments) => ({
  path: pathSegments.join('/'),
}));
const mockCollection = vi.fn((db, ...pathSegments) => ({
  path: pathSegments.join('/'),
}));
const mockQuery = vi.fn((colRef, ...queryConstraints) => ({
  colRef,
  queryConstraints,
}));
const mockOrderBy = vi.fn((field, dir) => ({ type: 'orderBy', field, dir }));
const mockLimit = vi.fn((n) => ({ type: 'limit', value: n }));
const mockServerTimestamp = vi.fn(() => 'MOCK_TIMESTAMP');

const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (...args) => mockDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  serverTimestamp: () => mockServerTimestamp(),
  addDoc: (...args) => mockAddDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
}));

describe('Daily Log Firestore Service & Data Handling (Task 4.2)', () => {
  const userId = 'test-user-123';
  const testDate = '2026-11-05';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides sensible empty defaults for unlogged days', () => {
    const defaults = getDefaultDailyLog(testDate);
    expect(defaults).toEqual({
      date: '2026-11-05',
      flow: 'none',
      mood: '',
      symptoms: [],
      painScore: null,
      sleepHours: null,
      weight: null,
      waterGlasses: 4,
      notes: '',
    });
  });

  describe('saveDailyLog', () => {
    it('normalizes and saves daily log data with merge: true', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const logInput = {
        flow: 'medium',
        mood: 'happy',
        symptoms: ['cramps', 'bloating'],
        painScore: 5,
        sleepHours: 7.5,
        weight: 54.2,
        waterGlasses: 6,
        notes: 'Felt energetic after morning walk.',
      };

      const result = await saveDailyLog(userId, testDate, logInput);

      expect(mockDoc).toHaveBeenCalledWith({ __mockDb: true }, 'users', userId, 'dailyLogs', testDate);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);

      const [passedDocRef, passedPayload, options] = mockSetDoc.mock.calls[0];
      expect(passedDocRef.path).toBe(`users/${userId}/dailyLogs/${testDate}`);
      expect(options).toEqual({ merge: true });

      expect(passedPayload).toEqual({
        date: testDate,
        flow: 'medium',
        mood: 'happy',
        symptoms: ['cramps', 'bloating'],
        painScore: 5,
        sleepHours: 7.5,
        weight: 54.2,
        waterGlasses: 6,
        notes: 'Felt energetic after morning walk.',
        updatedAt: 'MOCK_TIMESTAMP',
      });

      expect(result).toEqual(passedPayload);
    });

    it('sanitizes input: defaults missing fields and caps long notes at 500 chars', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const longNote = 'A'.repeat(600);
      const logInput = {
        flow: null,
        mood: null,
        symptoms: null,
        painScore: 15, // should clamp to 10
        sleepHours: 30, // should clamp to 24
        weight: -10, // should clamp to 0
        waterGlasses: -5,
        notes: longNote,
      };

      const result = await saveDailyLog(userId, testDate, logInput);

      expect(result.flow).toBe('none');
      expect(result.mood).toBe('');
      expect(result.symptoms).toEqual([]);
      expect(result.painScore).toBe(10);
      expect(result.sleepHours).toBe(24);
      expect(result.weight).toBe(0);
      expect(result.waterGlasses).toBe(0);
      expect(result.notes.length).toBe(500);
      expect(result.updatedAt).toBe('MOCK_TIMESTAMP');
    });

    it('remains backwards compatible with legacy logs missing new fields (Task 6.2a)', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      // Legacy log from V1 with no painScore, sleepHours, or weight
      const legacyLogInput = {
        flow: 'light',
        mood: 'calm',
        symptoms: ['headache'],
        waterGlasses: 5,
        notes: 'Legacy log without new fields',
      };

      const result = await saveDailyLog(userId, testDate, legacyLogInput);

      expect(result.painScore).toBeNull();
      expect(result.sleepHours).toBeNull();
      expect(result.weight).toBeNull();
      expect(result.flow).toBe('light');
    });
  });

  describe('getDailyLog', () => {
    it('returns null if daily log does not exist for the date', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const log = await getDailyLog(userId, testDate);
      expect(log).toBeNull();
      expect(mockDoc).toHaveBeenCalledWith({ __mockDb: true }, 'users', userId, 'dailyLogs', testDate);
    });

    it('returns structured daily log matching saved data when document exists', async () => {
      const storedData = {
        date: testDate,
        flow: 'light',
        mood: 'tired',
        symptoms: ['headache', 'fatigue'],
        waterGlasses: 5,
        notes: 'Took a warm bath.',
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: testDate,
        data: () => storedData,
      });

      const log = await getDailyLog(userId, testDate);
      expect(log).toEqual({
        id: testDate,
        ...storedData,
      });
    });
  });

  describe('getUserDailyLogs', () => {
    it('queries user dailyLogs ordered by date descending with limit', async () => {
      const mockDocs = [
        { id: '2026-11-05', data: () => ({ date: '2026-11-05', flow: 'none' }) },
        { id: '2026-11-04', data: () => ({ date: '2026-11-04', flow: 'light' }) },
      ];

      mockGetDocs.mockResolvedValueOnce({
        docs: mockDocs,
      });

      const logs = await getUserDailyLogs(userId, 10);

      expect(mockCollection).toHaveBeenCalledWith({ __mockDb: true }, 'users', userId, 'dailyLogs');
      expect(mockOrderBy).toHaveBeenCalledWith('date', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      expect(logs).toEqual([
        { id: '2026-11-05', date: '2026-11-05', flow: 'none' },
        { id: '2026-11-04', date: '2026-11-04', flow: 'light' },
      ]);
    });
  });

  describe('recordNewPeriodAndRecalculate (Task 4.3)', () => {
    it('returns isNew: false if a period with the same start date already exists', async () => {
      // getUserPeriods: returns period on 2026-11-01
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'p1',
            data: () => ({ startDate: '2026-11-01', cycleLength: 28 }),
          },
        ],
      });
      // getUserProfile: returns user profile
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: userId,
        data: () => ({ avgCycleLength: 28 }),
      });

      const result = await recordNewPeriodAndRecalculate(userId, '2026-11-01');

      expect(result.isNew).toBe(false);
      expect(result.periodId).toBe('p1');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('creates new period, calculates cycle length of previous period, and updates profile average', async () => {
      // getUserPeriods: previous period on 2026-10-01
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'p-prev',
            data: () => ({ startDate: '2026-10-01', cycleLength: null }),
          },
        ],
      });
      // getUserProfile
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: userId,
        data: () => ({ avgCycleLength: 28 }),
      });
      // mock addDoc returning new doc reference
      mockAddDoc.mockResolvedValueOnce({ id: 'p-new' });

      // New period starts on 2026-10-29 (28 days after 2026-10-01)
      const result = await recordNewPeriodAndRecalculate(userId, '2026-10-29');

      expect(result.isNew).toBe(true);
      expect(result.periodId).toBe('p-new');
      expect(result.cycleLength).toBe(28);

      // Verify updateDoc called for previous period with cycleLength: 28
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `users/${userId}/periods/p-prev` }),
        expect.objectContaining({ cycleLength: 28 })
      );

      // Verify new period created
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `users/${userId}/periods` }),
        expect.objectContaining({
          startDate: '2026-10-29',
          cycleLength: null,
        })
      );

      // Verify user profile updated with calculated avgCycleLength (28)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `users/${userId}` }),
        expect.objectContaining({ avgCycleLength: 28 })
      );
    });
  });

  describe('deleteUserAllData (Task 5.1)', () => {
    it('wipes all subcollections (periods, dailyLogs) and user profile document', async () => {
      const mockPeriodRef = { path: `users/${userId}/periods/p1` };
      const mockLogRef = { path: `users/${userId}/dailyLogs/2026-11-05` };

      // 1. Periods query returns 1 doc
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ ref: mockPeriodRef }],
      });
      // 2. DailyLogs query returns 1 doc
      mockGetDocs.mockResolvedValueOnce({
        docs: [{ ref: mockLogRef }],
      });
      // 3. deleteDoc resolves
      mockDeleteDoc.mockResolvedValue(undefined);

      const success = await deleteUserAllData(userId);

      expect(success).toBe(true);

      // Verify each period doc deleted
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockPeriodRef);

      // Verify each daily log doc deleted
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockLogRef);

      // Verify user document deleted
      expect(mockDoc).toHaveBeenCalledWith({ __mockDb: true }, 'users', userId);
      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `users/${userId}` })
      );
    });
  });
});

