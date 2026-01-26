import { UserPlus, UserCheck, Users, Calendar, UserMinus, Sparkles, Trophy, Award, BookOpen, Star, Crown } from 'lucide-react';

export default function PublicProfileHeader({ user, isFollowing, onFollow, compatibility }) {
  
  const getLevelColor = (title) => {
      switch(title) {
          case 'Mestre da Crítica': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
          case 'Cinéfilo': return 'text-violet-400 border-violet-500/20 bg-violet-500/10';
          case 'Crítico Iniciante': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
          default: return 'text-zinc-400 border-zinc-700 bg-zinc-800';
      }
  };

  const getLevelIcon = (title) => {
      if(title === 'Mestre da Crítica') return <Crown size={14} className="text-amber-500" fill="currentColor" />;
      return <Star size={14} />;
  };

  return (
    <div className="relative w-full group/header mb-8">
        
        <div className="relative w-full h-[45vh] min-h-[350px] overflow-hidden rounded-b-[3rem] shadow-2xl">
            {user?.backgroundURL ? (
                <img 
                    src={user.backgroundURL} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/header:scale-105" 
                />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900 via-zinc-950 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative -mt-32 z-20">
            <div className="flex flex-col md:flex-row items-end gap-8">
                
                <div className="relative group/avatar shrink-0 mx-auto md:mx-0">
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-1.5 bg-zinc-950 shadow-2xl relative z-10">
                        <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden relative border-4 border-zinc-800">
                            {user?.photoURL ? (
                                <img src={user.photoURL} className="w-full h-full object-cover" alt={user.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-violet-600 text-white text-6xl font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    {user?.levelTitle && (
                        <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-lg flex items-center gap-2 whitespace-nowrap z-20 ${getLevelColor(user.levelTitle)}`}>
                            {getLevelIcon(user.levelTitle)}
                            {user.levelTitle}
                        </div>
                    )}
                </div>

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
                        <p className="text-zinc-300 leading-relaxed max-w-3xl text-sm md:text-base font-light mb-6 mx-auto md:mx-0">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start border-t border-white/5 pt-6">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-white">{user?.followersCount || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seguidores</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-white">{user?.followingCount || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seguindo</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-white">{user?.reviewsCount || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Reviews</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-amber-500">{user?.xp || 0}</span>
                            <span className="text-xs text-amber-500/60 uppercase font-bold tracking-wider">XP Total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {user?.trophies && user.trophies.length > 0 && (
            <div className="max-w-6xl mx-auto px-6 mt-12">
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-500" /> Conquistas Desbloqueadas
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {user.trophies.map((trophy, index) => (
                            <div key={index} className="flex items-center gap-3 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-colors group/trophy cursor-default">
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover/trophy:bg-yellow-500 group-hover/trophy:text-black transition-colors">
                                    <Award size={18} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-white group-hover/trophy:text-yellow-500 transition-colors">{trophy.title}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                                        {new Date(trophy.awardedAt?._seconds ? trophy.awardedAt._seconds * 1000 : trophy.awardedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}