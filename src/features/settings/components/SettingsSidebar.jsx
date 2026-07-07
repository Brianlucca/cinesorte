import { ChevronRight, LogOut } from "lucide-react";

export default function SettingsSidebar({ menuItems, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
      <nav className="rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/90 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`group flex w-full items-center justify-between gap-3 rounded-[1.15rem] px-3.5 py-3.5 text-left transition-all ${
                isActive
                  ? "border border-violet-400/15 bg-violet-500/10 text-white"
                  : "border border-transparent text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
                    isActive
                      ? "border-violet-400/20 bg-violet-500/10 text-violet-300"
                      : "border-white/[0.06] bg-white/[0.025] text-zinc-500 group-hover:text-violet-300"
                  }`}
                >
                  <item.icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{item.label}</span>
                  {item.description && (
                    <span className="mt-0.5 block truncate text-[10px] font-medium text-zinc-600">{item.description}</span>
                  )}
                </span>
              </span>
              {isActive && <ChevronRight size={16} className="shrink-0 text-violet-300" />}
            </button>
          );
        })}
      </nav>

      <div className="rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/90 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-[1.15rem] border border-transparent px-3.5 py-3.5 text-sm font-black text-red-300 transition-colors hover:border-red-400/20 hover:bg-red-500/10"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/15 bg-red-500/10">
            <LogOut size={17} />
          </span>
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
