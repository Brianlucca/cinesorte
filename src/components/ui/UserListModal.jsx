import { X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

export default function UserListModal({ isOpen, onClose, title, users, loading }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-xl font-bold text-white capitalize">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((u) => (
                <Link 
                    key={u.id || u.username} 
                    to={`/app/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/5 group-hover:border-violet-500/50 transition-colors shrink-0">
                    {u.photoURL || u.userPhoto ? (
                      <img src={u.photoURL || u.userPhoto} className="w-full h-full object-cover" alt={u.username} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{u.name || u.displayName || u.username || 'Usuário'}</p>
                    <p className="text-xs text-zinc-500 truncate">@{u.username}</p>
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