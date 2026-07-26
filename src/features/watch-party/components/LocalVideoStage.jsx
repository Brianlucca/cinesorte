import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Expand,
  FolderOpen,
  Minimize,
  MonitorPlay,
  Pause,
  Play,
  Radio,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react";
import { useScreenShareSession } from "@features/watch-party/hooks/useScreenShareSession";
import {
  PlayerControlButton as CinemaControlButton,
  PlayerViewport as CinemaViewport,
} from "@shared/components/cinesorte-player/PlayerPrimitives";
import { formatCinemaTime } from "@shared/components/cinesorte-player/playerUtils";
import CineSortePlayer from "@shared/components/cinesorte-player";
import ConfirmDialog from "@shared/components/ui/ConfirmDialog";

function RemoteVideo({ stream, volume = 1 }) {
  const ref = useRef(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (video) {
      video.srcObject = stream;
      video
        .play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => setAutoplayBlocked(true));
    }
    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream]);
  useEffect(() => {
    if (ref.current) ref.current.volume = volume;
  }, [volume]);
  return (
    <>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={volume === 0}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
      {autoplayBlocked && (
        <button
          type="button"
          onClick={() =>
            ref.current?.play().then(() => setAutoplayBlocked(false))
          }
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase text-zinc-950"
        >
          <Play size={15} className="mr-2 inline" /> Ativar vídeo e áudio
        </button>
      )}
    </>
  );
}

function TechnicalPanel({ stats }) {
  if (!stats) return null;
  const values = [
    ["Qualidade", stats.width ? `${stats.width}×${stats.height}` : "—"],
    ["FPS", stats.fps || "—"],
    ["Bitrate", `${stats.bitrateKbps} kbps`],
    ["Latência", `${stats.rttMs} ms`],
    ["Perdas", stats.packetsLost],
    ["Conexões", stats.peers],
  ];
  return (
    <div className="border-t border-white/[0.07] bg-[#0a0a0d] px-4 py-3">
      <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.13em] text-violet-300">
        <Activity size={13} /> Dados da transmissão ·{" "}
        {stats.direction === "upload" ? "Host" : "Visitante"}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {values.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2"
          >
            <p className="text-[8px] font-black uppercase tracking-wider text-zinc-600">
              {label}
            </p>
            <p className="mt-1 text-xs font-bold text-zinc-300">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px] text-zinc-700">
        WebRTC: {stats.connectionState} · ICE: {stats.iceState}
      </p>
    </div>
  );
}

function AudioMeter({ analyser }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!analyser) return undefined;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const samples = new Uint8Array(analyser.fftSize);
    let frame;
    const draw = () => {
      analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (const sample of samples)
        peak = Math.max(peak, Math.abs(sample - 128) / 128);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#18181b";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#34d399");
      gradient.addColorStop(0.75, "#facc15");
      gradient.addColorStop(1, "#f87171");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width * peak, canvas.height);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [analyser]);
  return (
    <canvas
      ref={canvasRef}
      width="500"
      height="16"
      className="h-2.5 w-full rounded-full"
      aria-label="Nível do áudio enviado"
    />
  );
}

export default function LocalVideoStage({
  roomId,
  isHost,
  allowGuestControl,
  cinemaWidget,
  onBroadcastStateChange,
  compact = false,
}) {
  const videoRef = useRef(null);
  const folderInputRef = useRef(null);
  const cinemaRef = useRef(null);
  const audioGraphRef = useRef(null);
  const broadcastStreamRef = useRef(null);
  const applyPlaybackControl = useCallback(({ action, position }) => {
    const video = videoRef.current;
    if (!video) return;
    if (action === "play") video.play().catch(() => undefined);
    if (action === "pause") video.pause();
    if (action === "seek-relative")
      video.currentTime = Math.max(
        0,
        Math.min(video.duration || Infinity, video.currentTime + position),
      );
  }, []);
  const [quality, setQuality] = useState({
    height: 1080,
    fps: 30,
    bitrateKbps: 6000,
  });
  const [monitorVolume, setMonitorVolume] = useState(0.8);
  const [sendVolume, setSendVolume] = useState(1);
  const [analyser, setAnalyser] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [viewerPlaying, setViewerPlaying] = useState(true);
  const [viewerVolume, setViewerVolume] = useState(1);
  const session = useScreenShareSession(roomId, {
    onPlaybackControl: isHost ? applyPlaybackControl : undefined,
    quality,
  });
  const { setMediaMetadata } = session;
  const urlsRef = useRef([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [confirmingFolderAccess, setConfirmingFolderAccess] = useState(false);
  const current = playlist[currentIndex];
  const displayTitle = isHost ? current?.name : session.remoteMetadata?.title;

  useEffect(() => {
    if (isHost && current?.name) setMediaMetadata({ title: current.name });
  }, [current?.name, isHost, setMediaMetadata]);

  useEffect(
    () => () => {
      urlsRef.current.forEach(URL.revokeObjectURL);
      broadcastStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioGraphRef.current?.context.close();
    },
    [],
  );
  useEffect(() => {
    if (audioGraphRef.current)
      audioGraphRef.current.monitorGain.gain.value = monitorVolume;
  }, [monitorVolume]);
  useEffect(() => {
    if (audioGraphRef.current)
      audioGraphRef.current.sendGain.gain.value = sendVolume;
  }, [sendVolume]);
  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === cinemaRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const toggleCinemaMode = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await cinemaRef.current?.requestFullscreen?.();
  }, []);
  useEffect(() => {
    if (current && session.localStream)
      videoRef.current
        ?.play()
        .catch(() =>
          setError("Clique em reproduzir para continuar a playlist."),
        );
  }, [current, session.localStream]);
  useEffect(() => {
    if (!isHost || !current || !session.localStream || !playing) return undefined;
    const frame = window.requestAnimationFrame(() => {
      videoRef.current?.play().catch(() =>
        setError("Clique em reproduzir para continuar a playlist."),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [compact, current, isHost, playing, session.localStream]);
  const loadVideoFiles = useCallback((entries) => {
    urlsRef.current.forEach(URL.revokeObjectURL);
    const videoExtension = /\.(mp4|m4v|webm|mov|mkv|avi|ogv)$/i;
    const files = entries
      .filter(({ file }) => file.type.startsWith("video/") || videoExtension.test(file.name))
      .sort((a, b) => a.path.localeCompare(b.path));
    const items = files.map(({ file }) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    urlsRef.current = items.map(({ url }) => url);
    setPlaylist(items);
    setCurrentIndex(0);
    setError(
      files.length ? "" : "Nenhum arquivo de vídeo compatível foi encontrado.",
    );
  }, []);
  const selectFolderFallback = useCallback((event) => {
    loadVideoFiles([...event.target.files].map((file) => ({
      file,
      path: file.webkitRelativePath || file.name,
    })));
    event.target.value = "";
  }, [loadVideoFiles]);
  const chooseFolder = useCallback(async () => {
    if (!("showDirectoryPicker" in window)) {
      folderInputRef.current?.click();
      return;
    }
    try {
      const root = await window.showDirectoryPicker({ mode: "read" });
      const entries = [];
      const readDirectory = async (directory, path = "") => {
        for await (const handle of directory.values()) {
          const nextPath = path ? `${path}/${handle.name}` : handle.name;
          if (handle.kind === "directory") await readDirectory(handle, nextPath);
          else entries.push({ file: await handle.getFile(), path: nextPath });
        }
      };
      await readDirectory(root);
      loadVideoFiles(entries);
    } catch (reason) {
      if (reason.name !== "AbortError")
        setError(reason.message || "Não foi possível abrir a pasta.");
    }
  }, [loadVideoFiles]);
  const startBroadcast = useCallback(async () => {
    const video = videoRef.current;
    try {
      await video.play();
      const capture = video.captureStream || video.mozCaptureStream;
      if (!capture)
        throw new Error(
          "Use Chrome ou Edge atualizado para transmitir vídeo local.",
        );
      const captured = capture.call(video);
      if (!audioGraphRef.current) {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        const context = new AudioContextClass();
        const source = context.createMediaElementSource(video);
        const monitorGain = context.createGain();
        const sendGain = context.createGain();
        const meter = context.createAnalyser();
        const destination = context.createMediaStreamDestination();
        meter.fftSize = 512;
        monitorGain.gain.value = monitorVolume;
        sendGain.gain.value = sendVolume;
        source.connect(monitorGain).connect(context.destination);
        source.connect(sendGain).connect(meter).connect(destination);
        audioGraphRef.current = { context, monitorGain, sendGain, destination };
        setAnalyser(meter);
      }
      await audioGraphRef.current.context.resume();
      const stream = new MediaStream([
        ...captured.getVideoTracks(),
        ...audioGraphRef.current.destination.stream.getAudioTracks(),
      ]);
      broadcastStreamRef.current = stream;
      session.startWithStream(stream);
      setError("");
    } catch (reason) {
      setError(reason.message || "Não foi possível iniciar o vídeo.");
    }
  }, [monitorVolume, sendVolume, session]);
  const stopBroadcast = useCallback(() => {
    session.stopSharing(false);
    broadcastStreamRef.current
      ?.getVideoTracks()
      .forEach((track) => track.stop());
    broadcastStreamRef.current = null;
    videoRef.current?.pause();
  }, [session]);
  useEffect(() => {
    if (isHost)
      onBroadcastStateChange?.(Boolean(session.localStream), stopBroadcast);
  }, [isHost, onBroadcastStateChange, session.localStream, stopBroadcast]);
  const next = useCallback(
    () =>
      setCurrentIndex((index) => (index + 1 < playlist.length ? index + 1 : 0)),
    [playlist.length],
  );
  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused)
      video
        .play()
        .catch(() => setError("Não foi possível reproduzir o vídeo."));
    else video.pause();
  }, []);
  const seekTo = useCallback((event) => {
    if (videoRef.current)
      videoRef.current.currentTime = Number(event.target.value);
  }, []);
  const status = useMemo(
    () =>
      session.remoteStream || session.localStream
        ? "Transmitindo"
        : "Aguardando",
    [session.localStream, session.remoteStream],
  );

  return (
    <CinemaViewport
      ref={cinemaRef}
      className="rounded-[1.5rem] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
    >
      <CineSortePlayer
        title={displayTitle || "Transmissão da sala"}
        status={status}
        playing={
          isHost ? playing : viewerPlaying && Boolean(session.remoteStream)
        }
        currentTime={position}
        duration={duration}
        volume={(isHost ? monitorVolume : viewerVolume) * 100}
        muted={(isHost ? monitorVolume : viewerVolume) === 0}
        onTogglePlayback={
          isHost && current
            ? togglePlayback
            : !isHost && allowGuestControl && session.remoteStream
              ? () => {
                  const nextPlaying = !viewerPlaying;
                  setViewerPlaying(nextPlaying);
                  session.sendPlaybackControl(nextPlaying ? "play" : "pause");
                }
              : undefined
        }
        onSeek={
          isHost && current
            ? (value) => {
                if (videoRef.current) videoRef.current.currentTime = value;
              }
            : undefined
        }
        onSeekBy={
          isHost && current
            ? (amount) => {
                if (videoRef.current)
                  videoRef.current.currentTime = Math.max(
                    0,
                    Math.min(duration, videoRef.current.currentTime + amount),
                  );
              }
            : !isHost && allowGuestControl
              ? (amount) => session.sendPlaybackControl("seek-relative", amount)
              : undefined
        }
        onToggleMute={
          isHost
            ? () => setMonitorVolume((value) => (value > 0 ? 0 : 0.8))
            : () => setViewerVolume((value) => (value > 0 ? 0 : 1))
        }
        onVolumeChange={
          isHost
            ? (value) => setMonitorVolume(value / 100)
            : (value) => setViewerVolume(value / 100)
        }
        widget={cinemaWidget}
        compact={compact}
        className={compact ? "h-full min-h-0" : "aspect-video min-h-[260px]"}
      >
        {!isHost && session.remoteStream && (
          <RemoteVideo stream={session.remoteStream} volume={viewerVolume} />
        )}
        {isHost && current && (
          <video
            ref={videoRef}
            src={current.url}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) =>
              setPosition(event.currentTarget.currentTime)
            }
            onLoadedMetadata={(event) =>
              setDuration(event.currentTarget.duration || 0)
            }
            onEnded={next}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        )}
        {((isHost && !current) || (!isHost && !session.remoteStream)) && (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                <MonitorPlay size={28} />
              </span>
              <h2 className="mt-5 text-xl font-black text-white">
                {isHost
                  ? "Escolha a pasta de vídeos"
                  : "Aguardando o anfitrião"}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                {isHost
                  ? "Os arquivos ficam no seu computador e seguem diretamente por WebRTC."
                  : "O vídeo aparecerá quando a transmissão começar."}
              </p>
              {isHost && (
                <button type="button" onClick={() => setConfirmingFolderAccess(true)} className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-950">
                  <FolderOpen size={15} /> Abrir pasta
                </button>
              )}
            </div>
          </div>
        )}
      </CineSortePlayer>
      <div className="hidden">
        {isHost && current && (
          <video
            ref={undefined}
            src={current.url}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) =>
              setPosition(event.currentTarget.currentTime)
            }
            onLoadedMetadata={(event) =>
              setDuration(event.currentTarget.duration || 0)
            }
            onEnded={next}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        )}
        {((isHost && !current) || (!isHost && !session.remoteStream)) && (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                <MonitorPlay size={28} />
              </span>
              <h2 className="mt-5 text-xl font-black text-white">
                {isHost
                  ? "Escolha a pasta de vídeos"
                  : "Aguardando o anfitrião"}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                {isHost
                  ? "Os arquivos ficam no seu computador e seguem diretamente por WebRTC."
                  : "O vídeo aparecerá quando a transmissão começar."}
              </p>
              {isHost && (
                <button type="button" onClick={() => setConfirmingFolderAccess(true)} className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-950">
                  <FolderOpen size={15} /> Abrir pasta
                </button>
              )}
            </div>
          </div>
        )}
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/70 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-zinc-300">
          <Radio
            size={12}
            className={
              status === "Transmitindo" ? "text-emerald-400" : "text-zinc-600"
            }
          />{" "}
          {status}
        </span>
        {(current || session.remoteStream) && (
          <button
            type="button"
            onClick={toggleCinemaMode}
            className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-black/65 text-white backdrop-blur-xl"
            aria-label={
              fullscreen ? "Sair do modo cinema" : "Abrir modo cinema"
            }
          >
            {fullscreen ? <Minimize size={18} /> : <Expand size={18} />}
          </button>
        )}
        {isHost && current && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-16 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(position, duration || 0)}
              onChange={seekTo}
              className="mb-3 h-1 w-full cursor-pointer accent-violet-500"
              aria-label="Posição do vídeo"
            />
            <div className="flex items-center gap-3">
              <CinemaControlButton
                onClick={togglePlayback}
                aria-label={playing ? "Pausar" : "Reproduzir"}
              >
                {playing ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </CinemaControlButton>
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current)
                    videoRef.current.currentTime = Math.max(
                      0,
                      videoRef.current.currentTime - 10,
                    );
                }}
                className="text-zinc-200"
                title="Voltar 10 segundos"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current)
                    videoRef.current.currentTime = Math.min(
                      duration,
                      videoRef.current.currentTime + 10,
                    );
                }}
                className="text-zinc-200"
                title="Avançar 10 segundos"
              >
                <RotateCw size={18} />
              </button>
              <span className="text-xs font-bold tabular-nums text-zinc-200">
                {formatCinemaTime(position)} / {formatCinemaTime(duration)}
              </span>
              <span className="ml-auto hidden text-[9px] font-black uppercase tracking-wider text-zinc-400 sm:block">
                CineSorte Player
              </span>
            </div>
          </div>
        )}
      </div>
      <input
        ref={folderInputRef}
        type="file"
        accept="video/*,.mkv,.avi,.mov,.m4v,.ogv"
        multiple
        webkitdirectory=""
        onChange={selectFolderFallback}
        className="hidden"
      />
      <ConfirmDialog
        isOpen={confirmingFolderAccess}
        title="Conectar pasta de vídeos?"
        description="O CineSorte lerá os vídeos da pasta escolhida para montar sua playlist. O conteúdo permanece no seu computador, não é salvo pelo CineSorte e não é enviado ao banco de dados. O navegador ainda solicitará a permissão obrigatória de leitura."
        confirmLabel="Escolher pasta"
        cancelLabel="Agora não"
        tone="default"
        onClose={() => setConfirmingFolderAccess(false)}
        onConfirm={chooseFolder}
      />
      {isHost && current && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-[#0d0d11] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-zinc-300">
              {current.name}
            </p>
            <p className="mt-1 text-[9px] text-zinc-600">
              {currentIndex + 1} de {playlist.length}
            </p>
          </div>
          <div className="flex gap-2">
            {!session.localStream && (
              <button
                type="button"
                onClick={startBroadcast}
                className="rounded-xl bg-white px-4 py-2.5 text-[9px] font-black uppercase text-zinc-950"
              >
                Reproduzir e transmitir
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] text-zinc-400"
              title="Próximo vídeo"
            >
              <SkipForward size={15} />
            </button>
          </div>
        </div>
      )}
      {isHost && current && (
        <div className="border-t border-white/[0.07] bg-[#0d0d11] p-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
              Resolução
              <select
                value={quality.height}
                onChange={(event) =>
                  setQuality((value) => ({
                    ...value,
                    height: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-xs text-white"
              >
                <option value="720">720p</option>
                <option value="1080">1080p</option>
                <option value="1440">1440p</option>
              </select>
            </label>
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
              FPS
              <select
                value={quality.fps}
                onChange={(event) =>
                  setQuality((value) => ({
                    ...value,
                    fps: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-xs text-white"
              >
                <option value="24">24 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </label>
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
              Bitrate
              <select
                value={quality.bitrateKbps}
                onChange={(event) =>
                  setQuality((value) => ({
                    ...value,
                    bitrateKbps: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-xs text-white"
              >
                <option value="2500">2.5 Mbps</option>
                <option value="4500">4.5 Mbps</option>
                <option value="6000">6 Mbps</option>
                <option value="8000">8 Mbps</option>
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
              <span className="flex items-center justify-between">
                <span>Volume no anfitrião</span>
                <span>{Math.round(monitorVolume * 100)}%</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={monitorVolume}
                onChange={(event) =>
                  setMonitorVolume(Number(event.target.value))
                }
                className="mt-2 w-full accent-violet-500"
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
              <span className="flex items-center justify-between">
                <span>Volume enviado</span>
                <span>{Math.round(sendVolume * 100)}%</span>
              </span>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={sendVolume}
                onChange={(event) => setSendVolume(Number(event.target.value))}
                className="mt-2 w-full accent-emerald-500"
              />
            </label>
          </div>
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-zinc-500">
              <Volume2 size={13} /> Áudio enviado{" "}
              {broadcastStreamRef.current?.getAudioTracks().length
                ? "conectado"
                : "aguardando"}
            </p>
            <AudioMeter analyser={analyser} />
          </div>
          {session.localStream && (
            <button
              type="button"
              onClick={stopBroadcast}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-500/10 px-4 py-2.5 text-[9px] font-black uppercase text-red-200"
            >
              <Square size={13} fill="currentColor" /> Encerrar transmissão
            </button>
          )}
        </div>
      )}
      {allowGuestControl === null && !isHost && session.remoteStream && (
        <div className="flex items-center justify-center gap-2 border-t border-white/[0.07] bg-[#0d0d11] px-4 py-3">
          {allowGuestControl ? (
            <>
              <button
                type="button"
                onClick={() =>
                  session.sendPlaybackControl("seek-relative", -10)
                }
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] text-zinc-300"
                title="Voltar 10 segundos"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => session.sendPlaybackControl("play")}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-zinc-950"
              >
                <Play size={16} />
              </button>
              <button
                type="button"
                onClick={() => session.sendPlaybackControl("pause")}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.1] text-white"
              >
                <Pause size={16} />
              </button>
              <button
                type="button"
                onClick={() => session.sendPlaybackControl("seek-relative", 10)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] text-zinc-300"
                title="Avançar 10 segundos"
              >
                <RotateCw size={15} />
              </button>
            </>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
              Controles disponíveis apenas para o anfitrião
            </span>
          )}
        </div>
      )}
      <TechnicalPanel stats={session.technicalStats} />
      <div className="flex items-start gap-2 border-t border-amber-400/10 bg-amber-500/[0.05] px-4 py-3 text-[10px] leading-5 text-amber-200/70">
        <ShieldAlert size={14} className="mt-0.5 shrink-0" />{" "}
        {error ||
          session.error ||
          "A qualidade se adapta à rede. A janela transmissora precisa permanecer aberta."}
      </div>
    </CinemaViewport>
  );
}
