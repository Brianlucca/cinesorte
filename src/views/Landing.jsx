import { Link } from 'react-router-dom';
import { Users, MessageSquare, Star, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-white selection:bg-violet-500 selection:text-white">
      <nav className="fixed top-0 z-[100] w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter md:text-[2rem]">
              CINE<span className="text-violet-500">SORTE</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-5 py-2.5 text-sm font-black uppercase tracking-widest text-zinc-400 transition-all hover:text-white">
              Entrar
            </Link>
            <Link
              to="/register"
              className="rounded-2xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200 active:scale-95 md:text-sm"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center px-6 pb-20 pt-36 md:pb-24 md:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-[1200px] -translate-x-1/2">
          <div className="absolute left-10 top-20 h-56 w-56 animate-pulse rounded-full bg-violet-600/20 blur-[120px] md:h-72 md:w-72" />
          <div className="absolute right-10 top-40 h-56 w-56 animate-pulse rounded-full bg-indigo-600/20 blur-[120px] delay-700 md:h-72 md:w-72" />
        </div>

        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              A rede social definitiva para cinéfilos
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-black leading-[0.95] tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000 sm:text-5xl md:mb-8 md:text-7xl">
            Sua jornada <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              cinematográfica
            </span>
            <br />
            começa agora.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base font-medium leading-relaxed text-zinc-400 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 md:text-lg">
            Crie sua biblioteca pessoal, avalie seus filmes favoritos, descubra trailers e conecte-se com amigos apaixonados pela sétima arte.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 sm:flex-row">
            <Link
              to="/register"
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-violet-600 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-500 active:scale-95 sm:w-auto md:text-sm"
            >
              Começar Agora
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-16 w-full max-w-6xl group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 md:mt-20">
          <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur transition duration-1000 group-hover:opacity-40" />
          <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900 shadow-2xl md:aspect-[21/9]">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            <img src="/preview.png" className="h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-105" alt="CineSorte App Preview" />
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                Prévia da Plataforma
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-12 flex flex-col items-end justify-between gap-8 md:mb-16 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-violet-500">Funcionalidades</h2>
            <h3 className="text-3xl font-black leading-none tracking-tight md:text-5xl">
              Tudo o que você precisa <br /> para organizar sua vida cinéfila.
            </h3>
          </div>
          <p className="max-w-xs text-sm font-medium text-zinc-500">
            Uma experiência completa, rápida e focada no que realmente importa: o conteúdo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: Users, title: 'Siga Amigos', desc: 'Veja o que as pessoas que você admira estão assistindo e descubra novas pérolas.' },
            { icon: MessageSquare, title: 'Críticas Reais', desc: 'Escreva suas próprias reviews e dê notas para cada obra.' },
            { icon: Star, title: 'Gamificação', desc: 'Ganhe XP, suba de nível e conquiste troféus exclusivos enquanto assiste.' },
          ].map((feature, i) => (
            <div
              key={i}
              className="group rounded-[2rem] border border-white/5 bg-zinc-900/30 p-8 shadow-inner transition-all duration-500 hover:border-violet-500/30 hover:bg-zinc-900/50"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10 text-violet-400 shadow-inner transition-transform duration-500 group-hover:scale-110">
                <feature.icon size={24} />
              </div>
              <h4 className="mb-3 text-xl font-black tracking-tight text-white">{feature.title}</h4>
              <p className="text-sm font-medium leading-relaxed text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/5 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:gap-16 lg:grid-cols-2">
          <div className="relative order-2 group lg:order-1">
            <div className="absolute -inset-4 rounded-full bg-violet-500/20 opacity-50 blur-[80px]" />
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900 shadow-2xl md:aspect-video">
              <img src="/preview2.png" className="h-full w-full object-cover opacity-50" alt="Profile Feature" />
            </div>
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <h3 className="text-3xl font-black leading-[0.95] tracking-tighter md:text-5xl">
              Perfis altamente <br />
              <span className="text-violet-500">personalizáveis.</span>
            </h3>
            <p className="text-base font-medium leading-relaxed text-zinc-400 md:text-lg">
              Escolha imagens de filmes e séries para personalizar avatar e capa dentro da plataforma e mostre seu nível de conhecimento cinematográfico.
            </p>
            <div className="grid gap-4">
              {['Títulos Dinâmicos', 'Estante de Troféus', 'Diário por Gêneros'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-300">
                  <CheckCircle2 className="text-violet-500" size={20} />
                  {item}
                </div>
              ))}
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
              Imagens e metadados fornecidos pela TMDB para uso dentro da experiência do app. Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-28">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[3rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-10 text-center shadow-[0_40px_80px_rgba(139,92,246,0.25)] md:p-16">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
          <h2 className="relative mb-8 text-3xl font-black leading-[0.9] tracking-tighter text-white md:text-5xl">
            Pronto para entrar <br /> nesse universo?
          </h2>
          <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-[2rem] bg-white px-10 py-5 text-xs font-black uppercase tracking-[0.25em] text-black shadow-2xl transition-all hover:bg-zinc-100 active:scale-95 sm:w-auto md:text-sm"
            >
              Criar Conta Agora
            </Link>
            <Link
              to="/login"
              className="w-full rounded-[2rem] border-2 border-white/30 bg-transparent px-10 py-5 text-xs font-black uppercase tracking-[0.25em] text-white transition-all hover:bg-white/10 active:scale-95 sm:w-auto md:text-sm"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-zinc-950 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 px-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter">
                CINE<span className="text-violet-500">SORTE</span>
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">© 2026 CineSorte — Todos os direitos reservados.</p>
          </div>

          <div className="flex gap-10">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Links</span>
              <Link to="/login" className="text-sm font-bold transition-colors hover:text-violet-500">
                Entrar
              </Link>
              <Link to="/register" className="text-sm font-bold transition-colors hover:text-violet-500">
                Registrar
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Social</span>
              <a href="https://www.linkedin.com/in/brian-lucca-cardozo" className="text-sm font-bold transition-colors hover:text-violet-500">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
