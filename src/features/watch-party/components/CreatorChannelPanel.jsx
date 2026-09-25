import { BarChart3, Copy, Eye, FolderOpen, LockKeyhole, MonitorUp, Radio, Settings2, SlidersHorizontal, UsersRound } from "lucide-react";
import { useToast } from "@shared/context/useToast";
import { createElement, useState } from "react";
import { WATCH_PARTY_PRIVACY } from "@features/watch-party/data/watchPartyOptions";
import BroadcastMediaPicker from "@features/watch-party/components/BroadcastMediaPicker";
import TransmissionInformationForm from "@features/watch-party/components/TransmissionInformationForm";

function SourcePicker({ value, onChange }) {
  return <div><p className="mb-2 text-[9px] font-black uppercase tracking-wider text-zinc-500">Fonte da transmissão</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => onChange("screen")} className={"flex h-12 items-center gap-3 rounded-xl border px-4 text-left text-xs font-bold transition " + (value === "screen" ? "border-violet-400/50 bg-violet-500/15 text-white" : "border-white/[0.07] bg-black/15 text-zinc-500 hover:text-white")}><MonitorUp size={16} /><span>Tela ou janela</span></button><button type="button" onClick={() => onChange("local")} className={"flex h-12 items-center gap-3 rounded-xl border px-4 text-left text-xs font-bold transition " + (value === "local" ? "border-violet-400/50 bg-violet-500/15 text-white" : "border-white/[0.07] bg-black/15 text-zinc-500 hover:text-white")}><FolderOpen size={16} /><span>Pasta de filmes</span></button></div><p className="mt-1.5 text-[9px] text-zinc-700">Você também poderá alternar durante a live.</p></div>;
}

export default function CreatorChannelPanel({ mode, user, room, loading, form, canCreate, onChange, onCreate, onSave, onResetInvite, resettingInvite, onOpenStudio }) {
  const toast = useToast();
  const [creatorSection, setCreatorSection] = useState("Transmissão");
  const copyCode = async () => {
    if (!room?.code) return;
    await navigator.clipboard.writeText(room.code);
    toast.success("Código copiado", room.code);
  };
  const avatar = <span className="relative z-20 grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-[#0d0d11] bg-violet-500 text-2xl font-black shadow-[0_8px_24px_rgba(0,0,0,.45)]">{user?.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : (user?.name || user?.username || "C")[0].toUpperCase()}</span>;

  if (loading) return <div className="mt-6 h-80 animate-pulse rounded-2xl bg-white/[0.025]" />;
  if (!room && mode === "creator") return (
    <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-3">
        <p className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-zinc-600">Painel do criador</p>
        {[["Transmissão", Radio], ["Comunidade", UsersRound], ["Análises", BarChart3]].map(([label, icon]) => <button key={label} type="button" onClick={() => setCreatorSection(label)} className={"flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold " + (creatorSection === label ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:bg-white/[0.035] hover:text-white")}>{createElement(icon, { size: 15 })} {label}</button>)}
      </aside>
      {creatorSection === "Transmissão" ? <main className="rounded-2xl border border-white/[0.07] bg-[#0d0d11]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><h2 className="text-base font-black">Configuração da transmissão</h2><p className="mt-0.5 text-[10px] text-zinc-600">Defina as informações antes de entrar ao vivo.</p></div><span className="rounded-md bg-white/[0.06] px-2 py-1 text-[8px] font-black uppercase text-zinc-500">Offline</span></div>
        <form onSubmit={(event) => { event.preventDefault(); onCreate(); }} className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <BroadcastMediaPicker value={form.media} onChange={(media) => onChange("media", media)} />
            <SourcePicker value={form.service} onChange={(service) => onChange("service", service)} />
            <div><label htmlFor="creator-stream-title" className="mb-2 block text-[9px] font-black uppercase tracking-wider text-zinc-500">Título da transmissão</label><input id="creator-stream-title" value={form.name} onChange={(event) => onChange("name", event.target.value)} maxLength={48} placeholder="O que você vai transmitir?" className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 text-sm font-semibold text-white outline-none focus:border-violet-400/45" /><div className="mt-1.5 flex justify-between text-[9px] text-zinc-700"><span>Aparece nos cards da descoberta</span><span>{form.name.length}/48</span></div></div>
            <div><label htmlFor="creator-stream-privacy" className="mb-2 block text-[9px] font-black uppercase tracking-wider text-zinc-500">Quem pode assistir</label><div className="relative"><LockKeyhole size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" /><select id="creator-stream-privacy" value={form.privacy} onChange={(event) => onChange("privacy", event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-black/25 pl-11 pr-4 text-sm font-semibold text-white outline-none">{WATCH_PARTY_PRIVACY.map((option) => <option key={option.id} value={option.id} className="bg-zinc-900">{option.label}</option>)}</select></div><p className="mt-1.5 text-[9px] text-zinc-700">{WATCH_PARTY_PRIVACY.find((option) => option.id === form.privacy)?.description}</p></div>
            <label className={`flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-3 ${form.service === "local" ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}><input type="checkbox" checked={form.service === "local" && form.allowGuestControl} disabled={form.service !== "local"} onChange={(event) => onChange("allowGuestControl", event.target.checked)} className="h-4 w-4 accent-violet-500" /><SlidersHorizontal size={15} className="text-violet-300" /><span><span className="block text-xs font-bold text-zinc-200">Controles compartilhados</span><span className="mt-0.5 block text-[9px] text-zinc-600">{form.service === "local" ? "Participantes podem solicitar play, pausa e avanço." : "Disponível somente para Pasta de filmes; compartilhamento de tela é controlado pelo anfitrião."}</span></span></label>
          </div>
          <aside className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-black/20 p-4"><div><p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Próxima etapa</p><p className="mt-3 text-sm font-bold">Escolher a fonte</p><p className="mt-1 text-[10px] leading-5 text-zinc-600">No estúdio você escolhe tela ou pasta e pode alternar durante a transmissão.</p></div><button type="submit" disabled={!canCreate} className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-[9px] font-black uppercase text-white hover:bg-violet-400 disabled:opacity-35"><Radio size={14} /> Entrar no estúdio</button></aside>
        </form>
      </main> : <main className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-6">
        <div className="flex items-center gap-4">{avatar}<div><p className="text-xl font-black">{creatorSection}</p><p className="mt-1 text-xs text-zinc-600">@{user?.username}</p></div></div>
        {creatorSection === "Comunidade" && <div className="mt-7 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-white/[0.07] p-5"><strong className="text-2xl">{user?.followersCount || 0}</strong><p className="mt-1 text-xs text-zinc-600">Seguidores</p></article><article className="rounded-xl border border-white/[0.07] p-5"><strong className="text-2xl">{user?.followingCount || 0}</strong><p className="mt-1 text-xs text-zinc-600">Seguindo</p></article><article className="rounded-xl border border-white/[0.07] p-5"><strong className="text-2xl">0</strong><p className="mt-1 text-xs text-zinc-600">No canal agora</p></article></div>}
        {creatorSection === "Análises" && <div className="mt-7 grid min-h-52 place-items-center rounded-xl border border-dashed border-white/[0.08]"><div className="text-center"><BarChart3 size={25} className="mx-auto text-zinc-700" /><p className="mt-3 text-sm font-bold text-zinc-400">Resumo do canal</p><p className="mt-1 text-xs text-zinc-600">{user?.followersCount || 0} seguidores · nenhuma transmissão ativa</p></div></div>}
      </main>}
    </div>
  );
  if (!room) return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d11]">
      <div className="relative h-40 bg-[radial-gradient(circle_at_75%_30%,rgba(124,58,237,.35),transparent_40%),linear-gradient(135deg,#211638,#111116)]">{user?.backgroundURL && <img src={user.backgroundURL} alt="" className="absolute inset-0 h-full w-full object-cover" />}<span className="absolute left-4 top-4 rounded-md bg-black/70 px-2 py-1 text-[8px] font-black uppercase text-zinc-300">Offline</span></div>
      <div className="relative z-10 px-5 pb-6 sm:px-7"><div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">{avatar}<div className="min-w-0 flex-1 pb-1"><h2 className="text-xl font-black">{user?.name || user?.username}</h2><p className="text-xs text-zinc-500">@{user?.username}</p></div><button type="button" onClick={onCreate} className="h-10 rounded-lg bg-violet-500 px-5 text-[9px] font-black uppercase"><Radio size={13} className="mr-2 inline" /> Transmitir</button></div><div className="mt-5 flex flex-wrap items-start justify-between gap-5 border-t border-white/[0.07] pt-5"><p className="max-w-2xl text-sm leading-6 text-zinc-500">{user?.bio || "Sem descrição no perfil."}</p><div className="flex gap-5 text-xs"><span><strong className="mr-1 text-white">{user?.followersCount || 0}</strong> seguidores</span><span><strong className="mr-1 text-white">{user?.followingCount || 0}</strong> seguindo</span></div></div></div>
    </section>
  );

  if (mode === "creator") return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-3">
        <p className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-zinc-600">Painel do criador</p>
        {[["Transmissão", Radio], ["Informações da transmissão", Settings2], ["Comunidade", UsersRound], ["Análises", BarChart3]].map(([label, icon]) => <button key={label} type="button" onClick={() => setCreatorSection(label)} className={"flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold " + (creatorSection === label ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:text-white")}>{createElement(icon, { size: 15 })} {label}</button>)}
      </aside>
      {creatorSection === "Transmissão" ? <main className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[["Status", room.isLive ? "AO VIVO" : "OFFLINE", Radio], ["Espectadores", room.participantCount || 0, Eye], ["Seguidores", user?.followersCount || 0, UsersRound], ["Fonte", room.service === "local" ? "Pasta" : "Tela", room.service === "local" ? FolderOpen : MonitorUp]].map(([label, value, icon]) => <article key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-5">{createElement(icon, { size: 16, className: "text-violet-300" })}<p className="mt-5 text-[9px] font-black uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-1 text-lg font-black">{value}</p></article>)}
        </div>
        <section className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-4"><div className="max-w-[440px]"><SourcePicker value={room.service} onChange={(service) => onSave({ service })} /></div></section>
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid min-h-72 place-items-center rounded-2xl border border-white/[0.07] bg-[#0d0d11] text-center"><div><Radio size={26} className="mx-auto text-zinc-700" /><p className="mt-3 text-sm font-bold text-zinc-400">{room.isLive ? "Sua transmissão está ao vivo" : "Seu canal está offline"}</p><button type="button" onClick={onOpenStudio} className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-[10px] font-black uppercase">{room.isLive ? "Gerenciar transmissão" : "Iniciar transmissão"}</button></div></div>
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-5"><h3 className="text-sm font-black">Ações da transmissão</h3><button type="button" onClick={copyCode} className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.08] p-3 text-xs font-bold text-zinc-300"><span className="inline-flex items-center gap-2"><Copy size={14} /> Convite</span><span className="font-mono text-violet-300">{room.code}</span></button><button type="button" onClick={() => setCreatorSection("Informações da transmissão")} className="mt-2 flex w-full items-center gap-2 rounded-xl border border-white/[0.08] p-3 text-xs font-bold text-zinc-300"><Settings2 size={14} /> Editar informações</button></div>
        </section>
      </main> : <main className="rounded-2xl border border-white/[0.07] bg-[#0d0d11] p-6">
        <div className="flex items-center gap-4">{avatar}<div><p className="text-xl font-black">{creatorSection}</p><p className="mt-1 text-xs text-zinc-600">@{user?.username}</p></div></div>
        {creatorSection === "Informações da transmissão" && <div className="mt-7"><TransmissionInformationForm room={room} onSave={onSave} onResetInvite={onResetInvite} resettingInvite={resettingInvite} profileDescription={user?.bio} /></div>}
        {creatorSection === "Comunidade" && <div className="mt-7 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-white/[0.07] p-5"><strong className="text-2xl">{user?.followersCount || 0}</strong><p className="mt-1 text-xs text-zinc-600">Seguidores</p></article><article className="rounded-xl border border-white/[0.07] p-5"><strong className="text-2xl">{user?.followingCount || 0}</strong><p className="mt-1 text-xs text-zinc-600">Seguindo</p></article><article className="rounded-xl border border-white/[0.07] p-5"><strong className="text-2xl">{room.participantCount || 0}</strong><p className="mt-1 text-xs text-zinc-600">No canal agora</p></article></div>}
        {creatorSection === "Análises" && <div className="mt-7 grid min-h-52 place-items-center rounded-xl border border-dashed border-white/[0.08]"><div className="text-center"><BarChart3 size={25} className="mx-auto text-zinc-700" /><p className="mt-3 text-sm font-bold text-zinc-400">Resumo do canal</p><p className="mt-1 text-xs text-zinc-600">{user?.followersCount || 0} seguidores · {room.participantCount || 0} espectadores agora</p></div></div>}
      </main>}
    </div>
  );

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d11]">
      <div className="relative h-40 bg-[radial-gradient(circle_at_75%_30%,rgba(124,58,237,.35),transparent_40%),linear-gradient(135deg,#211638,#111116)]">
        {user?.backgroundURL && <img src={user.backgroundURL} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <span className={"absolute left-5 top-5 rounded-md px-2.5 py-1.5 text-[9px] font-black uppercase " + (room.isLive ? "bg-red-600 text-white" : "bg-black/70 text-zinc-300")}>{room.isLive ? "Ao vivo" : "Offline"}</span>
      </div>
      <div className="relative z-10 px-5 pb-6 sm:px-7">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">{avatar}<div className="min-w-0 flex-1 pb-1"><h2 className="truncate text-2xl font-black">{user?.name || user?.username}</h2><p className="text-xs text-zinc-500">@{user?.username}</p></div><button type="button" onClick={onOpenStudio} className="h-11 rounded-xl bg-violet-500 px-5 text-[10px] font-black uppercase">{room.isLive ? "Abrir transmissão" : "Transmitir ao vivo"}</button></div>
        <div className="mt-6 grid gap-6 border-t border-white/[0.07] pt-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div><h3 className="text-lg font-black">{room.name}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{user?.bio || "Este canal ainda não adicionou uma descrição."}</p></div>
          <div className="flex gap-6 text-sm"><p><strong className="block text-lg text-white">{user?.followersCount || 0}</strong><span className="text-zinc-600">seguidores</span></p><p><strong className="block text-lg text-white">{user?.followingCount || 0}</strong><span className="text-zinc-600">seguindo</span></p></div>
        </div>
      </div>
    </section>
  );
}
