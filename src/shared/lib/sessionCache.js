const SESSION_MARKER = "cinesorte:session-cache-ready";
const CACHE_PREFIXES = [
  "cinesorte_dashboard_sections",
  "cinesorte_trending_",
];

const isDisposableCacheKey = (key) =>
  CACHE_PREFIXES.some((prefix) => key.startsWith(prefix));

export function clearDisposableSessionCache() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter(Boolean);

    keys.forEach((key) => {
      if (isDisposableCacheKey(key)) localStorage.removeItem(key);
    });
  } catch {
  }
}

export function initializeSessionCache() {
  try {
    if (sessionStorage.getItem(SESSION_MARKER)) return;
    clearDisposableSessionCache();
    sessionStorage.setItem(SESSION_MARKER, String(Date.now()));
  } catch {
    clearDisposableSessionCache();
  }
}

export function endSessionCache() {
  clearDisposableSessionCache();
  try {
    sessionStorage.removeItem(SESSION_MARKER);
  } catch {
  }
}
