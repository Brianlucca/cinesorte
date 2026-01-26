import { useState, useEffect } from 'react';
import { getTmdbSearch } from '../services/api';

export function useSearchLogic() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const data = await getTmdbSearch(query);
          const rawList = Array.isArray(data) ? data : (data.results || []);
          
          const processedResults = [];
          const seenIds = new Set();

          rawList.forEach(item => {
            if (!seenIds.has(item.id) && (item.poster_path || item.profile_path)) {
              processedResults.push(item);
              seenIds.add(item.id);
            }

            if (item.media_type === 'person' && item.known_for && Array.isArray(item.known_for)) {
              item.known_for.forEach(work => {
                if (!seenIds.has(work.id) && work.poster_path) {
                  const workWithDefaults = {
                    ...work,
                    media_type: work.media_type || (work.title ? 'movie' : 'tv')
                  };
                  processedResults.push(workWithDefaults);
                  seenIds.add(work.id);
                }
              });
            }
          });
          
          setResults(processedResults); 
        } catch (error) { 
          setResults([]);
        } finally { 
          setLoading(false); 
        }
      } else { 
        setResults([]); 
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return {
    query,
    setQuery,
    results,
    loading,
    clearSearch
  };
}