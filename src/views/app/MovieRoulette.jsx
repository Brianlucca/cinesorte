import { RefreshCw, Sparkles, Star, Globe, Library, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRouletteLogic } from '../../hooks/useRouletteLogic';
import GenreSelector from '../../components/roulette/GenreSelector';
import RouletteHeader from '../../components/roulette/RouletteHeader';
import Modal from '../../components/ui/Modal';

export default function MovieRoulette() {
  const { state, actions } = useRouletteLogic();

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 via-transparent to-transparent -z-10" />
      
      <div className="w-full max-w-6xl mx-auto space-y-10">
        <RouletteHeader isSpinning={state.loading} />

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
            <div className="flex p-1 bg-black/40 rounded-xl">
              <button
                onClick={() => actions.setSource('global')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${state.source === 'global' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                <Globe size={16} /> GLOBAL
              </button>
              <button
                onClick={() => actions.setSource('user')}
                disabled={state.userLists.length === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-30 ${state.source === 'user' ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                <Library size={16} /> MINHAS LISTAS
              </button>
            </div>

            {state.source === 'user' && (
              <div className="relative">
                <select
                  value={state.selectedListId}
                  onChange={(e) => actions.setSelectedListId(e.target.value)}
                  className="appearance-none bg-zinc-800 text-white pl-4 pr-10 py-2 rounded-xl text-sm font-semibold border border-white/10 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                >
                  <option value="all">Todas as Listas</option>
                  {state.userLists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative mx-auto w-full max-w-[340px]">
            <div className={`absolute -inset-10 bg-violet-600/20 blur-[100px] rounded-full transition-opacity duration-700 ${state.loading ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
            
            <div className="relative aspect-[2/3] bg-zinc-900 rounded-[2rem] border-[12px] border-zinc-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
              {state.previewMedia ? (
                <div className="w-full h-full animate-in fade-in zoom-in-95 duration-200">
                  <img src={`https://image.tmdb.org/t/p/w500${state.previewMedia.poster_path}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                   <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
                      <Sparkles size={40} className="text-violet-500" />
                   </div>
                   <h3 className="text-xl font-bold text-white tracking-tight">Gire a Sorte</h3>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10">
            <GenreSelector genres={state.genres} selectedGenre={state.selectedGenre} onSelect={actions.setSelectedGenre} />
            
            <button 
              onClick={actions.spinRoulette}
              disabled={state.loading}
              className="w-full relative h-20 active:scale-95 transition-all group"
            >
              <div className="absolute inset-0 bg-violet-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative h-full w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl flex items-center justify-center gap-4 shadow-2xl">
                <span className="text-xl font-bold uppercase tracking-wider">
                  {state.loading ? 'Sorteando...' : 'Girar Roleta'}
                </span>
                <RefreshCw size={24} className={state.loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={state.isModalOpen} onClose={actions.closeModal} size="lg">
        {state.winner && (
          <div className="bg-zinc-950 rounded-3xl overflow-hidden border border-white/10">
            <div className="relative aspect-video">
              <img src={`https://image.tmdb.org/t/p/original${state.winner.backdrop_path}`} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <div className="flex items-center gap-2 bg-violet-600 px-3 py-1 rounded-full w-fit mb-3">
                    <Sparkles size={14} className="text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Vencedor Escolhido</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">{state.winner.title || state.winner.name}</h2>
              </div>
            </div>
            
            <div className="p-8 pt-4">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1 bg-zinc-900 px-4 py-2 rounded-xl border border-white/5">
                    <Star size={18} className="text-yellow-500" fill="currentColor" />
                    <span className="font-bold text-white">{state.winner.vote_average?.toFixed(1)}</span>
                </div>
                <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-white/5 font-medium text-zinc-400">
                    {state.winner.release_date?.split('-')[0] || state.winner.first_air_date?.split('-')[0]}
                </div>
              </div>
              
              <p className="text-zinc-400 text-base leading-relaxed mb-10 line-clamp-3">
                {state.winner.overview || "Nenhuma sinopse disponível para este título."}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to={`/app/${state.winner.media_type || 'movie'}/${state.winner.id}`} className="py-4 bg-white text-black text-center rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"> VER AGORA </Link>
                <button onClick={() => { actions.closeModal(); actions.spinRoulette(); }} className="py-4 bg-zinc-800 text-white text-center rounded-xl font-bold hover:bg-zinc-700 transition-all border border-white/5"> TENTAR OUTRO </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}