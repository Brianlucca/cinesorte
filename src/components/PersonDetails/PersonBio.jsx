import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PersonBio = ({ biography }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!biography) return null;

  const isLong = biography.length > 600;
  const displayBio = isExpanded ? biography : biography.slice(0, 600) + (isLong ? '...' : '');

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
         <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
         Biografia
      </h2>
      <div className="relative overflow-hidden">
        <p className="text-zinc-300 leading-relaxed text-lg text-justify whitespace-pre-line font-light">
          {displayBio}
        </p>
        
        {isLong && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-6 flex items-center gap-2 text-violet-400 font-bold hover:text-violet-300 transition-colors text-xs uppercase tracking-widest"
            >
                {isExpanded ? (
                    <>Ler menos <ChevronUp size={16} /></>
                ) : (
                    <>Ler biografia completa <ChevronDown size={16} /></>
                )}
            </button>
        )}
      </div>
    </div>
  );
};

export default PersonBio;