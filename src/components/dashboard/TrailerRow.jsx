import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import TrailerModal from '../media/TrailerModal';

export default function TrailerRow({ title, items }) {
  const rowRef = useRef(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  const slide = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth * 0.8) : clientWidth * 0.8;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12 relative z-20 group w-full">
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

      <div className="flex justify-between items-end mb-6 px-4 md:px-12">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-l-4 border-red-600 pl-4 uppercase tracking-wider">
            {title}
          </h2>

          <div className="flex gap-2">
              <button onClick={() => slide('left')} className="p-2 rounded-full bg-zinc-800 hover:bg-red-600 transition-colors">
                  <ChevronLeft size={20} className="text-white" />
              </button>
              <button onClick={() => slide('right')} className="p-2 rounded-full bg-zinc-800 hover:bg-red-600 transition-colors">
                  <ChevronRight size={20} className="text-white" />
              </button>
          </div>
      </div>
      
      <div 
        ref={rowRef} 
        className="flex gap-6 overflow-x-auto scroll-smooth pb-8 px-4 md:px-12 scrollbar-hide w-full"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, index) => (
            <div 
                key={`${item.id}-trailer-${index}`}
                onClick={() => setSelectedTrailer(item.trailerKey)}
                className="flex-none w-[300px] md:w-[400px] group/card cursor-pointer relative"
            >
                <div className="aspect-video rounded-xl overflow-hidden bg-zinc-800 shadow-2xl border border-white/10 relative transition-transform duration-300 group-hover/card:scale-105 group-hover/card:border-red-500/50">
                    <img 
                        src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`} 
                        alt={item.title} 
                        className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center pl-1 shadow-lg shadow-red-900/50 group-hover/card:scale-110 transition-transform">
                            <Play fill="white" className="text-white" size={32} />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
                        <h3 className="text-white font-bold text-lg truncate">{item.title}</h3>
                        <p className="text-zinc-300 text-xs mt-1 line-clamp-1">{item.overview}</p>
                    </div>
                </div>
            </div>
        ))}
        <div className="w-4 flex-none"></div>
      </div>
    </div>
  );
}