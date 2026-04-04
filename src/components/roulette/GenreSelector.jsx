import { Filter } from 'lucide-react';

export default function GenreSelector({ genres, selectedGenre, onSelect }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-xs tracking-widest">
        <Filter size={14} className="text-violet-500" /> Gênero Favorito
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onSelect(null)}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${!selectedGenre ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/[0.02] text-zinc-400 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/[0.05]'}`}
        >
          Todos
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${selectedGenre === genre.id ? 'bg-violet-600 text-white border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-white/[0.02] text-zinc-400 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/[0.05]'}`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}