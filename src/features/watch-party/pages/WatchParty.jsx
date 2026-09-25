import { createElement, useMemo, useState } from "react";
import { BarChart3, KeyRound, Radio, Search, UsersRound, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FollowingPartyRooms from "@features/watch-party/components/FollowingPartyRooms";
import CreatorChannelPanel from "@features/watch-party/components/CreatorChannelPanel";
import { useWatchPartyLobby } from "@features/watch-party/hooks/useWatchPartyLobby";
import { useAuth } from "@shared/context/useAuth";

const tabs = [
  { id: "discover", label: "Explorar", icon: Video },
  { id: "channel", label: "Meu perfil", icon: UsersRound },
  { id: "creator", label: "Painel do criador", icon: BarChart3 },
];

export default function WatchParty() {
  const { state, actions } = useWatchPartyLobby();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("discover");
  const [query, setQuery] = useState("");
  const myRoom = state.myRooms[0];
  const filteredRooms = useMemo(
    () => state.followingRooms.filter((room) => (room.name + " " + (room.host?.username || "")).toLowerCase().includes(query.toLowerCase())),
    [query, state.followingRooms],
  );
  const openStudio = () => {
    if (myRoom) navigate("/app/watch-party/" + myRoom.id);
    else setTab("creator");
  };

  return (
    <div className="min-h-screen bg-[#08080b] pb-24 text-white">
      <div className="mx-auto w-full max-w-[1700px] px-4 pt-5 sm:px-6 md:pl-10 md:pr-24 xl:pl-12 xl:pr-24">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] pb-4">
          <div className="mr-auto flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500"><Video size={17} /></span><div><h1 className="text-lg font-black tracking-tight">CineParty</h1><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-600">Ao vivo</p></div></div>
          <div className="relative order-3 w-full lg:order-none lg:w-[360px]"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar canais ao vivo" className="h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none focus:border-violet-400/40" /></div>
          <button type="button" onClick={openStudio} className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-500 px-4 text-[9px] font-black uppercase tracking-wider hover:bg-violet-400"><Radio size={14} /> {myRoom ? "Abrir estúdio" : "Transmitir"}</button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.07] py-3">
          {tabs.map(({ id, label, icon }) => <button key={id} type="button" onClick={() => setTab(id)} className={"inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-[10px] font-black uppercase tracking-wide transition " + (tab === id ? "bg-white text-zinc-950" : "text-zinc-500 hover:bg-white/[0.04] hover:text-white")}>{createElement(icon, { size: 14 })} {label}</button>)}
          <div className="ml-auto hidden items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.035] p-1.5 pl-3 shadow-inner md:flex"><KeyRound size={14} className="text-violet-300" /><input aria-label="Código da transmissão" value={state.inviteCode} onChange={(event) => actions.updateInviteCode(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") actions.joinRoom(); }} placeholder="CÓDIGO DA LIVE" className="h-8 w-36 border-l border-white/[0.08] bg-transparent pl-3 font-mono text-[10px] font-black uppercase tracking-wider text-white outline-none placeholder:text-zinc-500" /><button type="button" disabled={!state.canJoin} onClick={actions.joinRoom} className="h-8 rounded-lg bg-violet-500 px-3 text-[9px] font-black uppercase text-white disabled:bg-white/[0.06] disabled:text-zinc-600">Entrar</button></div>
        </nav>
        {tab === "discover" && <FollowingPartyRooms rooms={filteredRooms} loading={state.loadingRooms} onCreate={() => setTab("creator")} />}
        {tab === "channel" && <CreatorChannelPanel mode="channel" user={user} room={myRoom} loading={state.loadingRooms} onCreate={() => setTab("creator")} onOpenStudio={openStudio} />}
        {tab === "creator" && <CreatorChannelPanel mode="creator" user={user} room={myRoom} loading={state.loadingRooms} form={state.form} canCreate={state.canCreate} onChange={actions.updateField} onCreate={actions.createRoom} onSave={actions.updateTransmission} onResetInvite={actions.resetInviteCode} resettingInvite={state.resettingInvite} onOpenStudio={openStudio} />}
      </div>
    </div>
  );
}
