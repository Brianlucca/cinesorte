import { ChevronDown, Lock, Mail, Send } from "lucide-react";

const SUBJECT_OPTIONS = [
  { value: "SUGESTAO", label: "Feedback / Sugestão" },
  { value: "BUG_REPORT", label: "Relatar um Erro (Bug)" },
  { value: "PROBLEMA_CONTA", label: "Problemas com a Conta" },
  { value: "DENUNCIA", label: "Denunciar" },
  { value: "OUTRO_ASSUNTO", label: "Outros Assuntos" },
];

export default function SupportContactPanel({
  email,
  subject,
  message,
  isSubmitting,
  onSubjectChange,
  onMessageChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Seu Email (Para Resposta)
        </label>
        <div className="relative flex items-center">
          <Mail size={18} className="absolute left-5 text-zinc-600 z-10" />
          <input
            type="email"
            value={email || ""}
            readOnly
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-zinc-500 font-medium cursor-not-allowed outline-none shadow-inner"
          />
          <Lock size={16} className="absolute right-5 text-zinc-600" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Assunto
        </label>
        <div className="relative flex items-center">
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-white font-medium focus:border-violet-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner"
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Sua Mensagem
          <span className="font-medium normal-case tracking-normal">({message.length}/1000)</span>
        </label>
        <textarea
          required
          rows={8}
          maxLength={1000}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Descreva detalhadamente como podemos ajudar..."
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:border-violet-500/50 focus:bg-black/60 outline-none transition-all resize-none shadow-inner placeholder:text-zinc-600"
        />
      </div>

      <div className="rounded-[1.75rem] border border-violet-500/10 bg-violet-500/5 px-5 py-4 text-sm text-zinc-300">
        O protocolo é gerado automaticamente quando você envia. Também mandamos uma confirmação para o seu email.
      </div>

      <button
        type="submit"
        disabled={isSubmitting || message.trim().length < 10}
        className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95"
      >
        {isSubmitting ? "Enviando..." : "Enviar Chamado"}
        <Send size={18} />
      </button>
    </form>
  );
}
