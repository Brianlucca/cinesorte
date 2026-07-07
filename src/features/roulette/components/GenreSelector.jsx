import { Filter } from "lucide-react";

export default function GenreSelector({ genres, selectedGenre, onSelect }) {
  return (
    <section className="rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-5">
      <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        <Filter size={14} className="text-violet-300" />
        Gênero favorito
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-xl border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
            !selectedGenre
              ? "border-white bg-white text-zinc-950"
              : "border-white/[0.07] bg-white/[0.025] text-zinc-400 hover:border-violet-300/25 hover:bg-white/[0.045] hover:text-white"
          }`}
        >
          Todos
        </button>

        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            onClick={() => onSelect(genre.id)}
            className={`rounded-xl border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
              selectedGenre === genre.id
                ? "border-violet-400/25 bg-violet-500/15 text-violet-100"
                : "border-white/[0.07] bg-white/[0.025] text-zinc-400 hover:border-violet-300/25 hover:bg-white/[0.045] hover:text-white"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </section>
  );
}
