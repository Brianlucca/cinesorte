import { MessageCircle, Mic, Pause, Radio, UsersRound } from "lucide-react";

const avatars = ["B", "M", "L", "+3"];

export default function PartyPreview() {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0d0d11] shadow-[0_32px_100px_rgba(0,0,0,0.42)]">
      <div className="relative aspect-video min-h-[300px] overflow-hidden bg-[radial-gradient(circle_at_60%_20%,rgba(124,58,237,0.18),transparent_34%),linear-gradient(145deg,#17131f,#09090c_70%)]">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300 backdrop-blur-xl">
          <Radio size={12} className="animate-pulse" /> Sala ao vivo
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <button type="button" className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.10] bg-white/[0.08] text-white shadow-2xl backdrop-blur-xl transition-transform hover:scale-105" aria-label="Pausar reprodução">
            <Pause size={24} fill="currentColor" />
          </button>
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-violet-400" /></div>
          <div className="mt-2 flex justify-between text-[9px] font-bold text-zinc-500"><span>38:24</span><span>1:42:08</span></div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-white/[0.07] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-300">Sessão de sábado</p>
          <h3 className="mt-1 truncate text-lg font-black text-white">Todo mundo no mesmo momento</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-600">Reprodução sincronizada, conversa e reações sem sair da sala.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {avatars.map((avatar, index) => (
              <span key={avatar} className={`grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0d0d11] text-[10px] font-black ${index === avatars.length - 1 ? "bg-violet-500 text-white" : "bg-zinc-800 text-zinc-300"}`}>{avatar}</span>
            ))}
          </div>
          <span className="h-8 w-px bg-white/[0.08]" />
          <span className="flex gap-2 text-zinc-500"><Mic size={17} /><MessageCircle size={17} /><UsersRound size={17} /></span>
        </div>
      </div>
    </section>
  );
}
