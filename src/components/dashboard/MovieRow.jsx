import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function MovieRow({ title, items }) {
  const rowRef = useRef(null);

  const slide = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth * 0.7) : clientWidth * 0.7;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 relative z-20 group w-full">
      <div className="flex justify-between items-end mb-4 px-4 md:px-12">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-4 border-violet-600 pl-3">
            {title}
          </h2>

          <div className="flex gap-2">
              <button onClick={() => slide('left')} className="">
                  <ChevronLeft size={20} className="text-white group-hover/btn:scale-110 transition-transform" />
              </button>
              <button 
                onClick={() => slide('right')}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 hover:bg-violet-600 flex items-center justify-center transition-colors border border-white/10 group/btn"
              >
                  <ChevronRight size={20} className="text-white group-hover/btn:scale-110 transition-transform" />
              </button>
          </div>
      </div>
      
      <div 
        ref={rowRef} 
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-4 md:px-12 scrollbar-hide w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => (
            <Link 
                key={`${item.id}-${index}`}
                to={`/app/${item.media_type || (item.first_air_date ? 'tv' : 'movie')}/${item.id}`} 
                className="flex-none w-[160px] md:w-[220px] relative transition-transform duration-300 hover:scale-105 hover:z-20 group/card"
            >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 shadow-lg border border-white/5 relative">
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                        alt={item.title || item.name} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center border border-white/10">
                        <span className="font-bold text-white text-sm mb-2 line-clamp-2">{item.title || item.name}</span>
                        <div className="flex items-center gap-1 text-green-400 text-xs font-bold mb-2">
                            <Star size={12} fill="currentColor"/> {item.vote_average?.toFixed(1)}
                        </div>
                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-zinc-300 uppercase tracking-wider border border-white/20">
                            Detalhes
                        </span>
                    </div>
                </div>
            </Link>
        ))}
        <div className="w-4 flex-none"></div>
      </div>
    </div>
  );
}