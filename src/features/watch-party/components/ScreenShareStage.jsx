import { useEffect, useRef, useState } from "react";
import { MonitorUp, Play, ScreenShare, ScreenShareOff, ShieldAlert, Volume2 } from "lucide-react";
import { useScreenShareSession } from "@features/watch-party/hooks/useScreenShareSession";
import CineSortePlayer from "@shared/components/cinesorte-player";

function StreamVideo({ stream, muted = false, volume = 1, compact = false }) {
  const videoRef = useRef(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
    }
    return () => { if (video) video.srcObject = null; };
  }, [stream]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = Math.max(0, Math.min(1, volume));
    videoRef.current.muted = muted || volume === 0;
  }, [muted, volume]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const video = videoRef.current;
      if (video?.srcObject && video.paused)
        video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [compact]);

  return <><video ref={videoRef} autoPlay playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />{autoplayBlocked && <button type="button" onClick={() => videoRef.current?.play().then(() => setAutoplayBlocked(false))} className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase text-zinc-950"><Play size={15} className="mr-2 inline" /> Ativar vídeo e áudio</button>}</>;
}

export default function ScreenShareStage({ roomId, isHost, cinemaWidget, onBroadcastStateChange, compact = false }) {
  const session = useScreenShareSession(roomId);
  const [viewerVolume, setViewerVolume] = useState(1);
  const visibleStream = session.localStream || session.remoteStream;

  useEffect(() => {
    if (isHost) onBroadcastStateChange?.(Boolean(session.localStream), session.stopSharing);
  }, [isHost, onBroadcastStateChange, session.localStream, session.stopSharing]);

  return <section className={`overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.5)] ${compact ? "h-full" : ""}`}>
    <CineSortePlayer title="Tela ou janela compartilhada" status={visibleStream ? "Transmitindo" : "Aguardando"} playing={Boolean(visibleStream)} volume={isHost ? 0 : viewerVolume * 100} muted={isHost || viewerVolume === 0} onToggleMute={!isHost && visibleStream ? () => setViewerVolume((value) => value > 0 ? 0 : 1) : undefined} onVolumeChange={!isHost && visibleStream ? (value) => setViewerVolume(value / 100) : undefined} widget={cinemaWidget} compact={compact} className={compact ? "h-full min-h-0" : "aspect-video min-h-[260px]"}>
      {visibleStream ? <StreamVideo stream={visibleStream} muted={Boolean(session.localStream)} volume={isHost ? 0 : viewerVolume} compact={compact} /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(14,165,233,0.12),transparent_38%)] p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/15 bg-cyan-500/10 text-cyan-300"><MonitorUp size={27} /></span><h2 className="mt-5 text-xl font-black text-white">{isHost ? "Compartilhe uma janela, aba ou tela" : "Aguardando o anfitrião"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">{isHost ? "Escolha o conteúdo no navegador e ative o compartilhamento de áudio quando disponível." : "A transmissão aparecerá aqui quando o anfitrião iniciar."}</p>{isHost && <button type="button" onClick={session.startSharing} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-950"><ScreenShare size={15} /> Escolher o que compartilhar</button>}</div></div>}
    </CineSortePlayer>
    {!compact && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-[#0d0d11] px-4 py-3"><span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-zinc-500"><Volume2 size={14} /> Áudio do conteúdo compartilhado</span>{session.localStream && <button type="button" onClick={session.stopSharing} className="inline-flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-red-200"><ScreenShareOff size={14} /> Parar transmissão</button>}</div>}
    {!compact && (session.error || (visibleStream && isHost)) && <div className="flex items-start gap-2 border-t border-amber-400/10 bg-amber-500/[0.05] px-4 py-3 text-[10px] leading-5 text-amber-200/70"><ShieldAlert size={14} className="mt-0.5 shrink-0" /> {session.error || "Alguns serviços podem ocultar conteúdo protegido durante a captura. O CineSorte não contorna proteções DRM."}</div>}
  </section>;
}
