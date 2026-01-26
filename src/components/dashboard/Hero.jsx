import { Link } from 'react-router-dom';
import { Play, Info, Star, Calendar } from 'lucide-react';

export default function Hero({ item }) {
  if (!item) return null;

  return (
    <div className="relative w-full h-[85vh] mb-12 group">
      <div className="absolute inset-0">
        <img 
            src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`} 
            alt="Hero" 
            className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
      </div>

      <div className="absolute bottom-0 top-0 left-0 w-full flex flex-col justify-center px-6 md:px-12 pt-20 max-w-4xl z-20">
        <div className="mb-4">
            <span className="bg-violet-600/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-violet-500/30">
                Destaque
            </span>
        </div>

        <h1 className="text-4xl md:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
            {item.title || item.name}
        </h1>
        
        <div className="flex items-center gap-4 text-sm md:text-base font-medium text-zinc-200 mb-6">
            <span className="flex items-center gap-1 text-green-400 font-bold">
                <Star size={18} fill="currentColor" /> {Math.round(item.vote_average * 10)}% Relevância
            </span>
            <span className="flex items-center gap-1 border-l border-white/20 pl-4">
                <Calendar size={18} /> {(item.release_date || item.first_air_date)?.split('-')[0]}
            </span>
            <span className="border border-zinc-500 px-2 rounded text-xs bg-black/30">HD</span>
        </div>

        <p className="text-zinc-300 text-base md:text-lg line-clamp-3 mb-8 max-w-2xl drop-shadow-md leading-relaxed">
            {item.overview}
        </p>

        <div className="flex gap-4">
            <Link 
                to={`/app/${item.media_type || 'movie'}/${item.id}`}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
            >
                <Play fill="currentColor" size={20} /> Ver Detalhes
            </Link>
            <Link 
                to={`/app/${item.media_type || 'movie'}/${item.id}`}
                className="flex items-center gap-2 px-8 py-3 bg-zinc-600/80 text-white font-bold rounded hover:bg-zinc-600 transition-colors backdrop-blur-sm border border-white/10"
            >
                <Info size={20} /> Mais Informações
            </Link>
        </div>
      </div>
    </div>
  );
}