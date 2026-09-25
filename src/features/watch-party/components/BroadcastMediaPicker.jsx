import { useEffect, useState } from "react";
import { Film, Search, X } from "lucide-react";
import { getTmdbSearch } from "@shared/api/api";

const normalizeMedia = (item) => ({
  id: item.id,
  type: item.media_type === "tv" ? "tv" : "movie",
  title: item.title || item.name,
  backdropPath: item.backdrop_path || null,
  posterPath: item.poster_path || null,
});

export default function BroadcastMediaPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) { setResults([]); return undefined; }
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getTmdbSearch(query);
        const items = Array.isArray(data) ? data : data?.results || [];
        if (active) setResults(items.filter((item) => ["movie", "tv"].includes(item.media_type) && (item.backdrop_path || item.poster_path)).slice(0, 5));
      } catch { if (active) setResults([]); }
      finally { if (active) setLoading(false); }
    }, 400);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  if (value) return <div><p className="mb-2 text-[9px] font-black uppercase tracking-wider text-zinc-500">O que está transmitindo</p><div className="flex items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-500/[0.07] p-3">{value.posterPath ? <img src={`https://image.tmdb.org/t/p/w154${value.posterPath}`} alt="" className="h-16 w-11 rounded-md object-cover" /> : <Film size={18} className="text-violet-300" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-white">{value.title}</p><p className="mt-1 text-[9px] font-bold uppercase text-violet-300">{value.type === "tv" ? "Série" : "Filme"}</p></div><button type="button" onClick={() => { onChange(null); setQuery(""); }} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-white/[0.07] hover:text-white"><X size={14} /></button></div></div>;

  return <div className="relative"><label htmlFor="broadcast-media" className="mb-2 block text-[9px] font-black uppercase tracking-wider text-zinc-500">O que está transmitindo</label><div className="relative"><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" /><input id="broadcast-media" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite o filme ou série" className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-400/45" /></div>{(loading || results.length > 0) && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/[0.1] bg-[#15151a] p-1 shadow-2xl">{loading ? <p className="p-3 text-xs text-zinc-500">Buscando...</p> : results.map((item) => <button key={`${item.media_type}-${item.id}`} type="button" onClick={() => { onChange(normalizeMedia(item)); setResults([]); }} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/[0.06]">{item.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="h-12 w-8 rounded object-cover" /> : <Film size={15} />}<span className="min-w-0"><strong className="block truncate text-xs text-white">{item.title || item.name}</strong><span className="text-[9px] uppercase text-zinc-600">{item.media_type === "tv" ? "Série" : "Filme"}</span></span></button>)}</div>}</div>;
}
