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
    <div className="relative w-full group/row z-10">
      
      <div className="flex justify-between items-center px-6 md:px-12 mb-0">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
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
        {items.map((item, index) => (
            <Link 
                key={`${item.id}-${index}`}
                to={`/app/${item.media_type || (item.first_air_date ? 'tv' : 'movie')}/${item.id}`} 
                className="flex-none w-[160px] md:w-[220px] group/card transition-all duration-500 hover:-translate-y-2"
            >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 relative shadow-2xl group-hover/card:border-white/20 transition-all">
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                        alt={item.title || item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                        loading="lazy"
                    />
                    
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-xl px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-black text-white">{item.vote_average?.toFixed(1)}</span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                        <span className="font-bold text-white text-sm mb-3 line-clamp-2 leading-tight">
                            {item.title || item.name}
                        </span>
                        
                        <div className="w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest text-center rounded-lg shadow-lg">
                            Ver Detalhes
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