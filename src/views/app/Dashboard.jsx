import { useState, useMemo, useEffect } from "react";
import { useDashboardLogic } from "../../hooks/useDashboardLogic";
import Hero from "../../components/dashboard/Hero";
import MovieRow from "../../components/dashboard/MovieRow";
import TrailerRow from "../../components/dashboard/TrailerRow";

const RowWrapper = ({ children }) => (
  <div className="relative z-20 hover:z-30 transition-all duration-300">
    {children}
  </div>
);

export default function Dashboard() {
  const { data, currentHero, loading } = useDashboardLogic();
  const [heroIndex, setHeroIndex] = useState(0);

  const validHeroes = useMemo(() => {
    return [
      ...(data.recommendedMovies || []),
      ...(data.trendingDay || []),
    ].filter((i) => i.backdrop_path && !i.trailerKey).slice(0, 5);
  }, [data.recommendedMovies, data.trendingDay]);

  const activeHero = validHeroes[heroIndex] || currentHero;

  useEffect(() => {
    if (validHeroes.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % validHeroes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [validHeroes.length]);

  const heroItems = useMemo(() => {
    if (!activeHero && (!data?.trailers || data.trailers.length === 0)) return [];
    
    const validTrailers = (data?.trailers || [])
      .filter((t) => t && t.id !== activeHero?.id && (t.backdrop_path || t.trailerKey || t.key))
      .slice(0, 7);
      
    return [activeHero, ...validTrailers].filter(Boolean);
  }, [activeHero, data?.trailers]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const sections = [
    { id: 'recommendedMovies', title: "Escolhidos para Você", type: 'movie' },
    { id: 'streaming', title: "Populares no Streaming", type: 'movie' },
    { id: 'trendingDay', title: "Tendências de Hoje", type: 'movie' },
    { id: 'recommendedSeries', title: "Séries que Você Pode Gostar", type: 'movie' },
    { id: 'onTv', title: "Populares na TV", type: 'movie' },
    { id: 'trailers', title: "Últimos Trailers", type: 'trailer' },
    { id: 'series', title: "Séries Populares", type: 'movie' },
    { id: 'animes', title: "Lançamentos de Animes", type: 'movie' },
    { id: 'inTheaters', title: "Nos Cinemas", type: 'movie' },
    { id: 'trendingWeek', title: "Top da Semana", type: 'movie' },
    { id: 'movies', title: "Filmes Populares", type: 'movie' },
  ];

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full max-w-full overflow-x-hidden bg-zinc-950 animate-in fade-in duration-700">

      <Hero items={heroItems} />

      <div className="flex flex-col gap-12 relative z-20 -mt-12 md:-mt-32 pt-20 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
        {sections.map((section) => {
          const items = data[section.id];
          if (!items || items.length === 0) return null;

          return (
            <RowWrapper key={section.id}>
              {section.type === 'trailer' ? (
                <TrailerRow title={section.title} items={items} />
              ) : (
                <MovieRow title={section.title} items={items} />
              )}
            </RowWrapper>
          );
        })}
      </div>
    </div>
  );
}
