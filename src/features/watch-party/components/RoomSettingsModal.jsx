import Modal from "@shared/components/ui/Modal";
import TransmissionInformationForm from "@features/watch-party/components/TransmissionInformationForm";

export default function RoomSettingsModal({ isOpen, onClose, room, onSave, onResetInvite, resettingInvite }) {
  return <Modal isOpen={isOpen} onClose={onClose} title="Configurações da transmissão" size="sm">
    <div className="space-y-5">
      <TransmissionInformationForm room={room} onSave={onSave} onResetInvite={onResetInvite} resettingInvite={resettingInvite} submitLabel="Salvar alterações" />
    </div>
  </Modal>;
}
