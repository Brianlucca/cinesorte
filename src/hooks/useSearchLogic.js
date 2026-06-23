import { useState, useEffect, useCallback } from "react";
import { getDiscover, getTmdbSearch, getTrending } from "../services/api";

const POPULAR_PERSON_QUERIES = [
  "Michael B. Jordan",
  "Timothée Chalamet",
  "Zendaya",
  "Leonardo DiCaprio",
  "Pedro Pascal",
  "Ana de Armas",
  "Margot Robbie",
  "Matthew McConaughey",
  "Anne Hathaway",
  "Sean Penn",
];

const normalizeResults = (rawList, options = {}) => {
  const { includeKnownFor = true } = options;
  const processedResults = [];
  const seenIds = new Set();

  rawList.forEach((item) => {
    if (!item || seenIds.has(item.id)) return;

    if (item.poster_path || item.profile_path) {
      processedResults.push(item);
      seenIds.add(item.id);
    }

    if (
      includeKnownFor &&
      item.media_type === "person" &&
      Array.isArray(item.known_for)
    ) {
      item.known_for.forEach((work) => {
        if (!work?.id || seenIds.has(work.id) || !work.poster_path) return;

        processedResults.push({
          ...work,
          media_type: work.media_type || (work.title ? "movie" : "tv"),
        });
        seenIds.add(work.id);
      });
    }
  });

  return processedResults;
};

const searchPopularPeopleFallback = async () => {
  const searches = await Promise.allSettled(
    POPULAR_PERSON_QUERIES.map((name) => getTmdbSearch(name)),
  );

  const merged = searches.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const rawList = Array.isArray(result.value)
      ? result.value
      : result.value.results || [];

    return rawList.filter(
      (item) =>
        item?.media_type === "person" &&
        item.profile_path &&
        item.known_for_department === "Acting",
    );
  });

  return normalizeResults(merged, { includeKnownFor: false }).slice(0, 18);
};

export function useSearchLogic() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchQuery = useCallback(async (value) => {
    const data = await getTmdbSearch(value);
    const rawList = Array.isArray(data) ? data : data.results || [];
    return normalizeResults(rawList);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);

        try {
          const nextResults = await searchQuery(query);
          setResults(nextResults);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else if (query.trim().length === 0) {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchQuery]);

  const searchByGenre = useCallback(async (genreId) => {
    setLoading(true);
    setQuery("");

    try {
      const data = await getDiscover({
        with_genres: genreId,
        sort_by: "popularity.desc",
        "vote_count.gte": 80,
      });

      setResults(
        normalizeResults(Array.isArray(data) ? data : [], {
          includeKnownFor: false,
        }),
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByCategory = useCallback(async (mediaType) => {
    setLoading(true);
    setQuery("");

    try {
      if (mediaType === "movie" || mediaType === "tv") {
        const data = await getDiscover({
          media_type: mediaType,
          sort_by: "popularity.desc",
          "vote_count.gte": 120,
        });

        setResults(
          normalizeResults(Array.isArray(data) ? data : [], {
            includeKnownFor: false,
          }),
        );
        return;
      }

      if (mediaType === "person") {
        const data = await getTrending("week");
        const rawList = Array.isArray(data) ? data : data.results || [];
        const peopleOnly = rawList.filter(
          (item) =>
            (item?.media_type === "person" || item?.known_for_department === "Acting") &&
            item.profile_path,
        );

        if (peopleOnly.length > 0) {
          setResults(normalizeResults(peopleOnly, { includeKnownFor: false }));
          return;
        }

        const fallbackPeople = await searchPopularPeopleFallback();
        setResults(fallbackPeople);
        return;
      }

      setResults([]);
    } catch {
      if (mediaType === "person") {
        try {
          const fallbackPeople = await searchPopularPeopleFallback();
          setResults(fallbackPeople);
        } catch {
          setResults([]);
        }
      } else {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    clearSearch,
    searchByGenre,
    searchByCategory,
  };
}
