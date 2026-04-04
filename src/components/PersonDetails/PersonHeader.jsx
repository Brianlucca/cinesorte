import React from 'react';
import { Share2, TrendingUp, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PersonHeader = ({ details }) => {
  const toast = useToast();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/person/${details.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Copiado", "Link público copiado!");
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
            className="w-full h-full object-cover object-top transition-transform duration-[20s] group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1600px] mx-auto right-0">
        <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5 animate-in slide-in-from-bottom-2 fade-in duration-1000">
                <span className="bg-violet-600 px-4 py-1.5 rounded-md text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                    {details.known_for_department === 'Acting' ? 'Atuação' : details.known_for_department}
                </span>
                {details.deathday && (
                    <span className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg">
                        In Memoriam
                    </span>
                )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-1000">
                {details.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-zinc-200 font-medium text-sm md:text-base animate-in slide-in-from-bottom-6 fade-in duration-1000">
                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-md border border-green-500/20 font-bold">
                    <TrendingUp size={18} />
                    <span>Popularidade: {details.popularity?.toFixed(0)}</span>
                </div>
                {details.place_of_birth && (
                    <>
                        <div className="h-5 w-px bg-white/20 hidden md:block" />
                        <span className="hidden md:flex items-center gap-2">
                            <MapPin size={18} className="text-zinc-400" /> {details.place_of_birth}
                        </span>
                    </>
                )}
            </div>
        </div>

        <div className="flex gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000">
             <button
                onClick={handleShare}
                className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all shadow-lg"
                title="Copiar Link"
             >
                <Share2 size={24} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default PersonHeader;