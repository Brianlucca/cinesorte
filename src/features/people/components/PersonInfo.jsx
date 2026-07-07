import React from 'react';
import { User, MapPin, Globe, Calendar, Instagram, Twitter, Facebook } from 'lucide-react';

const PersonInfo = ({ details }) => {
  const profileImage = details.profile_path
    ? `https://image.tmdb.org/t/p/w780${details.profile_path}`
    : null;

  const calculateAge = (birthday, deathday) => {
    if (!birthday) return null;
    const start = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    const diff = end - start;
    return Math.floor(diff / 31557600000);
  };

  const age = calculateAge(details.birthday, details.deathday);
  const social = details.external_ids || {};

  return (
    <div className="space-y-8">
      <div className="rounded-3xl overflow-hidden shadow-2xl relative group border border-white/5 bg-zinc-900/50">
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={details.name}
            className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
            <div className="w-full aspect-[2/3] bg-zinc-800/50 flex items-center justify-center">
                <User size={64} className="text-zinc-600" />
            </div>
        )}
        
        {(social.instagram_id || social.twitter_id || social.facebook_id || social.imdb_id) && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-xl rounded-2xl p-3 border border-white/10 flex justify-center gap-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                {social.instagram_id && (
                    <a href={`https://instagram.com/${social.instagram_id}`} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                )}
                {social.twitter_id && (
                    <a href={`https://twitter.com/${social.twitter_id}`} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
                )}
                {social.facebook_id && (
                    <a href={`https://facebook.com/${social.facebook_id}`} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
                )}
                {social.imdb_id && (
                    <a href={`https://www.imdb.com/name/${social.imdb_id}`} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-yellow-500 font-black text-xs flex items-center transition-colors tracking-wider">IMDb</a>
                )}
            </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-white text-sm uppercase tracking-widest text-zinc-400 mb-6">
            Informações Pessoais
        </h3>
        
        <div className="space-y-4">
            <InfoItem icon={User} label="Gênero" value={details.gender === 1 ? 'Feminino' : details.gender === 2 ? 'Masculino' : 'Outro'} />
            
            {details.birthday && (
                <InfoItem 
                    icon={Calendar} 
                    label="Nascimento" 
                    value={`${new Date(details.birthday).toLocaleDateString('pt-BR')} ${!details.deathday ? `(${age} anos)` : ''}`} 
                />
            )}

            {details.deathday && (
                <InfoItem 
                    icon={Calendar} 
                    label="Falecimento" 
                    value={`${new Date(details.deathday).toLocaleDateString('pt-BR')} (aos ${age} anos)`} 
                    highlight 
                />
            )}

            {details.place_of_birth && (
                <InfoItem icon={MapPin} label="Local" value={details.place_of_birth} />
            )}

            {details.homepage && (
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex gap-2 items-center"><Globe size={14} /> Website</span>
                    <a href={details.homepage} target="_blank" rel="noreferrer" className="text-violet-400 text-sm hover:text-violet-300 transition-colors font-medium">Visitar</a>
                </div>
            )}
        </div>

        {details.also_known_as?.length > 0 && (
          <div className="pt-6">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3 block">Também conhecido como</span>
            <div className="flex flex-wrap gap-2">
                {details.also_known_as.slice(0, 4).map((alias, index) => (
                    <span key={index} className="text-xs font-medium bg-white/5 text-zinc-300 px-3 py-1.5 rounded-lg border border-white/5">
                        {alias}
                    </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, highlight }) => (
    <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex gap-2 items-center">
            {React.createElement(icon, { size: 14 })} {label}
        </span>
        <span className={`text-sm font-medium text-right max-w-[60%] ${highlight ? 'text-red-400' : 'text-white'}`}>
            {value}
        </span>
    </div>
);

export default PersonInfo;
