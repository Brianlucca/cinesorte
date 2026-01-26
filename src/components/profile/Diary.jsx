import { Link } from 'react-router-dom';
import { Calendar, Film } from 'lucide-react';

export default function Diary({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
        <Calendar className="mx-auto text-zinc-700 mb-4" size={48} />
        <p className="text-zinc-500 italic text-lg">Seu diário de bordo está vazio.</p>
        <p className="text-zinc-600 text-sm mt-2">Marque filmes como assistidos para preencher sua linha do tempo.</p>
      </div>
    );
  }

  const getSafeDate = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return new Date(); 
  };

  const groupItemsByDate = () => {
    const groups = {};
    
    items.forEach(item => {
      const date = getSafeDate(item.timestamp);
      const year = date.getFullYear();
      const month = date.toLocaleString('pt-BR', { month: 'long' });
      const monthKey = `${year}-${date.getMonth()}`; 

      if (!groups[year]) groups[year] = {};
      if (!groups[year][monthKey]) {
        groups[year][monthKey] = {
          name: month,
          items: []
        };
      }
      
      groups[year][monthKey].items.push(item);
    });

    return groups;
  };

  const groupedData = groupItemsByDate();
  const sortedYears = Object.keys(groupedData).sort((a, b) => b - a);

  return (
    <div className="space-y-12">
      {sortedYears.map(year => (
        <div key={year} className="relative">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-4xl font-black text-white/10">{year}</h2>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="space-y-8 pl-4 md:pl-8 border-l-2 border-white/5 ml-4 md:ml-6">
            {Object.keys(groupedData[year])
              .sort((a, b) => b.split('-')[1] - a.split('-')[1]) 
              .map(monthKey => {
                const { name, items } = groupedData[year][monthKey];
                
                return (
                  <div key={monthKey} className="relative">
                    <div className="absolute -left-[25px] md:-left-[41px] top-0 w-4 h-4 rounded-full bg-zinc-800 border-2 border-violet-500" />
                    
                    <h3 className="text-xl font-bold text-white capitalize mb-4 flex items-center gap-2">
                      {name} <span className="text-zinc-600 text-sm font-normal">({items.length})</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {items.map((item, idx) => (
                        <div key={`${item.mediaId}-${idx}`} className="group relative">
                          <Link to={`/app/${item.mediaType || 'movie'}/${item.mediaId}`}>
                            <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-zinc-800 relative">
                              {item.posterPath ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w342${item.posterPath}`} 
                                  alt={item.mediaTitle} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Film size={24} />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <span className="text-white font-bold text-sm line-clamp-2 leading-tight">
                                  {item.mediaTitle}
                                </span>
                                <span className="text-zinc-400 text-xs mt-1">
                                  {item.timestamp && item.timestamp._seconds 
                                    ? new Date(item.timestamp._seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                    : 'Recente'
                                  }
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}