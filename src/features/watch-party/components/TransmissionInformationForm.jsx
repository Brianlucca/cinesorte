import { useEffect, useState } from "react";
import { Info, LockKeyhole, RefreshCw, SlidersHorizontal } from "lucide-react";
import { WATCH_PARTY_PRIVACY } from "@features/watch-party/data/watchPartyOptions";
import BroadcastMediaPicker from "@features/watch-party/components/BroadcastMediaPicker";

export default function TransmissionInformationForm({ room, onSave, onResetInvite, resettingInvite = false, profileDescription, submitLabel = "Salvar informações" }) {
  const [name, setName] = useState(room.name || "");
  const [privacy, setPrivacy] = useState(room.privacy || "invite");
  const [allowGuestControl, setAllowGuestControl] = useState(Boolean(room.allowGuestControl));
  const [media, setMedia] = useState(room.media || null);

  useEffect(() => {
    setName(room.name || "");
    setPrivacy(room.privacy || "invite");
    setAllowGuestControl(Boolean(room.allowGuestControl));
    setMedia(room.media || null);
  }, [room.allowGuestControl, room.id, room.media, room.name, room.privacy]);

  const trimmedName = name.trim();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ name: trimmedName, privacy, media, allowGuestControl: room.service === "local" && allowGuestControl });
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <BroadcastMediaPicker value={media} onChange={setMedia} />
      </div>
      <div>
        <label htmlFor={`transmission-title-${room.id}`} className="mb-2 block text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">Título da transmissão</label>
        <input id={`transmission-title-${room.id}`} value={name} onChange={(event) => setName(event.target.value)} minLength={3} maxLength={48} className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 text-sm font-bold text-white outline-none focus:border-violet-400/40" />
        <p className="mt-1.5 text-right text-[9px] text-zinc-700">{name.length}/48</p>
      </div>
      <div>
        <label htmlFor={`transmission-privacy-${room.id}`} className="mb-2 block text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">Quem pode assistir</label>
        <div className="relative">
          <LockKeyhole size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" />
          <select id={`transmission-privacy-${room.id}`} value={privacy} onChange={(event) => setPrivacy(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-black/25 pl-11 pr-4 text-sm font-bold text-white outline-none">
            {WATCH_PARTY_PRIVACY.map((option) => <option key={option.id} value={option.id} className="bg-zinc-900">{option.label}</option>)}
          </select>
        </div>
      </div>
      <label className={`flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-xs font-bold sm:col-span-2 ${room.service === "local" ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
        <input type="checkbox" checked={room.service === "local" && allowGuestControl} disabled={room.service !== "local"} onChange={(event) => setAllowGuestControl(event.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-500" />
        <SlidersHorizontal size={15} className="mt-0.5 shrink-0 text-violet-300" />
        <span><span className="block text-zinc-100">Controles compartilhados</span><span className="mt-1 block font-normal leading-5 text-zinc-600">{room.service === "local" ? "Participantes poderão controlar a reprodução." : "Disponível somente quando a fonte for Pasta de filmes. O compartilhamento de tela é controlado apenas pelo anfitrião."}</span></span>
      </label>
      {onResetInvite && <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.04] p-4 sm:col-span-2"><div className="flex items-start gap-3"><Info size={15} className="mt-0.5 shrink-0 text-amber-300" /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-zinc-200">Código de convite</p><p className="mt-1 font-mono text-sm font-black tracking-[0.18em] text-violet-300">{room.code}</p><p className="mt-1 text-[10px] leading-5 text-zinc-600">Ao gerar outro código, o atual deixa de funcionar imediatamente.</p></div><button type="button" disabled={resettingInvite} onClick={onResetInvite} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-300/20 px-3 py-2 text-[9px] font-black uppercase text-amber-200 disabled:opacity-40"><RefreshCw size={13} className={resettingInvite ? "animate-spin" : ""} /> Trocar código</button></div></div>}
      {profileDescription !== undefined && <div className="rounded-xl border border-white/[0.07] p-4 sm:col-span-2"><p className="text-[9px] font-black uppercase text-zinc-600">Descrição do perfil</p><p className="mt-2 text-sm leading-6 text-zinc-400">{profileDescription || "Sem descrição."}</p></div>}
      <button type="submit" disabled={trimmedName.length < 3} className="w-fit rounded-xl bg-white px-4 py-3 text-[9px] font-black uppercase text-black disabled:opacity-35">{submitLabel}</button>
    </form>
  );
}
