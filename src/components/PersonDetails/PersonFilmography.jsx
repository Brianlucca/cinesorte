import React from 'react';
import MediaCard from '../ui/MediaCard';

const PersonFilmography = ({ credits }) => {
  const EXCLUDED_GENRES = [10763, 10764, 10767];

  const uniqueItems = new Map();
  
  credits?.cast?.forEach(item => {
      if(!item.poster_path) return;
      
      const hasExcludedGenre = item.genre_ids?.some(id => EXCLUDED_GENRES.includes(id));
      if (hasExcludedGenre) return;

      if(!uniqueItems.has(item.id)) {
          uniqueItems.set(item.id, item);
      }
  });

  const knownFor = Array.from(uniqueItems.values())
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 18);

  if (knownFor.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
        Conhecido por
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {knownFor.map((item) => (
          <MediaCard key={`${item.id}-${item.credit_id}`} media={item} />
        ))}
      </div>
    </section>
  );
};

export default PersonFilmography;