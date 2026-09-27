import { Eye, Heart, MessageSquare, Zap } from 'lucide-react';

export default function StatsOverview({ totalXp, watchedCount, likesCount, reviewsCount }) {
  const stats = [
    {
      label: 'Assistidos',
      value: watchedCount || 0,
      eyebrow: 'Histórico',
      tone: 'text-emerald-300',
      icon: Eye,
    },
    {
      label: 'Curtidas',
      value: likesCount || 0,
      eyebrow: 'Favoritos',
      tone: 'text-red-300',
      icon: Heart,
    },
    {
      label: 'Reviews',
      value: reviewsCount || 0,
      eyebrow: 'Opinião',
      tone: 'text-violet-300',
      icon: MessageSquare,
    },
    {
      label: 'XP Total',
      value: totalXp || 0,
      eyebrow: 'Progressão',
      tone: 'text-amber-300',
      icon: Zap,
    },
  ];

  return (
    <div className="grid h-full grid-cols-2 overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] md:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="group relative min-h-[132px] border-b border-r border-white/[0.06] p-4 transition-colors hover:bg-white/[0.025] md:min-h-[160px]"
        >
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] ${stat.tone}`}>
                <stat.icon size={16} />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{stat.eyebrow}</span>
            </div>

            <div>
              <strong className="block text-2xl font-semibold tracking-[-0.03em] text-white">
                {stat.value.toLocaleString()}
              </strong>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {stat.label}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
