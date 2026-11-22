import { ArrowRight, ArrowRightLeft, CheckCircle2, FolderPlus, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "@shared/components/ui/Modal";

const getTitle = (item) => item?.title || item?.name || "Sem título";

export default function MoveMediaModal({
  item,
  lists,
  currentListId,
  isMoving,
  onClose,
  onMove,
}) {
  const destinationLists = lists.filter((list) => list.id !== currentListId);
  const title = getTitle(item);

  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={() => {
        if (!isMoving) onClose();
      }}
      title="Mover para outra lista"
      size="sm"
      appearance="cinematic"
    >
      <div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
          <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
            {item?.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Escolha a coleção de destino. O título será retirado da lista atual.
            </p>
          </div>
        </div>

        {destinationLists.length > 0 ? (
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1 content-scrollbar">
            {destinationLists.map((list) => {
              const alreadyContains = (list.items || []).some(
                (listItem) => String(listItem.id) === String(item?.id),
              );

              return (
                <button
                  key={list.id}
                  type="button"
                  disabled={isMoving}
                  onClick={() => onMove(list.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.012] p-3.5 text-left transition-colors hover:border-violet-400/20 hover:bg-violet-500/[0.06] disabled:cursor-wait disabled:opacity-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-violet-300">
                    {isMoving ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-100">{list.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-600">
                      {alreadyContains && <CheckCircle2 size={12} className="text-emerald-400" />}
                      {alreadyContains ? "Já está nesta lista; a cópia atual será removida" : `${(list.items || []).length} títulos`}
                    </span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-zinc-700 transition-colors group-hover:text-violet-300" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.012] px-5 py-8 text-center">
            <FolderPlus size={23} className="mx-auto text-zinc-600" />
            <p className="mt-3 text-sm font-semibold text-zinc-200">Nenhuma outra lista disponível</p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">Crie outra coleção para poder mover este título.</p>
            <Link
              to="/app/lists"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-violet-100"
            >
              Ir para minhas listas <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </Modal>
  );
}
