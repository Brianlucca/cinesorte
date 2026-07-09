import { useState } from "react";
import { X, Mail, ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@shared/api/api";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await requestPasswordReset(email);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Erro ao enviar email. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {status === "success" ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Email enviado</h3>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-zinc-800 py-3 font-bold text-white transition-all hover:bg-zinc-700"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Recuperar senha</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Digite seu email para receber o link de redefinição.
                </p>
              </div>

              {status === "error" && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="ml-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Email cadastrado
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-3.5 text-zinc-500 transition-colors group-focus-within:text-violet-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-12 pr-4 text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={status === "loading"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-black transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {status === "loading" ? "Verificando..." : "Enviar link"}
                  {status !== "loading" && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
