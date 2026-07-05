import { useMemo, useState } from "react";
import Modal from "../ui/Modal";

const STATUS_LABELS = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Fechado",
};

const STATUS_STYLES = {
  open: "border-emerald-400/15 bg-emerald-500/10 text-emerald-300",
  answered: "border-amber-400/15 bg-amber-500/10 text-amber-300",
  closed: "border-red-400/15 bg-red-500/10 text-red-300",
};

function formatTicketDate(value) {
  if (!value) return "Agora mesmo";
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatTicketDayLabel(value) {
  if (!value) return "Hoje";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function truncateMessage(message, maxLength = 110) {
  if (!message) return "Sem mensagem.";
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength).trim()}...`;
}

function buildFallbackConversation(ticket) {
  const items = [];

  if (ticket.message) {
    items.push({
      id: `${ticket.protocol}-user`,
      role: "user",
      message: ticket.message,
      createdAt: ticket.createdAt,
      author: "Você",
    });
  }

  if (ticket.adminResponse) {
    items.push({
      id: `${ticket.protocol}-admin`,
      role: "admin",
      message: ticket.adminResponse,
      createdAt: ticket.adminRespondedAt || ticket.updatedAt,
      author: "Equipe CineSorte",
    });
  }

  if (ticket.resolutionNote) {
    items.push({
      id: `${ticket.protocol}-resolution`,
      role: "admin",
      message: ticket.resolutionNote,
      createdAt: ticket.closedAt || ticket.updatedAt,
      author: "Equipe CineSorte",
      isResolution: true,
    });
  }

  return items;
}

function normalizeConversationEntry(entry) {
  return {
    ...entry,
    author: entry.author || (entry.role === "admin" ? "Equipe CineSorte" : "Você"),
  };
}

function getConversation(ticket) {
  const fallback = buildFallbackConversation(ticket);
  const conversation = Array.isArray(ticket.conversation) ? ticket.conversation.map(normalizeConversationEntry) : [];

  if (!conversation.length) {
    return fallback;
  }

  const hasUserOpeningMessage = conversation.some(
    (entry) => entry.role === "user" && String(entry.message || "").trim() === String(ticket.message || "").trim(),
  );

  if (!hasUserOpeningMessage && ticket.message) {
    conversation.unshift({
      id: `${ticket.protocol}-user`,
      role: "user",
      message: ticket.message,
      createdAt: ticket.createdAt,
      author: "Você",
    });
  }

  return conversation.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
}

function buildTimelineEntries(conversation) {
  const items = [];
  let lastDay = null;

  conversation.forEach((entry) => {
    const dayKey = entry.createdAt ? new Date(entry.createdAt).toDateString() : "sem-data";

    if (dayKey !== lastDay) {
      items.push({
        type: "day",
        id: `day-${dayKey}-${items.length}`,
        label: formatTicketDayLabel(entry.createdAt),
      });
      lastDay = dayKey;
    }

    items.push({
      type: "entry",
      ...entry,
    });
  });

  return items;
}

export default function SupportTicketTable({ tickets, isLoading, onRefresh }) {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const rows = useMemo(
    () =>
      tickets.map((ticket) => ({
        ...ticket,
        preview: truncateMessage(ticket.message),
        conversation: getConversation(ticket),
      })),
    [tickets],
  );

  return (
    <>
      <section className="min-h-[520px] rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-5 lg:p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">Histórico de suporte</p>
            <h4 className="mt-1 text-xl font-black tracking-[-0.025em] text-white">Meus protocolos</h4>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Visualização rápida dos chamados já enviados.</p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isLoading ? "Atualizando" : "Atualizar"}
          </button>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-black/20 md:block">
          <div className="grid grid-cols-[1.1fr_1.3fr_0.75fr_0.9fr_0.9fr] gap-4 border-b border-white/[0.06] bg-white/[0.025] px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            <span>Protocolo</span>
            <span>Assunto</span>
            <span>Status</span>
            <span>Data</span>
            <span>Detalhes</span>
          </div>

          {isLoading ? (
            <div className="px-5 py-8 text-sm font-medium text-zinc-500">Carregando protocolos...</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-8 text-sm font-medium text-zinc-500">Você ainda não abriu nenhum chamado por aqui.</div>
          ) : (
            rows.map((ticket) => (
              <div key={ticket.id || ticket.protocol} className="border-b border-white/[0.06] last:border-b-0">
                <div className="grid grid-cols-[1.1fr_1.3fr_0.75fr_0.9fr_0.9fr] items-center gap-4 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-left text-sm font-black text-violet-300 transition-colors hover:text-violet-200"
                  >
                    {ticket.protocol}
                  </button>
                  <div>
                    <p className="text-sm font-bold text-white">{ticket.subjectLabel || ticket.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{ticket.preview}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                    {STATUS_LABELS[ticket.status] || ticket.status || "Aberto"}
                  </span>
                  <span className="text-xs font-medium text-zinc-500">{formatTicketDate(ticket.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-fit rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black"
                  >
                    Ver mais
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 md:hidden">
          {isLoading ? (
            <div className="text-sm font-medium text-zinc-500">Carregando protocolos...</div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 px-6 py-8 text-center font-medium text-zinc-500">
              Você ainda não abriu nenhum chamado por aqui.
            </div>
          ) : (
            rows.map((ticket) => (
              <button
                key={ticket.id || ticket.protocol}
                type="button"
                onClick={() => setSelectedTicket(ticket)}
                className="w-full rounded-2xl border border-white/[0.07] bg-black/20 p-5 text-left transition-colors hover:bg-white/[0.035]"
              >
                <div className="mb-3 flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">{ticket.protocol}</p>
                  <h5 className="text-lg font-black text-white">{ticket.subjectLabel || ticket.subject}</h5>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                      {STATUS_LABELS[ticket.status] || ticket.status || "Aberto"}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">{formatTicketDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <p className="break-words text-sm font-medium leading-relaxed text-zinc-300">{ticket.preview}</p>
                <span className="mt-4 inline-flex text-[10px] font-black uppercase tracking-[0.13em] text-white/80">Toque para ver detalhes</span>
              </button>
            ))
          )}
        </div>
      </section>

      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Protocolo ${selectedTicket.protocol}` : "Detalhes do chamado"}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="border-b border-white/8 pb-3 md:border-b-0 md:pb-0">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Assunto</p>
                <p className="text-base font-bold text-white">{selectedTicket.subjectLabel || selectedTicket.subject}</p>
              </div>
              <div className="border-b border-white/8 pb-3 md:border-b-0 md:pb-0">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Status</p>
                <p
                  className={`text-base font-bold ${
                    selectedTicket.status === "closed"
                      ? "text-red-400"
                      : selectedTicket.status === "answered"
                        ? "text-amber-300"
                        : "text-emerald-400"
                  }`}
                >
                  {STATUS_LABELS[selectedTicket.status] || selectedTicket.status || "Aberto"}
                </p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Abertura</p>
                <p className="text-base font-bold text-white">{formatTicketDate(selectedTicket.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Histórico</p>

              <div className="relative pl-7 before:absolute before:bottom-2 before:left-0 before:top-1 before:w-px before:bg-gradient-to-b before:from-white/10 before:via-white/6 before:to-transparent">
                <div className="space-y-7">
                  {buildTimelineEntries(selectedTicket.conversation).map((item) => {
                    if (item.type === "day") {
                      return (
                        <div key={item.id} className="relative">
                          <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
                            {item.label}
                          </span>
                        </div>
                      );
                    }

                    const isAdmin = item.role === "admin";
                    const isResolution =
                      item.isResolution ||
                      (selectedTicket.status === "closed" && item.message === selectedTicket.resolutionNote);

                    return (
                      <article key={item.id || `${item.role}-${item.createdAt}`} className="relative">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span
                              className={`text-[11px] font-black uppercase tracking-[0.22em] ${
                                isResolution
                                  ? "text-red-300"
                                  : isAdmin
                                    ? "text-violet-300"
                                    : "text-zinc-200"
                              }`}
                            >
                              {isResolution ? "Encerramento" : isAdmin ? "Equipe CineSorte" : "Você"}
                            </span>
                            <span className="text-xs font-medium text-zinc-500">{formatTicketDate(item.createdAt)}</span>
                          </div>

                          <div className="max-w-[720px]">
                            <p
                              className={`whitespace-pre-wrap break-words text-[15px] font-medium leading-7 ${
                                isResolution
                                  ? "text-red-50/95"
                                  : isAdmin
                                    ? "text-zinc-100"
                                    : "text-zinc-200"
                              }`}
                            >
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
