import { Camera, Image as ImageIcon, Settings, Edit3, Calendar, Users, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import LevelBadge from '../ui/LevelBadge';

export default function ProfileHeader({ user, onEditAvatar, onEditBackground, onShowFollowers, onShowFollowing }) {
  return (
    <div className="relative w-full group/header mb-12">
        
        <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden rounded-[2.5rem] shadow-2xl bg-black border border-white/5">
            {user?.backgroundURL ? (
                <img 
                    key={user.backgroundURL}
                    src={user.backgroundURL} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/header:scale-105 opacity-90" 
                />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-zinc-950 to-black" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            
            <div className="absolute top-6 right-6 opacity-0 group-hover/header:opacity-100 transition-all duration-500 transform translate-y-[-10px] group-hover/header:translate-y-0">
                <button 
                    onClick={onEditBackground}
                    className="flex items-center gap-2 bg-black/50 hover:bg-black/80 backdrop-blur-xl text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 shadow-lg hover:border-white/20 active:scale-95"
                >
                    <ImageIcon size={16} />
                    <span>Alterar Capa</span>
                </button>
            </div>
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
                            
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-sm rounded-full">
                                <button onClick={onEditAvatar} className="text-white flex flex-col items-center gap-2 transform scale-90 group-hover/avatar:scale-100 transition-transform">
                                    <div className="p-3 bg-white/10 rounded-full">
                                        <Camera size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Alterar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {user?.levelTitle && (
                        <div className="absolute -bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap drop-shadow-xl">
                            <LevelBadge title={user.levelTitle} size="md" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left pb-2 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl capitalize">
                                {user?.name}
                            </h1>
                            <p className="text-violet-400 font-bold text-lg md:text-xl tracking-tight mt-1">@{user?.username}</p>
                        </div>

                        <Link 
                            to="/app/settings"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 whitespace-nowrap"
                        >
                            <Settings size={18} />
                            <span>Editar Perfil</span>
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-col gap-6">
                        {user?.bio ? (
                            <div className="flex items-start gap-3 justify-center md:justify-start">
                                <span className="w-1.5 h-5 bg-violet-500 rounded-full mt-1 shrink-0 hidden md:block"></span>
                                <p className="text-base leading-relaxed max-w-2xl font-medium text-zinc-300 text-justify md:text-left drop-shadow-sm">
                                    {user.bio}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center md:justify-start gap-3 text-zinc-500 font-bold text-xs uppercase tracking-widest bg-white/[0.02] px-5 py-3 rounded-2xl border border-white/5 w-fit shadow-inner mx-auto md:mx-0">
                                <Edit3 size={16} className="text-zinc-600" />
                                <span>Adicione uma biografia</span>
                            </div>
                        )}
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button 
                                onClick={onShowFollowers}
                                className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 hover:bg-white/5 hover:border-violet-500/30 transition-all cursor-pointer shadow-inner text-zinc-400 group"
                            >
                                <Users size={16} className="text-violet-500 group-hover:text-violet-400 transition-colors" />
                                <span><strong className="text-white text-sm group-hover:text-violet-100">{user?.followersCount || 0}</strong> Seg.</span>
                            </button>

                            <button 
                                onClick={onShowFollowing}
                                className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 hover:bg-white/5 hover:border-violet-500/30 transition-all cursor-pointer shadow-inner text-zinc-400 group"
                            >
                                <UserPlus size={16} className="text-violet-500 group-hover:text-violet-400 transition-colors" />
                                <span><strong className="text-white text-sm group-hover:text-violet-100">{user?.followingCount || 0}</strong> Seg.</span>
                            </button>

                            {user?.createdAt && (
                                <div className="hidden md:flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 text-zinc-500 shadow-inner">
                                    <Calendar size={14} />
                                    <span>Desde {user.createdAt._seconds ? new Date(user.createdAt._seconds * 1000).getFullYear() : new Date(user.createdAt).getFullYear()}</span>
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
