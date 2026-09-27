import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Volume2 } from 'lucide-react';
import TrailerModal from '@features/media/components/TrailerModal';

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
    }, 280);
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
        <TrailerModal
            isOpen={!!selectedTrailer}
            onClose={() => setSelectedTrailer(null)}
            videoKey={selectedTrailer?.trailerKey}
            title={selectedTrailer?.title || selectedTrailer?.name}
        />

      <div className="mb-0 flex items-center justify-between px-5 sm:px-6 md:px-10 xl:px-14 2xl:px-16">
          <h2 className="flex items-center gap-3 text-lg font-semibold tracking-[-0.02em] text-zinc-100 sm:text-xl md:text-2xl">
            {title}
          </h2>

          <div className="flex gap-2">
              <button 
                onClick={() => slide('left')} 
                className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white"
              >
                  <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => slide('right')} 
                className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      </div>
      
      <div 
        ref={rowRef} 
        className="flex w-full gap-4 overflow-x-auto px-5 pb-2 pt-4 scroll-smooth scrollbar-hide sm:px-6 md:gap-5 md:px-10 md:pt-5 xl:px-14 2xl:px-16"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => {
            const isHovering = hoveredTrailerId === item.id;

            return (
                <div 
                    key={`${item.id}-trailer-${index}`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => item.trailerKey && setSelectedTrailer(item)}
                    className="group/card relative w-[290px] flex-none cursor-pointer sm:w-[340px] md:w-[400px] xl:w-[430px]"
                >
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-white/[0.02] transition-opacity group-hover/card:opacity-90">
                        
                        <img 
                            src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`} 
                            alt={item.title || item.name} 
                            className={`w-full h-full object-cover transition-all duration-350 ${isHovering ? 'opacity-0 scale-100' : 'opacity-100 scale-[1.02] group-hover/card:scale-[1.05]'}`}
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
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 pl-0.5 text-zinc-950 transition-colors group-hover/card:bg-white">
                                <Play fill="currentColor" size={21} />
                            </div>
                        </div>

                        <div className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="mb-1 line-clamp-1 text-base font-semibold leading-tight text-white">
                                {item.title || item.name}
                            </span>
                            <p className="line-clamp-1 text-xs text-zinc-300">
                                {item.overview}
                            </p>
                        </div>
                    </div>
                </div>
            );
        })}
        <div className="w-6 md:w-10 flex-none"></div>
      </div>
    </div>
  );
}
