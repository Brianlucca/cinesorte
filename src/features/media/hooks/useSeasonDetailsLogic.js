import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeasonDetails, getMovieDetails, getWatchProgress } from '@shared/api/api';
import { useToast } from '@shared/context/useToast';
import { useAuth } from '@shared/context/useAuth';

export function useSeasonDetailsLogic() {
  const { id, seasonNumber } = useParams();
  const toast = useToast();
  const { user } = useAuth();

  const [seasonData, setSeasonData] = useState(null);
  const [tvShow, setTvShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchProgress, setWatchProgress] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [season, show, progress] = await Promise.all([
          getSeasonDetails(id, seasonNumber),
          getMovieDetails('tv', id),
          user ? getWatchProgress().catch(() => []) : Promise.resolve([]),
        ]);
        setSeasonData(season);
        setTvShow(show);
        setWatchProgress(Array.isArray(progress) ? progress : []);
      } catch {
        toast.error('Erro', 'Não foi possível carregar os episódios.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, seasonNumber, toast, user]);

  return {
    seasonData,
    tvShow,
    loading,
    tvId: id,
    watchProgress,
  };
}
