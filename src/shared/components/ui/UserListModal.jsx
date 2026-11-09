import { Compass, Loader2, UserPlus, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import LevelBadge from '@shared/components/ui/LevelBadge';

export default function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  total,
  loading,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}) {
  if (!isOpen) return null;

  const safeUsers = Array.isArray(users) ? users : [];
  const isFollowingList = title?.toLowerCase() === 'seguindo';
  const EmptyIcon = isFollowingList ? UserPlus : Users;
  const displayCount = Number.isFinite(Number(total)) ? Number(total) : safeUsers.length;
  const emptyTitle = isFollowingList ? 'Explore novos cinéfilos' : 'Sua comunidade começa agora';
  const emptyText = isFollowingList
    ? 'Siga pessoas para acompanhar as reviews delas no seu feed.'
    : 'Quando alguém seguir você, o perfil aparece aqui.';

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/[0.84] p-3 backdrop-blur-xl animate-in fade-in duration-200 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-list-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fechar lista" onClick={onClose} />

      <div className="relative z-10 flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.012] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              {displayCount} {displayCount === 1 ? 'perfil' : 'perfis'}
            </p>
            <h2 id="user-list-title" className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="content-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="grid min-h-[260px] place-items-center text-violet-200 animate-in fade-in duration-300">
              <Loader2 size={30} className="animate-spin" />
            </div>
          ) : safeUsers.length === 0 ? (
            <div className="grid min-h-[260px] place-items-center text-center animate-in zoom-in-95 duration-300">
              <div>
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-500">
                  <EmptyIcon size={24} />
                </div>
                <p className="text-sm font-semibold text-zinc-300">{emptyTitle}</p>
                <p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-zinc-500">{emptyText}</p>
                <Link
                  to="/app/feed"
                  onClick={onClose}
                  className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                >
                  <Compass size={14} /> Explorar comunidade
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5 animate-in fade-in duration-500">
              {safeUsers.map((u) => {
                const displayName = u.name || u.displayName || u.username || 'Usuário';
                const username = u.username || '';
                const avatar = u.photoURL || u.userPhoto;

                return (
                  <Link
                    key={u.id || username}
                    to={`/app/profile/${username}`}
                    onClick={onClose}
                    className="group grid min-h-[68px] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                  >
                    <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900 text-violet-300 transition-colors group-hover:border-white/[0.15]">
                      {avatar ? (
                        <img src={avatar} className="h-full w-full object-cover" alt={displayName} />
                      ) : (
                        <span className="text-lg font-semibold uppercase">
                          {displayName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight text-white transition-colors group-hover:text-violet-200">
                        {displayName}
                      </p>
                      {username && (
                        <p className="mt-0.5 truncate text-[11px] font-medium text-zinc-500">
                          @{username.toLowerCase()}
                        </p>
                      )}
                    </div>

                    <div className="justify-self-end">
                      <LevelBadge
                        reviewsCount={u.reviewsCount ?? u.user?.reviewsCount}
                        title={u.levelTitle}
                        compact
                      />
                    </div>
                  </Link>
                );
              })}
              {hasMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="mt-1 inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-xs font-semibold text-zinc-300 transition-colors hover:border-white/[0.15] hover:bg-white/[0.045] hover:text-white disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                >
                  {loadingMore ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-200" />
                  ) : (
                    'Carregar mais'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
