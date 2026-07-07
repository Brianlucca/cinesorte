import { createPortal } from "react-dom";

export function MentionDropdown({ filteredUsers, mentionIndex, onSelect, anchorRect }) {
  if (!anchorRect || typeof document === "undefined") return null;

  const width = Math.min(Math.max(anchorRect.width, 280), 360);
  const left = Math.max(16, Math.min(anchorRect.left, window.innerWidth - width - 16));
  const top = Math.min(anchorRect.bottom + 10, window.innerHeight - 220);

  return createPortal(
    <div
      className="fixed z-[10050] bg-zinc-950/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden py-2"
      style={{ top, left, width }}
    >
      <div className="px-3 pb-2 mb-1 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        Mencionar usuário
      </div>
      {filteredUsers.map((u, i) => (
        <button
          key={u.username}
          type="button"
          onClick={() => onSelect(u.username)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 ${
            i === mentionIndex
              ? "bg-violet-600/20 border-l-2 border-violet-500"
              : "hover:bg-white/5 border-l-2 border-transparent"
          }`}
        >
          {u.userPhoto ? (
            <img
              src={u.userPhoto}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shadow-sm"
              alt=""
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 shadow-sm">
              {u.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <span className={`block text-sm font-bold ${i === mentionIndex ? "text-violet-300" : "text-zinc-100"}`}>
              @{u.username}
            </span>
            <span className="block text-xs text-zinc-500 truncate">Toque para mencionar</span>
          </div>
        </button>
      ))}
    </div>,
    document.body,
  );
}
