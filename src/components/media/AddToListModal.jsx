import { useState } from "react";
import { Plus, List, Check, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function AddToListModal({
  isOpen,
  onClose,
  lists,
  onAdd,
  onCreate,
  mediaId,
  addingToListId
}) {
  const [view, setView] = useState("select");
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (newListName.trim()) {
      setIsCreating(true);
      await onCreate(newListName);
      setNewListName("");
      setIsCreating(false);
      setView("select");
    }
  };

  const isMediaInList = (list) => {
    return list.items?.some(item => item.id.toString() === mediaId?.toString());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
          onClose();
          setView("select");
          setNewListName("");
      }}
      title={view === "select" ? "Adicionar à Coleção" : "Nova Coleção"}
    >
      {view === "select" ? (
        <div className="space-y-5">
          {lists && lists.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {lists.map((list) => {
                const alreadyInList = isMediaInList(list);
                const isThisLoading = addingToListId === list.id;

                return (
                  <button
                    key={list.id}
                    onClick={() => !alreadyInList && !isThisLoading && onAdd(list.id)}
                    disabled={alreadyInList || isThisLoading}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group text-left border ${
                      alreadyInList 
                        ? 'bg-green-500/10 border-green-500/30 cursor-default' 
                        : 'bg-white/[0.02] border-white/5 hover:border-violet-500/50 hover:bg-white/[0.04] shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold text-base transition-colors ${alreadyInList ? 'text-green-400' : 'text-white group-hover:text-violet-400'}`}>
                        {list.name}
                      </span>
                      <span className={`text-xs font-medium uppercase tracking-wider ${alreadyInList ? 'text-green-500/70' : 'text-zinc-500'}`}>
                        {list.items?.length || 0} {list.items?.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    
                    {isThisLoading ? (
                      <Loader2 size={20} className="text-violet-500 animate-spin" />
                    ) : alreadyInList ? (
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                        <Check size={16} className="text-green-400" />
                      </div>
                    ) : (
                      <div className="bg-white/5 p-1.5 rounded-full group-hover:bg-violet-500/20 transition-colors">
                        <Plus size={16} className="text-zinc-400 group-hover:text-violet-400 transition-colors" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="h-8 w-8 text-zinc-500" />
              </div>
              <p className="text-zinc-400 font-medium">Você ainda não tem coleções.</p>
            </div>
          )}

          <button
            onClick={() => setView("create")}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-white/20 shadow-lg active:scale-95 uppercase tracking-wider text-sm"
          >
            <Plus size={18} /> Criar Nova Coleção
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Nome da Coleção
            </label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ex: Filmes Favoritos, Para Assistir..."
              className="w-full bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-600 shadow-inner"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setView("select")}
              className="flex-1 py-4 bg-white/5 text-zinc-300 rounded-2xl font-bold hover:bg-white/10 hover:text-white transition-colors text-sm uppercase tracking-wider border border-white/5"
            >
              Voltar
            </button>
            <button
              onClick={handleCreate}
              disabled={!newListName.trim() || isCreating}
              className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Criar Coleção'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}