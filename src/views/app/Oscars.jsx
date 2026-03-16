import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOscarsLogic } from '../../hooks/useOscarsLogic';
import { Award, Trophy, CheckCircle2, Lock, User, Film, Info, Sparkles, ChevronRight, Edit3, RefreshCw, AlertTriangle, X, Star, Radio } from 'lucide-react';

const YOUTUBE_LIVE_ID = '01b6A5Aa66M';

const Oscars = () => {
  const navigate = useNavigate();
  const { categories, myVotes, selections, results, winners, loading, progress, handleSelect, handleConfirmVote, isResultsPhase, retryFetchImages } = useOscarsLogic();
  const [editMode, setEditMode] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLive, setShowLive] = useState(false);

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <Award className="w-20 h-20 text-yellow-500 mb-8 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-pulse" />
          <h2 className="text-white font-black text-2xl mb-6 tracking-[0.2em] uppercase">Estendendo o Tapete</h2>
          <div className="w-72 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.5)]" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-zinc-500 text-xs mt-4 font-bold tracking-[0.3em] uppercase">{progress}%</p>
        </div>
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-center">Limite da API atingido</h2>
        <p className="text-zinc-400 mb-6 text-center max-w-md text-sm">O cache inteligente vai retomar de onde parou.</p>
        <button onClick={retryFetchImages} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
          <RefreshCw size={18} /> Tentar Novamente
        </button>
      </div>
    );
  }

  const toggleEditMode = (categoryId) => setEditMode(prev => ({ ...prev, [categoryId]: true }));

  const onConfirm = async (categoryId) => {
    const success = await handleConfirmVote(categoryId);
    if (success) setEditMode(prev => ({ ...prev, [categoryId]: false }));
  };

  const handleInfoClick = (e, type, id) => {
    e.stopPropagation();
    if (typeof id === 'number') navigate(`/app/${type === 'person' ? 'person' : 'movie'}/${id}`);
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'person' ? -1 : 1;
  });

  const totalVoted = Object.keys(myVotes).filter(k => k !== 'updatedAt').length;
  const totalCategories = categories.length;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 selection:bg-yellow-500/30">

      <div className="relative overflow-hidden bg-gradient-to-b from-yellow-900/20 via-zinc-950 to-zinc-950 pt-16 pb-16 px-4 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-yellow-500/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="container mx-auto max-w-5xl relative z-10 flex flex-col items-center text-center">
          <div className="bg-yellow-500/10 p-4 rounded-full mb-6 border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
            <Award className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-700 tracking-tighter mb-4 uppercase leading-none pb-2">
            {isResultsPhase ? 'Os Vencedores' : 'Oscar 2026'}
          </h1>
          <p className="text-zinc-500 text-base max-w-xl leading-relaxed mb-6">
            {isResultsPhase
              ? 'A cerimônia chegou ao fim. Confira as apostas da comunidade.'
              : 'Registre suas apostas nas principais categorias do Oscar.'}
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-4 py-2 rounded-full transition-all border border-white/10"
            >
              <Info size={14} /> Sobre a votação
            </button>
            {YOUTUBE_LIVE_ID && (
              <button
                onClick={() => setShowLive(!showLive)}
                className="flex items-center gap-2 text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-full transition-all border border-red-500/30 animate-pulse"
              >
                <Radio size={14} /> Assistir ao vivo
              </button>
            )}
          </div>

          {YOUTUBE_LIVE_ID && showLive && (
            <div className="mt-6 w-full max-w-2xl rounded-2xl overflow-hidden border border-yellow-500/20 shadow-2xl">
              <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Ao Vivo</span>
                </div>
                <button onClick={() => setShowLive(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_LIVE_ID}?autoplay=1&origin=${window.location.origin}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {!isResultsPhase && totalCategories > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span><b className="text-white font-black">{totalVoted}</b> de <b className="text-white font-black">{totalCategories}</b> categorias votadas</span>
              </div>
              <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                  style={{ width: `${totalCategories > 0 ? (totalVoted / totalCategories) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl space-y-28">
        {sortedCategories.map((category) => {
          const cineSorteWinnerId = isResultsPhase ? winners[category.id] : null;
          const isConfirmed = !!myVotes[category.id] && !editMode[category.id];
          const selectedId = selections[category.id];
          const userVotedId = myVotes[category.id];
          const hasSelection = !!selectedId;

          return (
            <div key={category.id} className="relative scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap">
                    {category.title}
                    {isConfirmed && !isResultsPhase && (
                      <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 tracking-widest uppercase">
                        <Lock size={12} /> Confirmado
                      </span>
                    )}
                  </h2>
                  {!isConfirmed && !isResultsPhase && (
                    <p className="text-zinc-600 text-sm mt-2 flex items-center gap-2">
                      <Sparkles size={14} className={hasSelection ? "text-yellow-500" : "text-zinc-700"} />
                      {hasSelection ? 'Confirme no botão abaixo!' : 'Selecione sua aposta.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {category.nomineesData.map((nominee) => {
                  const isSelected = selectedId == nominee.id;
                  const isUserVoted = userVotedId == nominee.id;
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
                      isUserVoted={isUserVoted}
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
                    />
                  );
                })}
              </div>

              {!isResultsPhase && (
                <div className={`mt-6 flex justify-end transition-all duration-500 ${hasSelection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  {isConfirmed ? (
                    <button
                      onClick={() => toggleEditMode(category.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-sm font-bold transition-colors border border-white/5"
                    >
                      <Edit3 size={16} /> Alterar Voto
                    </button>
                  ) : (
                    <button
                      onClick={() => onConfirm(category.id)}
                      className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_8px_25px_rgba(250,204,21,0.25)]"
                    >
                      Confirmar Aposta
                      <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
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
            <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-yellow-500 shrink-0" size={20} />
              <h3 className="text-white font-bold">Aviso Importante</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Esta votação representa apenas a opinião dos usuários da nossa plataforma. Os resultados não têm relação com a votação oficial da Academia.
            </p>
            <button onClick={() => setShowInfoModal(false)} className="mt-5 w-full bg-yellow-500 text-black font-bold py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm">
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NomineeCard = ({ nominee, category, isSelected, isUserVoted, isNotSelected, isOfficialWinner, isCineSorteWinner, isBothWinner, isAnyWinner, votesCount, isDisabled, isResultsPhase, onSelect, onInfoClick }) => {
  const [hovered, setHovered] = useState(false);

  const getImageUrl = () => {
    if (hovered && nominee.backdrop_path) return `https://image.tmdb.org/t/p/w780${nominee.backdrop_path}`;
    const path = nominee.poster_path || nominee.profile_path;
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
  };

  const imageUrl = getImageUrl();

  let winnerRing = '';
  let badgeGradient = '';

  if (isAnyWinner) {
    if (isBothWinner) {
      winnerRing = 'ring-4 ring-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.6)]';
      badgeGradient = 'from-yellow-400 via-yellow-200 to-yellow-400';
    } else if (isOfficialWinner) {
      winnerRing = 'ring-4 ring-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.4)]';
      badgeGradient = 'from-yellow-600 via-yellow-400 to-yellow-600';
    } else if (isCineSorteWinner) {
      winnerRing = 'ring-4 ring-amber-600 shadow-[0_0_40px_rgba(217,119,6,0.4)]';
      badgeGradient = 'from-amber-700 via-amber-500 to-amber-700';
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-500 flex flex-col cursor-pointer bg-zinc-900 border border-white/5
        ${isSelected && !isResultsPhase ? 'ring-4 ring-yellow-400 scale-[1.04] shadow-[0_12px_30px_rgba(250,204,21,0.2)] z-10' : ''}
        ${isNotSelected && !isAnyWinner && !isResultsPhase ? 'opacity-50 scale-[0.97] grayscale-[60%]' : ''}
        ${isResultsPhase && !isAnyWinner ? 'opacity-25 scale-[0.95] grayscale hover:opacity-60 hover:grayscale-0' : ''}
        ${!isDisabled && !isSelected ? 'hover:scale-[1.04] hover:shadow-2xl hover:border-white/15' : ''}
        ${isAnyWinner ? `${winnerRing} scale-[1.04] opacity-100 z-20` : ''}
      `}
    >
      <div className="aspect-[2/3] w-full relative bg-zinc-950/50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nominee.title}
            className={`w-full h-full object-cover transition-all duration-700 ${hovered && nominee.backdrop_path ? 'scale-110 brightness-70' : 'scale-100'}`}
          />
        ) : (
          <div className="text-yellow-500/20 flex flex-col items-center gap-2">
            {category.type === 'person' ? <User size={48} strokeWidth={1} /> : <Film size={48} strokeWidth={1} />}
            <span className="text-[9px] font-black tracking-widest text-yellow-500/30 uppercase">Sem Pôster</span>
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`} />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 scale-90 group-hover:scale-100">
          {typeof nominee.id === 'number' && (
            <button
              onClick={onInfoClick}
              className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-yellow-500 hover:text-black transition-all border border-white/20 shadow-xl"
            >
              <Info size={22} />
            </button>
          )}
        </div>

        {isAnyWinner && (
          <div className={`absolute top-0 left-0 w-full bg-gradient-to-r ${badgeGradient} text-black py-1.5 px-2 flex items-center justify-center gap-1 z-20`}>
            <Trophy size={12} className="animate-pulse shrink-0" />
            <span className="font-black text-[9px] uppercase tracking-widest text-center leading-tight">
              {isBothWinner ? 'Oscar + CineSorte' : isOfficialWinner ? 'Ganhador Oscar 2026' : 'Vencedor CineSorte'}
            </span>
          </div>
        )}

        {isSelected && !isResultsPhase && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-black rounded-full p-1 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-20">
            <CheckCircle2 size={20} strokeWidth={3} />
          </div>
        )}

        {isResultsPhase && isUserVoted && !isAnyWinner && (
          <div className="absolute top-3 right-3 bg-zinc-700 text-zinc-300 rounded-full p-1 z-20 border border-zinc-600" title="Sua aposta">
            <Star size={14} strokeWidth={2.5} className="fill-zinc-300" />
          </div>
        )}

        {isResultsPhase && isUserVoted && isAnyWinner && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-black rounded-full p-1 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-30" title="Sua aposta acertou!">
            <Star size={14} strokeWidth={2.5} className="fill-black" />
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 flex-1 flex flex-col justify-end relative z-20">
        <h3 className={`text-sm font-bold line-clamp-2 leading-snug transition-colors ${isSelected || isAnyWinner ? 'text-yellow-400' : 'text-white'}`}>
          {nominee.title}
        </h3>
        {nominee.context ? (
          <p className="text-[10px] text-yellow-600 font-bold truncate mt-1 uppercase tracking-wider">{nominee.context}</p>
        ) : (
          nominee.originalName !== nominee.title && (
            <p className="text-[10px] text-zinc-600 truncate mt-1">{nominee.originalName}</p>
          )
        )}

        {isResultsPhase && (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
              <span className="text-yellow-500 font-black text-sm">{votesCount}</span>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider">votos</span>
            </div>
            {isUserVoted && (
              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                <Star size={10} className="fill-zinc-500" /> sua aposta
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Oscars;