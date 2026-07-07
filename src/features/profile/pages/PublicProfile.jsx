import { useParams } from 'react-router-dom';
import { usePublicProfileLogic } from '@features/profile/hooks/usePublicProfileLogic';
import PublicProfileHeader from '@features/profile/components/PublicProfileHeader';
import ReviewsList from '@features/profile/components/ReviewsList';
import { 
  Ghost,
  MessageSquare, 
  Trophy, 
  Star, 
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
  Users 
} from 'lucide-react';

const TROPHY_ICONS = { Award, Zap, Crown, ShieldCheck, Flame, Play, Star, PenTool, Mic2, Feather, Eye, Sparkles };

export default function PublicProfile() {
  const { username } = useParams();
  const {
    profile,
    reviews,
    isFollowing,
    followsYou,
    loading,
    compatibility,
    hasMoreReviews,
    loadingMoreReviews,
    actions,
  } = usePublicProfileLogic(username);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Carregando perfil...</p>
    </div>
  );

  if (!profile) return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-zinc-950 animate-in fade-in duration-500">
        <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 mb-6 shadow-inner">
            <Ghost size={56} className="text-zinc-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">Usuário não encontrado</h2>
        <p className="text-zinc-500 text-lg font-medium">O perfil que você procura não está disponível.</p>
    </div>
  );

  const getXPNeeded = (level) => 100 + (level - 1) * 75;
  const xpRequired = getXPNeeded(profile.level || 1);
  const progressPercent = Math.min(Math.round(((profile.xp || 0) / xpRequired) * 100), 100);

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

  const style = getLevelStyle(profile.levelTitle);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pt-8 px-4 md:px-8 pb-20 relative">
        <PublicProfileHeader 
            user={profile} 
            isFollowing={isFollowing} 
            followsYou={followsYou}
            onFollow={actions.handleFollow} 
            compatibility={compatibility}
        />

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4">
            <div className={`w-full lg:w-[320px] bg-zinc-950/80 backdrop-blur-md p-6 rounded-3xl border flex flex-col justify-between items-center text-center relative overflow-hidden group hover:bg-zinc-950 transition-all duration-500 min-h-[200px] shrink-0 ${style.border} ${style.shadow}`}>
                <div className="relative z-10 min-w-0 flex flex-col items-center w-full">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 ${style.text}`}>
                            <Trophy size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-black text-zinc-500 tracking-widest mb-1">Nível {profile.level || 1}</p>
                    <h3 className={`text-xl font-black leading-tight break-words drop-shadow-sm tracking-tight ${style.text}`}>
                        {profile.levelTitle || 'Espectador'}
                    </h3>
                </div>

                <div className="relative z-10 space-y-2 mt-6 w-full">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-500 tracking-wider text-[12px]">Progresso</span>
                        <span className="text-zinc-300 text-[10px] tracking-wider">{profile.xp || 0} / {xpRequired} XP</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${style.bar} rounded-full transition-all duration-1000 relative`} style={{ width: `${progressPercent}%` }}>
                           <div className="absolute inset-0 bg-white/10" />
                        </div>
                    </div>
                </div>
                <Star className={`absolute -right-4 -bottom-4 w-28 h-28 -rotate-12 opacity-5 transition-transform duration-500 group-hover:scale-110 ${style.text}`} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full lg:w-auto">
                <div className="bg-zinc-950/80 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center hover:bg-zinc-950 transition-all duration-500 group flex flex-col justify-center items-center shadow-xl w-full sm:w-[260px] relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mb-4 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                        <Star size={22} />
                    </div>
                    <span className="block text-3xl font-black text-white mb-2 drop-shadow-md group-hover:text-amber-400 transition-colors duration-300">{profile.reviewsCount || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Reviews</span>
                </div>
                
                <div className="bg-zinc-950/80 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center hover:bg-zinc-950 transition-all duration-500 group flex flex-col justify-center items-center shadow-xl w-full sm:w-[260px] relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mb-4 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                        <Zap size={22} />
                    </div>
                    <span className="block text-3xl font-black text-white mb-2 drop-shadow-md group-hover:text-amber-400 transition-colors duration-300">{profile.totalXp || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">XP Total</span>
                </div>
            </div>
        </div>

        {profile.trophies && profile.trophies.length > 0 && (
            <div className="bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                      <Award className="text-violet-400" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Estante de Troféus</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {profile.trophies.map((trophy, index) => {
                        const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                        return (
                            <div key={trophy.id || index} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-violet-500/30 transition-all duration-300 cursor-default">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 mb-3 group-hover:text-violet-400 group-hover:bg-violet-500/10 group-hover:scale-110 transition-all duration-300 border border-white/5">
                                    <Icon size={24} />
                                </div>
                                <span className="text-xs font-bold text-zinc-300 leading-tight  tracking-wider">{trophy.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="bg-zinc-950/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-2 mb-6">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                    <button className="flex items-center gap-2 pb-4 text-base font-bold transition-all border-b-2 whitespace-nowrap text-white border-violet-500">
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
        </div>
    </div>
  );
}
