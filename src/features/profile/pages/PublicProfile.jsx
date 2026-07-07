import { useParams } from 'react-router-dom';
import { usePublicProfileLogic } from '@features/profile/hooks/usePublicProfileLogic';
import PublicProfileHeader from '@features/profile/components/PublicProfileHeader';
import StatsOverview from '@features/profile/components/StatsOverview';
import ReviewsList from '@features/profile/components/ReviewsList';
import UserSearch from '@shared/components/UserSearch';
import {
  Award,
  Crown,
  Eye,
  Feather,
  Flame,
  Ghost,
  MessageSquare,
  Mic2,
  PenTool,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

const TROPHY_ICONS = {
  Award,
  Zap,
  Crown,
  ShieldCheck,
  Flame,
  Play,
  Star,
  PenTool,
  Mic2,
  Feather,
  Eye,
  Sparkles,
};

const getXPNeeded = (level) => 100 + (level - 1) * 75;

function getLevelStyle(title) {
  switch (title) {
    case 'Divindade do Cinema':
      return { text: 'text-cyan-300', bar: 'bg-cyan-400', border: 'border-cyan-400/25' };
    case 'Entidade Cinematográfica':
    case 'Entidade Cinematografica':
      return { text: 'text-purple-300', bar: 'bg-purple-400', border: 'border-purple-400/25' };
    case 'Oráculo da Sétima Arte':
    case 'Oraculo da Setima Arte':
      return { text: 'text-emerald-300', bar: 'bg-emerald-400', border: 'border-emerald-400/25' };
    case 'Mestre da Crítica':
    case 'Mestre da Critica':
      return { text: 'text-amber-300', bar: 'bg-amber-400', border: 'border-amber-400/25' };
    case 'Cinéfilo Experiente':
    case 'Cinefilo Experiente':
      return { text: 'text-blue-300', bar: 'bg-blue-400', border: 'border-blue-400/25' };
    case 'Cinéfilo':
    case 'Cinefilo':
      return { text: 'text-indigo-300', bar: 'bg-indigo-400', border: 'border-indigo-400/25' };
    case 'Crítico Iniciante':
    case 'Critico Iniciante':
      return { text: 'text-zinc-200', bar: 'bg-zinc-400', border: 'border-white/[0.08]' };
    default:
      return { text: 'text-violet-300', bar: 'bg-violet-400', border: 'border-violet-400/20' };
  }
}

export default function PublicProfile() {
  const { username } = useParams();
  const {
    profile,
    reviews,
    isFollowing,
    followsYou,
    loading,
    messaging,
    compatibility,
    hasMoreReviews,
    loadingMoreReviews,
    actions,
  } = usePublicProfileLogic(username);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600/30 border-t-violet-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Carregando perfil</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950 px-4 text-center text-white">
        <div>
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[2rem] border border-white/[0.06] bg-zinc-900/60">
            <Ghost size={48} className="text-zinc-600" />
          </div>
          <h2 className="mb-3 text-3xl font-black tracking-tight text-white md:text-4xl">Usuário não encontrado</h2>
          <p className="text-base font-medium text-zinc-500">O perfil que você procura não está disponível.</p>
        </div>
      </div>
    );
  }

  const xpRequired = getXPNeeded(profile.level || 1);
  const progressPercent = Math.min(Math.round(((profile.xp || 0) / xpRequired) * 100), 100);
  const levelStyle = getLevelStyle(profile.levelTitle);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white animate-in fade-in duration-700">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.10),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.055),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] space-y-7 px-4 pt-8 sm:px-6 md:px-10 md:pt-10 xl:px-14">
        <header className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-6 md:flex-row md:items-end md:pb-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-violet-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
              Perfil público
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">
              {profile.name || `@${profile.username}`}
            </h1>
          </div>
          <div className="w-full md:w-[360px]">
            <UserSearch />
          </div>
        </header>

        <PublicProfileHeader
          user={profile}
          isFollowing={isFollowing}
          followsYou={followsYou}
          onFollow={actions.handleFollow}
          onMessage={actions.handleMessage}
          messaging={messaging}
          compatibility={compatibility}
        />

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-4">
          <section className={`group relative min-h-[180px] overflow-hidden rounded-[1.5rem] border bg-[#0d0d11]/95 p-4 shadow-2xl md:p-5 ${levelStyle.border}`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.16),transparent_45%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.045] ${levelStyle.text}`}>
                    <Trophy size={19} />
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Nível {profile.level || 1}</span>
                <h2 className={`mt-1 break-words pr-5 text-base font-black leading-tight tracking-[-0.015em] sm:text-lg ${levelStyle.text}`}>
                  {profile.levelTitle || 'Espectador'}
                </h2>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  <span>Progresso</span>
                  <span className="text-zinc-300">{profile.xp || 0} / {xpRequired} XP</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-white/[0.06] bg-black/35">
                  <div className={`relative h-full rounded-full ${levelStyle.bar} transition-all duration-1000`} style={{ width: `${progressPercent}%` }}>
                    <span className="absolute inset-0 bg-white/15" />
                  </div>
                </div>
              </div>
            </div>
            <Star className={`absolute -bottom-5 -right-5 h-24 w-24 -rotate-12 opacity-5 transition-transform duration-700 group-hover:scale-110 ${levelStyle.text}`} />
          </section>

          <div className="lg:col-span-3">
            <StatsOverview
              totalXp={profile.totalXp}
              watchedCount={profile.watchedCount}
              likesCount={profile.likesCount}
              reviewsCount={profile.reviewsCount}
            />
          </div>
        </div>

        {profile.trophies?.length > 0 && (
          <section className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl md:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(245,158,11,0.08),transparent_36%)]" />
            <div className="relative mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                <Award size={17} />
              </span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">Conquistas</span>
                <h2 className="text-base font-black text-white sm:text-lg">Estante de Troféus</h2>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {profile.trophies.map((trophy, index) => {
                const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                return (
                  <div key={trophy.id || index} className="group flex min-h-[116px] cursor-default flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.045]">
                    <div className="mb-2.5 grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-zinc-400 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-500/10 group-hover:text-violet-300">
                      <Icon size={18} />
                    </div>
                    <span className="line-clamp-2 text-[11px] font-bold leading-snug text-zinc-300">{trophy.title}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="min-h-[500px] overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 border-b border-white/[0.06] pb-3 md:flex-row md:items-center">
            <div className="scrollbar-hide flex gap-5 overflow-x-auto">
              <button className="flex items-center gap-2 whitespace-nowrap border-b-2 border-violet-500 pb-3 text-sm font-bold text-white transition-all">
                <MessageSquare size={18} /> Reviews
              </button>
            </div>
          </div>

          <div className="animate-in fade-in duration-300">
            <ReviewsList
              reviews={reviews}
              hasMore={hasMoreReviews}
              loadingMore={loadingMoreReviews}
              onLoadMore={actions.loadMoreReviews}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
