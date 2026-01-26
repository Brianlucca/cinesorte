import { Link } from 'react-router-dom';
import { Heart, Eye, Calendar, Film } from 'lucide-react';

export default function ActivityFeed({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return (
        <div className="text-center py-20">
            <div className="bg-zinc-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                <Calendar size={24} />
            </div>
            <p className="text-zinc-500 text-lg">Nenhuma atividade encontrada com este filtro.</p>
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
            <div key={`${item.mediaId}-${idx}`} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex items-center gap-5 hover:border-violet-500/30 transition-all hover:bg-zinc-900/80 group">
                
                <Link to={`/app/${item.mediaType || 'movie'}/${item.mediaId}`} className="shrink-0 relative block">
                    {item.posterPath ? (
                        <img 
                            src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} 
                            className="w-16 h-24 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" 
                            alt={item.mediaTitle || "Capa"} 
                        />
                    ) : (
                        <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 border border-white/5">
                            <Film size={20} />
                        </div>
                    )}
                </Link>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-lg ${item.action === 'like' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {item.action === 'like' ? <Heart size={16} fill="currentColor" /> : <Eye size={16} />}
                        </div>
                        <span className={`text-sm font-bold uppercase tracking-wide ${item.action === 'like' ? 'text-red-400' : 'text-green-400'}`}>
                            {item.action === 'like' ? 'Curtiu' : 'Assistiu'}
                        </span>
                    </div>
                    
                    <Link to={`/app/${item.mediaType || 'movie'}/${item.mediaId}`} className="block">
                        <h3 className="text-lg font-bold text-white hover:text-violet-400 transition-colors truncate">
                            {item.mediaTitle || 'Conteúdo sem título'}
                        </h3>
                    </Link>
                    
                    <p className="text-xs text-zinc-500 mt-1 font-medium flex items-center gap-1">
                        {item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleDateString() : 'Data recente'}
                        {item.timestamp && (
                            <>
                                <span>•</span>
                                <span>{new Date(item.timestamp._seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        ))}
    </div>
  );
}