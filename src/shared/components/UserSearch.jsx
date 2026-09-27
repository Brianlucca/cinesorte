import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '@shared/api/api';
import { useAuth } from '@shared/context/useAuth';
import { Search, Loader2, X } from 'lucide-react';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 3) {
        setLoading(true);
        try {
          const data = await searchUsers(query);
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectUser = (targetUsername) => {
    setQuery('');
    setResults([]);
    if (user && user.username === targetUsername) {
      navigate('/app/profile');
    } else {
      navigate(`/app/profile/${targetUsername}`);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="group relative">
        <div className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-colors ${isFocused ? 'text-violet-300' : 'text-zinc-500'}`}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
        </div>
        
        <input
          type="text"
          placeholder="Buscar exploradores..."
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full rounded-lg border bg-black/15 py-3 pl-10 pr-10 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 ${isFocused ? 'border-violet-400/35 bg-white/[0.04]' : 'border-white/[0.07]'}`}
        />

        {query && (
          <button type="button" aria-label="Limpar busca" onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white">
            <X size={13} />
          </button>
        )}
      </div>
      
      {query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181a20]/98 shadow-[0_16px_40px_rgba(0,0,0,0.38)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Pessoas encontradas</span>
            {!loading && results.length > 0 && <span className="text-[10px] text-zinc-600">{results.length}</span>}
          </div>
          
          <ul className="content-scrollbar max-h-[280px] overflow-y-auto p-1.5">
            {results.length > 0 ? (
              results.map((resultUser) => (
                <li key={resultUser.username}>
                  <button type="button" onClick={() => handleSelectUser(resultUser.username)} className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.045]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/[0.06]">
                      {resultUser.photoURL ? <img src={resultUser.photoURL} className="h-full w-full object-cover" alt="" /> : <span className="text-xs font-semibold text-zinc-500">{resultUser.username?.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold text-zinc-200 transition-colors group-hover:text-white">@{resultUser.username}</span>
                      {resultUser.name && <span className="mt-0.5 truncate text-[11px] text-zinc-500">{resultUser.name}</span>}
                    </div>
                  </button>
                </li>
              ))
            ) : (
              !loading && <li className="px-4 py-7 text-center text-xs text-zinc-600">Nenhum explorador encontrado.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
