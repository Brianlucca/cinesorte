import { ArrowRight, ChevronDown, Globe, Library, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouletteLogic } from "@features/roulette/hooks/useRouletteLogic";
import GenreSelector from "@features/roulette/components/GenreSelector";
import RouletteHeader from "@features/roulette/components/RouletteHeader";

const getImageUrl = (path, size = "w780") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);

function SourceButton({ active, disabled, icon: Icon, label, description, onClick }) {
  const SourceIcon = Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex min-w-0 flex-1 items-center gap-2 border-b-2 px-2 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "border-violet-400 text-white"
          : "border-transparent text-zinc-500 hover:text-zinc-200"
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center transition-colors ${
          active
            ? "text-violet-300"
            : "text-zinc-600 group-hover:text-violet-300"
        }`}
      >
        <SourceIcon size={15} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold">{label}</span>
        <span className="sr-only">{description}</span>
      </span>
    </button>
  );
}

function PreviewCard({ previewMedia, isSpinning, isWinner }) {
  const imageUrl = getImageUrl(previewMedia?.backdrop_path || previewMedia?.poster_path, "w1280");
  const year = (previewMedia?.release_date || previewMedia?.first_air_date || "").slice(0, 4);
  const mediaType = previewMedia?.media_type || (previewMedia?.first_air_date ? "tv" : "movie");

  return (
    <section className="relative w-full">
      <div className="relative aspect-[16/10] min-h-[380px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] md:aspect-[16/9] md:min-h-[470px] xl:min-h-[560px]">
          {imageUrl ? (
            <div className="relative h-full w-full animate-in fade-in zoom-in-95 duration-500">
              <img src={imageUrl} className={`h-full w-full object-cover transition duration-300 ${isSpinning ? "scale-[1.03] blur-[1px]" : ""}`} alt={previewMedia?.title || previewMedia?.name || "Preview"} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/15 to-black/5" />
            </div>
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.16),transparent_32%),linear-gradient(145deg,#14151a,#090a0d)] p-8 text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-violet-300">
                  <Sparkles size={23} className={isSpinning ? "animate-pulse" : ""} />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-zinc-100 md:text-2xl">O que vamos assistir?</h2>
                <p className="mt-2 text-sm text-zinc-500">A escolha aparece aqui quando a roleta começar.</p>
              </div>
            </div>
          )}

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
          {previewMedia ? (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                {isSpinning ? "A roleta está girando" : isWinner ? "Resultado da roleta" : "Na tela agora"}
              </p>
              <h3 className="mt-2 line-clamp-2 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl xl:text-[3.4rem]">
                {previewMedia.title || previewMedia.name}
              </h3>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-300/80">
                {year && <span>{year}</span>}
                {year && <span className="h-1 w-1 rounded-full bg-violet-400" />}
                <span>{mediaType === "tv" ? "Série" : "Filme"}</span>
              </div>
              {isWinner && (
                <Link
                  to={`/app/${mediaType}/${previewMedia.id}`}
                  className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100"
                >
                  Ver detalhes
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function MovieRoulette() {
  const { state, actions } = useRouletteLogic();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111216] pb-24 text-white animate-in fade-in duration-700">
      <div className="relative mx-auto w-full max-w-[1680px] px-4 pt-7 sm:px-6 md:px-10 md:pt-10 xl:px-14 2xl:px-16">
        <RouletteHeader isSpinning={state.loading} />

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start xl:gap-8">
          <main className="min-w-0">
            <PreviewCard
              previewMedia={state.previewMedia}
              isSpinning={state.loading}
              isWinner={Boolean(state.winner && state.winner.id === state.previewMedia?.id)}
            />
          </main>

          <aside className="space-y-6 rounded-xl border border-white/[0.06] bg-[#181a20] p-4 md:p-5 xl:sticky xl:top-6">
            <section>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Origem</p>
                  <h2 className="mt-1 text-base font-semibold text-zinc-100">Escolha o catálogo</h2>
                </div>
                {state.source === "user" && (
                  <span className="hidden rounded-full bg-violet-500/10 px-2.5 py-1.5 text-[9px] font-semibold text-violet-200 sm:inline-flex">
                    {state.userLists.length} listas
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 border-b border-white/[0.08]">
                <SourceButton
                  active={state.source === "global"}
                  icon={Globe}
                  label="Global"
                  description="Filmes e séries populares do catálogo geral."
                  onClick={() => actions.setSource("global")}
                />
                <SourceButton
                  active={state.source === "user"}
                  disabled={state.userLists.length === 0}
                  icon={Library}
                  label="Minhas listas"
                  description="Sorteie apenas títulos salvos na sua biblioteca."
                  onClick={() => actions.setSource("user")}
                />
              </div>

              {state.source === "user" && (
                <div className="mt-3">
                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Lista
                  </label>
                  <div className="relative">
                    <select
                      value={state.selectedListId}
                      onChange={(event) => actions.setSelectedListId(event.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 pr-10 text-xs font-medium text-white outline-none transition-colors focus:border-violet-400/50"
                    >
                      <option value="all" className="bg-zinc-900">Todas as listas</option>
                      {state.userLists.map((list) => (
                        <option key={list.id} value={list.id} className="bg-zinc-900">{list.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>
              )}
            </section>

            <GenreSelector genres={state.genres} selectedGenre={state.selectedGenre} onSelect={actions.setSelectedGenre} />

            <button
              type="button"
              onClick={actions.spinRoulette}
              disabled={state.loading}
              className="group flex w-full items-center justify-between gap-4 rounded-xl bg-white px-4 py-3.5 text-left text-zinc-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {state.loading ? "Sorteando agora" : "Sua próxima escolha"}
                </span>
                <span className="mt-0.5 block text-base font-semibold sm:text-lg">
                  {state.loading ? "Misturando opções..." : "Girar roleta"}
                </span>
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-white transition-transform group-hover:scale-105">
                <RefreshCw size={16} className={state.loading ? "animate-spin" : "transition-transform duration-700 group-hover:rotate-180"} />
              </span>
            </button>
          </aside>
        </div>
      </div>

    </div>
  );
}
