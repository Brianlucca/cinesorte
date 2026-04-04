import { Eye, Heart, MessageSquare, Zap } from 'lucide-react';

export default function StatsOverview({ totalXp, watchedCount, likesCount, reviewsCount }) {
  const stats = [
    { 
        label: 'Assistidos', 
        value: watchedCount || 0, 
        color: 'text-emerald-400',
        hoverColor: 'group-hover:text-emerald-400',
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20', 
        shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        icon: Eye 
    },
    { 
        label: 'Curtidas', 
        value: likesCount || 0, 
        color: 'text-red-400',
        hoverColor: 'group-hover:text-red-400',
        bg: 'bg-red-500/10', 
        border: 'border-red-500/20', 
        shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]',
        icon: Heart 
    },
    { 
        label: 'Reviews', 
        value: reviewsCount || 0, 
        color: 'text-violet-400',
        hoverColor: 'group-hover:text-violet-400',
        bg: 'bg-violet-500/10', 
        border: 'border-violet-500/20', 
        shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.1)]',
        icon: MessageSquare 
    },
    { 
        label: 'XP Total', 
        value: totalXp || 0, 
        color: 'text-amber-400',
        hoverColor: 'group-hover:text-amber-400',
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20', 
        shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        icon: Zap 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
        {stats.map((stat, idx) => (
            <div 
                key={idx} 
                className="bg-zinc-950/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 text-center hover:bg-white/[0.02] hover:border-white/10 transition-all duration-500 group flex flex-col justify-center items-center shadow-xl relative overflow-hidden"
            >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border ${stat.border} mb-4 group-hover:scale-110 transition-all duration-500 ${stat.shadow}`}>
                    <stat.icon size={22} />
                </div>
                
                <span className={`block text-3xl font-black text-white mb-2 drop-shadow-md ${stat.hoverColor} transition-colors duration-300`}>
                    {stat.value.toLocaleString()}
                </span>
                
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">
                    {stat.label}
                </span>
            </div>
        ))}
    </div>
  );
}