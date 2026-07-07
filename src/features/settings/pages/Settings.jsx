import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Headset,
  Info,
  Key,
  Lock,
  Mail,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useSettingsLogic } from "@features/settings/hooks/useSettingsLogic";
import Modal from "@shared/components/ui/Modal";
import AvatarSelectorModal from "@shared/components/ui/AvatarSelectorModal";
import { useToast } from "@shared/context/useToast";
import { getMySupportTickets } from "@shared/api/api";
import SettingsSidebar from "@features/settings/components/SettingsSidebar";
import SupportTicketTable from "@features/settings/components/SupportTicketTable";

function SettingPanel({ eyebrow, title, description, icon: Icon, children, tone = "violet" }) {
  const toneClasses = {
    violet: "text-violet-300 bg-violet-500/10 border-violet-400/15",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-400/15",
    amber: "text-amber-300 bg-amber-500/10 border-amber-400/15",
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-400/15",
    red: "text-red-300 bg-red-500/10 border-red-400/15",
  };
  const iconNode = createElement(Icon, { size: 19 });

  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-5 lg:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(139,92,246,0.10),transparent_38%)]" />
      <div className="relative">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start">
          <div className="flex gap-3">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${toneClasses[tone]}`}>
              {iconNode}
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
              <h2 className="mt-1 text-xl font-black leading-tight tracking-[-0.025em] text-white sm:text-2xl">{title}</h2>
              {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>}
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function FieldLabel({ children, aside }) {
  return (
    <label className="mb-2.5 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
      <span>{children}</span>
      {aside && <span className="text-[10px] font-bold normal-case tracking-normal text-zinc-600">{aside}</span>}
    </label>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm font-medium text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
    />
  );
}

function ProfileAvatar({ user, onEdit }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <div className="relative h-28 w-28 overflow-hidden rounded-[1.35rem] border border-white/10 bg-zinc-900 p-1.5 shadow-[0_20px_52px_rgba(0,0,0,0.38)]">
          <div className="group relative h-full w-full overflow-hidden rounded-[1.1rem] bg-zinc-900">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.name || "Avatar"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-violet-600/20 text-4xl font-black uppercase text-violet-300">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label="Alterar foto de perfil"
            >
              <Camera size={24} />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white text-zinc-950 shadow-xl transition-transform hover:scale-105 active:scale-95"
          aria-label="Escolher avatar"
        >
          <Camera size={17} />
        </button>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Identidade pública</p>
        <h3 className="mt-1 break-words text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">{user?.name || "Seu perfil"}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Ajuste como seu perfil aparece para a comunidade CineSorte.</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [supportTickets, setSupportTickets] = useState([]);
  const { user, form, deleteConfirmText, ui, modals, actions } = useSettingsLogic();
  const toast = useToast();

  const menuItems = useMemo(
    () => [
      { id: "profile", label: "Meu Perfil", description: "Avatar, username e biografia", icon: User },
      { id: "security", label: "Segurança", description: "Login, senha e exclusão", icon: Shield },
      { id: "support", label: "Suporte", description: "Contato e protocolos", icon: Headset },
      { id: "about", label: "Sistema", description: "Dados, versão e créditos", icon: Info },
    ],
    [],
  );

  const activeMenuItem = menuItems.find((item) => item.id === activeTab) || menuItems[0];

  const loadSupportTickets = useCallback(async () => {
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
  }, [toast, user]);

  useEffect(() => {
    if (activeTab === "support" && user) {
      loadSupportTickets();
    }
  }, [activeTab, loadSupportTickets, user]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white animate-in fade-in duration-700">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.10),transparent_30%),radial-gradient(circle_at_88%_22%,rgba(14,165,233,0.05),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 md:px-10 md:pt-10 xl:px-14">
        <header className="border-b border-white/[0.07] pb-6 md:pb-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-violet-400">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
                Central da conta
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">Configurações</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                Controle seus dados, segurança e canais de suporte sem sair do visual do CineSorte.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.13em] text-zinc-400">
                <activeMenuItem.icon size={13} className="text-violet-300" />
                {activeMenuItem.label}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.13em] text-emerald-300">
                <CheckCircle size={13} />
                Conta ativa
              </span>
            </div>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[310px_minmax(0,1fr)] xl:gap-8">
          <SettingsSidebar
            menuItems={menuItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={actions.logout}
          />

          <main className="min-w-0">
            {activeTab === "profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <SettingPanel
                  eyebrow="Meu perfil"
                  title="Informações públicas"
                  description="Esses dados aparecem no perfil, nas reviews e nas interações sociais."
                  icon={User}
                >
                  <div className="space-y-7">
                    <ProfileAvatar user={user} onEdit={() => actions.openModal("avatarSelector")} />

                    <form onSubmit={actions.handleUpdateProfile} className="space-y-6 border-t border-white/[0.06] pt-6">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <FieldLabel>Nome de exibição</FieldLabel>
                          <div className="relative">
                            <TextInput type="text" value={form.name} readOnly className="pr-12 text-zinc-500" />
                            <Lock size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                          </div>
                        </div>

                        <div>
                          <FieldLabel aside={ui.isUsernameLocked ? `libera em ${ui.daysToUnlock} dias` : null}>Username</FieldLabel>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-500">@</span>
                            <TextInput
                              type="text"
                              value={form.username}
                              onChange={(event) => !ui.isUsernameLocked && actions.handleInputChange("username", event.target.value)}
                              readOnly={ui.isUsernameLocked}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <FieldLabel aside={`${form.bio.length}/300`}>Biografia</FieldLabel>
                        <textarea
                          value={form.bio}
                          onChange={(event) => actions.handleInputChange("bio", event.target.value)}
                          maxLength={300}
                          rows={5}
                          className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm font-medium leading-6 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/50 focus:bg-white/[0.035]"
                          placeholder="Conte um pouco sobre você..."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={ui.isLoading}
                          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.13em] text-black transition-all hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] sm:w-auto"
                        >
                          <Save size={16} />
                          {ui.isLoading ? "Salvando" : "Salvar alterações"}
                        </button>
                      </div>
                    </form>
                  </div>
                </SettingPanel>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <SettingPanel
                  eyebrow="Segurança"
                  title="Acesso e login"
                  description="Confira seus dados de autenticação e solicite uma nova senha quando precisar."
                  icon={ShieldCheck}
                  tone="emerald"
                >
                  <div className="divide-y divide-white/[0.06]">
                    <div className="flex flex-col gap-4 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400">
                          <Mail size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white">E-mail cadastrado</p>
                          <p className="mt-1 break-all text-sm text-zinc-500">{user?.email}</p>
                        </div>
                      </div>
                      <span className="w-fit rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
                        Verificado
                      </span>
                    </div>

                    <div className="flex flex-col gap-4 py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400">
                          <Key size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-black text-white">Senha</p>
                          <p className="mt-1 text-sm font-semibold tracking-[0.18em] text-zinc-600">••••••••••••</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => actions.openModal("resetPassword")}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black sm:w-auto"
                      >
                        Redefinir
                      </button>
                    </div>
                  </div>
                </SettingPanel>

                <SettingPanel
                  eyebrow="Zona de perigo"
                  title="Excluir conta"
                  description="Esta ação remove permanentemente seus dados, listas, reviews e histórico."
                  icon={AlertTriangle}
                  tone="red"
                >
                  <div className="flex flex-col justify-between gap-5 rounded-2xl border border-red-400/15 bg-red-500/[0.04] p-4 sm:flex-row sm:items-center md:p-5">
                    <div>
                      <p className="text-sm font-black text-white">Remoção permanente</p>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
                        Para sua proteção, talvez seja necessário fazer login novamente antes de concluir a exclusão.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => actions.openModal("deleteAccount")}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.13em] text-red-300 transition-colors hover:bg-red-500 hover:text-white sm:w-auto"
                    >
                      <Trash2 size={15} />
                      Excluir conta
                    </button>
                  </div>
                </SettingPanel>
              </div>
            )}

            {activeTab === "support" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <SettingPanel
                  eyebrow="Suporte"
                  title="Central de chamados"
                  description="A abertura de chamados pelo site está em manutenção, mas seus protocolos continuam disponíveis para consulta."
                  icon={Headset}
                  tone="amber"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-sm leading-6 text-zinc-400">
                        Para falar com o suporte enquanto a central volta ao ar, envie um e-mail para{" "}
                        <a href="mailto:cinesorte@gmail.com" className="font-bold text-white transition-colors hover:text-violet-300">
                          cinesorte@gmail.com
                        </a>
                        .
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-500/10 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">
                      <Sparkles size={13} />
                      Em manutenção
                    </span>
                  </div>
                </SettingPanel>

                <SupportTicketTable tickets={supportTickets} isLoading={isLoadingTickets} onRefresh={loadSupportTickets} />
              </div>
            )}

            {activeTab === "about" && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <SettingPanel
                  eyebrow="Sistema"
                  title="Sobre o CineSorte"
                  description="Informações de transparência sobre dados, metadados e versão da plataforma."
                  icon={Info}
                  tone="cyan"
                >
                  <div className="space-y-6">
                    <p className="max-w-3xl text-sm leading-7 text-zinc-300">
                      O CineSorte é uma plataforma de portfólio desenvolvida para demonstrar capacidades avançadas de engenharia de software fullstack.
                    </p>

                    <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                      {[
                        "Utilizamos a API da TMDB para metadados, imagens e informações de filmes e séries.",
                        "Não hospedamos conteúdo pirata ou arquivos de vídeo.",
                        "Seus dados são protegidos via Firebase.",
                      ].map((item) => (
                        <div key={item} className="flex gap-3 px-4 py-4 text-sm font-medium leading-6 text-zinc-400">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                      Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center">
                      <span className="w-fit rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                        Versão 4.0.0
                      </span>
                      <a
                        href="https://www.linkedin.com/in/brian-lucca-cardozo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-violet-300"
                      >
                        © 2026 CineSorte
                      </a>
                    </div>
                  </div>
                </SettingPanel>
              </div>
            )}
          </main>
        </div>
      </div>

      <AvatarSelectorModal
        isOpen={modals.avatarSelector}
        onClose={() => actions.closeModal("avatarSelector")}
        onSelect={actions.handleAvatarUpdate}
      />

      <Modal isOpen={modals.resetPassword} onClose={() => actions.closeModal("resetPassword")} title="Redefinir senha">
        <div className="space-y-6 pt-2">
          <div className="rounded-2xl border border-violet-400/15 bg-violet-500/10 p-5 text-sm font-medium leading-6 text-violet-200">
            Enviaremos um e-mail seguro para <strong className="text-white">{user?.email}</strong> com as instruções.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => actions.closeModal("resetPassword")} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              onClick={actions.confirmResetPassword}
              disabled={ui.isLoading}
              className="rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:opacity-50"
            >
              {ui.isLoading ? "Enviando" : "Enviar e-mail"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modals.deleteAccount} onClose={() => actions.closeModal("deleteAccount")} title="Excluir conta" type="danger">
        <div className="space-y-7 pt-2">
          <p className="rounded-2xl border border-red-400/15 bg-red-500/10 p-5 text-sm font-medium leading-6 text-red-100/90">
            Esta ação é irreversível. Se a sessão estiver antiga, você será desconectado e deverá entrar novamente antes de tentar excluir.
          </p>
          <label className="block">
            <FieldLabel>Digite DELETAR CONTA</FieldLabel>
            <TextInput
              value={deleteConfirmText}
              onChange={(event) => actions.setDeleteConfirmText(event.target.value)}
              placeholder="DELETAR CONTA"
              className="border-red-400/20 focus:border-red-400/60"
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => actions.closeModal("deleteAccount")} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              onClick={actions.confirmDeleteAccount}
              disabled={ui.isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />
              {ui.isLoading ? "Excluindo" : "Excluir conta"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
