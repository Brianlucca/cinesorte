import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Film,
  MoreHorizontal,
  Share2,
  Trash2,
  User,
} from "lucide-react";
import MediaCard from "../ui/MediaCard";
import { useAuth } from "../../context/AuthContext";

export default function ListGroup({
  list,
  index,
  onDeleteList,
  onEditList,
  onManageItems,
  onShareList,
  selection,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [railState, setRailState] = useState({ left: false, right: false });
  const railRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = list.items || [];
  const backdrop = items.find((item) => item.backdrop_path)?.backdrop_path;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const updateRailState = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      setRailState({
        left: rail.scrollLeft > 8,
        right: maxScroll > 8 && rail.scrollLeft < maxScroll - 8,
      });
    };

    updateRailState();
    rail.addEventListener("scroll", updateRailState, { passive: true });
    const observer = new ResizeObserver(updateRailState);
    observer.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateRailState);
      observer.disconnect();
    };
  }, [items.length]);

  const scrollRail = (direction) => {
    railRef.current?.scrollBy({
      left: direction === "left" ? -railRef.current.clientWidth * 0.75 : railRef.current.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  const openList = () => navigate(`/app/lists/${user?.username}/${list.id}`);

  return (
    <section className="group/list relative overflow-hidden rounded-[1.75rem] border border-white/[0.075] bg-[#0d0d11] shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:rounded-[2rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        {backdrop && (
          <img
            src={`https://image.tmdb.org/t/p/w1280${backdrop}`}
            alt=""
            className="h-full w-full scale-105 object-cover opacity-[0.16] blur-[1px] transition-transform duration-[1200ms] group-hover/list:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d0d11_0%,rgba(13,13,17,0.82)_52%,rgba(13,13,17,0.35)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d0d11]" />
      </div>

      <div className="relative z-10 px-5 pb-6 pt-6 sm:px-7 md:px-9 md:pb-9 md:pt-8">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              <span className="text-violet-400">Coleção {String(index + 1).padStart(2, "0")}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>{items.length} {items.length === 1 ? "título" : "títulos"}</span>
              {list.updatedAt && (
                <>
                  <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
                  <span className="hidden items-center gap-1.5 sm:flex">
                    <Calendar size={11} /> {formatDate(list.updatedAt)}
                  </span>
                </>
              )}
            </div>

            <h2 className="max-w-4xl break-words pb-1 text-2xl font-black leading-[1.18] tracking-[-0.035em] text-white sm:text-3xl md:text-[2.15rem]">
              {list.name}
            </h2>
            <p className="mt-2.5 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-500">
              {list.description || "Uma seleção criada por você."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openList}
                className="group/open inline-flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.13em] text-black transition-all hover:bg-violet-100 active:scale-[0.98]"
              >
                Abrir lista
                <ArrowRight size={14} className="transition-transform group-hover/open:translate-x-0.5" />
              </button>

              {list.clonedFrom && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-black/25 px-3 py-2 text-[9px] font-bold text-zinc-400 backdrop-blur-md">
                  <User size={12} /> por @{list.clonedFrom.owner}
                </span>
              )}
              {list.savesCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[9px] font-bold text-violet-300">
                  <Bookmark size={12} /> {list.savesCount} salvos
                </span>
              )}
            </div>
          </div>

          {!selection.isActive && (
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label={`Opções de ${list.name}`}
                onClick={() => setMenuOpen((open) => !open)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-black/30 text-zinc-400 backdrop-blur-xl transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <MoreHorizontal size={20} />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#17171d]/95 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onShareList(list);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <Share2 size={15} className="text-zinc-500" /> Compartilhar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEditList(list);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <Edit3 size={15} className="text-zinc-500" /> Editar lista
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onManageItems(list.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <CheckSquare size={15} className="text-zinc-500" /> Gerenciar itens
                    </button>
                    <div className="my-1 h-px bg-white/[0.06]" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteList(list.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 size={15} /> Excluir lista
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-7 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-black/20 px-6 text-center">
            <Film size={24} className="mb-3 text-zinc-700" />
            <p className="text-sm font-bold text-zinc-300">Nenhum título por aqui ainda</p>
            <p className="mt-1 text-xs text-zinc-600">Adicione um filme ou uma série para começar.</p>
          </div>
        ) : (
          <div className="relative mt-7 border-t border-white/[0.06] pt-6">
            {(railState.left || railState.right) && !selection.isActive && (
              <div className="absolute right-0 top-[-2.85rem] hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  aria-label="Voltar nos itens"
                  disabled={!railState.left}
                  onClick={() => scrollRail("left")}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-25"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Avançar nos itens"
                  disabled={!railState.right}
                  onClick={() => scrollRail("right")}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-25"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}

            <div
              ref={railRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 sm:gap-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item) => {
                const isSelected = selection.items.some(
                  (selected) => selected.listId === list.id && selected.mediaId === item.id,
                );
                const canSelect =
                  selection.isActive &&
                  (selection.activeListId === null || selection.activeListId === list.id);

                return (
                  <div
                    key={`${item.media_type || "movie"}-${item.id}`}
                    className="relative w-[138px] flex-none snap-start sm:w-[158px] md:w-[176px]"
                  >
                    <div className={canSelect ? "pointer-events-none" : ""}>
                      <MediaCard media={item} />
                    </div>
                    {canSelect && (
                      <button
                        type="button"
                        aria-label={isSelected ? "Desmarcar item" : "Selecionar item"}
                        onClick={() => selection.toggleItem(list.id, item.id)}
                        className={`absolute inset-0 z-20 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? "border-red-400 bg-red-950/55 shadow-[inset_0_0_0_3px_rgba(248,113,113,0.18)]"
                            : "border-white/10 bg-black/10 hover:border-white/35 hover:bg-black/25"
                        }`}
                      >
                        <span
                          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl border backdrop-blur-xl ${
                            isSelected
                              ? "border-red-300/30 bg-red-500 text-white"
                              : "border-white/15 bg-black/45 text-white"
                          }`}
                        >
                          {isSelected ? <Check size={16} /> : <span className="h-3.5 w-3.5 rounded-full border-2 border-current" />}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="w-1 flex-none" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
