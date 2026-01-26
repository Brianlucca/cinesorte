import { useMyListsLogic } from '../../hooks/useMyListsLogic';
import ListsHeader from '../../components/lists/ListsHeader';
import EmptyListsState from '../../components/lists/EmptyListsState';
import ListGroup from '../../components/lists/ListGroup';
import Modal from '../../components/ui/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function MyLists() {
  const { lists, loading, modals, selection, actions } = useMyListsLogic();

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500">Organizando sua coleção...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-8 pb-20 relative">
      
      {selection.isActive && (
        <div className="sticky top-6 z-[100] bg-red-950/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-2xl mb-8 gap-4 ring-1 ring-red-500/20 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
                <div className="bg-red-500 p-2.5 rounded-xl text-white shadow-lg shadow-red-900/40">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">Modo de Exclusão</h3>
                    <p className="text-red-200/70 text-sm font-medium">
                        {selection.items.length} {selection.items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                    </p>
                </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                    onClick={selection.cancel}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-red-200 hover:text-white hover:bg-red-900/50 transition-colors border border-transparent hover:border-red-500/30"
                >
                    Cancelar
                </button>
                <button 
                    onClick={actions.promptDeleteSelected}
                    disabled={selection.items.length === 0}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
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
        <div className="space-y-12">
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
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Nome da Lista</label>
                <input 
                    type="text" 
                    value={modals.createList.listName}
                    onChange={(e) => actions.updateModalState('createList', 'listName', e.target.value)}
                    placeholder="Ex: Favoritos, Para Assistir..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    autoFocus
                />
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <button onClick={actions.closeModals} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors font-medium">Cancelar</button>
                <button onClick={actions.handleCreateList} className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95">
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
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Nome da Lista</label>
                <input 
                    type="text" 
                    value={modals.editList.listName}
                    onChange={(e) => actions.updateModalState('editList', 'listName', e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                />
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <button onClick={actions.closeModals} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors font-medium">Cancelar</button>
                <button onClick={actions.handleEditList} className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95">
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
        <div className="space-y-4">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-full text-red-500 shrink-0 border border-red-500/20">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-zinc-300 leading-relaxed">
                        Tem certeza que deseja apagar a lista <strong className="text-white capitalize px-1.5 py-0.5 bg-zinc-800 rounded">{modals.deleteList.listId}</strong>?
                        <br/><br/>
                        Isso removerá permanentemente esta categoria e todos os itens vinculados a ela.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={actions.closeModals} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                <button onClick={actions.confirmDeleteList} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95">
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
        <div className="space-y-4">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-full text-red-500 shrink-0 border border-red-500/20">
                    <Trash2 size={24} />
                </div>
                <div>
                    <p className="text-zinc-300 leading-relaxed">
                        Você está prestes a remover <strong className="text-white text-lg">{selection.items.length}</strong> itens de suas coleções.
                    </p>
                    <p className="text-sm text-red-400 mt-2 font-medium bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                        Esta ação não pode ser desfeita.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={actions.closeModals} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                <button onClick={actions.confirmDeleteSelected} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95">
                    Remover Itens
                </button>
            </div>
        </div>
      </Modal>

    </div>
  );
}