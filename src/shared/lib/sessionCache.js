import { pruneStaleLocalCacheVersions } from "./localCacheKeys";

const SESSION_MARKER = "cinesorte:session-cache-ready";

export function initializeSessionCache() {
  try {
    pruneStaleLocalCacheVersions();
    if (!sessionStorage.getItem(SESSION_MARKER)) {
      sessionStorage.setItem(SESSION_MARKER, String(Date.now()));
    }
  } catch {
    pruneStaleLocalCacheVersions();
  }
}

export function endSessionCache() {
  pruneStaleLocalCacheVersions();
  try {
    sessionStorage.removeItem(SESSION_MARKER);
  } catch {
  }
}
