import { useState } from "react";
import {
  User, Shield, LogOut, Trash2, Save, Mail, Key, Info,
  Camera, ChevronRight, ChevronDown, Lock, Headset, Send
} from "lucide-react";
import { useSettingsLogic } from "../../hooks/useSettingsLogic";
import Modal from "../../components/ui/Modal";
import AvatarSelectorModal from "../../components/ui/AvatarSelectorModal";
import { useToast } from "../../context/ToastContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [deleteInput, setDeleteInput] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const { user, form, ui, modals, actions } = useSettingsLogic();
  const toast = useToast();

  const menuItems = [
    { id: "profile", label: "Meu Perfil", icon: User },
    { id: "security", label: "Segurança & Login", icon: Shield },
    { id: "support", label: "Suporte & Contato", icon: Headset },
    { id: "about", label: "Sobre o Sistema", icon: Info },
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const lastSentDate = localStorage.getItem("support_last_sent");
    if (lastSentDate) {
      const diffHours = Math.ceil(Math.abs(new Date() - new Date(lastSentDate)) / (1000 * 60 * 60));
      if (diffHours < 24) {
        toast.error("Limite atingido", "Você só pode enviar uma mensagem de suporte a cada 24 horas.");
        return;
      }
    }

    setIsSubmittingContact(true);
    const formData = new FormData(e.target);

    try {
      const formSpreeUrl = import.meta.env.VITE_FORMSPREE_URL;
      if (!formSpreeUrl) {
        toast.error("Erro de Configuração", "URL do formulário não encontrada.");
        return;
      }

      const response = await fetch(formSpreeUrl, {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        toast.success("Enviado", "Sua mensagem foi recebida! Responderemos em breve por email.");
        e.target.reset();
        setContactMessage("");
        localStorage.setItem("support_last_sent", new Date().toISOString());
      } else {
        toast.error("Erro", "Não foi possível enviar a mensagem. Tente mais tarde.");
      }
    } catch {
      toast.error("Erro", "Problema de conexão ao enviar formulário.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-20 px-4 md:px-8 animate-in fade-in duration-500 relative">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-8 bg-violet-500 rounded-full"></span>
          Configurações
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8">
        <aside className="space-y-4">
          <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-3 shadow-xl">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all mb-1 last:mb-0 ${
                  activeTab === item.id
                    ? "bg-white/10 text-white shadow-inner border border-white/5"
                    : "text-zinc-500 hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={activeTab === item.id ? "text-violet-400" : ""} />
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight size={16} className="text-zinc-400" />}
              </button>
            ))}
          </div>

          <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-3 shadow-xl">
            <button
              onClick={actions.logout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </aside>

        <main className="min-h-[500px]">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 border-b border-white/5 pb-10">
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-full bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden relative">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-violet-400 bg-violet-600/20">
                          {user?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <Camera size={28} className="text-white" />
                      </div>
                    </div>
                    <button
                      onClick={() => actions.openModal("avatarSelector")}
                      className="absolute bottom-0 right-0 p-3 bg-zinc-900 rounded-full border border-white/10 text-white hover:text-violet-400 transition-colors shadow-lg hover:scale-105 active:scale-95"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-white tracking-tight">{user?.name}</h2>
                    <p className="text-zinc-500 font-medium mt-1">Gerencie suas informações pessoais.</p>
                  </div>
                </div>

                <form onSubmit={actions.handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.name}
                          readOnly
                          className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-zinc-500 font-medium cursor-not-allowed select-none outline-none shadow-inner"
                        />
                        <Lock size={16} className="absolute right-5 top-4 text-zinc-600" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-5 text-zinc-500 font-bold z-10">@</span>
                        <input
                          type="text"
                          value={form.username}
                          onChange={(e) => !ui.isUsernameLocked && actions.handleInputChange("username", e.target.value)}
                          readOnly={ui.isUsernameLocked}
                          className={`w-full bg-black/40 border border-white/5 rounded-2xl pl-10 pr-5 py-4 text-white font-medium outline-none transition-all shadow-inner ${
                            ui.isUsernameLocked ? "opacity-50 cursor-not-allowed" : "focus:border-violet-500/50 focus:bg-black/60"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Biografia</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => actions.handleInputChange("bio", e.target.value)}
                      maxLength={300}
                      rows={4}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:border-violet-500/50 focus:bg-black/60 outline-none transition-all resize-none shadow-inner"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={ui.isLoading}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 w-full md:w-auto"
                    >
                      {ui.isLoading ? "Salvando..." : "Salvar Alterações"}
                      {!ui.isLoading && <Save size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-xl space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">Acesso e Segurança</h3>
                  <p className="text-zinc-500 font-medium">Gerencie o acesso à sua conta.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-black/40 border border-white/5 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-zinc-400">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">Email Cadastrado</p>
                        <p className="text-sm text-zinc-500">{user?.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 uppercase tracking-widest w-fit">
                      Verificado
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-black/40 border border-white/5 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-zinc-400">
                        <Key size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">Senha</p>
                        <p className="text-sm text-zinc-500 tracking-[0.2em]">••••••••••••••••</p>
                      </div>
                    </div>
                    <button
                      onClick={() => actions.openModal("resetPassword")}
                      className="text-xs font-black px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl transition-all active:scale-95 w-fit"
                    >
                      Redefinir
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-500/20 rounded-[2.5rem] p-6 md:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-red-500 tracking-tight mb-2">Zona de Perigo</h3>
                  <p className="text-red-400/60 font-medium mb-8">Ações irreversíveis e permanentes.</p>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-black/40 border border-red-500/10 rounded-2xl shadow-inner">
                    <div>
                      <p className="text-lg font-black text-white">Excluir Conta</p>
                      <p className="text-sm text-zinc-500 mt-1">Isso apagará todos os seus dados, listas e reviews.</p>
                    </div>
                    <button
                      onClick={() => { setDeleteInput(""); actions.openModal("deleteAccount"); }}
                      className="px-8 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl text-sm font-black transition-all shadow-inner active:scale-95 w-full md:w-auto"
                    >
                      Excluir Conta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-xl">
                <div className="mb-10 border-b border-white/5 pb-8">
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">Central de Ajuda</h3>
                  <p className="text-zinc-500 font-medium">Limite de 1 contato a cada 24 horas.</p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Seu Email (Para Resposta)</label>
                    <div className="relative flex items-center">
                      <Mail size={18} className="absolute left-5 text-zinc-600 z-10" />
                      <input
                        key={user?.email}
                        type="email"
                        name="email"
                        defaultValue={user?.email || ""}
                        readOnly
                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-zinc-500 font-medium cursor-not-allowed outline-none shadow-inner"
                      />
                      <Lock size={16} className="absolute right-5 text-zinc-600" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Assunto</label>
                    <div className="relative flex items-center">
                      <select
                        name="subject"
                        required
                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-white font-medium focus:border-violet-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                      >
                        <option value="SUGESTÃO" className="bg-zinc-900">Feedback / Sugestão</option>
                        <option value="BUG_REPORT" className="bg-zinc-900">Relatar um Erro (Bug)</option>
                        <option value="PROBLEMA_CONTA" className="bg-zinc-900">Problemas com a Conta</option>
                        <option value="DENUNCIA" className="bg-zinc-900">Denunciar</option>
                        <option value="OUTRO_ASSUNTO" className="bg-zinc-900">Outros Assuntos</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-5 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                      Sua Mensagem
                      <span className="font-medium normal-case tracking-normal">({contactMessage.length}/500)</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      maxLength={500}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Descreva detalhadamente como podemos ajudar..."
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:border-violet-500/50 focus:bg-black/60 outline-none transition-all resize-none shadow-inner placeholder:text-zinc-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 mt-4"
                  >
                    {isSubmittingContact ? "Enviando..." : "Enviar Mensagem"}
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-xl">
                <h3 className="text-2xl font-black text-white tracking-tight mb-8">Sobre o CineSorte</h3>
                
                <div className="space-y-6">
                  <p className="text-base leading-relaxed font-medium text-zinc-300 bg-white/[0.02] p-6 rounded-2xl border border-white/5 shadow-inner">
                    O CineSorte é uma plataforma de portfólio desenvolvida para demonstrar
                    capacidades avançadas de engenharia de software fullstack.
                  </p>
                  
                  <div className="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 shadow-inner">
                      <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                        <Shield size={20} className="text-violet-400" /> Transparência de Dados
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-zinc-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                          Utilizamos a API do TMDB para metadados de filmes.
                        </li>
                        <li className="flex items-center gap-3 text-zinc-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                          Não hospedamos conteúdo pirata ou arquivos de vídeo.
                        </li>
                        <li className="flex items-center gap-3 text-zinc-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                          Seus dados são protegidos via Firebase.
                        </li>
                      </ul>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 px-4 py-2 rounded-lg border border-white/5">Versão 4.0.0</span>
                    <a
                      href="https://www.linkedin.com/in/brian-lucca-cardozo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-violet-400 transition-colors"
                    >
                      © 2026 CineSorte
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AvatarSelectorModal
        isOpen={modals.avatarSelector}
        onClose={() => actions.closeModal("avatarSelector")}
        onSelect={actions.handleAvatarUpdate}
      />

      <Modal isOpen={modals.resetPassword} onClose={() => actions.closeModal("resetPassword")} title="Redefinir Senha">
        <div className="space-y-6 pt-2">
          <div className="p-5 bg-violet-500/10 rounded-2xl border border-violet-500/20 text-violet-300 text-sm font-medium shadow-inner">
            Enviaremos um email seguro para <strong className="text-white bg-black/40 px-2 py-0.5 rounded ml-1">{user?.email}</strong> com as instruções.
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => actions.closeModal("resetPassword")} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
              Cancelar
            </button>
            <button
              onClick={actions.confirmResetPassword}
              disabled={ui.isLoading}
              className="px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
            >
              {ui.isLoading ? "Enviando..." : "Enviar Email"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modals.deleteAccount} onClose={() => actions.closeModal("deleteAccount")} title="Excluir Conta" type="danger">
        <div className="space-y-8 pt-2">
          <p className="text-zinc-300 text-sm leading-relaxed font-medium bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
            Esta ação é <strong className="text-red-400">irreversível</strong>. Todos os seus dados, listas, reviews e histórico serão apagados permanentemente.
          </p>
          <div className="space-y-3">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">
              Digite <span className="text-red-400 mx-1">DELETAR</span> para confirmar
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-widest focus:border-red-500 focus:bg-black/60 outline-none transition-all shadow-inner"
              placeholder="DELETAR"
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => actions.closeModal("deleteAccount")} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => actions.confirmDeleteAccount(deleteInput)}
              disabled={ui.isLoading || deleteInput !== "DELETAR"}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
            >
              {ui.isLoading ? "Apagando..." : <><Trash2 size={16} /> Apagar Tudo</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}