import { Eye, Heart, MessageSquare, Zap } from 'lucide-react';

export default function StatsOverview({ totalXp, watchedCount, likesCount, reviewsCount }) {
  const stats = [
    { 
        label: 'Assistidos', 
        value: watchedCount || 0, 
        color: 'text-green-400', 
        bg: 'bg-green-500/10', 
        border: 'border-green-500/20', 
        icon: Eye 
    },
    { 
        label: 'Curtidas', 
        value: likesCount || 0, 
        color: 'text-red-500', 
        bg: 'bg-red-500/10', 
        border: 'border-red-500/20', 
        icon: Heart 
    },
    { 
        label: 'Reviews', 
        value: reviewsCount || 0, 
        color: 'text-violet-400', 
        bg: 'bg-violet-500/10', 
        border: 'border-violet-500/20', 
        icon: MessageSquare 
    },
    { 
        label: 'XP Total', 
        value: totalXp || 0, 
        color: 'text-amber-500', 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20', 
        icon: Zap 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
        {stats.map((stat, idx) => (
            <div 
                key={idx} 
                className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 text-center hover:bg-zinc-900 transition-all duration-300 group flex flex-col justify-center items-center shadow-xl"
            >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} border ${stat.border} mb-3 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={18} />
                </div>
                
                <span className={`block text-2xl font-black text-white mb-1 group-hover:${stat.color} transition-colors`}>
                    {stat.value.toLocaleString()}
                </span>
                
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.15em]">
                    {stat.label}
                </span>
            </div>
        ))}
    </div>
  );
}