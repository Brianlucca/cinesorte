import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Play,
  Star,
  X,
} from "lucide-react";
import {
  deleteWatchProgress,
  getExtensionStatus,
  getWatchProgress,
} from "@shared/api/api";

const IMAGE = "https://image.tmdb.org/t/p/w780";
const PROVIDERS = {
  netflix: "Netflix",
  "prime-video": "Prime Video",
  "disney-plus": "Disney+",
  max: "Max",
  globoplay: "Globoplay",
  "paramount-plus": "Paramount+",
  "apple-tv-plus": "Apple TV+",
  crunchyroll: "Crunchyroll",
};
const EXTENSION_ID = "mpkpfhbinipldbhpemhmpkdinmikfjoh";
const IS_EDGE_BROWSER =
  typeof navigator !== "undefined" &&
  /Edg(?:A|iOS)?\//.test(navigator.userAgent);

function time(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}min`
    : `${minutes}min`;
}

function detailsPath(item) {
  if (!item.tmdbId) return null;
  if (item.mediaType === "tv" && item.seasonNumber && item.episodeNumber)
    return `/app/tv/${item.tmdbId}/season/${item.seasonNumber}/episode/${item.episodeNumber}`;
  return `/app/${item.mediaType === "tv" ? "tv" : "movie"}/${item.tmdbId}`;
}

function realProgress(item) {
  return Number(item?.durationSeconds) > 0
    ? Math.min(
        100,
        Math.round(
          (Number(item.positionSeconds) / Number(item.durationSeconds)) * 100,
        ),
      )
    : 0;
}

export default function ContinueWatching() {
  const rowRef = useRef(null);
  const [items, setItems] = useState([]);
  const [extensionState, setExtensionState] = useState({
    installed: false,
    connected: false,
    loading: true,
  });

  useEffect(() => {
    const loadProgress = () =>
      getWatchProgress()
        .then((data) => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]));
    const loadExtensionState = async () => {
      const installed = await new Promise((resolve) => {
        if (!window.chrome?.runtime?.sendMessage) return resolve(false);
        window.chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: "CINESORTE_PING" },
          (result) =>
            resolve(Boolean(result?.ok && !window.chrome.runtime.lastError)),
        );
      });
      const status = await getExtensionStatus().catch(() => ({
        connected: false,
      }));
      setExtensionState({
        installed,
        connected: installed && Boolean(status?.connected),
        loading: false,
      });
    };
    loadProgress();
    if (IS_EDGE_BROWSER) loadExtensionState();
    const progressTimer = window.setInterval(loadProgress, 30000);
    const statusTimer = IS_EDGE_BROWSER
      ? window.setInterval(loadExtensionState, 15000)
      : null;
    const refresh = () =>
      document.visibilityState === "visible" && loadExtensionState();
    if (IS_EDGE_BROWSER) {
      document.addEventListener("visibilitychange", refresh);
      window.addEventListener("focus", refresh);
    }
    return () => {
      window.clearInterval(progressTimer);
      if (statusTimer) window.clearInterval(statusTimer);
      if (IS_EDGE_BROWSER) {
        document.removeEventListener("visibilitychange", refresh);
        window.removeEventListener("focus", refresh);
      }
    };
  }, []);

  async function remove(id) {
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await deleteWatchProgress(id);
      if (window.chrome?.runtime?.sendMessage)
        window.chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: "CINESORTE_PROGRESS_DELETED", id },
          () => void window.chrome.runtime.lastError,
        );
    } catch {
      getWatchProgress().then(setItems);
    }
  }

  const continueItems = items.filter(
    (item) => Number(item.durationSeconds) > 0,
  );
  const reviewItem = items.find(
    (item) => realProgress(item) >= 85 && detailsPath(item),
  );

  const canShowContinueWatching =
    IS_EDGE_BROWSER &&
    !extensionState.loading &&
    extensionState.installed &&
    extensionState.connected &&
    continueItems.length > 0;

  if (!canShowContinueWatching) return null;

  function slide(direction) {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: (direction === "left" ? -1 : 1) * rowRef.current.clientWidth * 0.75,
      behavior: "smooth",
    });
  }

  return (
    <section className="group/row relative z-30 px-5 sm:px-6 md:px-10 xl:px-14 2xl:px-16">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-300/70">
            Sincronizado pela extensão
          </span>
          <h2 className="mt-1 flex items-center gap-3 text-lg font-semibold tracking-[-0.02em] text-zinc-100 sm:text-xl md:text-2xl">
            Continue de onde parou
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {continueItems.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Voltar em Continue de onde parou"
                onClick={() => slide("left")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Avançar em Continue de onde parou"
                onClick={() => slide("right")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {reviewItem && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-300/15 bg-gradient-to-r from-yellow-300/[0.08] to-violet-500/[0.06] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-300/10 text-yellow-200">
              <Star size={16} />
            </span>
            <div>
              <p className="text-xs font-black text-white">
                Terminou{" "}
                {reviewItem.episodeTitle ||
                  reviewItem.mediaTitle ||
                  reviewItem.title}
                ?
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Conte para a comunidade o que achou.
              </p>
            </div>
          </div>
          <Link
            to={`${detailsPath(reviewItem)}?avaliar=1#avaliacoes`}
            className="rounded-xl bg-white px-3.5 py-2 text-xs font-black text-zinc-950 transition hover:bg-yellow-100"
          >
            Avaliar agora
          </Link>
        </div>
      )}

      {continueItems.length > 0 ? (
        <div
          ref={rowRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-hide md:snap-none"
        >
          {continueItems.slice(0, 10).map((item) => {
            const percent = realProgress(item);
            const details = detailsPath(item);
            return (
              <article
                key={item.id}
                className="group relative h-44 w-[280px] flex-none snap-start overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] sm:w-[330px]"
              >
                {item.thumbnailUrl || item.backdropPath || item.posterPath ? (
                  <img
                    src={
                      item.thumbnailUrl ||
                      `${IMAGE}${item.backdropPath || item.posterPath}`
                    }
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-500 group-hover:scale-105 group-hover:opacity-55"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label="Remover"
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-zinc-400 opacity-0 transition group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                    {PROVIDERS[item.provider] || item.provider}
                  </span>
                  <h3 className="mt-1 truncate text-lg font-black text-white">
                    {item.mediaTitle || item.title}
                  </h3>
                  {item.seasonNumber && item.episodeNumber && (
                    <p className="mt-0.5 truncate text-[10px] font-bold text-zinc-300">
                      T{item.seasonNumber} · E{item.episodeNumber}
                      {item.episodeTitle ? ` — ${item.episodeTitle}` : ""}
                    </p>
                  )}
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                    <span
                      className="block h-full bg-violet-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{time(item.positionSeconds)} assistidos</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3 text-[11px] font-semibold text-zinc-950 transition-colors hover:bg-violet-100"
                    >
                      <Play size={12} fill="currentColor" />
                      {percent >= 85 ? "Assistir novamente" : "Continuar"}
                    </a>
                    {details && (
                      <Link
                        to={details}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs font-black text-white transition hover:bg-white/10"
                      >
                        <Info size={13} />
                        Detalhes
                      </Link>
                    )}
                    {details && percent >= 85 && (
                      <Link
                        to={`${details}?avaliar=1#avaliacoes`}
                        aria-label="Avaliar"
                        className="ml-auto rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-2 text-yellow-200 transition hover:bg-yellow-300/20"
                      >
                        <Star size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-6 text-sm text-zinc-500">
          Conecte a extensão e assista em um streaming para seus títulos
          aparecerem aqui.
        </div>
      )}
    </section>
  );
}
