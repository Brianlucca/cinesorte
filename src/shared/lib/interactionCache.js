import { INTERACTIONS_CACHE_PREFIX as CACHE_PREFIX } from "./localCacheKeys";

const MAX_ENTRIES = 400;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const cacheKey = (userScope) => `${CACHE_PREFIX}:${userScope}`;
const entryKey = (mediaType, mediaId) => `${mediaType}:${mediaId}`;

let activeScope = null;

export const setInteractionScope = (userScope) => {
  activeScope = userScope || null;
};

export const getInteractionScope = () => activeScope;

export const readCurrentInteraction = (mediaType, mediaId) =>
  readInteraction(activeScope, mediaType, mediaId);

export const writeCurrentInteraction = (mediaType, mediaId, state) =>
  writeInteraction(activeScope, mediaType, mediaId, state);

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
};

function readAll(userScope) {
  try {
    const raw = localStorage.getItem(cacheKey(userScope));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    safeRemove(cacheKey(userScope));
    return {};
  }
}

function normalize(state) {
  return {
    liked: state?.liked === true,
    watched: state?.watched === true,
  };
}

export function readInteraction(userScope, mediaType, mediaId) {
  if (!userScope || !mediaType || !mediaId) return null;

  const entry = readAll(userScope)[entryKey(mediaType, mediaId)];
  if (!entry || typeof entry !== "object") return null;
  if (Date.now() - Number(entry.timestamp || 0) > TTL_MS) return null;

  return normalize(entry);
}

export function writeInteraction(userScope, mediaType, mediaId, state) {
  if (!userScope || !mediaType || !mediaId) return;

  try {
    const all = readAll(userScope);
    all[entryKey(mediaType, mediaId)] = {
      ...normalize(state),
      timestamp: Date.now(),
    };

    const entries = Object.entries(all)
      .sort((a, b) => Number(b[1]?.timestamp || 0) - Number(a[1]?.timestamp || 0))
      .slice(0, MAX_ENTRIES);

    localStorage.setItem(cacheKey(userScope), JSON.stringify(Object.fromEntries(entries)));
  } catch {
    return;
  }
}
