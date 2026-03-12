import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOscarsLogic } from '../../hooks/useOscarsLogic';
import { Award, Trophy, CheckCircle2, Lock, User, Film, Info, Sparkles, ChevronRight, Edit3, RefreshCw, AlertTriangle, X } from 'lucide-react';

const Oscars = () => {
  const navigate = useNavigate();
  const { categories, myVotes, selections, results, winners, loading, progress, handleSelect, handleConfirmVote, isResultsPhase, retryFetchImages } = useOscarsLogic();
  const [editMode, setEditMode] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <Award className="w-24 h-24 text-yellow-500 mb-8 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-pulse" />
          <h2 className="text-white font-black text-2xl md:text-3xl mb-6 tracking-[0.2em] uppercase">Estendendo o Tapete</h2>
          <div className="w-80 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-zinc-500 text-xs mt-4 font-bold tracking-[0.3em] uppercase">Mapeando base de dados {progress}%</p>
        </div>
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <AlertTriangle className="text-red-500 w-20 h-20 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-center">A API do TMDB limitou suas conexões</h2>
        <p className="text-zinc-400 mb-6 text-center max-w-md">Isso acontece quando a tela é recarregada muitas vezes. O nosso cache inteligente vai tentar novamente de onde parou.</p>
        <button onClick={retryFetchImages} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
          <RefreshCw size={20} /> Tentar Novamente
        </button>
      </div>
    );
  }

  const getImageUrl = (nominee, isHovered) => {
    if (isHovered && nominee.backdrop_path) {
      return `https://image.tmdb.org/t/p/w780${nominee.backdrop_path}`;
    }
    const path = nominee.poster_path || nominee.profile_path;
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
  };

  const toggleEditMode = (categoryId) => {
    setEditMode(prev => ({ ...prev, [categoryId]: true }));
  };

  const onConfirm = async (categoryId) => {
    const success = await handleConfirmVote(categoryId);
    if (success) {
      setEditMode(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleInfoClick = (e, type, id) => {
    e.stopPropagation();
    if (typeof id === 'number') {
      navigate(`/app/${type === 'person' ? 'person' : 'movie'}/${id}`);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'person' ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 font-sans selection:bg-yellow-500/30">
      <div className="relative overflow-hidden bg-gradient-to-b from-yellow-900/20 via-zinc-950 to-zinc-950 pt-20 pb-20 px-4 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center text-center">
          <div className="bg-yellow-500/10 p-5 rounded-full mb-8 border border-yellow-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <Award className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-100 via-yellow-500 to-yellow-800 tracking-tighter mb-6 uppercase drop-shadow-sm">
            {isResultsPhase ? 'Os Vencedores' : 'CineSorte Oscar'}
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            {isResultsPhase 
              ? 'A cerimônia chegou ao fim. Confira as apostas que brilharam na temporada de premiações.'
              : 'O evento de maior prestígio do cinema. Assista, analise e registre seu palpite nas principais categorias.'}
          </p>
          <button 
            onClick={() => setShowInfoModal(true)} 
            className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-5 py-2.5 rounded-full transition-all border border-white/10 shadow-lg hover:shadow-white/5"
          >
            <Info size={16} /> Sobre a votação
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl space-y-32">
        {sortedCategories.map((category) => {
          const cineSorteWinnerId = isResultsPhase ? winners[category.id] : null;
          const isConfirmed = !!myVotes[category.id] && !editMode[category.id];
          const selectedId = selections[category.id];
          const hasSelection = !!selectedId;

          return (
            <div key={category.id} className="relative scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4 drop-shadow-md">
                    {category.title}
                    {isConfirmed && !isResultsPhase && (
                      <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 tracking-widest uppercase shadow-sm">
                        <Lock size={14} /> Confirmado
                      </span>
                    )}
                  </h2>
                  {!isConfirmed && !isResultsPhase && (
                    <p className="text-zinc-500 text-sm md:text-base mt-3 font-medium flex items-center gap-2">
                      <Sparkles size={16} className={hasSelection ? "text-yellow-500" : "text-zinc-600"} />
                      {hasSelection ? 'Ótima escolha. Confirme no botão dourado abaixo!' : 'Selecione a sua aposta para esta categoria.'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-8">
                {category.nomineesData.map((nominee) => {
                  const isSelected = selectedId == nominee.id;
                  const isCineSorteWinner = isResultsPhase && cineSorteWinnerId == nominee.id;
                  const isOfficialWinner = nominee.winnerOfficial === true;
                  const isBothWinner = isCineSorteWinner && isOfficialWinner;
                  const isAnyWinner = isCineSorteWinner || isOfficialWinner;
                  const isNotSelected = hasSelection && !isSelected;
                  const votesCount = results[category.id]?.[nominee.id] || 0;
                  const isDisabled = isConfirmed || isResultsPhase;

                  return (
                    <NomineeCard 
                      key={nominee.id}
                      nominee={nominee}
                      category={category}
                      isSelected={isSelected}
                      isNotSelected={isNotSelected}
                      isOfficialWinner={isOfficialWinner}
                      isCineSorteWinner={isCineSorteWinner}
                      isBothWinner={isBothWinner}
                      isAnyWinner={isAnyWinner}
                      votesCount={votesCount}
                      isDisabled={isDisabled}
                      isResultsPhase={isResultsPhase}
                      onSelect={() => !isDisabled && handleSelect(category.id, nominee.id)}
                      onInfoClick={(e) => handleInfoClick(e, category.type, nominee.id)}
                      getImageUrl={getImageUrl}
                    />
                  );
                })}
              </div>

              {!isResultsPhase && (
                <div className={`mt-8 flex justify-end transition-all duration-500 ${hasSelection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  {isConfirmed ? (
                    <button 
                      onClick={() => toggleEditMode(category.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-sm font-bold tracking-wider transition-colors border border-white/5"
                    >
                      <Edit3 size={18} /> Alterar Voto
                    </button>
                  ) : (
                    <button 
                      onClick={() => onConfirm(category.id)}
                      className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(250,204,21,0.3)]"
                    >
                      <span>Confirmar Aposta</span>
                      <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowInfoModal(false)}>
          <div className="bg-zinc-900 border border-yellow-500/20 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-yellow-500" size={24} />
              <h3 className="text-white font-bold text-lg">Aviso Importante</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Esta votação representa apenas a opinião e as apostas dos usuários da nossa plataforma. Os resultados apurados aqui não têm relação com a votação oficial da Academia.
            </p>
            <button onClick={() => setShowInfoModal(false)} className="mt-6 w-full bg-yellow-500 text-black font-bold py-2.5 rounded-xl hover:bg-yellow-400 transition-colors">
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NomineeCard = ({ nominee, category, isSelected, isNotSelected, isOfficialWinner, isCineSorteWinner, isBothWinner, isAnyWinner, votesCount, isDisabled, isResultsPhase, onSelect, onInfoClick, getImageUrl }) => {
  const [hovered, setHovered] = useState(false);
  const imageUrl = getImageUrl(nominee, hovered);

  let winnerRing = '';
  let badgeColor = '';
  
  if (isAnyWinner) {
    if (isBothWinner) {
      winnerRing = 'ring-4 ring-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.8)]';
      badgeColor = 'bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400';
    } else if (isOfficialWinner) {
      winnerRing = 'ring-4 ring-yellow-500 shadow-[0_0_50px_rgba(250,204,21,0.5)]';
      badgeColor = 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600';
    } else if (isCineSorteWinner) {
      winnerRing = 'ring-4 ring-amber-600 shadow-[0_0_50px_rgba(217,119,6,0.5)]';
      badgeColor = 'bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700';
    }
  }

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-500 flex flex-col cursor-pointer
        ${isSelected && !isResultsPhase ? 'ring-4 ring-yellow-400 scale-105 shadow-[0_15px_35px_rgba(250,204,21,0.2)] z-10' : ''}
        ${isNotSelected && !isAnyWinner && !isResultsPhase ? 'opacity-60 scale-[0.98] grayscale-[50%]' : ''}
        ${isResultsPhase && !isAnyWinner ? 'opacity-30 scale-[0.95] grayscale hover:grayscale-0' : ''}
        ${!isDisabled && !isSelected ? 'hover:scale-105 hover:shadow-2xl hover:shadow-black' : ''}
        ${isAnyWinner ? `${winnerRing} scale-[1.05] grayscale-0 opacity-100 z-20` : ''}
        bg-zinc-900 border border-white/5`}
    >
      <div className="aspect-[2/3] w-full relative bg-zinc-950/50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={nominee.title}
            className={`w-full h-full object-cover transition-all duration-700 ${hovered && nominee.backdrop_path ? 'scale-110 brightness-75' : 'scale-100'}`}
          />
        ) : (
          <div className="text-yellow-500/20 flex flex-col items-center gap-3">
            {category.type === 'person' ? <User size={64} strokeWidth={1} /> : <Film size={64} strokeWidth={1} />}
            <span className="text-[10px] font-black tracking-[0.2em] text-yellow-500/40 uppercase">Sem Pôster</span>
          </div>
        )}
        
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`}></div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 scale-90 group-hover:scale-100">
          {typeof nominee.id === 'number' && (
            <button 
              onClick={onInfoClick}
              className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-yellow-500 hover:text-black transition-all border border-white/20 shadow-2xl"
              title="Ver detalhes"
            >
              <Info size={28} />
            </button>
          )}
        </div>

        {isAnyWinner && (
          <div className={`absolute top-0 left-0 w-full ${badgeColor} text-black py-2 px-2 flex items-center justify-center gap-1.5 shadow-2xl z-20`}>
            <Trophy size={14} className="animate-pulse flex-shrink-0" />
            <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-center leading-tight">
              {isBothWinner ? 'Campeão Oscar e CineSorte' : isOfficialWinner ? 'Ganhador do Oscar 2026' : 'Vencedor CineSorte'}
            </span>
          </div>
        )}

        {isSelected && !isResultsPhase && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-black rounded-full p-1.5 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-20">
            <CheckCircle2 size={24} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 flex-1 flex flex-col justify-end relative z-20">
        <h3 className={`text-sm md:text-base font-bold line-clamp-2 leading-snug transition-colors ${isSelected || isAnyWinner ? 'text-yellow-400' : 'text-white'}`}>
          {nominee.title}
        </h3>
        {nominee.context ? (
          <p className="text-[11px] text-yellow-500 font-bold truncate mt-1.5 uppercase tracking-wider">{nominee.context}</p>
        ) : (
          nominee.originalName !== nominee.title && (
            <p className="text-[11px] text-zinc-500 truncate mt-1.5 uppercase tracking-wider">{nominee.originalName}</p>
          )
        )}
        
        {isResultsPhase && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/5 w-fit px-3 py-1 rounded-md border border-white/10">
            <span className="text-yellow-500 font-black">{votesCount}</span>
            <span className="text-zinc-400 text-[10px] uppercase tracking-widest">votos</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Oscars;