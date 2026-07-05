import { ChevronDown, Lock, Mail, Send } from "lucide-react";

const SUBJECT_OPTIONS = [
  { value: "SUGESTAO", label: "Feedback / Sugestão" },
  { value: "BUG_REPORT", label: "Relatar um erro" },
  { value: "PROBLEMA_CONTA", label: "Problemas com a conta" },
  { value: "DENUNCIA", label: "Denunciar" },
  { value: "OUTRO_ASSUNTO", label: "Outros assuntos" },
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
      <div>
        <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
          Seu email
        </label>
        <div className="relative flex items-center">
          <Mail size={17} className="absolute left-4 text-zinc-600" />
          <input
            type="email"
            value={email || ""}
            readOnly
            className="w-full cursor-not-allowed rounded-2xl border border-white/[0.08] bg-black/20 py-3.5 pl-11 pr-11 text-sm font-medium text-zinc-500 outline-none"
          />
          <Lock size={15} className="absolute right-4 text-zinc-600" />
        </div>
      </div>

      <div>
        <label className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
          Assunto
        </label>
        <div className="relative flex items-center">
          <select
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            required
            className="w-full cursor-pointer appearance-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 pr-11 text-sm font-medium text-white outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.035]"
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={17} className="pointer-events-none absolute right-4 text-zinc-500" />
        </div>
      </div>

      <div>
        <label className="mb-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
          Mensagem
          <span className="font-bold normal-case tracking-normal text-zinc-600">({message.length}/1000)</span>
        </label>
        <textarea
          required
          rows={8}
          maxLength={1000}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Descreva como podemos ajudar..."
          className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm font-medium leading-6 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035]"
        />
      </div>

      <div className="rounded-2xl border border-violet-400/15 bg-violet-500/10 px-4 py-3 text-sm leading-6 text-violet-100/90">
        O protocolo é gerado automaticamente quando você envia. Também mandamos uma confirmação para o seu email.
      </div>

      <button
        type="submit"
        disabled={isSubmitting || message.trim().length < 10}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={16} />
        {isSubmitting ? "Enviando" : "Enviar chamado"}
      </button>
    </form>
  );
}
