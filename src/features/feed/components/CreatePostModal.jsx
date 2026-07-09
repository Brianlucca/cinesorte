import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Film,
  Loader2,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import RichTextToolbar from "@features/media/components/reviews/RichTextToolbar";

const PRIVILEGED_LEVELS = new Set([
  "mestre da critica",
  "oraculo da setima arte",
  "entidade cinematografica",
  "divindade do cinema",
]);

const normalizeLevelTitle = (title) =>
  (title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function CreatePostModal({ isOpen, onClose, form, actions, user }) {
  const [animateShow, setAnimateShow] = useState(false);
  const textareaRef = useRef(null);
  const canUseRichFormatting = PRIVILEGED_LEVELS.has(normalizeLevelTitle(user?.levelTitle));

  useEffect(() => {
    if (!isOpen) {
      setAnimateShow(false);
      return undefined;
    }

    const timeout = window.setTimeout(() => setAnimateShow(true), 10);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const updateText = (value) => actions.setPostText(value.slice(0, 500));
  const mediaTitle = form.media?.title || form.media?.name;
  const releaseYear = (form.media?.release_date || form.media?.first_air_date || "").split("-")[0];
  const backdropUrl = form.media?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${form.media.backdrop_path}`
    : null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-end justify-center p-0 transition-opacity duration-300 sm:items-center sm:p-5 ${animateShow ? "opacity-100" : "opacity-0"}`}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 cursor-default bg-black/85 backdrop-blur-xl" onClick={onClose} />

      <div
        className={`relative flex max-h-[94svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#0b0b0e]/98 shadow-[0_40px_120px_rgba(0,0,0,0.75)] transition-all duration-500 sm:rounded-[2rem] ${animateShow ? "translate-y-0 scale-100" : "translate-y-10 scale-[0.98]"}`}
      >
        <header className="relative z-30 flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0b0b0e]/90 px-5 py-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Film size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white sm:text-lg">Nova avaliação</h2>
              <div className="mt-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em]">
                <span className={form.step === 1 ? "text-violet-300" : "text-emerald-400"}>{form.step === 1 ? "1. Escolha a obra" : <><Check size={10} className="mr-1 inline" /> Obra escolhida</>}</span>
                <span className="text-zinc-700">/</span>
                <span className={form.step === 2 ? "text-violet-300" : "text-zinc-600"}>2. Escreva sua review</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white">
            <X size={18} />
          </button>
        </header>

        {form.step === 1 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Comece pelo título</span>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">O que passou pela sua tela?</h3>
              <p className="mt-2 text-sm text-zinc-500">Busque um filme ou uma série para compartilhar sua experiência.</p>

              <div className="group relative mt-6">
                <Search size={19} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite o nome de um filme ou série..."
                  value={form.query}
                  onChange={(event) => actions.setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] py-4 pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/35 focus:bg-white/[0.05] sm:text-base"
                />
                {form.query && (
                  <button type="button" onClick={() => actions.setSearchQuery("")} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-zinc-600 hover:bg-white/[0.05] hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="content-scrollbar min-h-[280px] flex-1 overflow-y-auto border-t border-white/[0.06] px-4 py-4 sm:px-7 sm:py-5">
              {form.results.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {form.results.map((item) => {
                    const itemYear = (item.release_date || item.first_air_date || "").split("-")[0];
                    return (
                      <button
                        key={`${item.media_type}-${item.id}`}
                        type="button"
                        onClick={() => actions.handleSelectMedia(item)}
                        className="group relative flex min-h-[128px] overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-white/[0.025] p-3 text-left transition-all hover:border-violet-400/25 hover:bg-white/[0.045]"
                      >
                        {item.backdrop_path && (
                          <>
                            <img src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" alt="" />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#101014]/90 to-[#101014]/70" />
                          </>
                        )}
                        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                          {item.poster_path || item.profile_path ? (
                            <img src={`https://image.tmdb.org/t/p/w154${item.poster_path || item.profile_path}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                          ) : (
                            <Film size={19} className="m-auto h-full text-zinc-700" />
                          )}
                        </div>
                        <div className="relative flex min-w-0 flex-1 flex-col justify-center px-4">
                          <span className="text-[8px] font-black uppercase tracking-[0.16em] text-violet-400">{item.media_type === "tv" ? "Série" : "Filme"}</span>
                          <h4 className="mt-1.5 line-clamp-2 text-sm font-black leading-5 text-zinc-100 transition-colors group-hover:text-violet-200 sm:text-base">{item.title || item.name}</h4>
                          <div className="mt-2 flex items-center gap-3 text-[10px] font-bold text-zinc-600">
                            <span>{itemYear || "Ano não informado"}</span>
                            {item.vote_average > 0 && <span className="inline-flex items-center gap-1 text-yellow-400"><Star size={10} className="fill-current" /> {Number(item.vote_average).toFixed(1)}</span>}
                          </div>
                        </div>
                        <span className="relative self-center text-zinc-700 transition-all group-hover:translate-x-1 group-hover:text-violet-400"><ArrowRight size={16} /></span>
                      </button>
                    );
                  })}
                </div>
              ) : form.query.length > 2 ? (
                <div className="grid min-h-[260px] place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.035] text-zinc-700"><Film size={24} /></div>
                    <h4 className="mt-4 text-sm font-black text-zinc-400">Nenhum título encontrado</h4>
                    <p className="mt-2 text-xs text-zinc-600">Tente buscar pelo título original ou por menos palavras.</p>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[260px] place-items-center text-center">
                  <div className="max-w-xs">
                    <Search size={30} className="mx-auto text-zinc-800" />
                    <p className="mt-4 text-xs font-bold uppercase leading-5 tracking-[0.16em] text-zinc-700">Os resultados aparecerão aqui enquanto você digita</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {form.step === 2 && (
          <div className="content-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="relative h-44 overflow-hidden sm:h-52">
              {backdropUrl ? (
                <img src={backdropUrl} className="absolute inset-0 h-full w-full object-cover" alt="" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.2),transparent_55%)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,14,0.92),rgba(11,11,14,0.28)_70%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent" />
              <button type="button" onClick={() => actions.setPostStep(1)} className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-xl transition-colors hover:bg-black/55 sm:left-7">
                <ChevronLeft size={13} /> Alterar título
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-5 pb-4 sm:gap-5 sm:px-7 sm:pb-5">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-2xl sm:h-28 sm:w-[74px]">
                  {form.media?.poster_path ? <img src={`https://image.tmdb.org/t/p/w342${form.media.poster_path}`} className="h-full w-full object-cover" alt="" /> : <Film size={20} className="m-auto h-full text-zinc-700" />}
                </div>
                <div className="min-w-0 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">Sua próxima publicação</span>
                  <h3 className="mt-1 line-clamp-2 text-xl font-black leading-tight tracking-[-0.025em] text-white sm:text-3xl">{mediaTitle}</h3>
                  <div className="mt-2 flex items-center gap-3 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>{form.media?.media_type === "tv" ? "Série" : "Filme"}</span>
                    {releaseYear && <span className="inline-flex items-center gap-1.5"><Calendar size={11} /> {releaseYear}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-5 pb-6 pt-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_210px] lg:gap-7">
              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">Escreva sua experiência</span>
                    <h4 className="mt-1 text-lg font-black">O que essa obra deixou em você?</h4>
                  </div>
                  {canUseRichFormatting && <span className="hidden items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-violet-300 sm:inline-flex"><Sparkles size={10} /> Formatação elite</span>}
                </div>

                <RichTextToolbar
                  inputRef={textareaRef}
                  onChange={updateText}
                  allowFormatting={canUseRichFormatting}
                  allowSpoiler
                  allowEmoji
                  allowTemplates
                />

                <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-black/20 transition-colors focus-within:border-violet-400/30">
                  <textarea
                    ref={textareaRef}
                    value={form.text}
                    onChange={(event) => updateText(event.target.value)}
                    placeholder="Fale sobre a história, as atuações, o que funcionou — ou simplesmente sobre como você se sentiu..."
                    maxLength={500}
                    className="min-h-[190px] w-full resize-none bg-transparent p-5 text-sm leading-7 text-zinc-100 outline-none placeholder:text-zinc-600 sm:min-h-[220px] sm:text-[15px]"
                    autoFocus
                  />
                  <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                    <span className="text-[9px] leading-4 text-zinc-600">Use <strong className="text-zinc-500">||texto||</strong> para esconder spoilers</span>
                    <span className={`text-[10px] font-black ${form.text.length > 450 ? "text-amber-400" : "text-zinc-600"}`}>{form.text.length}/500</span>
                  </div>
                </div>
              </div>

              <aside className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] p-5 lg:self-start">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">Sua nota</span>
                <div className="mt-2 flex items-end gap-1">
                  <strong className="text-4xl font-black tracking-[-0.05em] text-white">{form.rating}</strong>
                  <span className="mb-1 text-xs font-bold text-zinc-600">/ 5</span>
                </div>
                <div className="mt-4 flex gap-1.5 lg:flex-wrap">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => actions.setRating(star)} className="transition-transform hover:scale-110 active:scale-90" aria-label={`${star} estrelas`}>
                      <Star size={23} className={star <= form.rating ? "fill-yellow-300 text-yellow-300" : "fill-white/[0.035] text-zinc-700"} />
                    </button>
                  ))}
                </div>
                <p className="mt-5 border-t border-white/[0.06] pt-4 text-[10px] leading-5 text-zinc-600">Sua nota e seu texto aparecerão juntos no Feed Social.</p>
              </aside>
            </div>

            <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-white/[0.07] bg-[#0b0b0e]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
              <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-bold text-zinc-500 transition-colors hover:text-white">Cancelar</button>
              <button
                type="button"
                onClick={actions.handlePostSubmit}
                disabled={form.isSubmitting || !form.text.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-black text-zinc-950 transition-all hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {form.isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <><span>Publicar review</span><ArrowRight size={15} /></>}
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
