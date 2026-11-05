/**
 * Firestore Rules Simulator
 *
 * Implements deterministic Firestore Security Rules matching and evaluation
 * for unit testing security policies (Task 5.5).
 */

/**
 * Evaluates whether an access request to a path is allowed under the rules.
 *
 * @param {string} path - Document path, e.g. "/users/alice" or "/users/alice/periods/p1"
 * @param {'read'|'write'} operation - The Firestore operation
 * @param {{ uid: string } | null} auth - Authenticated user context or null
 * @returns {{ allowed: boolean, reason: string }}
 */
export function evaluateFirestoreRule(path, operation, auth) {
  // Normalize path: strip leading/trailing slashes
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { allowed: false, reason: 'Root database access denied' };
  }

  // 1. Check if path starts with 'users'
  if (segments[0] === 'users') {
    if (segments.length === 1) {
      // Collection query on '/users' without document ID
      return { allowed: false, reason: 'Listing root users collection is not allowed' };
    }

    const userId = segments[1];

    // Check condition: request.auth != null && request.auth.uid == userId
    const isAuthenticated = auth !== null && auth !== undefined && Boolean(auth.uid);
    const isOwner = isAuthenticated && auth.uid === userId;

    if (!isAuthenticated) {
      return {
        allowed: false,
        reason: 'Unauthenticated access denied: request.auth is null',
      };
    }

    if (!isOwner) {
      return {
        allowed: false,
        reason: `Cross-user access denied: request.auth.uid (${auth.uid}) does not match userId (${userId})`,
      };
    }

    // Authenticated owner accessing /users/{userId} or any subcollection /users/{userId}/**
    return {
      allowed: true,
      reason: 'Access granted: authenticated owner matches userId',
    };
  }

  // 2. Default deny for all other collections
  return {
    allowed: false,
    reason: `Default deny: no rule allows access to collection "${segments[0]}"`,
  };
}

/**
 * Validates the raw firestore.rules file content against strict security best practices.
 *
 * @param {string} rulesText - Raw text of firestore.rules
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFirestoreRulesText(rulesText) {
  const errors = [];

  if (!rulesText.includes("rules_version = '2'")) {
    errors.push("Missing rules_version = '2'");
  }

  if (!rulesText.includes('service cloud.firestore')) {
    errors.push("Missing 'service cloud.firestore'");
  }

  if (rulesText.includes('allow read, write: if true;') || rulesText.includes('allow read: if true;') || rulesText.includes('allow write: if true;')) {
    errors.push('CRITICAL: Insecure open rule detected (allow ... if true)');
  }

  if (!rulesText.includes('request.auth != null')) {
    errors.push('Missing authentication check: request.auth != null');
  }

  if (!rulesText.includes('request.auth.uid == userId')) {
    errors.push('Missing owner isolation check: request.auth.uid == userId');
  }

  if (!rulesText.includes('allow read, write: false;')) {
    errors.push('Missing default deny rule: allow read, write: false;');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
