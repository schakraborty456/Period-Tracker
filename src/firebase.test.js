import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('src/firebase.js App Check and AI Logic initialization', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('exports auth, db, ai and handles missing VITE_RECAPTCHA_SITE_KEY gracefully without throwing', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock Firebase modules
    vi.doMock('firebase/app', () => ({
      initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    }));
    vi.doMock('firebase/auth', () => ({
      getAuth: vi.fn(() => ({ authState: 'mockAuth' })),
    }));
    vi.doMock('firebase/firestore', () => ({
      getFirestore: vi.fn(() => ({ dbState: 'mockDb' })),
    }));
    const mockInitializeAppCheck = vi.fn();
    const mockReCaptchaEnterpriseProvider = vi.fn();
    vi.doMock('firebase/app-check', () => ({
      initializeAppCheck: mockInitializeAppCheck,
      ReCaptchaEnterpriseProvider: mockReCaptchaEnterpriseProvider,
    }));
    const mockGetAI = vi.fn(() => ({ aiState: 'mockAi' }));
    const mockGoogleAIBackend = vi.fn();
    vi.doMock('firebase/ai', () => ({
      getAI: mockGetAI,
      GoogleAIBackend: mockGoogleAIBackend,
    }));

    const { auth, db, ai, appCheck, default: app } = await import('./firebase');

    expect(auth).toBeDefined();
    expect(db).toBeDefined();
    expect(ai).toBeDefined();
    expect(app).toBeDefined();

    // App Check should NOT be initialized if site key is empty
    expect(mockInitializeAppCheck).not.toHaveBeenCalled();
    expect(appCheck).toBeNull();
    expect(mockGetAI).toHaveBeenCalledTimes(1);
    expect(mockGoogleAIBackend).toHaveBeenCalledTimes(1);
  });

  it('initializes App Check with ReCaptchaEnterpriseProvider when VITE_RECAPTCHA_SITE_KEY is provided', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-enterprise-site-key-12345');

    vi.doMock('firebase/app', () => ({
      initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    }));
    vi.doMock('firebase/auth', () => ({
      getAuth: vi.fn(() => ({})),
    }));
    vi.doMock('firebase/firestore', () => ({
      getFirestore: vi.fn(() => ({})),
    }));
    const mockInitializeAppCheck = vi.fn(() => ({ __appCheckInstance: true }));
    const mockReCaptchaEnterpriseProvider = vi.fn((key) => ({ key }));
    vi.doMock('firebase/app-check', () => ({
      initializeAppCheck: mockInitializeAppCheck,
      ReCaptchaEnterpriseProvider: mockReCaptchaEnterpriseProvider,
    }));
    vi.doMock('firebase/ai', () => ({
      getAI: vi.fn(() => ({})),
      GoogleAIBackend: vi.fn(),
    }));

    const { appCheck } = await import('./firebase');

    expect(mockReCaptchaEnterpriseProvider).toHaveBeenCalledWith('test-enterprise-site-key-12345');
    expect(mockInitializeAppCheck).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isTokenAutoRefreshEnabled: true,
      })
    );
    expect(appCheck).toEqual({ __appCheckInstance: true });
  });
});
