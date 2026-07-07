import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getTmdbSearch } from "../../services/api";
import MediaMessageCard from "./MediaMessageCard";
import { normalizeSearchMedia } from "./messageUtils";

export default function MediaAttachmentPanel({ onPick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getTmdbSearch(value);
        if (!cancelled) {
          setResults(
            (Array.isArray(data) ? data : [])
              .filter((item) => ["movie", "tv"].includes(item.media_type || (item.name ? "tv" : "movie")))
              .slice(0, 8)
              .map(normalizeSearchMedia),
          );
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
  }, [query]);

  return (
    <div className="border-t border-white/[0.06] bg-[#0a0a0d] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Enviar filme ou série</span>
        {loading && <Loader2 size={14} className="animate-spin text-zinc-500" />}
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-2.5">
        <Search size={15} className="text-zinc-600" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar titulo"
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-700"
        />
      </div>
      {results.length > 0 ? (
        <div className="content-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
          {results.map((media) => (
            <button
              key={`${media.mediaType}-${media.id}`}
              type="button"
              onClick={() => onPick(media)}
              className="block w-full text-left transition-transform hover:-translate-y-0.5"
            >
              <MediaMessageCard media={media} horizontal />
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 text-center text-xs text-zinc-600">
          {query.trim().length < 2 ? "Busque um filme ou série para anexar ao papo." : "Nenhum título encontrado."}
        </div>
      )}
    </div>
  );
}
