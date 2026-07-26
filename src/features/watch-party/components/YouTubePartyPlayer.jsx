import { useEffect, useMemo, useRef, useState } from "react";
import { CirclePlay } from "lucide-react";
import CineSortePlayer from "@shared/components/cinesorte-player";

export default function YouTubePartyPlayer({ video, playback, command, onControl, onEnded, canControl = true, cinemaWidget }) {
  const iframeRef = useRef(null);
  const endedVideoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(playback.position || 0);
  const embedUrl = useMemo(() => video ? `https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&playsinline=1&rel=0&controls=0&disablekb=1&fs=0&origin=${encodeURIComponent(window.location.origin)}` : null, [video]);

  const postCommand = (func, args = []) => iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "https://www.youtube.com");
  useEffect(() => {
    if (!command) return;
    if (["play", "pause"].includes(command.action) && Number.isFinite(command.position)) postCommand("seekTo", [command.position, true]);
    const commands = { play: ["playVideo"], pause: ["pauseVideo"], seek: ["seekTo", [command.position, true]], load: ["loadVideoById", [command.videoId]] };
    const [func, args = []] = commands[command.action] || [];
    if (func) postCommand(func, args);
  }, [command]);
  useEffect(() => { endedVideoRef.current = null; }, [video?.videoId]);
  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (Number.isFinite(payload?.info?.currentTime)) setCurrentTime(payload.info.currentTime);
        const state = payload?.event === "onStateChange" ? payload.info : payload?.info?.playerState;
        if (state === 0 && video?.videoId && endedVideoRef.current !== video.videoId) { endedVideoRef.current = video.videoId; onEnded(); }
      } catch { /* YouTube also emits non-JSON messages. */ }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onEnded, video?.videoId]);

  const seekRelative = (amount) => onControl("seek", Math.max(0, currentTime + amount));
  const toggle = () => onControl(playback.status === "playing" ? "pause" : "play", currentTime);
  return <CineSortePlayer title={video?.title || "Sala do YouTube"} status={playback.status === "playing" ? "Transmitindo" : "Sincronizado"} playing={playback.status === "playing"} currentTime={currentTime} onTogglePlayback={video && canControl ? toggle : undefined} onSeekBy={video && canControl ? seekRelative : undefined} widget={cinemaWidget} className="aspect-video min-h-[240px] rounded-[1.5rem] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
    {video ? <iframe ref={iframeRef} key={video.videoId} src={embedUrl} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" className="absolute inset-0 h-full w-full border-0" /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.15),transparent_38%)] p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300"><CirclePlay size={28} /></span><h2 className="mt-5 text-xl font-black text-white">A tela está pronta</h2><p className="mt-2 text-sm text-zinc-600">Adicione um vídeo do YouTube para começar a sessão.</p></div></div>}
  </CineSortePlayer>;
}
