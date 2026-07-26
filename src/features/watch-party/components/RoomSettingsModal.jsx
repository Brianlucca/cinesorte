import { useEffect, useState } from "react";
import { LockKeyhole, SlidersHorizontal, Trash2 } from "lucide-react";
import Modal from "@shared/components/ui/Modal";
import ConfirmDialog from "@shared/components/ui/ConfirmDialog";
import { WATCH_PARTY_PRIVACY } from "@features/watch-party/data/watchPartyOptions";

export default function RoomSettingsModal({ isOpen, onClose, room, onSave, onDelete }) {
  const [privacy, setPrivacy] = useState(room.privacy);
  const [allowGuestControl, setAllowGuestControl] = useState(room.allowGuestControl);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  useEffect(() => { if (isOpen) { setPrivacy(room.privacy); setAllowGuestControl(room.allowGuestControl); } }, [isOpen, room.allowGuestControl, room.privacy]);

  return <Modal isOpen={isOpen} onClose={onClose} title="Configurações da sala" size="sm">
    <div className="space-y-5">
      <div><label htmlFor="room-privacy" className="mb-2 block text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">Quem pode entrar</label><div className="relative"><LockKeyhole size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" /><select id="room-privacy" value={privacy} onChange={(event) => setPrivacy(event.target.value)} className="w-full appearance-none rounded-2xl border border-white/[0.08] bg-black/25 py-3.5 pl-11 pr-4 text-sm font-bold text-white outline-none">{WATCH_PARTY_PRIVACY.map((option) => <option key={option.id} value={option.id} className="bg-zinc-900">{option.label}</option>)}</select></div></div>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><input type="checkbox" checked={allowGuestControl} onChange={(event) => setAllowGuestControl(event.target.checked)} className="mt-1 h-4 w-4 accent-violet-500" /><span><span className="flex items-center gap-2 text-sm font-bold text-zinc-100"><SlidersHorizontal size={14} className="text-violet-300" /> Controles compartilhados</span><span className="mt-1 block text-xs leading-5 text-zinc-600">Todos poderão controlar a reprodução.</span></span></label>
      <button type="button" onClick={() => onSave({ privacy, allowGuestControl })} className="w-full rounded-xl bg-white py-3.5 text-[10px] font-black uppercase tracking-wider text-zinc-950">Salvar alterações</button>
      <div className="border-t border-white/[0.07] pt-5"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-red-300">Zona de perigo</p><p className="mt-2 text-xs leading-5 text-zinc-600">Exclui a sala, participantes e fila. Esta ação não pode ser desfeita.</p><button type="button" onClick={() => setConfirmingDelete(true)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-500/10 py-3.5 text-[10px] font-black uppercase tracking-wider text-red-200 hover:bg-red-500/20"><Trash2 size={14} /> Excluir sala</button></div>
    </div>
    <ConfirmDialog isOpen={confirmingDelete} title="Excluir esta sala?" description={`A sala “${room.name}”, sua fila e todos os acessos serão removidos definitivamente.`} confirmLabel="Excluir sala" onClose={() => setConfirmingDelete(false)} onConfirm={onDelete} />
  </Modal>;
}
