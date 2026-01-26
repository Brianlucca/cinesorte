import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PersonBio = ({ biography }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!biography) return null;

  const isLong = biography.length > 600;
  const displayBio = isExpanded ? biography : biography.slice(0, 600) + (isLong ? '...' : '');

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
         <div className="w-1 h-8 bg-violet-600 rounded-full"></div>
         Biografia
      </h2>
      <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <p className="text-zinc-300 leading-8 text-lg text-justify whitespace-pre-line font-light">
          {displayBio}
        </p>
        
        {isLong && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-6 flex items-center gap-2 text-violet-400 font-bold hover:text-violet-300 transition-colors text-sm uppercase tracking-widest"
            >
                {isExpanded ? (
                    <>Ler menos <ChevronUp size={16} /></>
                ) : (
                    <>Ler biografia completa <ChevronDown size={16} /></>
                )}
            </button>
        )}
      </div>
    </section>
  );
};

export default PersonBio;