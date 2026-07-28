import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

export default function PartyChat({ messages, currentUserId, onSend, compact = false }) {
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    if (onSend(draft) !== false) setDraft("");
  };

  return (
    <section className={`flex flex-col overflow-hidden bg-[#0d0d11]/95 ${compact ? "h-full min-h-0 rounded-none border-0" : "min-h-[480px] rounded-[1.5rem] border border-white/[0.08] xl:h-[calc(100vh-220px)] xl:min-h-[560px]"}`}>
      <header className="border-b border-white/[0.06] px-4 py-4"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-violet-300"><MessageCircle size={14} /> Chat da sala</p><p className="mt-1 text-xs text-zinc-600">Mensagens temporárias: somem após 1 minuto.</p></header>
      <div ref={listRef} className="content-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length ? messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] ${mine ? "items-end" : "items-start"} flex flex-col`}><span className="mb-1 px-1 text-[9px] font-bold text-zinc-600">{mine ? "Você" : message.senderName}</span><p className={`rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${mine ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md border border-white/[0.07] bg-white/[0.045] text-zinc-300"}`}>{message.text}</p><time className="mt-1 px-1 text-[8px] text-zinc-700">{new Date(message.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div></div>;
        }) : <div className="grid h-full place-items-center text-center"><div><MessageCircle size={25} className="mx-auto text-zinc-700" /><p className="mt-3 text-sm font-bold text-zinc-500">A conversa começa aqui</p><p className="mt-1 text-xs text-zinc-700">Mande uma mensagem para a galera.</p></div></div>}
      </div>
      <form onSubmit={submit} className="border-t border-white/[0.06] p-3"><div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-2 focus-within:border-violet-400/35"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) submit(event); }} rows={1} maxLength={500} placeholder="Mensagem para a sala..." className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-zinc-700" /><button type="submit" disabled={!draft.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-950 disabled:opacity-30"><Send size={14} /></button></div></form>
    </section>
  );
}
