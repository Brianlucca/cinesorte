import { ChevronRight, LogOut } from "lucide-react";

export default function SettingsSidebar({ menuItems, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
      <nav className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`group flex h-12 w-full items-center justify-between gap-3 rounded-xl px-3 text-left transition-colors ${
                isActive
                  ? "border border-white/[0.06] bg-white/[0.06] text-white"
                  : "border border-transparent text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-zinc-500 group-hover:text-violet-300"
                  }`}
                >
                  <item.icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
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

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-2">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold text-red-300 transition-colors hover:border-red-400/20 hover:bg-red-500/10"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/10">
            <LogOut size={17} />
          </span>
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
