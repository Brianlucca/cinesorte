import { useState, useEffect } from 'react';
import api, { shareList } from '../services/api';
import { useToast } from '../context/ToastContext';

export function useMyListsLogic() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const toast = useToast();

  const [modals, setModals] = useState({
    deleteList: { isOpen: false, listId: null },
    deleteSelected: { isOpen: false },
    editList: { isOpen: false, listId: null, listName: '', description: '' },
    createList: { isOpen: false, listName: '', description: '' }
  });

  useEffect(() => {
    loadLists();
  }, []);

  async function loadLists() {
    try {
      const res = await api.get('/users/lists/me');
      setLists(res.data);
    } catch (error) {
      setLists([]); 
    } finally {
      setLoading(false);
    }
  }

  const startManagingList = (listId) => {
      setIsSelectionMode(true);
      setActiveListId(listId);
      setSelectedItems([]);
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setActiveListId(null);
    setSelectedItems([]);
  };

  const toggleItemSelection = (listId, mediaId) => {
    if (activeListId && activeListId !== listId) return;

    setSelectedItems(prev => {
      const exists = prev.find(item => item.listId === listId && item.mediaId === mediaId);
      if (exists) {
        return prev.filter(item => item !== exists);
      } else {
        return [...prev, { listId, mediaId }];
      }
    });
  };

  const promptDeleteList = (listId) => {
    setModals(prev => ({ ...prev, deleteList: { isOpen: true, listId } }));
  };

  const confirmDeleteList = async () => {
    const { listId } = modals.deleteList;
    if (!listId) return;

    try {
        await api.delete(`/users/lists/${listId}`);
        setLists(prev => prev.filter(l => l.id !== listId));
        toast.success('Lista Excluída', 'A lista foi removida com sucesso.');
    } catch (error) {
        toast.error('Erro', 'Não foi possível excluir a lista.');
        loadLists();
    } finally {
        closeModals();
    }
  };

  const promptDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    setModals(prev => ({ ...prev, deleteSelected: { isOpen: true } }));
  };

  const confirmDeleteSelected = async () => {
    try {
        await Promise.all(selectedItems.map(item => 
            api.delete(`/users/lists/${item.listId}/media/${item.mediaId}`)
        ));

        setLists(prevLists => prevLists.map(list => {
            const itemsToRemove = selectedItems
                .filter(selected => selected.listId === list.id)
                .map(selected => selected.mediaId);
            
            if (itemsToRemove.length > 0) {
                return { 
                    ...list, 
                    items: list.items.filter(item => !itemsToRemove.includes(item.id)) 
                };
            }
            return list;
        }));

        toast.success('Itens Removidos', `${selectedItems.length} itens foram removidos.`);
        cancelSelectionMode();
    } catch (error) {
        toast.error('Erro', 'Falha ao remover alguns itens.');
        loadLists();
    } finally {
        closeModals();
    }
  };

  const openCreateModal = () => {
      setModals(prev => ({ ...prev, createList: { isOpen: true, listName: '', description: '' } }));
  };

  const handleCreateList = async () => {
      const { listName, description } = modals.createList;
      if (!listName.trim()) return toast.error('Nome obrigatório');

      try {
          const res = await api.post('/users/lists', { 
              listName, 
              description: description || '', 
              isPublic: true 
          });
          
          const newList = { 
              id: res.listId, 
              name: listName, 
              description: description || '', 
              items: [], 
              isPublic: true 
          };
          setLists(prev => [...prev, newList]);
          toast.success('Lista Criada', `A lista "${listName}" foi criada.`);
          closeModals();
      } catch (error) {
          toast.error('Erro', 'Não foi possível criar a lista.');
      }
  };

  const openEditModal = (list) => {
      setModals(prev => ({ 
          ...prev, 
          editList: { 
              isOpen: true, 
              listId: list.id, 
              listName: list.name, 
              description: list.description 
          } 
      }));
  };

  const handleEditList = async () => {
      const { listId, listName, description } = modals.editList;
      if (!listName.trim()) return toast.error('Nome obrigatório');

      try {
          await api.post('/users/lists', { listId, listName, description });
          
          setLists(prev => prev.map(l => {
              if (l.id === listId) {
                  return { ...l, name: listName, description };
              }
              return l;
          }));

          toast.success('Lista Atualizada', 'As alterações foram salvas.');
          closeModals();
      } catch (error) {
          toast.error('Erro', 'Não foi possível editar a lista.');
      }
  };

  const handleShareList = async (list) => {
    if (!list.isPublic) return toast.error('Privado', 'Torne a lista pública para compartilhar.');
    
    try {
        await shareList({
            listId: list.id,
            content: `Confira minha nova coleção: ${list.name}`
        });
        toast.success('Compartilhado', 'A coleção foi publicada no seu feed!');
    } catch (error) {
        toast.error('Erro', 'Falha ao compartilhar a coleção.');
    }
  };

  const closeModals = () => {
    setModals({
        deleteList: { isOpen: false, listId: null },
        deleteSelected: { isOpen: false },
        editList: { isOpen: false, listId: null, listName: '', description: '' },
        createList: { isOpen: false, listName: '', description: '' }
    });
  };

  const updateModalState = (modalName, field, value) => {
      setModals(prev => ({
          ...prev,
          [modalName]: {
              ...prev[modalName],
              [field]: value
          }
      }));
  };

  return {
    lists,
    loading,
    modals,
    selection: {
        isActive: isSelectionMode,
        activeListId,
        items: selectedItems,
        startManaging: startManagingList,
        cancel: cancelSelectionMode,
        toggleItem: toggleItemSelection
    },
    actions: {
        promptDeleteList,
        confirmDeleteList,
        promptDeleteSelected,
        confirmDeleteSelected,
        closeModals,
        openCreateModal,
        handleCreateList,
        openEditModal,
        handleEditList,
        handleShareList,
        updateModalState
    }
  };
}