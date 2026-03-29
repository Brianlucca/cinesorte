export function MentionDropdown({ filteredUsers, mentionIndex, onSelect }) {
  return (
    <div className="absolute z-[99999] top-[calc(100%+8px)] left-0 w-72 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-3 pb-2 mb-1 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        Mencionar Usuário
      </div>
      {filteredUsers.map((u, i) => (
        <div
          key={u.username}
          onClick={() => onSelect(u.username)}
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-200 ${
            i === mentionIndex
              ? "bg-violet-600/20 border-l-2 border-violet-500"
              : "hover:bg-white/5 border-l-2 border-transparent"
          }`}
        >
          {u.userPhoto ? (
            <img
              src={u.userPhoto}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shadow-sm"
              alt=""
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 shadow-sm">
              {u.username.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`text-sm font-bold ${
              i === mentionIndex ? "text-violet-300" : "text-zinc-200"
            }`}
          >
            @{u.username}
          </span>
        </div>
      ))}
    </div>
  );
}