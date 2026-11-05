import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveDailyLog, getDailyLog, getUserDailyLogs } from './firestore';
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

vi.mock('firebase/firestore', () => ({
  doc: (...args) => mockDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  serverTimestamp: () => mockServerTimestamp(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
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
        waterGlasses: -5,
        notes: longNote,
      };

      const result = await saveDailyLog(userId, testDate, logInput);

      expect(result.flow).toBe('none');
      expect(result.mood).toBe('');
      expect(result.symptoms).toEqual([]);
      expect(result.waterGlasses).toBe(0);
      expect(result.notes.length).toBe(500);
      expect(result.updatedAt).toBe('MOCK_TIMESTAMP');
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
});
