import React from 'react';
import { Share2, TrendingUp, MapPin } from 'lucide-react';

const PersonHeader = ({ details }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: details.name,
        url: window.location.href,
      });
    }
  };

  const backdrop = details.profile_path 
    ? `https://image.tmdb.org/t/p/original${details.profile_path}`
    : null;

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] group overflow-hidden">
      <div className="absolute inset-0">
        {backdrop ? (
          <img
            src={backdrop}
            alt={details.name}
            className="w-full h-full object-cover object-top opacity-50 blur-sm scale-105 group-hover:scale-100 transition-transform duration-[20s]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
            <div className="flex gap-3 mb-4">
                <span className="bg-violet-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                    {details.known_for_department === 'Acting' ? 'Atuação' : details.known_for_department}
                </span>
                {details.deathday && (
                    <span className="bg-zinc-800/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-wider border border-white/5">
                        In Memoriam
                    </span>
                )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
                {details.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-zinc-300 font-medium">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                    <TrendingUp size={18} className="text-green-400" />
                    <span>Popularidade: <b className="text-white">{details.popularity?.toFixed(0)}</b></span>
                </div>
                {details.place_of_birth && (
                    <span className="hidden md:flex items-center gap-2 border-l border-white/20 pl-6">
                        <MapPin size={16} /> {details.place_of_birth}
                    </span>
                )}
            </div>
        </div>

        <div className="flex gap-4">
             <button
                onClick={handleShare}
                className="p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg"
                title="Compartilhar"
             >
                <Share2 size={24} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default PersonHeader;