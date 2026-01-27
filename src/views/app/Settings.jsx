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
  Lock,
} from "lucide-react";
import { useSettingsLogic } from "../../hooks/useSettingsLogic";
import Modal from "../../components/ui/Modal";
import AvatarSelectorModal from "../../components/ui/AvatarSelectorModal";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [deleteInput, setDeleteInput] = useState("");
  const { user, form, ui, modals, actions } = useSettingsLogic();

  const menuItems = [
    { id: "profile", label: "Meu Perfil", icon: User },
    { id: "security", label: "Segurança & Login", icon: Shield },
    { id: "about", label: "Sobre o Sistema", icon: Info },
  ];

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
                      <p className="text-xs text-zinc-600">
                        O nome de exibição é permanente.
                      </p>
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
                      {ui.isUsernameLocked ? (
                        <p className="text-xs text-yellow-500/80 flex items-center gap-1.5 mt-2">
                          <Lock size={12} />
                          Disponível para alteração em {ui.daysToUnlock} dias.
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 mt-2">
                          Você pode alterar seu username a cada 30 dias.
                        </p>
                      )}
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
                    <div className="text-right text-xs text-zinc-600">
                      {form.bio.length}/300
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={ui.isLoading}
                      className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-white/10 active:scale-95"
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
                    <li>
                      Não hospedamos conteúdo pirata ou arquivos de vídeo.
                    </li>
                    <li>
                      Seus dados são protegidos por criptografia de ponta a
                      ponta via Google Firebase.
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
                    <span className="text-zinc-500">Versão 3.0.0 (Stable)</span>
                    <div className="flex gap-4">
                      <a
                        href="mailto:brianlucca.dev@gmail.com
"
                        className="hover:text-white transition-colors"
                      >
                        brianlucca.dev@gmail.com
                      </a>
                      <a
                        href="https://www.linkedin.com/in/brian-lucca-cardozo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        © 2026 Brian Lucca
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
              onClick={() => actions.confirmDeleteAccount(deleteInput)}
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
