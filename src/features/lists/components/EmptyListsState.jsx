import { Link } from "react-router-dom";
import { ArrowRight, Film, Layers3, Plus } from "lucide-react";

export default function EmptyListsState({ onCreate }) {
  return (
    <section className="mt-8 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.018] px-6 py-14 text-center md:py-20">
      <div className="mx-auto max-w-lg">
        <div className="relative mx-auto mb-6 grid h-16 w-16 place-items-center rounded-xl border border-white/[0.06] bg-[#181a20] text-violet-300">
          <Layers3 size={30} />
          <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-violet-600 text-white shadow-lg">
            <Plus size={15} />
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
          Seu espaço
        </span>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">
          Comece sua primeira lista
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          Separe o que quer assistir, seus favoritos ou qualquer seleção que tenha a sua cara.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-violet-100"
          >
            <Plus size={16} /> Criar lista
          </button>
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Film size={16} /> Explorar catálogo <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
