import { useState } from "react";
import { Trash2 } from "lucide-react";
import Modal from "@shared/components/ui/Modal";
import ConfirmDialog from "@shared/components/ui/ConfirmDialog";
import TransmissionInformationForm from "@features/watch-party/components/TransmissionInformationForm";

export default function RoomSettingsModal({ isOpen, onClose, room, onSave, onDelete, onResetInvite, resettingInvite }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return <Modal isOpen={isOpen} onClose={onClose} title="Configurações da transmissão" size="sm">
    <div className="space-y-5">
      <TransmissionInformationForm room={room} onSave={onSave} onResetInvite={onResetInvite} resettingInvite={resettingInvite} submitLabel="Salvar alterações" />
      <div className="border-t border-white/[0.07] pt-5"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-red-300">Zona de perigo</p><p className="mt-2 text-xs leading-5 text-zinc-600">Exclui a sala, participantes e fila. Esta ação não pode ser desfeita.</p><button type="button" onClick={() => setConfirmingDelete(true)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-500/10 py-3.5 text-[10px] font-black uppercase tracking-wider text-red-200 hover:bg-red-500/20"><Trash2 size={14} /> Excluir sala</button></div>
    </div>
    <ConfirmDialog isOpen={confirmingDelete} title="Excluir esta sala?" description={`A sala “${room.name}”, sua fila e todos os acessos serão removidos definitivamente.`} confirmLabel="Excluir sala" onClose={() => setConfirmingDelete(false)} onConfirm={onDelete} />
  </Modal>;
}
