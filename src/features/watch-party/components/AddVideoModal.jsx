import { useMemo, useState } from "react";
import { Link2, Youtube } from "lucide-react";
import Modal from "@shared/components/ui/Modal";
import { isValidYouTubeVideo } from "@features/watch-party/utils/youtube";

export default function AddVideoModal({ isOpen, onClose, onAdd }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const isValid = useMemo(() => isValidYouTubeVideo(url), [url]);

  const submit = (event) => {
    event.preventDefault();
    if (!isValid) return;
    onAdd({ url, title });
    setUrl("");
    setTitle("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar à fila" size="md">
      <form onSubmit={submit} className="space-y-5 p-1">
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/12 bg-red-500/[0.06] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-300"><Youtube size={19} /></span><div><p className="text-sm font-bold text-zinc-100">Vídeo do YouTube</p><p className="mt-1 text-xs leading-5 text-zinc-600">Cole um link normal, Shorts, Live ou apenas o ID do vídeo.</p></div></div>
        <div><label htmlFor="youtube-url" className="mb-2 block text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">Link do vídeo</label><div className="relative"><Link2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" /><input id="youtube-url" value={url} onChange={(event) => setUrl(event.target.value)} autoFocus placeholder="https://youtube.com/watch?v=..." className="w-full rounded-2xl border border-white/[0.08] bg-black/25 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/40" /></div>{url && !isValid && <p className="mt-2 text-[10px] font-medium text-red-300">Esse link ainda não parece válido.</p>}</div>
        <div><label htmlFor="video-title" className="mb-2 block text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">Título na fila <span className="text-zinc-700">(opcional)</span></label><input id="video-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="Nome que seus amigos verão" className="w-full rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/40" /></div>
        <div className="grid gap-2 border-t border-white/[0.06] pt-5 sm:grid-cols-2"><button type="button" onClick={onClose} className="rounded-xl border border-white/[0.08] bg-white/[0.035] py-3 text-[10px] font-black uppercase tracking-wider text-zinc-300">Cancelar</button><button type="submit" disabled={!isValid} className="rounded-xl bg-white py-3 text-[10px] font-black uppercase tracking-wider text-zinc-950 disabled:opacity-35">Adicionar vídeo</button></div>
      </form>
    </Modal>
  );
}
