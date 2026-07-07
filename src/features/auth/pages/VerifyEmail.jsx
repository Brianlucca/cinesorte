import { useEffect, useMemo, useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, HelpCircle, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import AuthHelpModal from '@shared/components/ui/AuthHelpModal';

const PENDING_EMAIL_KEY = 'cinesorte:pendingVerificationEmail';

export default function VerifyEmail() {
  const location = useLocation();
  const { resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState(() => location.state?.email || sessionStorage.getItem(PENDING_EMAIL_KEY) || '');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [resendState, setResendState] = useState({ loading: false, message: '', type: '' });

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  useEffect(() => {
    if (location.state?.email) {
      sessionStorage.setItem(PENDING_EMAIL_KEY, location.state.email);
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleResend = async () => {
    if (!isEmailValid) {
      setResendState({ loading: false, message: 'Digite um email válido para reenviar a confirmação.', type: 'error' });
      return;
    }

    setResendState({ loading: true, message: '', type: '' });
    try {
      await resendVerificationEmail(email);
      sessionStorage.setItem(PENDING_EMAIL_KEY, email);
      setResendState({
        loading: false,
        message: 'Se sua conta ainda estiver pendente, enviamos um novo email de confirmação.',
        type: 'success',
      });
    } catch (err) {
      setResendState({
        loading: false,
        message: err.message || 'Não foi possível reenviar agora. Tente novamente em alguns minutos.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <span className="text-3xl font-black text-white tracking-tight">CineSorte</span>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-center shadow-inner group">
                <Mail className="w-10 h-10 text-zinc-500 group-hover:text-violet-400 transition-colors duration-500" />
                <div className="absolute -top-2 -right-2 bg-zinc-950 rounded-xl p-1.5 border border-white/5 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Confirme seu email</h2>

            <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-medium">
              Para acessar sua conta, confirme o email cadastrado. Se precisar de um novo link, informe seu email abaixo e solicite o reenvio.
            </p>

            <div className="w-full space-y-4">
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email de cadastro</label>
                <input
                  type="email"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 focus:border-violet-500/50 focus:bg-black/60"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendState.loading || !isEmailValid}
                className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 text-white hover:bg-violet-500 font-black text-sm uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
              >
                {resendState.loading ? 'Reenviando...' : 'Reenviar email'}
                {!resendState.loading && <RefreshCw className="w-5 h-5 group-hover:rotate-45 transition-transform" />}
              </button>

              {resendState.message && (
                <div
                  className={`rounded-2xl border p-4 text-sm font-medium leading-relaxed ${
                    resendState.type === 'success'
                      ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-300'
                      : 'border-red-500/15 bg-red-500/5 text-red-300'
                  }`}
                >
                  {resendState.message}
                </div>
              )}

              <Link
                to={`/login${location.search}`}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-zinc-200 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 group"
              >
                Voltar para Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="pt-6 border-t border-white/5 w-full space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">
                  Precisa de ajuda com a confirmação? <br />
                  <span className="text-zinc-400">Confira o FAQ ou fale com o suporte.</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
                >
                  <HelpCircle size={16} />
                  Preciso de ajuda
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          &copy; 2026 CineSorte. Todos os Direitos Reservados.
        </p>
      </div>

      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
