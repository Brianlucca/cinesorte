import { useState } from "react";
import { ArrowLeft, Check, Clapperboard, Film, Loader2, Plus, Trash2 } from "lucide-react";
import Modal from "@shared/components/ui/Modal";

export default function AddToListModal({
  isOpen,
  onClose,
  lists,
  onAdd,
  onRemove,
  onCreate,
  mediaId,
  addingToListId,
  mediaTitle,
}) {
  const [view, setView] = useState("select");
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const name = newListName.trim();
    if (!name || isCreating) return;

    setIsCreating(true);
    try {
      const created = await onCreate(name);
      if (created) {
        setNewListName("");
        setView("select");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const isMediaInList = (list) => {
    return list.items?.some((item) => String(item.id) === String(mediaId));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
          onClose();
          setView("select");
          setNewListName("");
      }}
      title={view === "select" ? "Adicionar à Coleção" : "Nova Coleção"}
      appearance="cinematic"
    >
      {view === "select" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-violet-400/10 bg-violet-500/[0.045] px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-300">
              <Clapperboard size={17} />
            </span>
            <p className="min-w-0 text-xs leading-5 text-zinc-400">
              Escolha onde salvar <span className="font-medium text-zinc-200">{mediaTitle || "este título"}</span>
            </p>
          </div>

          {lists && lists.length > 0 ? (
            <div className="max-h-[min(48vh,360px)] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {lists.map((list) => {
                const alreadyInList = isMediaInList(list);
                const isThisLoading = addingToListId === list.id;
                const cover = list.items?.find((item) => item.poster_path)?.poster_path;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      if (isThisLoading) return;
                      if (alreadyInList) {
                        onRemove?.(list.id);
                      } else {
                        onAdd(list.id);
                      }
                    }}
                    disabled={isThisLoading}
                    aria-label={alreadyInList ? `Remover de ${list.name}` : `Adicionar em ${list.name}`}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${
                      alreadyInList
                        ? "border-emerald-400/15 bg-emerald-500/[0.06] hover:border-red-400/35 hover:bg-red-500/[0.06]"
                        : "border-white/[0.06] bg-white/[0.018] hover:border-violet-400/25 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="h-12 w-9 shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-zinc-900">
                      {cover ? (
                        <img src={`https://image.tmdb.org/t/p/w92${cover}`} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-zinc-600"><Film size={15} /></span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-medium transition-colors ${
                        alreadyInList
                          ? "text-emerald-300 group-hover:text-red-300"
                          : "text-zinc-100 group-hover:text-violet-200"
                      }`}>
                        {list.name}
                      </span>
                      <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                        {alreadyInList
                          ? "Toque para remover"
                          : `${list.items?.length || 0} ${list.items?.length === 1 ? "item" : "itens"}`}
                      </span>
                    </span>

                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
                      alreadyInList
                        ? "bg-emerald-500/10 text-emerald-300 group-hover:bg-red-500/15 group-hover:text-red-300"
                        : "bg-white/[0.045] text-zinc-400 group-hover:bg-violet-500/15 group-hover:text-violet-200"
                    }`}>
                      {isThisLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : alreadyInList ? (
                        <>
                          <Check size={16} className="group-hover:hidden" />
                          <Trash2 size={16} className="hidden group-hover:block" />
                        </>
                      ) : (
                        <Plus size={16} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.09] bg-white/[0.012] px-5 py-8 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-500">
                <Film size={21} />
              </div>
              <p className="text-sm font-medium text-zinc-300">Você ainda não tem coleções.</p>
              <p className="mt-1 text-xs text-zinc-600">Crie uma para guardar este título.</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setView("create")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 py-3.5 text-xs font-semibold text-violet-100 transition-colors hover:border-violet-400/35 hover:bg-violet-500/15"
          >
            <Plus size={17} /> Criar nova coleção
          </button>
        </div>
      ) : (
        <form
          className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
        >
          <button
            type="button"
            onClick={() => setView("select")}
            disabled={isCreating}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-white disabled:opacity-50"
          >
            <ArrowLeft size={14} /> Voltar às coleções
          </button>
          <div>
            <label htmlFor="new-collection-name" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Nome da coleção
            </label>
            <input
              id="new-collection-name"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ex: Filmes Favoritos, Para Assistir..."
              maxLength={60}
              className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.025]"
              autoFocus
              disabled={isCreating}
            />
          </div>

          <button
            type="submit"
            disabled={!newListName.trim() || isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isCreating ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
            {isCreating ? "Criando coleção..." : "Criar coleção e adicionar título"}
          </button>
        </form>
      )}
    </Modal>
  );
}