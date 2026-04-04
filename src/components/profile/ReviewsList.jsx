import { Link } from 'react-router-dom';
import { Star, MessageSquare, Calendar } from 'lucide-react';

export default function ReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed shadow-inner animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/5 shadow-inner">
                <MessageSquare size={28} className="text-zinc-600" />
            </div>
            <p className="text-white font-black text-xl tracking-tight mb-2">Nenhuma Review</p>
            <p className="text-zinc-500 font-medium text-sm">Você ainda não avaliou nenhum filme ou série.</p>
        </div>
    );
  }

  const getMediaLink = (review) => {
      const idStr = String(review.mediaId);
      const cleanId = idStr.replace(/^(person-|movie-|tv-)/, '');

      if (review.mediaType === 'person') return `/app/person/${cleanId}`;
      if (review.mediaType === 'episode' && idStr.includes('tv-')) {
          try {
              const parts = idStr.split('-');
              if (parts.length >= 4) {
                  return `/app/tv/${parts[1]}/season/${parts[2].replace('s', '')}/episode/${parts[3].replace('e', '')}`;
              }
          } catch (e) { return `/app/tv/${cleanId}`; }
      }
      if (review.mediaType === 'episode' || review.mediaType === 'tv') return `/app/tv/${cleanId}`;
      return `/app/${review.mediaType}/${cleanId}`;
  };

  const formatDate = (dateValue) => {
      if (!dateValue) return 'Data desconhecida';
      const date = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue);
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
        {reviews.map((review, idx) => {
            const mediaLink = getMediaLink(review);
            const rating = Number(review.rating) || 0; 

            return (
                <div key={`${review.id}-${idx}`} className="bg-black/20 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/5 flex flex-col md:flex-row gap-6 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group shadow-inner">
                    
                    {review.posterPath && (
                        <Link to={mediaLink} className="shrink-0 mx-auto md:mx-0">
                            <div className="w-28 md:w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)] relative border border-white/5">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w342${review.posterPath}`} 
                                    alt={review.mediaTitle} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </Link>
                    )}
                    
                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                        <div className="flex justify-between items-start mb-4 gap-4">
                            <div>
                                <Link to={mediaLink} className="text-2xl md:text-3xl font-black text-white group-hover:text-violet-400 transition-colors line-clamp-1 block mb-2 tracking-tight">
                                    {review.mediaTitle || 'Título Desconhecido'}
                                </Link>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    {review.mediaType === 'tv' ? 'Série' : review.mediaType === 'person' ? 'Artista' : 'Filme'}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] shrink-0">
                                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                                <span className="font-black text-yellow-500 text-sm">{rating.toFixed(1)}</span>
                            </div>
                        </div>
                        
                        {review.text && (
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 mb-5 flex-1 relative group-hover:bg-black/60 transition-colors shadow-inner">
                                <MessageSquare size={16} className="absolute top-5 right-5 text-zinc-700" />
                                <p className="text-zinc-300 leading-relaxed text-sm font-medium pr-8">
                                    "{review.text}"
                                </p>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-end gap-4 mt-auto pt-4 border-t border-white/5">
                            <span className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">
                                <Calendar size={14} /> 
                                {formatDate(review.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
  );
}