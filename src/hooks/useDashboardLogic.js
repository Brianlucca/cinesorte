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
} from "../services/api";

const CACHE_DAY_KEY = "cinesorte_trending_day";
const CACHE_WEEK_KEY = "cinesorte_trending_week";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

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

  const filterByPreferences = useCallback((items, userGenreCounts) => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];
    if (!userGenreCounts || Object.keys(userGenreCounts).length === 0) return [];

    const userGenreIds = Object.keys(userGenreCounts).map((id) => parseInt(id));

    const strictMatches = items.filter((item) => {
      if (!item.genre_ids) return false;
      return item.genre_ids.some((genreId) => userGenreIds.includes(genreId));
    });

    return strictMatches.sort((a, b) => {
      const aScore = (a.genre_ids || []).reduce(
        (acc, id) => acc + (userGenreCounts[id] || 0),
        0
      );
      const bScore = (b.genre_ids || []).reduce(
        (acc, id) => acc + (userGenreCounts[id] || 0),
        0
      );
      return bScore - aScore;
    });
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
        try {
          const userProfile = await getMe();
          userGenres = userProfile.genreCounts || {};
        } catch (e) {}

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
          } catch (e) {}
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
          } catch (e) {}
        }

        const [resDay, resWeek] = await Promise.all([
          dayData ? Promise.resolve({ results: dayData }) : getTrending("day"),
          weekData ? Promise.resolve({ results: weekData }) : getTrending("week"),
        ]);

        const finalDay = Array.isArray(resDay) ? resDay : resDay.results || [];
        const finalWeek = Array.isArray(resWeek) ? resWeek : resWeek.results || [];

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
        ]);

        if (!isMounted.current) return;

        const trailers = results[0].status === "fulfilled" ? results[0].value : [];
        const animes = results[1].status === "fulfilled" ? results[1].value : [];
        const animations = results[2].status === "fulfilled" ? results[2].value : [];
        const recMovies = results[3].status === "fulfilled" ? results[3].value : [];
        const recSeries = results[4].status === "fulfilled" ? results[4].value : [];
        const streaming = results[5].status === "fulfilled" ? results[5].value : [];
        const onTv = results[6].status === "fulfilled" ? results[6].value : [];
        const forRent = results[7].status === "fulfilled" ? results[7].value : [];
        const inTheaters = results[8].status === "fulfilled" ? results[8].value : [];

        const sortedDay = prioritizeContent(finalDay, userGenres);
        const sortedWeek = prioritizeContent(finalWeek, userGenres);

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

        let smartRecMovies = recMovies;
        let smartRecSeries = recSeries;

        if (recMovies.length === 0) {
            const allMovies = [...finalWeek, ...streaming, ...forRent, ...inTheaters]
                .filter(i => (i.media_type === 'movie' || !i.media_type));
            smartRecMovies = filterByPreferences(allMovies, userGenres);
        }

        if (recSeries.length === 0) {
            const allSeries = [...finalWeek, ...onTv]
                .filter(i => i.media_type === 'tv');
            smartRecSeries = filterByPreferences(allSeries, userGenres);
        }

        setData({
          trendingDay: sortedDay,
          trendingWeek: sortedWeek,
          movies: sortedWeek.filter((i) => i.media_type === "movie" || !i.media_type),
          series: sortedWeek.filter((i) => i.media_type === "tv"),
          trailers,
          animes,
          animations,
          recommendedMovies: smartRecMovies,
          recommendedSeries: smartRecSeries,
          streaming,
          onTv,
          forRent,
          inTheaters,
        });
      } catch (error) {
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted.current = false;
    };
  }, [prioritizeContent, filterByPreferences]);

  return { data, currentHero, loading };
}