import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useSettingsLogic() {
  const { user, updateProfile, deleteAccount, resetPassword, logout } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ username: '', bio: '', name: '' });
  const [usernameStatus, setUsernameStatus] = useState({ isLocked: false, daysRemaining: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [modals, setModals] = useState({
    resetPassword: false,
    deleteAccount: false,
    avatarSelector: false,
  });

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', bio: user.bio || '', name: user.name || '' });

      if (user.lastUsernameChange) {
        const lastChange = user.lastUsernameChange.toDate
          ? user.lastUsernameChange.toDate()
          : new Date(user.lastUsernameChange);
        const diffDays = (new Date() - lastChange) / (1000 * 60 * 60 * 24);

        if (diffDays < 30) {
          setUsernameStatus({ isLocked: true, daysRemaining: Math.ceil(30 - diffDays) });
        } else {
          setUsernameStatus({ isLocked: false, daysRemaining: 0 });
        }
      }
    }
  }, [user]);

  const notify = (type, title, msg) => {
    if (toast?.[type]) toast[type](title, msg);
  };

  const toggleModal = (modalName, isOpen) => {
    setModals((prev) => ({ ...prev, [modalName]: isOpen }));
    if (modalName === 'deleteAccount' && !isOpen) setDeleteConfirmText('');
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;

    if (field === 'username') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    }

    setForm((prev) => ({ ...prev, [field]: processedValue }));
  };

  const handleUpdateProfile = async (event) => {
    if (event) event.preventDefault();

    if (!usernameStatus.isLocked && form.username.trim().length < 3) {
      return notify('error', 'Username inválido', 'O username deve ter pelo menos 3 caracteres.');
    }

    setIsLoading(true);

    try {
      const dataToUpdate = { ...form };
      if (usernameStatus.isLocked) delete dataToUpdate.username;
      delete dataToUpdate.name;

      await updateProfile(dataToUpdate);
      notify('success', 'Perfil atualizado', 'Suas informações foram salvas com sucesso.');
    } catch (error) {
      const status = error.response?.status;
      const dataMsg = error.response?.data?.message;
      let errorMsg = 'Não foi possível salvar as alterações.';

      if (status === 400 && dataMsg) errorMsg = dataMsg;
      notify('error', 'Erro ao salvar', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async (photoURL) => {
    setIsLoading(true);

    try {
      await updateProfile({ ...form, photoURL });
      notify('success', 'Foto atualizada', 'Sua nova imagem de perfil foi definida.');
      toggleModal('avatarSelector', false);
    } catch {
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
      notify('success', 'Email enviado', `Verifique a caixa de entrada de ${user.email}. Sua sessão foi encerrada por segurança.`);
    } catch {
      notify('error', 'Falha no envio', 'Ocorreu um erro ao tentar enviar o email.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETAR CONTA') {
      notify('error', 'Confirmação inválida', 'Digite DELETAR CONTA para confirmar a exclusão.');
      return;
    }

    setIsLoading(true);

    try {
      await deleteAccount(deleteConfirmText);
      toggleModal('deleteAccount', false);
      notify('success', 'Conta excluída', 'Sua conta foi excluída com sucesso.');
    } catch (error) {
      const msg = error.status === 401
        ? 'Por segurança, faça login novamente e tente excluir a conta em seguida.'
        : error.message || 'Erro, tente novamente mais tarde.';
      notify('error', 'Não foi possível excluir', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    form,
    deleteConfirmText,
    ui: {
      isLoading,
      isUsernameLocked: usernameStatus.isLocked,
      daysToUnlock: usernameStatus.daysRemaining,
    },
    modals,
    actions: {
      handleInputChange,
      handleUpdateProfile,
      handleAvatarUpdate,
      confirmResetPassword,
      confirmDeleteAccount,
      setDeleteConfirmText,
      logout,
      openModal: (name) => toggleModal(name, true),
      closeModal: (name) => toggleModal(name, false),
    },
  };
}
