import {
  ArrowRight,
  Calendar,
  Copy,
  History,
  Radio,
  Tv2,
  Youtube,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@shared/context/useToast";

const serviceDetails = {
  screen: {
    label: "Tela ou janela",
    icon: Tv2,
    tone: "border-cyan-400/15 bg-cyan-500/10 text-cyan-300",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    tone: "border-red-400/15 bg-red-500/10 text-red-300",
  },
  prime: {
    label: "Tela ou janela",
    icon: Tv2,
    tone: "border-cyan-400/15 bg-cyan-500/10 text-cyan-300",
  },
  local: {
    label: "Pasta de filmes",
    icon: Tv2,
    tone: "border-violet-400/15 bg-violet-500/10 text-violet-300",
  },
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function MyPartyRooms({ rooms, loading = false }) {
  const navigate = useNavigate();
  const toast = useToast();

  const copyCode = async (room) => {
    await navigator.clipboard.writeText(room.code);
    toast.success("Código copiado", room.code);
  };

  return (
    <section className="mt-8 border-t border-white/[0.06] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-violet-300">
            <History size={14} /> Sua atividade
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
            Minha sala
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            Sua transmissão fica vinculada ao seu perfil.
          </p>
        </div>
        <span className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[9px] font-black uppercase tracking-wider text-zinc-500">
          {rooms.length} {rooms.length === 1 ? "sala" : "salas"}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-[1.35rem] border border-white/[0.06] bg-white/[0.025]"
            />
          ))}
        </div>
      ) : rooms.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const service =
              serviceDetails[room.service] || serviceDetails.youtube;
            const ServiceIcon = service.icon;
            return (
              <article
                key={room.id}
                className="group rounded-[1.35rem] border border-white/[0.07] bg-[#0d0d11]/92 p-4 transition-colors hover:border-white/[0.11] hover:bg-white/[0.035]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl border ${service.tone}`}
                  >
                    <ServiceIcon size={17} />
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[8px] font-black uppercase tracking-wider ${room.isLive ? "border-red-400/15 bg-red-500/10 text-red-300" : "border-white/[0.07] bg-white/[0.03] text-zinc-500"}`}>
                    <Radio size={10} /> {room.isLive ? "Ao vivo" : "Fora do ar"}
                  </span>
                </div>
                <h3 className="mt-4 truncate text-base font-black text-zinc-100">
                  {room.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-zinc-600">
                  <span>{service.label}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={11} /> {formatDate(room.updatedAt)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-2">
                  <span className="min-w-0 flex-1 px-2 font-mono text-xs font-black tracking-[0.16em] text-zinc-300">
                    {room.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(room)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[0.06] hover:text-white"
                    title="Copiar código"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/app/watch-party/${room.id}`)}
                  className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-200 transition-colors hover:bg-white hover:text-zinc-950"
                >
                  <span>Entrar na sala</span>
                  <ArrowRight size={14} />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.35rem] border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-10 text-center">
          <History size={24} className="mx-auto text-zinc-700" />
          <p className="mt-3 text-sm font-bold text-zinc-500">
            Nenhuma sala criada ainda
          </p>
          <p className="mt-1 text-xs text-zinc-700">
            Suas próximas sessões aparecerão aqui.
          </p>
        </div>
      )}
    </section>
  );
}
