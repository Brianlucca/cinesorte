import { FolderOpen, MonitorUp, Plus, Radio, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = {
  screen: { label: "Tela ou janela", icon: MonitorUp },
  prime: { label: "Tela ou janela", icon: MonitorUp },
  local: { label: "Pasta de filmes", icon: FolderOpen },
};

export default function FollowingPartyRooms({ rooms, loading, onCreate }) {
  const navigate = useNavigate();
  return <section className="pt-8">
    <div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-black tracking-[-0.02em] text-zinc-100">Sessões ao vivo</h2><p className="mt-1 text-xs text-zinc-600">Salas públicas e sessões disponíveis para você.</p></div>{rooms.length > 0 && <span className="text-[10px] font-bold text-zinc-600">{rooms.length} ao vivo</span>}</div>

    {loading ? <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item}><div className="aspect-video animate-pulse rounded-lg bg-white/[0.04]" /><div className="mt-3 h-10 animate-pulse rounded-lg bg-white/[0.025]" /></div>)}</div> : rooms.length ? <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{rooms.map((room) => {
      const service = services[room.service] || services.local;
      const ServiceIcon = service.icon;
      return <article key={room.id} className="group min-w-0 cursor-pointer" onClick={() => navigate(`/app/watch-party/${room.id}`)}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#111116] ring-1 ring-white/[0.07] transition group-hover:ring-violet-400/55">
          {room.preview?.image ? <img src={room.preview.image} alt={`Prévia de ${room.name}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.13),transparent_42%)]"><ServiceIcon size={25} className="text-zinc-700" /></div>}
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-white"><Radio size={9} /> Ao vivo</span>
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded bg-black/75 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-sm"><UsersRound size={10} /> {room.participantCount || 1}</span>
        </div>
        <div className="mt-3 flex gap-3">{room.host?.photoURL ? <img src={room.host.photoURL} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-black text-violet-200">{room.host?.username?.[0]?.toUpperCase() || "C"}</span>}<div className="min-w-0"><h3 className="truncate text-sm font-bold text-zinc-100 group-hover:text-violet-300">{room.name}</h3><p className="mt-1 truncate text-[11px] text-zinc-500">{room.host?.username || "Usuário"}</p><p className="mt-0.5 text-[10px] text-zinc-700">{service.label}</p></div></div>
      </article>;
    })}</div> : <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.012] px-6 text-center"><Radio size={22} className="text-zinc-700" /><p className="mt-3 text-sm font-bold text-zinc-400">Nenhuma sessão ao vivo agora</p><p className="mt-1 text-xs text-zinc-700">Quando uma sala pública iniciar, ela aparecerá aqui.</p><button type="button" onClick={onCreate} className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase text-violet-300 hover:text-violet-200"><Plus size={13} /> Criar uma sala</button></div>}
  </section>;
}
