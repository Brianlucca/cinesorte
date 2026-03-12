import { useState, useEffect, useRef } from 'react';
import { getMyOscarVotes, getOscarResults, submitOscarVote, getTmdbSearch } from '../services/api';
import { oscarCategories } from '../data/oscarNominees';
import { useToast } from '../context/ToastContext';

export const useOscarsLogic = () => {
  const [categories, setCategories] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [selections, setSelections] = useState({});
  const [results, setResults] = useState({});
  const [winners, setWinners] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isResultsPhase, setIsResultsPhase] = useState(false);
  const { addToast } = useToast();
  
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchOscarData = async () => {
      try {
        setLoading(true);
        const [votesRes, resultsRes] = await Promise.all([
          getMyOscarVotes().catch(() => ({ data: {} })),
          getOscarResults().catch(() => ({ data: {} }))
        ]);
        
        if (!isMounted.current) return;

        setMyVotes(votesRes?.data || {});
        setSelections(votesRes?.data || {});
        
        setIsResultsPhase(resultsRes?.data?.isResultsPhase || false);
        setResults(resultsRes?.data?.counts || {});
        setWinners(resultsRes?.data?.winners || {});

        const CACHE_KEY = 'cinesorte_oscar_cache_v7';
        const localCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const loadedCategories = [];
        
        let loadedCount = 0;
        const totalNominees = oscarCategories.reduce((acc, cat) => acc + cat.nominees.length, 0);

        for (const category of oscarCategories) {
          if (!isMounted.current) break;
          const nomineesData = [];
          
          for (const nomineeObj of category.nominees) {
            if (!isMounted.current) break;
            
            const searchName = typeof nomineeObj === 'string' ? nomineeObj : nomineeObj.name;
            const contextText = typeof nomineeObj === 'string' ? null : nomineeObj.context;
            const isWinnerOfficial = typeof nomineeObj === 'string' ? false : !!nomineeObj.winnerOfficial;
            
            const cleanName = searchName.replace(/”|“|'/g, '').trim();
            const cacheId = `${category.type}_${cleanName}`;

            if (localCache[cacheId]) {
              const item = { ...localCache[cacheId] };
              if (contextText) item.context = contextText;
              item.winnerOfficial = isWinnerOfficial;
              nomineesData.push(item);
            } else {
              try {
                const searchRes = await getTmdbSearch(cleanName);
                const rawList = Array.isArray(searchRes) ? searchRes : (searchRes?.results || []);
                
                const filtered = rawList.filter(item => {
                  if (category.type === 'person') {
                    return item.media_type === 'person' || item.known_for_department;
                  }
                  return item.media_type === 'movie' || (!item.media_type && item.title);
                });

                let bestMatch = filtered.find(item => item.poster_path || item.profile_path) || filtered[0] || rawList[0];

                const itemData = bestMatch ? {
                  id: bestMatch.id,
                  title: bestMatch.title || bestMatch.name,
                  name: bestMatch.name || bestMatch.title,
                  poster_path: bestMatch.poster_path,
                  profile_path: bestMatch.profile_path,
                  backdrop_path: bestMatch.backdrop_path,
                  type: category.type,
                  originalName: cleanName
                } : { 
                  id: cleanName, title: cleanName, name: cleanName, type: category.type, originalName: cleanName 
                };

                localCache[cacheId] = itemData;
                localStorage.setItem(CACHE_KEY, JSON.stringify(localCache));

                const finalItem = { ...itemData };
                if (contextText) finalItem.context = contextText;
                finalItem.winnerOfficial = isWinnerOfficial;
                nomineesData.push(finalItem);

                await new Promise(resolve => setTimeout(resolve, 300));
              } catch (err) {
                const fallbackItem = { id: cleanName, title: cleanName, name: cleanName, type: category.type, originalName: cleanName };
                if (contextText) fallbackItem.context = contextText;
                fallbackItem.winnerOfficial = isWinnerOfficial;
                nomineesData.push(fallbackItem);
                
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
            }
            
            loadedCount++;
            setProgress(Math.round((loadedCount / totalNominees) * 100));
          }
          loadedCategories.push({ ...category, nomineesData });
          setCategories([...loadedCategories]);
        }
      } catch (error) {
        if (isMounted.current) addToast('Erro ao carregar dados.', 'error');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchOscarData();
  }, [addToast]);

  const handleSelect = (categoryId, nomineeId) => {
    if (isResultsPhase) return;
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeId }));
  };

  const handleConfirmVote = async (categoryId) => {
    if (isResultsPhase) return false;
    const nomineeId = selections[categoryId];
    if (!nomineeId) return false;
    if (myVotes[categoryId] === nomineeId) return true;

    try {
      await submitOscarVote({ categoryId, nomineeTmdbId: nomineeId });
      setMyVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
      addToast('Voto confirmado!', 'success');
      return true;
    } catch (error) {
      addToast('Erro ao votar.', 'error');
      return false;
    }
  };

  const retryFetchImages = () => {
    localStorage.removeItem('cinesorte_oscar_cache_v7');
    window.location.reload();
  };

  return { categories, myVotes, selections, results, winners, loading, progress, handleSelect, handleConfirmVote, isResultsPhase, retryFetchImages };
};