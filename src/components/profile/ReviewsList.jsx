import { Link } from 'react-router-dom';
import { Star, MessageSquare, Calendar } from 'lucide-react';

export default function ReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
            <MessageSquare className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 italic text-lg">Nenhuma avaliação publicada ainda.</p>
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

  return (
    <div className="grid grid-cols-1 gap-6">
        {reviews.map((review, idx) => {
            const mediaLink = getMediaLink(review);
            return (
                <div key={`${review.id}-${idx}`} className="bg-zinc-900 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-all group shadow-lg">
                    {review.posterPath && (
                        <Link to={mediaLink} className="shrink-0 mx-auto md:mx-0">
                            <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w342${review.posterPath}`} 
                                    alt={review.mediaTitle} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        </Link>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <Link to={mediaLink} className="text-2xl font-black text-white hover:text-violet-400 transition-colors line-clamp-1 block mb-1">
                                    {review.mediaTitle || 'Título Desconhecido'}
                                </Link>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded border border-white/5">
                                    {review.mediaType === 'tv' ? 'Série' : review.mediaType === 'person' ? 'Artista' : 'Filme'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                <span className="font-black text-yellow-500">{review.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        
                        {review.text && (
                            <div className="bg-zinc-950/50 p-5 rounded-2xl border border-white/5 mb-4 flex-1">
                                <p className="text-zinc-300 leading-relaxed text-sm font-light italic">
                                    "{review.text}"
                                </p>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-end gap-4 mt-auto text-xs text-zinc-500 font-medium pt-2 border-t border-white/5">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} /> 
                                {review.createdAt ? new Date(review.createdAt._seconds * 1000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data desconhecida'}
                            </span>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
  );
}