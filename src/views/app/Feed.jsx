import { useEffect, useRef } from "react";
import { Plus, PenLine, Film, UserPlus, TrendingUp, Star, Sparkles, Layers, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeedLogic } from "../../hooks/useFeedLogic";
import FeedTabs from "../../components/feed/FeedTabs";
import FeedCard from "../../components/feed/FeedCard";
import CreatePostModal from "../../components/feed/CreatePostModal";
import Modal from "../../components/ui/Modal";
import UserSearch from "../../components/UserSearch";
import LevelBadge from "../../components/ui/LevelBadge";

export default function Feed() {
  const { user, state, actions } = useFeedLogic();
  const observerTarget = useRef(null);
  const getSuggestionPhoto = (suggestedUser) =>
    suggestedUser?.photoURL ||
    suggestedUser?.userPhoto ||
    suggestedUser?.avatarURL ||
    suggestedUser?.avatarUrl ||
    suggestedUser?.photo ||
    suggestedUser?.user?.photoURL ||
    suggestedUser?.user?.userPhoto ||
    null;

  useEffect(() => {
    const target = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasMore && !state.loading && !state.loadingMore) {
          actions.loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [state.hasMore, state.loading, state.loadingMore, actions]);

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 min-h-screen animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-12">

        <div className="w-full min-w-0 lg:col-span-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-8 bg-violet-500 rounded-full"></span>
              Feed
            </h1>
            <FeedTabs activeTab={state.feedType} onChange={actions.setFeedType} />
          </div>

          {state.hasNewPosts && (
            <button
              onClick={actions.loadNewPosts}
              className="w-full mb-8 bg-violet-600/10 border border-violet-500/20 text-violet-400 py-3 px-4 rounded-2xl font-bold hover:bg-violet-600/20 transition-all text-xs flex items-center justify-center gap-2 tracking-widest uppercase shadow-lg shadow-violet-900/10"
            >
              <Sparkles size={14} />
              Novas postagens disponíveis
            </button>
          )}

          <button
            onClick={actions.handleOpenPostModal}
            className="lg:hidden w-full mb-8 bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-white/10 p-5 rounded-3xl flex items-center gap-4 text-zinc-500 hover:text-zinc-300 transition-all shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-500 shadow-inner">
              <PenLine size={20} />
            </div>
            <span className="text-base font-medium">O que você assistiu recentemente?</span>
          </button>

          {state.loading ? (
            <div className="flex items-center justify-center py-40">
              <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
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
                  <div ref={observerTarget} className="h-20 flex justify-center items-center">
                    {state.loadingMore && <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />}
                    {!state.hasMore && state.reviews.length > 5 && (
                      <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">Fim das postagens</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 px-8 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    {state.feedType === 'collections' ? <Layers size={32} className="text-zinc-600" /> : <Film size={32} className="text-zinc-600" />}
                  </div>
                  <h3 className="text-white font-black text-2xl mb-3 tracking-tight">
                    {state.feedType === 'collections' ? 'Nenhuma coleção' : 'Feed ainda vazio'}
                  </h3>
                  <p className="text-zinc-500 text-base max-w-sm leading-relaxed mb-10">
                    {state.feedType === 'mine'
                      ? 'Você ainda não compartilhou suas opiniões. Comece agora!'
                      : state.feedType === 'collections'
                      ? 'Siga entusiastas para ver as coleções selecionadas deles aqui.'
                      : 'Descubra novas perspectivas seguindo outros usuários ou faça sua primeira avaliação.'}
                  </p>
                  {state.feedType !== 'collections' && (
                    <button
                      onClick={actions.handleOpenPostModal}
                      className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2"
                    >
                      <Plus size={18} /> Publicar agora
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:flex lg:col-span-4 flex-col gap-8">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden ring-2 ring-white/5 shrink-0 shadow-2xl">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white/50">
                    {(user?.username?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-white text-lg truncate mb-1">@{user?.username || "Usuário"}</h2>
                <div className="flex gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <span><b className="text-zinc-300">{user.followersCount || 0}</b> seguidores</span>
                  <span><b className="text-zinc-300">{user.followingCount || 0}</b> seguindo</span>
                </div>
              </div>
            </div>
            <button
              onClick={actions.handleOpenPostModal}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95"
            >
              <Plus size={18} /> Nova avaliação
            </button>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative z-50">
            <UserSearch
              query={state.userSearch.query}
              results={state.userSearch.results}
              onSearch={actions.setUserSearchQuery}
              onFollow={actions.handleFollowUser}
            />
          </div>

          {state.suggestions?.users?.length > 0 && (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative z-10">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-4 bg-violet-500 rounded-full"></span>
                Sugestões
              </h3>
              <div className="divide-y divide-white/5">
                {state.suggestions.users.map(u => (
                  <div key={u.username} className="group/user py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <Link to={`/app/profile/${u.username}`} className="shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-zinc-800 overflow-hidden border border-white/5 shadow-lg transition-all group-hover/user:border-violet-500/30">
                            {getSuggestionPhoto(u) ? (
                              <img src={getSuggestionPhoto(u)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-600">
                                {(u.username?.[0] || "U").toUpperCase()}
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link to={`/app/profile/${u.username}`} className="min-w-0 truncate text-sm font-bold text-white transition-colors hover:text-violet-400">@{u.username}</Link>
                          </div>
                          {u.levelTitle && (
                            <div className="mt-2 flex max-w-full">
                              <div className="max-w-full overflow-hidden rounded-lg">
                                <LevelBadge title={u.levelTitle} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => actions.handleFollowUser(u.username)}
                        className="shrink-0 rounded-lg bg-violet-500/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-violet-400 transition-all hover:bg-violet-600 hover:text-white"
                      >
                        Seguir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.suggestions?.content?.length > 0 && (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative z-0">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-4 bg-violet-500 rounded-full"></span>
                Em alta
              </h3>
              <div className="space-y-5">
                {state.suggestions.content.map(item => (
                  <Link key={item.id} to={`/app/${item.media_type || 'movie'}/${item.id}`} className="flex gap-4 group/item items-center">
                    <div className="w-12 h-16 shrink-0 rounded-xl bg-zinc-800 overflow-hidden border border-white/5 shadow-lg relative">
                      <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" alt="" />
                      <div className="absolute inset-0 bg-black/20 group-hover/item:bg-transparent transition-colors"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-zinc-100 group-hover/item:text-violet-400 transition-colors line-clamp-2 leading-tight mb-1.5">{item.title || item.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                          <Star size={10} className="fill-yellow-500" />
                          <span className="text-[10px] font-black">{item.vote_average?.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
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
        <div className="space-y-6 p-2">
          <p className="text-zinc-400 text-sm leading-relaxed">Esta ação removerá permanentemente sua avaliação do feed. Tem certeza de que deseja continuar?</p>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={actions.closeDeleteModal} 
              className="px-6 py-3 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={actions.confirmDelete} 
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
