import {
  ArrowLeft,
  CircleHelp,
  Copy,
  LogOut,
  Radio,
  Settings2,
  UsersRound,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@shared/context/useAuth";
import AddVideoModal from "@features/watch-party/components/AddVideoModal";
import ParticipantsModal from "@features/watch-party/components/ParticipantsModal";
import RoomSettingsModal from "@features/watch-party/components/RoomSettingsModal";
import ScreenShareStage from "@features/watch-party/components/ScreenShareStage";
import PartyChat from "@features/watch-party/components/PartyChat";
import PartyQueue from "@features/watch-party/components/PartyQueue";
import YouTubePartyPlayer from "@features/watch-party/components/YouTubePartyPlayer";
import LocalVideoStage from "@features/watch-party/components/LocalVideoStage";
import { useWatchPartyRoom } from "@features/watch-party/hooks/useWatchPartyRoom";
import WatchPartyHelpModal from "@features/watch-party/components/WatchPartyHelpModal";
import { PersistentHostBroadcast } from "@features/watch-party/context/WatchPartyBroadcastContext";
import BroadcastSourceSwitcher from "@features/watch-party/components/BroadcastSourceSwitcher";

export default function WatchPartyRoom() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { user } = useAuth();
  const { state, actions } = useWatchPartyRoom();
  const { room } = state;

  if (state.loading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#08080b]">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-400" />
      </div>
    );

  if (!room) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08080b] p-6 text-center text-white">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-600">
            <Radio size={22} />
          </span>
          <h1 className="mt-5 text-2xl font-black">Sala não encontrada</h1>
          <p className="mt-2 text-sm text-zinc-600">
            O convite pode ter expirado ou a sessão foi encerrada.
          </p>
          <button
            type="button"
            onClick={actions.leave}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-950"
          >
            Voltar às salas
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = user?.uid || user?.username || "local-user";
  const isHost = room.hostId === currentUserId;
  const canControl = isHost || room.allowGuestControl;
  const isScreenShareRoom =
    room.service === "screen" || room.service === "prime";
  const isLocalRoom = room.service === "local";
  const cinemaChat = (
    <PartyChat
      compact
      messages={state.messages}
      currentUserId={currentUserId}
      onSend={actions.sendMessage}
    />
  );
  const broadcastStage = isHost && (isLocalRoom || isScreenShareRoom) ? (
    <PersistentHostBroadcast roomId={room.id} service={room.service} allowGuestControl={room.allowGuestControl} cinemaWidget={cinemaChat} widgetMessageCount={state.messages.length} />
  ) : isLocalRoom ? (
    <LocalVideoStage roomId={room.id} isHost={false} allowGuestControl={room.allowGuestControl} cinemaWidget={cinemaChat} widgetMessageCount={state.messages.length} />
  ) : isScreenShareRoom ? (
    <ScreenShareStage roomId={room.id} isHost={false} cinemaWidget={cinemaChat} widgetMessageCount={state.messages.length} />
  ) : (
    <YouTubePartyPlayer video={state.currentVideo} playback={room.playback} command={state.playerCommand} onControl={actions.controlPlayback} onEnded={actions.playNextVideo} canControl={canControl} cinemaWidget={cinemaChat} widgetMessageCount={state.messages.length} />
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-8 text-white animate-in fade-in duration-300">
      <div className="relative mx-auto w-full max-w-[1900px] px-3 pt-3 sm:px-5 md:px-6">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 pr-16 md:pr-20">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={actions.leave}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                  Estúdio
                </p>
              </div>
              <h1 className="truncate text-base font-black tracking-[-0.025em] sm:text-lg">
                {room.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 sm:inline-flex">
              <Wifi size={13} className={state.connected ? "text-emerald-400" : "text-amber-400"} /> {state.connected ? "Sincronizado" : "Reconectando"}
            </span>
            <button
              type="button"
              onClick={actions.openParticipants}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-[10px] font-bold text-zinc-300"
            >
              <UsersRound size={15} />
              <span>{state.participants.length}</span>
            </button>
            {isHost && (
              <button
                type="button"
                onClick={actions.copyInvite}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-[9px] font-black uppercase tracking-wider text-zinc-950"
              >
                <Copy size={14} />{" "}
                <span className="hidden sm:inline">Convidar</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white"
              title="Como funciona"
            >
              <CircleHelp size={16} />
            </button>
            {isHost && (
              <button
                type="button"
                onClick={actions.openSettings}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white"
              title="Configurações da transmissão"
              >
                <Settings2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={actions.leave}
              className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/10 bg-red-500/[0.06] text-red-300"
              title="Sair do estúdio"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0">
            {broadcastStage}
            <section className="mt-3 rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11] px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {(room.host?.photoURL || (isHost && user?.photoURL)) ? <img src={room.host?.photoURL || user.photoURL} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-red-500/70" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-500/20 font-black text-violet-200">{(room.host?.username || (isHost && user?.username))?.[0]?.toUpperCase() || "C"}</span>}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><span className="rounded bg-red-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide">Ao vivo</span><span className="inline-flex items-center gap-1 text-[10px] text-zinc-500"><UsersRound size={12} /> {state.participants.length || 1}</span></div>
                    <h2 className="mt-1 truncate text-base font-black text-white sm:text-lg">{room.name}</h2>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">@{room.host?.username || (isHost ? user?.username : "cinesorte")} · {room.media?.title || (room.service === "local" ? "Filmes e séries" : "Compartilhamento de tela")}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={actions.copyInvite} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[9px] font-black uppercase tracking-wide text-zinc-300 hover:bg-white/[0.08]"><Copy size={13} /> Compartilhar</button>
                  {isHost && <button type="button" onClick={actions.openSettings} className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-500 px-3 text-[9px] font-black uppercase tracking-wide text-white hover:bg-violet-400"><Settings2 size={13} /> Editar live</button>}
                </div>
              </div>
              {isHost && <div className="mt-4 border-t border-white/[0.06] pt-3"><BroadcastSourceSwitcher service={room.service} switching={state.switchingSource} onChange={actions.switchSource} onSettings={actions.openSettings} /></div>}
            </section>
            {!isScreenShareRoom && !isLocalRoom && (
              <div className="mt-3"><PartyQueue
                items={room.queue}
                currentVideoId={room.playback.videoId}
                onAdd={actions.openAddVideo}
                onSelect={actions.selectVideo}
                onRemove={actions.removeVideo}
              /></div>
            )}
          </main>
          <aside className="sticky top-3">
            <PartyChat
              messages={state.messages}
              currentUserId={currentUserId}
              onSend={actions.sendMessage}
            />
          </aside>
        </div>
      </div>
      <AddVideoModal
        isOpen={state.isAddVideoOpen}
        onClose={actions.closeAddVideo}
        onAdd={actions.addVideo}
      />
      <ParticipantsModal
        isOpen={state.isParticipantsOpen}
        onClose={actions.closeParticipants}
        participants={state.participants}
        isHost={isHost}
        onBlock={actions.blockParticipant}
      />
      <RoomSettingsModal
        isOpen={state.isSettingsOpen}
        onClose={actions.closeSettings}
        room={room}
        onSave={actions.updateSettings}
        onDelete={actions.deleteRoom}
        onResetInvite={actions.resetInviteCode}
        resettingInvite={state.resettingInvite}
      />
      <WatchPartyHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
