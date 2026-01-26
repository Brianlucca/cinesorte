import { Camera, Image as ImageIcon, Settings, Edit3, Calendar, Users, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileHeader({ user, onEditAvatar, onEditBackground, onShowFollowers, onShowFollowing }) {
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
            
            <div className="absolute top-6 right-6 opacity-0 group-hover/header:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover/header:translate-y-0">
                <button 
                    onClick={onEditBackground}
                    className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium transition-colors border border-white/10"
                >
                    <ImageIcon size={18} />
                    <span>Alterar Capa</span>
                </button>
            </div>
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
                            
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                <button onClick={onEditAvatar} className="text-white flex flex-col items-center gap-1 transform scale-90 group-hover/avatar:scale-100 transition-transform">
                                    <Camera size={32} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Alterar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left pb-2 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                                {user?.name}
                            </h1>
                            <p className="text-violet-400 font-medium text-lg md:text-xl mt-1">@{user?.username}</p>
                        </div>

                        <Link 
                            to="/app/settings"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-full font-bold transition-all shadow-lg hover:shadow-white/20 active:scale-95 whitespace-nowrap"
                        >
                            <Settings size={20} />
                            <span>Editar Perfil</span>
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-col gap-6">
                        {user?.bio ? (
                            <p className="text-base leading-relaxed max-w-2xl font-light text-zinc-300 border-l-2 border-violet-500/50 pl-4 text-justify md:text-left">
                                {user.bio}
                            </p>
                        ) : (
                            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 italic text-sm bg-zinc-900/50 px-4 py-2 rounded-lg border border-white/5 w-fit">
                                <Edit3 size={14} />
                                <span>Adicione uma biografia nas configurações.</span>
                            </div>
                        )}
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400">
                            <button 
                                onClick={onShowFollowers}
                                className="flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5 hover:bg-zinc-800 hover:border-violet-500/30 transition-all cursor-pointer"
                            >
                                <Users size={16} className="text-violet-500" />
                                <span className="font-bold text-white">{user?.followersCount || 0}</span> Seguidores
                            </button>

                            <button 
                                onClick={onShowFollowing}
                                className="flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5 hover:bg-zinc-800 hover:border-violet-500/30 transition-all cursor-pointer"
                            >
                                <UserPlus size={16} className="text-violet-500" />
                                <span className="font-bold text-white">{user?.followingCount || 0}</span> Seguindo
                            </button>

                            {user?.createdAt && (
                                <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-zinc-900/80 px-5 py-2.5 rounded-full border border-white/5">
                                    <Calendar size={16} className="text-zinc-500" />
                                    <span>Desde {new Date(user.createdAt._seconds * 1000).getFullYear()}</span>
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