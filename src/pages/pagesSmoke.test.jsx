import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Import all pages from src/pages
import Login from './Login';
import Signup from './Signup';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';
import Log from './Log';
import Tips from './Tips';
import Workouts from './Workouts';
import Insights from './Insights';
import Conditions from './Conditions';
import ConditionDetail from './ConditionDetail';
import DoctorReport from './DoctorReport';
import Settings from './Settings';
import Privacy from './Privacy';

import { getAllConditions, CONDITIONS_DISCLAIMER } from '../data/conditions';

// Mock window functions for jsdom environment
beforeAll(() => {
  window.scrollTo = vi.fn();
  window.print = vi.fn();
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    };
});

// Dynamic mock store
let mockCurrentUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};
let mockProfile = null;
let mockPeriods = [];
let mockDailyLogs = [];
let mockDoctorVisit = null;

// Mock Firebase SDKs so no network is used
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    loading: false,
    signup: vi.fn().mockResolvedValue({}),
    login: vi.fn().mockResolvedValue({}),
    logout: vi.fn().mockResolvedValue({}),
    loginWithGoogle: vi.fn().mockResolvedValue({}),
    deleteAccount: vi.fn().mockResolvedValue({}),
    updateUserProfile: vi.fn().mockResolvedValue({}),
  }),
  default: () => ({
    currentUser: mockCurrentUser,
    loading: false,
    signup: vi.fn().mockResolvedValue({}),
    login: vi.fn().mockResolvedValue({}),
    logout: vi.fn().mockResolvedValue({}),
    loginWithGoogle: vi.fn().mockResolvedValue({}),
    deleteAccount: vi.fn().mockResolvedValue({}),
    updateUserProfile: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock('../services/firestore', () => ({
  getUserProfile: vi.fn(async () => mockProfile),
  getUserPeriods: vi.fn(async () => mockPeriods),
  getUserDailyLogs: vi.fn(async () => mockDailyLogs),
  getDailyLog: vi.fn(async (uid, date) => {
    return mockDailyLogs?.find((l) => l && l.date === date) || null;
  }),
  saveDailyLog: vi.fn().mockResolvedValue(true),
  saveUserProfile: vi.fn().mockResolvedValue(true),
  addPeriod: vi.fn().mockResolvedValue('period-123'),
  updateRiskConsent: vi.fn().mockResolvedValue(true),
  getUpcomingDoctorVisits: vi.fn(async () => (mockDoctorVisit ? [mockDoctorVisit] : [])),
  getUpcomingDoctorVisit: vi.fn(async () => mockDoctorVisit),
  saveDoctorVisit: vi.fn().mockResolvedValue('visit-123'),
  deleteDoctorVisit: vi.fn().mockResolvedValue(true),
  saveOnboardingData: vi.fn().mockResolvedValue(true),
  deleteUserAllData: vi.fn().mockResolvedValue(true),
  recordNewPeriodAndRecalculate: vi.fn().mockResolvedValue({
    isNew: true,
    cycleLength: 28,
    newAvgCycleLength: 28,
  }),
}));

// Test Datasets
const REALISTIC_PROFILE = {
  name: 'Aditi',
  age: 24,
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietPreference: 'veg',
  lastPeriodStart: '2026-11-01',
  isOnboarded: true,
  riskConsent: true,
  aiConsent: true,
};

const REALISTIC_PERIODS = [
  { id: 'p1', startDate: '2026-11-01', endDate: '2026-11-05', cycleLength: 28, periodLength: 5 },
  { id: 'p2', startDate: '2026-10-04', endDate: '2026-10-09', cycleLength: 28, periodLength: 5 },
  { id: 'p3', startDate: '2026-09-06', endDate: '2026-09-11', cycleLength: 28, periodLength: 5 },
];

const REALISTIC_DAILY_LOGS = [
  {
    date: '2026-11-20',
    flow: 'medium',
    mood: 'happy',
    symptoms: ['cramps', 'bloating'],
    waterGlasses: 6,
    painScore: 3,
    notes: 'Feeling good',
  },
  {
    date: '2026-11-19',
    flow: 'light',
    mood: 'tired',
    symptoms: ['headache'],
    waterGlasses: 5,
    painScore: 2,
  },
  {
    date: '2026-11-01',
    flow: 'heavy',
    mood: 'crampy',
    symptoms: ['cramps'],
    waterGlasses: 8,
    painScore: 5,
  },
];

const REALISTIC_DOCTOR_VISIT = {
  id: 'visit-1',
  doctorName: 'Dr. Banerjee',
  date: '2026-12-05',
  time: '11:00',
  clinicLocation: 'Apollo Clinic',
  reason: 'Routine checkup',
  questions: ['Is my cycle normal?'],
};

const PARTIAL_PROFILE = {
  isOnboarded: true,
  avgCycleLength: 28,
};

const PARTIAL_PERIODS = [{ id: 'p1', startDate: '2026-11-01' }];

const PARTIAL_DAILY_LOGS = [
  { date: '2026-11-15' },
  { date: '2026-11-10', flow: 'none', mood: 'neutral' },
];

function setRealisticData() {
  mockCurrentUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };
  mockProfile = { ...REALISTIC_PROFILE };
  mockPeriods = [...REALISTIC_PERIODS];
  mockDailyLogs = [...REALISTIC_DAILY_LOGS];
  mockDoctorVisit = { ...REALISTIC_DOCTOR_VISIT };
}

function setEmptyData() {
  mockCurrentUser = {
    uid: 'test-user-empty',
    email: 'newuser@example.com',
    displayName: 'New User',
  };
  mockProfile = null;
  mockPeriods = [];
  mockDailyLogs = [];
  mockDoctorVisit = null;
}

function setPartialData() {
  mockCurrentUser = {
    uid: 'test-user-partial',
    email: 'partial@example.com',
    displayName: 'Partial User',
  };
  mockProfile = { ...PARTIAL_PROFILE };
  mockPeriods = [...PARTIAL_PERIODS];
  mockDailyLogs = [...PARTIAL_DAILY_LOGS];
  mockDoctorVisit = { id: 'visit-partial', date: '2026-12-10' };
}

describe('Page Render Smoke Tests (Preventing runtime crashes)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setRealisticData();
  });

  // ----------------------------------------------------
  // 1. REALISTIC DATA RENDERS FOR EVERY PAGE
  // ----------------------------------------------------
  describe('Realistic Data Renders (All 13 Pages)', () => {
    it('renders Login without throwing and shows its main heading', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Login />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeDefined();
    });

    it('renders Signup without throwing and shows its main heading', () => {
      render(
        <MemoryRouter initialEntries={['/signup']}>
          <Signup />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeDefined();
    });

    it('renders Onboarding without throwing and shows its main heading', () => {
      render(
        <MemoryRouter initialEntries={['/onboarding']}>
          <Onboarding />
        </MemoryRouter>
      );
      expect(
        screen.getByRole('heading', { level: 1, name: /personalize your experience/i })
      ).toBeDefined();
    });

    it('renders Dashboard without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Dashboard />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /period tracker/i })).toBeDefined();
      });
    });

    it('renders Log without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/log']}>
          <Log />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /daily log/i })).toBeDefined();
      });
    });

    it('renders Tips without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/tips']}>
          <Tips />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /cycle nutrition guide/i })
        ).toBeDefined();
      });
    });

    it('renders Workouts without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/workouts']}>
          <Workouts />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /home workouts/i })).toBeDefined();
      });
    });

    it('renders Insights without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/insights']}>
          <Insights />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /cycle insights/i })).toBeDefined();
      });
    });

    it('renders Conditions without throwing and shows its main heading', () => {
      render(
        <MemoryRouter initialEntries={['/conditions']}>
          <Conditions />
        </MemoryRouter>
      );
      expect(
        screen.getByRole('heading', { level: 1, name: /conditions library/i })
      ).toBeDefined();
    });

    it('renders ConditionDetail with a known condition id and shows its title heading', () => {
      const firstCondition = getAllConditions()[0];
      render(
        <MemoryRouter initialEntries={[`/conditions/${firstCondition.id}`]}>
          <Routes>
            <Route path="/conditions/:id" element={<ConditionDetail />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { level: 1, name: firstCondition.title })).toBeDefined();
    });

    it('renders DoctorReport without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/report']}>
          <DoctorReport />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 1,
            name: /menstrual health & cycle log report/i,
          })
        ).toBeDefined();
      });
    });

    it('renders Settings without throwing and shows its main heading', async () => {
      render(
        <MemoryRouter initialEntries={['/settings']}>
          <Settings />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /settings & privacy/i })
        ).toBeDefined();
      });
    });

    it('renders Privacy without throwing and shows its main heading', () => {
      render(
        <MemoryRouter initialEntries={['/privacy']}>
          <Privacy />
        </MemoryRouter>
      );
      expect(
        screen.getByRole('heading', { level: 1, name: /privacy policy & data security/i })
      ).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // 2. EMPTY DATA RENDERS (New user, no logs, not onboarded)
  // ----------------------------------------------------
  describe('Empty Data Renders (Zero crash on new/blank profiles)', () => {
    beforeEach(() => {
      setEmptyData();
    });

    it('renders Dashboard with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <Dashboard />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByText(/personalize your cycle tracker/i)).toBeDefined();
      });
    });

    it('renders Log with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/log']}>
            <Log />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /daily log/i })).toBeDefined();
      });
    });

    it('renders Tips with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/tips']}>
            <Tips />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /cycle nutrition guide/i })
        ).toBeDefined();
      });
    });

    it('renders Workouts with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/workouts']}>
            <Workouts />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /home workouts/i })).toBeDefined();
      });
    });

    it('renders Insights with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/insights']}>
            <Insights />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up your profile first/i })).toBeDefined();
      });
    });

    it('renders DoctorReport with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/report']}>
            <DoctorReport />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 1,
            name: /menstrual health & cycle log report/i,
          })
        ).toBeDefined();
      });
    });

    it('renders Settings with empty data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/settings']}>
            <Settings />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /settings & privacy/i })
        ).toBeDefined();
      });
    });
  });

  // ----------------------------------------------------
  // 3. PARTIAL DATA RENDERS (Missing optional fields, legacy logs)
  // ----------------------------------------------------
  describe('Partial Data Renders (Missing fields & legacy logs)', () => {
    beforeEach(() => {
      setPartialData();
    });

    it('renders Dashboard with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <Dashboard />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /period tracker/i })).toBeDefined();
      });
    });

    it('renders Log with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/log']}>
            <Log />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /daily log/i })).toBeDefined();
      });
    });

    it('renders Tips with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/tips']}>
            <Tips />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /cycle nutrition guide/i })
        ).toBeDefined();
      });
    });

    it('renders Workouts with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/workouts']}>
            <Workouts />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /home workouts/i })).toBeDefined();
      });
    });

    it('renders Insights with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/insights']}>
            <Insights />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(screen.getByText(/important consent & medical disclaimer/i)).toBeDefined();
      });
    });

    it('renders DoctorReport with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/report']}>
            <DoctorReport />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 1,
            name: /menstrual health & cycle log report/i,
          })
        ).toBeDefined();
      });
    });

    it('renders Settings with partial data without crashing', async () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/settings']}>
            <Settings />
          </MemoryRouter>
        );
      }).not.toThrow();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1, name: /settings & privacy/i })
        ).toBeDefined();
      });
    });
  });

  // ----------------------------------------------------
  // 4. CONDITION DETAIL FOR EVERY CONDITION & UNKNOWN ID
  // ----------------------------------------------------
  describe('ConditionDetail for All Real Conditions + Unknown ID', () => {
    const allConditions = getAllConditions();
    let renderedConditionsCount = 0;

    beforeEach(() => {
      setRealisticData();
    });

    it.each(allConditions)(
      'renders ConditionDetail for condition id "$id" ($title) with realistic data, verifies title, doctor section, disclaimer, and accordion expansion',
      (condition) => {
        render(
          <MemoryRouter initialEntries={[`/conditions/${condition.id}`]}>
            <Routes>
              <Route path="/conditions/:id" element={<ConditionDetail />} />
            </Routes>
          </MemoryRouter>
        );

        // 1. Condition title is shown
        expect(
          screen.getByRole('heading', { level: 1, name: condition.title })
        ).toBeDefined();

        // 2. "When to see a doctor" section is visible
        expect(
          screen.getByRole('heading', { name: /when to see a doctor/i })
        ).toBeDefined();

        // 3. Disclaimer is shown
        expect(
          screen.getByText((content) =>
            content.includes(CONDITIONS_DISCLAIMER) ||
            content.includes('This educational guide provides general information only')
          )
        ).toBeDefined();

        // 4. Accordions: find all accordion buttons and expand each
        const accordionButtons = screen
          .getAllByRole('button')
          .filter((btn) => btn.hasAttribute('aria-expanded'));
        expect(accordionButtons.length).toBe(5);

        accordionButtons.forEach((btn) => {
          if (btn.getAttribute('aria-expanded') === 'false') {
            fireEvent.click(btn);
            expect(btn.getAttribute('aria-expanded')).toBe('true');
          } else {
            // Toggle closed then back open to ensure expanding works
            fireEvent.click(btn);
            expect(btn.getAttribute('aria-expanded')).toBe('false');
            fireEvent.click(btn);
            expect(btn.getAttribute('aria-expanded')).toBe('true');
          }
        });

        renderedConditionsCount += 1;
      }
    );

    it('guard test: the number of rendered conditions must equal getAllConditions().length, and it must be at least 11', () => {
      const conditions = getAllConditions();
      expect(conditions.length).toBeGreaterThanOrEqual(11);
      expect(renderedConditionsCount).toBe(conditions.length);
    });

    it('renders friendly "Condition Not Found" page for an unknown id without crashing', () => {
      render(
        <MemoryRouter initialEntries={['/conditions/non-existent-condition-slug']}>
          <Routes>
            <Route path="/conditions/:id" element={<ConditionDetail />} />
          </Routes>
        </MemoryRouter>
      );
      expect(
        screen.getByRole('heading', { level: 1, name: /condition not found/i })
      ).toBeDefined();
      expect(screen.getByText(/we couldn’t find an educational guide matching/i)).toBeDefined();
    });
  });
});
