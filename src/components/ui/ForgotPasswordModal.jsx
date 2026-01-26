import { useState } from "react";
import { X, Mail, ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "../../services/api";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await requestPasswordReset(email);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Erro ao enviar email. Tente novamente.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Email Enviado!
              </h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Se o email <strong>{email}</strong> estiver cadastrado, você
                receberá um link para redefinir sua senha em instantes.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center mb-4 border border-violet-500/20">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Recuperar Senha
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Digite seu email para receber o link de redefinição.
                </p>
              </div>

              {status === "error" && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                    Email Cadastrado
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "loading"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {status === "loading" ? "Verificando..." : "Enviar Link"}
                  {!status === "loading" && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
