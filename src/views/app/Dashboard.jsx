import { useState } from 'react';
import { useDashboardLogic } from '../../hooks/useDashboardLogic';
import Hero from '../../components/dashboard/Hero';
import MovieRow from '../../components/dashboard/MovieRow';
import TrailerRow from '../../components/dashboard/TrailerRow';
import Modal from '../../components/ui/Modal';

export default function Dashboard() {
  const { data, loading } = useDashboardLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full max-w-full overflow-x-hidden">
        
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="text-white">Conteúdo do Modal</div>
        </Modal>

        <Hero item={data.featured} />

        <div className="space-y-4 relative z-20 -mt-20">
            
            {data.trendingDay && data.trendingDay.length > 0 && (
                <MovieRow title="Tendências de Hoje" items={data.trendingDay} />
            )}

            {data.trailers && data.trailers.length > 0 && (
                <TrailerRow title="Últimos Trailers" items={data.trailers} />
            )}

            {data.series && data.series.length > 0 && (
                <MovieRow title="Séries em Alta" items={data.series} />
            )}

            {data.animes && data.animes.length > 0 && (
                <MovieRow title="Lançamentos de Animes" items={data.animes} />
            )}

            {data.animations && data.animations.length > 0 && (
                <MovieRow title="Animações Populares" items={data.animations} />
            )}

            {data.trendingWeek && data.trendingWeek.length > 0 && (
                <MovieRow title="Top da Semana" items={data.trendingWeek} />
            )}

            {data.movies && data.movies.length > 0 && (
                <MovieRow title="Filmes Populares" items={data.movies} />
            )}
            
        </div>
    </div>
  );
}