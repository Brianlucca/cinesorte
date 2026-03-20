import { useParams } from 'react-router-dom';
import { usePublicProfileLogic } from '../../hooks/usePublicProfileLogic';
import PublicProfileHeader from '../../components/profile/PublicProfileHeader';
import ReviewsList from '../../components/profile/ReviewsList';
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
  const { profile, reviews, isFollowing, followsYou, loading, compatibility, actions } = usePublicProfileLogic(username);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-zinc-950">
        <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-zinc-800">
            <Ghost size={48} className="text-zinc-600" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Usuário não encontrado</h2>
        <p className="text-zinc-500 text-lg">O perfil que você procura não está disponível.</p>
    </div>
  );

  const getXPNeeded = (level) => 100 + (level - 1) * 75;
  const xpRequired = getXPNeeded(profile.level || 1);
  const progressPercent = Math.min(Math.round(((profile.xp || 0) / xpRequired) * 100), 100);

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

  const style = getLevelStyle(profile.levelTitle);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pt-6 px-4 pb-20">
        <PublicProfileHeader 
            user={profile} 
            isFollowing={isFollowing} 
            followsYou={followsYou}
            onFollow={actions.handleFollow} 
            compatibility={compatibility}
        />

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4">
            <div className={`w-full lg:w-[320px] bg-zinc-900/50 p-6 rounded-3xl border flex flex-col justify-between items-center text-center relative overflow-hidden group hover:bg-zinc-900 transition-all duration-500 min-h-[200px] shrink-0 ${style.border} ${style.shadow}`}>
                <div className="relative z-10 min-w-0 flex flex-col items-center w-full">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${style.text}`}>
                            <Trophy size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Nível {profile.level || 1}</p>
                    <h3 className={`text-xl font-black leading-tight break-words drop-shadow-sm ${style.text}`}>
                        {profile.levelTitle || 'Espectador'}
                    </h3>
                </div>

                <div className="relative z-10 space-y-1.5 mt-6 w-full">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500 uppercase tracking-tighter">Progresso</span>
                        <span className="text-zinc-300">{profile.xp || 0} / {xpRequired} XP</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${style.bar} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
                <Star className={`absolute -right-4 -bottom-4 w-24 h-24 -rotate-12 opacity-5 transition-opacity group-hover:opacity-10 ${style.text}`} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full lg:w-auto">
                <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 text-center hover:bg-zinc-900 transition-all duration-300 group flex flex-col justify-center items-center shadow-xl w-full sm:w-[260px]">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mb-3 group-hover:scale-110 transition-transform">
                        <Star size={18} />
                    </div>
                    <span className="block text-2xl font-black text-white mb-1 group-hover:text-amber-500 transition-colors">{profile.reviewsCount || 0}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.15em]">Reviews</span>
                </div>
                
                <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 text-center hover:bg-zinc-900 transition-all duration-300 group flex flex-col justify-center items-center shadow-xl w-full sm:w-[260px]">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mb-3 group-hover:scale-110 transition-transform">
                        <Zap size={18} />
                    </div>
                    <span className="block text-2xl font-black text-white mb-1 group-hover:text-amber-500 transition-colors">{profile.totalXp || 0}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.15em]">XP Total</span>
                </div>
            </div>
        </div>

        {profile.trophies && profile.trophies.length > 0 && (
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="text-violet-500" size={24} />
                    <h2 className="text-xl font-bold text-white tracking-tight">Estante de Troféus</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {profile.trophies.map((trophy, index) => {
                        const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                        return (
                            <div key={trophy.id || index} className="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-violet-500/40 transition-all cursor-default">
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
                    <button className="flex items-center gap-2 pb-4 text-lg font-bold transition-all border-b-2 whitespace-nowrap text-violet-500 border-violet-500">
                        <MessageSquare size={20} /> Reviews
                    </button>
                </div>
            </div>
            
            <ReviewsList reviews={reviews} />
        </div>
    </div>
  );
}