import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
      <div className={`relative group transition-all duration-500 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}>
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-10 ${isFocused ? 'text-violet-400' : 'text-zinc-500'}`}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
        </div>
        
        <input
          type="text"
          placeholder="Buscar exploradores..."
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          className={`
            w-full bg-white/[0.03] text-white pl-12 pr-12 py-4 rounded-2xl 
            border transition-all duration-300 placeholder:text-zinc-600 outline-none text-sm
            ${isFocused ? 'border-violet-500/40 bg-white/[0.05] shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-white/5 shadow-lg'}
          `}
        />

        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-zinc-500 hover:text-white bg-white/5 transition-all">
            <X size={14} />
          </button>
        )}
      </div>
      
      {query.trim().length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-4 duration-300 ease-out origin-top">
          <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
            <span className="w-1.5 h-4 bg-violet-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Resultados</span>
          </div>
          
          <ul className="max-h-[380px] overflow-y-auto p-2 scrollbar-hide">
            {results.length > 0 ? (
              results.map((resultUser) => (
                <li key={resultUser.uid} onClick={() => handleSelectUser(resultUser.username)} className="flex items-center gap-4 p-3.5 cursor-pointer hover:bg-white/[0.05] rounded-2xl transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5 shrink-0">
                    {resultUser.photoURL ? <img src={resultUser.photoURL} className="w-full h-full object-cover" alt="" /> : <span className="text-xs font-black text-zinc-500">{resultUser.username?.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-zinc-100 text-sm truncate group-hover:text-violet-400 transition-colors">@{resultUser.username}</span>
                    <span className="text-zinc-500 text-[10px] truncate font-bold uppercase tracking-wider mt-0.5">{resultUser.name}</span>
                  </div>
                </li>
              ))
            ) : (
              !loading && <li className="py-10 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">Nenhum resultado</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
