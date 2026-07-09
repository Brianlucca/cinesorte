import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { confirmEmailChange } from "@shared/api/api";

export default function EmailChangeComplete() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, type: "loading", message: "Confirmando alteração de email..." });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState({
        loading: false,
        type: "error",
        message: "Link de alteração inválido. Solicite a troca novamente nas configurações.",
      });
      return;
    }

    let cancelled = false;

    async function finishEmailChange() {
      try {
        await confirmEmailChange(token);
        if (!cancelled) {
          setState({
            loading: false,
            type: "success",
            message: "Email atualizado com sucesso. Você já pode usar o novo email para entrar.",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            type: "error",
            message: error.message || "Não foi possível concluir a alteração de email.",
          });
        }
      }
    }

    finishEmailChange();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const isSuccess = state.type === "success";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] px-5 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.08),transparent_30%)]" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/[0.08] bg-[#101014]/95 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
          {state.loading ? (
            <Loader2 className="h-9 w-9 animate-spin text-violet-300" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-9 w-9 text-emerald-300" />
          ) : (
            <AlertCircle className="h-9 w-9 text-red-300" />
          )}
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">Segurança da conta</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
          {state.loading ? "Confirmando email" : isSuccess ? "Email alterado" : "Não foi possível confirmar"}
        </h1>
        <p className="mt-4 text-sm font-medium leading-6 text-zinc-400">{state.message}</p>

        {!state.loading && (
          <Link
            to={isSuccess ? "/login" : "/app/settings?tab=security"}
            className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100"
          >
            {isSuccess ? "Ir para login" : "Voltar para segurança"}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
