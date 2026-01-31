import { useParams } from 'react-router-dom';
import { usePublicProfileLogic } from '../../hooks/usePublicProfileLogic';
import PublicProfileHeader from '../../components/profile/PublicProfileHeader';
import ReviewsList from '../../components/profile/ReviewsList';
import { 
  MessageSquare, 
  Ghost, 
  Trophy, 
  Award, 
  Users, 
  Star, 
  Activity,
  Zap,
  Crown,
  ShieldCheck,
  Flame,
  Play,
  PenTool,
  Mic2,
  Feather,
  Eye,
  Sparkles
} from 'lucide-react';

const TROPHY_ICONS = { Award, Zap, Crown, ShieldCheck, Flame, Play, Star, PenTool, Mic2, Feather, Eye, Sparkles };

export default function PublicProfile() {
  const { username } = useParams();
  const { profile, reviews, isFollowing, followsYou, loading, compatibility, actions } = usePublicProfileLogic(username);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
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

  return (
    <div className="bg-zinc-950 min-h-screen pb-32">
      <PublicProfileHeader 
        user={profile} 
        isFollowing={isFollowing} 
        followsYou={followsYou}
        onFollow={actions.handleFollow} 
        compatibility={compatibility}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            <div className="lg:col-span-1 space-y-6">
                
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Sobre</h3>
                    {profile.bio ? (
                        <p className="text-zinc-300 text-sm leading-relaxed">{profile.bio}</p>
                    ) : (
                        <p className="text-zinc-600 text-sm italic">Sem biografia.</p>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Users size={16} />
                                <span className="text-sm font-medium">Seguidores</span>
                            </div>
                            <span className="text-white font-bold">{profile.followersCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Users size={16} />
                                <span className="text-sm font-medium">Seguindo</span>
                            </div>
                            <span className="text-white font-bold">{profile.followingCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Star size={16} />
                                <span className="text-sm font-medium">Reviews</span>
                            </div>
                            <span className="text-white font-bold">{profile.reviewsCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-500/80">
                                <Trophy size={16} />
                                <span className="text-sm font-medium">XP Total</span>
                            </div>
                            <span className="text-amber-500 font-bold">{profile.totalXp || 0}</span>
                        </div>
                    </div>
                </div>

                {profile.trophies && profile.trophies.length > 0 && (
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award size={14} className="text-yellow-500" /> Conquistas
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {profile.trophies.map((trophy, index) => {
                                const Icon = TROPHY_ICONS[trophy.icon] || Trophy;
                                return (
                                    <div key={index} title={trophy.title} className="aspect-square bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-center text-yellow-500/80 hover:text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all cursor-help group/trophy">
                                        <Icon size={20} className="group-hover/trophy:scale-110 transition-transform" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-3 space-y-6">
                 <div className="bg-zinc-900/30 border border-white/5 rounded-3xl min-h-[500px] overflow-hidden">
                    <div className="flex items-center gap-6 px-6 pt-6 border-b border-white/5 overflow-x-auto">
                        <button className="flex items-center gap-2 pb-4 border-b-2 border-violet-500 text-violet-400 font-bold text-sm whitespace-nowrap">
                            <Activity size={18} />
                            Atividade & Reviews
                        </button>
                    </div>

                    <div className="p-6">
                        {reviews.length > 0 ? (
                            <ReviewsList reviews={reviews} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p className="font-medium">Nenhuma atividade recente</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
}