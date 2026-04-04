import { useMyListsLogic } from '../../hooks/useMyListsLogic';
import ListsHeader from '../../components/lists/ListsHeader';
import EmptyListsState from '../../components/lists/EmptyListsState';
import ListGroup from '../../components/lists/ListGroup';
import Modal from '../../components/ui/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function MyLists() {
  const { lists, loading, modals, selection, actions } = useMyListsLogic();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-6 animate-in fade-in duration-700">
        <div className="w-14 h-14 border-4 border-violet-600/20 border-t-violet-500 rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Organizando sua coleção...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-10 pb-24 relative animate-in fade-in duration-700">
      
      {selection.isActive && (
        <div className="sticky top-6 z-[100] bg-red-950/80 backdrop-blur-2xl border border-red-500/20 rounded-[2.5rem] p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between shadow-[0_30px_60px_rgba(220,38,38,0.2)] mb-12 gap-5 ring-1 ring-red-500/10 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
                <div className="bg-red-500/10 p-4 rounded-2xl text-red-500 border border-red-500/20 shadow-inner">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h3 className="text-white font-black text-xl tracking-tighter uppercase">Modo de Exclusão</h3>
                    <p className="text-red-400/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                        {selection.items.length} {selection.items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                    </p>
                </div>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
                <button 
                    onClick={selection.cancel}
                    className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-300 hover:text-white hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
                >
                    Cancelar
                </button>
                <button 
                    onClick={actions.promptDeleteSelected}
                    disabled={selection.items.length === 0}
                    className="flex-1 sm:flex-none px-8 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <Trash2 size={18} />
                    Excluir Selecionados
                </button>
            </div>
        </div>
      )}

      <ListsHeader lists={lists} onCreate={actions.openCreateModal} />

      {lists.length === 0 ? (
        <EmptyListsState />
      ) : (
        <div className="space-y-12 mt-8">
            {lists.map((list, index) => (
                <ListGroup 
                    key={list.id} 
                    list={list} 
                    index={index}
                    selection={selection}
                    onDeleteList={actions.promptDeleteList}
                    onEditList={actions.openEditModal}
                    onShareList={actions.handleShareList}
                    onManageItems={selection.startManaging}
                />
            ))}
        </div>
      )}

      <Modal 
        isOpen={modals.createList.isOpen} 
        onClose={actions.closeModals} 
        title="Nova Coleção" 
      >
        <div className="space-y-6 pt-2">
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Nome da Lista</label>
                <input 
                    type="text" 
                    value={modals.createList.listName}
                    onChange={(e) => actions.updateModalState('createList', 'listName', e.target.value)}
                    placeholder="Ex: Favoritos, Para Assistir..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:border-violet-500/50 focus:bg-white/[0.05] transition-all outline-none shadow-inner placeholder:text-zinc-600"
                    autoFocus
                />
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">Cancelar</button>
                <button onClick={actions.handleCreateList} className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95">
                    Criar Lista
                </button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modals.editList.isOpen} 
        onClose={actions.closeModals} 
        title="Editar Coleção" 
      >
        <div className="space-y-6 pt-2">
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Nome da Lista</label>
                <input 
                    type="text" 
                    value={modals.editList.listName}
                    onChange={(e) => actions.updateModalState('editList', 'listName', e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:border-violet-500/50 focus:bg-white/[0.05] transition-all outline-none shadow-inner"
                />
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">Cancelar</button>
                <button onClick={actions.handleEditList} className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95">
                    Salvar Alterações
                </button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modals.deleteList.isOpen} 
        onClose={actions.closeModals} 
        title="Excluir Lista" 
        type="danger"
      >
        <div className="space-y-6 pt-2">
            <div className="flex items-start gap-5">
                <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 shrink-0 border border-red-500/20 shadow-inner">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                        Tem certeza que deseja apagar a lista <strong className="text-white font-black uppercase tracking-wider px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 mx-1">{modals.deleteList.listId}</strong>?
                        <br/><br/>
                        Isso removerá permanentemente esta categoria e todos os itens vinculados a ela.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">Cancelar</button>
                <button onClick={actions.confirmDeleteList} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-95">
                    Confirmar Exclusão
                </button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modals.deleteSelected.isOpen} 
        onClose={actions.closeModals} 
        title="Excluir Itens"
        type="danger"
      >
        <div className="space-y-6 pt-2">
            <div className="flex items-start gap-5">
                <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 shrink-0 border border-red-500/20 shadow-inner">
                    <Trash2 size={24} />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                        Você está prestes a remover <strong className="text-white font-black text-lg mx-1">{selection.items.length}</strong> itens de suas coleções.
                    </p>
                    <p className="text-xs text-red-400 mt-4 font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20 inline-block">
                        Esta ação não pode ser desfeita.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">Cancelar</button>
                <button onClick={actions.confirmDeleteSelected} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-95">
                    Remover Itens
                </button>
            </div>
        </div>
      </Modal>

    </div>
  );
}