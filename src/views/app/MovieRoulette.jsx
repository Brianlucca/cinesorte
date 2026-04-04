import { RefreshCw, Sparkles, Star, Globe, Library, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRouletteLogic } from '../../hooks/useRouletteLogic';
import GenreSelector from '../../components/roulette/GenreSelector';
import RouletteHeader from '../../components/roulette/RouletteHeader';
import Modal from '../../components/ui/Modal';

export default function MovieRoulette() {
  const { state, actions } = useRouletteLogic();

  return (
    <div className="flex flex-col items-center min-h-screen px-4 md:px-8 py-10 md:py-16 relative overflow-x-hidden bg-zinc-950 animate-in fade-in duration-700">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-6xl mx-auto space-y-12">
        <RouletteHeader isSpinning={state.loading} />

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] backdrop-blur-xl border border-white/5 p-2 rounded-[1.5rem] shadow-2xl relative z-10">
            <div className="flex p-1.5 bg-black/50 rounded-2xl border border-white/5 shadow-inner">
              <button
                onClick={() => actions.setSource('global')}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${state.source === 'global' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Globe size={16} /> Global
              </button>
              <button
                onClick={() => actions.setSource('user')}
                disabled={state.userLists.length === 0}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${state.source === 'user' ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Library size={16} /> Minhas Listas
              </button>
            </div>

            {state.source === 'user' && (
              <div className="relative w-full md:w-auto md:mr-2">
                <select
                  value={state.selectedListId}
                  onChange={(e) => actions.setSelectedListId(e.target.value)}
                  className="w-full appearance-none bg-white/[0.05] text-white pl-5 pr-12 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer shadow-inner"
                >
                  <option value="all" className="bg-zinc-900">Todas as Listas</option>
                  {state.userLists.map(list => (
                    <option key={list.id} value={list.id} className="bg-zinc-900">{list.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center pt-8">
          
          <div className="lg:col-span-5 w-full max-w-[360px] mx-auto relative group">
            <div className={`absolute -inset-10 bg-violet-600/30 blur-[100px] rounded-[3rem] transition-opacity duration-1000 ${state.loading ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-50'}`} />
            
            <div className={`relative aspect-[2/3] bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center transition-transform duration-700 ${state.loading ? 'scale-[0.98]' : 'scale-100 group-hover:scale-[1.02] group-hover:-translate-y-2'}`}>
              
              <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none z-20" />

              {state.previewMedia ? (
                <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 relative">
                  <img src={`https://image.tmdb.org/t/p/w780${state.previewMedia.poster_path}`} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-white/[0.01]">
                   <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-8 border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                      <Sparkles size={40} className="text-violet-400 animate-pulse" />
                   </div>
                   <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Gire a Sorte</h3>
                   <p className="text-violet-400/60 text-xs font-bold uppercase tracking-[0.25em] mt-4">Deixe o destino decidir</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <GenreSelector genres={state.genres} selectedGenre={state.selectedGenre} onSelect={actions.setSelectedGenre} />
            
            <button 
              onClick={actions.spinRoulette}
              disabled={state.loading}
              className="w-full relative h-24 active:scale-95 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
              
              <div className="relative h-full w-full bg-zinc-950 rounded-[2rem] p-1.5 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-[1.6rem] flex items-center justify-center gap-5 border border-white/20 transition-colors shadow-inner overflow-hidden relative">
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />

                  <span className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] relative z-10 drop-shadow-md">
                    {state.loading ? 'Sorteando...' : 'Girar Roleta'}
                  </span>
                  <RefreshCw size={28} className={`relative z-10 drop-shadow-md ${state.loading ? 'animate-spin text-white/80' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={state.isModalOpen} onClose={actions.closeModal} size="lg">
        {state.winner && (
          <div className="relative flex flex-col justify-end w-full min-h-[500px] md:min-h-[600px] animate-in fade-in zoom-in-95 duration-500 bg-zinc-950 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
            
            <img 
              src={`https://image.tmdb.org/t/p/w1280${state.winner.backdrop_path}`} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt={state.winner.title || state.winner.name} 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            
            <div className="relative z-10 p-6 md:p-10 flex flex-col gap-4 mt-auto">
              
              <div className="flex items-center gap-2 bg-violet-600/30 backdrop-blur-md border border-violet-500/30 px-4 py-1.5 rounded-full w-fit shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <Sparkles size={14} className="text-violet-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md">Sorteado com sucesso</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl line-clamp-3 pb-2">
                {state.winner.title || state.winner.name}
              </h2>

              <div className="flex flex-wrap gap-3 my-2">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                    <Star size={16} className="text-yellow-500 fill-yellow-500 drop-shadow-md" />
                    <span className="font-black text-white text-sm">{state.winner.vote_average?.toFixed(1)}</span>
                </div>
                <div className="flex items-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                    <span className="font-bold text-white text-sm">
                      {state.winner.release_date?.split('-')[0] || state.winner.first_air_date?.split('-')[0]}
                    </span>
                </div>
                <div className="flex items-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                    <span className="font-bold text-white text-sm uppercase tracking-wider">
                      {state.winner.media_type === 'tv' ? 'Série' : 'Filme'}
                    </span>
                </div>
              </div>
              
              <p className="text-zinc-200 text-sm md:text-base leading-relaxed mb-2 line-clamp-3 md:line-clamp-4 font-medium drop-shadow-lg">
                {state.winner.overview || "Nenhuma sinopse disponível para este título no momento."}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <Link 
                  to={`/app/${state.winner.media_type || 'movie'}/${state.winner.id}`} 
                  className="py-4 bg-white text-black text-center rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                > 
                  Ver Detalhes 
                </Link>
                <button 
                  onClick={() => { actions.closeModal(); actions.spinRoulette(); }} 
                  className="py-4 bg-black/50 backdrop-blur-xl text-white text-center rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black/70 transition-all border border-white/10 active:scale-95 shadow-md"
                > 
                  Tentar Outro 
                </button>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}