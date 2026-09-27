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
    () => state.followingRooms.filter((room) =>
      `${room.name} ${room.host?.username || ""}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [query, state.followingRooms],
  );

  const openStudio = () => {
    if (myRoom) navigate(`/app/watch-party/${myRoom.id}`);
    else setTab("creator");
  };

  return (
    <div className="min-h-screen bg-[#111216] pb-24 text-white">
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-7 sm:px-7 md:pt-10 xl:px-10">
        <header className="border-b border-white/[0.06] pb-6 md:pb-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <Radio size={14} className="text-violet-400" />
                Experiência compartilhada
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-zinc-100 sm:text-4xl">CineParty</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Assista, transmita e converse em tempo real com a sua comunidade.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-[290px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar canais ao vivo" className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.018] pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-400/40" />
              </div>
              <button type="button" onClick={openStudio} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100">
                <Radio size={15} /> {myRoom ? "Abrir estúdio" : "Transmitir"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <nav className="flex overflow-x-auto border-b border-white/[0.06]">
              {tabs.map(({ id, label, icon }) => (
                <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${tab === id ? "border-violet-400 text-white" : "border-transparent text-zinc-500 hover:text-zinc-200"}`}>
                  {createElement(icon, { size: 14 })} {label}
                </button>
              ))}
            </nav>

            <div className="flex h-10 items-center rounded-xl border border-white/[0.06] bg-white/[0.018] p-1 pl-3">
              <KeyRound size={13} className="shrink-0 text-violet-300" />
              <input aria-label="Código da transmissão" value={state.inviteCode} onChange={(event) => actions.updateInviteCode(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") actions.joinRoom(); }} placeholder="Código da live" className="mx-2.5 h-8 min-w-0 flex-1 border-l border-white/[0.06] bg-transparent pl-3 pr-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white outline-none placeholder:text-zinc-600 sm:w-32" />
              <button type="button" disabled={!state.canJoin} onClick={actions.joinRoom} className="h-8 rounded-lg bg-violet-500/15 px-3 text-[11px] font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:bg-white/[0.03] disabled:text-zinc-700">Entrar</button>
            </div>
          </div>
        </header>

        {tab === "discover" && <FollowingPartyRooms rooms={filteredRooms} loading={state.loadingRooms} onCreate={() => setTab("creator")} />}
        {tab === "channel" && <CreatorChannelPanel mode="channel" user={user} room={myRoom} loading={state.loadingRooms} onCreate={() => setTab("creator")} onOpenStudio={openStudio} />}
        {tab === "creator" && <CreatorChannelPanel mode="creator" user={user} room={myRoom} loading={state.loadingRooms} form={state.form} canCreate={state.canCreate} onChange={actions.updateField} onCreate={actions.createRoom} onSave={actions.updateTransmission} onResetInvite={actions.resetInviteCode} resettingInvite={state.resettingInvite} onOpenStudio={openStudio} />}
      </div>
    </div>
  );
}
