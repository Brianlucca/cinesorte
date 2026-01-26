import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export function useRouletteLogic() {
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  
  const timerRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await api.get('/tmdb/genres');
        setGenres(response.data);
      } catch (error) {
      }
    };
    fetchGenres();
  }, []);

  const fetchCandidates = async (type, page, genre) => {
    try {
      const params = {
        page: page,
        media_type: type,
        language: 'pt-BR' 
      };
      if (genre) params.with_genres = genre;

      const res = await api.get('/tmdb/discover', { params });
      return res.data || [];
    } catch (error) {
      return [];
    }
  };

  const spinRoulette = async () => {
    if (loading) return;
    
    setLoading(true);
    setWinner(null);
    setPreviewMedia(null);

    try {
      const primaryType = Math.random() > 0.5 ? 'movie' : 'tv';
      const randomPage = Math.floor(Math.random() * 10) + 1;

      const items = await fetchCandidates(primaryType, randomPage, selectedGenre);
      
      const validItems = items.filter(item => item.poster_path && item.backdrop_path && item.overview);

      if (validItems.length === 0) {
        throw new Error('Nenhum título encontrado com essas especificações.');
      }

      let currentIndex = 0;
      const totalSpins = 20; 
      const spinDuration = 3000; 
      const intervalTime = spinDuration / totalSpins;

      timerRef.current = setInterval(() => {
        setPreviewMedia(validItems[currentIndex % validItems.length]);
        currentIndex++;
      }, 100);

      await new Promise(resolve => setTimeout(resolve, spinDuration));

      clearInterval(timerRef.current);

      const finalWinner = validItems[Math.floor(Math.random() * validItems.length)];
      setPreviewMedia(finalWinner); 
      setWinner(finalWinner);
      
      setTimeout(() => {
          setIsModalOpen(true);
      }, 500);

    } catch (error) {
      toast.error('Erro na Roleta', 'Não conseguimos encontrar filmes para este filtro. Tente outro.');
      clearInterval(timerRef.current);
      setPreviewMedia(null);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setWinner(null);
    setPreviewMedia(null);
  };

  return {
    state: {
      winner,
      loading,
      selectedGenre,
      isModalOpen,
      genres,
      previewMedia
    },
    actions: {
      setSelectedGenre,
      spinRoulette,
      closeModal
    }
  };
}