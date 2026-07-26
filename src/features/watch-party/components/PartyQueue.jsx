import { ListVideo, Play, Plus, Trash2 } from "lucide-react";

export default function PartyQueue({ items, currentVideoId, onAdd, onSelect, onRemove }) {
  return (
    <section className="rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/95 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-violet-300"><ListVideo size={14} /> Fila da sessão</p><h2 className="mt-1 text-lg font-black text-white">Assistir a seguir</h2></div>
        <button type="button" onClick={onAdd} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.045] px-3 text-[9px] font-black uppercase tracking-wider text-zinc-200 hover:bg-white/[0.07]"><Plus size={14} /> Adicionar</button>
      </div>

      {items.length ? (
        <div className="content-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {items.map((item, index) => {
            const active = item.videoId === currentVideoId;
            return (
              <article key={item.id} className={`group relative w-52 shrink-0 overflow-hidden rounded-2xl border ${active ? "border-violet-400/30 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.025]"}`}>
                <button type="button" onClick={() => onSelect(item.videoId)} className="block w-full text-left">
                  <div className="relative aspect-video overflow-hidden bg-zinc-900"><img src={item.thumbnail} alt="" className="h-full w-full object-cover opacity-75 transition-transform group-hover:scale-105" /><span className="absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-lg bg-black/70 px-1.5 text-[9px] font-black text-white">{index + 1}</span>{active && <span className="absolute inset-0 grid place-items-center bg-violet-950/20"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-zinc-950"><Play size={14} fill="currentColor" /></span></span>}</div>
                  <div className="p-3"><h3 className="truncate text-xs font-bold text-zinc-100">{item.title}</h3><p className="mt-1 text-[9px] text-zinc-600">Adicionado por {item.addedBy}</p></div>
                </button>
                <button type="button" onClick={() => onRemove(item.id)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-black/75 text-zinc-400 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100" title="Remover da fila"><Trash2 size={13} /></button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/[0.08] bg-black/15 px-5 py-8 text-center"><ListVideo size={23} className="mx-auto text-zinc-700" /><p className="mt-3 text-sm font-bold text-zinc-500">A fila está vazia</p><button type="button" onClick={onAdd} className="mt-2 text-xs font-bold text-violet-300 hover:text-violet-200">Adicionar o primeiro vídeo</button></div>
      )}
    </section>
  );
}
