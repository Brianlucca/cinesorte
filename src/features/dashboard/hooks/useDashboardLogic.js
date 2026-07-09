import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLatestTrailers,
  getAnimeReleases,
  getAnimations,
  getRecommendations,
  getMe,
  getTrending,
  getDiscover,
  getNowPlaying,
} from "@shared/api/api";

const CACHE_DAY_KEY = "cinesorte_trending_day";
const CACHE_WEEK_KEY = "cinesorte_trending_week";
const DASHBOARD_SECTIONS_CACHE_PREFIX = "cinesorte_dashboard_sections";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const DASHBOARD_SECTIONS_TTL = 6 * 60 * 60 * 1000;

function readCachedSections(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > DASHBOARD_SECTIONS_TTL) return null;
    if (!parsed.data || typeof parsed.data !== "object") return null;

    return parsed.data;
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
}

function writeCachedSections(cacheKey, payload) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: payload }));
  } catch {
    // Storage can be unavailable or full; the dashboard should still render.
  }
}

export function useDashboardLogic() {
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
    recommendedMovies: [],
    recommendedSeries: [],
    streaming: [],
    onTv: [],
    forRent: [],
    inTheaters: [],
  });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

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

  useEffect(() => {
    if (heroQueue.length === 0) return;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * heroQueue.length);
      setCurrentHero(heroQueue[randomIndex]);
    }, 300000);
    return () => clearInterval(interval);
  }, [heroQueue]);

  useEffect(() => {
    isMounted.current = true;
    async function loadContent() {
      setLoading(true);
      try {
        let userGenres = {};
        let topGenresIdsString = "";
        let dashboardCacheScope = "guest";
        
        try {
          const userProfile = await getMe();
          userGenres = userProfile.genreCounts || {};
          dashboardCacheScope = userProfile.username || userProfile.uid || "user";
          
          topGenresIdsString = getPreferredGenreString(userGenres);
        } catch {
          topGenresIdsString = "";
        }

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

        if (firstHeroPool.length > 0) {
          setHeroQueue(firstHeroPool);
          setCurrentHero(firstHeroPool[Math.floor(Math.random() * firstHeroPool.length)]);
        }

        setData((previous) => ({
          ...previous,
          trendingDay: sortedDay,
          trendingWeek: sortedWeek,
        }));
        if (isMounted.current) setLoading(false);

        const dashboardCacheKey = `${DASHBOARD_SECTIONS_CACHE_PREFIX}:${dashboardCacheScope}:${topGenresIdsString || "default"}`;
        const cachedSections = readCachedSections(dashboardCacheKey);
        if (cachedSections) {
          setData((previous) => ({
            ...previous,
            ...cachedSections,
            trendingDay: sortedDay,
            trendingWeek: sortedWeek,
          }));
          return;
        }

        const results = await Promise.allSettled([
          getLatestTrailers(),
          getAnimeReleases(),
          getAnimations(),
          getRecommendations("movie"),
          getRecommendations("tv"),
          getDiscover({ provider_id: "8|119|337", monetization_types: "flatrate" }),
          getDiscover({ media_type: "tv", sort_by: "popularity.desc" }),
          getDiscover({ monetization_types: "rent" }),
          getNowPlaying(),
          getDiscover({ with_genres: topGenresIdsString, sort_by: 'popularity.desc', 'vote_count.gte': 50 }),
          getDiscover({ media_type: "tv", with_genres: topGenresIdsString, sort_by: 'popularity.desc', 'vote_count.gte': 50 }),
          getDiscover({ media_type: "movie", sort_by: "popularity.desc", page: 2 }),
          getDiscover({ media_type: "tv", sort_by: "popularity.desc", page: 2 }),
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

        const potentialHeroes = [...recMovies, ...sortedDay].filter(
          (i) => i.backdrop_path && !i.trailerKey,
        );
        const validHeroes = potentialHeroes
          .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
          .slice(0, 20);

        if (validHeroes.length > 0) {
          setHeroQueue(validHeroes);
          setCurrentHero(validHeroes[Math.floor(Math.random() * validHeroes.length)]);
        } else {
          const fallback = [...sortedWeek].filter((i) => i.backdrop_path && !i.trailerKey).slice(0, 20);
          if (fallback.length > 0) {
            setHeroQueue(fallback);
            setCurrentHero(fallback[Math.floor(Math.random() * fallback.length)]);
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

        const recommendedMoviePool =
          excludeExisting(recMovies, blockedForRecommendedMovies).length > 0
            ? excludeExisting(recMovies, blockedForRecommendedMovies)
            : excludeExisting(fallbackGenreMovies, blockedForRecommendedMovies);

        const recommendedSeriesPool =
          excludeExisting(recSeries, blockedForRecommendedSeries).length > 0
            ? excludeExisting(recSeries, blockedForRecommendedSeries)
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
          recommendedMovies: smartRecMovies,
          recommendedSeries: smartRecSeries,
          streaming,
          onTv,
          forRent,
          inTheaters,
        };

        writeCachedSections(dashboardCacheKey, nextSections);
        setData({
          trendingDay: sortedDay,
          trendingWeek: sortedWeek,
          ...nextSections,
        });
      } catch {
        setHeroQueue([]);
        setCurrentHero(null);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted.current = false;
    };
  }, [buildCompleteSection, excludeExisting, getPreferredGenreString, prioritizeContent, uniqueById]);

  return { data, currentHero, loading };
}
