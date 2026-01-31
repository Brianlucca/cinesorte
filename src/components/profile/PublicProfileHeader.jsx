import { UserPlus, UserCheck, Sparkles, Users, Calendar, Star, MessageSquare } from 'lucide-react';
import LevelBadge from '../ui/LevelBadge';
import { useAuth } from '../../context/AuthContext';

export default function PublicProfileHeader({ user, isFollowing, followsYou, onFollow, compatibility }) {
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.username === user?.username;

  return (
    <div className="relative w-full group/header mb-12">
        
        <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden rounded-3xl shadow-2xl bg-zinc-900">
            {user?.backgroundURL ? (
                <img 
                    src={user.backgroundURL} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/header:scale-105" 
                />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900 via-zinc-900 to-black" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative px-6 md:px-10 -mt-32 z-10">
            <div className="flex flex-col md:flex-row items-end gap-8">
                
                <div className="relative group/avatar shrink-0 mx-auto md:mx-0">
                    <div className="w-48 h-48 rounded-full p-1.5 bg-zinc-950 shadow-2xl relative z-10">
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
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                            <LevelBadge title={user.levelTitle} size="md" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left pb-2 w-full">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                                {user?.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap mt-2">
                                <span className="text-violet-400 font-medium text-lg md:text-xl">@{user?.username}</span>
                                
                                {followsYou && !isMe && (
                                    <span className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 px-3 py-0.5 rounded-full text-xs font-bold border border-zinc-700 animate-in fade-in">
                                        Te Segue
                                    </span>
                                )}

                                {compatibility > 0 && !isMe && (
                                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-500/20">
                                        <Sparkles size={12} /> {compatibility}% Compatível
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isMe && (
                            <div className="flex flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
                                <button 
                                    onClick={onFollow}
                                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap min-w-[160px] ${
                                        isFollowing 
                                        ? 'bg-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 border border-zinc-700' 
                                        : 'bg-white text-black hover:bg-zinc-200 border border-transparent'
                                    }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserCheck size={20} /> 
                                            Seguindo
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={20} /> 
                                            Seguir
                                        </>
                                    )}
                                </button>
                                
                                {followsYou && (
                                    <span className="text-xs font-medium text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-white/5 animate-in fade-in backdrop-blur-sm">
                                        Este usuário segue você
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-6">
                        {user?.bio && (
                            <p className="text-base leading-relaxed max-w-2xl font-light text-zinc-300 border-l-2 border-violet-500/50 pl-4 text-justify md:text-left">
                                {user.bio}
                            </p>
                        )}
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-zinc-400">
                            <div className="flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5 hover:bg-zinc-800 hover:border-violet-500/30 transition-all cursor-default">
                                <Users size={16} className="text-violet-500" />
                                <span className="font-bold text-white">{user?.followersCount || 0}</span> Seguidores
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5 hover:bg-zinc-800 hover:border-violet-500/30 transition-all cursor-default">
                                <UserPlus size={16} className="text-violet-500" />
                                <span className="font-bold text-white">{user?.followingCount || 0}</span> Seguindo
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5 hover:bg-zinc-800 hover:border-violet-500/30 transition-all cursor-default">
                                <MessageSquare size={16} className="text-violet-500" />
                                <span className="font-bold text-white">{user?.reviewsCount || 0}</span> Reviews
                            </div>

                            {user?.createdAt && (
                                <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5">
                                    <Calendar size={16} className="text-zinc-500" />
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