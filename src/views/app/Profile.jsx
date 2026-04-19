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
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Carregando perfil...</p>
    </div>
  );

  const getXPNeeded = (level) => 100 + (level - 1) * 75;
  const xpRequired = getXPNeeded(user.level || 1);
  const progressPercent = Math.min(Math.round(((user.xp || 0) / xpRequired) * 100), 100);

  const getLevelStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema": return { text: "text-cyan-400", bar: "bg-cyan-500", border: "border-cyan-500/30", shadow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]" };
      case "Entidade Cinematográfica": return { text: "text-purple-400", bar: "bg-purple-500", border: "border-purple-500/30", shadow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]" };
      case "Oráculo da Sétima Arte": return { text: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/30", shadow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" };
      case "Mestre da Crítica": return { text: "text-amber-500", bar: "bg-amber-500", border: "border-amber-500/20", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]" };
      case "Cinéfilo Experiente": return { text: "text-blue-400", bar: "bg-blue-500", border: "border-blue-500/20", shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]" };
      case "Cinéfilo": return { text: "text-indigo-400", bar: "bg-indigo-500", border: "border-indigo-500/20", shadow: "shadow-lg" };
      case "Crítico Iniciante": return { text: "text-zinc-300", bar: "bg-zinc-500", border: "border-zinc-500/20", shadow: "shadow-md" };
      default: return { text: "text-zinc-100", bar: "bg-violet-600", border: "border-white/5", shadow: "shadow-sm" };
    }
  };

  const style = getLevelStyle(user.levelTitle);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pt-8 px-4 md:px-8 pb-20 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-8 bg-violet-500 rounded-full"></span>
              Meu Perfil
            </h1>
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
            <div className={`bg-zinc-950/80 backdrop-blur-md p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden group transition-all duration-300 min-h-[200px] min-w-0 ${style.border} ${style.shadow}`}>
                <div className="relative z-10 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 ${style.text}`}>
                            <Trophy size={24} />
                        </div>
                        <button onClick={() => setIsXpInfoOpen(true)} className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
                            <Info size={18} />
                        </button>
                    </div>
                    <p className="text-sm font-black text-zinc-500 tracking-widest mb-1">Nível {user.level || 1}</p>
                    <h3 className={`text-xl font-black leading-tight break-words pr-4 tracking-tight ${style.text}`}>
                        {user.levelTitle || 'Espectador'}
                    </h3>
                </div>

                <div className="relative z-10 space-y-2 mt-6">
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-zinc-500 tracking-wider text-xs">Progresso</span>
                        <span className="text-zinc-300 text-xs tracking-wider">{user.xp || 0} / {xpRequired} XP</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${style.bar} rounded-full transition-all duration-1000 relative`} style={{ width: `${progressPercent}%` }}>
                          <div className="absolute inset-0 bg-white/10" />
                        </div>
                    </div>
                </div>
                <Star className={`absolute -right-4 -bottom-4 w-28 h-28 -rotate-12 opacity-5 transition-transform duration-500 group-hover:scale-110 ${style.text}`} />
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
            <div className="bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                      <Award className="text-violet-400" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Estante de Troféus</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {user.trophies.map((trophy) => {
                        const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                        return (
                            <div key={trophy.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-violet-500/30 transition-all duration-300 cursor-default">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 mb-3 group-hover:text-violet-400 group-hover:bg-violet-500/10 group-hover:scale-110 transition-all duration-300 border border-white/5">
                                    <Icon size={24} />
                                </div>
                                <span className="text-xs font-bold text-zinc-300 leading-tight">{trophy.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="bg-zinc-950/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-2 mb-6">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                    <button onClick={() => actions.setActiveTab('activity')} className={`flex items-center gap-2 pb-4 text-base font-bold transition-all border-b-2 whitespace-nowrap ${ui.activeTab === 'activity' ? 'text-white border-violet-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                        <Activity size={18} /> Atividade
                    </button>
                    <button onClick={() => actions.setActiveTab('reviews')} className={`flex items-center gap-2 pb-4 text-base font-bold transition-all border-b-2 whitespace-nowrap ${ui.activeTab === 'reviews' ? 'text-white border-violet-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                        <MessageSquare size={18} /> Reviews
                    </button>
                    <button onClick={() => actions.setActiveTab('diary')} className={`flex items-center gap-2 pb-4 text-base font-bold transition-all border-b-2 whitespace-nowrap ${ui.activeTab === 'diary' ? 'text-white border-violet-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                        <BookOpen size={18} /> Diário
                    </button>
                </div>
                {ui.activeTab === 'activity' && (
                    <div className="flex gap-2 pb-4 md:pb-0 overflow-x-auto scrollbar-hide">
                        <button onClick={() => actions.setActivityFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${ui.activityFilter === 'all' ? 'bg-white text-black border-transparent' : 'bg-black/40 text-zinc-500 border-white/5 hover:text-white'}`}>Tudo</button>
                        <button onClick={() => actions.setActivityFilter('watched')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${ui.activityFilter === 'watched' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-black/40 text-zinc-500 border-white/5 hover:text-white'}`}>Assistidos</button>
                        <button onClick={() => actions.setActivityFilter('like')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${ui.activityFilter === 'like' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-black/40 text-zinc-500 border-white/5 hover:text-white'}`}>Curtidas</button>
                    </div>
                )}
            </div>
            
            <div className="animate-in fade-in duration-300">
              {ui.activeTab === 'activity' && <ActivityFeed interactions={data.displayItems} />}
              {ui.activeTab === 'reviews' && <ReviewsList reviews={data.displayItems} />}
              {ui.activeTab === 'diary' && <Diary items={data.diaryItems} />}
            </div>

            {ui.hasMore && ui.activeTab !== 'diary' && (
                <div className="flex justify-center pt-8">
                    <button onClick={actions.loadMore} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all border border-white/10 shadow-sm active:scale-95">
                        <ArrowDownCircle size={18} /> Carregar Mais
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
                    <h3 className="text-sm font-bold text-zinc-500 tracking-widest">Como ganhar XP</h3>
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                                    <MessageSquare size={18} />
                                </div>
                                <span className="font-bold text-zinc-200 text-sm">Escrever Review</span>
                            </div>
                            <span className="font-black text-violet-400 text-xs bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20">+20 XP</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="font-bold text-zinc-200 text-sm">Marcar Assistido</span>
                            </div>
                            <span className="font-black text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">+10 XP</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                    <Heart size={18} />
                                </div>
                                <span className="font-bold text-zinc-200 text-sm">Dar Curtida (Like)</span>
                            </div>
                            <span className="font-black text-red-400 text-xs bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">+5 XP</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-500 tracking-widest">Títulos por Avaliações</h3>
                        <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">Baseado em Reviews</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                                <Crown size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-cyan-400 text-sm">Divindade do Cinema</span>
                                <span className="text-[10px] font-medium text-cyan-500/70">500+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                <Zap size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-purple-400 text-sm">Entidade Cinematográfica</span>
                                <span className="text-[10px] font-medium text-purple-500/70">250+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                <Sparkles size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-emerald-400 text-sm">Oráculo da Sétima Arte</span>
                                <span className="text-[10px] font-medium text-emerald-500/70">100+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/10 flex items-center gap-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Award size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-amber-500 text-sm">Mestre da Crítica</span>
                                <span className="text-[10px] font-medium text-amber-500/60">50+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/10 flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Star size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-blue-500 text-sm">Cinéfilo Experiente</span>
                                <span className="text-[10px] font-medium text-blue-500/60">20+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                                <MessageSquare size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-indigo-500 text-sm">Cinéfilo</span>
                                <span className="text-[10px] font-medium text-indigo-500/60">10+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                <PenTool size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-300 text-sm">Crítico Iniciante</span>
                                <span className="text-[10px] font-medium text-zinc-500">5+ Reviews</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4 opacity-70">
                            <div className="p-2 bg-white/5 rounded-lg text-zinc-600">
                                <Eye size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-500 text-sm">Espectador</span>
                                <span className="text-[10px] font-medium text-zinc-600">Menos de 5 Reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
  );
}
