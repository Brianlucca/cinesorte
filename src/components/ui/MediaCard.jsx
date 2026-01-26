import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MediaCard({ media }) {
  if (!media.poster_path) return null;

  const imageUrl = `https://image.tmdb.org/t/p/w500${media.poster_path}`;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const title = media.title || media.name;
  const type = media.media_type || (media.title ? 'movie' : 'tv');

  return (
    <Link to={`/app/${type}/${media.id}`} className="group relative block bg-zinc-900 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-lg shadow-black/20 border border-white/5 hover:border-violet-500/30">
      <div className="aspect-[2/3] w-full relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate group-hover:text-violet-400 transition-colors">
          {title}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-zinc-500">{year}</span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
            {type === 'movie' ? 'Filme' : 'Série'}
          </span>
        </div>
      </div>
    </Link>
  );
}