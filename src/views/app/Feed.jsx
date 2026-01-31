import { useEffect, useRef } from "react";
import { Plus, PenLine, Film, UserPlus, TrendingUp, Star, Sparkles, Layers, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeedLogic } from "../../hooks/useFeedLogic";
import FeedTabs from "../../components/feed/FeedTabs";
import FeedCard from "../../components/feed/FeedCard";
import CreatePostModal from "../../components/feed/CreatePostModal";
import Modal from "../../components/ui/Modal";
import UserSearch from "../../components/UserSearch";

export default function Feed() {
  const { user, state, actions } = useFeedLogic();
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasMore && !state.loading && !state.loadingMore) {
          actions.loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [state.hasMore, state.loading, state.loadingMore, actions]);

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 min-h-screen">
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start pt-8">
        
        <div className="w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                 <h1 className="text-4xl font-black text-white tracking-tighter">Feed</h1>
                 <div className="w-full sm:w-auto">
                    <FeedTabs activeTab={state.feedType} onChange={actions.setFeedType} />
                 </div>
            </div>

            <button
                onClick={actions.handleOpenPostModal}
                className="lg:hidden w-full bg-zinc-900 p-4 rounded-xl border border-white/10 flex items-center gap-3 text-zinc-400 mb-6 hover:bg-zinc-800 transition-colors"
            >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-violet-500">
                    <PenLine size={20} />
                </div>
                <span className="font-medium">Escrever uma avaliação...</span>
            </button>

            {state.loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-8">
                {state.reviews.length > 0 ? (
                    <>
                        {state.reviews.map((review) => (
                            <FeedCard
                                key={review.uniqueKey || `${review.id}-${Math.random()}`}
                                item={review}
                                currentUser={user}
                                onDelete={actions.promptDelete}
                                onLike={actions.handleLike}
                                onLoadComments={actions.handleLoadComments}
                            />
                        ))}
                        
                        <div ref={observerTarget} className="flex justify-center py-8">
                            {state.loadingMore && <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />}
                            {!state.hasMore && state.reviews.length > 5 && (
                                <p className="text-zinc-500 text-sm">Isso é tudo por enquanto.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                            {state.feedType === 'collections' ? <Layers size={48} className="text-zinc-700" /> : <Film size={48} className="text-zinc-700" />}
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-2">
                            {state.feedType === 'collections' ? 'Nenhuma coleção encontrada' : 'Seu feed está vazio'}
                        </h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
                            {state.feedType === 'mine' 
                                ? 'Você ainda não compartilhou nada.' 
                                : state.feedType === 'collections'
                                ? 'Siga usuários para ver suas coleções compartilhadas aqui ou crie a sua.'
                                : 'Siga outros usuários ou seja o primeiro a postar algo incrível!'}
                        </p>
                        {state.feedType !== 'collections' && (
                            <button
                                onClick={actions.handleOpenPostModal}
                                className="bg-violet-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-violet-500 transition-all shadow-lg hover:shadow-violet-600/20 active:scale-95"
                            >
                                Começar agora
                            </button>
                        )}
                    </div>
                )}
                </div>
            )}
        </div>

        <div className="hidden lg:flex flex-col gap-6">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 p-0.5">
                        {user?.photoURL ? (
                            <img src={user.photoURL} className="w-full h-full object-cover rounded-full" alt="Profile" />
                        ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-2xl text-white bg-zinc-800">
                                {(user?.username?.[0] || user?.name?.[0] || "U").toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <h2 className="font-bold text-white text-lg truncate">{user?.username || user?.name || "Usuário"}</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 mt-1">
                            <span><b className="text-white text-xs">{user.followersCount || 0}</b> Seguidores</span>
                            <span><b className="text-white text-xs">{user.followingCount || 0}</b> Seguindo</span>
                        </div>
                    </div>
                 </div>
                 
                 <button
                    onClick={actions.handleOpenPostModal}
                    className="w-full py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={20} /> Nova Avaliação
                </button>
            </div>

            <UserSearch 
                query={state.userSearch.query}
                results={state.userSearch.results}
                onSearch={actions.setUserSearchQuery}
                onFollow={actions.handleFollowUser}
            />

            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <UserPlus size={14} /> Sugestões Compatíveis
                </h3>
                <div className="space-y-5">
                    {state.suggestions?.users?.map(u => (
                        <div key={u.username || u.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <Link to={`/app/profile/${u.username}`} className="shrink-0 relative group">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative ring-2 ring-transparent group-hover:ring-violet-500 transition-all">
                                        {u.photoURL ? (
                                            <img src={u.photoURL} className="w-full h-full object-cover" alt={u.username} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs bg-violet-600">
                                                {(u.username?.[0] || u.name?.[0] || "U").toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex flex-col min-w-0">
                                    <Link to={`/app/profile/${u.username}`} className="text-sm font-bold text-white truncate hover:text-violet-400 transition-colors">
                                        {u.name || u.username}
                                    </Link>
                                    <span className="text-[10px] text-zinc-500 truncate">
                                        @{u.username || "user"}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => actions.handleFollowUser(u.username)} 
                                className="text-[10px] font-bold text-violet-400 hover:text-white transition-colors bg-violet-500/10 hover:bg-violet-500 px-3 py-1.5 rounded-lg shrink-0"
                            >
                                Seguir
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Recomendado para Você
                </h3>
                <div className="space-y-4">
                    {state.suggestions?.content?.map(item => (
                        <Link key={item.id} to={`/app/${item.media_type || 'movie'}/${item.id}`} className="flex gap-4 group items-center">
                             <div className="w-12 h-16 shrink-0 rounded bg-zinc-800 overflow-hidden relative">
                                <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Poster" />
                             </div>
                             <div className="flex flex-col justify-center min-w-0">
                                 <h4 className="text-sm font-bold text-white leading-tight group-hover:text-violet-400 transition-colors line-clamp-2">{item.title || item.name}</h4>
                                 <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                                     <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                     <span className="font-medium text-zinc-300">{item.vote_average?.toFixed(1)}</span>
                                 </div>
                             </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>

      </div>

      <CreatePostModal
        isOpen={state.isPostModalOpen}
        onClose={actions.handleClosePostModal}
        form={state.postForm}
        actions={actions}
      />

      <Modal
        isOpen={state.deleteModal.isOpen}
        onClose={actions.closeDeleteModal}
        title="Excluir Avaliação"
        type="danger"
      >
        <div className="space-y-4">
            <p className="text-zinc-300">Você tem certeza que deseja excluir esta publicação? Essa ação é irreversível.</p>
            <div className="flex justify-end gap-3 pt-2">
                <button onClick={actions.closeDeleteModal} className="px-4 py-2 text-zinc-400 hover:text-white font-medium">Cancelar</button>
                <button onClick={actions.confirmDelete} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg">Sim, excluir</button>
            </div>
        </div>
      </Modal>
    </div>
  );
}