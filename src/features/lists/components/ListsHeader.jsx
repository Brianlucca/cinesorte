import { Film, Layers3, Plus } from "lucide-react";

export default function ListsHeader({ lists, onCreate }) {
  const totalItems = lists.reduce(
    (total, list) => total + (list.items?.length || 0),
    0,
  );

  return (
    <header className="relative border-b border-white/[0.07] pb-6 pt-2 md:pb-8 md:pt-3">
      <div className="pointer-events-none absolute -inset-y-16 -left-[12%] w-[62%] bg-[radial-gradient(ellipse_at_center,rgba(109,40,217,0.10)_0%,rgba(91,33,182,0.045)_38%,transparent_72%)] blur-2xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">
            <Layers3 size={13} />
            Sua biblioteca
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">
            Minhas listas
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Seus filmes e séries organizados do seu jeito.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.13em] text-zinc-400">
              <Layers3 size={13} className="text-violet-300" />
              {lists.length} {lists.length === 1 ? "lista" : "listas"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.13em] text-zinc-400">
              <Film size={13} className="text-cyan-300" />
              {totalItems} {totalItems === 1 ? "título" : "títulos"}
            </span>
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-black transition-all duration-300 hover:bg-violet-100 active:scale-[0.98]"
          >
            <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
            Nova lista
          </button>
        </div>
      </div>
    </header>
  );
}
