import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AI_MODEL_NAME,
  MAX_OUTPUT_TOKENS,
  buildSystemPrompt,
  askAssistant,
  normalizeAIError,
} from './ai';
import { getAllConditions } from '../data/conditions';

// Mock firebase/ai and ../firebase
vi.mock('../firebase', () => ({
  ai: { __mockAiInstance: true },
}));

const mockGenerateContent = vi.fn();
const mockSendMessage = vi.fn();
const mockStartChat = vi.fn(() => ({
  sendMessage: mockSendMessage,
}));
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
  startChat: mockStartChat,
}));

vi.mock('firebase/ai', () => ({
  getGenerativeModel: (...args) => mockGetGenerativeModel(...args),
}));

describe('src/services/ai.js - AI Service & System Prompt (Task 6.3b)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration Constants', () => {
    it('defines a STABLE, non-preview AI_MODEL_NAME', () => {
      expect(typeof AI_MODEL_NAME).toBe('string');
      expect(AI_MODEL_NAME.trim().length).toBeGreaterThan(0);
      expect(AI_MODEL_NAME.toLowerCase()).not.toContain('preview');
      expect(AI_MODEL_NAME.toLowerCase()).not.toContain('experimental');
      expect(AI_MODEL_NAME.toLowerCase()).not.toContain('gemini-1.5');
      expect(AI_MODEL_NAME.toLowerCase()).not.toContain('gemini-2.0');
    });

    it('defines a modest MAX_OUTPUT_TOKENS limit', () => {
      expect(typeof MAX_OUTPUT_TOKENS).toBe('number');
      expect(MAX_OUTPUT_TOKENS).toBeGreaterThanOrEqual(100);
      expect(MAX_OUTPUT_TOKENS).toBeLessThanOrEqual(1500);
    });
  });

  describe('buildSystemPrompt()', () => {
    const prompt = buildSystemPrompt();

    it('states that the assistant is an informational guide and NOT a doctor', () => {
      expect(prompt).toContain('NOT a doctor');
      expect(prompt).toMatch(/friendly period, nutrition, and self-care information guide/i);
    });

    it('enforces strictly no-diagnosis and no "you have X" assertions', () => {
      expect(prompt).toMatch(/no diagnosis/i);
      expect(prompt).toContain('you have X');
    });

    it('enforces zero medicines, drugs, supplements, herbs, or dosages', () => {
      expect(prompt).toMatch(/zero medicines/i);
      expect(prompt).toMatch(/prescription medicines/i);
      expect(prompt).toMatch(/dosages/i);
    });

    it('frames comfort measures strictly as "may help ease discomfort"', () => {
      expect(prompt).toContain('"may help ease discomfort"');
    });

    it('instructs red-flag escalation to see a doctor or talk to a trusted person right away', () => {
      expect(prompt).toMatch(/very heavy bleeding/i);
      expect(prompt).toMatch(/severe or unbearable pain/i);
      expect(prompt).toMatch(/fainting/i);
      expect(prompt).toMatch(/pregnancy/i);
      expect(prompt).toMatch(/thoughts of self-harm/i);
      expect(prompt).toMatch(/see a doctor/i);
      expect(prompt).toMatch(/trusted person/i);
    });

    it('instructs staying on topic and politely declining unrelated requests', () => {
      expect(prompt).toMatch(/stay on topic/i);
      expect(prompt).toMatch(/politely decline/i);
    });

    it('instructs short, simple answers in the user language (English, Bangla, Banglish)', () => {
      expect(prompt).toMatch(/short, simple/i);
      expect(prompt).toMatch(/English, Bangla, or Banglish/i);
    });

    it('ends with the mandatory medical disclaimer closing line', () => {
      expect(prompt).toContain('This is general information, not medical advice.');
    });

    it('includes every condition id and title from getAllConditions() in the Markdown manifest', () => {
      const allConditions = getAllConditions();
      expect(allConditions.length).toBe(11);

      allConditions.forEach((condition) => {
        // Must contain condition id inside /conditions/:id markdown link
        expect(prompt).toContain(`/conditions/${condition.id}`);
        // Must contain condition title
        expect(prompt).toContain(condition.title);
        // Must contain Markdown link format
        expect(prompt).toContain(`[${condition.title}](/conditions/${condition.id})`);
      });
    });

    it('instructs the model to link ONLY to real pages and never invent other links', () => {
      expect(prompt).toMatch(/link ONLY to the real pages listed above/i);
      expect(prompt).toMatch(/never invent, guess, or hallucinate other routes/i);
    });

    it('contains no banned words from conditions banned-words list in a way that gives health claims', () => {
      // Must not make health claim assertions
      expect(prompt).not.toContain('anti-inflammatory');
      expect(prompt).not.toContain('detox');
      expect(prompt).not.toContain('balance hormones');
      expect(prompt).not.toContain('boost immunity');
      expect(prompt).not.toContain('reduces');
      expect(prompt).not.toContain('prevents');
      expect(prompt).not.toContain('improves fertility');
      expect(prompt).not.toContain('guaranteed');
    });
  });

  describe('normalizeAIError()', () => {
    it('normalizes 429 and resource-exhausted errors to rate-limit code without leaking technical details', () => {
      const error1 = { code: 'resource-exhausted', message: 'Quota exceeded for project 123456' };
      const norm1 = normalizeAIError(error1);
      expect(norm1.code).toBe('rate-limit');
      expect(norm1.message).toContain('free-tier question limit');
      expect(norm1.message).not.toContain('123456');

      const error2 = { status: 429, message: 'Too Many Requests' };
      const norm2 = normalizeAIError(error2);
      expect(norm2.code).toBe('rate-limit');
      expect(norm2.message).toContain('free-tier question limit');
    });

    it('normalizes App Check errors to app-check code without leaking technical details', () => {
      const error1 = { code: 'app-check/fetch-status-error', message: 'App check token 403 forbidden' };
      const norm1 = normalizeAIError(error1);
      expect(norm1.code).toBe('app-check');
      expect(norm1.message).toContain('Security verification could not be completed');
      expect(norm1.message).not.toContain('403 forbidden');

      const error2 = { code: 'permission-denied', message: 'AppCheck failed' };
      const norm2 = normalizeAIError(error2);
      expect(norm2.code).toBe('app-check');
    });

    it('normalizes network errors to network code without leaking technical details', () => {
      const error1 = new TypeError('fetch failed');
      const norm1 = normalizeAIError(error1);
      expect(norm1.code).toBe('network');
      expect(norm1.message).toContain('internet connection');

      const error2 = { code: 'unavailable', message: 'Server is temporarily offline' };
      const norm2 = normalizeAIError(error2);
      expect(norm2.code).toBe('network');
      expect(norm2.message).toContain('internet connection');
    });

    it('normalizes unexpected errors to unknown code without leaking technical details', () => {
      const error = new Error('Database internal segmentation fault in module XYZ');
      const norm = normalizeAIError(error);
      expect(norm.code).toBe('unknown');
      expect(norm.message).toContain('Something went wrong while generating an answer');
      expect(norm.message).not.toContain('segmentation fault');
    });
  });

  describe('askAssistant()', () => {
    it('calls getGenerativeModel with correct parameters and returns response text', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'A warm cup of soup may help ease discomfort during cramps.',
        },
      });

      const answer = await askAssistant({ question: 'What can help with period cramps?' });

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          model: AI_MODEL_NAME,
          systemInstruction: expect.stringContaining('NOT a doctor'),
          generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        })
      );
      expect(mockGenerateContent).toHaveBeenCalledWith('What can help with period cramps?');
      expect(answer).toBe('A warm cup of soup may help ease discomfort during cramps.');
    });

    it('includes cycle context in the prompt payload when provided', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Based on your luteal phase, getting extra rest may help ease discomfort.',
        },
      });

      const context = {
        currentPhase: 'luteal',
        cycleDay: 22,
        dietPreference: 'veg',
        recentSymptoms: ['bloating', 'fatigue'],
      };

      const answer = await askAssistant({
        question: 'Why am I craving snacks today?',
        context,
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('User cycle context:')
      );
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('"currentPhase": "luteal"')
      );
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Why am I craving snacks today?')
      );
      expect(answer).toContain('Based on your luteal phase');
    });

    it('supports multi-turn conversation history with startChat', async () => {
      mockSendMessage.mockResolvedValueOnce({
        response: {
          text: () => 'Sure, oats and dal are great options.',
        },
      });

      const history = [
        { role: 'user', parts: [{ text: 'What should I eat?' }] },
        { role: 'model', parts: [{ text: 'Warm khichdi may help ease discomfort.' }] },
      ];

      const answer = await askAssistant({
        question: 'Any other food ideas?',
        history,
      });

      expect(mockStartChat).toHaveBeenCalledWith(
        expect.objectContaining({
          history: expect.arrayContaining([
            expect.objectContaining({ role: 'user' }),
            expect.objectContaining({ role: 'model' }),
          ]),
        })
      );
      expect(mockSendMessage).toHaveBeenCalledWith('Any other food ideas?');
      expect(answer).toBe('Sure, oats and dal are great options.');
    });

    it('throws normalized error when question is empty or missing', async () => {
      await expect(askAssistant({ question: '' })).rejects.toMatchObject({
        code: 'unknown',
      });
      await expect(askAssistant({})).rejects.toMatchObject({
        code: 'unknown',
      });
    });

    it('catches SDK errors, normalizes them, and throws without leaking technical details', async () => {
      mockGenerateContent.mockRejectedValueOnce({
        code: 'resource-exhausted',
        message: 'Quota exceeded for project 456789',
      });

      await expect(askAssistant({ question: 'Help me' })).rejects.toMatchObject({
        code: 'rate-limit',
      });
    });

    it('never logs question, context, or answer to the console', async () => {
      const logSpy = vi.spyOn(console, 'log');
      const infoSpy = vi.spyOn(console, 'info');
      const warnSpy = vi.spyOn(console, 'warn');
      const errorSpy = vi.spyOn(console, 'error');

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Sensitive period answer',
        },
      });

      const secretQuestion = 'My private period question';
      const secretContext = { secretCycleDay: 14 };

      await askAssistant({
        question: secretQuestion,
        context: secretContext,
      });

      // Verify none of the console functions were called with sensitive data
      [logSpy, infoSpy, warnSpy, errorSpy].forEach((spy) => {
        spy.mock.calls.forEach((callArgs) => {
          const stringified = JSON.stringify(callArgs);
          expect(stringified).not.toContain(secretQuestion);
          expect(stringified).not.toContain('secretCycleDay');
          expect(stringified).not.toContain('Sensitive period answer');
        });
      });

      vi.restoreAllMocks();
    });
  });
});
