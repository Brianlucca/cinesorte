import { Filter } from 'lucide-react';

export default function GenreSelector({ genres, selectedGenre, onSelect }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
        <Filter size={12} /> Gênero Favorito
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${!selectedGenre ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white'}`}
        >
          TODOS
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedGenre === genre.id ? 'bg-violet-600 text-white border-violet-500 shadow-lg' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-white'}`}
          >
            {genre.name.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}