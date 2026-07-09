import { Loader2, User, UserPlus, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import LevelBadge from '@shared/components/ui/LevelBadge';

export default function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  loading,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}) {
  if (!isOpen) return null;

  const safeUsers = Array.isArray(users) ? users : [];
  const isFollowingList = title?.toLowerCase() === 'seguindo';
  const EmptyIcon = isFollowingList ? UserPlus : Users;
  const emptyText = isFollowingList
    ? 'Você ainda não segue ninguém.'
    : 'Nenhum seguidor por aqui ainda.';

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/[0.84] p-3 backdrop-blur-xl animate-in fade-in duration-200 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-list-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fechar lista" onClick={onClose} />

      <div className="relative z-10 flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0d0d11]/95 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-3xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">
              {safeUsers.length} {safeUsers.length === 1 ? 'perfil' : 'perfis'}
            </p>
            <h2 id="user-list-title" className="mt-1 truncate text-xl font-black tracking-[-0.03em] text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-zinc-300 transition-colors hover:bg-white/[0.1] hover:text-white"
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
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-zinc-500">
                  <EmptyIcon size={25} />
                </div>
                <p className="text-sm font-bold text-zinc-500">{emptyText}</p>
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
                    className="group grid min-h-[76px] grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 transition-colors hover:border-violet-300/25 hover:bg-white/[0.045]"
                  >
                    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900 text-violet-300 transition-colors group-hover:border-violet-300/30">
                      {avatar ? (
                        <img src={avatar} className="h-full w-full object-cover" alt={displayName} />
                      ) : (
                        <span className="text-lg font-black uppercase">
                          {displayName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black leading-tight text-white transition-colors group-hover:text-violet-200 sm:text-[15px]">
                        {displayName}
                      </p>
                      {username && (
                        <p className="mt-1 truncate text-xs font-semibold text-zinc-500">
                          @{username.toLowerCase()}
                        </p>
                      )}
                    </div>

                    {u.levelTitle ? (
                      <div className="hidden max-w-[150px] justify-self-end sm:block">
                        <LevelBadge title={u.levelTitle} />
                      </div>
                    ) : (
                      <User size={16} className="justify-self-end text-zinc-700" />
                    )}
                  </Link>
                );
              })}
              {hasMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 text-xs font-black uppercase tracking-[0.14em] text-violet-200 transition-colors hover:bg-violet-500/15 disabled:pointer-events-none disabled:opacity-60"
                >
                  {loadingMore ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-200" />
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
