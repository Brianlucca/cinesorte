import { getMovieDetails } from "@shared/api/api";

const prefetchTimers = new Map();
let mediaDetailsPagePromise;

const getPrefetchKey = (type, id) => `${type}:${id}`;

const preloadMediaDetailsPage = () => {
  if (!mediaDetailsPagePromise) {
    mediaDetailsPagePromise = import(
      "@features/media/pages/MediaDetails"
    ).catch(() => {
      mediaDetailsPagePromise = null;
      return null;
    });
  }

  return mediaDetailsPagePromise;
};

export const cancelMovieDetailsPrefetch = (type, id) => {
  const key = getPrefetchKey(type, id);
  const timer = prefetchTimers.get(key);
  if (!timer) return;

  window.clearTimeout(timer);
  prefetchTimers.delete(key);
};

export const prefetchMovieDetails = (type, id) => {
  if (!id || !["movie", "tv"].includes(type)) {
    return Promise.resolve(null);
  }

  cancelMovieDetailsPrefetch(type, id);

  return Promise.all([
    getMovieDetails(type, id).catch(() => null),
    preloadMediaDetailsPage(),
  ]);
};

export const scheduleMovieDetailsPrefetch = (type, id, delay = 160) => {
  if (!id || !["movie", "tv"].includes(type)) return;

  const key = getPrefetchKey(type, id);
  if (prefetchTimers.has(key)) return;

  const timer = window.setTimeout(() => {
    prefetchTimers.delete(key);
    prefetchMovieDetails(type, id);
  }, delay);

  prefetchTimers.set(key, timer);
};
