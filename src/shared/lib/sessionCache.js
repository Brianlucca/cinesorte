import { pruneStaleLocalCacheVersions } from "./localCacheKeys";

const SESSION_MARKER = "cinesorte:session-cache-ready";
const CACHE_PREFIXES = [
  "cinesorte_dashboard_sections",
  "cinesorte_dashboard_because",
  "cinesorte_trending_",
  "cinesorte_interactions_v1",
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
    // O armazenamento pode estar indisponível em modos privados ou restritos.
  }
}

export function initializeSessionCache() {
  try {
    if (sessionStorage.getItem(SESSION_MARKER)) return;
    pruneStaleLocalCacheVersions();
    clearDisposableSessionCache();
    sessionStorage.setItem(SESSION_MARKER, String(Date.now()));
  } catch {
    pruneStaleLocalCacheVersions();
    clearDisposableSessionCache();
  }
}

export function endSessionCache() {
  pruneStaleLocalCacheVersions();
  clearDisposableSessionCache();
  try {
    sessionStorage.removeItem(SESSION_MARKER);
  } catch {
    // Encerrar a sessão não deve falhar por indisponibilidade do storage.
  }
}
