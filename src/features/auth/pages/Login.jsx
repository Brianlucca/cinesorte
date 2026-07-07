import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Loader2, Mail } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import ForgotPasswordModal from '@shared/components/ui/ForgotPasswordModal';
import AuthHelpModal from '@shared/components/ui/AuthHelpModal';
import AuthShell from '@features/auth/components/AuthShell';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const { login, user } = useAuth();
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

  const handleSubmit = async (event) => {
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
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="rounded-[1.25rem] border border-white/[0.07] bg-white/[0.025] p-4 text-center">
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
        eyebrow="Bem-vindo de volta"
        title="Entrar no CineSorte"
        description="Acesse suas listas, reviews, mensagens e recomendações sem atravessar tela demais."
        sideTitle="Sua próxima sessão começa aqui."
        sideDescription="Continue de onde parou, veja o que seus amigos estão assistindo e mantenha suas reviews sempre por perto."
        footer={footer}
        onHelp={() => setShowHelpModal(true)}
      >
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/10 p-4 text-sm font-medium leading-6 text-red-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="h-[52px] w-full rounded-2xl border border-white/[0.08] bg-black/30 py-4 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:border-violet-300/35 focus:bg-black/45"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

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
                className="h-[52px] w-full rounded-2xl border border-white/[0.08] bg-black/30 py-4 pl-12 pr-12 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:border-violet-300/35 focus:bg-black/45"
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

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/20 p-3">
            <Turnstile
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
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-zinc-950 shadow-xl shadow-black/20 transition-all hover:scale-[1.01] hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.99]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Entrando' : 'Entrar agora'}
          </button>
        </form>
      </AuthShell>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
