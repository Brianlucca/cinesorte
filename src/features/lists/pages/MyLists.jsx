import { useMyListsLogic } from '@features/lists/hooks/useMyListsLogic';
import ListsHeader from '@features/lists/components/ListsHeader';
import EmptyListsState from '@features/lists/components/EmptyListsState';
import ListGroup from '@features/lists/components/ListGroup';
import Modal from '@shared/components/ui/Modal';
import { AlertTriangle, CheckSquare, Trash2, X } from 'lucide-react';

export default function MyLists() {
  const { lists, loading, modals, selection, actions } = useMyListsLogic();

  if (loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#111216] animate-in fade-in duration-500">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Organizando suas listas</p>
    </div>
  );

  const listBeingDeleted = lists.find((list) => list.id === modals.deleteList.listId);

  return (
    <main className="relative min-h-screen bg-[#111216] pb-24 animate-in fade-in duration-500">
      <div className="relative mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-8 md:px-10 md:pt-10 xl:px-12">
      
      {selection.isActive && (
        <div className="sticky top-4 z-[100] mb-6 flex flex-col items-stretch justify-between gap-4 rounded-xl border border-red-400/15 bg-[#181a20]/95 p-4 backdrop-blur-2xl animate-in slide-in-from-top-3 duration-300 sm:flex-row sm:items-center md:px-5">
            <div className="flex items-center gap-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/15 bg-red-500/10 text-red-400">
                    <CheckSquare size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Gerenciar itens</h3>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-300/70">
                        {selection.items.length} {selection.items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                    </p>
                </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
                <button 
                    onClick={selection.cancel}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white sm:flex-none"
                >
                    <X size={14} /> Cancelar
                </button>
                <button 
                    onClick={actions.promptDeleteSelected}
                    disabled={selection.items.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-35 sm:flex-none"
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
        <div className="mt-7 space-y-5 md:mt-8 md:space-y-6">
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
        size="sm"
        appearance="cinematic"
      >
        <div className="space-y-4">
            <div>
                <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Nome da lista</label>
                <input 
                    type="text" 
                    value={modals.createList.listName}
                    onChange={(e) => actions.updateModalState('createList', 'listName', e.target.value)}
                    placeholder="Ex.: Favoritos, Quero assistir..."
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-sm font-medium text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035]"
                    autoFocus
                />
            </div>

            <div>
                <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Descrição <span className="normal-case tracking-normal text-zinc-700">(opcional)</span></label>
                <textarea
                    value={modals.createList.description}
                    onChange={(e) => actions.updateModalState('createList', 'description', e.target.value)}
                    placeholder="Conte um pouco sobre esta seleção..."
                    rows={3}
                    maxLength={240}
                    className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035]"
                />
                <div className="mt-1.5 text-right text-[10px] text-zinc-700">{(modals.createList.description || '').length}/240</div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button onClick={actions.closeModals} className="h-10 rounded-xl px-4 text-sm font-semibold text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white">Cancelar</button>
                <button onClick={actions.handleCreateList} className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-violet-100">
                    Criar Lista
                </button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modals.editList.isOpen} 
        onClose={actions.closeModals} 
        title="Editar Coleção" 
        size="sm"
        appearance="cinematic"
      >
        <div className="space-y-4">
            <div>
                <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Nome da lista</label>
                <input 
                    type="text" 
                    value={modals.editList.listName}
                    onChange={(e) => actions.updateModalState('editList', 'listName', e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.035]"
                />
            </div>

            <div>
                <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Descrição <span className="normal-case tracking-normal text-zinc-700">(opcional)</span></label>
                <textarea
                    value={modals.editList.description}
                    onChange={(e) => actions.updateModalState('editList', 'description', e.target.value)}
                    rows={3}
                    maxLength={240}
                    className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.035]"
                />
                <div className="mt-1.5 text-right text-[10px] text-zinc-700">{(modals.editList.description || '').length}/240</div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button onClick={actions.closeModals} className="h-10 rounded-xl px-4 text-sm font-semibold text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white">Cancelar</button>
                <button onClick={actions.handleEditList} className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-violet-100">
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
        size="sm"
        appearance="cinematic"
      >
        <div className="space-y-6 pt-2">
            <div className="flex items-start gap-5">
                <div className="shrink-0 rounded-xl border border-red-500/15 bg-red-500/10 p-4 text-red-400">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                        Tem certeza que deseja apagar a lista <strong className="mx-1 font-semibold text-white">“{listBeingDeleted?.name || 'selecionada'}”</strong>?
                        <br/><br/>
                        Isso removerá permanentemente esta categoria e todos os itens vinculados a ela.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-5 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:text-white">Cancelar</button>
                <button onClick={actions.confirmDeleteList} className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500">
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
        size="sm"
        appearance="cinematic"
      >
        <div className="space-y-6 pt-2">
            <div className="flex items-start gap-5">
                <div className="shrink-0 rounded-xl border border-red-500/15 bg-red-500/10 p-4 text-red-400">
                    <Trash2 size={24} />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                        Você está prestes a remover <strong className="mx-1 text-lg font-semibold text-white">{selection.items.length}</strong> itens de suas coleções.
                    </p>
                    <p className="text-xs text-red-400 mt-4 font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20 inline-block">
                        Esta ação não pode ser desfeita.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={actions.closeModals} className="px-5 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:text-white">Cancelar</button>
                <button onClick={actions.confirmDeleteSelected} className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500">
                    Remover Itens
                </button>
            </div>
        </div>
      </Modal>

      </div>
    </main>
  );
}
