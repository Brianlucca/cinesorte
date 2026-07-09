import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import ForgotPasswordModal from '@shared/components/ui/ForgotPasswordModal';
import AuthHelpModal from '@shared/components/ui/AuthHelpModal';
import AuthShell from '@features/auth/components/AuthShell';
import GoogleIcon from '@features/auth/components/GoogleIcon';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const path = params.get('redirect');
    return path ? decodeURIComponent(path) : '/app';
  }, [location.search]);

  useEffect(() => {
    if (user) navigate(redirectTo);
  }, [navigate, redirectTo, user]);

  const handleEmailContinue = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError('Digite um email válido.');
      return;
    }

    setEmail(normalizedEmail);
    setError('');
    setStep('password');
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;

    setError('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result?.requiresProfile) {
        navigate(`/register${location.search}`, {
          state: { googleCompletion: result },
        });
        return;
      }
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Não foi possível entrar com Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!turnstileToken) {
      setError('Complete a verificação de segurança.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password, turnstileToken);
      navigate(redirectTo);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Email ou senha incorretos.';
      if (message.toLowerCase().includes('verificado')) {
        sessionStorage.setItem('cinesorte:pendingVerificationEmail', email);
        const redirectPath = new URLSearchParams(location.search).get('redirect');
        navigate(
          redirectPath
            ? `/verify-email?redirect=${encodeURIComponent(redirectPath)}`
            : '/verify-email',
          { state: { email } }
        );
        return;
      }
      setError(message);
      setTurnstileToken(null);
      setTurnstileKey((value) => value + 1);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="text-center">
      <p className="text-sm font-medium text-zinc-500">
        Novo por aqui?{' '}
        <Link to={`/register${location.search}`} className="font-black text-white transition-colors hover:text-violet-300">
          Criar conta gratuita
        </Link>
      </p>
    </div>
  );

  return (
    <>
      <AuthShell
        eyebrow={step === 'email' ? 'Bem-vindo de volta' : 'Quase lá'}
        title={step === 'email' ? 'Entrar no CineSorte' : 'Digite sua senha'}
        description={
          step === 'email'
            ? 'Use seu email para continuar ou entre com Google.'
            : `Entrando como ${email}`
        }
        footer={footer}
        onHelp={() => setShowHelpModal(true)}
      >
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/10 p-4 text-sm font-medium leading-6 text-red-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div className="space-y-2.5">
              <label htmlFor="login-email" className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Email
              </label>
              <div className="group relative">
                <Mail size={18} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-300" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-[52px] w-full rounded-xl border border-white/[0.08] bg-black/30 py-4 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:border-violet-300/35 focus:bg-black/45 focus:ring-2 focus:ring-violet-400/10"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-xl shadow-black/20 transition-all hover:bg-violet-500 active:scale-[0.99]"
            >
              <ArrowRight size={18} />
              Continuar
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">ou</span>
              <span className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white px-5 py-4 text-sm font-black text-zinc-950 shadow-xl shadow-black/20 transition-all hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continuar com Google
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setPassword('');
                setTurnstileToken(null);
                setTurnstileKey((value) => value + 1);
                setError('');
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 transition-colors hover:text-white"
            >
              <ChevronLeft size={15} />
              Trocar email
            </button>

            <div className="space-y-2.5">
              <div className="ml-1 flex items-center justify-between gap-4">
                <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-violet-300 transition-colors hover:text-white"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="group relative">
                <Lock size={18} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-300" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="h-[52px] w-full rounded-xl border border-white/[0.08] bg-black/30 py-4 pl-12 pr-12 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:border-violet-300/35 focus:bg-black/45 focus:ring-2 focus:ring-violet-400/10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex overflow-hidden py-1">
              <Turnstile
                key={turnstileKey}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'dark', language: 'pt-BR' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-xl shadow-black/20 transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 active:scale-[0.99]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? 'Entrando' : 'Entrar agora'}
            </button>
          </form>
        )}
      </AuthShell>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
