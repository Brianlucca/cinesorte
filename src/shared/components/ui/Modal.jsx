import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', appearance = 'default' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    video: 'max-w-5xl aspect-video bg-black',
  };
  const isFrameless = size === 'xl' && !title;
  const isCinematic = appearance === 'cinematic';

  return (
    <div className="fixed inset-0 z-[100100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 w-screen h-screen"
        onClick={onClose}
      ></div>

      <div
        className={`relative w-full ${sizes[size]} animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${
          isFrameless
            ? 'overflow-visible bg-transparent shadow-none'
            : isCinematic
              ? 'overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] shadow-[0_24px_80px_rgba(0,0,0,0.5)]'
              : 'overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl'
        }`}
      >
        
        {title && (
            <div className={`flex items-center justify-between border-b px-5 py-4 ${isCinematic ? 'border-white/[0.06] bg-white/[0.012]' : 'border-white/5 bg-zinc-900/50'}`}>
                <h3 className={`${isCinematic ? 'text-lg font-semibold tracking-[-0.02em]' : 'text-xl font-bold'} text-white`}>{title}</h3>
                <button 
                    onClick={onClose}
                    className={`${isCinematic ? 'grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018]' : 'rounded-full p-2'} text-zinc-400 transition-colors hover:bg-white/10 hover:text-white`}
                >
                    <X size={20} />
                </button>
            </div>
        )}

        {!title && (
            <button 
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-[80] rounded-full bg-black/60 p-2 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white hover:text-black"
            >
                <X size={20} />
            </button>
        )}

        <div className={`overflow-y-auto ${size === 'video' || isFrameless ? 'h-full p-0' : isCinematic ? 'p-5' : 'p-6'}`}>
            {children}
        </div>
      </div>
    </div>
  );
}
