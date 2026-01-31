import { Users, User, Layers } from "lucide-react";

export default function FeedTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'following', label: 'Feed', icon: Users },
    { id: 'collections', label: 'Coleções', icon: Layers },
    { id: 'mine', label: 'Minhas', icon: User },
  ];

  return (
    <div className="bg-zinc-900 p-1 rounded-xl border border-white/10 inline-flex w-full sm:w-auto shadow-inner overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
          }`}
        >
          <tab.icon size={16} className={activeTab === tab.id ? "text-violet-400" : "text-zinc-600"} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}