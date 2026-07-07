import { Sparkles } from "lucide-react";
import MessageAvatar from "./MessageAvatar";
import { formatRelative } from "./messageUtils";

function ThreadListItem({ thread, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 rounded-2xl border p-3 text-left transition-colors ${
        active
          ? "border-violet-400/20 bg-violet-500/10"
          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
      }`}
    >
      <MessageAvatar thread={thread} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-semibold text-zinc-100">{thread.displayName}</span>
          <span className="shrink-0 text-[10px] font-medium text-zinc-600">{formatRelative(thread.updatedAt)}</span>
        </span>
        <span className="mt-1 block truncate text-xs leading-5 text-zinc-500">
          {thread.lastMessagePreview || "Conversa pronta para comecar."}
        </span>
        <span className="mt-2 flex items-center gap-2">
          <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-zinc-600">
            {thread.subtitle}
          </span>
          {thread.unreadCount > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-violet-500 px-1.5 text-[10px] font-bold text-white">
              {thread.unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export default function MessageThreadList({ threads, activeThreadId, onSelect }) {
  if (threads.length === 0) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] p-5 text-center">
        <div>
          <Sparkles size={24} className="mx-auto text-zinc-700" />
          <p className="mt-3 text-sm font-semibold text-zinc-400">Nenhuma conversa ainda</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">Crie uma conversa privada ou grupo para comecar.</p>
        </div>
      </div>
    );
  }

  return threads.map((thread) => (
    <ThreadListItem
      key={thread.id}
      thread={thread}
      active={thread.id === activeThreadId}
      onClick={() => onSelect(thread.id)}
    />
  ));
}
