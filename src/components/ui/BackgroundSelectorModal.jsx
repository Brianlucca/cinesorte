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
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input 
            type="text" 
            autoFocus
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
            placeholder="Pesquise um filme ou série para usar de capa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleSelectImage(item)}
                  className="relative group aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-violet-500 transition-all hover:scale-105"
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`} 
                    className="w-full h-full object-cover" 
                    alt={item.title || item.name}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                    <span className="text-sm font-bold text-white">
                        {item.title || item.name}
                    </span>
                  </div>
                </button>
              ))}
              {!loading && query.length > 2 && results.length === 0 && (
                <div className="col-span-full text-center text-zinc-500 py-10">
                    Nenhum resultado encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}