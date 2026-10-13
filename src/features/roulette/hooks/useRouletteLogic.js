import { useEffect, useRef, useState } from 'react';
import api from '@shared/api/api';
import { useAuth } from '@shared/context/useAuth';
import { useToast } from '@shared/context/useToast';

export function useRouletteLogic() {
  const { user } = useAuth();
  const toast = useToast();
  const timerRef = useRef(null);

  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [source, setSource] = useState('global');
  const [userLists, setUserLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresRes, listsRes] = await Promise.allSettled([
          api.get('/tmdb/genres'),
          user?.username ? api.get(`/users/lists/${user.username}`) : Promise.resolve([]),
        ]);

        let genresData = [];
        if (genresRes.status === 'fulfilled') {
          genresData = Array.isArray(genresRes.value) ? genresRes.value : (genresRes.value?.genres || []);
        }

        const popularIds = [28, 35, 27, 878, 10749, 16, 12, 53, 18, 99];
        setGenres(genresData.filter((genre) => popularIds.includes(genre.id)));

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

  useEffect(() => () => clearInterval(timerRef.current), []);

  const spinRoulette = async () => {
    if (loading) return;

    setLoading(true);
    setWinner(null);

    try {
      let validItems = [];

      if (source === 'global') {
        const type = ['all', 'documentary', 'anime', 'animation'].includes(selectedMediaType)
          ? (Math.random() > 0.5 ? 'movie' : 'tv')
          : selectedMediaType;
        const requiredGenre = selectedMediaType === 'documentary'
          ? 99
          : ['anime', 'animation'].includes(selectedMediaType) ? 16
          : null;
        const genreFilter = [requiredGenre, selectedGenre].filter(Boolean).join(',');
        const maxPage = genreFilter ? 4 : 20;
        const pagesToFetch = [
          Math.floor(Math.random() * maxPage) + 1,
          Math.floor(Math.random() * maxPage) + 1,
          Math.floor(Math.random() * maxPage) + 1,
        ];

        const requests = pagesToFetch.map((page) => {
          const params = { page, media_type: type, language: 'pt-BR', 'vote_average.gte': 6 };
          if (genreFilter) params.with_genres = genreFilter;
          if (selectedMediaType === 'anime') params.with_original_language = 'ja';
          return api.get('/tmdb/discover', { params });
        });

        const responses = await Promise.allSettled(requests);
        let combinedResults = [];

        responses.forEach((response) => {
          if (response.status === 'fulfilled') {
            const data = Array.isArray(response.value) ? response.value : (response.value?.results || []);
            combinedResults = [...combinedResults, ...data];
          }
        });

        validItems = combinedResults.filter((item) => {
          if (!item?.poster_path || !(item.title || item.name)) return false;

          const itemGenres = (item.genre_ids || item.genres?.map((genre) => genre.id) || []).map(Number);
          if (selectedMediaType === 'documentary' && !itemGenres.includes(99)) return false;

          if (selectedMediaType === 'anime' || selectedMediaType === 'animation') {
            if (!itemGenres.includes(16)) return false;
            const originalLanguage = String(item.original_language || item.originalLanguage || '').toLowerCase();
            const originCountries = item.origin_country || item.originCountry || [];
            const isJapanese = originalLanguage === 'ja' || originCountries.includes('JP');
            if (selectedMediaType === 'anime' && !isJapanese) return false;
            if (selectedMediaType === 'animation' && isJapanese) return false;
          }

          return true;
        });
        validItems = Array.from(new Map(validItems.map((item) => [item.id, item])).values());
      } else {
        let pool = [];

        if (selectedListId === 'all') {
          pool = userLists.flatMap((list) => list.items || []);
        } else {
          const targetList = userLists.find((list) => list.id === selectedListId);
          pool = targetList?.items || [];
        }

        pool = pool.filter((item) => {
          const itemType = item.media_type || item.mediaType || (item.first_air_date || item.firstAirDate ? 'tv' : 'movie');
          if (selectedMediaType === 'movie' && itemType !== 'movie') return false;
          if (selectedMediaType === 'tv' && itemType !== 'tv') return false;

          const itemGenres = (item.genre_ids || item.genres?.map((genre) => genre.id) || []).map(Number);
          if (selectedMediaType === 'documentary' && !itemGenres.includes(99)) return false;
          if (selectedMediaType === 'anime' || selectedMediaType === 'animation') {
            if (!itemGenres.includes(16)) return false;
            const originalLanguage = String(item.original_language || item.originalLanguage || '').toLowerCase();
            const originCountries = item.origin_country || item.originCountry || [];
            const isJapanese = originalLanguage === 'ja' || originCountries.includes('JP');
            if (selectedMediaType === 'anime' && !isJapanese) return false;
            if (selectedMediaType === 'animation' && isJapanese) return false;
          }

          return true;
        });

        validItems = pool.filter((item) => item && item.poster_path && (item.title || item.name));
      }

      if (validItems.length === 0) {
        throw new Error('Nenhum título encontrado com estes filtros.');
      }

      validItems = validItems.sort(() => Math.random() - 0.5);

      let currentIndex = 0;
      timerRef.current = setInterval(() => {
        setPreviewMedia(validItems[currentIndex % validItems.length]);
        currentIndex += 1;
      }, 100);

      await new Promise((resolve) => {
        setTimeout(resolve, 2500);
      });

      clearInterval(timerRef.current);

      const finalWinner = validItems[Math.floor(Math.random() * validItems.length)];
      setPreviewMedia(finalWinner);
      setWinner(finalWinner);

    } catch (error) {
      clearInterval(timerRef.current);
      toast.error('Roleta', error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      winner,
      loading,
      selectedGenre,
      selectedMediaType,
      genres,
      previewMedia,
      source,
      userLists,
      selectedListId,
    },
    actions: {
      setSelectedGenre,
      setSelectedMediaType,
      spinRoulette,
      setSource: (nextSource) => {
        setSource(nextSource);
        if (nextSource === 'user') setSelectedGenre(null);
      },
      setSelectedListId,
    },
  };
}
