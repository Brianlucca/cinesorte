import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useRouletteLogic() {
  const { user } = useAuth();
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [source, setSource] = useState('global');
  const [userLists, setUserLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('all');
  
  const timerRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresRes, listsRes] = await Promise.allSettled([
          api.get('/tmdb/genres'),
          user?.username ? api.get(`/users/lists/${user.username}`) : Promise.resolve([])
        ]);
        
        let genresData = [];
        if (genresRes.status === 'fulfilled') {
          genresData = Array.isArray(genresRes.value) ? genresRes.value : (genresRes.value?.genres || []);
        }

        const popularIds = [28, 35, 27, 878, 10749, 16, 12, 53, 18, 99];
        setGenres(genresData.filter(g => popularIds.includes(g.id)));
        
        if (listsRes.status === 'fulfilled') {
          setUserLists(Array.isArray(listsRes.value) ? listsRes.value : []);
        }
      } catch {
        setGenres([]);
        setUserLists([]);
      }
    };
    fetchData();
  }, [user]);

  const spinRoulette = async () => {
    if (loading) return;
    setLoading(true);
    setWinner(null);

    try {
      let validItems = [];

      if (source === 'global') {
        const type = Math.random() > 0.5 ? 'movie' : 'tv';
        const maxPage = selectedGenre ? 4 : 20;
        
        const pagesToFetch = [
          Math.floor(Math.random() * maxPage) + 1,
          Math.floor(Math.random() * maxPage) + 1,
          Math.floor(Math.random() * maxPage) + 1
        ];

        const requests = pagesToFetch.map(p => {
          const params = { page: p, media_type: type, language: 'pt-BR', "vote_average.gte": 6 };
          if (selectedGenre) params.with_genres = selectedGenre;
          return api.get('/tmdb/discover', { params });
        });

        const responses = await Promise.allSettled(requests);
        let combinedResults = [];
        
        responses.forEach(res => {
          if (res.status === 'fulfilled') {
            const data = Array.isArray(res.value) ? res.value : (res.value?.results || []);
            combinedResults = [...combinedResults, ...data];
          }
        });

        validItems = combinedResults.filter(item => item && item.poster_path && (item.title || item.name));
        validItems = Array.from(new Map(validItems.map(item => [item.id, item])).values());

      } else {
        let pool = [];
        if (selectedListId === 'all') {
          pool = userLists.flatMap(list => list.items || []);
        } else {
          const targetList = userLists.find(l => l.id === selectedListId);
          pool = targetList?.items || [];
        }

        if (selectedGenre) {
          pool = pool.filter(item => {
            const itemGenres = item.genre_ids || item.genres?.map(g => g.id) || [];
            return itemGenres.includes(Number(selectedGenre));
          });
        }
        validItems = pool.filter(item => item && item.poster_path && (item.title || item.name));
      }

      if (validItems.length === 0) {
        throw new Error('Nenhum título encontrado com estes filtros.');
      }

      validItems = validItems.sort(() => Math.random() - 0.5);

      let currentIndex = 0;
      timerRef.current = setInterval(() => {
        setPreviewMedia(validItems[currentIndex % validItems.length]);
        currentIndex++;
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 2500));

      clearInterval(timerRef.current);

      const finalWinner = validItems[Math.floor(Math.random() * validItems.length)];
      setPreviewMedia(finalWinner);
      setWinner(finalWinner);
      
      setTimeout(() => setIsModalOpen(true), 400);

    } catch (error) {
      clearInterval(timerRef.current);
      toast.error('Roleta', error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { winner, loading, selectedGenre, isModalOpen, genres, previewMedia, source, userLists, selectedListId },
    actions: { setSelectedGenre, spinRoulette, closeModal: () => setIsModalOpen(false), setSource, setSelectedListId }
  };
}
