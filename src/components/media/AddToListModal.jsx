import { useState } from "react";
import { Plus, List, Check, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function AddToListModal({
  isOpen,
  onClose,
  lists,
  onAdd,
  onCreate,
  mediaId, // Certifique-se de passar o id da mídia atual aqui
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
        <div className="space-y-4">
          {lists && lists.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {lists.map((list) => {
                const alreadyInList = isMediaInList(list);
                const isThisLoading = addingToListId === list.id;

                return (
                  <button
                    key={list.id}
                    onClick={() => !alreadyInList && !isThisLoading && onAdd(list.id)}
                    disabled={alreadyInList || isThisLoading}
                    className={`w-full flex items-center justify-between p-4 bg-zinc-900 border rounded-xl transition-all group text-left ${
                      alreadyInList 
                        ? 'border-green-500/30 cursor-default opacity-80' 
                        : 'border-white/5 hover:border-violet-500/50 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-bold text-base ${alreadyInList ? 'text-green-400' : 'text-white'}`}>
                        {list.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {list.items?.length || 0} itens
                      </span>
                    </div>
                    
                    {isThisLoading ? (
                      <Loader2 size={20} className="text-violet-500 animate-spin" />
                    ) : alreadyInList ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Plus size={20} className="text-zinc-600 group-hover:text-violet-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-dashed border-white/10">
              <List className="mx-auto h-10 w-10 text-zinc-600 mb-2" />
              <p className="text-zinc-400 font-medium">Você ainda não tem listas.</p>
            </div>
          )}

          <button
            onClick={() => setView("create")}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-900/20 active:scale-95"
          >
            <Plus size={18} /> Criar Nova Lista
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              Nome da Lista
            </label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ex: Filmes Favoritos, Para Assistir..."
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-600"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setView("select")}
              className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleCreate}
              disabled={!newListName.trim() || isCreating}
              className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Criar'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}