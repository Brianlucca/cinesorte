import { UserPlus, UserMinus, Sparkles, Trophy, Award } from 'lucide-react';
import LevelBadge from '../ui/LevelBadge';

export default function PublicProfileHeader({ user, isFollowing, onFollow, compatibility }) {
  return (
    <div className="relative w-full group/header mb-8">
        
        {/* Capa do Perfil - REMOVIDO o rounded-b-[3rem] e shadow-2xl para tirar o aspecto de card */}
        <div className="relative w-full h-[45vh] min-h-[350px] overflow-hidden bg-zinc-900">
            {user?.backgroundURL ? (
                <img 
                    src={user.backgroundURL} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/header:scale-105 opacity-60" 
                />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/50 via-zinc-950 to-black" />
            )}
            {/* Gradiente suave na base do banner para transição */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative -mt-32 z-20">
            <div className="flex flex-col md:flex-row items-end gap-8">
                
                {/* Coluna do Avatar e Badge */}
                <div className="shrink-0 mx-auto md:mx-0 flex flex-col items-center">
                    {/* Avatar */}
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-1.5 bg-zinc-950 shadow-xl relative z-10">
                        <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden relative border-4 border-zinc-900">
                            {user?.photoURL ? (
                                <img src={user.photoURL} className="w-full h-full object-cover" alt={user.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-violet-600 text-white text-6xl font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* --- CORREÇÃO AQUI: Badge posicionado EMBAIXO da foto com margem --- */}
                    {user?.levelTitle && (
                        <div className="mt-2 z-20">
                            <LevelBadge title={user.levelTitle} size="lg" />
                        </div>
                    )}
                </div>

                {/* Informações do Usuário (Lado direito) */}
                <div className="flex-1 w-full text-center md:text-left pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-1">
                                {user?.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <p className="text-violet-400 font-medium text-lg">@{user?.username}</p>
                                {compatibility > 0 && (
                                    <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-0.5 rounded-full text-xs font-bold border border-green-500/20">
                                        <Sparkles size={12} /> {compatibility}% Compatível
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center md:justify-end">
                            <button 
                                onClick={onFollow}
                                className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap ${
                                    isFollowing 
                                    ? 'bg-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 border border-zinc-700' 
                                    : 'bg-white text-black hover:bg-zinc-200 border border-transparent'
                                }`}
                            >
                                {isFollowing ? <><UserMinus size={18} /> Deixar de Seguir</> : <><UserPlus size={18} /> Seguir</>}
                            </button>
                        </div>
                    </div>

                    {user?.bio && (
                        <p className="text-zinc-300 leading-relaxed max-w-3xl text-sm md:text-base font-light mb-8 mx-auto md:mx-0">
                            {user.bio}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 md:gap-10 justify-center md:justify-start border-t border-white/5 pt-6">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-bold text-white">{user?.followersCount || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seguidores</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-bold text-white">{user?.followingCount || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seguindo</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-bold text-white">{user?.reviewsCount || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Reviews</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-bold text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{user?.totalXp || 0}</span>
                            <span className="text-xs text-amber-500/70 uppercase font-bold tracking-wider">XP Total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Seção de Troféus */}
        {user?.trophies && user.trophies.length > 0 && (
            <div className="max-w-6xl mx-auto px-6 mt-16">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" /> Conquistas Desbloqueadas ({user.trophies.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {user.trophies.map((trophy, index) => (
                        <div key={index} className="flex items-center gap-4 bg-zinc-900/50 px-5 py-4 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all group/trophy hover:bg-zinc-900">
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover/trophy:bg-yellow-500 group-hover/trophy:text-black transition-colors shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                <Award size={20} />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-white group-hover/trophy:text-yellow-500 transition-colors line-clamp-1">{trophy.title}</span>
                                <span className="text-[11px] text-zinc-500 uppercase tracking-wide">
                                    {new Date(trophy.awardedAt?._seconds ? trophy.awardedAt._seconds * 1000 : trophy.awardedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}