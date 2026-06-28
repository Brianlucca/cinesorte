import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import { getTmdbSearch } from '../../services/api';

export default function BackgroundSelectorModal({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          const data = await getTmdbSearch(query);
          const list = Array.isArray(data) ? data : (data.results || []);
          setResults(list.filter((item) => item.backdrop_path).slice(0, 10));
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [isOpen, query]);

  const handleSelectImage = (item) => {
    const fullUrl = `https://image.tmdb.org/t/p/original${item.backdrop_path}`;
    onSelect(fullUrl);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto bg-black/[0.84] px-3 py-5 backdrop-blur-xl animate-in fade-in duration-200 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="background-modal-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fechar capa" onClick={onClose} />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">
        <div className="flex max-h-[86vh] w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0d0d11]/95 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-3xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">Capa do perfil</p>
              <h2 id="background-modal-title" className="mt-1 truncate text-xl font-black tracking-[-0.03em] text-white">
                Alterar capa
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-zinc-300 transition-colors hover:bg-white/[0.1] hover:text-white"
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="content-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="mb-4 rounded-xl border border-cyan-300/15 bg-cyan-400/[0.08] px-4 py-3 text-xs font-semibold leading-relaxed text-cyan-100">
              Imagens fornecidas pela TMDB. Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
            </div>

            <div className="relative mb-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                autoFocus
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-300/35 focus:bg-black/40"
                placeholder="Pesquise um filme ou série para usar de capa..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="min-h-[340px]">
              {loading ? (
                <div className="grid min-h-[340px] place-items-center text-violet-200">
                  <Loader2 size={30} className="animate-spin" />
                </div>
              ) : query.trim().length <= 2 ? (
                <div className="grid min-h-[340px] place-items-center text-center">
                  <div>
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-zinc-500">
                      <Search size={24} />
                    </div>
                    <p className="text-sm font-bold text-zinc-500">Busque por um filme ou série.</p>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="grid min-h-[340px] place-items-center text-center">
                  <div>
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-zinc-500">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm font-bold text-zinc-500">Nenhuma capa encontrada.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300 sm:grid-cols-2">
                  {results.map((item) => {
                    const title = item.title || item.name || 'Capa';

                    return (
                      <button
                        key={`${item.media_type || 'item'}-${item.id}-${item.backdrop_path}`}
                        type="button"
                        onClick={() => handleSelectImage(item)}
                        className="group relative aspect-video overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] transition-all hover:-translate-y-0.5 hover:border-violet-300/35 hover:bg-white/[0.045]"
                        title={title}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={title}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="line-clamp-2 text-left text-xs font-black uppercase tracking-[0.08em] text-white sm:text-sm">
                            {title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
