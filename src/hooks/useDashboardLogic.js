import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api, { getLatestTrailers, getAnimeReleases, getAnimations } from '../services/api';

const CACHE_DAY_KEY = 'cinesorte_trending_day';
const CACHE_WEEK_KEY = 'cinesorte_trending_week';
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function useDashboardLogic() {
  const [data, setData] = useState({
    featured: null,
    trendingDay: [],
    trendingWeek: [],
    movies: [],
    series: [],
    trailers: [],
    animes: [],
    animations: [],
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadContent() {
      try {
        const cachedDay = localStorage.getItem(CACHE_DAY_KEY);
        const cachedWeek = localStorage.getItem(CACHE_WEEK_KEY);
        
        let dayData = null;
        let weekData = null;

        if (cachedDay) {
          const parsed = JSON.parse(cachedDay);
          if (Date.now() - parsed.timestamp < ONE_DAY) {
            dayData = parsed.data;
          }
        }

        if (cachedWeek) {
          const parsed = JSON.parse(cachedWeek);
          if (Date.now() - parsed.timestamp < ONE_WEEK) {
            weekData = parsed.data;
          }
        }

        const [trailers, animes, animations] = await Promise.all([
            getLatestTrailers(),
            getAnimeReleases(),
            getAnimations()
        ]);

        if (!dayData) {
          const res = await api.get('/tmdb/trending/day');
          dayData = res.data || [];
          localStorage.setItem(CACHE_DAY_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: dayData
          }));
        }

        if (!weekData) {
          const res = await api.get('/tmdb/trending/week');
          weekData = res.data || [];
          localStorage.setItem(CACHE_WEEK_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: weekData
          }));
        }

        const featured = dayData.length > 0 
          ? dayData[Math.floor(Math.random() * Math.min(5, dayData.length))] 
          : null;

        setData({
          featured,
          trendingDay: dayData,
          trendingWeek: weekData,
          movies: weekData ? weekData.filter(i => i.media_type === 'movie') : [],
          series: weekData ? weekData.filter(i => i.media_type === 'tv') : [],
          trailers: trailers || [],
          animes: animes || [],
          animations: animations || []
        });

      } catch (error) {
        if (toast) {
            toast.error('Erro de Conexão', 'Não foi possível carregar o catálogo.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  return { data, loading };
}