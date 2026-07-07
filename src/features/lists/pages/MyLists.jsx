import { useMyListsLogic } from '@features/lists/hooks/useMyListsLogic';
import ListsHeader from '@features/lists/components/ListsHeader';
import EmptyListsState from '@features/lists/components/EmptyListsState';
import ListGroup from '@features/lists/components/ListGroup';
import Modal from '@shared/components/ui/Modal';
import { AlertTriangle, CheckSquare, Trash2, X } from 'lucide-react';

export default function MyLists() {
  const { lists, loading, modals, selection, actions } = useMyListsLogic();

  if (loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#08080b] animate-in fade-in duration-500">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Organizando suas listas</p>
    </div>
  );

  const listBeingDeleted = lists.find((list) => list.id === modals.deleteList.listId);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080b] pb-24 animate-in fade-in duration-500">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(91,33,182,0.09),transparent_28%),radial-gradient(circle_at_88%_48%,rgba(8,145,178,0.035),transparent_24%)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-10 xl:px-14">
      
      {selection.isActive && (
        <div className="sticky top-4 z-[100] mb-6 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-red-400/20 bg-[#201014]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl animate-in slide-in-from-top-3 duration-300 sm:flex-row sm:items-center md:px-5">
            <div className="flex items-center gap-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/15 bg-red-500/10 text-red-400">
                    <CheckSquare size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white">Gerenciar itens</h3>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300/70">
                        {selection.items.length} {selection.items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                    </p>
                </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
                <button 
                    onClick={selection.cancel}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white sm:flex-none"
                >
                    <X size={14} /> Cancelar
                </button>
                <button 
                    onClick={actions.promptDeleteSelected}
                    disabled={selection.items.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-35 sm:flex-none"
                >
                    <Trash2 size={14} />
                    Remover
                </button>
            </div>
        </div>
      )}

      <ListsHeader lists={lists} onCreate={actions.openCreateModal} />

      {lists.length === 0 ? (
        <EmptyListsState onCreate={actions.openCreateModal} />
      ) : (
        <div className="mt-7 space-y-6 md:mt-8 md:space-y-8">
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
                <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Nome da lista</label>
                <input 
                    type="text" 
                    value={modals.createList.listName}
                    onChange={(e) => actions.updateModalState('createList', 'listName', e.target.value)}
                    placeholder="Ex.: Favoritos, Quero assistir..."
                    className="w-full rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm font-medium text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035]"
                    autoFocus
                />
            </div>

            <div>
                <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Descrição <span className="normal-case tracking-normal text-zinc-700">(opcional)</span></label>
                <textarea
                    value={modals.createList.description}
                    onChange={(e) => actions.updateModalState('createList', 'description', e.target.value)}
                    placeholder="Conte um pouco sobre esta seleção..."
                    rows={3}
                    maxLength={240}
                    className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035]"
                />
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">Cancelar</button>
                <button onClick={actions.handleCreateList} className="rounded-xl bg-white px-6 py-3 text-xs font-black text-black transition-colors hover:bg-violet-100">
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
                <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Nome da lista</label>
                <input 
                    type="text" 
                    value={modals.editList.listName}
                    onChange={(e) => actions.updateModalState('editList', 'listName', e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm font-medium text-white outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.035]"
                />
            </div>

            <div>
                <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Descrição <span className="normal-case tracking-normal text-zinc-700">(opcional)</span></label>
                <textarea
                    value={modals.editList.description}
                    onChange={(e) => actions.updateModalState('editList', 'description', e.target.value)}
                    rows={3}
                    maxLength={240}
                    className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm leading-6 text-white outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.035]"
                />
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">Cancelar</button>
                <button onClick={actions.handleEditList} className="rounded-xl bg-white px-6 py-3 text-xs font-black text-black transition-colors hover:bg-violet-100">
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
                        Tem certeza que deseja apagar a lista <strong className="mx-1 font-black text-white">“{listBeingDeleted?.name || 'selecionada'}”</strong>?
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
    </main>
  );
}
