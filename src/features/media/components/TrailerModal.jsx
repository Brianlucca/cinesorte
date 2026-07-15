import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Expand,
  LoaderCircle,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

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

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
};

export default function TrailerModal({
  isOpen,
  onClose,
  onEnded,
  videoKey,
  title = "Trailer",
  startAt = 0,
}) {
  const mountRef = useRef(null);
  const shellRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onEndedRef = useRef(onEnded);
  const currentTimeRef = useRef(startAt);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startAt);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(false);

  onCloseRef.current = onClose;
  onEndedRef.current = onEnded;
  currentTimeRef.current = currentTime;

  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(controlsTimerRef.current);
    if (playing) {
      controlsTimerRef.current = window.setTimeout(
        () => setControlsVisible(false),
        2600,
      );
    }
  }, [playing]);

  const closePlayer = useCallback(() => {
    const position = playerRef.current?.getCurrentTime?.() || currentTimeRef.current;
    playerRef.current?.pauseVideo?.();
    onCloseRef.current(position);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!ready) return;
    if (playing) playerRef.current?.pauseVideo?.();
    else playerRef.current?.playVideo?.();
    showControls();
  }, [playing, ready, showControls]);

  const seekBy = useCallback((amount) => {
    const player = playerRef.current;
    if (!player) return;
    const nextTime = Math.min(
      Math.max((player.getCurrentTime?.() || 0) + amount, 0),
      player.getDuration?.() || duration,
    );
    player.seekTo?.(nextTime, true);
    setCurrentTime(nextTime);
  }, [duration]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted?.()) {
      player.unMute?.();
      setMuted(false);
    } else {
      player.mute?.();
      setMuted(true);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await shellRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !videoKey || !mountRef.current) return undefined;

    let cancelled = false;
    setReady(false);
    setPlaying(false);
    setError(false);
    setCurrentTime(startAt);

    loadYoutubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;

      playerRef.current = new YT.Player(mountRef.current, {
        videoId: videoKey,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          start: Math.floor(startAt),
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            event.target.unMute();
            event.target.setVolume(100);
            event.target.playVideo();
            setDuration(event.target.getDuration?.() || 0);
            setReady(true);
          },
          onStateChange: (event) => {
            if (cancelled) return;
            if (event.data === YT.PlayerState.PLAYING) setPlaying(true);
            if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.BUFFERING
            ) setPlaying(false);
            if (event.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              onEndedRef.current?.();
            }
          },
          onError: () => setError(true),
        },
      });
    });

    const progressTimer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration?.() || 0);
      setVolume(player.getVolume?.() ?? 100);
      setMuted(Boolean(player.isMuted?.()));
    }, 350);

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(controlsTimerRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [isOpen, startAt, videoKey]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (["INPUT", "TEXTAREA"].includes(event.target?.tagName)) return;
      if (event.key === "Escape") closePlayer();
      if (event.key === " " || event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePlayback();
      }
      if (event.key === "ArrowLeft") seekBy(-10);
      if (event.key === "ArrowRight") seekBy(10);
      if (event.key.toLowerCase() === "m") toggleMute();
      if (event.key.toLowerCase() === "f") toggleFullscreen();
      showControls();
    };
    const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [closePlayer, isOpen, seekBy, showControls, toggleFullscreen, toggleMute, togglePlayback]);

  useEffect(() => {
    showControls();
  }, [playing, showControls]);

  if (!isOpen || !videoKey) return null;

  return createPortal(
    <div
      ref={shellRef}
      className="group/cinema fixed inset-0 z-[100000] overflow-hidden bg-black text-white trailer-cinema-enter"
      role="dialog"
      aria-modal="true"
      aria-label={`Trailer de ${title}`}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,29,149,0.16),transparent_58%)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: "min(100vw, 177.78vh)",
          height: "min(100vh, 56.25vw)",
        }}
      >
        <div className="absolute inset-0 trailer-cinema-video-enter [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full">
          <div ref={mountRef} className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="animate-spin text-violet-400" size={38} />
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
              Preparando a sala
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-zinc-950 px-6 text-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-violet-400">
              CineSorte
            </span>
            <p className="mt-3 text-lg font-bold">Este trailer não pôde ser reproduzido.</p>
            <button type="button" onClick={closePlayer} className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-black">
              Voltar
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pausar trailer" : "Reproduzir trailer"}
        className="absolute inset-0 z-10 cursor-default focus:outline-none"
      />

      <div className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/90 via-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/75 to-transparent" />

        <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-start justify-between gap-5 p-5 md:p-8">
          <div className="min-w-0 border-l-2 border-violet-400 pl-4">
            <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-violet-300">CineSorte apresenta</span>
            <h2 className="mt-1 truncate text-sm font-black md:text-lg">{title}</h2>
          </div>
          <button type="button" onClick={closePlayer} aria-label="Fechar modo cinema" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-black/45 backdrop-blur-xl transition hover:scale-105 hover:bg-white hover:text-black">
            <X size={21} />
          </button>
        </div>

        {!playing && ready && (
          <button type="button" onClick={togglePlayback} aria-label="Reproduzir" className="pointer-events-auto absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet-300/35 bg-violet-600/85 pl-1 shadow-[0_0_70px_rgba(124,58,237,0.55)] backdrop-blur-xl transition hover:scale-105 hover:bg-violet-500">
            <Play size={31} fill="currentColor" />
          </button>
        )}

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 p-5 md:p-8">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => {
              const nextTime = Number(event.target.value);
              playerRef.current?.seekTo?.(nextTime, true);
              setCurrentTime(nextTime);
            }}
            aria-label="Progresso do trailer"
            className="cine-player-range w-full"
            style={{ "--cine-progress": `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />

          <div className="mt-4 flex items-center gap-2 md:gap-3">
            <button type="button" onClick={togglePlayback} aria-label={playing ? "Pausar" : "Reproduzir"} className="cine-player-control">
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button type="button" onClick={() => seekBy(-10)} aria-label="Voltar 10 segundos" className="cine-player-control hidden sm:grid"><RotateCcw size={19} /></button>
            <button type="button" onClick={() => seekBy(10)} aria-label="Avançar 10 segundos" className="cine-player-control hidden sm:grid"><RotateCw size={19} /></button>
            <button type="button" onClick={toggleMute} aria-label={muted ? "Ativar som" : "Silenciar"} className="cine-player-control">
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume}
              style={{ "--cine-progress": `${muted ? 0 : volume}%` }}
              onChange={(event) => {
                const nextVolume = Number(event.target.value);
                playerRef.current?.setVolume?.(nextVolume);
                if (nextVolume > 0) playerRef.current?.unMute?.();
                setVolume(nextVolume);
                setMuted(nextVolume === 0);
              }}
              aria-label="Volume"
              className="cine-player-volume hidden w-20 sm:block md:w-28"
            />
            <span className="ml-1 text-[11px] font-bold tabular-nums text-zinc-300 md:text-xs">{formatTime(currentTime)} <span className="text-zinc-600">/</span> {formatTime(duration)}</span>
            <span className="ml-auto hidden text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-600 lg:block">Espaço: pausar · ← →: 10s · M: som · F: tela cheia</span>
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"} className="cine-player-control ml-auto lg:ml-0">
              {fullscreen ? <Minimize size={20} /> : <Expand size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
