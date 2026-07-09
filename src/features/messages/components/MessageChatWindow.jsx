import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, Clapperboard, EyeOff, Film, Loader2, MessageCircle, MoreHorizontal, Send, Trash2, Users, X } from "lucide-react";
import MessageAvatar from "@features/messages/components/MessageAvatar";
import MediaAttachmentPanel from "@features/messages/components/MediaAttachmentPanel";
import MediaMessageCard from "@features/messages/components/MediaMessageCard";
import { formatMessageTime } from "@features/messages/utils/messageUtils";

function ConversationDetailsPanel({ thread, messages, onClose, onDeleteConversation, onDeleteGroup, onOpenProfile }) {
  const sharedMedia = messages
    .filter((message) => message.media)
    .map((message) => ({
      ...message.media,
      messageId: message.id,
      sharedAt: message.createdAt,
      sharedBy: message.isMine ? "Você" : message.senderUsername || "usuário",
      sharedByUsername: message.isMine ? null : message.senderUsername || null,
    }))
    .reverse();
  const members = thread.members || [];
  const privateMember = thread.type === "direct" ? members.find((member) => !member.isSelf) : null;
  const hideLabel = thread.type === "group" ? "Ocultar da minha lista" : "Apagar conversa";
  const HideIcon = thread.type === "group" ? EyeOff : Trash2;

  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l border-white/[0.07] bg-[#0d0d11]/98 shadow-[-24px_0_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:w-[340px]">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300">Detalhes</p>
          <h3 className="mt-1 text-sm font-semibold text-zinc-100">{thread.displayName}</h3>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white">
          <X size={17} />
        </button>
      </header>

      <div className="content-scrollbar flex-1 overflow-y-auto p-4">
        <section>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
            {thread.type === "group" ? <Users size={13} className="text-violet-300" /> : <AtSign size={13} className="text-violet-300" />}
            {thread.type === "group" ? "Participantes" : "Conversa privada"}
          </div>

          <div className="space-y-2">
            {(thread.type === "group" ? members : [privateMember].filter(Boolean)).map((member) => (
              <button
                key={member.username || member.name}
                type="button"
                onClick={() => onOpenProfile(member)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 text-left hover:bg-white/[0.04]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.06] bg-violet-500/10 text-sm font-bold text-violet-100">
                  {member.photoURL ? <img src={member.photoURL} alt="" className="h-full w-full object-cover" /> : member.name?.[0] || "U"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-100">
                    {member.isSelf ? "Você" : member.name || member.username}
                  </span>
                  <span className="block truncate text-xs text-zinc-600">
                    {member.username ? `@${member.username}` : member.levelTitle || "CineSorte"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              <Film size={13} className="text-cyan-300" />
              Filmes e séries
            </div>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] font-semibold text-zinc-600">
              {sharedMedia.length}
            </span>
          </div>

          {sharedMedia.length > 0 ? (
            <div className="space-y-2">
              {sharedMedia.map((media) => (
                <div key={`${media.messageId}-${media.id}`} className="space-y-1.5">
                  <MediaMessageCard media={media} horizontal />
                  <p className="px-1 text-[10px] text-zinc-700">
                    Compartilhado por{" "}
                    {media.sharedByUsername ? (
                      <button
                        type="button"
                        onClick={() => onOpenProfile({ username: media.sharedByUsername })}
                        className="font-semibold text-zinc-500 hover:text-violet-200"
                      >
                        @{media.sharedByUsername}
                      </button>
                    ) : (
                      media.sharedBy
                    )}{" "}
                    {media.sharedAt ? `as ${formatMessageTime(media.sharedAt)}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] px-4 py-6 text-center">
              <Film size={22} className="mx-auto text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-500">Nada compartilhado ainda</p>
              <p className="mt-1 text-xs leading-5 text-zinc-700">Quando alguem enviar um card, ele aparece aqui.</p>
            </div>
          )}
        </section>

        <section className="mt-6 space-y-2 border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={onDeleteConversation}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
              thread.type === "group"
                ? "border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                : "border-red-400/15 bg-red-500/10 text-red-200 hover:bg-red-500/15"
            }`}
          >
            <HideIcon size={14} />
            {hideLabel}
          </button>

          {thread.type === "group" && thread.isOwner && (
            <button
              type="button"
              onClick={onDeleteGroup}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-600/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-red-100 transition-colors hover:bg-red-600/20"
            >
              <Trash2 size={14} />
              Excluir grupo para todos
            </button>
          )}
        </section>
      </div>
    </aside>
  );
}

export default function MessageChatWindow({ thread, messages, loading, sending, onClose, onSend, onDeleteConversation, onDeleteGroup }) {
  const navigate = useNavigate();
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, thread?.id]);

  const submit = async () => {
    const text = draft.trim();
    if (!text && !selectedMedia) return;

    await onSend({ text, media: selectedMedia });
    setDraft("");
    setSelectedMedia(null);
    setShowAttachments(false);
  };

  const openProfile = (memberOrUsername) => {
    const isSelf = Boolean(memberOrUsername?.isSelf);
    const username = typeof memberOrUsername === "string" ? memberOrUsername : memberOrUsername?.username;
    navigate(isSelf || !username ? "/app/profile" : `/app/profile/${username}`);
  };

  const openThreadProfile = () => {
    if (thread.type !== "direct") return;
    const privateMember = (thread.members || []).find((member) => !member.isSelf);
    openProfile(privateMember || thread.username);
  };

  return (
    <section className="relative flex h-full min-h-0 w-full overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0d0d11] shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:h-[620px] md:w-[460px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d11]/95 px-4 py-3">
          <button
            type="button"
            onClick={openThreadProfile}
            disabled={thread.type !== "direct"}
            className="flex min-w-0 items-center gap-3 rounded-xl text-left disabled:cursor-default"
          >
            <MessageAvatar thread={thread} size="sm" />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-zinc-100">{thread.displayName}</h3>
              <p className="mt-0.5 truncate text-xs text-zinc-600">{thread.subtitle}</p>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white"
              title="Detalhes da conversa"
            >
              <MoreHorizontal size={17} />
            </button>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white">
              <X size={17} />
            </button>
          </div>
        </header>

        <div ref={listRef} className="content-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {loading ? (
            <div className="grid h-full place-items-center text-zinc-500">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const isMine = Boolean(message.isMine);
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-2`}>
                    {!isMine && thread.type === "group" && (
                      <button
                        type="button"
                        onClick={() => message.senderUsername && openProfile(message.senderUsername)}
                        className="text-[10px] font-semibold text-zinc-600 hover:text-violet-200"
                      >
                        @{message.senderUsername || "usuário"}
                      </button>
                    )}
                    {message.media && <MediaMessageCard media={message.media} />}
                    {message.text && (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isMine
                            ? "rounded-br-md bg-violet-500 text-white"
                            : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-zinc-300"
                        }`}
                      >
                        {message.text}
                      </div>
                    )}
                    <span className="text-[10px] text-zinc-700">{formatMessageTime(message.createdAt)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div className="max-w-xs">
                <MessageCircle size={28} className="mx-auto text-zinc-700" />
                <p className="mt-3 text-sm font-semibold text-zinc-400">Comece a conversa</p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">Envie uma mensagem ou um card de filme/serie para puxar assunto.</p>
              </div>
            </div>
          )}
        </div>

        {selectedMedia && (
          <div className="border-t border-white/[0.06] bg-[#0a0a0d] p-3">
            <div className="flex items-start gap-3">
              <MediaMessageCard media={selectedMedia} horizontal />
              <button type="button" onClick={() => setSelectedMedia(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {showAttachments && <MediaAttachmentPanel onPick={(media) => {
          setSelectedMedia(media);
          setShowAttachments(false);
        }} />}

        <footer className="border-t border-white/[0.06] bg-[#0d0d11]/95 p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-2">
            <button
              type="button"
              onClick={() => setShowAttachments((value) => !value)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                showAttachments ? "bg-violet-500/15 text-violet-200" : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Clapperboard size={18} />
            </button>
            <textarea
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="Escreva uma mensagem..."
              className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-5 text-zinc-200 outline-none placeholder:text-zinc-700"
            />
            <button
              type="button"
              onClick={submit}
              disabled={sending || (!draft.trim() && !selectedMedia)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-zinc-950 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>
        </footer>
      </div>

      {showDetails && (
        <ConversationDetailsPanel
          thread={thread}
          messages={messages}
          onClose={() => setShowDetails(false)}
          onDeleteConversation={onDeleteConversation}
          onDeleteGroup={onDeleteGroup}
          onOpenProfile={openProfile}
        />
      )}
    </section>
  );
}
