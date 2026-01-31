import { useState } from 'react';
import { useProfileLogic } from '../../hooks/useProfileLogic';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsOverview from '../../components/profile/StatsOverview';
import ActivityFeed from '../../components/profile/ActivityFeed';
import ReviewsList from '../../components/profile/ReviewsList';
import Diary from '../../components/profile/Diary';
import AvatarSelectorModal from '../../components/ui/AvatarSelectorModal';
import BackgroundSelectorModal from '../../components/ui/BackgroundSelectorModal';
import UserListModal from '../../components/ui/UserListModal';
import UserSearch from '../../components/UserSearch';
import Modal from '../../components/ui/Modal';
import { 
  Activity, 
  MessageSquare, 
  ArrowDownCircle, 
  BookOpen, 
  Trophy, 
  Star, 
  Info, 
  Award, 
  Zap, 
  Crown, 
  ShieldCheck, 
  Flame, 
  Play, 
  PenTool, 
  Mic2, 
  Feather, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  Heart 
} from 'lucide-react';

const TROPHY_ICONS = { Award, Zap, Crown, ShieldCheck, Flame, Play, Star, PenTool, Mic2, Feather, Eye };

export default function Profile() {
  const { user, data, ui, modals, actions } = useProfileLogic();
  const [isXpInfoOpen, setIsXpInfoOpen] = useState(false);

  if (ui.loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const getXPNeeded = (level) => 100 + (level - 1) * 75;
  const xpRequired = getXPNeeded(user.level || 1);
  const progressPercent = Math.min(Math.round(((user.xp || 0) / xpRequired) * 100), 100);

  const getLevelStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema": return { text: "text-cyan-400", bar: "bg-cyan-500", border: "border-cyan-500/40", shadow: "shadow-[0_0_25px_rgba(6,182,212,0.2)]" };
      case "Entidade Cinematográfica": return { text: "text-purple-400", bar: "bg-purple-500", border: "border-purple-500/40", shadow: "shadow-[0_0_25px_rgba(168,85,247,0.2)]" };
      case "Oráculo da Sétima Arte": return { text: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/40", shadow: "shadow-[0_0_25px_rgba(16,185,129,0.2)]" };
      case "Mestre da Crítica": return { text: "text-amber-500", bar: "bg-amber-500", border: "border-amber-500/30", shadow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" };
      case "Cinéfilo Experiente": return { text: "text-blue-400", bar: "bg-blue-500", border: "border-blue-500/30", shadow: "shadow-lg" };
      case "Cinéfilo": return { text: "text-indigo-400", bar: "bg-indigo-500", border: "border-indigo-500/30", shadow: "shadow-md" };
      case "Crítico Iniciante": return { text: "text-zinc-300", bar: "bg-zinc-500", border: "border-zinc-500/30", shadow: "shadow-sm" };
      default: return { text: "text-zinc-100", bar: "bg-violet-600", border: "border-white/5", shadow: "shadow-xl" };
    }
  };

  const style = getLevelStyle(user.levelTitle);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pt-6 px-4 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
            <div className="w-full md:w-auto">
                <UserSearch />
            </div>
        </div>

        <ProfileHeader 
            user={user} 
            onEditAvatar={() => actions.openModal('avatar')}
            onEditBackground={() => actions.openModal('background')}
            onShowFollowers={actions.openFollowersModal}
            onShowFollowing={actions.openFollowingModal}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
            <div className={`bg-zinc-900/50 p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden group hover:bg-zinc-900 transition-all duration-500 min-h-[200px] min-w-0 ${style.border} ${style.shadow}`}>
                <div className="relative z-10 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${style.text}`}>
                            <Trophy size={20} />
                        </div>
                        <button onClick={() => setIsXpInfoOpen(true)} className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                            <Info size={16} />
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Nível {user.level || 1}</p>
                    <h3 className={`text-xl font-black leading-tight break-words pr-4 drop-shadow-sm ${style.text}`}>
                        {user.levelTitle || 'Espectador'}
                    </h3>
                </div>

                <div className="relative z-10 space-y-1.5 mt-6">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500 uppercase tracking-tighter">Progresso</span>
                        <span className="text-zinc-300">{user.xp || 0} / {xpRequired} XP</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${style.bar} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
                <Star className={`absolute -right-4 -bottom-4 w-24 h-24 -rotate-12 opacity-5 transition-opacity group-hover:opacity-10 ${style.text}`} />
            </div>

            <div className="lg:col-span-3">
                <StatsOverview 
                    totalXp={user.totalXp}
                    watchedCount={user.watchedCount || data.watchedCount}
                    likesCount={user.likesCount || data.likesCount}
                    reviewsCount={user.reviewsCount || data.reviewsCount}
                />
            </div>
        </div>

        {user.trophies && user.trophies.length > 0 && (
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="text-violet-500" size={24} />
                    <h2 className="text-xl font-bold text-white tracking-tight">Estante de Troféus</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {user.trophies.map((trophy) => {
                        const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                        return (
                            <div key={trophy.id} className="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-violet-500/40 transition-all cursor-default">
                                <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 mb-3 group-hover:scale-110 transition-transform">
                                    <Icon size={24} />
                                </div>
                                <span className="text-xs font-bold text-zinc-200 leading-tight">{trophy.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="bg-zinc-900/30 rounded-3xl p-6 border border-white/5 min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-1 mb-6">
                <div className="flex gap-8 overflow-x-auto">
                    <button onClick={() => actions.setActiveTab('activity')} className={`flex items-center gap-2 pb-4 text-lg font-bold transition-all border-b-2 whitespace-nowrap ${ui.activeTab === 'activity' ? 'text-violet-500 border-violet-500' : 'text-zinc-500 border-transparent hover:text-white'}`}>
                        <Activity size={20} /> Atividade
                    </button>
                    <button onClick={() => actions.setActiveTab('reviews')} className={`flex items-center gap-2 pb-4 text-lg font-bold transition-all border-b-2 whitespace-nowrap ${ui.activeTab === 'reviews' ? 'text-violet-500 border-violet-500' : 'text-zinc-500 border-transparent hover:text-white'}`}>
                        <MessageSquare size={20} /> Reviews
                    </button>
                    <button onClick={() => actions.setActiveTab('diary')} className={`flex items-center gap-2 pb-4 text-lg font-bold transition-all border-b-2 whitespace-nowrap ${ui.activeTab === 'diary' ? 'text-violet-500 border-violet-500' : 'text-zinc-500 border-transparent hover:text-white'}`}>
                        <BookOpen size={20} /> Diário
                    </button>
                </div>
                {ui.activeTab === 'activity' && (
                    <div className="flex gap-2 pb-2 md:pb-0 overflow-x-auto">
                        <button onClick={() => actions.setActivityFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${ui.activityFilter === 'all' ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-500 border-transparent hover:bg-zinc-900'}`}>Tudo</button>
                        <button onClick={() => actions.setActivityFilter('watched')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${ui.activityFilter === 'watched' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'text-zinc-500 border-transparent hover:bg-zinc-900'}`}>Assistidos</button>
                        <button onClick={() => actions.setActivityFilter('like')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${ui.activityFilter === 'like' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'text-zinc-500 border-transparent hover:bg-zinc-900'}`}>Curtidas</button>
                    </div>
                )}
            </div>
            {ui.activeTab === 'activity' && <ActivityFeed interactions={data.displayItems} />}
            {ui.activeTab === 'reviews' && <ReviewsList reviews={data.displayItems} />}
            {ui.activeTab === 'diary' && <Diary items={data.diaryItems} />}
            {ui.hasMore && ui.activeTab !== 'diary' && (
                <div className="flex justify-center pt-8">
                    <button onClick={actions.loadMore} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-bold transition-all border border-white/10">
                        <ArrowDownCircle size={20} /> Carregar Mais
                    </button>
                </div>
            )}
        </div>

        <AvatarSelectorModal isOpen={modals.avatar} onClose={() => actions.closeModal('avatar')} onSelect={actions.updateAvatar} />
        <BackgroundSelectorModal isOpen={modals.background} onClose={() => actions.closeModal('background')} onSelect={actions.updateBackground} />
        <UserListModal isOpen={modals.followers} onClose={() => actions.closeModal('followers')} title="Seguidores" users={data.followersList} loading={ui.loadingLists} />
        <UserListModal isOpen={modals.following} onClose={() => actions.closeModal('following')} title="Seguindo" users={data.followingList} loading={ui.loadingLists} />
        
        <Modal 
            isOpen={isXpInfoOpen} 
            onClose={() => setIsXpInfoOpen(false)} 
            title="Sistema de Progressão" 
            size="md"
        >
            <div className="space-y-8 p-1">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Como ganhar XP</h3>
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                                    <MessageSquare size={18} />
                                </div>
                                <span className="font-bold text-zinc-200">Escrever uma Avaliação</span>
                            </div>
                            <span className="font-black text-violet-400 text-sm bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]">+20 XP</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="font-bold text-zinc-200">Marcar como Assistido</span>
                            </div>
                            <span className="font-black text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">+10 XP</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                    <Heart size={18} />
                                </div>
                                <span className="font-bold text-zinc-200">Dar Curtida (Like)</span>
                            </div>
                            <span className="font-black text-red-400 text-sm bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">+5 XP</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Títulos por Avaliações</h3>
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-white/5">Baseado em Reviews</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-transparent border border-cyan-500/30 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 ring-1 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <Crown size={24} />
                            </div>
                            <div className="flex flex-col relative z-10">
                                <span className="font-black text-cyan-400 text-lg tracking-tight">Divindade do Cinema</span>
                                <span className="text-xs font-bold text-cyan-500/70 uppercase tracking-wider">500+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-transparent border border-purple-500/30 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 ring-1 ring-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                <Zap size={24} />
                            </div>
                            <div className="flex flex-col relative z-10">
                                <span className="font-black text-purple-400 text-lg tracking-tight">Entidade Cinematográfica</span>
                                <span className="text-xs font-bold text-purple-500/70 uppercase tracking-wider">250+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-transparent border border-emerald-500/30 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Sparkles size={24} />
                            </div>
                            <div className="flex flex-col relative z-10">
                                <span className="font-black text-emerald-400 text-lg tracking-tight">Oráculo da Sétima Arte</span>
                                <span className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider">100+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Award size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-amber-500 text-base">Mestre da Crítica</span>
                                <span className="text-xs font-medium text-amber-500/60">50+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Star size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-blue-500 text-base">Cinéfilo Experiente</span>
                                <span className="text-xs font-medium text-blue-500/60">20+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                                <MessageSquare size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-indigo-500 text-base">Cinéfilo</span>
                                <span className="text-xs font-medium text-indigo-500/60">10+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-center gap-4">
                            <div className="p-2 bg-zinc-700/30 rounded-lg text-zinc-400">
                                <PenTool size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-300 text-base">Crítico Iniciante</span>
                                <span className="text-xs font-medium text-zinc-500">5+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 flex items-center gap-4 opacity-70">
                            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-600">
                                <Eye size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-500 text-base">Espectador</span>
                                <span className="text-xs font-medium text-zinc-600">Menos de 5 Reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
  );
}