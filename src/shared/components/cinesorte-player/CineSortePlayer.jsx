import { useCallback, useEffect, useRef, useState } from "react";
import {
  Expand,
  MessageCircle,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { formatCinemaTime } from "./playerUtils";

export default function CineSortePlayer({
  children,
  title,
  status,
  playing = false,
  currentTime = 0,
  duration = 0,
  volume = 100,
  muted = false,
  onTogglePlayback,
  onSeek,
  onSeekBy,
  onVolumeChange,
  onToggleMute,
  onClose,
  widget,
  compact = false,
  className = "",
}) {
  const playerRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const timerRef = useRef(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(timerRef.current);
    if (playing)
      timerRef.current = window.setTimeout(
        () => setControlsVisible(false),
        2600,
      );
  }, [playing]);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement === playerRef.current)
      await document.exitFullscreen?.();
    else await playerRef.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const update = () => {
      const active = document.fullscreenElement === playerRef.current;
      setFullscreen(active);
      if (!active) setWidgetOpen(false);
    };
    document.addEventListener("fullscreenchange", update);
    return () => {
      document.removeEventListener("fullscreenchange", update);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    showControls();
  }, [playing, showControls]);

  const hasTimeline = Number.isFinite(duration) && duration > 0 && onSeek;
  return (
    <section
      ref={playerRef}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className={`group/cinesorte-player relative overflow-hidden bg-black text-white fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none ${className}`}
    >
      <div className="absolute inset-0">{children}</div>
      <div
        className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 ${compact ? "hidden" : controlsVisible || widgetOpen ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/75 to-transparent" />
        <div className="pointer-events-auto absolute left-5 top-5 min-w-0 border-l-2 border-violet-400 pl-3">
          {status && (
            <span className="block text-[8px] font-black uppercase tracking-[0.22em] text-emerald-300">
              {status}
            </span>
          )}
          {title && (
            <p className="mt-1 max-w-[60vw] truncate text-xs font-black text-white md:text-sm">
              {title}
            </p>
          )}
        </div>
        <div className="pointer-events-auto absolute right-4 top-4 flex gap-2">
          {fullscreen && widget && (
            <button
              type="button"
              onClick={() => setWidgetOpen((open) => !open)}
              className={`cine-player-control ${widgetOpen ? "!bg-violet-600" : ""}`}
              aria-label="Abrir chat"
            >
              <MessageCircle size={19} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="cine-player-control"
            aria-label={
              fullscreen ? "Sair do modo cinema" : "Abrir modo cinema"
            }
          >
            {fullscreen ? <Minimize size={19} /> : <Expand size={19} />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="cine-player-control"
              aria-label="Fechar player"
            >
              <X size={19} />
            </button>
          )}
        </div>
        {!playing && onTogglePlayback && (
          <button
            type="button"
            onClick={onTogglePlayback}
            className="pointer-events-auto absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet-300/35 bg-violet-600/85 pl-1 shadow-[0_0_70px_rgba(124,58,237,0.5)]"
          >
            <Play size={31} fill="currentColor" />
          </button>
        )}
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 p-5 md:p-7">
          {hasTimeline && (
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={Math.min(currentTime, duration)}
              onChange={(event) => onSeek(Number(event.target.value))}
              className="cine-player-range w-full"
              style={{
                "--cine-progress": `${(currentTime / duration) * 100}%`,
              }}
              aria-label="Progresso do vídeo"
            />
          )}
          <div className="mt-4 flex items-center gap-2 md:gap-3">
            {onTogglePlayback && (
              <button
                type="button"
                onClick={onTogglePlayback}
                className="cine-player-control"
              >
                {playing ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </button>
            )}
            {onSeekBy && (
              <>
                <button
                  type="button"
                  onClick={() => onSeekBy(-10)}
                  className="cine-player-control hidden sm:grid"
                >
                  <RotateCcw size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => onSeekBy(10)}
                  className="cine-player-control hidden sm:grid"
                >
                  <RotateCw size={19} />
                </button>
              </>
            )}
            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className="cine-player-control"
              >
                {muted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
            )}
            {onVolumeChange && (
              <input
                type="range"
                min="0"
                max="100"
                value={muted ? 0 : volume}
                onChange={(event) => onVolumeChange(Number(event.target.value))}
                className="cine-player-volume w-20 sm:w-24"
                style={{ "--cine-progress": `${muted ? 0 : volume}%` }}
                aria-label="Volume"
              />
            )}
            {hasTimeline && (
              <span className="text-[11px] font-bold tabular-nums text-zinc-300">
                {formatCinemaTime(currentTime)}{" "}
                <span className="text-zinc-600">/</span>{" "}
                {formatCinemaTime(duration)}
              </span>
            )}
            <span className="ml-auto text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              CineSorte Player
            </span>
          </div>
        </div>
      </div>
      {fullscreen && widgetOpen && widget && (
        <aside className="absolute bottom-20 right-4 top-20 z-40 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d11]/95 shadow-2xl backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setWidgetOpen(false)}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10"
          >
            <X size={15} />
          </button>
          {widget}
        </aside>
      )}
    </section>
  );
}
