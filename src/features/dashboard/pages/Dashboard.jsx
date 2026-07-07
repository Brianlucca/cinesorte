import { useMemo } from "react";
import { useDashboardLogic } from "@features/dashboard/hooks/useDashboardLogic";
import Hero from "@features/dashboard/components/Hero";
import MovieRow from "@features/dashboard/components/MovieRow";
import TrailerRow from "@features/dashboard/components/TrailerRow";

const RowWrapper = ({ children }) => (
  <div className="relative z-20 hover:z-30 transition-all duration-300">
    {children}
  </div>
);

export default function Dashboard() {
  const { data, currentHero, loading } = useDashboardLogic();

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
    { id: 'trendingWeek', title: "Top da Semana", type: 'movie', variant: 'landscape' },
    { id: 'movies', title: "Filmes Populares", type: 'movie', variant: 'poster' },
  ];

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full max-w-full overflow-x-hidden bg-zinc-950 animate-in fade-in duration-700">

      <Hero items={heroItems} />

      <div className="flex flex-col gap-6 md:gap-8 relative z-20 -mt-12 md:-mt-32 pt-20 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
        {sections.map((section) => {
          const items = data[section.id];
          if (!items || items.length === 0) return null;

          return (
            <RowWrapper key={section.id}>
              {section.type === 'trailer' ? (
                <TrailerRow title={section.title} items={items} />
              ) : (
                <MovieRow title={section.title} items={items} variant={section.variant} />
              )}
            </RowWrapper>
          );
        })}
      </div>
    </div>
  );
}
