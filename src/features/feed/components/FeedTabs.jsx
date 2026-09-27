import { Layers, User, Users } from "lucide-react";

const tabs = [
  { id: "following", label: "Meu círculo", compactLabel: "Círculo", icon: Users },
  { id: "collections", label: "Coleções", compactLabel: "Coleções", icon: Layers },
  { id: "mine", label: "Minhas", compactLabel: "Minhas", icon: User },
];

export default function FeedTabs({ activeTab, onChange }) {
  return (
    <div className="flex w-full items-center gap-1 border-b border-white/[0.08] sm:w-max">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors sm:flex-none sm:px-4 ${
              isActive
                ? "border-violet-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-200"
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
