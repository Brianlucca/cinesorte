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
    <div className="relative w-full group/row z-10 hover:z-50 transition-all duration-300">
      
      <div className="flex justify-between items-end px-4 md:px-12 relative z-30 mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-4 border-violet-600 pl-3 shadow-black drop-shadow-md">
            {title}
          </h2>

          <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
              <button onClick={() => slide('left')} className="">
                  <ChevronLeft size={24} className="text-white hover:scale-125 transition-transform" />
              </button>
              <button onClick={() => slide('right')} className="">
                  <ChevronRight size={24} className="text-white hover:scale-125 transition-transform" />
              </button>
          </div>
      </div>
      
      <div 
        ref={rowRef} 
        className="flex gap-4 overflow-x-auto scroll-smooth py-16 -my-10 px-4 md:px-12 scrollbar-hide w-full items-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => (
            <Link 
                key={`${item.id}-${index}`}
                to={`/app/${item.media_type || (item.first_air_date ? 'tv' : 'movie')}/${item.id}`} 
                className="flex-none w-[160px] md:w-[220px] relative transition-all duration-300 hover:scale-110 hover:z-50 group/card origin-center"
            >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 shadow-lg border border-white/5 relative shadow-black/50 group-hover/card:shadow-2xl group-hover/card:shadow-violet-900/40 group-hover/card:border-violet-500/50 transition-all duration-300">
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                        alt={item.title || item.name} 
                        className="w-full h-full object-cover transition-transform duration-300" 
                        loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 border border-white/10">
                        <span className="font-bold text-white text-sm mb-1 line-clamp-2 leading-tight drop-shadow-md">
                            {item.title || item.name}
                        </span>
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm">
                                <Star size={10} fill="currentColor"/> 
                                {item.vote_average?.toFixed(1)}
                            </div>
                            <span className="text-[10px] bg-violet-600 text-white px-2 py-1 rounded font-bold uppercase tracking-wide">
                                Ver
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        ))}
        <div className="w-12 flex-none"></div>
      </div>
    </div>
  );
}