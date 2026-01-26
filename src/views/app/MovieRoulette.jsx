import { RefreshCw, Sparkles, Play, Star, Calendar, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRouletteLogic } from '../../hooks/useRouletteLogic';
import GenreSelector from '../../components/roulette/GenreSelector';
import RouletteHeader from '../../components/roulette/RouletteHeader';
import Modal from '../../components/ui/Modal';

export default function MovieRoulette() {
  const { state, actions } = useRouletteLogic();

  return (
    <div className="flex flex-col items-center min-h-[85vh] px-4 py-8 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950 -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 mix-blend-overlay" />

      <div className="w-full max-w-5xl mx-auto space-y-10 relative z-10">
        
        <RouletteHeader isSpinning={state.loading} />

        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
            <div className="w-full max-w-sm shrink-0">
                <div className="relative aspect-[2/3] bg-zinc-900 rounded-2xl border-4 border-zinc-800 shadow-2xl overflow-hidden group">
                    {state.loading || state.previewMedia ? (
                        <>
                            <img 
                                src={`https://image.tmdb.org/t/p/w500${state.previewMedia?.poster_path}`} 
                                alt="Roulette"
                                className="w-full h-full object-cover animate-in fade-in duration-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 w-full p-6">
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">
                                    {state.previewMedia?.media_type === 'tv' ? 'Série' : 'Filme'}
                                </p>
                                <h3 className="text-2xl font-black text-white leading-tight line-clamp-2">
                                    {state.previewMedia?.title || state.previewMedia?.name}
                                </h3>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border-2 border-dashed border-zinc-700">
                                <Sparkles size={32} className="text-violet-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Pronto para girar?</h3>
                            <p className="text-zinc-500 text-sm">Selecione um gênero abaixo ou tente a sorte total.</p>
                        </div>
                    )}
                    
                    {state.loading && (
                        <div className="absolute inset-0 bg-violet-600/10 backdrop-blur-[2px] z-20 flex items-center justify-center">
                            <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white font-bold tracking-widest animate-pulse">
                                SORTEANDO...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center lg:items-start w-full gap-8">
                <GenreSelector 
                    genres={state.genres} 
                    selectedGenre={state.selectedGenre} 
                    onSelect={actions.setSelectedGenre} 
                />

                <div className="w-full flex justify-center lg:justify-start pt-4">
                    <button 
                        onClick={actions.spinRoulette}
                        disabled={state.loading}
                        className="relative group w-full sm:w-auto overflow-hidden rounded-2xl p-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600 animate-gradient-xy" />
                        <div className="relative px-12 py-5 bg-black rounded-2xl flex items-center justify-center gap-3 group-hover:bg-black/90 transition-colors">
                            <span className="text-xl font-black text-white uppercase tracking-wider">
                                {state.loading ? 'Sorteando...' : 'Girar Roleta'}
                            </span>
                            <RefreshCw size={24} className={`text-white transition-all duration-700 ${state.loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                        </div>
                    </button>
                </div>
            </div>
        </div>

      </div>

      <Modal 
        isOpen={state.isModalOpen} 
        onClose={actions.closeModal}
        title="Temos um Vencedor!"
        size="lg"
      >
        {state.winner && (
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl">
                <div className="absolute inset-0">
                    <img 
                        src={`https://image.tmdb.org/t/p/original${state.winner.backdrop_path}`} 
                        className="w-full h-full object-cover opacity-20 blur-sm scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
                </div>

                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-48 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 mx-auto md:mx-0 rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${state.winner.poster_path}`} 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg">
                                {state.winner.media_type === 'tv' ? 'Série de TV' : 'Filme'}
                            </span>
                            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg border border-yellow-500/20 font-bold text-xs">
                                <Star size={14} fill="currentColor" />
                                {state.winner.vote_average?.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg border border-white/5 font-bold text-xs">
                                <Calendar size={14} />
                                {state.winner.release_date?.split('-')[0] || state.winner.first_air_date?.split('-')[0] || 'N/A'}
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                            {state.winner.title || state.winner.name}
                        </h2>

                        <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-8 line-clamp-4 font-light">
                            {state.winner.overview || "Sem sinopse disponível para este título."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Link 
                                to={`/app/${state.winner.media_type || 'movie'}/${state.winner.id}`}
                                className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-white/10"
                            >
                                <Play size={18} fill="currentColor" /> Ver Detalhes
                            </Link>
                            <button 
                                onClick={() => { actions.closeModal(); actions.spinRoulette(); }}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10"
                            >
                                <RefreshCw size={18} /> Girar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}