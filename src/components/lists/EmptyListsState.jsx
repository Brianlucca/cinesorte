import { Link } from "react-router-dom";
import { ArrowRight, Film, Layers3, Plus } from "lucide-react";

export default function EmptyListsState({ onCreate }) {
  return (
    <section className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-dashed border-white/[0.1] bg-white/[0.018] px-6 py-16 text-center md:rounded-[2rem] md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.13),transparent_38%)]" />
      <div className="relative mx-auto max-w-lg">
        <div className="relative mx-auto mb-7 grid h-20 w-20 place-items-center rounded-[1.4rem] border border-white/[0.08] bg-[#15131c] text-violet-300 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <Layers3 size={30} />
          <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-violet-600 text-white shadow-lg">
            <Plus size={15} />
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
          Seu espaço
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
          Comece sua primeira lista
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          Separe o que quer assistir, seus favoritos ou qualquer seleção que tenha a sua cara.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-black text-black transition-colors hover:bg-violet-100"
          >
            <Plus size={16} /> Criar lista
          </button>
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <Film size={16} /> Explorar catálogo <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
