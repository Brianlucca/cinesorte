import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLatestTrailers,
  getAnimeReleases,
  getAnimations,
  getRecommendations,
  getTrending,
  getDiscover,
  getNowPlaying,
  getUserInteractions,
  getUserReviewsOnly,
  getUserLists,
  getMovieDetails,
} from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";
import {
  DASHBOARD_BECAUSE_CACHE_PREFIX,
  DASHBOARD_SECTIONS_CACHE_PREFIX,
} from "@shared/lib/localCacheKeys";

const CACHE_DAY_KEY = "cinesorte_trending_day";
const CACHE_WEEK_KEY = "cinesorte_trending_week";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const DASHBOARD_SECTIONS_TTL = 30 * 60 * 1000;
const DASHBOARD_BECAUSE_EMPTY_TTL = 3 * 60 * 1000;
const BECAUSE_SEED_ATTEMPTS = 3;

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const CACHED_SECTIONS_SHAPE = [
  "movies",
  "series",
  "trailers",
  "animes",
  "animations",
  "animeTrending",
  "recommendedMovies",
  "recommendedSeries",
  "streaming",
  "onTv",
  "forRent",
  "inTheaters",
]
  .slice()
  .sort()
  .join("|");

const CACHED_BECAUSE_SHAPE = ["becauseSeed", "becauseYouWatched"].sort().join("|");

const shapeOf = (payload) => Object.keys(payload || {}).sort().join("|");

function readCachedEntry(cacheKey, ttl = DASHBOARD_SECTIONS_TTL, expectedShape = null) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!Number.isFinite(parsed?.timestamp)) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    if (Date.now() - parsed.timestamp > ttl) return null;
    if (!parsed.data || typeof parsed.data !== "object") return null;
    if (expectedShape && parsed.shape !== expectedShape) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return { data: parsed.data, timestamp: parsed.timestamp };
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
}

function readCachedSections(cacheKey, ttl, expectedShape) {
  return readCachedEntry(cacheKey, ttl, expectedShape)?.data || null;
}

function removeCachedSections(cacheKey) {
  try {
    localStorage.removeItem(cacheKey);
  } catch {
    return;
  }
}

function writeCachedSections(cacheKey, payload) {
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), shape: shapeOf(payload), data: payload }),
    );
  } catch {
    // Storage can be unavailable or full; the dashboard should still render.
  }
}

const hasUsableSections = (sections) =>
  Boolean(sections) &&
  Object.values(sections).some(
    (value) => Array.isArray(value) && value.length > 0,
  );

const mergeSectionsKeepingContent = (previous, incoming) => {
  const merged = { ...previous };
  for (const [key, value] of Object.entries(incoming || {})) {
    const previousValue = previous?.[key];
    if (
      Array.isArray(value) &&
      value.length === 0 &&
      Array.isArray(previousValue) &&
      previousValue.length > 0
    ) {
      continue;
    }
    merged[key] = value;
  }
  return merged;
};

export function useDashboardLogic() {
  const { user, loading: authLoading } = useAuth();
  const [heroQueue, setHeroQueue] = useState([]);
  const [currentHero, setCurrentHero] = useState(null);
  const [data, setData] = useState({
    trendingDay: [],
    trendingWeek: [],
    movies: [],
    series: [],
    trailers: [],
    animes: [],
    animations: [],
    animeTrending: [],
    recommendedMovies: [],
    recommendedSeries: [],
    becauseYouWatched: [],
    becauseSeed: null,
    streaming: [],
    onTv: [],
    forRent: [],
    inTheaters: [],
  });
  const [loading, setLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const isMounted = useRef(true);
  const hasLoadedDashboard = useRef(false);
  const userGenreCountsKey = JSON.stringify(
    Object.entries(user?.genreCounts || {}).sort(([firstId], [secondId]) =>
      firstId.localeCompare(secondId),
    ),
  );

  const prioritizeContent = useCallback((items, userGenreCounts) => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];
    if (!userGenreCounts) return items;
    const topGenres = Object.entries(userGenreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => parseInt(id));
    return [...items].sort((a, b) => {
      const aScore = (a.genre_ids || []).reduce(
        (acc, id) => acc + (topGenres.includes(id) ? 1 : 0),
        0,
      );
      const bScore = (b.genre_ids || []).reduce(
        (acc, id) => acc + (topGenres.includes(id) ? 1 : 0),
        0,
      );
      return bScore - aScore;
    });
  }, []);

  const uniqueById = useCallback((items) => {
    const seen = new Set();
    return (items || []).filter((item) => {
      const key = `${item.media_type || (item.first_air_date ? "tv" : "movie")}:${item.id}`;
      if (!item?.id || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const excludeExisting = useCallback((items, blockedItems) => {
    const blocked = new Set(
      (blockedItems || [])
        .filter(Boolean)
        .map(
          (item) =>
            `${item.media_type || (item.first_air_date ? "tv" : "movie")}:${item.id}`,
        ),
    );

    return (items || []).filter((item) => {
      const key = `${item.media_type || (item.first_air_date ? "tv" : "movie")}:${item.id}`;
      return item?.id && !blocked.has(key);
    });
  }, []);

  const buildCompleteSection = useCallback(
    (items, blockedItems, minimumSize = 10) => {
      const uniqueItems = uniqueById(items);
      const preferredItems = excludeExisting(uniqueItems, blockedItems);

      if (preferredItems.length >= minimumSize) return preferredItems;

      const preferredKeys = new Set(
        preferredItems.map(
          (item) =>
            `${item.media_type || (item.first_air_date ? "tv" : "movie")}:${item.id}`,
        ),
      );
      const fallbackItems = uniqueItems.filter((item) => {
        const key = `${item.media_type || (item.first_air_date ? "tv" : "movie")}:${item.id}`;
        return !preferredKeys.has(key);
      });

      return [...preferredItems, ...fallbackItems];
    },
    [excludeExisting, uniqueById],
  );

  const getPreferredGenreString = useCallback((genreCounts) => {
    const positiveGenres = Object.entries(genreCounts || {})
      .filter(([, score]) => Number(score) > 0)
      .sort(([, a], [, b]) => b - a);

    const sortedGenres =
      positiveGenres.length > 0
        ? positiveGenres
        : Object.entries(genreCounts || {}).sort(([, a], [, b]) => b - a);

    if (sortedGenres.length === 0) return "";

    const topScore = Number(sortedGenres[0][1]) || 0;
    const animationEntry = sortedGenres.find(([id]) => id === "16");
    const strongAlternatives = sortedGenres.filter(
      ([id, score]) => id !== "16" && Number(score) >= topScore * 0.45,
    );

    let orderedGenres = sortedGenres;

    if (animationEntry && strongAlternatives.length >= 2) {
      orderedGenres = [
        ...strongAlternatives,
        ...sortedGenres.filter(
          ([id, score]) =>
            id !== "16" &&
            !strongAlternatives.some(([strongId]) => strongId === id) &&
            Number(score) > 0,
        ),
        animationEntry,
      ];
    }

    let dynamicLimit = Math.min(4, orderedGenres.length);
    const fourthScore = Number(orderedGenres[3]?.[1] || 0);
    const fifthScore = Number(orderedGenres[4]?.[1] || 0);
    const sixthScore = Number(orderedGenres[5]?.[1] || 0);

    if (
      orderedGenres.length >= 5 &&
      fourthScore > 0 &&
      fifthScore >= fourthScore * 0.88
    ) {
      dynamicLimit = 5;
    }

    if (
      orderedGenres.length >= 6 &&
      dynamicLimit === 5 &&
      fifthScore > 0 &&
      sixthScore >= fifthScore * 0.9
    ) {
      dynamicLimit = 6;
    }

    return orderedGenres
      .slice(0, dynamicLimit)
      .map(([id]) => id)
      .join("|");
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setReloadVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (heroQueue.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHero((previousHero) => {
        if (heroQueue.length === 1) return heroQueue[0];

        const availableHeroes = heroQueue.filter(
          (hero) => hero.id !== previousHero?.id,
        );
        const randomIndex = Math.floor(Math.random() * availableHeroes.length);
        return availableHeroes[randomIndex];
      });
    }, 300000);
    return () => clearInterval(interval);
  }, [heroQueue]);

  const userId = user?.uid || null;
  const userName = user?.username || null;
  const userScope = userName || userId || "guest";
  const genreCountsRef = useRef(userGenreCountsKey);
  genreCountsRef.current = userGenreCountsKey;

  useEffect(() => {
    if (authLoading) return undefined;
    const userGenres = Object.fromEntries(
      JSON.parse(genreCountsRef.current || "[]"),
    );
    const hasUser = Boolean(userId);
    const dashboardCacheScope = userScope;
    const topGenresIdsString = getPreferredGenreString(userGenres);
    isMounted.current = true;
    async function loadContent() {
      if (!hasLoadedDashboard.current) setLoading(true);
      try {

        const cachedDay = localStorage.getItem(CACHE_DAY_KEY);
        const cachedWeek = localStorage.getItem(CACHE_WEEK_KEY);
        let dayData = null,
          weekData = null;

        if (cachedDay) {
          try {
            const parsed = JSON.parse(cachedDay);
            if (
              Date.now() - parsed.timestamp < ONE_DAY &&
              Array.isArray(parsed.data) &&
              parsed.data.length > 0 &&
              parsed.data.some((i) => i.backdrop_path && !i.trailerKey)
            ) {
              dayData = parsed.data;
            }
          } catch {
            localStorage.removeItem(CACHE_DAY_KEY);
          }
        }
        if (cachedWeek) {
          try {
            const parsed = JSON.parse(cachedWeek);
            if (
              Date.now() - parsed.timestamp < ONE_WEEK &&
              Array.isArray(parsed.data) &&
              parsed.data.length > 0 &&
              parsed.data.some((i) => i.backdrop_path && !i.trailerKey)
            ) {
              weekData = parsed.data;
            }
          } catch {
            localStorage.removeItem(CACHE_WEEK_KEY);
          }
        }

        const [resDay, resWeek] = await Promise.all([
          dayData ? Promise.resolve({ results: dayData }) : getTrending("day"),
          weekData ? Promise.resolve({ results: weekData }) : getTrending("week"),
        ]);

        const finalDay = Array.isArray(resDay) ? resDay : resDay.results || [];
        const finalWeek = Array.isArray(resWeek) ? resWeek : resWeek.results || [];
        const sortedDay = uniqueById(prioritizeContent(finalDay, userGenres));
        const sortedWeek = uniqueById(prioritizeContent(finalWeek, userGenres));

        if (!dayData && finalDay.length > 0)
          localStorage.setItem(
            CACHE_DAY_KEY,
            JSON.stringify({ timestamp: Date.now(), data: finalDay }),
          );
        if (!weekData && finalWeek.length > 0)
          localStorage.setItem(
            CACHE_WEEK_KEY,
            JSON.stringify({ timestamp: Date.now(), data: finalWeek }),
          );

        const initialHeroes = sortedDay
          .filter((i) => i.backdrop_path && !i.trailerKey)
          .slice(0, 20);
        const fallbackHeroes = sortedWeek
          .filter((i) => i.backdrop_path && !i.trailerKey)
          .slice(0, 20);
        const firstHeroPool = initialHeroes.length > 0 ? initialHeroes : fallbackHeroes;

        if (firstHeroPool.length > 0 && !hasLoadedDashboard.current) {
          setHeroQueue(firstHeroPool);
          setCurrentHero(firstHeroPool[Math.floor(Math.random() * firstHeroPool.length)]);
        }

        setData((previous) => ({
          ...previous,
          trendingDay: sortedDay,
          trendingWeek: sortedWeek,
        }));
        setHeroReady(true);
        if (isMounted.current) {
          hasLoadedDashboard.current = true;
          setLoading(false);
        }

        const dashboardCacheKey = `${DASHBOARD_SECTIONS_CACHE_PREFIX}:${dashboardCacheScope}:${topGenresIdsString || "default"}`;
        const cachedSections = readCachedSections(
          dashboardCacheKey,
          undefined,
          CACHED_SECTIONS_SHAPE,
        );
        if (hasUsableSections(cachedSections)) {
          setData((previous) => ({
            ...previous,
            ...cachedSections,
            trendingDay: sortedDay,
            trendingWeek: sortedWeek,
          }));
          setHeroReady(true);
          return;
        }

        if (isMounted.current) setSectionsLoading(true);

        const results = await Promise.allSettled([
          getLatestTrailers(),
          getAnimeReleases(),
          getAnimations(),
          hasUser ? getRecommendations("movie") : Promise.resolve([]),
          hasUser ? getRecommendations("tv") : Promise.resolve([]),
          getDiscover({ provider_id: "8|119|337", monetization_types: "flatrate" }),
          getDiscover({ media_type: "tv", sort_by: "popularity.desc" }),
          getDiscover({ monetization_types: "rent" }),
          getNowPlaying(),
          getDiscover({ with_genres: topGenresIdsString, sort_by: 'popularity.desc', 'vote_count.gte': 50 }),
          getDiscover({ media_type: "tv", with_genres: topGenresIdsString, sort_by: 'popularity.desc', 'vote_count.gte': 50 }),
          getDiscover({ media_type: "movie", sort_by: "popularity.desc", page: 2 }),
          getDiscover({ media_type: "tv", sort_by: "popularity.desc", page: 2 }),
          getDiscover({ media_type: "tv", with_genres: "16", provider_id: "283", sort_by: "popularity.desc" }),
        ]);

        if (!isMounted.current) return;

        const trailers = results[0].status === "fulfilled" ? results[0].value : [];
        const animes = uniqueById(results[1].status === "fulfilled" ? results[1].value : []);
        const animations = uniqueById(results[2].status === "fulfilled" ? results[2].value : []);
        const recMovies = uniqueById(results[3].status === "fulfilled" ? results[3].value : []);
        const recSeries = uniqueById(results[4].status === "fulfilled" ? results[4].value : []);
        const streaming = uniqueById(results[5].status === "fulfilled" ? results[5].value : []);
        const onTv = uniqueById(results[6].status === "fulfilled" ? results[6].value : []);
        const forRent = uniqueById(results[7].status === "fulfilled" ? results[7].value : []);
        const inTheaters = uniqueById(results[8].status === "fulfilled" ? results[8].value : []);
        const fallbackGenreMovies = uniqueById(results[9].status === "fulfilled" ? results[9].value : []);
        const fallbackGenreSeries = uniqueById(results[10].status === "fulfilled" ? results[10].value : []);
        const popularMovies = uniqueById(results[11].status === "fulfilled" ? results[11].value : []);
        const popularSeries = uniqueById(results[12].status === "fulfilled" ? results[12].value : []);
        const animeTrendingRaw = uniqueById(results[13].status === "fulfilled" ? results[13].value : []);
        const animeTrendingJapanese = animeTrendingRaw.filter(
          (item) => item.original_language === "ja",
        );
        const animeTrending =
          animeTrendingJapanese.length >= 8 ? animeTrendingJapanese : animeTrendingRaw;

        const potentialHeroes = [...recMovies, ...sortedDay].filter(
          (i) => i.backdrop_path && !i.trailerKey,
        );
        const validHeroes = potentialHeroes
          .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
          .slice(0, 20);

        if (validHeroes.length > 0) {
          setHeroQueue(validHeroes);
          setCurrentHero((previousHero) =>
            previousHero || validHeroes[Math.floor(Math.random() * validHeroes.length)],
          );
        } else {
          const fallback = [...sortedWeek].filter((i) => i.backdrop_path && !i.trailerKey).slice(0, 20);
          if (fallback.length > 0) {
            setHeroQueue(fallback);
            setCurrentHero((previousHero) =>
              previousHero || fallback[Math.floor(Math.random() * fallback.length)],
            );
          }
        }

        const blockedForRecommendedMovies = [
          ...sortedDay,
          ...sortedWeek,
          ...streaming,
          ...inTheaters,
        ];
        const blockedForRecommendedSeries = [
          ...sortedDay,
          ...sortedWeek,
          ...onTv,
        ];

        const personalizedMoviePool = excludeExisting(
          recMovies,
          blockedForRecommendedMovies,
        );
        const personalizedSeriesPool = excludeExisting(
          recSeries,
          blockedForRecommendedSeries,
        );
        const recommendedMoviePool = personalizedMoviePool.length > 0
          ? personalizedMoviePool
          : excludeExisting(fallbackGenreMovies, blockedForRecommendedMovies);
        const recommendedSeriesPool = personalizedSeriesPool.length > 0
          ? personalizedSeriesPool
          : excludeExisting(fallbackGenreSeries, blockedForRecommendedSeries);

        const smartRecMovies = recommendedMoviePool.slice(0, 20);
        const smartRecSeries = recommendedSeriesPool.slice(0, 20);

        const nextSections = {
          movies: buildCompleteSection(
            [
              ...popularMovies,
              ...fallbackGenreMovies,
              ...sortedWeek.filter((i) => i.media_type === "movie" || !i.media_type),
            ],
            [...smartRecMovies, ...streaming, ...inTheaters],
          ),
          series: buildCompleteSection(
            [
              ...popularSeries,
              ...fallbackGenreSeries,
              ...sortedWeek.filter((i) => i.media_type === "tv"),
            ],
            [...smartRecSeries, ...onTv],
          ),
          trailers,
          animes,
          animations,
          animeTrending,
          recommendedMovies: smartRecMovies,
          recommendedSeries: smartRecSeries,
          streaming,
          onTv,
          forRent,
          inTheaters,
        };

        if (hasUsableSections(nextSections)) {
          writeCachedSections(dashboardCacheKey, nextSections);
        }
        setData((previous) => ({
          ...mergeSectionsKeepingContent(previous, nextSections),
          trendingDay: sortedDay,
          trendingWeek: sortedWeek,
        }));
        setHeroReady(true);
      } catch {
        if (!hasLoadedDashboard.current) {
          setHeroQueue([]);
          setCurrentHero(null);
        }
        setHeroReady(true);
      } finally {
        if (isMounted.current) {
          hasLoadedDashboard.current = true;
          setLoading(false);
          setSectionsLoading(false);
        }
      }
    }
    loadContent();
    return () => {
      isMounted.current = false;
    };
  }, [authLoading, buildCompleteSection, excludeExisting, getPreferredGenreString, prioritizeContent, uniqueById, userId, userScope, reloadVersion]);

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;

    const clearBecause = () => {
      if (!active) return;
      setData((previous) => ({
        ...previous,
        becauseYouWatched: [],
        becauseSeed: null,
      }));
    };

    if (!userId) {
      clearBecause();
      return () => {
        active = false;
      };
    }

    const becauseCacheKey = `${DASHBOARD_BECAUSE_CACHE_PREFIX}:${userScope}`;
    const cachedBecause = readCachedEntry(
      becauseCacheKey,
      DASHBOARD_SECTIONS_TTL,
      CACHED_BECAUSE_SHAPE,
    );
    if (cachedBecause) {
      const cachedItems = Array.isArray(cachedBecause.data?.becauseYouWatched)
        ? cachedBecause.data.becauseYouWatched
        : [];
      const cacheIsUsable =
        cachedItems.length > 0 ||
        Date.now() - cachedBecause.timestamp <= DASHBOARD_BECAUSE_EMPTY_TTL;

      if (cacheIsUsable) {
        setData((previous) => ({
          ...previous,
          becauseYouWatched: cachedItems,
          becauseSeed: cachedBecause.data.becauseSeed || null,
        }));
        return () => {
          active = false;
        };
      }

      removeCachedSections(becauseCacheKey);
    }

    const toSeed = (rawId, mediaType, title) => {
      const id = String(rawId ?? "").replace(/^(movie-|tv-)/, "");
      if (!id || !title) return null;
      return {
        id,
        mediaType: mediaType === "tv" ? "tv" : "movie",
        title,
      };
    };

    // Datas de itens de lista podem chegar como Timestamp do Firestore.
    const savedAtMillis = (value) => {
      if (value && typeof value === "object" && typeof value._seconds === "number") {
        return value._seconds * 1000;
      }
      return toMillis(value);
    };

    const loadBecauseYouWatched = async () => {
      try {
        let failed = false;
        const candidates = [];
        const addCandidate = (seed) => {
          if (!seed || candidates.some((item) => item.id === seed.id)) return;
          candidates.push(seed);
        };
        const collectSeeds = (items, buildSeed) => {
          (items || [])
            .slice(0, BECAUSE_SEED_ATTEMPTS)
            .forEach((item) => addCandidate(buildSeed(item)));
        };

        // 1) Assistidos: interações salvas com `watched = true` (mais recentes primeiro).
        const interactions = await getUserInteractions().catch(() => {
          failed = true;
          return [];
        });
        if (Array.isArray(interactions)) {
          const watched = interactions
            .filter((item) => item?.mediaId && item.mediaTitle && item.watched)
            .sort(
              (first, second) =>
                toMillis(second.watchedAt || second.lastInteraction || second.timestamp) -
                toMillis(first.watchedAt || first.lastInteraction || first.timestamp),
            );
          collectSeeds(watched, (item) =>
            toSeed(item.mediaId, item.mediaType, item.mediaTitle),
          );
        }

        // 2) Reviews: avaliações escritas pelo usuário (mais recentes primeiro).
        if (candidates.length === 0 && userName) {
          const reviews = await getUserReviewsOnly(userName).catch(() => {
            failed = true;
            return null;
          });
          const reviewItems = Array.isArray(reviews?.items) ? reviews.items : [];
          collectSeeds(reviewItems, (item) =>
            toSeed(item.mediaId, item.mediaType, item.mediaTitle),
          );
        }

        // 3) Categorias salvas: itens das listas do usuário (mais recentes primeiro).
        if (candidates.length === 0) {
          const lists = await getUserLists("me").catch(() => {
            failed = true;
            return [];
          });
          if (Array.isArray(lists)) {
            const savedItems = lists
              .flatMap((list) => (Array.isArray(list?.items) ? [...list.items].reverse() : []))
              .filter((item) => item?.id && (item.title || item.name));
            savedItems.sort(
              (first, second) => savedAtMillis(second.addedAt) - savedAtMillis(first.addedAt),
            );
            collectSeeds(savedItems, (item) =>
              toSeed(item?.id, item?.media_type, item?.title || item?.name),
            );
          }
        }

        let seed = null;
        let items = [];
        for (const candidate of candidates) {
          if (!active) return;

          const details = await getMovieDetails(candidate.mediaType, candidate.id).catch(() => {
            failed = true;
            return null;
          });
          const pool = details?.recommendations?.results?.length
            ? details.recommendations.results
            : details?.similar?.results || [];
          const candidateItems = uniqueById(
            pool.map((item) => ({ ...item, media_type: candidate.mediaType })),
          )
            .filter(
              (item) =>
                String(item.id) !== String(candidate.id) &&
                (item.poster_path || item.backdrop_path),
            )
            .slice(0, 20);

          if (candidateItems.length > 0) {
            seed = candidate;
            items = candidateItems;
            break;
          }
        }

        if (!active) return;

        if (!seed) {
          if (failed) {
            removeCachedSections(becauseCacheKey);
          } else {
            writeCachedSections(becauseCacheKey, {
              becauseYouWatched: [],
              becauseSeed: null,
            });
          }
          return clearBecause();
        }

        writeCachedSections(becauseCacheKey, {
          becauseYouWatched: items,
          becauseSeed: seed,
        });
        setData((previous) => ({
          ...previous,
          becauseYouWatched: items,
          becauseSeed: seed,
        }));
      } catch {
        clearBecause();
      }
    };

    loadBecauseYouWatched();

    return () => {
      active = false;
    };
  }, [authLoading, uniqueById, userId, userName, userScope, reloadVersion]);

  return { data, currentHero, loading, heroReady, sectionsLoading, retry };
}
