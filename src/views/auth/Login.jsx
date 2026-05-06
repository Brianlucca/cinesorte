import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import ForgotPasswordModal from '../../components/ui/ForgotPasswordModal';
import AuthHelpModal from '../../components/ui/AuthHelpModal';

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

  const getRedirect = () => {
    const params = new URLSearchParams(location.search);
    const path = params.get('redirect');
    return path ? decodeURIComponent(path) : '/app';
  };

  useEffect(() => {
    if (user) navigate(getRedirect());
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Complete a verificação de segurança.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password, turnstileToken);
      navigate(getRedirect());
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

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/40 to-black z-10" />
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
          alt="Movie Theater"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="relative z-20 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-white tracking-tight">CineSorte</span>
          </div>
          <div className="max-w-md space-y-6">
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Sua jornada cinematográfica <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                continua aqui.
              </span>
            </h1>
            <p className="text-zinc-300 text-lg leading-relaxed font-medium">
              Acesse suas listas personalizadas, continue suas reviews e veja o que seus amigos estão assistindo agora.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-black uppercase tracking-widest">
            <div className="w-10 h-[2px] bg-zinc-700 rounded-full" />
            Bem-vindo de volta
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-white tracking-tight">Login</h2>
            <p className="mt-2 text-zinc-500 font-medium">Digite suas credenciais para acessar.</p>
          </div>

          {error && (
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-medium flex items-center gap-3 shadow-inner">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-400 transition-colors z-10">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 focus:border-violet-500/50 focus:bg-black/60"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors outline-none"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-400 transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-14 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 focus:border-violet-500/50 focus:bg-black/60"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start">
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
              className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 group"
            >
              {loading ? 'Autenticando...' : 'Entrar na plataforma'}
              {!loading && (
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-950 text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Novo por aqui?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to={`/register${location.search}`}
              className="inline-flex items-center gap-2 text-white font-bold hover:text-violet-400 transition-colors group"
            >
              Criar uma conta gratuita
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
            >
              <HelpCircle size={16} />
              Preciso de ajuda
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
