import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  cancelMovieDetailsPrefetch,
  prefetchMovieDetails,
  scheduleMovieDetailsPrefetch,
} from '@shared/lib/mediaDetailsPrefetch';

export default function MediaCard({ media, variant = 'default' }) {
  if (!media.poster_path) return null;

  const imageUrl = `https://image.tmdb.org/t/p/w500${media.poster_path}`;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const year = (
    media.release_date ||
    media.first_air_date ||
    media.releaseDate ||
    media.firstAirDate ||
    media.year ||
    ''
  ).toString().split('-')[0];
  const title = media.title || media.name;
  const type = media.media_type || (media.title ? 'movie' : 'tv');

  if (variant === 'home') {
    return (
      <Link
        to={`/app/${type}/${media.id}`}
        onMouseEnter={() => scheduleMovieDetailsPrefetch(type, media.id)}
        onMouseLeave={() => cancelMovieDetailsPrefetch(type, media.id)}
        onFocus={() => prefetchMovieDetails(type, media.id)}
        onPointerDown={() => prefetchMovieDetails(type, media.id)}
        className="group/card block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <article className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.025]">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-opacity duration-200 group-hover/card:opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-50 transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100" />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 backdrop-blur-md md:right-3 md:top-3">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-semibold text-white">{rating}</span>
          </div>
        </article>
        <div className="px-0.5 pt-2.5">
          <h3 className="truncate text-sm font-semibold text-zinc-100">{title}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
            {year && <span>{year}</span>}
            {year && <span>•</span>}
            <span>{type === 'movie' ? 'Filme' : 'Série'}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/app/${type}/${media.id}`}
      onMouseEnter={() => scheduleMovieDetailsPrefetch(type, media.id)}
      onMouseLeave={() => cancelMovieDetailsPrefetch(type, media.id)}
      onFocus={() => prefetchMovieDetails(type, media.id)}
      onPointerDown={() => prefetchMovieDetails(type, media.id)}
      className="group relative flex flex-col bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-xl"
    >
      <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-900/50">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-xl px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        <h3 className="font-bold text-sm text-white truncate group-hover:text-violet-400 transition-colors">
          {title}
        </h3>
        <div className="flex justify-between items-center mt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            {type === 'movie' ? 'Filme' : 'Série'}
          </span>
          <span className="text-xs text-zinc-400">{year || '-'}</span>
        </div>
      </div>
    </Link>
  );
}
