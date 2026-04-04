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
          setResults(list.filter(i => i.backdrop_path).slice(0, 8));
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
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-zinc-500" size={20} />
          <input 
            type="text" 
            autoFocus
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white font-medium focus:border-violet-500/50 transition-all outline-none shadow-inner placeholder:text-zinc-600"
            placeholder="Pesquise um filme ou série para usar de capa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Buscando capas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-500">
              {results.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleSelectImage(item)}
                  className="relative group aspect-video rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`} 
                    className="w-full h-full object-cover" 
                    alt={item.title || item.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 text-center">
                    <span className="text-sm font-black text-white leading-tight uppercase tracking-wider drop-shadow-lg line-clamp-2">
                        {item.title || item.name}
                    </span>
                  </div>
                </button>
              ))}
              {!loading && query.length > 2 && results.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                      <ImageIcon className="text-zinc-600" size={20} />
                    </div>
                    <span className="text-zinc-500 font-bold text-sm">Nenhum resultado encontrado.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}