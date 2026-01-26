import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/api';
import { Search, Loader2, X } from 'lucide-react';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
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

  const handleSelectUser = (username) => {
    setQuery('');
    setResults([]);
    navigate(`/app/profile/${username}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors">
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Search size={18} />
          )}
        </div>
        
        <input
          type="text"
          placeholder="Buscar por username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
        />

        {query && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {query.trim().length >= 3 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            results.map((user) => (
              <li 
                key={user.uid} 
                onClick={() => handleSelectUser(user.username)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800/80 transition-colors border-b border-zinc-800/50 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden border border-zinc-700 shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username?.charAt(0)
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-sm truncate hover:text-violet-400 transition-colors">@{user.username}</span>
                    <span className="text-zinc-500 text-xs truncate">{user.name}</span>
                </div>
              </li>
            ))
          ) : (
            !loading && (
              <li className="px-4 py-6 text-center">
                <p className="text-zinc-500 text-sm">Nenhum usuário encontrado.</p>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;