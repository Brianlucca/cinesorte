import { useState, useEffect } from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import { getTmdbSearch } from '../../services/api';
import Modal from './Modal';

export default function BackgroundSelectorModal({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          const data = await getTmdbSearch(query);
          const list = Array.isArray(data) ? data : (data.results || []);
          setResults(list.filter((i) => i.backdrop_path).slice(0, 8));
        } catch (error) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectImage = (item) => {
    const fullUrl = `https://image.tmdb.org/t/p/original${item.backdrop_path}`;
    onSelect(fullUrl);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Capa do Perfil" size="lg">
      <div className="space-y-8 pt-2">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          Imagens fornecidas pela TMDB. Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-5 text-zinc-500" size={20} />
          <input
            type="text"
            autoFocus
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white font-medium outline-none shadow-inner transition-all placeholder:text-zinc-600 focus:border-violet-500/50"
            placeholder="Pesquise um filme ou série para usar de capa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex h-64 animate-in fade-in flex-col items-center justify-center gap-4 duration-300">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600/30 border-t-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Buscando capas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 animate-in fade-in duration-500 sm:grid-cols-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectImage(item)}
                  className="group relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg transition-all duration-300 hover:scale-105 hover:border-violet-500/50 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                    className="h-full w-full object-cover"
                    alt={item.title || item.name}
                  />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 text-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span className="line-clamp-2 text-sm font-black uppercase tracking-wider text-white drop-shadow-lg">
                      {item.title || item.name}
                    </span>
                  </div>
                </button>
              ))}
              {!loading && query.length > 2 && results.length === 0 && (
                <div className="col-span-full flex animate-in zoom-in-95 flex-col items-center justify-center gap-3 py-16 duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/5 shadow-inner">
                    <ImageIcon className="text-zinc-600" size={20} />
                  </div>
                  <span className="text-sm font-bold text-zinc-500">Nenhum resultado encontrado.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
