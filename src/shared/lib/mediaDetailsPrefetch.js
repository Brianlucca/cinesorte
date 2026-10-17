import { getMediaInteraction, getMediaReviews, getMovieDetails } from "@shared/api/api";
import { getInteractionScope, readInteraction, writeInteraction } from "@shared/lib/interactionCache";

const prefetchTimers = new Map();
const statePrefetchTimers = new Map();
const hotCards = new Set();
const preloadedBackdrops = new Set();
const railPositions = new WeakMap();
const railBursts = new WeakMap();
let mediaDetailsPagePromise;

const SCROLL_IDLE_MS = 220;
const POINTER_FRESH_MS = 600;
const RAIL_PRELOAD_LIMIT = 4;

let isScrolling = false;
let scrollIdleTimer = null;
let lastPointerMoveAt = 0;
let scrollBurst = 0;

const hasFreshPointer = () => performance.now() - lastPointerMoveAt < POINTER_FRESH_MS;

export const isPointerFresh = hasFreshPointer;

const isHorizontalRail = (element) =>
  element.clientHeight > 0 && element.scrollWidth - element.clientWidth > 4;

const warmRailAhead = (rail, direction) => {
  const railRect = rail.getBoundingClientRect();
  const width = rail.clientWidth;
  const images = rail.querySelectorAll("img");
  let warmed = 0;

  for (let index = 0; index < images.length && warmed < RAIL_PRELOAD_LIMIT; index += 1) {
    const image = images[index];
    const rect = image.getBoundingClientRect();
    const start = rect.left - railRect.left;
    const end = rect.right - railRect.left;
    const upcoming =
      direction > 0 ? start >= width - 160 && start < width * 2 : end <= 160 && end > -width;

    if (!upcoming) continue;

    warmed += 1;

    if (image.complete && image.naturalWidth > 0) continue;

    const url = image.currentSrc || image.src;
    if (!url) continue;

    const preload = new Image();
    preload.decoding = "async";
    preload.src = url;
  }
};

const markScrolling = (event) => {
  isScrolling = true;

  const target = event?.target;

  if (target && target.nodeType === 1) {
    if (railBursts.get(target) !== scrollBurst) {
      railBursts.set(target, scrollBurst);

      if (isHorizontalRail(target)) {
        const previous = railPositions.get(target);
        const direction = previous === undefined || target.scrollLeft >= previous ? 1 : -1;
        warmRailAhead(target, direction);
      }
    }

    railPositions.set(target, target.scrollLeft);
  }

  window.clearTimeout(scrollIdleTimer);
  scrollIdleTimer = window.setTimeout(() => {
    isScrolling = false;
    scrollBurst += 1;
  }, SCROLL_IDLE_MS);
};

if (typeof window !== "undefined") {
  window.addEventListener("scroll", markScrolling, {
    passive: true,
    capture: true,
  });

  window.addEventListener(
    "pointermove",
    () => {
      lastPointerMoveAt = performance.now();
    },
    { passive: true, capture: true },
  );
}

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

const preloadBackdrop = (key, backdropPath) => {
  if (!backdropPath || !hotCards.has(key)) return;
  if (preloadedBackdrops.has(backdropPath)) return;

  preloadedBackdrops.add(backdropPath);
  const image = new Image();
  image.decoding = "async";
  image.src = `https://image.tmdb.org/t/p/original${backdropPath}`;
};

export const cancelMovieDetailsPrefetch = (type, id) => {
  const key = getPrefetchKey(type, id);
  hotCards.delete(key);

  const stateTimer = statePrefetchTimers.get(key);
  if (stateTimer) {
    window.clearTimeout(stateTimer);
    statePrefetchTimers.delete(key);
  }

  const timer = prefetchTimers.get(key);
  if (!timer) return;

  window.clearTimeout(timer);
  prefetchTimers.delete(key);
};

export const prefetchMediaState = (type, id) => {
  if (!id || !["movie", "tv"].includes(type)) return Promise.resolve(null);

  const tasks = [getMediaReviews(id).catch(() => null)];
  const scope = getInteractionScope();

  if (scope) {
    tasks.push(
      getMediaInteraction(id)
        .then((state) => {
          if (!readInteraction(scope, type, id)) {
            writeInteraction(scope, type, id, state);
          }
          return state;
        })
        .catch(() => null),
    );
  }

  return Promise.all(tasks);
};

export const prefetchMovieDetails = (type, id) => {
  if (!id || !["movie", "tv"].includes(type)) {
    return Promise.resolve(null);
  }

  const key = getPrefetchKey(type, id);
  hotCards.add(key);

  const pendingTimer = prefetchTimers.get(key);
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
    prefetchTimers.delete(key);
  }

  return Promise.all([
    getMovieDetails(type, id)
      .then((data) => {
        preloadBackdrop(key, data?.backdrop_path);
        return data;
      })
      .catch(() => null),
    preloadMediaDetailsPage(),
  ]);
};

export const scheduleMovieDetailsPrefetch = (type, id, delay = 160) => {
  if (!id || !["movie", "tv"].includes(type)) return;
  if (isScrolling) return;

  const key = getPrefetchKey(type, id);
  hotCards.add(key);

  if (!prefetchTimers.has(key)) {
    const timer = window.setTimeout(() => {
      prefetchTimers.delete(key);
      if (!hasFreshPointer()) return;
      prefetchMovieDetails(type, id);
    }, delay);

    prefetchTimers.set(key, timer);
  }

  if (!statePrefetchTimers.has(key)) {
    const stateTimer = window.setTimeout(() => {
      statePrefetchTimers.delete(key);
      if (!hasFreshPointer()) return;
      prefetchMediaState(type, id);
    }, Math.max(delay, 450));

    statePrefetchTimers.set(key, stateTimer);
  }
};

export const mediaPrefetchHandlers = (type, id) => {
  const mediaType = type === "tv" ? "tv" : type === "movie" ? "movie" : null;
  const mediaId = String(id ?? "").replace(/^(movie-|tv-)/, "");

  if (!mediaType || !mediaId) return {};

  return {
    onMouseEnter: () => scheduleMovieDetailsPrefetch(mediaType, mediaId),
    onMouseLeave: () => cancelMovieDetailsPrefetch(mediaType, mediaId),
    onFocus: () => {
      prefetchMovieDetails(mediaType, mediaId);
      prefetchMediaState(mediaType, mediaId);
    },
    onPointerDown: () => {
      prefetchMovieDetails(mediaType, mediaId);
      prefetchMediaState(mediaType, mediaId);
    },
  };
};
