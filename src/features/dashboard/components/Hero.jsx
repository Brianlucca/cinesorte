import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TrailerModal from "@features/media/components/TrailerModal";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Radio,
  Star,
  UsersRound,
  Volume2,
} from "lucide-react";

export const HERO_SLIDE_DURATION = 14000;
const SLIDE_DURATION = HERO_SLIDE_DURATION;
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

export default function Hero({
  items = [],
  initialIndex = 0,
  initialSlideElapsed = 0,
  onSlideChange,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
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
  const firstSlideTimerRef = useRef(true);
  const didMountIndexRef = useRef(false);
  const item = items[currentIndex] || items[0];
  const isLive = item?.kind === "watch-party";
  const videoKey = isLive ? null : item?.trailerKey || item?.key;
  const upcomingSlides = Array.from(
    { length: Math.min(3, Math.max(items.length - 1, 0)) },
    (_, offset) => {
      const index = (currentIndex + offset + 1) % items.length;
      return { slide: items[index], index };
    },
  );

  const closeCinemaMode = useCallback(
    (advanceToNext = false, resumeAt = cinemaMode.startAt) => {
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
    if (items.length <= 1 || cinemaMode.open) return undefined;

    const duration = firstSlideTimerRef.current
      ? Math.max(SLIDE_DURATION - initialSlideElapsed, 250)
      : SLIDE_DURATION;
    firstSlideTimerRef.current = false;

    const timeout = window.setTimeout(() => {
      setCurrentIndex((previous) => (previous + 1) % items.length);
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [cinemaMode.open, currentIndex, initialSlideElapsed, items.length]);

  useEffect(() => {
    if (!didMountIndexRef.current) {
      didMountIndexRef.current = true;
      return;
    }

    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

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

  if (items.length === 0) return null;

  const name = item.title || item.name;
  const mediaType = getMediaType(item);
  const year = getYear(item);
  const rating = Number(item.vote_average || 0).toFixed(1);
  const videoIsReady = Boolean(videoKey && readyVideoKey === videoKey);
  const backdrop = isLive
    ? item.backdrop_path
    : `https://image.tmdb.org/t/p/original${item.backdrop_path}`;

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

  const handleCinemaClose = (resumeAt) => closeCinemaMode(false, resumeAt);
  const handleCinemaEnded = () => closeCinemaMode(true);

  return (
    <section
      className="relative isolate mb-6 h-[64svh] min-h-[500px] max-h-[680px] w-full overflow-hidden bg-[#111216] md:mb-10"
      aria-label="Destaques"
    >
      <div key={item.id} className="absolute inset-0 hero-slide-reveal">
        {backdrop ? <img
          src={backdrop}
          alt=""
          className={`w-full h-full object-cover object-center hero-ken-burns transition-opacity duration-700 ${
            videoIsReady ? "opacity-0" : "opacity-100"
          }`}
          fetchPriority="high"
        /> : <div className="h-full w-full bg-[radial-gradient(circle_at_70%_30%,rgba(124,58,237,.32),transparent_38%),linear-gradient(135deg,#211638,#09090b)]" />}
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

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,22,0.94)_0%,rgba(17,18,22,0.68)_40%,rgba(17,18,22,0.06)_78%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#111216_0%,rgba(17,18,22,0.52)_20%,transparent_62%)]" />

      <div className="relative z-20 mx-auto flex h-full max-w-[1380px] items-center px-5 pb-20 pt-20 sm:px-8 md:px-10 xl:px-12">
        <div key={`copy-${item.id}`} className="w-full max-w-xl hero-copy-reveal xl:max-w-2xl">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="h-px w-7 bg-violet-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              {isLive ? "CineParty · Ao vivo" : "Seleção CineSorte"}
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white text-balance sm:text-5xl xl:text-[3.35rem]">
            {name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-300 md:text-sm">
            {isLive ? <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-white"><Radio size={13} /> Ao vivo</span> : <span className="inline-flex items-center gap-1.5 text-yellow-200">
              <Star size={14} className="fill-yellow-300 text-yellow-300" />
              {rating}
            </span>}
            {isLive && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5"><UsersRound size={14} /> {item.participantCount} assistindo</span>}
            {!isLive && year && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {year}
              </span>
            )}
            {!isLive && <span className="uppercase tracking-wider text-zinc-400">
              {mediaType === "tv" ? "Série" : "Filme"}
            </span>}
            {isLive && <span className="text-sm font-bold text-zinc-300">@{item.host?.username}</span>}
          </div>

          {item.overview && (
            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 line-clamp-2 sm:text-base">
              {item.overview}
            </p>
          )}

          <div className="mt-7 flex items-center gap-2.5">
            <Link
              to={isLive ? "/app/watch-party/" + item.roomId : `/app/${mediaType}/${item.id}`}
              className="group/button inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              {isLive ? "Assistir agora" : "Ver detalhes"}
              <ArrowRight
                size={18}
                className="transition-transform group-hover/button:translate-x-1"
              />
            </Link>

            {videoKey && (
              <button
                type="button"
                onClick={openCinemaMode}
                className="group/trailer inline-flex h-11 items-center gap-2.5 rounded-full bg-black/30 px-4 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 md:text-sm"
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
                  className="grid h-10 w-10 place-items-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => changeSlide("next")}
                  aria-label="Próximo destaque"
                  className="grid h-10 w-10 place-items-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-7 right-12 z-30 hidden w-[460px] max-w-[46%] xl:block">
          <div className="mb-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
            <span>A seguir</span>
            <span className="tabular-nums text-white/30">
              {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
          <div className="relative flex gap-2 border-t border-white/10 pt-3">
            <span
              key={`progress-${currentIndex}-${progressRevision}`}
              className="absolute -top-px left-0 h-px w-full origin-left bg-white/80 hero-progress"
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
          {upcomingSlides.map(({ slide, index }) => {
            return (
              <button
                type="button"
                key={`${slide.id}-${index}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Exibir ${slide.title || slide.name}`}
                className="group/preview min-w-0 flex-1 overflow-hidden rounded-lg text-left transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <div className="relative aspect-[16/7] overflow-hidden rounded-lg bg-white/[0.04]">
                  {slide.backdrop_path ? <img
                    src={slide.kind === "watch-party" ? slide.backdrop_path : `https://image.tmdb.org/t/p/w300${slide.backdrop_path}`}
                    alt=""
                    className="h-full w-full object-cover opacity-65 transition duration-300 group-hover/preview:scale-[1.03] group-hover/preview:opacity-90"
                    loading="lazy"
                  /> : <div className="h-full w-full bg-violet-950" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 truncate px-2.5 pb-2 text-[10px] font-semibold text-white/90">
                    {slide.title || slide.name}
                  </span>
                </div>
              </button>
            );
          })}
          </div>
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

      <TrailerModal
        isOpen={cinemaMode.open}
        videoKey={videoKey}
        title={name}
        startAt={cinemaMode.startAt}
        onClose={handleCinemaClose}
        onEnded={handleCinemaEnded}
      />
    </section>
  );
}
