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
import { Activity, MessageSquare, ArrowDownCircle, BookOpen, Trophy, Star, Info, CheckCircle, Heart, Sparkles, Award, Zap, Crown, ShieldCheck, Flame, Play } from 'lucide-react';

const TROPHY_ICONS = {
    Award, Zap, Crown, ShieldCheck, Flame, Play, Star
};

export default function Profile() {
  const { user, data, ui, modals, actions } = useProfileLogic();
  const [isXpInfoOpen, setIsXpInfoOpen] = useState(false);

  if (ui.loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const getXPNeeded = (level) => 100 + (level - 1) * 50;
  const xpRequired = getXPNeeded(user.level || 1);
  const progressPercent = Math.min(Math.round(((user.xp || 0) / xpRequired) * 100), 100);

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:bg-zinc-900 transition-all duration-300 min-h-[180px]">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Trophy size={20} />
                        </div>
                        <button onClick={() => setIsXpInfoOpen(true)} className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                            <Info size={16} />
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nível {user.level || 1}</p>
                    <h3 className="text-lg font-black text-white truncate mb-2">{user.levelTitle || 'Espectador'}</h3>
                </div>
                <div className="relative z-10 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500 uppercase tracking-tighter">Progresso</span>
                        <span className="text-zinc-300">{user.xp || 0} / {xpRequired} XP</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.3)]" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
                <Star className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 -rotate-12 group-hover:text-white/10 transition-colors" />
            </div>
            <div className="lg:col-span-3">
                <StatsOverview 
                    totalXp={user.totalXp}
                    watchedCount={data.watchedCount}
                    likesCount={data.likesCount}
                    reviewsCount={data.reviewsCount}
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

        <Modal isOpen={isXpInfoOpen} onClose={() => setIsXpInfoOpen(false)} title="Gamificação CineSorte">
            <div className="space-y-6">
                <p className="text-zinc-400 text-sm leading-relaxed">No CineSorte, cada interação aumenta sua experiência e sua autoridade na comunidade.</p>
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400"><MessageSquare size={16} /></div>
                            <span className="text-sm font-bold text-white">Escrever Review</span>
                        </div>
                        <span className="text-violet-400 font-black">+20 XP</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400"><CheckCircle size={16} /></div>
                            <span className="text-sm font-bold text-white">Marcar como Assistido</span>
                        </div>
                        <span className="text-green-400 font-black">+10 XP</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><Heart size={16} /></div>
                            <span className="text-sm font-bold text-white">Dar uma Curtida</span>
                        </div>
                        <span className="text-red-400 font-black">+5 XP</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-500 mb-1"><Zap size={16} /><span className="font-bold text-sm">Dificuldade Progressiva</span></div>
                        <p className="text-xs text-amber-200/70">A cada nível, o XP necessário aumenta em 50 pontos, tornando sua jornada mais desafiadora e prestigiosa.</p>
                    </div>
                    <div className="p-4 bg-violet-600/10 rounded-2xl border border-violet-500/20">
                        <div className="flex items-center gap-2 text-violet-400 mb-1"><Sparkles size={16} /><span className="font-bold text-sm">Destaque nas Reviews</span></div>
                        <p className="text-xs text-violet-200/70">Usuários com Títulos altos (Mestre da Crítica, Cinéfilo) possuem suas reviews destacadas no topo do feed global e páginas de filmes!</p>
                    </div>
                    <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                        <div className="flex items-center gap-2 text-blue-400 mb-1"><Trophy size={16} /><span className="font-bold text-sm">Troféus e Medalhas</span></div>
                        <p className="text-xs text-blue-200/70">Ao atingir marcos de reviews ou XP, você desbloqueia troféus exclusivos que ficam expostos na sua vitrine.</p>
                    </div>
                </div>
            </div>
        </Modal>

        <AvatarSelectorModal isOpen={modals.avatar} onClose={() => actions.closeModal('avatar')} onSelect={actions.updateAvatar} />
        <BackgroundSelectorModal isOpen={modals.background} onClose={() => actions.closeModal('background')} onSelect={actions.updateBackground} />
        <UserListModal isOpen={modals.followers} onClose={() => actions.closeModal('followers')} title="Seguidores" users={data.followersList} loading={ui.loadingLists} />
        <UserListModal isOpen={modals.following} onClose={() => actions.closeModal('following')} title="Seguindo" users={data.followingList} loading={ui.loadingLists} />
    </div>
  );
}