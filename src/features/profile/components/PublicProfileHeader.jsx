import { UserPlus, UserCheck, Sparkles, Users, Calendar, Star, MessageSquare } from 'lucide-react';
import LevelBadge from '@shared/components/ui/LevelBadge';
import { useAuth } from '@shared/context/useAuth';

export default function PublicProfileHeader({ user, isFollowing, followsYou, onFollow, compatibility }) {
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.username === user?.username;

  return (
    <div className="relative w-full group/header mb-12">
        
        <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden rounded-[2.5rem] shadow-2xl bg-black border border-white/5">
            {user?.backgroundURL ? (
                <img 
                    src={user.backgroundURL} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/header:scale-105 opacity-90" 
                />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-zinc-950 to-black" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative px-6 md:px-10 -mt-32 z-10">
            <div className="flex flex-col md:flex-row items-end gap-8">
                
                <div className="relative group/avatar shrink-0 mx-auto md:mx-0">
                    <div className="w-48 h-48 rounded-full p-2 bg-zinc-950 shadow-2xl relative z-10 border border-white/5">
                        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative border border-white/10 shadow-inner">
                            {user?.photoURL ? (
                                <img src={user.photoURL} className="w-full h-full object-cover" alt={user.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-violet-600/20 text-violet-400 text-6xl font-black">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    {user?.levelTitle && (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap drop-shadow-xl">
                            <LevelBadge title={user.levelTitle} size="md" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left pb-2 w-full">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl capitalize">
                                {user?.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap mt-2">
                                <span className="text-violet-400 font-bold text-lg md:text-xl tracking-tight">@{user?.username}</span>
                                
                                {followsYou && !isMe && (
                                    <span className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border border-zinc-700 animate-in fade-in shadow-inner">
                                        Te Segue
                                    </span>
                                )}

                                {compatibility > 0 && !isMe && (
                                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                                        <Sparkles size={12} /> {compatibility}% Compatível
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isMe && (
                            <div className="flex flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
                                <button 
                                    onClick={onFollow}
                                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 whitespace-nowrap min-w-[160px] ${
                                        isFollowing 
                                        ? 'bg-zinc-900/80 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 shadow-inner' 
                                        : 'bg-white text-black hover:bg-zinc-200 border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                    }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserCheck size={18} /> 
                                            Seguindo
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} /> 
                                            Seguir
                                        </>
                                    )}
                                </button>
                                
                                {followsYou && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/5 animate-in fade-in backdrop-blur-sm shadow-inner">
                                        Este usuário segue você
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-6">
                        {user?.bio && (
                            <div className="flex items-start gap-3 justify-center md:justify-start">
                                <span className="w-1.5 h-5 bg-violet-500 rounded-full mt-1 shrink-0 hidden md:block"></span>
                                <p className="text-base leading-relaxed max-w-2xl font-medium text-zinc-300 text-justify md:text-left drop-shadow-sm">
                                    {user.bio}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 cursor-default shadow-inner text-zinc-400 group">
                                <Users size={16} className="text-violet-500 group-hover:text-violet-400 transition-colors" />
                                <span><strong className="text-white text-sm group-hover:text-violet-100 transition-colors">{user?.followersCount || 0}</strong> Seg.</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 cursor-default shadow-inner text-zinc-400 group">
                                <UserPlus size={16} className="text-violet-500 group-hover:text-violet-400 transition-colors" />
                                <span><strong className="text-white text-sm group-hover:text-violet-100 transition-colors">{user?.followingCount || 0}</strong> Seg.</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 cursor-default shadow-inner text-zinc-400 group">
                                <MessageSquare size={16} className="text-violet-500 group-hover:text-violet-400 transition-colors" />
                                <span><strong className="text-white text-sm group-hover:text-violet-100 transition-colors">{user?.reviewsCount || 0}</strong> Reviews</span>
                            </div>

                            {user?.createdAt && (
                                <div className="hidden md:flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 text-zinc-500 shadow-inner">
                                    <Calendar size={14} />
                                    <span>Desde {user.createdAt instanceof Date ? user.createdAt.getFullYear() : new Date(user.createdAt).getFullYear()}</span>
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