import { useState, useEffect } from 'react';
import {
  login as apiLogin,
  googleAuth as apiGoogleAuth,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  updateProfile as apiUpdate,
  acceptTerms as apiAcceptTerms,
  deleteAccount as apiDeleteAccount,
  requestPasswordReset as apiResetPassword,
  resendVerificationEmail as apiResendVerificationEmail,
  reconcileRatedReviews,
} from '@shared/api/api';
import { AuthContext } from './AuthContextBase';
import { endSessionCache } from '@shared/lib/sessionCache';

const CURRENT_TERMS_VERSION = '4.1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
        if (data.termsVersion !== CURRENT_TERMS_VERSION) setShowTermsModal(true);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!user?.uid) return undefined;
    let cancelled = false;
    let timerId = null;

    const processNextBatch = async () => {
      try {
        const result = await reconcileRatedReviews();
        if (!cancelled && result?.done) {
          const refreshedUser = await getMe();
          if (!cancelled) setUser(refreshedUser);
        } else if (!cancelled) {
          timerId = window.setTimeout(processNextBatch, 2500);
        }
      } catch {
      }
    };

    timerId = window.setTimeout(processNextBatch, 3000);
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [user?.uid]);

  useEffect(() => {
    const handleSessionExpired = () => {
      endSessionCache();
      setUser(null);
      setShowTermsModal(false);
    };

    window.addEventListener('cinesorte:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('cinesorte:session-expired', handleSessionExpired);
    };
  }, []);

  async function login(email, password, turnstileToken) {
    const data = await apiLogin({ email, password, turnstileToken });
    setUser({ ...data });
    try {
      const userDetails = await getMe();
      setUser(userDetails);
      if (userDetails.termsVersion !== CURRENT_TERMS_VERSION) setShowTermsModal(true);
    } catch {
      setShowTermsModal(false);
    }
    return data;
  }

  async function loginWithGoogle(profile = {}) {
    const { signInWithGoogle } = await import('@shared/lib/firebaseAuth');
    const idToken = await signInWithGoogle();
    const data = await apiGoogleAuth({ idToken, ...profile });

    if (data.requiresProfile) {
      return { ...data, idToken };
    }

    setUser({ ...data });
    try {
      const userDetails = await getMe();
      setUser(userDetails);
      if (userDetails.termsVersion !== CURRENT_TERMS_VERSION) setShowTermsModal(true);
    } catch {
      setShowTermsModal(false);
    }
    return data;
  }

  async function completeGoogleRegistration({ idToken, nickname, termsAccepted }) {
    const data = await apiGoogleAuth({
      idToken,
      nickname: nickname.toLowerCase(),
      termsAccepted,
    });

    if (data.requiresProfile) {
      return { ...data, idToken };
    }

    setUser({ ...data });
    try {
      const userDetails = await getMe();
      setUser(userDetails);
      if (userDetails.termsVersion !== CURRENT_TERMS_VERSION) setShowTermsModal(true);
    } catch {
      setShowTermsModal(false);
    }
    return data;
  }

  async function register(data) {
    const payload = { ...data, nickname: data.nickname.toLowerCase() };
    return await apiRegister(payload);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      setShowTermsModal(false);
    }
    finally {
      endSessionCache();
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
      await apiAcceptTerms(CURRENT_TERMS_VERSION);
      setShowTermsModal(false);
      setUser((prev) => ({ ...prev, termsVersion: CURRENT_TERMS_VERSION }));
    } catch {
      setShowTermsModal(true);
    }
  }

  async function deleteAccount(confirmText) {
    const response = await apiDeleteAccount(confirmText);
    endSessionCache();
    setUser(null);
    setShowTermsModal(false);
    return response;
  }

  async function resetPassword(email) {
    const response = await apiResetPassword(email);
    endSessionCache();
    setUser(null);
    setShowTermsModal(false);
    return response;
  }

  async function resendVerificationEmail(email) {
    return await apiResendVerificationEmail(email);
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
        completeGoogleRegistration,
        register,
        logout,
        updateProfile,
        acceptTerms,
        deleteAccount,
        resetPassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
