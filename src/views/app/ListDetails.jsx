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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!list) return null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
        <div className="relative min-h-[40vh] w-full overflow-hidden flex items-end">
            <div className="absolute inset-0 bg-zinc-900" />
            {backdrops.length > 0 && (
                <div className={`w-full h-full absolute inset-0 opacity-60 blur-3xl scale-125 saturate-150 grid ${backdrops.length === 1 ? 'grid-cols-1' : 'grid-cols-2 grid-rows-2'}`}>
                    {backdrops.map((img, i) => (
                        <div key={i} className="relative w-full h-full overflow-hidden">
                            <img src={img} className="w-full h-full object-cover transform scale-150" alt="" />
                        </div>
                    ))}
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/40" />
            

            <div className="relative w-full p-6 md:p-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-violet-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Layers size={14} /> Coleção
                        </span>
                        {list.updatedAt && (
                            <span className="text-zinc-400 text-sm font-medium flex items-center gap-1">
                                <Calendar size={14} /> Atualizada em {formatDate(list.updatedAt)}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl mb-4 break-words">
                        {list.name}
                    </h1>
                    {list.description && (
                        <p className="text-lg text-zinc-200 max-w-3xl font-medium drop-shadow-md leading-relaxed whitespace-pre-wrap">
                            {list.description}
                        </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-6">
                        <Link to={`/app/profile/${list.owner?.username}`} className="flex items-center gap-3 bg-black/40 hover:bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/20">
                                {list.owner?.photoURL ? (
                                    <img src={list.owner.photoURL} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white"><User size={20} /></div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400 uppercase font-bold">Criado por</p>
                                <p className="text-white font-bold group-hover:text-violet-400 transition-colors">@{list.owner?.username || 'Usuario'}</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="flex gap-3 shrink-0">
                    {user?.username !== username && (
                        <button 
                            onClick={handleClone}
                            disabled={cloning}
                            className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Copy size={18} /> {cloning ? 'Salvando...' : 'Salvar Coleção'}
                        </button>
                    )}
                    <button className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-md border border-white/10 transition-all">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    Itens <span className="text-zinc-500 text-lg font-normal">({list.items?.length || 0})</span>
                </h2>
            </div>

            {list.items && list.items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {list.items.map((item) => (
                        <Link key={item.id} to={`/app/${item.media_type || 'movie'}/${item.id}`} className="group block h-full">
                            <MediaCard media={item} />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-zinc-900/30">
                    <Film size={48} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500 font-medium">Esta coleção está vazia.</p>
                </div>
            )}
        </div>
    </div>
  );
}