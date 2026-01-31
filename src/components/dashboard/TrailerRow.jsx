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
    <div className="mb-8 relative z-20 group w-full">
        {selectedTrailer && createPortal(
            <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
                <TrailerModal 
                    isOpen={!!selectedTrailer} 
                    onClose={() => setSelectedTrailer(null)} 
                    videoKey={selectedTrailer} 
                />
            </div>,
            document.body
        )}

      <div className="flex justify-between items-end mb-4 px-6 md:px-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 border-l-4 border-red-600 pl-4 uppercase tracking-wider">
            {title}
          </h2>

          <div className="flex gap-3">
              <button onClick={() => slide('left')} className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-red-600 transition-all active:scale-95 border border-white/5">
                  <ChevronLeft size={22} className="text-white" />
              </button>
              <button onClick={() => slide('right')} className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-red-600 transition-all active:scale-95 border border-white/5">
                  <ChevronRight size={22} className="text-white" />
              </button>
          </div>
      </div>
      
      <div 
        ref={rowRef} 
        className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-6 md:px-16 scrollbar-hide w-full"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, index) => {
            const isHovering = hoveredTrailerId === item.id;

            return (
                <div 
                    key={`${item.id}-trailer-${index}`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setSelectedTrailer(item.trailerKey)}
                    className="flex-none w-[320px] md:w-[480px] group/card cursor-pointer relative"
                >
                    <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-lg border border-white/10 relative transition-all duration-300 hover:border-red-500/50 hover:shadow-red-900/20">
                        
                        <img 
                            src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`} 
                            alt={item.title} 
                            className={`w-full h-full object-cover transition-opacity duration-500 ${isHovering ? 'opacity-0' : 'opacity-90'}`}
                        />

                        {isHovering && item.trailerKey && (
                            <div className="absolute inset-0 bg-black">
                                <iframe
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                    src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1&playlist=${item.trailerKey}&rel=0&showinfo=0&iv_load_policy=3`}
                                    title={item.title}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-md animate-in fade-in zoom-in">
                                    <Volume2 size={20} className="text-white" />
                                </div>
                            </div>
                        )}

                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center pl-1 shadow-lg shadow-red-900/50 group-hover/card:scale-105 transition-transform duration-300">
                                <Play fill="white" className="text-white" size={32} />
                            </div>
                        </div>

                        <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                            <h3 className="text-white font-bold text-xl truncate drop-shadow-md">{item.title}</h3>
                            <p className="text-zinc-300 text-sm mt-1 line-clamp-2">
                                {item.overview}
                            </p>
                        </div>
                    </div>
                </div>
            );
        })}
        <div className="w-8 flex-none"></div>
      </div>
    </div>
  );
}