import { ChevronRight, LogOut } from "lucide-react";

export default function SettingsSidebar({ menuItems, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="space-y-4">
      <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-3 shadow-xl">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all mb-1 last:mb-0 ${
              activeTab === item.id
                ? "bg-white/10 text-white shadow-inner border border-white/5"
                : "text-zinc-500 hover:text-white hover:bg-white/[0.02] border border-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon size={18} className={activeTab === item.id ? "text-violet-400" : ""} />
              {item.label}
            </div>
            {activeTab === item.id && <ChevronRight size={16} className="text-zinc-400" />}
          </button>
        ))}
      </div>

      <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-3 shadow-xl">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}