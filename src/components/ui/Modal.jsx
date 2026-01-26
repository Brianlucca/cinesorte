import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
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
    video: 'max-w-5xl aspect-video bg-black',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      <div className={`relative w-full ${sizes[size]} bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        
        {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/50">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        )}

        {!title && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors backdrop-blur-md"
            >
                <X size={20} />
            </button>
        )}

        <div className={`overflow-y-auto ${size === 'video' ? 'h-full p-0' : 'p-6'}`}>
            {children}
        </div>
      </div>
    </div>
  );
}