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

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full max-w-full overflow-x-hidden bg-zinc-950">

      <Hero items={heroItems} />

      <div className="flex flex-col gap-4 relative z-20 -mt-8 md:-mt-24 px-4 md:px-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-16">
        {data.recommendedMovies && data.recommendedMovies.length > 0 && (
          <RowWrapper>
            <MovieRow
              title="Escolhidos para Você"
              items={data.recommendedMovies}
            />
          </RowWrapper>
        )}

        {data.streaming && data.streaming.length > 0 && (
          <RowWrapper>
            <MovieRow title="Populares no Streaming" items={data.streaming} />
          </RowWrapper>
        )}

        {data.trendingDay && data.trendingDay.length > 0 && (
          <RowWrapper>
            <MovieRow title="Tendências de Hoje" items={data.trendingDay} />
          </RowWrapper>
        )}

        {data.recommendedSeries && data.recommendedSeries.length > 0 && (
          <RowWrapper>
            <MovieRow
              title="Séries que Você Pode Gostar"
              items={data.recommendedSeries}
            />
          </RowWrapper>
        )}

        {data.onTv && data.onTv.length > 0 && (
          <RowWrapper>
            <MovieRow title="Populares na TV" items={data.onTv} />
          </RowWrapper>
        )}

        {data.trailers && data.trailers.length > 0 && (
          <RowWrapper>
            <TrailerRow title="Últimos Trailers" items={data.trailers} />
          </RowWrapper>
        )}

        {data.series && data.series.length > 0 && (
          <RowWrapper>
            <MovieRow title="Séries Populares" items={data.series} />
          </RowWrapper>
        )}

        {data.animes && data.animes.length > 0 && (
          <RowWrapper>
            <MovieRow title="Lançamentos de Animes" items={data.animes} />
          </RowWrapper>
        )}

        {data.inTheaters && data.inTheaters.length > 0 && (
          <RowWrapper>
            <MovieRow title="Nos Cinemas" items={data.inTheaters} />
          </RowWrapper>
        )}

        {data.trendingWeek && data.trendingWeek.length > 0 && (
          <RowWrapper>
            <MovieRow title="Top da Semana" items={data.trendingWeek} />
          </RowWrapper>
        )}

        {data.movies && data.movies.length > 0 && (
          <RowWrapper>
            <MovieRow title="Filmes Populares" items={data.movies} />
          </RowWrapper>
        )}
      </div>
    </div>
  );
}