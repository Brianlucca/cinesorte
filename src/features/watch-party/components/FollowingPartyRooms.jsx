import { FolderOpen, MonitorUp, Plus, Radio, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = {
  screen: { label: "Tela ou janela", icon: MonitorUp },
  prime: { label: "Tela ou janela", icon: MonitorUp },
  local: { label: "Pasta de filmes", icon: FolderOpen },
};

export default function FollowingPartyRooms({ rooms, loading, onCreate }) {
  const navigate = useNavigate();

  return (
    <section className="pt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Agora no CineParty</span>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-zinc-100 md:text-2xl">Transmissões ao vivo</h2>
          <p className="mt-1 text-sm text-zinc-500">Entre em uma sala e assista junto com a comunidade.</p>
        </div>
        {rooms.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-300">
            <Radio size={11} /> {rooms.length} ao vivo
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018]">
              <div className="aspect-video animate-pulse bg-white/[0.04]" />
              <div className="h-20 animate-pulse border-t border-white/[0.05] bg-white/[0.018]" />
            </div>
          ))}
        </div>
      ) : rooms.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const service = services[room.service] || services.local;
            const ServiceIcon = service.icon;
            const backdrop = room.media?.backdropPath
              ? `https://image.tmdb.org/t/p/w780${room.media.backdropPath}`
              : room.preview?.image;

            return (
              <article key={room.id} className="group min-w-0 cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] transition-colors hover:border-white/[0.14]" onClick={() => navigate(`/app/watch-party/${room.id}`)}>
                <div className="relative aspect-video overflow-hidden bg-[#181a20]">
                  {backdrop ? (
                    <img src={backdrop} alt={`Prévia de ${room.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  ) : (
                    <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.10),transparent_42%)]">
                      <ServiceIcon size={25} className="text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[9px] font-semibold text-white"><Radio size={10} /> Ao vivo</span>
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md"><UsersRound size={11} /> {room.participantCount || 1}</span>
                </div>

                <div className="flex gap-3 p-3.5">
                  {room.host?.photoURL ? (
                    <img src={room.host.photoURL} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/[0.06]" />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-300">{room.host?.username?.[0]?.toUpperCase() || "C"}</span>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-violet-300">{room.name}</h3>
                    <p className="mt-1 truncate text-xs text-zinc-500">{room.media?.title || `@${room.host?.username || "usuário"}`}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-600"><ServiceIcon size={11} /> {service.label}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.012] px-6 text-center">
          <Radio size={22} className="text-zinc-700" />
          <p className="mt-3 text-sm font-semibold text-zinc-300">Ninguém ao vivo agora</p>
          <p className="mt-1 text-xs text-zinc-600">Você pode abrir a próxima sessão da comunidade.</p>
          <button type="button" onClick={onCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-violet-100"><Plus size={14} /> Começar transmissão</button>
        </div>
      )}
    </section>
  );
}
