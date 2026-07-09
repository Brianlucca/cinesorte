import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import { confirmEmailChange } from "@shared/api/api";

export default function EmailChangePending() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const pendingEmail = searchParams.get("email") || "";
  const [state, setState] = useState({
    loading: true,
    done: false,
    error: "",
    message: "Aguardando confirmação do link enviado por email.",
  });
  const intervalRef = useRef(null);

  const canPoll = useMemo(() => token.length >= 32, [token]);

  const checkConfirmation = useCallback(async ({ manual = false } = {}) => {
    if (!canPoll) {
      setState({
        loading: false,
        done: false,
        error: "Link de acompanhamento inválido. Solicite a troca novamente.",
        message: "",
      });
      return;
    }

    setState((current) => ({ ...current, loading: manual || current.loading, error: "" }));

    try {
      await confirmEmailChange(token);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setState({
        loading: false,
        done: true,
        error: "",
        message: "Email confirmado e sincronizado com sucesso.",
      });
    } catch (error) {
      if (error.status === 409) {
        setState({
          loading: false,
          done: false,
          error: "",
          message: "Ainda não identificamos a confirmação. Abra seu email e clique no link recebido.",
        });
        return;
      }

      if (error.status === 400) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      }

      setState({
        loading: false,
        done: false,
        error: error.message || "Não foi possível verificar a alteração agora.",
        message: "",
      });
    }
  }, [canPoll, token]);

  useEffect(() => {
    checkConfirmation();
    intervalRef.current = window.setInterval(() => checkConfirmation(), 5000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [checkConfirmation]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] px-5 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.08),transparent_30%)]" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/[0.08] bg-[#101014]/95 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
          {state.done ? (
            <CheckCircle2 className="h-9 w-9 text-emerald-300" />
          ) : state.error ? (
            <AlertCircle className="h-9 w-9 text-red-300" />
          ) : state.loading ? (
            <Loader2 className="h-9 w-9 animate-spin text-violet-300" />
          ) : (
            <Mail className="h-9 w-9 text-violet-300" />
          )}
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">Alteração de email</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
          {state.done ? "Email confirmado" : state.error ? "Atenção necessária" : "Aguardando confirmação"}
        </h1>
        <p className="mt-4 text-sm font-medium leading-6 text-zinc-400">
          {state.done
            ? "Seu email foi atualizado com sucesso."
            : state.error || state.message}
        </p>

        {pendingEmail && !state.done && !state.error && (
          <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-500/10 p-4 text-sm font-bold text-amber-100">
            Confirme o link enviado para {pendingEmail}.
          </div>
        )}

        <div className="mt-7 space-y-3">
          {!state.done && (
            <button
              type="button"
              onClick={() => checkConfirmation({ manual: true })}
              disabled={state.loading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 py-4 text-xs font-black uppercase tracking-[0.13em] text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Verificar agora
            </button>
          )}

          <Link
            to={state.done ? "/login" : "/app/settings?tab=security"}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100"
          >
            {state.done ? "Ir para login" : "Voltar para segurança"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
