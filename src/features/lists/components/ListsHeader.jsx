import { Film, Layers3, Plus } from "lucide-react";

export default function ListsHeader({ lists, onCreate }) {
  const totalItems = lists.reduce(
    (total, list) => total + (list.items?.length || 0),
    0,
  );

  return (
    <header className="border-b border-white/[0.06] pb-6 pt-2 md:pb-7 md:pt-3">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
            <Layers3 size={13} />
            Sua biblioteca
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
            Minhas listas
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Seus filmes e séries organizados do seu jeito.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3.5 py-2.5 text-xs font-semibold text-zinc-400">
              <Layers3 size={13} className="text-violet-300" />
              {lists.length} {lists.length === 1 ? "lista" : "listas"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3.5 py-2.5 text-xs font-semibold text-zinc-400">
              <Film size={13} className="text-violet-300" />
              {totalItems} {totalItems === 1 ? "título" : "títulos"}
            </span>
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition-colors hover:bg-violet-100"
          >
            <Plus size={14} className="transition-transform duration-300 group-hover:rotate-90" />
            Nova lista
          </button>
        </div>
      </div>
    </header>
  );
}
