import { createContext, useContext, useState, useEffect } from 'react';
import { 
    login as apiLogin, 
    register as apiRegister, 
    logout as apiLogout, 
    getMe, 
    updateProfile as apiUpdate, 
    acceptTerms as apiAcceptTerms,
    deleteAccount as apiDeleteAccount 
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
        if (data.termsVersion !== '1.0') {
            setShowTermsModal(true);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email, password) {
    try {
        const data = await apiLogin({ email, password });
        setUser({ ...data });
        
        try {
            const userDetails = await getMe();
            setUser(userDetails);
            if (userDetails.termsVersion !== '1.0') {
                setShowTermsModal(true);
            }
        } catch(e) {}

        return data;
    } catch (error) {
        throw error;
    }
  }

  async function register(data) {
    const payload = { ...data, nickname: data.nickname.toLowerCase() };
    const response = await apiRegister(payload);
    return response;
  }

  async function logout() {
    try {
      await apiLogout();
    } catch (error) {
    } finally {
      setUser(null);
      setShowTermsModal(false);
    }
  }

  async function updateProfile(data) {
    await apiUpdate(data);
    const freshData = await getMe();
    setUser(freshData);
  }

  async function acceptTerms() {
      try {
          await apiAcceptTerms('1.0');
          setShowTermsModal(false);
          setUser(prev => ({ ...prev, termsVersion: '1.0' }));
      } catch (error) {
      }
  }

  async function deleteAccount() {
      try {
          await apiDeleteAccount();
          setUser(null);
          setShowTermsModal(false);
      } catch (error) {
          throw error;
      }
  }

  return (
    <AuthContext.Provider value={{ 
      authenticated: !!user, 
      user, 
      loading, 
      showTermsModal,
      login, 
      register, 
      logout, 
      updateProfile,
      acceptTerms,
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);