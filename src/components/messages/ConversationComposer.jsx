import { useState } from "react";
import { AtSign, Loader2, Plus, X } from "lucide-react";
import { createDirectConversation, createGroupConversation } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import UserSearchBox from "./UserSearchBox";

export default function ConversationComposer({ mode, onClose, onCreated }) {
  const toast = useToast();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addUser = (user) => {
    setSelectedUsers((prev) => (prev.some((item) => item.username === user.username) ? prev : [...prev, user]));
  };

  const removeUser = (username) => {
    setSelectedUsers((prev) => prev.filter((user) => user.username !== username));
  };

  const handleCreate = async () => {
    if (submitting) return;

    if (mode === "direct" && selectedUsers.length === 0) {
      toast.info("Escolha alguém", "Busque pelo @ do usuario para abrir a conversa.");
      return;
    }

    if (mode === "group" && (!groupName.trim() || selectedUsers.length === 0)) {
      toast.info("Complete o grupo", "Informe um nome e pelo menos um participante.");
      return;
    }

    setSubmitting(true);
    try {
      const conversation =
        mode === "direct"
          ? await createDirectConversation({ targetUsername: selectedUsers[0].username })
          : await createGroupConversation({
              name: groupName.trim(),
              memberUsernames: selectedUsers.map((user) => user.username),
            });
      onCreated(conversation);
      onClose();
    } catch (error) {
      toast.error("Não foi possivel criar", error.message || "Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
            {mode === "group" ? "Novo grupo" : "Nova conversa"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-zinc-100">
            {mode === "group" ? "Criar conversa em grupo" : "Abrir mensagem privada"}
          </h3>
        </div>
        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {mode === "group" && (
          <input
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Nome do grupo"
            className="w-full rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm font-medium text-zinc-200 outline-none placeholder:text-zinc-700"
          />
        )}

        <UserSearchBox
          selected={selectedUsers}
          onPick={(user) => {
            if (mode === "direct") setSelectedUsers([user]);
            else addUser(user);
          }}
          placeholder={mode === "direct" ? "Buscar usuario para conversar" : "Adicionar participante"}
        />

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <span key={user.username} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100">
                <AtSign size={12} />
                {user.username}
                <button type="button" onClick={() => removeUser(user.username)} className="text-violet-200/60 hover:text-white">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-zinc-950 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {mode === "group" ? "Criar grupo" : "Abrir conversa"}
        </button>
      </div>
    </div>
  );
}
