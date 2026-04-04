import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Volume2 } from 'lucide-react';
import TrailerModal from '../media/TrailerModal';

export default function TrailerRow({ title, items }) {
  const rowRef = useRef(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [hoveredTrailerId, setHoveredTrailerId] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const slide = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth * 0.8) : clientWidth * 0.8;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseEnter = (id) => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTrailerId(id);
    }, 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredTrailerId(null);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full group/row z-10">
        {selectedTrailer && createPortal(
            <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
                <TrailerModal 
                    isOpen={!!selectedTrailer} 
                    onClose={() => setSelectedTrailer(null)} 
                    videoKey={selectedTrailer} 
                />
            </div>,
            document.body
        )}

      <div className="flex justify-between items-center px-6 md:px-12 mb-0">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
            {title}
          </h2>

          <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => slide('left')} 
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all shadow-lg"
              >
                  <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => slide('right')} 
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all shadow-lg"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      </div>
      
      <div 
        ref={rowRef} 
        className="flex gap-5 overflow-x-auto scroll-smooth pt-6 pb-8 px-6 md:px-12 scrollbar-hide w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => {
            const isHovering = hoveredTrailerId === item.id;

            return (
                <div 
                    key={`${item.id}-trailer-${index}`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setSelectedTrailer(item.trailerKey)}
                    className="flex-none w-[320px] md:w-[480px] group/card cursor-pointer relative transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="aspect-video rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 relative shadow-2xl group-hover/card:border-red-500/50 transition-all duration-300 group-hover/card:shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
                        
                        <img 
                            src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`} 
                            alt={item.title || item.name} 
                            className={`w-full h-full object-cover transition-all duration-700 ${isHovering ? 'opacity-0 scale-100' : 'opacity-100 scale-105 group-hover/card:scale-110'}`}
                            loading="lazy"
                        />

                        {isHovering && item.trailerKey && (
                            <div className="absolute inset-0 bg-black">
                                <iframe
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                    src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1&playlist=${item.trailerKey}&rel=0&showinfo=0&iv_load_policy=3`}
                                    title={item.title || item.name}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-md animate-in fade-in zoom-in border border-white/10">
                                    <Volume2 size={16} className="text-white" />
                                </div>
                            </div>
                        )}

                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center pl-1 shadow-lg shadow-red-900/50 group-hover/card:scale-110 transition-transform duration-300 backdrop-blur-sm">
                                <Play fill="white" className="text-white" size={28} />
                            </div>
                        </div>

                        <div className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="font-bold text-white text-lg mb-1 line-clamp-1 leading-tight drop-shadow-md">
                                {item.title || item.name}
                            </span>
                            <p className="text-zinc-300 text-sm line-clamp-2 drop-shadow-sm font-medium">
                                {item.overview}
                            </p>
                        </div>
                    </div>
                </div>
            );
        })}
        <div className="w-12 flex-none"></div>
      </div>
    </div>
  );
}