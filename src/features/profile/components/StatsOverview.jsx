import { Eye, Heart, MessageSquare, Zap } from 'lucide-react';

export default function StatsOverview({ totalXp, watchedCount, likesCount, reviewsCount }) {
  const stats = [
    {
      label: 'Assistidos',
      value: watchedCount || 0,
      eyebrow: 'Histórico',
      tone: 'text-emerald-300',
      bg: 'from-emerald-500/16',
      border: 'border-emerald-400/15',
      icon: Eye,
    },
    {
      label: 'Curtidas',
      value: likesCount || 0,
      eyebrow: 'Favoritos',
      tone: 'text-red-300',
      bg: 'from-red-500/16',
      border: 'border-red-400/15',
      icon: Heart,
    },
    {
      label: 'Reviews',
      value: reviewsCount || 0,
      eyebrow: 'Opinião',
      tone: 'text-violet-300',
      bg: 'from-violet-500/16',
      border: 'border-violet-400/15',
      icon: MessageSquare,
    },
    {
      label: 'XP Total',
      value: totalXp || 0,
      eyebrow: 'Progressão',
      tone: 'text-amber-300',
      bg: 'from-amber-500/16',
      border: 'border-amber-400/15',
      icon: Zap,
    },
  ];

  return (
    <div className="grid h-full grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className={`group relative min-h-[132px] overflow-hidden rounded-[1.5rem] border bg-gradient-to-br ${stat.bg} via-white/[0.025] to-transparent p-4 shadow-[0_20px_56px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.045] ${stat.border}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_38%)] opacity-60" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-black/25 ${stat.tone} transition-transform duration-500 group-hover:scale-105`}>
                <stat.icon size={16} />
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{stat.eyebrow}</span>
            </div>

            <div>
              <strong className="block text-2xl font-black tracking-[-0.03em] text-white">
                {stat.value.toLocaleString()}
              </strong>
              <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {stat.label}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
