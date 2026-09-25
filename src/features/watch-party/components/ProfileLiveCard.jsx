import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, FolderOpen, MonitorUp, Play, Radio } from "lucide-react";
import { getProfileLiveWatchPartyRoom } from "@shared/api/api";

const privacyLabels = { public: "Público", followers: "Seguidores", following: "Quem o criador segue", invite: "Convidados" };

export default function ProfileLiveCard({ username }) {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (!username) return undefined;
    let active = true;
    const loadLive = async () => {
      try {
        const { data } = await getProfileLiveWatchPartyRoom(username);
        if (active) setRoom(data || null);
      } catch {
        if (active) setRoom(null);
      }
    };
    loadLive();
    const interval = window.setInterval(loadLive, 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [username]);

  if (!room) return null;
  const SourceIcon = room.service === "local" ? FolderOpen : MonitorUp;
  const sourceLabel = room.service === "local" ? "Filme local" : "Tela compartilhada";
  const viewers = Math.max(1, Number(room.participantCount) || 0);
  const backdrop = room.media?.backdropPath
    ? `https://image.tmdb.org/t/p/original${room.media.backdropPath}`
    : room.host?.backgroundURL || room.preview?.image;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-red-500/20 bg-[#0d0d11] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <Link to={`/app/watch-party/${room.id}`} className="group relative block aspect-video min-h-[220px] overflow-hidden bg-[#08080b] lg:min-h-[310px]">
          {backdrop ? (
            <img src={backdrop} alt={`Transmissão ao vivo de ${room.host?.username || username}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-full bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.28),transparent_48%),linear-gradient(135deg,#15101f,#09090c)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/15" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-lg"><Radio size={12} /> Ao vivo</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md"><Eye size={12} /> {viewers}</span>
          </div>
          <span className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-xl transition-transform group-hover:scale-105"><Play size={19} fill="currentColor" /></span>
        </Link>

        <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6 lg:p-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Transmitindo agora</p>
            <h2 className="mt-3 line-clamp-2 text-xl font-black leading-tight tracking-[-0.025em] text-white sm:text-2xl">{room.name || "Transmissão ao vivo"}</h2>
            <div className="mt-5 flex items-center gap-3">
              {room.host?.photoURL ? (
                <img src={room.host.photoURL} alt="" className="h-11 w-11 rounded-full border border-white/10 object-cover" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-violet-500/15 font-black text-violet-200">{(room.host?.username || username)?.[0]?.toUpperCase()}</span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-100">@{room.host?.username || username}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500"><SourceIcon size={13} /> {sourceLabel}</p>
              </div>
            </div>
          </div>
          <div className="mt-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">{privacyLabels[room.privacy] || "Público autorizado"}</p>
            <Link to={`/app/watch-party/${room.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-violet-400"><Play size={15} fill="currentColor" /> Assistir agora</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
