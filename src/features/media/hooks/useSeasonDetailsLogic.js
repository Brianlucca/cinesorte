import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeasonDetails, getMovieDetails, getWatchProgress } from '@shared/api/api';
import { useToast } from '@shared/context/useToast';

export function useSeasonDetailsLogic() {
  const { id, seasonNumber } = useParams();
  const toast = useToast();

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
          getWatchProgress().catch(() => []),
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
  }, [id, seasonNumber, toast]);

  return {
    seasonData,
    tvShow,
    loading,
    tvId: id,
    watchProgress,
  };
}
