import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, X, Star } from 'lucide-react';

export default function ToastGamification({ activeLevel, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (activeLevel) {
      setVisible(true);
      const timer = setTimeout(() => handleClose(), 5000); 
      return () => clearTimeout(timer);
    }
  }, [activeLevel]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!activeLevel) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100000] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={handleClose} />
      
      <div className={`relative bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700 p-[2px] rounded-3xl shadow-2xl pointer-events-auto transform transition-all duration-500 ${visible ? 'scale-100 translate-y-0' : 'scale-50 translate-y-10'}`}>
        <div className="bg-zinc-950 rounded-[22px] p-8 text-center w-80 md:w-96 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
          
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-40 animate-pulse"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-inner ring-4 ring-yellow-500/30">
                <Trophy size={48} className="text-white drop-shadow-md" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Star className="text-yellow-200 fill-yellow-200 animate-bounce" size={24} />
              </div>
            </div>

            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 uppercase tracking-wide mb-2">
              Level Up!
            </h2>
            
            <p className="text-zinc-300 text-lg mb-6">
              Você alcançou um novo patamar de conhecimento cinematográfico.
            </p>

            <div className="bg-white/10 border border-white/10 rounded-xl py-3 px-6 w-full">
              <span className="text-sm text-zinc-400 uppercase font-bold tracking-widest block mb-1">Novo Nível</span>
              <span className="text-2xl font-bold text-white">{activeLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}