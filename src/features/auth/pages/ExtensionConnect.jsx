import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Puzzle, ShieldCheck } from "lucide-react";
import { createExtensionPairingCode } from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";
import logo from "/logo.png";

export default function ExtensionConnect() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: false, done: false, error: "" });
  const extensionId = params.get("extensionId") || "";
  const configuredExtensionId = String(import.meta.env.VITE_EXTENSION_ID || "").trim();
  const extensionConfigured = /^[a-p]{32}$/.test(configuredExtensionId);
  const validExtensionId = extensionConfigured && extensionId === configuredExtensionId;
  const identityError = !extensionConfigured
    ? "A conexão oficial ainda não foi configurada."
    : !validExtensionId
      ? "Esta página não foi aberta pela extensão oficial do CineSorte."
      : "";

  async function authorize() {
    if (!validExtensionId || !window.chrome?.runtime?.sendMessage) {
      setState({ loading: false, done: false, error: identityError || "Extensão não identificada. Abra esta tela pelo botão da extensão." });
      return;
    }
    setState({ loading: true, done: false, error: "" });
    try {
      const { code } = await createExtensionPairingCode();
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await new Promise((resolve, reject) => {
        window.chrome.runtime.sendMessage(extensionId, { type: "CINESORTE_AUTHORIZE", code, apiBaseUrl }, (result) => {
          const error = window.chrome.runtime.lastError;
          if (error) reject(new Error(error.message)); else resolve(result);
        });
      });
      if (!response?.ok) throw new Error(response?.message || "A extensão não confirmou a conexão.");
      setState({ loading: false, done: true, error: "" });
      window.setTimeout(() => window.close(), 1400);
    } catch (error) {
      setState({ loading: false, done: false, error: error.message || "Não foi possível conectar." });
    }
  }

  return <main className="grid min-h-screen place-items-center bg-zinc-950 p-5 text-white">
    <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 shadow-2xl">
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.35),transparent_55%)] p-7">
        <img src={logo} alt="CineSorte" className="h-10 w-10 rounded-xl" />
        <span className="mt-5 block text-[10px] font-black uppercase tracking-[.24em] text-violet-300">CineSorte Sync</span>
        <h1 className="mt-2 text-2xl font-black">Conectar extensão</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Autorize este navegador a enviar seu progresso para a conta <b className="text-zinc-200">@{user?.username}</b>.</p>
      </div>
      <div className="space-y-4 p-7 pt-2">
        <div className="flex gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-4 text-xs leading-5 text-zinc-400"><ShieldCheck className="shrink-0 text-emerald-400" size={20} /><span>A extensão não recebe sua senha ou cookie. Ela ganha somente uma autorização própria, que pode ser revogada.</span></div>
        {state.done ? <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 p-4 font-black text-emerald-300"><CheckCircle2 />Extensão conectada</div> : <button type="button" onClick={authorize} disabled={state.loading || !validExtensionId} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 font-black transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"><Puzzle size={18} />{state.loading ? "Conectando…" : "Autorizar este navegador"}</button>}
        {identityError && <p className="rounded-xl border border-amber-400/10 bg-amber-500/10 p-3 text-center text-xs text-amber-200">{identityError}</p>}
        {state.error && <p className="rounded-xl bg-red-500/10 p-3 text-center text-xs text-red-300">{state.error}</p>}
      </div>
    </section>
  </main>;
}
