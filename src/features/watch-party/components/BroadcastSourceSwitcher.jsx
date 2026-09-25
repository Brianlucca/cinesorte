import { FolderOpen, MonitorUp, RefreshCw, Settings2 } from "lucide-react";
import { WATCH_PARTY_SOURCES } from "@features/watch-party/data/watchPartyOptions";

export default function BroadcastSourceSwitcher({ service, switching, onChange, onSettings }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-[#0d0d11] p-1.5">
      <div className="flex min-w-0 items-center gap-1">
        <span className="hidden shrink-0 px-2 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-600 sm:block">Fonte</span>
        {WATCH_PARTY_SOURCES.map((source) => {
          const selected = source.id === service;
          const Icon = source.icon === "folder" ? FolderOpen : MonitorUp;
          const label = source.id === "local" ? "Arquivos" : "Tela";
          return (
            <button
              key={source.id}
              type="button"
              disabled={switching}
              onClick={() => !selected && onChange(source.id)}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[9px] font-black uppercase tracking-wide transition sm:px-3 ${selected ? "bg-violet-500 text-white" : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"}`}
            >
              {switching && selected ? <RefreshCw size={12} className="animate-spin" /> : <Icon size={13} />}
              {label}
            </button>
          );
        })}
      </div>
      {onSettings && <button type="button" onClick={onSettings} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[9px] font-black uppercase tracking-wide text-zinc-500 transition hover:bg-white/[0.06] hover:text-white sm:px-3"><Settings2 size={13} /><span className="hidden sm:inline">Detalhes</span></button>}
    </div>
  );
}
