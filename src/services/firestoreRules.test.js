import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  evaluateFirestoreRule,
  validateFirestoreRulesText,
} from '../utils/rulesSimulator.js';

describe('Firestore Security Rules (Task 5.5)', () => {
  const alice = { uid: 'user_alice_123' };
  const bob = { uid: 'user_bob_456' };
  const unauth = null;

  describe('1. Owner Access to Own Document and Subcollections', () => {
    it('allows authenticated owner to read their own profile (/users/{userId})', () => {
      const res = evaluateFirestoreRule(`/users/${alice.uid}`, 'read', alice);
      expect(res.allowed).toBe(true);
    });

    it('allows authenticated owner to write to their own profile (/users/{userId})', () => {
      const res = evaluateFirestoreRule(`/users/${alice.uid}`, 'write', alice);
      expect(res.allowed).toBe(true);
    });

    it('allows authenticated owner to read/write periods subcollection (/users/{userId}/periods/{id})', () => {
      const readRes = evaluateFirestoreRule(
        `/users/${alice.uid}/periods/period_2026_01`,
        'read',
        alice
      );
      const writeRes = evaluateFirestoreRule(
        `/users/${alice.uid}/periods/period_2026_01`,
        'write',
        alice
      );

      expect(readRes.allowed).toBe(true);
      expect(writeRes.allowed).toBe(true);
    });

    it('allows authenticated owner to read/write dailyLogs subcollection (/users/{userId}/dailyLogs/{date})', () => {
      const readRes = evaluateFirestoreRule(
        `/users/${alice.uid}/dailyLogs/2026-11-06`,
        'read',
        alice
      );
      const writeRes = evaluateFirestoreRule(
        `/users/${alice.uid}/dailyLogs/2026-11-06`,
        'write',
        alice
      );

      expect(readRes.allowed).toBe(true);
      expect(writeRes.allowed).toBe(true);
    });
  });

  describe('2. Other Authenticated Users Blocked (Isolation)', () => {
    it('blocks Bob from reading Alice’s user profile', () => {
      const res = evaluateFirestoreRule(`/users/${alice.uid}`, 'read', bob);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Cross-user access denied');
    });

    it('blocks Bob from writing to Alice’s user profile', () => {
      const res = evaluateFirestoreRule(`/users/${alice.uid}`, 'write', bob);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Cross-user access denied');
    });

    it('blocks Bob from reading Alice’s period history', () => {
      const res = evaluateFirestoreRule(
        `/users/${alice.uid}/periods/period_2026_01`,
        'read',
        bob
      );
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Cross-user access denied');
    });

    it('blocks Bob from tampering with Alice’s daily logs', () => {
      const res = evaluateFirestoreRule(
        `/users/${alice.uid}/dailyLogs/2026-11-06`,
        'write',
        bob
      );
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Cross-user access denied');
    });
  });

  describe('3. Unauthenticated Access Blocked', () => {
    it('blocks unauthenticated visitor from reading any user profile', () => {
      const res = evaluateFirestoreRule(`/users/${alice.uid}`, 'read', unauth);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Unauthenticated access denied');
    });

    it('blocks unauthenticated visitor from writing any user profile', () => {
      const res = evaluateFirestoreRule(`/users/${alice.uid}`, 'write', unauth);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Unauthenticated access denied');
    });

    it('blocks unauthenticated visitor from accessing periods', () => {
      const res = evaluateFirestoreRule(
        `/users/${alice.uid}/periods/p1`,
        'read',
        unauth
      );
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Unauthenticated access denied');
    });

    it('blocks unauthenticated visitor from accessing daily logs', () => {
      const res = evaluateFirestoreRule(
        `/users/${alice.uid}/dailyLogs/2026-11-06`,
        'read',
        unauth
      );
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Unauthenticated access denied');
    });
  });

  describe('4. Default Deny on Non-User Collections', () => {
    it('blocks read and write on /admin collection', () => {
      const resAlice = evaluateFirestoreRule('/admin/config', 'read', alice);
      const resBob = evaluateFirestoreRule('/admin/config', 'write', bob);
      const resUnauth = evaluateFirestoreRule('/admin/config', 'read', unauth);

      expect(resAlice.allowed).toBe(false);
      expect(resBob.allowed).toBe(false);
      expect(resUnauth.allowed).toBe(false);
    });

    it('blocks read and write on arbitrary collections like /public or /settings', () => {
      const res = evaluateFirestoreRule('/public/data', 'read', alice);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Default deny');
    });
  });

  describe('5. Real firestore.rules File Integrity Validation', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    it('rules file exists and is non-empty', () => {
      expect(rulesContent).toBeDefined();
      expect(rulesContent.length).toBeGreaterThan(50);
    });

    it('passes all security best practice checks', () => {
      const validation = validateFirestoreRulesText(rulesContent);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('enforces strict uid matching for user documents and subcollections', () => {
      expect(rulesContent).toMatch(/request\.auth\s*!=\s*null/);
      expect(rulesContent).toMatch(/request\.auth\.uid\s*==\s*userId/);
    });

    it('contains explicit default-deny rule at the root', () => {
      expect(rulesContent).toMatch(/match\s*\/\{document=\*\*\s*\}\s*\{\s*allow\s+read,\s*write:\s*false;/);
    });
  });
});
