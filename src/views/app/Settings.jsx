import { useEffect, useState } from "react";
import { User, Shield, Trash2, Save, Mail, Key, Info, Camera, Lock, Headset } from "lucide-react";
import { useSettingsLogic } from "../../hooks/useSettingsLogic";
import Modal from "../../components/ui/Modal";
import AvatarSelectorModal from "../../components/ui/AvatarSelectorModal";
import { useToast } from "../../context/ToastContext";
import { getMySupportTickets } from "../../services/api";
import SettingsSidebar from "../../components/settings/SettingsSidebar";
import SupportTicketTable from "../../components/settings/SupportTicketTable";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [supportTickets, setSupportTickets] = useState([]);
  const { user, form, deleteConfirmText, ui, modals, actions } = useSettingsLogic();
  const toast = useToast();

  const menuItems = [
    { id: "profile", label: "Meu Perfil", icon: User },
    { id: "security", label: "Segurança & Login", icon: Shield },
    { id: "support", label: "Suporte & Contato", icon: Headset },
    { id: "about", label: "Sobre o Sistema", icon: Info },
  ];

  const loadSupportTickets = async () => {
    if (!user) return;

    setIsLoadingTickets(true);
    try {
      const tickets = await getMySupportTickets();
      setSupportTickets(Array.isArray(tickets) ? tickets : []);
    } catch (error) {
      toast.error("Erro", error.message || "Não foi possível carregar seus protocolos.");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === "support" && user) {
      loadSupportTickets();
    }
  }, [activeTab, user]);

  return (
    <div className="max-w-[1320px] mx-auto pt-8 pb-20 px-4 md:px-6 xl:px-8 animate-in fade-in duration-500 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-8 bg-violet-500 rounded-full"></span>
          Configurações
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-6 xl:gap-8">
        <SettingsSidebar
          menuItems={menuItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={actions.logout}
        />

        <main className="min-h-[500px] min-w-0">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-xl">
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
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-xl space-y-8">
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
                        <p className="text-sm font-bold text-white mb-0.5">E-mail Cadastrado</p>
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
                        <p className="text-sm text-zinc-500 tracking-[0.2em]">****************</p>
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

              <div className="bg-red-950/20 border border-red-500/20 rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-xl relative overflow-hidden">
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
                      onClick={() => actions.openModal("deleteAccount")}
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
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-400 mb-3">Suporte & Contato</p>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-3">Central de Chamados</h3>
                    <p className="text-zinc-400 font-medium leading-relaxed">
                      A abertura de chamados está Em manutenção. Você ainda pode consultar abaixo os protocolos já enviados.
                    </p>
                  </div>
                  <div className="inline-flex items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm font-black uppercase tracking-widest text-amber-300">
                    Em manutenção
                  </div>
                </div>
                <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 p-5">
                  <p className="text-sm font-medium leading-relaxed text-zinc-400">
                    A abertura de chamados pelo site está temporariamente indisponível. Para falar com o suporte, envie um email para{" "}
                    <a href="mailto:cinesorte@gmail.com" className="text-white transition-colors hover:text-violet-300">
                      cinesorte@gmail.com
                    </a>
                    .
                  </p>
                </div>
              </div>

              <SupportTicketTable tickets={supportTickets} isLoading={isLoadingTickets} onRefresh={loadSupportTickets} />
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-xl">
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
                        Utilizamos a API da TMDB para metadados, imagens e informações de filmes e séries.
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
                    <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                      Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                      Versão 4.0.0
                    </span>
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
            Enviaremos um e-mail seguro para <strong className="text-white bg-black/40 px-2 py-0.5 rounded ml-1">{user?.email}</strong> com as instruções.
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
              {ui.isLoading ? "Enviando..." : "Enviar E-mail"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modals.deleteAccount} onClose={() => actions.closeModal("deleteAccount")} title="Excluir Conta" type="danger">
        <div className="space-y-8 pt-2">
          <p className="text-zinc-300 text-sm leading-relaxed font-medium bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
            Esta ação é irreversível. Para proteger sua conta, a exclusão só funciona quando seu login é recente. Se a sessão estiver antiga, você será desconectado e deverá entrar novamente antes de tentar excluir.
          </p>
          <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
            <p className="text-sm font-medium leading-relaxed text-zinc-400">
              Para confirmar, digite <span className="text-white">DELETAR CONTA</span>. Seus dados, listas, reviews e histórico serão apagados permanentemente.
            </p>
          </div>
          <label className="block">
            <span className="mb-3 block text-xs font-black uppercase tracking-widest text-zinc-500">
              Confirmação
            </span>
            <input
              value={deleteConfirmText}
              onChange={(event) => actions.setDeleteConfirmText(event.target.value)}
              placeholder="DELETAR CONTA"
              className="w-full rounded-2xl border border-red-500/20 bg-black/40 px-5 py-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-red-500/60"
            />
          </label>
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => actions.closeModal("deleteAccount")} className="px-6 py-4 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
              Cancelar
            </button>
            <button
              onClick={actions.confirmDeleteAccount}
              disabled={ui.isLoading}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
            >
              {ui.isLoading ? "Excluindo..." : <><Trash2 size={16} /> Excluir conta</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
