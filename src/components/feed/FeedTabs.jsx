import { Layers, User, Users } from "lucide-react";

const tabs = [
  { id: "following", label: "Meu círculo", compactLabel: "Círculo", icon: Users },
  { id: "collections", label: "Coleções", compactLabel: "Coleções", icon: Layers },
  { id: "mine", label: "Minhas", compactLabel: "Minhas", icon: User },
];

export default function FeedTabs({ activeTab, onChange }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-2xl border border-white/[0.08] bg-black/20 p-1.5 backdrop-blur-xl sm:w-max">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all sm:flex-none sm:px-4 ${
              isActive
                ? "bg-white text-zinc-950 shadow-lg"
                : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
            }`}
          >
            <tab.icon size={14} strokeWidth={2.4} />
            <span className="sm:hidden">{tab.compactLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
