import { Users, User, Layers } from "lucide-react";

export default function FeedTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'following', label: 'Feed', icon: Users },
    { id: 'collections', label: 'Coleções', icon: Layers },
    { id: 'mine', label: 'Minhas', icon: User },
  ];

  return (
    <div className="flex gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {isActive && (
              <span className="absolute inset-0 rounded-full ring-1 ring-violet-400/30 pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}