import { Link } from 'react-router-dom';
import { Star, ChevronRight, Calendar } from 'lucide-react';

export default function SeasonInfo({ tvId, seasons }) {
  if (!seasons || seasons.length === 0) return null;

  return (
    <section className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-600 pl-4">Temporadas</h2>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {seasons.map((season) => (
                <Link 
                    key={season.id} 
                    to={`/app/tv/${tvId}/season/${season.season_number}`}
                    className="bg-zinc-900 p-4 rounded-xl border border-white/5 flex gap-4 hover:border-violet-500/50 hover:bg-zinc-800 transition-all group"
                >
                    <div className="w-16 h-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-lg relative">
                        {season.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w200${season.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">Sem Capa</div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                                {season.name}
                            </h3>
                            <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                            <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                                <Star size={12} fill="currentColor" /> 
                                {season.vote_average > 0 ? season.vote_average.toFixed(1) : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                {season.episode_count} Episódios
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={14}/>
                                {season.air_date?.split('-')[0] || "TBA"}
                            </span>
                        </div>
                        
                        {season.overview && (
                            <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                                {season.overview}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    </section>
  );
}