import { X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

export default function UserListModal({ isOpen, onClose, title, users, loading }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-950/90 backdrop-blur-3xl w-full max-w-md rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-all p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 shadow-inner active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-8 custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Carregando...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner text-zinc-600">
                <User size={28} />
              </div>
              <span className="text-zinc-500 font-bold text-sm">Nenhum usuário encontrado.</span>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-500">
              {users.map((u) => (
                <Link 
                    key={u.id || u.username} 
                    to={`/app/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 bg-black/40 hover:bg-white/[0.02] border border-white/5 hover:border-violet-500/30 rounded-2xl transition-all duration-300 group shadow-inner hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden border border-white/5 group-hover:border-violet-500/50 transition-colors shrink-0 flex items-center justify-center shadow-lg">
                    {u.photoURL || u.userPhoto ? (
                      <img src={u.photoURL || u.userPhoto} className="w-full h-full object-cover" alt={u.username} />
                    ) : (
                      <span className="font-black text-violet-500 text-lg uppercase">
                        {(u.name || u.displayName || u.username || 'U')[0]}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-white text-base truncate group-hover:text-violet-400 transition-colors">
                        {u.name || u.displayName || u.username || 'Usuário'}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate mt-0.5">
                        @{u.username}
                    </p>
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