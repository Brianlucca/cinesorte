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
        } catch (error) {
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

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className={`relative group transition-all duration-300 ease-out ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none ${isFocused ? 'text-violet-500' : 'text-zinc-500'}`}>
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Search size={20} />
          )}
        </div>
        
        <input
          type="text"
          placeholder="Encontrar usuários..."
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
              setTimeout(() => {
                 if (!query) setIsFocused(false);
              }, 200);
          }}
          onChange={(e) => setQuery(e.target.value)}
          className={`
            w-full bg-zinc-900 text-white pl-12 pr-10 py-3.5 rounded-2xl 
            border transition-all duration-300 ease-out placeholder:text-zinc-600 outline-none
            ${isFocused 
                ? 'border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20' 
                : 'border-white/5 hover:border-white/10 hover:bg-zinc-800/50 shadow-lg'
            }
          `}
        />

        {query && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {query.trim().length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300 ease-out origin-top">
          <div className="px-4 py-3 bg-zinc-950/30 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resultados</span>
          </div>
          
          <ul className="max-h-[320px] overflow-y-auto custom-scrollbar p-2">
            {results.length > 0 ? (
              results.map((resultUser) => (
                <li 
                  key={resultUser.uid} 
                  onClick={() => handleSelectUser(resultUser.username)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white uppercase overflow-hidden border border-white/5 group-hover:border-violet-500/30 transition-colors duration-300 shrink-0 shadow-lg">
                    {resultUser.photoURL ? (
                      <img src={resultUser.photoURL} alt={resultUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="group-hover:text-violet-400 transition-colors duration-300">
                        {resultUser.username?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-sm truncate group-hover:text-violet-400 transition-colors duration-200">
                      @{resultUser.username}
                    </span>
                    <span className="text-zinc-500 text-xs truncate font-medium">
                      {resultUser.name}
                    </span>
                  </div>
                  {user && user.username === resultUser.username && (
                    <span className="ml-auto text-[10px] font-bold bg-violet-500/10 text-violet-400 px-2 py-1 rounded-md border border-violet-500/20">
                      VOCÊ
                    </span>
                  )}
                </li>
              ))
            ) : (
              !loading && (
                <li className="py-8 text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                    <Search size={24} />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">Nenhum usuário encontrado.</p>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSearch;