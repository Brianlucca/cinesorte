import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useSettingsLogic() {
  const { user, updateProfile, deleteAccount, resetPassword, logout } = useAuth();
  const toast = useToast();
  
  const [form, setForm] = useState({ 
      username: '', 
      bio: '',
      name: '' 
  });
  
  const [usernameStatus, setUsernameStatus] = useState({
      isLocked: false,
      daysRemaining: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  const [modals, setModals] = useState({
      resetPassword: false,
      deleteAccount: false,
      avatarSelector: false
  });

  useEffect(() => {
    if (user) {
      setForm({
          username: user.username || '',
          bio: user.bio || '',
          name: user.name || ''
      });

      if (user.lastUsernameChange) {
          const lastChange = user.lastUsernameChange.toDate ? user.lastUsernameChange.toDate() : new Date(user.lastUsernameChange);
          const now = new Date();
          const diffTime = Math.abs(now - lastChange);
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          if (diffDays < 30) {
              setUsernameStatus({
                  isLocked: true,
                  daysRemaining: Math.ceil(30 - diffDays)
              });
          } else {
              setUsernameStatus({ isLocked: false, daysRemaining: 0 });
          }
      }
    }
  }, [user]);

  const notify = (type, title, msg) => {
      if (toast && toast[type]) {
          toast[type](title, msg);
      }
  };

  const toggleModal = (modalName, isOpen) => {
      setModals(prev => ({ ...prev, [modalName]: isOpen }));
  };

  const handleInputChange = (field, value) => {
      let processedValue = value;

      if (field === 'username') {
          processedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      }

      setForm(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleUpdateProfile = async (e) => {
    if(e) e.preventDefault();
    
    if (!usernameStatus.isLocked && form.username.trim().length < 3) {
        return notify('error', 'Username Inválido', 'O username deve ter pelo menos 3 caracteres.');
    }

    setIsLoading(true);
    try {
      const dataToUpdate = { ...form };
      
      if (usernameStatus.isLocked) {
          delete dataToUpdate.username;
      }
      
      delete dataToUpdate.name; 

      await updateProfile(dataToUpdate);
      notify('success', 'Perfil Atualizado', 'Suas informações foram salvas com sucesso.');
    } catch (error) {
      const status = error.response?.status;
      const dataMsg = error.response?.data?.message;
      let errorMsg = 'Não foi possível salvar as alterações.';
      
      if (status === 400 && dataMsg) errorMsg = dataMsg; 
      
      notify('error', 'Erro ao Salvar', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async (photoURL) => {
      setIsLoading(true);
      try {
          await updateProfile({ ...form, photoURL });
          notify('success', 'Foto Atualizada', 'Sua nova imagem de perfil foi definida.');
          toggleModal('avatarSelector', false);
      } catch (error) {
          notify('error', 'Erro', 'Não foi possível atualizar a foto.');
      } finally {
          setIsLoading(false);
      }
  };

  const confirmResetPassword = async () => {
    setIsLoading(true);
    
    try {
      await resetPassword(user.email);
      toggleModal('resetPassword', false);
      notify('success', 'Email Enviado', `Verifique a caixa de entrada de ${user.email}`);
    } catch (error) {
      notify('error', 'Falha no Envio', 'Ocorreu um erro ao tentar enviar o email.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAccount = async (confirmationText) => {
    if (confirmationText !== 'DELETAR') return;

    setIsLoading(true);

    try {
      await deleteAccount();
      toggleModal('deleteAccount', false);
      notify('info', 'Conta Excluída', 'Sua conta foi removida permanentemente.');
    } catch (error) {
      const msg = error.code === 'auth/requires-recent-login' 
        ? 'Por segurança, faça login novamente antes de excluir sua conta.' 
        : (error.response?.data?.message || 'Não foi possível excluir sua conta. Tente novamente.');
      
      notify('error', 'Erro Crítico', msg);
      setIsLoading(false);
    }
  };

  return {
    user,
    form,
    ui: { 
        isLoading,
        isUsernameLocked: usernameStatus.isLocked,
        daysToUnlock: usernameStatus.daysRemaining
    },
    modals,
    actions: {
        handleInputChange,
        handleUpdateProfile,
        handleAvatarUpdate,
        confirmResetPassword,
        confirmDeleteAccount,
        logout,
        openModal: (name) => toggleModal(name, true),
        closeModal: (name) => toggleModal(name, false)
    }
  };
}