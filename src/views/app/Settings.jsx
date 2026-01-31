import { useState } from "react";
import {
  User,
  Shield,
  LogOut,
  Trash2,
  Save,
  Mail,
  Key,
  Info,
  Camera,
  ChevronRight,
  ChevronDown,
  Lock,
  Headset,
  Send
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
      const now = new Date();
      const last = new Date(lastSentDate);
      const diffTime = Math.abs(now - last);
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); 

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
          setIsSubmittingContact(false);
          return;
      }

      const response = await fetch(formSpreeUrl, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success("Enviado", "Sua mensagem foi recebida! Responderemos em breve por email.");
        e.target.reset();
        setContactMessage("");
        localStorage.setItem("support_last_sent", new Date().toISOString());
      } else {
        toast.error("Erro", "Não foi possível enviar a mensagem. Tente mais tarde.");
      }
    } catch (error) {
      toast.error("Erro", "Problema de conexão ao enviar formulário.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-20 px-4 md:px-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-2 overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.label}
                </div>
                {activeTab === item.id && (
                  <ChevronRight size={16} className="text-zinc-500" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
            <button
              onClick={actions.logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </aside>

        <main className="min-h-[500px]">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 border-b border-white/5 pb-8">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-950 shadow-xl overflow-hidden">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-violet-600">
                          {user?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => actions.openModal("avatarSelector")}
                      className="absolute bottom-0 right-0 p-2 bg-zinc-800 rounded-full border-4 border-zinc-950 text-white hover:bg-violet-600 transition-colors shadow-lg"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white">
                      {user?.name}
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      Gerencie suas informações pessoais.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={actions.handleUpdateProfile}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Nome de Exibição
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.name}
                          readOnly
                          className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 font-medium cursor-not-allowed select-none outline-none"
                        />
                        <Lock
                          size={14}
                          className="absolute right-4 top-3.5 text-zinc-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-zinc-500 font-bold">
                          @
                        </span>
                        <input
                          type="text"
                          value={form.username}
                          onChange={(e) =>
                            !ui.isUsernameLocked &&
                            actions.handleInputChange(
                              "username",
                              e.target.value,
                            )
                          }
                          readOnly={ui.isUsernameLocked}
                          className={`w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all ${ui.isUsernameLocked ? "opacity-50 cursor-not-allowed" : "focus:border-violet-500 focus:ring-1 focus:ring-violet-500"}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Biografia
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        actions.handleInputChange("bio", e.target.value)
                      }
                      maxLength={300}
                      rows={4}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={ui.isLoading}
                      className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
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
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 shadow-sm space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Acesso e Segurança
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Gerencie o acesso à sua conta.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-400">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Email Cadastrado
                        </p>
                        <p className="text-sm text-zinc-500">{user?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                      Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-400">
                        <Key size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Senha</p>
                        <p className="text-sm text-zinc-500">
                          ••••••••••••••••
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => actions.openModal("resetPassword")}
                      className="text-sm font-medium text-white hover:text-violet-400 transition-colors underline underline-offset-4"
                    >
                      Redefinir
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-red-500 mb-1">
                  Zona de Perigo
                </h3>
                <p className="text-red-400/60 text-sm mb-6">
                  Ações irreversíveis.
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Excluir Conta</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Isso apagará todos os seus dados e listas.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteInput("");
                      actions.openModal("deleteAccount");
                    }}
                    className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-sm font-medium transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 shadow-sm">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-1">Central de Ajuda</h3>
                  <p className="text-zinc-400 text-sm">Limite de 1 contato a cada 24 horas.</p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Seu Email (Para Resposta)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-4 text-zinc-600" />
                      <input 
                        key={user?.email}
                        type="email" 
                        name="email" 
                        defaultValue={user?.email || ""} 
                        readOnly
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-zinc-400 font-medium cursor-not-allowed outline-none ring-0"
                      />
                      <Lock size={14} className="absolute right-4 top-4 text-zinc-600" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Assunto</label>
                    <div className="relative">
                        <select 
                          name="subject" 
                          required
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white focus:border-violet-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="SUGESTÃO">Feedback / Sugestão</option>
                          <option value="BUG_REPORT">Relatar um Erro (Bug)</option>
                          <option value="PROBLEMA_CONTA">Problemas com a Conta</option>
                          <option value="DENUNCIA">Denunciar</option>
                          <option value="OUTRO_ASSUNTO">Outros Assuntos</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Sua Mensagem 
                        <span className="ml-2 font-normal lowercase">({contactMessage.length}/500)</span>
                    </label>
                    <textarea 
                      name="message" 
                      required
                      rows={5}
                      maxLength={500}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Descreva detalhadamente como podemos ajudar..."
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmittingContact}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-900/20"
                  >
                    {isSubmittingContact ? "Enviando..." : "Enviar Mensagem"}
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-white mb-6">
                  Sobre o CineSorte
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
                  <p className="mb-4">
                    O CineSorte é uma plataforma de portfólio desenvolvida para
                    demonstrar capacidades avançadas de engenharia de software
                    fullstack.
                  </p>
                  <h4 className="text-white font-bold mb-2">
                    Transparência de Dados
                  </h4>
                  <ul className="list-disc pl-4 space-y-2 mb-4">
                    <li>Utilizamos a API do TMDB para metadados de filmes.</li>
                    <li>Não hospedamos conteúdo pirata ou arquivos de vídeo.</li>
                    <li>
                      Seus dados são protegidos por criptografia de ponta a
                      ponta via Google Firebase.
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
                    <span className="text-zinc-500">Versão 3.0.0 (Stable)</span>
                    <div className="flex gap-4">
                      <a
                        href="https://www.linkedin.com/in/brian-lucca-cardozo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        © 2026 CineSorte
                      </a>
                    </div>
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

      <Modal
        isOpen={modals.resetPassword}
        onClose={() => actions.closeModal("resetPassword")}
        title="Redefinir Senha"
      >
        <div className="space-y-4">
          <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-300 text-sm">
            Enviaremos um email seguro para <strong>{user?.email}</strong> com
            as instruções.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => actions.closeModal("resetPassword")}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={actions.confirmResetPassword}
              disabled={ui.isLoading}
              className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold"
            >
              {ui.isLoading ? "Enviando..." : "Enviar Email"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modals.deleteAccount}
        onClose={() => actions.closeModal("deleteAccount")}
        title="Excluir Conta Permanentemente"
      >
        <div className="space-y-6">
          <p className="text-zinc-300 text-sm">
            Esta ação é <strong>irreversível</strong>. Todos os seus dados,
            listas, reviews e histórico serão apagados imediatamente.
          </p>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Digite <span className="text-white">DELETAR</span> para confirmar
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              placeholder="DELETAR"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => actions.closeModal("deleteAccount")}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={actions.confirmDeleteAccount(deleteInput)}
              disabled={ui.isLoading || deleteInput !== "DELETAR"}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center gap-2"
            >
              {ui.isLoading ? (
                "Apagando..."
              ) : (
                <>
                  <Trash2 size={16} /> Apagar Tudo
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}