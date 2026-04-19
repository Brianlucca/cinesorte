import { Link, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Calendar } from 'lucide-react';

export default function SeasonInfo({ tvId, seasons }) {
  const navigate = useNavigate();

  if (!seasons || seasons.length === 0) return null;

  return (
    <section className="mt-1">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>Temporadas</h2>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {seasons.map((season) => (
          <div
            key={season.id}
            onClick={() => navigate(`/app/tv/${tvId}/season/${season.season_number}`)}
            className="bg-zinc-900 p-4 rounded-xl border border-white/5 flex gap-4 hover:border-violet-500/50 hover:bg-zinc-800 transition-all group cursor-pointer"
          >
            <div className="w-16 h-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-lg relative">
              {season.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={season.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">Sem Capa</div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                  {season.name}
                </h3>
                <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors shrink-0" />
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                  <Star size={12} fill="currentColor" />
                  {season.vote_average > 0 ? season.vote_average.toFixed(1) : 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  {season.episode_count} Episodios
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {season.air_date?.split('-')[0] || 'TBA'}
                </span>
              </div>

              {season.overview && (
                <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {season.overview}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

