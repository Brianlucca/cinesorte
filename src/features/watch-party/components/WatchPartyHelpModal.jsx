import { FolderOpen, MonitorUp, ShieldCheck, UsersRound } from "lucide-react";
import Modal from "@shared/components/ui/Modal";

const items = [
  [MonitorUp, "Compartilhar tela ou janela", "O anfitrião escolhe uma aba, janela ou tela. Marque compartilhar áudio ao transmitir um filme."],
  [FolderOpen, "Transmitir uma pasta", "Os arquivos ficam no computador e seguem aos espectadores durante a transmissão. O CineSorte não salva o conteúdo nem envia os vídeos ao banco de dados."],
  [UsersRound, "Convites e controles", "Somente o anfitrião compartilha o código e inicia a mídia. Controles compartilhados não permitem transmitir."],
  [ShieldCheck, "Privacidade e moderação", "A entrada respeita a regra escolhida. Pessoas expulsas ficam bloqueadas na sala."],
];

export default function WatchPartyHelpModal({ isOpen, onClose }) {
  return <Modal isOpen={isOpen} onClose={onClose} title="Como funciona o Watch Party" size="md"><div className="space-y-3">{items.map(([icon, title, text]) => { const HelpIcon = icon; return <article key={title} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300"><HelpIcon size={17} /></span><div><h3 className="text-sm font-bold text-zinc-100">{title}</h3><p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p></div></article>; })}</div></Modal>;
}
