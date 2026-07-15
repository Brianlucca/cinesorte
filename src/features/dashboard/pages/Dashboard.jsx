import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardLogic } from "@features/dashboard/hooks/useDashboardLogic";
import api, { getFollowingFeed, getGlobalFeed, getSuggestions } from "@shared/api/api";
import Hero, { HERO_SLIDE_DURATION } from "@features/dashboard/components/Hero";
import HomeExperience from "@features/dashboard/components/HomeExperience";
import MovieRow from "@features/dashboard/components/MovieRow";
import TrailerRow from "@features/dashboard/components/TrailerRow";
import ContinueWatching from "@features/dashboard/components/ContinueWatching";
import { useAuth } from "@shared/context/useAuth";

const HERO_SET_CACHE_PREFIX = "cinesorte_dashboard_hero_set_v2";
const HERO_SET_DURATION = 5 * 60 * 1000;

const readCachedHeroSet = (cacheKey) => {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (
      !cached ||
      !Array.isArray(cached.items) ||
      cached.items.length === 0 ||
      !Number.isFinite(cached.expiresAt) ||
      cached.expiresAt <= Date.now()
    ) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cached;
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
};

const writeCachedHeroSet = (
  cacheKey,
  items,
  expiresAt,
  activeIndex = 0,
  slideStartedAt = Date.now(),
) => {
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ items, expiresAt, activeIndex, slideStartedAt }),
    );
  } catch {
    // The hero can still work for the current visit when storage is unavailable.
  }
};

const resumeCachedHeroSet = (cacheKey) => {
  const cached = readCachedHeroSet(cacheKey);
  if (!cached) return null;

  const cachedIndex = Math.min(
    Math.max(Number(cached.activeIndex) || 0, 0),
    cached.items.length - 1,
  );
  const elapsed = Math.max(
    Date.now() - (Number(cached.slideStartedAt) || Date.now()),
    0,
  );
  const passedSlides = Math.floor(elapsed / HERO_SLIDE_DURATION);
  const resumedElapsed = elapsed % HERO_SLIDE_DURATION;

  return {
    items: cached.items,
    expiresAt: cached.expiresAt,
    index: (cachedIndex + passedSlides) % cached.items.length,
    elapsed: resumedElapsed,
    slideStartedAt: Date.now() - resumedElapsed,
  };
};

const RowWrapper = ({ children }) => (
  <div className="relative z-20 hover:z-30 transition-all duration-300">
    {children}
  </div>
);

const buildHeroItems = (data, currentHero, rotation = 0) => {
  const seen = new Set();
  const heroSeed = (Number(currentHero?.id) || 0) + rotation;
  const sources = [
    data.recommendedMovies || [],
    data.trendingDay || [],
    [...(data.recommendedSeries || []), ...(data.series || [])],
    data.inTheaters || [],
    data.trailers || [],
  ].map((source, sourceIndex) => {
    if (source.length < 2) return source;
    const offset = (heroSeed + sourceIndex) % source.length;
    return [...source.slice(offset), ...source.slice(0, offset)];
  });
  const selectedItems = [];
  const maxSourceLength = Math.max(0, ...sources.map((source) => source.length));

  if (currentHero?.id && currentHero.backdrop_path) {
    const mediaType = currentHero.media_type ||
      (currentHero.first_air_date ? "tv" : "movie");
    seen.add(`${mediaType}:${currentHero.id}`);
    selectedItems.push(currentHero);
  }

  const trailerItem = sources[4].find((candidate) => {
    if (!candidate?.id || !candidate.backdrop_path || !candidate.trailerKey) return false;
    const mediaType = candidate.media_type ||
      (candidate.first_air_date ? "tv" : "movie");
    return !seen.has(`${mediaType}:${candidate.id}`);
  });

  if (trailerItem) {
    const mediaType = trailerItem.media_type ||
      (trailerItem.first_air_date ? "tv" : "movie");
    seen.add(`${mediaType}:${trailerItem.id}`);
    selectedItems.push(trailerItem);
  }

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

  return selectedItems;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data, currentHero, loading, heroReady } = useDashboardLogic();
  const heroCacheScope = user?.username || user?.uid || "guest";
  const heroCacheKey = `${HERO_SET_CACHE_PREFIX}:${heroCacheScope}`;
  const initialHeroStateRef = useRef(undefined);

  if (initialHeroStateRef.current === undefined) {
    initialHeroStateRef.current = resumeCachedHeroSet(heroCacheKey);
  }

  const initialHeroState = initialHeroStateRef.current;
  const [heroItems, setHeroItems] = useState(initialHeroState?.items || []);
  const [heroExpiresAt, setHeroExpiresAt] = useState(
    initialHeroState?.expiresAt || null,
  );
  const [heroInitialPosition, setHeroInitialPosition] = useState({
    index: initialHeroState?.index || 0,
    elapsed: initialHeroState?.elapsed || 0,
  });
  const latestHeroDataRef = useRef(data);
  const latestCurrentHeroRef = useRef(currentHero);
  const heroInitializedRef = useRef(Boolean(initialHeroState));
  const heroRotationRef = useRef(0);
  const [socialPreview, setSocialPreview] = useState({ items: [], suggestions: [] });
  const [userLists, setUserLists] = useState([]);

  latestHeroDataRef.current = data;
  latestCurrentHeroRef.current = currentHero;

  useEffect(() => {
    if (!initialHeroState) return;

    writeCachedHeroSet(
      heroCacheKey,
      initialHeroState.items,
      initialHeroState.expiresAt,
      initialHeroState.index,
      initialHeroState.slideStartedAt,
    );
  }, [heroCacheKey, initialHeroState]);

  useEffect(() => {
    if (loading || !heroReady || !currentHero?.id || heroInitializedRef.current) return;

    heroInitializedRef.current = true;
    const cachedHeroSet = readCachedHeroSet(heroCacheKey);

    if (cachedHeroSet) {
      const resumedHeroSet = resumeCachedHeroSet(heroCacheKey);

      setHeroItems(resumedHeroSet.items);
      setHeroExpiresAt(resumedHeroSet.expiresAt);
      setHeroInitialPosition({
        index: resumedHeroSet.index,
        elapsed: resumedHeroSet.elapsed,
      });
      writeCachedHeroSet(
        heroCacheKey,
        resumedHeroSet.items,
        resumedHeroSet.expiresAt,
        resumedHeroSet.index,
        resumedHeroSet.slideStartedAt,
      );
      return;
    }

    const nextItems = buildHeroItems(latestHeroDataRef.current, currentHero);
    const nextExpiresAt = Date.now() + HERO_SET_DURATION;
    setHeroItems(nextItems);
    setHeroExpiresAt(nextExpiresAt);
    setHeroInitialPosition({ index: 0, elapsed: 0 });
    writeCachedHeroSet(heroCacheKey, nextItems, nextExpiresAt, 0, Date.now());
  }, [currentHero, heroCacheKey, heroReady, loading]);

  useEffect(() => {
    if (!heroExpiresAt) return undefined;

    const timeout = window.setTimeout(() => {
      if (!heroInitializedRef.current || !latestCurrentHeroRef.current?.id) {
        return;
      }

      heroRotationRef.current += 1;
      const nextItems = buildHeroItems(
        latestHeroDataRef.current,
        latestCurrentHeroRef.current,
        heroRotationRef.current,
      );
      const nextExpiresAt = Date.now() + HERO_SET_DURATION;

      setHeroItems(nextItems);
      setHeroExpiresAt(nextExpiresAt);
      setHeroInitialPosition({ index: 0, elapsed: 0 });
      writeCachedHeroSet(heroCacheKey, nextItems, nextExpiresAt, 0, Date.now());
    }, Math.max(heroExpiresAt - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [heroCacheKey, heroExpiresAt]);

  const handleHeroSlideChange = useCallback((activeIndex) => {
    writeCachedHeroSet(
      heroCacheKey,
      heroItems,
      heroExpiresAt,
      activeIndex,
      Date.now(),
    );
  }, [heroCacheKey, heroExpiresAt, heroItems]);

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

  if (loading || heroItems.length === 0)
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

      <Hero
        key={heroExpiresAt || "hero-loading"}
        items={heroItems}
        initialIndex={heroInitialPosition.index}
        initialSlideElapsed={heroInitialPosition.elapsed}
        onSlideChange={handleHeroSlideChange}
      />

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
