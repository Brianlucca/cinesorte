import { Users, User, Layers } from "lucide-react";

export default function FeedTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'following', label: 'Feed', icon: Users },
    { id: 'collections', label: 'Coleções', icon: Layers },
    { id: 'mine', label: 'Minhas', icon: User },
  ];

  return (
    <div className="flex items-center p-1.5 bg-white/[0.02] border border-white/10 rounded-2xl w-max shadow-lg backdrop-blur-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              isActive 
                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}