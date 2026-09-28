import { createElement } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Check,
  Clapperboard,
  Dices,
  Download,
  Info,
  MessageCircle,
  MonitorPlay,
  Play,
  Plug,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

const EDGE_EXTENSION_URL = import.meta.env.VITE_EXTENSION_STORE_URL || '';
const IS_EDGE_BROWSER = typeof navigator !== 'undefined' && /Edg(?:A|iOS)?\//.test(navigator.userAgent);

const features = [
  {
    icon: Bookmark,
    title: 'Sua biblioteca, do seu jeito',
    description: 'Organize filmes e séries em listas que fazem sentido para você.',
  },
  {
    icon: MessageCircle,
    title: 'Opiniões que viram conversa',
    description: 'Publique reviews, dê notas e descubra outros pontos de vista.',
  },
  {
    icon: Users,
    title: 'Uma comunidade cinéfila',
    description: 'Siga perfis e acompanhe o que seus amigos estão assistindo.',
  },
  {
    icon: Dices,
    title: 'Menos dúvida, mais play',
    description: 'Use a roleta quando escolher o próximo título parecer impossível.',
  },
];

const highlights = [
  { value: 'Listas', label: 'para cada momento' },
  { value: 'Reviews', label: 'com notas e comentários' },
  { value: 'XP', label: 'níveis e conquistas' },
];

function scrollToSection(event, sectionId) {
  event.preventDefault();
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08080b] text-white selection:bg-violet-500 selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#08080b]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link to="/" className="flex items-center gap-2.5" aria-label="CineSorte — início">
            <span className="grid place-items-center text-violet-400">
              <Clapperboard size={25} strokeWidth={2.25} />
            </span>
            <span className="text-xl font-black tracking-[-0.045em]">Cine<span className="text-violet-400">Sorte</span></span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Navegação principal">
            <a href="#recursos" onClick={(event) => scrollToSection(event, 'recursos')} className="text-[13px] font-bold text-zinc-500 transition-colors hover:text-white">Recursos</a>
            <a href="#extensao" onClick={(event) => scrollToSection(event, 'extensao')} className="text-[13px] font-bold text-zinc-500 transition-colors hover:text-white">Extensão</a>
            <a href="#experiencia" onClick={(event) => scrollToSection(event, 'experiencia')} className="text-[13px] font-bold text-zinc-500 transition-colors hover:text-white">Experiência</a>
            <a href="#comunidade" onClick={(event) => scrollToSection(event, 'comunidade')} className="text-[13px] font-bold text-zinc-500 transition-colors hover:text-white">Comunidade</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-xl px-3 py-2 text-xs font-black text-zinc-400 transition-colors hover:text-white sm:px-4">
              Entrar
            </Link>
            <Link to="/register" className="rounded-xl bg-white px-4 py-2.5 text-[11px] font-black text-zinc-950 transition-all hover:bg-violet-100 active:scale-[0.98] sm:px-5">
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:min-h-[720px] lg:px-12 lg:pb-24 lg:pt-36 xl:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_18%_12%,rgba(124,58,237,0.20),transparent_68%),radial-gradient(ellipse_62%_58%_at_80%_18%,rgba(79,70,229,0.14),transparent_70%),linear-gradient(to_bottom,rgba(31,15,54,0.34)_0%,rgba(15,10,25,0.16)_58%,transparent_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[1440px] -translate-x-1/2 border-x border-white/[0.025]" />
          <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-20">
            <div className="max-w-[640px] animate-in fade-in slide-in-from-bottom-3 duration-700">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-500/[0.08] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                <Clapperboard size={12} />
                Seu cinema continua depois dos créditos
              </div>
              <h1 className="text-[2.8rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-[3.4rem] lg:text-[3.65rem] xl:text-[4.15rem]">
                Descubra, organize e compartilhe o que você assiste.
              </h1>
              <p className="mt-6 max-w-[570px] text-base font-medium leading-7 text-zinc-400 lg:text-[17px] lg:leading-8">
                O CineSorte reúne sua biblioteca, suas opiniões e pessoas que gostam de cinema tanto quanto você — em um só lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-black shadow-[0_14px_34px_rgba(109,40,217,0.24)] transition-all hover:bg-violet-500 active:scale-[0.98]">
                  Começar agora <ArrowRight size={15} />
                </Link>
                <a href="#experiencia" onClick={(event) => scrollToSection(event, 'experiencia')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-6 py-3.5 text-sm font-black text-zinc-300 transition-all hover:bg-white/[0.07] hover:text-white">
                  <Play size={14} fill="currentColor" /> Conhecer a plataforma
                </a>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-zinc-600">
                <ShieldCheck size={14} className="text-violet-400/80" />
                Crie sua conta gratuitamente
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[790px] animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <div className="absolute -inset-8 bg-violet-600/10 blur-[70px]" />
              <div className="relative overflow-hidden rounded-[1.4rem] border border-white/[0.09] bg-[#0d0d11] p-2.5 shadow-[0_35px_100px_rgba(0,0,0,0.55)] sm:p-3.5">
                <div className="mb-2 flex items-center gap-1.5 px-1 py-0.5 sm:mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-2 text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-700">Sua experiência CineSorte</span>
                </div>
                <div className="relative aspect-[1892/906] overflow-hidden rounded-xl bg-zinc-900">
                  <img src="/preview.png" className="h-full w-full object-contain" alt="Tela inicial do CineSorte" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.05]" />
                </div>
              </div>
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl border border-white/[0.09] bg-[#111116]/95 p-3 shadow-2xl backdrop-blur-xl sm:left-8">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400/10 text-amber-300"><Star size={16} fill="currentColor" /></span>
                <span><span className="block text-xs font-black">Sua opinião importa</span><span className="mt-0.5 block text-[9px] text-zinc-500">Avalie e encontre sua próxima história.</span></span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.018]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-3 px-5 sm:px-8 lg:px-12 xl:px-16">
            {highlights.map((item, index) => (
              <div key={item.value} className={`py-6 text-center sm:py-7 ${index > 0 ? 'border-l border-white/[0.06]' : ''}`}>
                <strong className="block text-base font-black text-zinc-100 sm:text-lg">{item.value}</strong>
                <span className="mt-1 text-[10px] font-medium text-zinc-600 sm:text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="recursos" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-[680px]">
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-400">Feito para quem assiste</span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Tudo que sua vida cinéfila precisa.</h2>
              <p className="mt-4 text-base leading-7 text-zinc-500">Recursos simples para registrar histórias, descobrir títulos e trocar ideias.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {features.map(({ icon, title, description }) => (
                <article key={title} className="group min-h-[210px] rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/20 hover:bg-white/[0.04] lg:p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-violet-300/10 bg-violet-500/[0.08] text-violet-300">{createElement(icon, { size: 20 })}</span>
                  <h3 className="mt-6 text-base font-black leading-6">{title}</h3>
                  <p className="mt-2.5 text-sm font-medium leading-6 text-zinc-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="extensao" className="scroll-mt-20 border-y border-white/[0.06] bg-[#0b0b0f] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-16">
          <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="max-w-[610px]">
              <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-violet-400">
                <Plug size={13} /> CineSorte Sync
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Seu progresso acompanha você.</h2>
              <p className="mt-5 text-base font-medium leading-7 text-zinc-400">
                A extensão CineSorte Sync identifica o que você está assistindo e envia o progresso para sua conta. Assim, seus títulos aparecem em “Continuar assistindo” quando você volta ao CineSorte.
              </p>

              <div className="mt-7 space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300"><MonitorPlay size={17} /></span>
                  <div><h3 className="text-sm font-black text-white">Continue de onde parou</h3><p className="mt-1 text-sm leading-6 text-zinc-500">O título, episódio e progresso ficam reunidos na página inicial.</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300"><ShieldCheck size={17} /></span>
                  <div><h3 className="text-sm font-black text-white">Conexão segura e controlada</h3><p className="mt-1 text-sm leading-6 text-zinc-500">A extensão não recebe sua senha ou cookies. O acesso é próprio e pode ser revogado nas configurações.</p></div>
                </div>
              </div>

              {IS_EDGE_BROWSER && EDGE_EXTENSION_URL ? (
                <a href={EDGE_EXTENSION_URL} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(109,40,217,0.22)] transition-all hover:bg-violet-500 active:scale-[0.98]">
                  <Download size={16} /> Instalar pelo Edge Add-ons
                </a>
              ) : (
                <div className="mt-8 inline-flex max-w-md items-start gap-2.5 rounded-xl border border-sky-400/15 bg-sky-500/[0.08] px-4 py-3 text-sm font-bold leading-5 text-sky-200">
                  <Info size={17} className="mt-0.5 shrink-0" />
                  <span>{IS_EDGE_BROWSER ? 'A extensão estará disponível no Edge Add-ons em breve.' : 'A extensão está disponível exclusivamente para o Microsoft Edge.'}</span>
                </div>
              )}
            </div>

            <div className="relative mx-auto w-full max-w-[720px]">
              <div className="pointer-events-none absolute inset-10 bg-violet-600/20 blur-[90px]" />
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-[#101015] shadow-[0_35px_100px_rgba(0,0,0,0.48)]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-300/15 bg-violet-500/10 text-violet-300"><Clapperboard size={20} /></span>
                    <span><strong className="block text-sm font-black">CineSorte Sync</strong><span className="text-[10px] font-medium text-emerald-400">Conectada à sua conta</span></span>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]" />
                </div>

                <div className="p-5 sm:p-7">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Sincronizando agora</span>
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/30 p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[linear-gradient(145deg,rgba(124,58,237,.35),rgba(24,24,27,.8))] text-violet-200"><Play size={21} fill="currentColor" /></span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-base font-black">Seu filme ou episódio</span>
                        <span className="mt-1 block text-xs text-zinc-500">Progresso salvo automaticamente</span>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-[64%] rounded-full bg-gradient-to-r from-violet-600 to-violet-300" /></div>
                      </div>
                      <span className="hidden text-xs font-black text-violet-300 sm:block">64%</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[['1', 'Instale'], ['2', 'Conecte'], ['3', 'Assista']].map(([step, label]) => (
                      <div key={step} className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-4 text-center">
                        <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-violet-500/10 text-[10px] font-black text-violet-300">{step}</span>
                        <strong className="mt-2 block text-xs font-black text-zinc-300">{label}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experiencia" className="scroll-mt-20 border-y border-white/[0.06] bg-[#0b0b0f] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-16">
          <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08080b] shadow-2xl">
              <img src="/preview2.png" className="block h-auto w-full object-contain" alt="Perfil personalizado no CineSorte" loading="lazy" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0f]/55 via-transparent to-transparent" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-400">Uma experiência que é sua</span>
              <h2 className="mt-3 max-w-[560px] text-3xl font-black tracking-[-0.04em] sm:text-4xl">Seu perfil conta a história do que você ama assistir.</h2>
              <p className="mt-5 max-w-[560px] text-base font-medium leading-7 text-zinc-400">Personalize avatar e capa, construa seu diário e evolua enquanto explora novos filmes e séries.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {['Perfil com a sua identidade', 'Diário de filmes e séries', 'Níveis e títulos exclusivos', 'Listas para qualquer ocasião'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-bold text-zinc-300"><Check size={16} className="shrink-0 text-violet-400" />{item}</div>
                ))}
              </div>
              <Link to="/register" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-violet-300 transition-colors hover:text-violet-200">Montar meu perfil <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section id="comunidade" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28 xl:px-16">
          <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl border border-violet-300/15 bg-[linear-gradient(120deg,rgba(109,40,217,0.22),rgba(255,255,255,0.025)_55%)] px-7 py-12 sm:px-12 sm:py-14 lg:px-16">
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 bg-violet-500/15 blur-[80px]" />
            <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-[580px]">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">A próxima sessão começa aqui</span>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Cinema é melhor quando vira conversa.</h2>
                <p className="mt-4 text-base leading-7 text-zinc-400">Entre para o CineSorte, encontre sua comunidade e nunca mais fique sem saber o que assistir.</p>
              </div>
              <Link to="/register" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-zinc-950 transition-all hover:bg-violet-100 active:scale-[0.98]">Criar minha conta <ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:text-left lg:px-7 xl:px-11">
          <div>
            <span className="text-base font-black tracking-[-0.04em]">Cine<span className="text-violet-400">Sorte</span></span>
            <p className="mt-1.5 text-[11px] font-medium text-zinc-700">© 2026 CineSorte. Todos os direitos reservados.</p>
          </div>
          <div className="flex items-center justify-center gap-5 text-xs font-bold text-zinc-600">
            <Link to="/login" className="transition-colors hover:text-white">Entrar</Link>
            <Link to="/register" className="transition-colors hover:text-white">Criar conta</Link>
            <a href="https://www.linkedin.com/in/brian-lucca-cardozo" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">LinkedIn</a>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-[1376px] border-t border-white/[0.05] pt-5 text-center text-[11px] leading-5 text-zinc-700 sm:text-left">Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.</p>
      </footer>
    </div>
  );
}
