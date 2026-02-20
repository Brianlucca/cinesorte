import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Calendar } from 'lucide-react';

export default function Hero({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const item = items[currentIndex] || items[0];
  const videoKey = item.trailerKey || item.key;

  return (
    <div className="relative w-full h-[85vh] mb-12 group overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        {videoKey ? (
          <iframe
            key={videoKey}
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${videoKey}`}
            className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fade-in"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <img 
            key={item.id}
            src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`} 
            alt="Hero" 
            className="w-full h-full object-cover object-top animate-fade-in transition-opacity duration-1000"
          />
        )}
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
                <Star size={18} fill="currentColor" /> {Math.round((item.vote_average || 0) * 10)}% Relevância
            </span>
            <span className="flex items-center gap-1 border-l border-white/20 pl-4">
                <Calendar size={18} /> {(item.release_date || item.first_air_date || '')?.split('-')[0]}
            </span>
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
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-12 right-6 md:right-12 z-30 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-violet-600 scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}