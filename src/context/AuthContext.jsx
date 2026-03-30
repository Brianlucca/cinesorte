import { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  updateProfile as apiUpdate,
  acceptTerms as apiAcceptTerms,
  deleteAccount as apiDeleteAccount,
  requestPasswordReset as apiResetPassword,
  googleAuth as apiGoogleAuth,
} from '../services/api';

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
        if (data.termsVersion !== '2.0') setShowTermsModal(true);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email, password, turnstileToken) {
    const data = await apiLogin({ email, password, turnstileToken });
    setUser({ ...data });
    try {
      const userDetails = await getMe();
      setUser(userDetails);
      if (userDetails.termsVersion !== '2.0') setShowTermsModal(true);
    } catch {}
    return data;
  }

  async function loginWithGoogle() {
    const firebaseAuth = getAuth();
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await result.user.getIdToken();
    const data = await apiGoogleAuth({ idToken });
    setUser({ ...data });
    try {
      const userDetails = await getMe();
      setUser(userDetails);
      if (userDetails.termsVersion !== '2.0') setShowTermsModal(true);
    } catch {}
    return data;
  }

  async function register(data) {
    const payload = { ...data, nickname: data.nickname.toLowerCase() };
    return await apiRegister(payload);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {}
    finally {
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
      await apiAcceptTerms('2.0');
      setShowTermsModal(false);
      setUser((prev) => ({ ...prev, termsVersion: '2.0' }));
    } catch {}
  }

  async function deleteAccount() {
    await apiDeleteAccount();
    setUser(null);
    setShowTermsModal(false);
  }

  async function resetPassword(email) {
    return await apiResetPassword(email);
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated: !!user,
        user,
        loading,
        showTermsModal,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        acceptTerms,
        deleteAccount,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);