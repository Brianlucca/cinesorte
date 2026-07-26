import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  onClose,
}) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isOpen) setPending(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, pending]);

  if (!isOpen) return null;

  const confirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100300] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/85 backdrop-blur-md"
        onClick={() => !pending && onClose()}
        aria-label="Cancelar confirmação"
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cinesorte-confirm-title"
        aria-describedby="cinesorte-confirm-description"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#151519] shadow-[0_30px_100px_rgba(0,0,0,0.75)]"
      >
        <div className="flex items-start gap-4 p-6">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${tone === "danger" ? "border-red-400/15 bg-red-500/10 text-red-300" : "border-violet-400/15 bg-violet-500/10 text-violet-300"}`}>
            <AlertTriangle size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
              Confirmação
            </p>
            <h2 id="cinesorte-confirm-title" className="mt-1 text-xl font-black tracking-[-0.02em] text-white">
              {title}
            </h2>
            <p id="cinesorte-confirm-description" className="mt-2 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={pending} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-40" aria-label="Fechar">
            <X size={17} />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] bg-black/15 p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-xl border border-white/[0.08] px-5 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:bg-white/5 disabled:opacity-40">
            {cancelLabel}
          </button>
          <button type="button" onClick={confirm} disabled={pending} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-black uppercase tracking-wider disabled:cursor-wait disabled:opacity-60 ${tone === "danger" ? "bg-red-500 text-white hover:bg-red-400" : "bg-violet-500 text-white hover:bg-violet-400"}`}>
            {pending && <LoaderCircle size={14} className="animate-spin" />}
            {pending ? "Processando" : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
