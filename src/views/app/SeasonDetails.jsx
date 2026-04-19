import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useSeasonDetailsLogic } from '../../hooks/useSeasonDetailsLogic';

export default function SeasonDetails() {
  const { seasonData, tvShow, loading, tvId } = useSeasonDetailsLogic();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!seasonData) return <div className="text-center py-20 text-white">Temporada não encontrada.</div>;

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-5 mb-10">
        <Link
          to={`/app/tv/${tvId}`}
          className="p-4 bg-white/[0.02] backdrop-blur-xl rounded-2xl hover:bg-white/[0.05] transition-all border border-white/5 text-zinc-400 hover:text-white shadow-lg"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {seasonData.name}
          </h1>
          <p className="text-violet-400 font-bold uppercase tracking-widest text-xs mt-1.5">
            Lista de Episódios
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-8">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900/50 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
              {seasonData.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${seasonData.poster_path}`}
                  alt={seasonData.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium">Sem Poster</div>
              )}
            </div>

            <div className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Série</span>
                <span className="text-white text-sm font-medium">{tvShow?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Ano de Lançamento</span>
                <span className="text-white text-sm font-medium">{seasonData.air_date?.split('-')[0] || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Total de Episódios</span>
                <span className="text-white text-sm font-medium">{seasonData.episodes?.length || 0}</span>
              </div>
              {seasonData.overview && (
                <div className="pt-2">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3 block">Sinopse</span>
                  <p className="text-zinc-300 text-sm font-light leading-relaxed text-justify">
                    {seasonData.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          {seasonData.episodes?.map((episode) => (
            <Link
              key={episode.id}
              to={`/app/tv/${tvId}/season/${seasonData.season_number}/episode/${episode.episode_number}`}
              className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 group shadow-lg"
            >
              <div className="w-full md:w-72 xl:w-80 h-56 md:h-auto bg-zinc-900/50 shrink-0 relative overflow-hidden">
                {episode.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                    alt={episode.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 font-medium bg-zinc-800/20">Sem Imagem</div>
                )}
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-xl text-white font-bold text-xs border border-white/10 shadow-lg">
                  EP {episode.episode_number}
                </div>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors pr-4">
                    {episode.name}
                  </h3>
                  <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors shrink-0 mt-1" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 mb-5 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-zinc-500" />
                    {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}
                  </span>
                  {episode.runtime && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-zinc-500" />
                      {episode.runtime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md">
                    <Star size={12} fill="currentColor" />
                    {episode.vote_average?.toFixed(1) || '0.0'}
                  </span>
                </div>

                <p className="text-zinc-300 text-sm font-light leading-relaxed line-clamp-3">
                  {episode.overview || 'Toque para ver detalhes completos sobre este episódio.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
