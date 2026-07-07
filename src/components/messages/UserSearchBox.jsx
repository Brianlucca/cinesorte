import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { searchUsers } from "../../services/api";

export default function UserSearchBox({ onPick, selected = [], placeholder = "Buscar usuario" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 3) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUsers(value);
        if (!cancelled) {
          const selectedNames = new Set(selected.map((user) => user.username));
          setResults((Array.isArray(data) ? data : []).filter((user) => !selectedNames.has(user.username)));
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, selected]);

  const pickUser = (user) => {
    onPick(user);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-2.5">
        <Search size={15} className="text-zinc-600" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-700"
        />
        {loading && <Loader2 size={14} className="animate-spin text-zinc-500" />}
      </div>

      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101015] shadow-2xl">
          {results.map((user) => (
            <button
              key={user.username}
              type="button"
              onClick={() => pickUser(user)}
              className="flex w-full items-center gap-3 border-b border-white/[0.05] px-3 py-2.5 text-left last:border-0 hover:bg-white/[0.04]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-violet-500/10 text-xs font-bold text-violet-200">
                {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : user.name?.[0] || "U"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-zinc-100">{user.name || user.username}</span>
                <span className="block truncate text-xs text-zinc-600">@{user.username}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
