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
      { threshold: 0.1, rootMargin: '100px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [state.hasMore, state.loading, state.loadingMore]);

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 pt-8">

        <div className="w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-black text-white tracking-tighter">Feed</h1>
            <FeedTabs activeTab={state.feedType} onChange={actions.setFeedType} />
          </div>

          {state.hasNewPosts && (
            <button
              onClick={actions.loadNewPosts}
              className="w-full mb-5 bg-violet-600/10 border border-violet-500/30 text-violet-400 py-2.5 px-4 rounded-xl font-bold hover:bg-violet-600/20 transition-all text-xs flex items-center justify-center gap-2 tracking-wider uppercase"
            >
              <Sparkles size={12} />
              Novas postagens disponíveis
            </button>
          )}

          <button
            onClick={actions.handleOpenPostModal}
            className="lg:hidden w-full mb-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-3.5 rounded-xl flex items-center gap-3 text-zinc-500 hover:text-zinc-300 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-500">
              <PenLine size={16} />
            </div>
            <span className="text-sm font-medium">O que você assistiu?</span>
          </button>

          {state.loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
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
                  <div ref={observerTarget} className="h-16 flex justify-center items-center">
                    {state.loadingMore && <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />}
                    {!state.hasMore && state.reviews.length > 5 && (
                      <p className="text-zinc-700 text-xs font-medium">Você chegou ao fim.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 px-6 text-center border border-dashed border-zinc-800 rounded-2xl">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-5">
                    {state.feedType === 'collections' ? <Layers size={28} className="text-zinc-700" /> : <Film size={28} className="text-zinc-700" />}
                  </div>
                  <h3 className="text-white font-black text-xl mb-2 tracking-tight">
                    {state.feedType === 'collections' ? 'Nenhuma coleção' : 'Feed vazio'}
                  </h3>
                  <p className="text-zinc-600 text-sm max-w-xs leading-relaxed mb-6">
                    {state.feedType === 'mine'
                      ? 'Você ainda não postou nada.'
                      : state.feedType === 'collections'
                      ? 'Siga usuários para ver suas coleções aqui.'
                      : 'Siga outros usuários ou publique sua primeira avaliação!'}
                  </p>
                  {state.feedType !== 'collections' && (
                    <button
                      onClick={actions.handleOpenPostModal}
                      className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-violet-600/20 active:scale-95"
                    >
                      Publicar agora
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-col gap-5">
          <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden ring-1 ring-white/10 shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-lg text-white">
                    {(user?.username?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-white text-base truncate">{user?.username || "Usuário"}</h2>
                <div className="flex gap-4 text-[11px] text-zinc-600 mt-0.5">
                  <span><b className="text-zinc-300 font-bold">{user.followersCount || 0}</b> seguidores</span>
                  <span><b className="text-zinc-300 font-bold">{user.followingCount || 0}</b> seguindo</span>
                </div>
              </div>
            </div>
            <button
              onClick={actions.handleOpenPostModal}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20 active:scale-95"
            >
              <Plus size={16} /> Nova avaliação
            </button>
          </div>

          <UserSearch
            query={state.userSearch.query}
            results={state.userSearch.results}
            onSearch={actions.setUserSearchQuery}
            onFollow={actions.handleFollowUser}
          />

          {state.suggestions?.users?.length > 0 && (
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80">
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserPlus size={12} /> Sugestões
              </h3>
              <div className="space-y-4">
                {state.suggestions.users.map(u => (
                  <div key={u.username} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Link to={`/app/profile/${u.username}`} className="shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 overflow-hidden ring-1 ring-white/5">
                          {u.photoURL ? (
                            <img src={u.photoURL} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-500">
                              {(u.username?.[0] || "U").toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="min-w-0">
                        <Link to={`/app/profile/${u.username}`} className="text-sm font-bold text-white hover:text-violet-400 transition-colors truncate block">{u.username}</Link>
                        {u.levelTitle && <span className="text-[10px] text-zinc-600 truncate block">{u.levelTitle}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => actions.handleFollowUser(u.username)}
                      className="text-[11px] font-bold text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-600 px-3 py-1.5 rounded-lg transition-all shrink-0"
                    >
                      Seguir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.suggestions?.content?.length > 0 && (
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/80">
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={12} /> Em alta
              </h3>
              <div className="space-y-3">
                {state.suggestions.content.map(item => (
                  <Link key={item.id} to={`/app/${item.media_type || 'movie'}/${item.id}`} className="flex gap-3 group items-center">
                    <div className="w-10 h-14 shrink-0 rounded-lg bg-zinc-800 overflow-hidden">
                      <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2 leading-tight">{item.title || item.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold text-zinc-400">{item.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
        title="Excluir publicação"
        type="danger"
      >
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">Tem certeza? Esta ação é irreversível.</p>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={actions.closeDeleteModal} className="px-4 py-2 text-zinc-500 hover:text-white font-medium text-sm transition-colors">Cancelar</button>
            <button onClick={actions.confirmDelete} className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}