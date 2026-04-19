import { X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import LevelBadge from './LevelBadge';

export default function UserListModal({ isOpen, onClose, title, users, loading }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300 md:p-6">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-[2rem] border border-white/10 bg-zinc-950/90 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-white/5 p-6 md:p-8">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white md:text-2xl">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/5 bg-white/5 p-3 text-zinc-500 shadow-inner transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-5 md:p-8">
          {loading ? (
            <div className="flex animate-in flex-col items-center justify-center gap-4 py-16 fade-in duration-300">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600/30 border-t-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Carregando...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex animate-in flex-col items-center justify-center gap-4 py-16 zoom-in-95 duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-600 shadow-inner">
                <User size={28} />
              </div>
              <span className="text-sm font-bold text-zinc-500">Nenhum usuário encontrado.</span>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-500">
              {users.map((u) => (
                <Link
                  key={u.id || u.username}
                  to={`/app/profile/${u.username}`}
                  onClick={onClose}
                  className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-black/40 p-4 shadow-inner transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-zinc-900 shadow-lg transition-colors group-hover:border-violet-500/50">
                    {u.photoURL || u.userPhoto ? (
                      <img src={u.photoURL || u.userPhoto} className="h-full w-full object-cover" alt={u.username} />
                    ) : (
                      <span className="text-lg font-black uppercase text-violet-500">
                        {(u.name || u.displayName || u.username || 'U')[0]}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-[15px] font-black leading-tight text-white transition-colors group-hover:text-violet-400">
                      {u.name || u.displayName || u.username || 'Usuário'}
                    </p>
                    <p className="truncate text-xs font-semibold text-zinc-400">
                      @{u.username?.toLowerCase()}
                    </p>
                    {u.levelTitle && <LevelBadge title={u.levelTitle} />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
