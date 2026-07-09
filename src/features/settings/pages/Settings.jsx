import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
import {
  changePassword,
  getMySupportTickets,
  getSecurityOverview,
  linkGoogleAccount,
  linkPasswordAccount,
  requestEmailChange,
} from "@shared/api/api";
import SettingsSidebar from "@features/settings/components/SettingsSidebar";
import SupportTicketTable from "@features/settings/components/SupportTicketTable";
import GoogleIcon from "@features/auth/components/GoogleIcon";

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

const securityEventLabels = {
  register_success: "Cadastro realizado",
  login_success: "Login realizado",
  logout: "Logout realizado",
  password_changed: "Senha alterada",
  email_change_requested: "Troca de email solicitada",
  google_linked: "Google vinculado",
  password_linked: "Email e senha vinculados",
};

function formatDateTime(value) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function AccountProviderBadge({ provider }) {
  const isGoogle = provider === "google";
  const isBoth = provider === "email_google";

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] ${
      isGoogle || isBoth
        ? "border-sky-400/15 bg-sky-500/10 text-sky-300"
        : "border-violet-400/15 bg-violet-500/10 text-violet-300"
    }`}>
      {isBoth ? "Email e Google" : isGoogle ? "Google" : "Email e senha"}
    </span>
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [isLoadingMoreSecurity, setIsLoadingMoreSecurity] = useState(false);
  const [isSecurityActionLoading, setIsSecurityActionLoading] = useState(false);
  const [supportTickets, setSupportTickets] = useState([]);
  const [securityOverview, setSecurityOverview] = useState(null);
  const [securityNextCursor, setSecurityNextCursor] = useState(null);
  const [securityModal, setSecurityModal] = useState(null);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: "",
  });
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
  const linkedProviders = securityOverview?.account?.providers || (user?.provider === "google" ? ["google"] : ["password"]);
  const hasPasswordProvider = linkedProviders.includes("password");
  const hasGoogleProvider = linkedProviders.includes("google");

  const resetSecurityForm = useCallback(() => {
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      newEmail: "",
    });
  }, []);

  const openSecurityModal = useCallback((modalName) => {
    resetSecurityForm();
    setSecurityModal(modalName);
  }, [resetSecurityForm]);

  const closeSecurityModal = useCallback(() => {
    setSecurityModal(null);
    resetSecurityForm();
  }, [resetSecurityForm]);

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

  const loadSecurityOverview = useCallback(async ({ cursor = null, append = false } = {}) => {
    if (!user) return;

    if (append) {
      setIsLoadingMoreSecurity(true);
    } else {
      setIsLoadingSecurity(true);
    }

    try {
      const overview = await getSecurityOverview({
        limit: 8,
        ...(cursor ? { cursor } : {}),
      });

      setSecurityOverview((current) => {
        if (!append) return overview;

        return {
          ...overview,
          activities: [...(current?.activities || []), ...(overview?.activities || [])],
        };
      });
      setSecurityNextCursor(overview?.nextActivitiesCursor || null);
    } catch (error) {
      toast.error("Erro", error.message || "Não foi possível carregar os dados de segurança.");
    } finally {
      if (append) {
        setIsLoadingMoreSecurity(false);
      } else {
        setIsLoadingSecurity(false);
      }
    }
  }, [toast, user]);

  const handleChangePassword = useCallback(async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("Senhas diferentes", "A confirmação precisa ser igual à nova senha.");
      return;
    }

    setIsSecurityActionLoading(true);
    try {
      await changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      toast.success("Senha alterada", "Sua senha foi atualizada com sucesso.");
      closeSecurityModal();
      loadSecurityOverview();
    } catch (error) {
      toast.error("Não foi possível alterar", error.message || "Revise sua senha atual e tente novamente.");
    } finally {
      setIsSecurityActionLoading(false);
    }
  }, [closeSecurityModal, loadSecurityOverview, securityForm, toast]);

  const handleRequestEmailChange = useCallback(async () => {
    setIsSecurityActionLoading(true);
    try {
      await requestEmailChange({
        currentPassword: securityForm.currentPassword,
        newEmail: securityForm.newEmail.trim().toLowerCase(),
      });
      toast.success("Email enviado", "Confirme o link enviado para o novo email para concluir a alteração.");
      closeSecurityModal();
      loadSecurityOverview();
    } catch (error) {
      toast.error("Não foi possível alterar", error.message || "Revise os dados e tente novamente.");
    } finally {
      setIsSecurityActionLoading(false);
    }
  }, [closeSecurityModal, loadSecurityOverview, securityForm, toast]);

  const handleLinkGoogle = useCallback(async () => {
    setIsSecurityActionLoading(true);
    try {
      const { signInWithGoogle } = await import("@shared/lib/firebaseAuth");
      const idToken = await signInWithGoogle();
      await linkGoogleAccount({
        idToken,
        currentPassword: securityForm.currentPassword,
      });
      toast.success("Google vinculado", "Agora você também pode entrar usando o Google.");
      closeSecurityModal();
      loadSecurityOverview();
    } catch (error) {
      toast.error("Não foi possível vincular", error.message || "Use o Google com o mesmo email da sua conta.");
    } finally {
      setIsSecurityActionLoading(false);
    }
  }, [closeSecurityModal, loadSecurityOverview, securityForm.currentPassword, toast]);

  const handleLinkPassword = useCallback(async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("Senhas diferentes", "A confirmação precisa ser igual à nova senha.");
      return;
    }

    setIsSecurityActionLoading(true);
    try {
      const { signInWithGoogle } = await import("@shared/lib/firebaseAuth");
      const idToken = await signInWithGoogle();
      await linkPasswordAccount({
        idToken,
        newPassword: securityForm.newPassword,
      });
      toast.success("Email e senha vinculados", "Agora você também pode entrar usando email e senha.");
      closeSecurityModal();
      loadSecurityOverview();
    } catch (error) {
      toast.error("Não foi possível vincular", error.message || "Confirme seu Google e tente novamente.");
    } finally {
      setIsSecurityActionLoading(false);
    }
  }, [closeSecurityModal, loadSecurityOverview, securityForm, toast]);

  useEffect(() => {
    const requestedTab = new URLSearchParams(location.search).get("tab");
    if (requestedTab && menuItems.some((item) => item.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [location.search, menuItems]);

  useEffect(() => {
    if (activeTab === "support" && user) {
      loadSupportTickets();
    }
  }, [activeTab, loadSupportTickets, user]);

  useEffect(() => {
    if (activeTab === "security" && user) {
      loadSecurityOverview();
    }
  }, [activeTab, loadSecurityOverview, user]);

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
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">Tipo de conta</p>
                        <div className="mt-3">
                          <AccountProviderBadge provider={securityOverview?.account?.provider || user?.provider} />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                          {securityOverview?.account?.provider === "email_google"
                            ? "Sua conta aceita entrada por senha e por Google."
                            : securityOverview?.account?.provider === "google"
                            ? "Sua entrada é gerenciada pelo Google."
                            : "Sua entrada usa email e senha do CineSorte."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 lg:col-span-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">Sessão atual</p>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-bold text-zinc-500">Dispositivo</p>
                            <p className="mt-1 text-sm font-black text-white">{securityOverview?.currentSession?.device || "Atual"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-500">Navegador</p>
                            <p className="mt-1 text-sm font-black text-white">{securityOverview?.currentSession?.browser || "Navegador"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-500">Sistema</p>
                            <p className="mt-1 text-sm font-black text-white">{securityOverview?.currentSession?.os || "Sistema"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-black/20">
                      <div className="border-b border-white/[0.06] p-4">
                        <p className="text-sm font-black text-white">Métodos de login</p>
                        <p className="mt-1 text-xs font-medium text-zinc-500">Gerencie como você entra na sua conta.</p>
                      </div>

                      <div className="divide-y divide-white/[0.06]">
                        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400">
                              <Mail size={18} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-black text-white">Email e senha</p>
                                <span className={`rounded-xl border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
                                  hasPasswordProvider
                                    ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300"
                                    : "border-white/[0.08] bg-white/[0.035] text-zinc-500"
                                }`}>
                                  {hasPasswordProvider ? "Conectado" : "Não vinculado"}
                                </span>
                              </div>
                              <p className="mt-1 break-all text-sm text-zinc-500">{user?.email}</p>
                              {securityOverview?.account?.pendingEmailChange && (
                                <p className="mt-1 text-xs font-medium text-amber-300">
                                  Aguardando confirmação de {securityOverview.account.pendingEmailChange}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {hasPasswordProvider ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openSecurityModal("changeEmail")}
                                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black sm:w-auto"
                                >
                                  Alterar email
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openSecurityModal("changePassword")}
                                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black sm:w-auto"
                                >
                                  Alterar senha
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openSecurityModal("linkPassword")}
                                disabled={!hasGoogleProvider}
                                className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                              >
                                Vincular email e senha
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white text-zinc-950">
                              <GoogleIcon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-black text-white">Google</p>
                                <span className={`rounded-xl border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
                                  hasGoogleProvider
                                    ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300"
                                    : "border-white/[0.08] bg-white/[0.035] text-zinc-500"
                                }`}>
                                  {hasGoogleProvider ? "Conectado" : "Não vinculado"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-zinc-500">
                                {hasGoogleProvider
                                  ? "Você pode entrar usando sua conta Google."
                                  : "Vincule o Google usando o mesmo email da sua conta."}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openSecurityModal("linkGoogle")}
                            disabled={!hasPasswordProvider || hasGoogleProvider}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                          >
                            {hasGoogleProvider ? "Vinculado" : "Vincular Google"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-black/20">
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] p-4">
                        <div>
                          <p className="text-sm font-black text-white">Últimas atividades</p>
                          <p className="mt-1 text-xs font-medium text-zinc-500">Eventos registrados nesta conta.</p>
                        </div>
                        {isLoadingSecurity && <span className="text-xs font-bold text-zinc-500">Carregando</span>}
                      </div>

                      <div className="divide-y divide-white/[0.06]">
                        {(securityOverview?.activities || []).length > 0 ? (
                          securityOverview.activities.map((activity) => (
                            <div key={activity.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-black text-white">
                                  {securityEventLabels[activity.event] || "Atividade de segurança"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                  {activity.device} · {activity.browser} · {activity.os}
                                </p>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-xs font-bold text-zinc-400">{formatDateTime(activity.createdAt)}</p>
                                {activity.provider && (
                                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                                    {activity.provider === "google" ? "Google" : "Email"}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm leading-6 text-zinc-500">
                            Ainda não há atividades recentes registradas. Os próximos logins e logouts aparecerão aqui.
                          </div>
                        )}
                      </div>

                      {securityNextCursor && (
                        <div className="border-t border-white/[0.06] p-4">
                          <button
                            type="button"
                            onClick={() => loadSecurityOverview({ cursor: securityNextCursor, append: true })}
                            disabled={isLoadingMoreSecurity}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-200 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                          >
                            {isLoadingMoreSecurity ? "Carregando" : "Carregar mais atividades"}
                          </button>
                        </div>
                      )}
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

      <Modal isOpen={securityModal === "changeEmail"} onClose={closeSecurityModal} title="Alterar email">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleRequestEmailChange();
          }}
          className="space-y-5 pt-2"
        >
          <div className="rounded-2xl border border-amber-400/15 bg-amber-500/10 p-4 text-sm font-medium leading-6 text-amber-100">
            O CineSorte enviará um link para o novo email. A alteração só será concluída depois da confirmação.
          </div>
          <label className="block">
            <FieldLabel>Novo email</FieldLabel>
            <TextInput
              type="email"
              value={securityForm.newEmail}
              onChange={(event) => setSecurityForm((current) => ({ ...current, newEmail: event.target.value }))}
              placeholder="novo@email.com"
              required
            />
          </label>
          <label className="block">
            <FieldLabel>Senha atual</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.currentPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, currentPassword: event.target.value }))}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              required
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeSecurityModal} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSecurityActionLoading}
              className="rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:opacity-50"
            >
              {isSecurityActionLoading ? "Enviando" : "Enviar confirmação"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={securityModal === "changePassword"} onClose={closeSecurityModal} title="Alterar senha">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleChangePassword();
          }}
          className="space-y-5 pt-2"
        >
          <label className="block">
            <FieldLabel>Senha atual</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.currentPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, currentPassword: event.target.value }))}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="block">
            <FieldLabel>Nova senha</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.newPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, newPassword: event.target.value }))}
              placeholder="Mínimo 6 caracteres, maiúscula e símbolo"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="block">
            <FieldLabel>Confirmar nova senha</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.confirmPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              required
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeSecurityModal} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSecurityActionLoading}
              className="rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:opacity-50"
            >
              {isSecurityActionLoading ? "Salvando" : "Salvar senha"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={securityModal === "linkPassword"} onClose={closeSecurityModal} title="Vincular email e senha">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleLinkPassword();
          }}
          className="space-y-5 pt-2"
        >
          <div className="rounded-2xl border border-violet-400/15 bg-violet-500/10 p-4 text-sm font-medium leading-6 text-violet-100">
            Você continuará podendo entrar com Google. Vamos confirmar sua conta Google e criar uma senha para o email atual.
          </div>
          <label className="block">
            <FieldLabel>Nova senha</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.newPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, newPassword: event.target.value }))}
              placeholder="Mínimo 6 caracteres, maiúscula e símbolo"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="block">
            <FieldLabel>Confirmar nova senha</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.confirmPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              required
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeSecurityModal} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSecurityActionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:opacity-50"
            >
              <GoogleIcon className="h-4 w-4" />
              {isSecurityActionLoading ? "Vinculando" : "Confirmar com Google"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={securityModal === "linkGoogle"} onClose={closeSecurityModal} title="Vincular Google">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleLinkGoogle();
          }}
          className="space-y-5 pt-2"
        >
          <div className="rounded-2xl border border-sky-400/15 bg-sky-500/10 p-4 text-sm font-medium leading-6 text-sky-100">
            Use a conta Google com o mesmo email cadastrado no CineSorte. Depois disso, você poderá entrar com senha ou Google.
          </div>
          <label className="block">
            <FieldLabel>Senha atual</FieldLabel>
            <TextInput
              type="password"
              value={securityForm.currentPassword}
              onChange={(event) => setSecurityForm((current) => ({ ...current, currentPassword: event.target.value }))}
              placeholder="Confirme sua senha atual"
              autoComplete="current-password"
              required
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeSecurityModal} className="px-5 py-3 text-xs font-bold text-zinc-500 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSecurityActionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:opacity-50"
            >
              <GoogleIcon className="h-4 w-4" />
              {isSecurityActionLoading ? "Vinculando" : "Continuar com Google"}
            </button>
          </div>
        </form>
      </Modal>

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
