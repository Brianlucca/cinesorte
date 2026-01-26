import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeasonDetails } from '../services/api';
import { useToast } from '../context/ToastContext';

export function useSeasonDetailsLogic() {
  const { id, seasonNumber } = useParams();
  const toast = useToast();
  
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getSeasonDetails(id, seasonNumber);
        setSeasonData(data);
      } catch (error) {
        toast.error('Erro', 'Não foi possível carregar os episódios.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, seasonNumber]);

  return {
    seasonData,
    loading,
    tvId: id
  };
}