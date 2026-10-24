// localStorage helpers for the Playground tour "Don't show again" preference.
// Follows the codepulse: named-constant + try/catch convention to avoid throws in private-browsing mode.

const STORAGE_KEY = 'codepulse:playground-tour-dismissed';

/**
 * Returns whether the user has ever clicked "Don't show again".
 * Read failures (e.g. private-browsing mode) are treated as "not dismissed" so the tour auto-opens normally.
 */
export function getPlaygroundTourDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Records that the user clicked "Don't show again" so the tour will no longer auto-open.
 * Write failures are silently ignored (the tour still closes for this session).
 */
export function setPlaygroundTourDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Write failed (e.g. private-browsing mode) — ignore; the tour still closes this session
  }
}
