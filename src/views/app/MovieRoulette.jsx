import { Calendar, ChevronDown, Clapperboard, Globe, Library, RefreshCw, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouletteLogic } from "../../hooks/useRouletteLogic";
import GenreSelector from "../../components/roulette/GenreSelector";
import RouletteHeader from "../../components/roulette/RouletteHeader";
import Modal from "../../components/ui/Modal";

const getImageUrl = (path, size = "w780") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);

function SourceButton({ active, disabled, icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex min-h-[74px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "border-violet-400/20 bg-violet-500/12 text-white"
          : "border-white/[0.07] bg-white/[0.025] text-zinc-400 hover:border-white/[0.11] hover:bg-white/[0.045] hover:text-zinc-100"
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${
          active
            ? "border-violet-400/20 bg-violet-500/15 text-violet-200"
            : "border-white/[0.06] bg-black/20 text-zinc-500 group-hover:text-violet-300"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs leading-4 text-zinc-600">{description}</span>
      </span>
    </button>
  );
}

function PreviewCard({ previewMedia, isSpinning }) {
  const posterUrl = getImageUrl(previewMedia?.poster_path);

  return (
    <section className="relative mx-auto w-full max-w-[380px]">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0d0d11] shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
        <div className="aspect-[2/3]">
          {posterUrl ? (
            <div className="relative h-full w-full animate-in fade-in zoom-in-95 duration-500">
              <img src={posterUrl} className="h-full w-full object-cover" alt={previewMedia?.title || previewMedia?.name || "Preview"} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-transparent to-transparent" />
            </div>
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.20),transparent_35%),linear-gradient(145deg,#111116,#08080b)] p-8 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                  <Sparkles size={28} className={isSpinning ? "animate-pulse" : ""} />
                </span>
                <h2 className="mt-6 text-2xl font-black tracking-normal text-zinc-100">Gire a sorte</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">O pôster sorteado aparece aqui durante a roleta.</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          {previewMedia ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-violet-200">
                {isSpinning ? "Sorteando agora" : "Último preview"}
              </p>
              <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-white">
                {previewMedia.title || previewMedia.name}
              </h3>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ResultModal({ winner, isOpen, onClose, onTryAnother }) {
  const backdropUrl = getImageUrl(winner?.backdrop_path || winner?.poster_path, "w1280");
  const posterUrl = getImageUrl(winner?.poster_path, "w500");
  const title = winner?.title || winner?.name;
  const year = winner?.release_date?.split("-")[0] || winner?.first_air_date?.split("-")[0];
  const mediaType = winner?.media_type === "tv" ? "Série" : "Filme";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {winner && (
        <div className="relative min-h-[560px] overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0d0d11] shadow-2xl">
          {backdropUrl && (
            <img
              src={backdropUrl}
              className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm"
              alt={title}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(139,92,246,0.18),transparent_34%),linear-gradient(90deg,#0d0d11_0%,rgba(13,13,17,0.94)_48%,rgba(13,13,17,0.82)_100%)]" />

          <div className="relative z-10 grid min-h-[560px] grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]">
            <div className="border-b border-white/[0.07] bg-black/20 p-5 md:border-b-0 md:border-r md:p-6">
              <div className="mx-auto max-w-[240px] md:max-w-none">
                <div className="overflow-hidden rounded-[1.25rem] border border-white/[0.10] bg-zinc-900 shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
                  <div className="aspect-[2/3]">
                    {posterUrl ? (
                      <img src={posterUrl} alt={title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center bg-white/[0.035] text-zinc-600">
                        <Clapperboard size={34} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between p-5 md:p-8">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/15 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-violet-200">
                    <Sparkles size={13} />
                    Resultado da roleta
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Escolha sorteada
                  </span>
                </div>

                <h2 className="max-w-3xl text-3xl font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
                  {title}
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm font-medium text-zinc-300 backdrop-blur-xl">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    {winner.vote_average?.toFixed(1) || "N/A"}
                  </span>
                  {year && (
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm font-medium text-zinc-300 backdrop-blur-xl">
                      <Calendar size={16} className="text-violet-300" />
                      {year}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm font-medium text-zinc-300 backdrop-blur-xl">
                    <Clapperboard size={16} className="text-cyan-300" />
                    {mediaType}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4 md:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">Sinopse</p>
                  <p className="mt-3 line-clamp-6 text-sm font-medium leading-7 text-zinc-300 md:text-base">
                    {winner.overview || "Nenhuma sinopse disponível para este título no momento."}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  to={`/app/${winner.media_type || "movie"}/${winner.id}`}
                  className="rounded-xl bg-white px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-950 transition-colors hover:bg-violet-100"
                >
                  Ver detalhes
                </Link>
                <button
                  type="button"
                  onClick={onTryAnother}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.045] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-100 transition-colors hover:bg-white/[0.08]"
                >
                  Tentar outro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function MovieRoulette() {
  const { state, actions } = useRouletteLogic();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white animate-in fade-in duration-700">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.10),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.055),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 md:px-10 md:pt-10 xl:px-14">
        <RouletteHeader isSpinning={state.loading} />

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-10">
          <main className="min-w-0 space-y-5">
            <section className="rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Origem do sorteio</p>
                  <h2 className="mt-1 text-lg font-black text-zinc-100">Escolha o catálogo</h2>
                </div>
                {state.source === "user" && (
                  <span className="hidden rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-violet-200 sm:inline-flex">
                    {state.userLists.length} listas
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                <div className="mt-4 max-w-md">
                  <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Lista
                  </label>
                  <div className="relative">
                    <select
                      value={state.selectedListId}
                      onChange={(event) => actions.setSelectedListId(event.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 pr-11 text-sm font-medium text-white outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.035]"
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
              className="group flex min-h-[86px] w-full items-center justify-between gap-4 rounded-[1.5rem] border border-violet-400/20 bg-[linear-gradient(145deg,rgba(139,92,246,0.20),rgba(255,255,255,0.035)_48%)] p-4 text-left shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-colors hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-55 sm:px-5"
            >
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-violet-200">
                  {state.loading ? "Sorteando" : "Pronto para girar"}
                </span>
                <span className="mt-1 block text-xl font-black text-white sm:text-2xl">
                  {state.loading ? "Misturando opções..." : "Girar roleta"}
                </span>
              </span>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-zinc-950 transition-transform group-hover:scale-105">
                <RefreshCw size={20} className={state.loading ? "animate-spin" : "transition-transform duration-700 group-hover:rotate-180"} />
              </span>
            </button>
          </main>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <PreviewCard previewMedia={state.previewMedia} isSpinning={state.loading} />
          </aside>
        </div>
      </div>

      <ResultModal
        winner={state.winner}
        isOpen={state.isModalOpen}
        onClose={actions.closeModal}
        onTryAnother={() => {
          actions.closeModal();
          actions.spinRoulette();
        }}
      />
    </div>
  );
}
