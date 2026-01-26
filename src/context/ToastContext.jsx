import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, title, description }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (title, description) => addToast({ type: 'success', title, description }),
    error: (title, description) => addToast({ type: 'error', title, description }),
    info: (title, description) => addToast({ type: 'info', title, description }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />
  };

  const borders = {
    success: 'border-green-500/20 bg-green-500/10',
    error: 'border-red-500/20 bg-red-500/10',
    info: 'border-blue-500/20 bg-blue-500/10'
  };

  return (
    <div 
        className={`pointer-events-auto w-full max-w-sm bg-zinc-900 border ${borders[toast.type]} backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-10 fade-in duration-300`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-sm">{toast.title}</h4>
        {toast.description && <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{toast.description}</p>}
      </div>
      <button 
        onClick={() => onRemove(toast.id)} 
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);