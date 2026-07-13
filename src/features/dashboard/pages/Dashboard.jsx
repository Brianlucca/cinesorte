import { useEffect, useMemo, useState } from "react";
import { useDashboardLogic } from "@features/dashboard/hooks/useDashboardLogic";
import api, { getFollowingFeed, getGlobalFeed, getSuggestions } from "@shared/api/api";
import Hero from "@features/dashboard/components/Hero";
import HomeExperience from "@features/dashboard/components/HomeExperience";
import MovieRow from "@features/dashboard/components/MovieRow";
import TrailerRow from "@features/dashboard/components/TrailerRow";
import ContinueWatching from "@features/dashboard/components/ContinueWatching";

const RowWrapper = ({ children }) => (
  <div className="relative z-20 hover:z-30 transition-all duration-300">
    {children}
  </div>
);

export default function Dashboard() {
  const { data, currentHero, loading } = useDashboardLogic();
  const [socialPreview, setSocialPreview] = useState({ items: [], suggestions: [] });
  const [userLists, setUserLists] = useState([]);

  const heroItems = useMemo(() => {
    const seen = new Set();
    const shuffle = (items) =>
      [...items].sort(() => Math.random() - 0.5);
    const sources = shuffle([
      data.recommendedMovies || [],
      data.trendingDay || [],
      [
        ...(data.recommendedSeries || []),
        ...(data.series || []),
      ],
      data.inTheaters || [],
      data.trailers || [],
    ]).map(shuffle);
    const selectedItems = [];
    const maxSourceLength = Math.max(0, ...sources.map((source) => source.length));

    for (let itemIndex = 0; itemIndex < maxSourceLength; itemIndex += 1) {
      for (const source of sources) {
        const item = source[itemIndex];
        if (!item?.id || !item.backdrop_path) continue;
        const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
        const key = `${mediaType}:${item.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        selectedItems.push(item);
        if (selectedItems.length === 5) return selectedItems;
      }
    }

    if (
      selectedItems.length < 5 &&
      currentHero?.id &&
      currentHero.backdrop_path
    ) {
      const mediaType = currentHero.media_type ||
        (currentHero.first_air_date ? "tv" : "movie");
      const key = `${mediaType}:${currentHero.id}`;
      if (!seen.has(key)) selectedItems.push(currentHero);
    }

    return selectedItems;
  }, [
    currentHero,
    data.inTheaters,
    data.recommendedMovies,
    data.recommendedSeries,
    data.series,
    data.trailers,
    data.trendingDay,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeExperience() {
      try {
        const [followingResult, globalResult, suggestionsResult, listsResult] = await Promise.allSettled([
          getFollowingFeed(),
          getGlobalFeed(),
          getSuggestions(),
          api.get("/users/lists/me"),
        ]);

        if (cancelled) return;

        const followingItems = followingResult.status === "fulfilled" && Array.isArray(followingResult.value?.items)
          ? followingResult.value.items
          : [];
        const globalItems = globalResult.status === "fulfilled" && Array.isArray(globalResult.value?.items)
          ? globalResult.value.items
          : [];
        const suggestions = suggestionsResult.status === "fulfilled" && Array.isArray(suggestionsResult.value)
          ? suggestionsResult.value
          : [];
        const lists = listsResult.status === "fulfilled" && Array.isArray(listsResult.value)
          ? listsResult.value
          : [];

        setSocialPreview({
          items: followingItems.length > 0 ? followingItems : globalItems,
          suggestions,
        });
        setUserLists(lists);
      } catch {
        if (!cancelled) {
          setSocialPreview({ items: [], suggestions: [] });
          setUserLists([]);
        }
      }
    }

    if (!loading) loadHomeExperience();

    return () => {
      cancelled = true;
    };
  }, [loading]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const sections = [
    { id: 'recommendedMovies', title: "Escolhidos para Você", type: 'movie', variant: 'spotlight' },
    { id: 'streaming', title: "Populares no Streaming", type: 'movie', variant: 'landscape' },
    { id: 'trendingDay', title: "Tendências de Hoje", type: 'movie', variant: 'poster' },
    { id: 'recommendedSeries', title: "Séries que Você Pode Gostar", type: 'movie', variant: 'spotlight' },
    { id: 'onTv', title: "Populares na TV", type: 'movie', variant: 'landscape' },
    { id: 'trailers', title: "Últimos Trailers", type: 'trailer' },
    { id: 'series', title: "Séries Populares", type: 'movie', variant: 'poster' },
    { id: 'animes', title: "Lançamentos de Animes", type: 'movie', variant: 'landscape' },
    { id: 'inTheaters', title: "Nos Cinemas", type: 'movie', variant: 'spotlight' },
    { id: 'movies', title: "Filmes Populares", type: 'movie', variant: 'poster' },
  ];

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full max-w-full overflow-x-hidden bg-zinc-950 animate-in fade-in duration-700">

      <Hero items={heroItems} />

      <div className="flex flex-col gap-3 md:gap-4 relative z-20 -mt-12 md:-mt-32 pt-20 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
        <ContinueWatching />
        {(data.trendingWeek || []).length > 0 && (
          <div className="space-y-1 md:space-y-2">
            <HomeExperience
              variant="top"
              data={data}
              socialItems={socialPreview.items}
              suggestions={socialPreview.suggestions}
              lists={userLists}
            />
          </div>
        )}

        <div className="space-y-1 md:space-y-2">
          <HomeExperience
            variant="library"
            data={data}
            socialItems={socialPreview.items}
            suggestions={socialPreview.suggestions}
            lists={userLists}
          />
        </div>

        {sections.map((section) => {
          const items = data[section.id];
          if (!items || items.length === 0) return null;

          return (
            <div key={section.id} className="space-y-1 md:space-y-2">
              <RowWrapper>
                {section.type === 'trailer' ? (
                  <TrailerRow title={section.title} items={items} />
                ) : (
                  <MovieRow title={section.title} items={items} variant={section.variant} />
                )}
              </RowWrapper>


              {section.id === "trendingDay" && (
                <HomeExperience
                  variant="community"
                  data={data}
                  socialItems={socialPreview.items}
                  suggestions={socialPreview.suggestions}
                  lists={userLists}
                />
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
