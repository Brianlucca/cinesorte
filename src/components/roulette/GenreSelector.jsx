import { Filter, X } from 'lucide-react';

export default function GenreSelector({ genres, selectedGenre, onSelect }) {
  if (!genres || genres.length === 0) return null;

  return (
    <div className="w-full bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="p-2 bg-violet-500/10 rounded-lg">
                <Filter size={20} className="text-violet-500" />
            </div>
            Filtrar por Gênero
        </div>
        {selectedGenre && (
            <button 
                onClick={() => onSelect(null)}
                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors bg-red-500/10 px-3 py-1.5 rounded-lg"
            >
                <X size={14} /> Limpar Filtro
            </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <button
          onClick={() => onSelect(null)}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
            selectedGenre === null 
              ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105' 
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'
          }`}
        >
          🎲 Sorte Total
        </button>
        
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
              selectedGenre === genre.id 
                ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/50 scale-105' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}