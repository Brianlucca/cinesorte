import { Link } from 'react-router-dom';
import { Heart, Eye, Calendar, Film } from 'lucide-react';

export default function ActivityFeed({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed shadow-inner animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/5 shadow-inner">
                <Calendar size={28} className="text-zinc-600" />
            </div>
            <p className="text-white font-black text-xl tracking-tight mb-2">Nenhuma Atividade</p>
            <p className="text-zinc-500 font-medium text-sm">Nenhum registro encontrado com este filtro.</p>
        </div>
    );
  }

  const sortedInteractions = [...interactions].sort((a, b) => {
    const dateA = a.timestamp?._seconds || 0;
    const dateB = b.timestamp?._seconds || 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
        {sortedInteractions.map((item, idx) => (
            <div key={`${item.mediaId}-${idx}`} className="bg-black/20 backdrop-blur-md p-4 md:p-5 rounded-[1.5rem] border border-white/5 flex items-center gap-5 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group shadow-inner">
                
                <Link to={`/app/${item.mediaType || 'movie'}/${item.mediaId}`} className="shrink-0 relative block">
                    {item.posterPath ? (
                        <img 
                            src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} 
                            className="w-16 h-24 md:w-20 md:h-28 object-cover rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500 border border-white/5" 
                            alt={item.mediaTitle || "Capa"} 
                        />
                    ) : (
                        <div className="w-16 h-24 md:w-20 md:h-28 bg-white/5 rounded-xl flex items-center justify-center text-zinc-600 border border-white/5 shadow-inner">
                            <Film size={24} />
                        </div>
                    )}
                </Link>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl border ${item.action === 'like' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'}`}>
                            {item.action === 'like' ? <Heart size={16} fill="currentColor" /> : <Eye size={16} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.action === 'like' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {item.action === 'like' ? 'Curtiu' : 'Assistiu'}
                        </span>
                    </div>
                    
                    <Link to={`/app/${item.mediaType || 'movie'}/${item.mediaId}`} className="block">
                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-violet-400 transition-colors tracking-tight line-clamp-2">
                            {item.mediaTitle || 'Conteúdo sem título'}
                        </h3>
                    </Link>
                    
                </div>
            </div>
        ))}
    </div>
  );
}