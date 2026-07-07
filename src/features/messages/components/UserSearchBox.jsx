import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getUserFollowing } from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";

export default function UserSearchBox({ onPick, selected = [], placeholder = "Buscar usuário" }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadFollowing = async () => {
      if (!user?.username) {
        setFollowing([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getUserFollowing(user.username);
        if (!cancelled) {
          setFollowing(
            (Array.isArray(data) ? data : [])
              .filter((item) => item?.username)
              .map((item) => ({
                username: item.username,
                name: item.name || item.username,
                photoURL: item.photoURL || item.userPhoto || null,
                levelTitle: item.levelTitle || null,
              }))
          );
        }
      } catch {
        if (!cancelled) setFollowing([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFollowing();

    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  const selectedNames = new Set(selected.map((item) => item.username));
  const normalizedQuery = query.trim().toLowerCase().replace(/^@/, "");
  const results = following
    .filter((item) => !selectedNames.has(item.username))
    .filter((item) => {
      if (!normalizedQuery) return true;
      return (
        item.username.toLowerCase().includes(normalizedQuery) ||
        String(item.name || "").toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, normalizedQuery ? 8 : 6);

  const showResults = focused && results.length > 0;

  const pickUser = (user) => {
    onPick(user);
    setQuery("");
    setFocused(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-2.5">
        <Search size={15} className="text-zinc-600" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-700"
        />
        {loading && <Loader2 size={14} className="animate-spin text-zinc-500" />}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101015] shadow-2xl">
          {results.map((user) => (
            <button
              key={user.username}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
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
