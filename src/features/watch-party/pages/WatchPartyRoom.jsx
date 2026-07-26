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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white animate-in fade-in duration-500">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(124,58,237,0.11),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.045),transparent_25%)]" />
      <div className="relative mx-auto w-full max-w-[1800px] px-4 pt-5 sm:px-6 md:px-8 xl:px-10">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5 pr-16 md:pr-20">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={actions.leave}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-white"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                  Sala ativa
                </p>
              </div>
              <h1 className="mt-1 truncate text-xl font-black tracking-[-0.025em] sm:text-2xl">
                {room.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 sm:inline-flex">
              <Wifi size={13} className="text-emerald-400" /> Sincronizado
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
                title="Configurações da sala"
              >
                <Settings2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={actions.leave}
              className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/10 bg-red-500/[0.06] text-red-300"
              title="Sair da sala"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0 space-y-5">
            {isHost && (isLocalRoom || isScreenShareRoom) ? (
              <PersistentHostBroadcast
                roomId={room.id}
                service={room.service}
                allowGuestControl={room.allowGuestControl}
                cinemaWidget={cinemaChat}
              />
            ) : isLocalRoom ? (
              <LocalVideoStage
                roomId={room.id}
                isHost={false}
                allowGuestControl={room.allowGuestControl}
                cinemaWidget={cinemaChat}
              />
            ) : isScreenShareRoom ? (
              <ScreenShareStage
                roomId={room.id}
                isHost={false}
                cinemaWidget={cinemaChat}
              />
            ) : (
              <YouTubePartyPlayer
                video={state.currentVideo}
                playback={room.playback}
                command={state.playerCommand}
                onControl={actions.controlPlayback}
                onEnded={actions.playNextVideo}
                canControl={canControl}
                cinemaWidget={cinemaChat}
              />
            )}
            {!isScreenShareRoom && !isLocalRoom && (
              <PartyQueue
                items={room.queue}
                currentVideoId={room.playback.videoId}
                onAdd={actions.openAddVideo}
                onSelect={actions.selectVideo}
                onRemove={actions.removeVideo}
              />
            )}
          </main>
          <aside>
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
      />
      <WatchPartyHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
