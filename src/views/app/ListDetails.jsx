import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getListDetails, cloneList } from "../../services/api";
import { Share2, Copy, Layers, User, Calendar, Film } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import MediaCard from "../../components/ui/MediaCard";

export default function ListDetails() {
  const { username, listId } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    async function load() {
      if (!username || !listId) return;
      try {
        const data = await getListDetails(username, listId);
        setList(data);
      } catch (error) {
        toast.error("Erro", "Não foi possível carregar a lista.");
        navigate("/app/feed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username, listId, navigate]);

  const handleClone = async () => {
    if (!user) return toast.error("Login necessário", "Entre para salvar a lista.");
    if (user.username === username) return toast.error("Ops", "Você já é o dono desta lista.");
    
    setCloning(true);
    try {
        await cloneList({
            originalListId: list.id,
            ownerUsername: list.owner?.username
        });
        toast.success("Sucesso", "Lista adicionada à sua coleção!");
        navigate("/app/lists");
    } catch (e) {
        toast.error("Erro", e.response?.data?.message || "Falha ao clonar lista.");
    } finally {
        setCloning(false);
    }
  };

  const backdrops = list?.items
    ?.filter(item => item.backdrop_path)
    .slice(0, 4)
    .map(item => `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`) || [];

  const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-6 animate-in fade-in duration-700">
        <div className="w-14 h-14 border-4 border-violet-600/20 border-t-violet-500 rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Carregando coleção...</p>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 animate-in fade-in duration-700">
        <div className="relative min-h-[50vh] w-full overflow-hidden flex items-end">
            <div className="absolute inset-0 bg-black" />
            
            {backdrops.length > 0 && (
                <div className={`w-full h-full absolute inset-0 opacity-50 blur-2xl scale-110 saturate-150 grid ${backdrops.length === 1 ? 'grid-cols-1' : 'grid-cols-2 grid-rows-2'}`}>
                    {backdrops.map((img, i) => (
                        <div key={i} className="relative w-full h-full overflow-hidden">
                            <img src={img} className="w-full h-full object-cover transform scale-125" alt="" />
                        </div>
                    ))}
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            
            <div className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 pb-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-8 mt-32">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="bg-violet-600/20 border border-violet-500/30 text-violet-400 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-md">
                            <Layers size={14} /> Coleção
                        </span>

                        {list.clonedFrom && (
                            <span className="bg-black/40 border border-white/5 text-zinc-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                                <Copy size={14} /> Cópia
                            </span>
                        )}

                        {list.updatedAt && (
                            <span className="bg-white/5 border border-white/5 text-zinc-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                                <Calendar size={14} /> Atualizada em {formatDate(list.updatedAt)}
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl mb-6 break-words tracking-tighter">
                        {list.name}
                    </h1>
                    
                    {list.description && (
                        <p className="text-sm md:text-base text-zinc-300 max-w-3xl font-medium drop-shadow-lg leading-relaxed whitespace-pre-wrap mb-8">
                            {list.description}
                        </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <Link to={`/app/profile/${list.clonedFrom ? list.clonedFrom.owner : list.owner?.username}`} className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] px-5 py-3 rounded-2xl backdrop-blur-md border border-white/5 transition-all group shadow-inner">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-white/10 shadow-lg">
                                {!list.clonedFrom && list.owner?.photoURL ? (
                                    <img src={list.owner.photoURL} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
                                        {(list.clonedFrom ? list.clonedFrom.owner?.[0] : list.owner?.username?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">
                                    {list.clonedFrom ? 'Criador Original' : 'Criado por'}
                                </p>
                                <p className="text-sm text-white font-bold group-hover:text-violet-400 transition-colors">@{list.clonedFrom ? list.clonedFrom.owner : (list.owner?.username || 'Usuário')}</p>
                            </div>
                        </Link>

                        {list.clonedFrom && (
                            <div className="flex items-center gap-4 bg-white/[0.01] px-5 py-3 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner cursor-default">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900/50 overflow-hidden border border-white/5 shadow-lg flex items-center justify-center text-zinc-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">
                                        Copiado por
                                    </p>
                                    <p className="text-sm text-zinc-300 font-bold">@{list.owner?.username || username}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 shrink-0 w-full md:w-auto mt-6 md:mt-0">
                    {user?.username !== username && (
                        <button 
                            onClick={handleClone}
                            disabled={cloning}
                            className="flex-1 md:flex-none bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Copy size={18} /> {cloning ? 'Salvando...' : 'Salvar Coleção'}
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <h2 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
                    Itens 
                    <span className="text-violet-400 bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20">
                        {list.items?.length || 0}
                    </span>
                </h2>
            </div>

            {list.items && list.items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {list.items.map((item) => (
                        <Link key={item.id} to={`/app/${item.media_type || 'movie'}/${item.id}`} className="group block h-full transition-transform duration-500 hover:-translate-y-2">
                            <MediaCard media={item} />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01] animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-white/5">
                        <Film size={32} className="text-zinc-600" />
                    </div>
                    <p className="text-white font-black text-xl mb-2 tracking-tight">Coleção Vazia</p>
                    <p className="text-zinc-500 font-medium text-sm">Ainda não há filmes ou séries nesta lista.</p>
                </div>
            )}
        </div>
    </div>
  );
}
