import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Film,
  Flame,
  Layers,
  Loader2,
  MessageCircle,
  PenLine,
  Plus,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFeedLogic } from "@features/feed/hooks/useFeedLogic";
import FeedTabs from "@features/feed/components/FeedTabs";
import FeedCard from "@features/feed/components/FeedCard";
import CreatePostModal from "@features/feed/components/CreatePostModal";
import Modal from "@shared/components/ui/Modal";
import UserSearch from "@shared/components/UserSearch";
import LevelBadge from "@shared/components/ui/LevelBadge";

const getSuggestionPhoto = (suggestedUser) =>
  suggestedUser?.photoURL ||
  suggestedUser?.userPhoto ||
  suggestedUser?.avatarURL ||
  suggestedUser?.avatarUrl ||
  suggestedUser?.photo ||
  suggestedUser?.user?.photoURL ||
  suggestedUser?.user?.userPhoto ||
  null;

const mediaRoute = (item) => `/app/${item.media_type || "movie"}/${item.id}`;

export default function Feed() {
  const { user, state, actions } = useFeedLogic();
  const observerTarget = useRef(null);
  const featuredContent = state.suggestions?.content?.[0];
  const remainingContent = state.suggestions?.content?.slice(1, 4) || [];
  const activeDiscussions = [...state.reviews]
    .filter((item) => item.type !== "list_share" && item.mediaTitle)
    .sort((a, b) =>
      (Number(b.commentsCount || 0) + Number(b.likesCount || 0)) -
      (Number(a.commentsCount || 0) + Number(a.likesCount || 0)),
    )
    .slice(0, 3);

  useEffect(() => {
    const target = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasMore && !state.loading && !state.loadingMore) {
          actions.loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );

    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [state.hasMore, state.loading, state.loadingMore, actions]);

  return (
    <div className="min-h-screen bg-[#111216] pb-24 text-white">
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-7 sm:px-7 md:pt-10 xl:px-10">
        <header className="border-b border-white/[0.06] pb-6 md:pb-8">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Comunidade CineSorte
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-zinc-100 sm:text-4xl">Feed Social</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Reviews, coleções e descobertas das pessoas que fazem parte do seu universo cinéfilo.
              </p>
            </div>

            <FeedTabs activeTab={state.feedType} onChange={actions.setFeedType} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <Users size={14} className="text-violet-400" />
              <strong className="text-zinc-200">{user?.followingCount || 0}</strong> seguindo
            </span>
            <span className="inline-flex items-center gap-2">
              <UserPlus size={14} className="text-violet-400" />
              <strong className="text-zinc-200">{user?.followersCount || 0}</strong> seguidores
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={14} className="text-violet-400" />
              <strong className="text-zinc-200">{state.reviews.length}</strong> publicações carregadas
            </span>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,760px)_300px] xl:justify-between xl:gap-12">
          <section className="min-w-0">
            {state.hasNewPosts && (
              <button
                onClick={actions.loadNewPosts}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300 transition-colors hover:bg-violet-500/15"
              >
                <Sparkles size={14} />
                Há novas publicações — atualizar feed
              </button>
            )}

            <button
              onClick={actions.handleOpenPostModal}
              className="group mb-6 flex w-full items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.03]"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-zinc-800">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="h-full w-full object-cover" alt="" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm font-black text-zinc-500">
                    {(user?.username?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-zinc-300 sm:text-base">O que você assistiu recentemente?</span>
                <span className="mt-1 hidden text-xs text-zinc-600 sm:block">Compartilhe uma avaliação com a comunidade</span>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-zinc-950">
                <PenLine size={17} />
              </span>
            </button>

            {state.loading ? (
              <div className="grid min-h-[420px] place-items-center">
                <div className="flex flex-col items-center gap-4 text-zinc-600">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Montando seu feed</span>
                </div>
              </div>
            ) : state.reviews.length > 0 ? (
              <div className="space-y-4">
                {state.reviews.map((review) => (
                  <FeedCard
                    key={review.uniqueKey || `${review.type}-${review.id}`}
                    item={review}
                    onDelete={actions.promptDelete}
                    onLike={actions.handleLike}
                    onLoadComments={actions.handleLoadComments}
                  />
                ))}

                <div ref={observerTarget} className="flex h-24 items-center justify-center">
                  {state.loadingMore && <Loader2 className="h-7 w-7 animate-spin text-violet-500" />}
                  {!state.hasMore && state.reviews.length > 5 && (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      <span className="h-px w-8 bg-white/10" />
                      Você chegou ao fim
                      <span className="h-px w-8 bg-white/10" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
                <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-700/10 blur-[80px]" />
                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-500">
                  {state.feedType === "collections" ? <Layers size={27} /> : <Film size={27} />}
                </div>
                <h2 className="relative mt-6 text-2xl font-black tracking-tight">
                  {state.feedType === "collections" ? "Nenhuma coleção por aqui" : "Seu feed está esperando a primeira cena"}
                </h2>
                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                  {state.feedType === "mine"
                    ? "Você ainda não publicou avaliações. Conte para a comunidade o que assistiu por último."
                    : state.feedType === "collections"
                      ? "Siga outros exploradores para acompanhar as coleções que eles compartilham."
                      : "Siga pessoas, explore novos perfis ou publique sua primeira avaliação para movimentar este espaço."}
                </p>
                {state.feedType !== "collections" && (
                  <button
                    onClick={actions.handleOpenPostModal}
                    className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-black text-zinc-950 transition-colors hover:bg-violet-100"
                  >
                    <Plus size={16} /> Publicar avaliação
                  </button>
                )}
              </div>
            )}
          </section>

          <aside className="sidebar-scrollbar space-y-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Encontrar pessoas</span>
                <Users size={16} className="text-violet-400" />
              </div>
              <UserSearch />
            </div>

            {featuredContent && (
              <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20]">
                <div className="flex items-center justify-between px-5 pb-4 pt-5">
                  <div className="flex items-center gap-2">
                    <Flame size={15} className="fill-orange-400 text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Em alta agora</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Esta semana</span>
                </div>

                <Link to={mediaRoute(featuredContent)} className="group block px-3 pb-3">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-zinc-900">
                    {featuredContent.backdrop_path || featuredContent.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w780${featuredContent.backdrop_path || featuredContent.poster_path}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt=""
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-yellow-400/15 px-2 py-1 text-[9px] font-black text-yellow-300 backdrop-blur-md">
                          <Star size={9} className="mr-1 inline fill-current" />
                          {Number(featuredContent.vote_average || 0).toFixed(1)}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-300">
                          {featuredContent.media_type === "tv" ? "Série" : "Filme"}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-lg font-black leading-tight">{featuredContent.title || featuredContent.name}</h3>
                    </div>
                  </div>
                </Link>

                {remainingContent.length > 0 && (
                  <div className="border-t border-white/[0.06] px-5 py-2">
                    {remainingContent.map((item, index) => (
                      <Link
                        key={`${item.media_type}-${item.id}`}
                        to={mediaRoute(item)}
                        className="group flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0"
                      >
                        <span className="text-[10px] font-black text-zinc-700">0{index + 2}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-bold text-zinc-300 transition-colors group-hover:text-violet-300">{item.title || item.name}</h4>
                          <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                            {item.media_type === "tv" ? "Série" : "Filme"} · {Number(item.vote_average || 0).toFixed(1)}
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-zinc-700 transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeDiscussions.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Em discussão</span>
                    <h3 className="mt-1 text-base font-black">Conversas do momento</h3>
                  </div>
                  <MessageCircle size={17} className="text-violet-400" />
                </div>
                <div className="space-y-2">
                  {activeDiscussions.map((discussion) => (
                    <Link
                      key={`discussion-${discussion.id}`}
                      to={`/app/${discussion.mediaType || "movie"}/${String(discussion.mediaId || "").replace(/^(movie-|tv-)/, "")}`}
                      className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-zinc-900">
                        {discussion.posterPath ? (
                          <img src={`https://image.tmdb.org/t/p/w154${discussion.posterPath}`} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <Film size={15} className="m-auto h-full text-zinc-700" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-xs font-bold leading-4 text-zinc-300 transition-colors group-hover:text-violet-300">{discussion.mediaTitle}</h4>
                        <div className="mt-1.5 flex items-center gap-3 text-[9px] font-bold text-zinc-600">
                          <span>{discussion.commentsCount || 0} comentários</span>
                          <span>{discussion.likesCount || 0} curtidas</span>
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-zinc-700 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {state.suggestions?.users?.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Novos círculos</span>
                    <h3 className="mt-1 text-base font-black">Quem vale acompanhar</h3>
                  </div>
                  <UserPlus size={17} className="text-violet-400" />
                </div>

                <div className="mt-4 divide-y divide-white/[0.06]">
                  {state.suggestions.users.slice(0, 4).map((suggestedUser) => (
                    <div key={suggestedUser.username} className="flex items-center gap-3 py-3.5 first:pt-2">
                      <Link to={`/app/profile/${suggestedUser.username}`} className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-800">
                        {getSuggestionPhoto(suggestedUser) ? (
                          <img src={getSuggestionPhoto(suggestedUser)} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs font-black text-zinc-500">
                            {(suggestedUser.username?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={`/app/profile/${suggestedUser.username}`} className="block truncate text-xs font-black text-zinc-200 hover:text-violet-300">
                          @{suggestedUser.username}
                        </Link>
                        {suggestedUser.levelTitle ? (
                          <div className="mt-1.5 origin-left scale-[0.78]">
                            <LevelBadge title={suggestedUser.levelTitle} />
                          </div>
                        ) : (
                          <span className="mt-1 block text-[9px] uppercase tracking-wider text-zinc-600">Explorador CineSorte</span>
                        )}
                      </div>
                      <button
                        onClick={() => actions.handleFollowUser(suggestedUser.username)}
                        className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-violet-300 transition-colors hover:bg-violet-500 hover:text-white"
                      >
                        Seguir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <CreatePostModal
        isOpen={state.isPostModalOpen}
        onClose={actions.handleClosePostModal}
        form={state.postForm}
        actions={actions}
        user={user}
      />

      <Modal
        isOpen={state.deleteModal.isOpen}
        onClose={actions.closeDeleteModal}
        title="Excluir publicação"
        type="danger"
      >
        <div className="space-y-6 p-2">
          <p className="text-sm leading-relaxed text-zinc-400">
            Esta ação removerá permanentemente sua avaliação do feed. Tem certeza de que deseja continuar?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={actions.closeDeleteModal} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button onClick={actions.confirmDelete} className="rounded-full bg-red-600 px-6 py-3 text-xs font-black text-white transition-colors hover:bg-red-500">
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
