import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Star,
  Volume2,
  X,
} from "lucide-react";

const SLIDE_DURATION = 14000;
let youtubeApiPromise;

const loadYoutubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
};

const getMediaType = (item) =>
  item.media_type || (item.first_air_date ? "tv" : "movie");

const getYear = (item) =>
  (item.release_date || item.first_air_date || "").slice(0, 4);

export default function Hero({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readyVideoKey, setReadyVideoKey] = useState(null);
  const [videoProgress, setVideoProgress] = useState({
    key: null,
    duration: SLIDE_DURATION / 1000,
    running: false,
  });
  const [progressRevision, setProgressRevision] = useState(0);
  const [cinemaMode, setCinemaMode] = useState({ open: false, startAt: 0 });
  const videoRevealTimeoutRef = useRef(null);
  const videoIframeRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const cinemaIframeRef = useRef(null);
  const cinemaPlayerRef = useRef(null);
  const item = items[currentIndex] || items[0];
  const videoKey = item?.trailerKey || item?.key;

  const closeCinemaMode = useCallback(
    (advanceToNext = false) => {
      const resumeAt =
        cinemaPlayerRef.current?.getCurrentTime?.() || cinemaMode.startAt;

      cinemaPlayerRef.current?.pauseVideo?.();

      if (advanceToNext) {
        setCinemaMode({ open: false, startAt: 0 });
        setCurrentIndex((previous) => (previous + 1) % items.length);
        return;
      }

      const backgroundPlayer = youtubePlayerRef.current;
      if (backgroundPlayer && videoKey) {
        const remainingDuration = Math.max(
          (backgroundPlayer.getDuration?.() || resumeAt + 1) - resumeAt,
          1,
        );
        backgroundPlayer.seekTo?.(resumeAt, true);
        backgroundPlayer.mute?.();
        backgroundPlayer.playVideo?.();
        setVideoProgress({
          key: videoKey,
          duration: remainingDuration,
          running: true,
        });
        setProgressRevision((previous) => previous + 1);
      }

      setCinemaMode({ open: false, startAt: 0 });
    },
    [cinemaMode.startAt, items.length, videoKey],
  );

  useEffect(() => () => {
    window.clearTimeout(videoRevealTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (currentIndex < items.length) return;
    setCurrentIndex(0);
  }, [currentIndex, items.length]);

  useEffect(() => {
    if (items.length <= 1 || videoKey) return undefined;

    const timeout = window.setTimeout(() => {
      setCurrentIndex((previous) => (previous + 1) % items.length);
    }, SLIDE_DURATION);

    return () => window.clearTimeout(timeout);
  }, [currentIndex, items.length, videoKey]);

  useEffect(() => {
    if (!videoKey || !videoIframeRef.current) return undefined;

    let cancelled = false;

    loadYoutubeApi().then((YT) => {
      if (cancelled || !videoIframeRef.current) return;

      youtubePlayerRef.current = new YT.Player(videoIframeRef.current, {
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setVideoProgress((previous) => {
                if (previous.key === videoKey) {
                  return { ...previous, running: true };
                }

                const remainingDuration = Math.max(
                  event.target.getDuration() - event.target.getCurrentTime(),
                  1,
                );
                return {
                  key: videoKey,
                  duration: remainingDuration,
                  running: true,
                };
              });
              return;
            }

            if (
              event.data === YT.PlayerState.BUFFERING ||
              event.data === YT.PlayerState.PAUSED
            ) {
              setVideoProgress((previous) =>
                previous.key === videoKey
                  ? { ...previous, running: false }
                  : previous,
              );
              return;
            }

            if (event.data === YT.PlayerState.ENDED) {
              setCurrentIndex((previous) => (previous + 1) % items.length);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
  }, [items.length, videoKey]);

  useEffect(() => {
    if (!cinemaMode.open || !videoKey || !cinemaIframeRef.current) {
      return undefined;
    }

    let cancelled = false;

    loadYoutubeApi().then((YT) => {
      if (cancelled || !cinemaIframeRef.current) return;

      cinemaPlayerRef.current = new YT.Player(cinemaIframeRef.current, {
        events: {
          onReady: (event) => {
            event.target.unMute();
            event.target.setVolume(100);
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) closeCinemaMode(true);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      cinemaPlayerRef.current?.destroy?.();
      cinemaPlayerRef.current = null;
    };
  }, [cinemaMode.open, closeCinemaMode, videoKey]);

  useEffect(() => {
    if (!cinemaMode.open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeCinemaMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cinemaMode.open, closeCinemaMode]);

  if (items.length === 0) return null;

  const name = item.title || item.name;
  const mediaType = getMediaType(item);
  const year = getYear(item);
  const rating = Number(item.vote_average || 0).toFixed(1);
  const videoIsReady = Boolean(videoKey && readyVideoKey === videoKey);

  const changeSlide = (direction) => {
    setCurrentIndex((previous) => {
      if (direction === "next") return (previous + 1) % items.length;
      return (previous - 1 + items.length) % items.length;
    });
  };

  const openCinemaMode = () => {
    const startAt = youtubePlayerRef.current?.getCurrentTime?.() || 0;
    youtubePlayerRef.current?.pauseVideo?.();
    setCinemaMode({ open: true, startAt });
  };

  return (
    <section
      className="relative w-full h-[88svh] min-h-[620px] max-h-[920px] mb-8 md:mb-12 overflow-hidden bg-zinc-950 isolate"
      aria-label="Destaques"
    >
      <div key={item.id} className="absolute inset-0 hero-slide-reveal">
        <img
          src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
          alt=""
          className={`w-full h-full object-cover object-center hero-ken-burns transition-opacity duration-700 ${
            videoIsReady ? "opacity-0" : "opacity-100"
          }`}
          fetchPriority="high"
        />
        {videoKey && (
          <iframe
            ref={videoIframeRef}
            key={videoKey}
            src={`https://www.youtube.com/embed/${videoKey}?enablejsapi=1&autoplay=1&mute=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&autohide=1&start=2`}
            title={`Trailer de ${name}`}
            className={`pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.03] transition-opacity duration-700 ${
              videoIsReady ? "opacity-100" : "opacity-0"
            }`}
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex="-1"
            onLoad={() => {
              window.clearTimeout(videoRevealTimeoutRef.current);
              videoRevealTimeoutRef.current = window.setTimeout(() => {
                setReadyVideoKey(videoKey);
              }, 2500);
            }}
          />
        )}
        {videoKey && videoIsReady && (
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        )}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.84)_34%,rgba(9,9,11,0.30)_67%,rgba(9,9,11,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#09090b_0%,rgba(9,9,11,0.78)_12%,transparent_52%,rgba(9,9,11,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,transparent_0%,rgba(9,9,11,0.12)_38%,rgba(9,9,11,0.45)_100%)]" />

      <div className="relative z-20 h-full flex items-center px-5 sm:px-8 md:px-12 xl:px-16 pt-24 pb-28 md:pb-32">
        <div key={`copy-${item.id}`} className="w-full max-w-3xl hero-copy-reveal">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 md:w-12 bg-violet-400" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.28em] text-violet-300">
              Seleção CineSorte
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-[3rem] xl:text-[3.45rem] 2xl:text-[4rem] font-black text-white leading-[0.94] tracking-[-0.04em] drop-shadow-2xl text-balance">
            {name}
          </h1>

          <div className="mt-5 md:mt-7 flex flex-wrap items-center gap-2.5 md:gap-3 text-xs md:text-sm font-semibold text-zinc-200">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1.5 text-yellow-200 backdrop-blur-md">
              <Star size={14} className="fill-yellow-300 text-yellow-300" />
              {rating}
            </span>
            {year && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">
                <Calendar size={14} /> {year}
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 uppercase tracking-wider backdrop-blur-md">
              {mediaType === "tv" ? "Série" : "Filme"}
            </span>
          </div>

          {item.overview && (
            <p className="mt-5 md:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-zinc-300 line-clamp-3 leading-relaxed drop-shadow-lg">
              {item.overview}
            </p>
          )}

          <div className="mt-7 md:mt-9 flex items-center gap-3">
            <Link
              to={`/app/${mediaType}/${item.id}`}
              className="group/button inline-flex items-center gap-3 rounded-full bg-white px-6 md:px-8 py-3 md:py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-black/20 transition-all hover:bg-violet-100 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              Ver detalhes
              <ArrowRight
                size={18}
                className="transition-transform group-hover/button:translate-x-1"
              />
            </Link>

            {videoKey && (
              <button
                type="button"
                onClick={openCinemaMode}
                className="group/trailer inline-flex h-11 md:h-12 items-center gap-2.5 rounded-full border border-white/15 bg-black/30 px-4 md:px-5 text-xs md:text-sm font-bold text-white backdrop-blur-md transition-all hover:border-violet-300/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <Volume2 size={17} className="text-violet-300" />
                <span className="hidden sm:inline">Assistir trailer</span>
                <Maximize2
                  size={15}
                  className="opacity-60 transition-transform group-hover/trailer:scale-110"
                />
              </button>
            )}

            {items.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeSlide("previous")}
                  aria-label="Destaque anterior"
                  className="grid h-11 w-11 md:h-12 md:w-12 place-items-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => changeSlide("next")}
                  aria-label="Próximo destaque"
                  className="grid h-11 w-11 md:h-12 md:w-12 place-items-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute right-6 xl:right-10 top-1/2 z-30 hidden lg:flex -translate-y-1/2 flex-col items-end gap-2.5">
          <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            A seguir
          </span>
          {items.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                type="button"
                key={`${slide.id}-${index}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Exibir ${slide.title || slide.name}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative overflow-hidden rounded-xl border text-left shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  isActive
                    ? "w-52 xl:w-60 border-violet-400/70 opacity-100"
                    : "w-40 xl:w-44 border-white/10 opacity-55 hover:w-48 hover:opacity-90"
                }`}
              >
                <div className="relative aspect-[16/5]">
                  <img
                    src={`https://image.tmdb.org/t/p/w300${slide.backdrop_path}`}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
                  <span className="absolute inset-y-0 left-3 flex max-w-[75%] items-center text-[11px] font-bold text-white line-clamp-2">
                    {slide.title || slide.name}
                  </span>
                  {isActive && (
                    <span
                      key={`progress-${currentIndex}-${progressRevision}`}
                      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-violet-400 hero-progress"
                      style={{
                        animationDuration: videoKey
                          ? `${videoProgress.duration}s`
                          : `${SLIDE_DURATION / 1000}s`,
                        animationPlayState:
                          videoKey &&
                          (videoProgress.key !== videoKey || !videoProgress.running)
                            ? "paused"
                            : "running",
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-14 inset-x-5 z-30 flex lg:hidden items-center gap-2">
          <span className="mr-1 text-[10px] font-black tabular-nums text-white/70">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          {items.map((slide, index) => (
            <button
              type="button"
              key={`${slide.id}-${index}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Exibir ${slide.title || slide.name}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-9 bg-violet-400"
                  : "w-4 bg-white/25"
              }`}
            />
          ))}
          <span className="ml-1 text-[10px] font-black tabular-nums text-white/35">
            {String(items.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {cinemaMode.open &&
        videoKey &&
        createPortal(
          <div
          className="fixed inset-0 z-[100] bg-black trailer-cinema-enter"
          role="dialog"
          aria-modal="true"
          aria-label={`Trailer de ${name}`}
        >
          <iframe
            ref={cinemaIframeRef}
            src={`https://www.youtube.com/embed/${videoKey}?enablejsapi=1&autoplay=1&mute=0&controls=1&disablekb=0&fs=1&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&start=${Math.floor(cinemaMode.startAt)}`}
            title={`Trailer de ${name} em tela cheia`}
            className="absolute inset-0 h-full w-full trailer-cinema-video-enter"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="absolute left-5 md:left-8 top-5 md:top-7 z-20 max-w-[70%]">
            <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">
              Modo cinema
            </span>
            <span className="mt-1 block truncate text-sm md:text-base font-bold text-white/90">
              {name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => closeCinemaMode(false)}
            aria-label="Fechar trailer"
            className="absolute right-5 md:right-8 top-5 md:top-7 z-30 grid h-11 w-11 md:h-12 md:w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-xl transition-all hover:scale-105 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <X size={22} />
          </button>
          </div>,
          document.body,
        )}
    </section>
  );
}
