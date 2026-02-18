import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useSeasonDetailsLogic } from '../../hooks/useSeasonDetailsLogic';

export default function SeasonDetails() {
  const { seasonData, loading, tvId } = useSeasonDetailsLogic();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!seasonData) return <div className="text-center py-20 text-white">Temporada não encontrada.</div>;

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-8 pb-20 animate-in fade-in">
        
        <div className="flex items-center gap-4 mb-8">
            <Link 
                to={`/app/tv/${tvId}`} 
                className="p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors border border-white/5 text-zinc-400 hover:text-white"
            >
                <ArrowLeft size={24} />
            </Link>
            <div>
                <h1 className="text-3xl font-black text-white">{seasonData.name}</h1>
                <p className="text-zinc-400 text-lg">Lista de Episódios</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900 mb-6">
                        {seasonData.poster_path ? (
                            <img 
                                src={`https://image.tmdb.org/t/p/original${seasonData.poster_path}`} 
                                alt={seasonData.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">Sem Poster</div>
                        )}
                    </div>
                    
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-zinc-500 font-medium">Ano de Lançamento</span>
                            <span className="text-white font-bold">{seasonData.air_date?.split('-')[0]}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-zinc-500 font-medium">Total de Episódios</span>
                            <span className="text-white font-bold">{seasonData.episodes?.length}</span>
                        </div>
                        {seasonData.overview && (
                            <div className="pt-2">
                                <h3 className="text-white font-bold mb-2">Sinopse</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed text-justify">
                                    {seasonData.overview}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {seasonData.episodes?.map((episode) => (
                    <Link 
                        key={episode.id}
                        to={`/app/tv/${tvId}/season/${seasonData.season_number}/episode/${episode.episode_number}`}
                        className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row hover:border-violet-500/50 hover:bg-zinc-800/50 transition-all group"
                    >
                        <div className="w-full md:w-64 h-48 md:h-auto bg-zinc-800 shrink-0 relative overflow-hidden">
                            {episode.still_path ? (
                                <img 
                                    src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} 
                                    alt={episode.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-medium">Sem Imagem</div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold text-xs border border-white/10">
                                EP {episode.episode_number}
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                                    {episode.name}
                                </h3>
                                <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4 font-medium uppercase tracking-wide">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} /> {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}
                                </span>
                                {episode.runtime && (
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> {episode.runtime} min
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-yellow-500">
                                    <Star size={12} fill="currentColor" /> {episode.vote_average?.toFixed(1)}
                                </span>
                            </div>

                            <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">
                                {episode.overview || "Toque para ver detalhes completos..."}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
  );
}