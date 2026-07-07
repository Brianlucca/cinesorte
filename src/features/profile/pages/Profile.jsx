import { useState } from 'react';
import { useProfileLogic } from '@features/profile/hooks/useProfileLogic';
import ProfileHeader from '@features/profile/components/ProfileHeader';
import StatsOverview from '@features/profile/components/StatsOverview';
import ActivityFeed from '@features/profile/components/ActivityFeed';
import ReviewsList from '@features/profile/components/ReviewsList';
import Diary from '@features/profile/components/Diary';
import AvatarSelectorModal from '@shared/components/ui/AvatarSelectorModal';
import BackgroundSelectorModal from '@shared/components/ui/BackgroundSelectorModal';
import UserListModal from '@shared/components/ui/UserListModal';
import UserSearch from '@shared/components/UserSearch';
import Modal from '@shared/components/ui/Modal';
import {
  Award,
  BookOpen,
  CheckCircle,
  Crown,
  Eye,
  Feather,
  Flame,
  Heart,
  Info,
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
};

const getXPNeeded = (level) => 100 + (level - 1) * 75;

function getLevelStyle(title) {
  switch (title) {
    case 'Divindade do Cinema':
      return { text: 'text-cyan-300', bar: 'bg-cyan-400', border: 'border-cyan-400/25', glow: 'shadow-cyan-500/10' };
    case 'Entidade Cinematografica':
    case 'Entidade Cinematográfica':
      return { text: 'text-purple-300', bar: 'bg-purple-400', border: 'border-purple-400/25', glow: 'shadow-purple-500/10' };
    case 'Oraculo da Setima Arte':
    case 'Oráculo da Sétima Arte':
      return { text: 'text-emerald-300', bar: 'bg-emerald-400', border: 'border-emerald-400/25', glow: 'shadow-emerald-500/10' };
    case 'Mestre da Critica':
    case 'Mestre da Crítica':
      return { text: 'text-amber-300', bar: 'bg-amber-400', border: 'border-amber-400/25', glow: 'shadow-amber-500/10' };
    case 'Cinefilo Experiente':
    case 'Cinéfilo Experiente':
      return { text: 'text-blue-300', bar: 'bg-blue-400', border: 'border-blue-400/25', glow: 'shadow-blue-500/10' };
    case 'Cinefilo':
    case 'Cinéfilo':
      return { text: 'text-indigo-300', bar: 'bg-indigo-400', border: 'border-indigo-400/25', glow: 'shadow-indigo-500/10' };
    case 'Critico Iniciante':
    case 'Crítico Iniciante':
      return { text: 'text-zinc-200', bar: 'bg-zinc-400', border: 'border-white/[0.08]', glow: 'shadow-black/20' };
    default:
      return { text: 'text-violet-300', bar: 'bg-violet-400', border: 'border-violet-400/20', glow: 'shadow-violet-500/10' };
  }
}

export default function Profile() {
  const { user, data, ui, modals, actions } = useProfileLogic();
  const [isXpInfoOpen, setIsXpInfoOpen] = useState(false);

  if (ui.loading) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600/30 border-t-violet-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Carregando perfil</p>
        </div>
      </div>
    );
  }

  const xpRequired = getXPNeeded(user.level || 1);
  const progressPercent = Math.min(Math.round(((user.xp || 0) / xpRequired) * 100), 100);
  const levelStyle = getLevelStyle(user.levelTitle);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white animate-in fade-in duration-700">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.10),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.055),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] space-y-7 px-4 pt-8 sm:px-6 md:px-10 md:pt-10 xl:px-14">
        <header className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-6 md:flex-row md:items-end md:pb-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-violet-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
              Central pessoal
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">Meu Perfil</h1>
          </div>
          <div className="w-full md:w-[360px]">
            <UserSearch />
          </div>
        </header>

        <ProfileHeader
          user={user}
          onEditAvatar={() => actions.openModal('avatar')}
          onEditBackground={() => actions.openModal('background')}
          onShowFollowers={actions.openFollowersModal}
          onShowFollowing={actions.openFollowingModal}
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
                  <button
                    type="button"
                    onClick={() => setIsXpInfoOpen(true)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white"
                    aria-label="Ver sistema de XP"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Nível {user.level || 1}</span>
                <h2 className={`mt-1 break-words pr-5 text-base font-black leading-tight tracking-[-0.015em] sm:text-lg ${levelStyle.text}`}>
                  {user.levelTitle || 'Espectador'}
                </h2>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  <span>Progresso</span>
                  <span className="text-zinc-300">{user.xp || 0} / {xpRequired} XP</span>
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
              totalXp={user.totalXp}
              watchedCount={user.watchedCount || data.watchedCount}
              likesCount={user.likesCount || data.likesCount}
              reviewsCount={user.reviewsCount || data.reviewsCount}
            />
          </div>
        </div>

        {user.trophies?.length > 0 && (
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
              {user.trophies.map((trophy) => {
                const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                return (
                  <div key={trophy.id} className="group flex min-h-[116px] cursor-default flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.045]">
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
              <button onClick={() => actions.setActiveTab('likes')} className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-all ${ui.activeTab === 'likes' ? 'border-red-400 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                <Heart size={18} className={ui.activeTab === 'likes' ? 'fill-red-400 text-red-400' : ''} /> Curtidas
              </button>
              <button onClick={() => actions.setActiveTab('reviews')} className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-all ${ui.activeTab === 'reviews' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                <MessageSquare size={18} /> Reviews
              </button>
              <button onClick={() => actions.setActiveTab('diary')} className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-all ${ui.activeTab === 'diary' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                <BookOpen size={18} /> Diário
              </button>
            </div>

          </div>

          {(ui.activeTab === 'likes' || ui.activeTab === 'diary') && (
            <p className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs font-medium leading-relaxed text-zinc-500">
              {ui.activeTab === 'likes'
                ? 'Somente os títulos curtidos aparecem aqui, ordenados pelo momento em que você curtiu.'
                : 'A data informada é a data do dia que você marcou o filme/série como assistido.'}
            </p>
          )}

          <div className="animate-in fade-in duration-300">
            {ui.activeTab === 'likes' && <ActivityFeed interactions={data.displayItems} />}
            {ui.activeTab === 'reviews' && (
              <ReviewsList
                reviews={data.displayItems}
                hasMore={ui.hasMoreReviews}
                loadingMore={ui.loadingMoreReviews}
                onLoadMore={actions.loadMoreReviews}
              />
            )}
            {ui.activeTab === 'diary' && <Diary items={data.diaryItems} />}
          </div>

        </section>
      </div>

      <AvatarSelectorModal isOpen={modals.avatar} onClose={() => actions.closeModal('avatar')} onSelect={actions.updateAvatar} />
      <BackgroundSelectorModal isOpen={modals.background} onClose={() => actions.closeModal('background')} onSelect={actions.updateBackground} />
      <UserListModal
        isOpen={modals.followers}
        onClose={() => actions.closeModal('followers')}
        title="Seguidores"
        users={data.followersList}
        loading={ui.loadingLists}
        hasMore={data.hasMoreFollowers}
        loadingMore={data.loadingMoreUsers}
        onLoadMore={actions.loadMoreFollowers}
      />
      <UserListModal
        isOpen={modals.following}
        onClose={() => actions.closeModal('following')}
        title="Seguindo"
        users={data.followingList}
        loading={ui.loadingLists}
        hasMore={data.hasMoreFollowing}
        loadingMore={data.loadingMoreUsers}
        onLoadMore={actions.loadMoreFollowing}
      />

      <Modal isOpen={isXpInfoOpen} onClose={() => setIsXpInfoOpen(false)} title="Sistema de Progressão" size="md">
        <div className="space-y-8 p-1">
          <section>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Como ganhar XP</h3>
            <div className="grid gap-3">
              {[
                { label: 'Escrever review', xp: '+20 XP', icon: MessageSquare, tone: 'text-violet-300 bg-violet-500/10 border-violet-400/15' },
                { label: 'Marcar assistido', xp: '+10 XP', icon: CheckCircle, tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/15' },
                { label: 'Dar curtida', xp: '+5 XP', icon: Heart, tone: 'text-red-300 bg-red-500/10 border-red-400/15' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl border ${item.tone}`}>
                      <item.icon size={17} />
                    </span>
                    <span className="text-sm font-bold text-zinc-200">{item.label}</span>
                  </div>
                  <span className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-1 text-xs font-black text-zinc-200">{item.xp}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Títulos por avaliações</h3>
              <span className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Reviews</span>
            </div>
            <div className="content-scrollbar max-h-[320px] space-y-3 overflow-y-auto pr-2">
              {[
                { title: 'Divindade do Cinema', subtitle: '500+ reviews', icon: Crown, tone: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/15' },
                { title: 'Entidade Cinematográfica', subtitle: '250+ reviews', icon: Zap, tone: 'text-purple-300 bg-purple-500/10 border-purple-400/15' },
                { title: 'Oráculo da Sétima Arte', subtitle: '100+ reviews', icon: Sparkles, tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/15' },
                { title: 'Mestre da Crítica', subtitle: '50+ reviews', icon: Award, tone: 'text-amber-300 bg-amber-500/10 border-amber-400/15' },
                { title: 'Cinéfilo Experiente', subtitle: '20+ reviews', icon: Star, tone: 'text-blue-300 bg-blue-500/10 border-blue-400/15' },
                { title: 'Cinéfilo', subtitle: '10+ reviews', icon: MessageSquare, tone: 'text-indigo-300 bg-indigo-500/10 border-indigo-400/15' },
                { title: 'Crítico Iniciante', subtitle: '5+ reviews', icon: PenTool, tone: 'text-zinc-300 bg-white/[0.04] border-white/[0.06]' },
                { title: 'Espectador', subtitle: 'Menos de 5 reviews', icon: Eye, tone: 'text-zinc-500 bg-black/25 border-white/[0.05]' },
              ].map((level) => {
                const LevelIcon = level.icon;
                return (
                  <div key={level.title} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border ${level.tone}`}>
                      <LevelIcon size={18} />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-zinc-100">{level.title}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{level.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
}
