import { Filter } from "lucide-react";

export default function GenreSelector({ genres, selectedGenre, onSelect }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        <Filter size={13} className="text-violet-300/80" />
        Filtrar por gênero
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-full border px-3.5 py-2 text-[11px] font-medium transition-colors ${
            !selectedGenre
              ? "border-white bg-white text-zinc-950"
              : "border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:border-white/15 hover:text-white"
          }`}
        >
          Todos
        </button>

        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            onClick={() => onSelect(genre.id)}
            className={`rounded-full border px-3.5 py-2 text-[11px] font-medium transition-colors ${
              selectedGenre === genre.id
                ? "border-violet-400/35 bg-violet-500/15 text-violet-100"
                : "border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:border-white/15 hover:text-white"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </section>
  );
}
