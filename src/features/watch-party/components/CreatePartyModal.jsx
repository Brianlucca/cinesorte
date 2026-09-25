import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, LockKeyhole, Radio, Search, SlidersHorizontal } from "lucide-react";
import { getUserFollowers, getUserFollowing } from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";
import Modal from "@shared/components/ui/Modal";
import { WATCH_PARTY_PRIVACY } from "@features/watch-party/data/watchPartyOptions";

const relationshipPrivacy = new Set(["followers", "following"]);

export default function CreatePartyModal({ isOpen, onClose, form, canCreate, onChange, onCreate }) {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingPeople, setLoadingPeople] = useState(false);
  const showPeople = relationshipPrivacy.has(form.privacy);

  useEffect(() => {
    if (!isOpen || !showPeople || !user?.uid) return;
    let active = true;
    setLoadingPeople(true);
    const request = form.privacy === "followers" ? getUserFollowers(user.uid) : getUserFollowing(user.uid);
    Promise.resolve(request).then((items) => { if (active) setPeople(Array.isArray(items) ? items : items?.items || []); }).catch(() => { if (active) setPeople([]); }).finally(() => { if (active) setLoadingPeople(false); });
    return () => { active = false; };
  }, [form.privacy, isOpen, showPeople, user?.uid]);

  const filteredPeople = useMemo(() => people.filter((person) => `${person.displayName || person.name || ""} ${person.username || ""}`.toLowerCase().includes(query.toLowerCase())), [people, query]);
  const togglePerson = (id) => onChange("selectedUserIds", form.selectedUserIds.includes(id) ? form.selectedUserIds.filter((item) => item !== id) : [...form.selectedUserIds, id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar transmissão" size="lg">
      <form onSubmit={(event) => { event.preventDefault(); onCreate(); }} className="space-y-5 p-1">
        <div><label htmlFor="party-name" className="mb-2 block text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500">Título da transmissão</label><input id="party-name" value={form.name} onChange={(event) => onChange("name", event.target.value)} maxLength={48} placeholder="O que você vai transmitir?" className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-violet-400/45" /><div className="mt-1.5 flex justify-between text-[9px] font-bold text-zinc-700"><span>Mostrado na descoberta</span><span>{form.name.length}/48</span></div></div>

        <div className="flex items-center gap-3 rounded-xl border border-violet-400/15 bg-violet-500/[0.07] p-3"><Radio size={16} className="shrink-0 text-violet-300" /><p className="text-xs leading-5 text-zinc-400">Escolha tela ou pasta no estúdio. Você poderá trocar a fonte durante a live.</p></div>

        <div><label htmlFor="party-privacy" className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">Privacidade</label><div className="relative"><LockKeyhole size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" /><select id="party-privacy" value={form.privacy} onChange={(event) => { onChange("privacy", event.target.value); onChange("selectedUserIds", []); }} className="w-full appearance-none rounded-2xl border border-white/[0.08] bg-black/20 py-3.5 pl-11 pr-11 text-sm font-semibold text-white outline-none">{WATCH_PARTY_PRIVACY.map((option) => <option key={option.id} value={option.id} className="bg-zinc-900">{option.label}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" /></div><p className="mt-2 text-[10px] leading-4 text-zinc-600">{WATCH_PARTY_PRIVACY.find((option) => option.id === form.privacy)?.description}</p></div>

        {showPeople && <section className="rounded-2xl border border-white/[0.07] bg-black/15 p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-zinc-200">Limitar a pessoas específicas</p><p className="mt-1 text-[10px] text-zinc-600">Sem seleção, toda a categoria escolhida poderá entrar.</p></div><span className="text-[9px] font-black uppercase text-violet-300">{form.selectedUserIds.length} selecionadas</span></div><div className="relative mt-3"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pessoa" className="w-full rounded-xl border border-white/[0.07] bg-black/25 py-2.5 pl-9 pr-3 text-xs text-white outline-none" /></div><div className="mt-3 max-h-44 space-y-2 overflow-y-auto">{loadingPeople ? <p className="py-4 text-center text-xs text-zinc-600">Carregando pessoas…</p> : filteredPeople.map((person) => { const id = person.id || person.uid; const selected = form.selectedUserIds.includes(id); return <button key={id} type="button" onClick={() => togglePerson(id)} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left ${selected ? "border-violet-400/25 bg-violet-500/10" : "border-white/[0.06] bg-white/[0.02]"}`}><span className="h-8 w-8 overflow-hidden rounded-lg bg-zinc-800">{person.photoURL && <img src={person.photoURL} alt="" className="h-full w-full object-cover" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-zinc-200">{person.displayName || person.name || person.username}</span><span className="block truncate text-[9px] text-zinc-600">@{person.username}</span></span>{selected && <Check size={14} className="text-violet-300" />}</button>; })}{!loadingPeople && !filteredPeople.length && <p className="py-4 text-center text-xs text-zinc-600">Nenhuma pessoa encontrada.</p>}</div></section>}

        <label className={`flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 ${form.service === "local" ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}><input type="checkbox" checked={form.service === "local" && form.allowGuestControl} disabled={form.service !== "local"} onChange={(event) => onChange("allowGuestControl", event.target.checked)} className="mt-1 h-4 w-4 accent-violet-500" /><span><span className="flex items-center gap-2 text-sm font-bold text-zinc-200"><SlidersHorizontal size={15} className="text-violet-300" /> Controles compartilhados</span><span className="mt-1 block text-xs leading-5 text-zinc-600">{form.service === "local" ? "Permite solicitar play, pausa e avanço." : "Disponível somente para Pasta de filmes; compartilhamento de tela é controlado pelo anfitrião."}</span></span></label>
        <div className="grid gap-3 border-t border-white/[0.07] pt-4 sm:grid-cols-2"><button type="button" onClick={onClose} className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-[10px] font-black uppercase text-zinc-300">Cancelar</button><button type="submit" disabled={!canCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-[10px] font-black uppercase text-white hover:bg-violet-400 disabled:opacity-40"><Radio size={15} /> Ir para o estúdio</button></div>
      </form>
    </Modal>
  );
}
