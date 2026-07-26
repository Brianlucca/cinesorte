import { AlertTriangle, ArrowRight, KeyRound, Plus } from "lucide-react";
import CreatePartyModal from "@features/watch-party/components/CreatePartyModal";
import FollowingPartyRooms from "@features/watch-party/components/FollowingPartyRooms";
import MyPartyRooms from "@features/watch-party/components/MyPartyRooms";
import { useWatchPartyLobby } from "@features/watch-party/hooks/useWatchPartyLobby";

export default function WatchParty() {
  const { state, actions } = useWatchPartyLobby();
  return (
    <div className="relative min-h-screen bg-[#08080b] pb-28 text-white animate-in fade-in duration-300">
      <div className="relative mx-auto w-full max-w-[1700px] px-4 pt-7 sm:px-6 md:px-10 xl:px-12">
        <header className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
              CineSorte Party
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Assista e converse com outras pessoas em tempo real.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex min-h-11 items-center rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
              <KeyRound size={14} className="ml-3 text-zinc-600" />
              <input
                aria-label="Código da sala"
                value={state.inviteCode}
                onChange={(event) =>
                  actions.updateInviteCode(event.target.value)
                }
                placeholder="CÓDIGO DA SALA"
                className="min-w-0 flex-1 bg-transparent px-3 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white outline-none placeholder:text-zinc-700 sm:w-40"
              />
              <button
                type="button"
                onClick={actions.joinRoom}
                disabled={!state.canJoin}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.06] text-zinc-400 hover:bg-white hover:text-black disabled:opacity-30"
              >
                <ArrowRight size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={actions.openCreate}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-[9px] font-black uppercase tracking-[0.1em] text-white hover:bg-violet-400"
            >
              <Plus size={15} /> Criar sala
            </button>
          </div>
        </header>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3.5 text-red-100">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-300">
            <AlertTriangle size={16} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-300">
              Recurso em testes
            </p>
            <p className="mt-1 text-xs leading-5 text-red-100/70 sm:text-sm">
              O CineSorte Party ainda está em fase de testes e pode sofrer alterações a qualquer momento.
            </p>
          </div>
        </div>

        <FollowingPartyRooms
          rooms={state.followingRooms}
          loading={state.loadingRooms}
          onCreate={actions.openCreate}
        />
        <MyPartyRooms rooms={state.myRooms} loading={state.loadingRooms} />
      </div>
      <CreatePartyModal
        isOpen={state.isCreateOpen}
        onClose={actions.closeCreate}
        form={state.form}
        canCreate={state.canCreate}
        onChange={actions.updateField}
        onCreate={actions.createRoom}
      />
    </div>
  );
}
