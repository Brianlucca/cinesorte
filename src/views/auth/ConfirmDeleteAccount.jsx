import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { confirmAccountDeletion } from '../../services/api';

export default function ConfirmDeleteAccount() {
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleConfirm = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Link inválido ou expirado.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await confirmAccountDeletion(token);
      window.dispatchEvent(new CustomEvent('cinesorte:session-expired'));
      setStatus('success');
      setMessage(response?.message || 'Conta excluída com sucesso.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Não foi possível confirmar a exclusão. Solicite um novo link.');
    }
  };

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-red-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[520px] h-[520px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-3xl font-black text-white tracking-tight">CineSorte</span>
        </div>

        <div className="bg-zinc-950/85 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={`mb-7 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border ${
              isSuccess
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : isError
                  ? 'border-red-500/20 bg-red-500/10 text-red-400'
                  : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}>
              {isLoading ? (
                <Loader2 className="h-9 w-9 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-9 w-9" />
              ) : isError ? (
                <XCircle className="h-9 w-9" />
              ) : (
                <AlertTriangle className="h-9 w-9" />
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              {isSuccess ? 'Conta excluída' : 'Confirmar exclusão'}
            </h1>

            <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-400">
              {isSuccess
                ? 'A solicitação foi concluída. Seus dados de conta foram removidos conforme solicitado.'
                : 'Esta ação é permanente. Nenhum dado sensível será exibido nesta página; o token do email será usado apenas para confirmar a solicitação.'}
            </p>

            {message && (
              <div className={`mt-6 w-full rounded-2xl border p-4 text-sm font-medium leading-relaxed ${
                isSuccess
                  ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-300'
                  : 'border-red-500/15 bg-red-500/5 text-red-300'
              }`}>
                {message}
              </div>
            )}

            {!isSuccess && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading || !token}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
              >
                {isLoading ? 'Confirmando...' : 'Confirmar exclusão'}
                {!isLoading && <ShieldCheck size={18} />}
              </button>
            )}

            <Link
              to="/login"
              className="mt-4 flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-200 active:scale-95"
            >
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
