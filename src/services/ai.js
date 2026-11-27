import { getGenerativeModel } from 'firebase/ai';
import { ai } from '../firebase';
import { getAllConditions } from '../data/conditions';

// STABLE, non-preview model on Firebase AI Logic (verify at build time)
export const AI_MODEL_NAME = 'gemini-2.5-flash';
export const MAX_OUTPUT_TOKENS = 700;

/**
 * Pure function that generates the system instruction for the AI assistant.
 * Incorporates all health guardrails, red-flag escalation, language support,
 * and the dynamic manifest of all 11 real conditions from the Conditions Library.
 *
 * @returns {string} System prompt text
 */
export function buildSystemPrompt() {
  const conditions = getAllConditions();
  const conditionsManifest = conditions
    .map((c) => `- [${c.title}](/conditions/${c.id})`)
    .join('\n');

  return `You are a friendly period, nutrition, and self-care information guide. You are NOT a doctor and you do not provide medical advice or medical care.

CORE PRINCIPLES & HEALTH RULES:
1. NO DIAGNOSIS: Never diagnose any condition. Never say or imply "you have X", "you are experiencing X", or similar diagnostic assertions. Offer general educational guidance only.
2. ZERO MEDICINES & DOSAGES: Never recommend, mention, or list specific prescription medicines, over-the-counter drugs, pain relievers, supplement pills, herbs, or dosages. Focus strictly on food, sleep, hydration, and gentle movement.
3. COMFORT TIPS PHRASING: Always describe non-clinical home comfort suggestions (food, warmth, rest, hydration, gentle movement) strictly as measures that "may help ease discomfort". Never describe any tip as a cure, medical treatment, or permanent remedy.
4. RED-FLAG ESCALATIONS: If the user mentions or asks about red-flag topics—including very heavy bleeding (soaking a pad every hour), severe or unbearable pain, fainting or dizziness with bleeding, bleeding lasting more than 7 days, pregnancy or suspected pregnancy, or thoughts of self-harm—tell them kindly and clearly to see a doctor (gynecologist) or talk to a trusted person right away. Do not add helpline numbers.
5. STAY ON TOPIC: Stay focused strictly on menstrual cycles, periods, daily nutrition, and gentle self-care. Politely decline unrelated requests outside this scope.
6. BREVITY & CLARITY: Keep answers short, simple, warm, and easy to understand. Avoid long walls of text.
7. LANGUAGE: Reply in the same language the user writes in (English, Bangla, or Banglish).
8. VERIFIED CONDITIONS LIBRARY CITATIONS:
The app contains verified educational guides for the following real condition pages:
${conditionsManifest}

LINKING INSTRUCTION:
When discussing any of the conditions above, link ONLY to the real pages listed above using Markdown format [Title](/conditions/ID). Never invent, guess, or hallucinate other routes, URLs, or external links.

9. MANDATORY CLOSING: Always end your response with this short line on its own line:
This is general information, not medical advice.`;
}

/**
 * Normalizes SDK, network, and App Check errors into predictable Error objects
 * with standardized error codes ('rate-limit', 'app-check', 'network', 'unknown')
 * without leaking raw technical details to user-facing messages.
 *
 * @param {Error|any} error Raw error thrown by Firebase SDK or network fetch
 * @returns {Error} Normalized error with .code property
 */
export function normalizeAIError(error) {
  const message = (error?.message || '').toLowerCase();
  const code = (error?.code || '').toLowerCase();
  const status = error?.status || error?.statusCode;

  // Rate limit / Quota errors (HTTP 429, resource-exhausted)
  if (
    code.includes('resource-exhausted') ||
    code.includes('quota') ||
    code.includes('rate-limit') ||
    status === 429 ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit')
  ) {
    const err = new Error(
      "We're receiving a lot of questions right now! You've reached the free-tier question limit. Please take a gentle pause and try asking again in a few minutes."
    );
    err.code = 'rate-limit';
    return err;
  }

  // App Check verification errors (HTTP 401, 403, permission-denied)
  if (
    code.includes('app-check') ||
    code.includes('permission-denied') ||
    code.includes('unauthenticated') ||
    message.includes('app check') ||
    message.includes('app-check') ||
    message.includes('appcheck') ||
    status === 401 ||
    status === 403
  ) {
    const err = new Error(
      'Security verification could not be completed. Please refresh the page and try again.'
    );
    err.code = 'app-check';
    return err;
  }

  // Network / connectivity errors
  if (
    code.includes('unavailable') ||
    code.includes('network') ||
    code.includes('timeout') ||
    error?.name === 'TypeError' ||
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('failed to fetch') ||
    message.includes('offline') ||
    message.includes('timeout')
  ) {
    const err = new Error(
      'Unable to connect to the assistant. Please check your internet connection and try again.'
    );
    err.code = 'network';
    return err;
  }

  // Default unknown error
  const err = new Error(
    'Something went wrong while generating an answer. Please try again in a moment.'
  );
  err.code = 'unknown';
  return err;
}

/**
 * Sends a question and cycle context to the Gemini model via Firebase AI Logic.
 * Never logs user questions, context, or AI responses to the console.
 *
 * @param {object} params
 * @param {string} params.question User prompt text
 * @param {object|string} [params.context] Sanitized cycle context (plain JSON text or object)
 * @param {Array} [params.history] Prior conversation history [{ role: 'user'|'model'|'assistant', parts|text }]
 * @returns {Promise<string>} Generated response text
 */
export async function askAssistant({ question, context, history } = {}) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw normalizeAIError(new Error('Question is required'));
  }

  try {
    const model = getGenerativeModel(ai, {
      model: AI_MODEL_NAME,
      systemInstruction: buildSystemPrompt(),
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    });

    let promptText = question.trim();
    if (context) {
      const contextString = typeof context === 'string' ? context : JSON.stringify(context, null, 2);
      promptText = `User cycle context:\n${contextString}\n\nUser question:\n${question.trim()}`;
    }

    let result;
    if (history && Array.isArray(history) && history.length > 0) {
      const formattedHistory = history.map((item) => ({
        role: item.role === 'assistant' ? 'model' : item.role,
        parts: Array.isArray(item.parts)
          ? item.parts
          : [{ text: item.text || item.content || (typeof item.parts === 'string' ? item.parts : '') }],
      }));
      const chat = model.startChat({ history: formattedHistory });
      result = await chat.sendMessage(promptText);
    } else {
      result = await model.generateContent(promptText);
    }

    let answer = '';
    if (result && result.response) {
      answer = typeof result.response.text === 'function' ? result.response.text() : result.response.text;
    } else if (result && typeof result.text === 'function') {
      answer = result.text();
    } else if (result && result.text) {
      answer = result.text;
    }

    return (answer || '').trim();
  } catch (err) {
    throw normalizeAIError(err);
  }
}
