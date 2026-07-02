import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeasonDetails, getMovieDetails } from '../services/api';
import { useToast } from '../context/ToastContext';

export function useSeasonDetailsLogic() {
  const { id, seasonNumber } = useParams();
  const toast = useToast();

  const [seasonData, setSeasonData] = useState(null);
  const [tvShow, setTvShow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [season, show] = await Promise.all([
          getSeasonDetails(id, seasonNumber),
          getMovieDetails('tv', id),
        ]);
        setSeasonData(season);
        setTvShow(show);
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
  };
}
