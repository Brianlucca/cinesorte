import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Check, Clapperboard, Download, Heart, MessageCircle, Play, Plug, ShieldCheck, Sparkles, Star } from 'lucide-react';

const EDGE_EXTENSION_URL = import.meta.env.VITE_EXTENSION_STORE_URL || '';
const IS_EDGE_BROWSER = typeof navigator !== 'undefined' && /Edg(?:A|iOS)?\//.test(navigator.userAgent);

const posters = [
  { title: 'Blade Runner 2049', image: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', rating: '4.8' },
  { title: 'Oppenheimer', image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: '4.6' },
  { title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rating: '4.7' },
  { title: 'Pulp Fiction', image: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rating: '4.8' },
  { title: 'Matrix', image: 'https://image.tmdb.org/t/p/w500/lDqMDI3xpbB9UQRyeXfei0MXhqb.jpg', rating: '4.7' },
];

const reviews = [
  { user: '@marinafilmes', title: 'Blade Runner 2049', text: 'Um filme sobre memória, pertencimento e tudo aquilo que escolhemos chamar de humano.', rating: '5.0', image: posters[0].image },
  { user: '@joaovitor', title: 'Duna: Parte Dois', text: 'Escala gigantesca, mas nunca perde o peso das decisões íntimas dos personagens.', rating: '4.8', image: posters[2].image },
  { user: '@claracosta', title: 'Pulp Fiction', text: 'Elétrico, divertido e impossível de esquecer.', rating: '4.8', image: posters[3].image },
];

const experiences = [
  { icon: Star, label: 'Reviews', title: 'Sua opinião encontra outras pessoas.', text: 'Escreva, avalie e participe de conversas que continuam depois dos créditos.' },
  { icon: Bookmark, label: 'Listas', title: 'Organize sem transformar tudo em planilha.', text: 'Crie coleções pessoais para qualquer humor, ocasião ou descoberta.' },
  { icon: Sparkles, label: 'Descoberta', title: 'Menos algoritmo genérico. Mais contexto.', text: 'Encontre o próximo título por pessoas, gêneros, listas e momentos.' },
];

function scrollTo(event, id) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#111216] text-white selection:bg-violet-500/35">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#111216]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5" aria-label="CineSorte — início">
            <Clapperboard size={24} strokeWidth={2.2} className="text-violet-400" />
            <span className="text-lg font-semibold tracking-[-0.04em]">Cine<span className="text-violet-400">Sorte</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
            <a href="#experiencia" onClick={(event) => scrollTo(event, 'experiencia')} className="text-xs font-medium text-zinc-500 hover:text-white">Experiência</a>
            <a href="#comunidade" onClick={(event) => scrollTo(event, 'comunidade')} className="text-xs font-medium text-zinc-500 hover:text-white">Comunidade</a>
            <a href="#extensao" onClick={(event) => scrollTo(event, 'extensao')} className="text-xs font-medium text-zinc-500 hover:text-white">Extensão</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:text-white">Entrar</Link>
            <Link to="/register" className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-violet-100">Criar conta</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[820px] items-end overflow-hidden pt-16 lg:min-h-screen">
          <img src="https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#111216_0%,rgba(17,18,22,0.9)_28%,rgba(17,18,22,0.25)_70%,rgba(17,18,22,0.55)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#111216_0%,rgba(17,18,22,0.92)_18%,transparent_62%,rgba(17,18,22,0.45)_100%)]" />

          <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
            <div className="max-w-[760px]">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300"><span className="h-px w-8 bg-violet-400" /> Uma comunidade movida por histórias</p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">O filme termina.<br />A conversa começa.</h1>
              <p className="mt-6 max-w-[590px] text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">Descubra o que assistir, registre o que sentiu e construa uma vida inteira em filmes e séries.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100">Começar gratuitamente <ArrowRight size={16} /></Link>
                <a href="#comunidade" onClick={(event) => scrollTo(event, 'comunidade')} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"><Play size={15} fill="currentColor" /> Explorar a comunidade</a>
              </div>
            </div>

            <div className="mt-14 flex max-w-[920px] gap-3 overflow-hidden sm:gap-4">
              {posters.map((poster, index) => (
                <article key={poster.title} className={`relative w-[118px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#181a20] sm:w-[142px] ${index > 3 ? 'hidden lg:block' : ''}`}>
                  <img src={poster.image} alt={poster.title} className="aspect-[2/3] w-full object-cover" />
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1 text-[10px] font-semibold"><Star size={10} fill="currentColor" className="text-amber-300" />{poster.rating}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experiencia" className="scroll-mt-16 border-b border-white/[0.06] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Feito para quem realmente assiste</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Não é só um catálogo. É a sua relação com o cinema.</h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-zinc-500">Tudo que você assiste, pensa e recomenda ganha contexto em um único lugar.</p>
              </div>
              <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {experiences.map(({ icon, label, title, text }, index) => (
                  <article key={label} className="grid gap-5 py-8 sm:grid-cols-[64px_1fr] sm:py-10">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] text-violet-300">{createElement(icon, { size: 20 })}</span>
                    <div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">0{index + 1} · {label}</span><h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">{text}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="comunidade" className="scroll-mt-16 bg-[#0d0e12] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">A conversa está acontecendo</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Reviews que fazem você querer assistir.</h2></div>
              <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white">Participar <ArrowRight size={15} /></Link>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.title} className="bg-[#111216] p-6 sm:p-8">
                  <div className="flex items-start gap-4"><img src={review.image} alt="" className="h-24 w-16 rounded-lg object-cover" /><div className="min-w-0"><p className="text-xs font-medium text-zinc-500">{review.user}</p><h3 className="mt-1 truncate text-base font-semibold">{review.title}</h3><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300"><Star size={12} fill="currentColor" /> {review.rating}</span></div></div>
                  <p className="mt-6 min-h-[72px] text-base leading-7 text-zinc-300">“{review.text}”</p>
                  <div className="mt-6 flex items-center gap-5 border-t border-white/[0.06] pt-4 text-xs text-zinc-600"><span className="inline-flex items-center gap-1.5"><Heart size={14} /> Curtir</span><span className="inline-flex items-center gap-1.5"><MessageCircle size={14} /> Responder</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-white/[0.06] bg-[#181a20] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="grid grid-cols-7 gap-2 sm:gap-3">{posters.concat(posters.slice(0, 2)).map((poster, index) => <img key={`${poster.title}-${index}`} src={poster.image} alt="" className={`aspect-[2/3] w-full rounded-lg object-cover ${index % 2 ? 'translate-y-8' : ''}`} loading="lazy" />)}</div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#181a20_0%,transparent_20%,transparent_80%,#181a20_100%)]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Seu diário de exibições</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Uma memória visual de tudo que marcou você.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">Registre datas, notas e reviews. Com o tempo, seu perfil se transforma em uma história pessoal contada por filmes e séries.</p>
              <ul className="mt-7 space-y-3 text-sm text-zinc-300">{['Histórico organizado por data', 'Notas, favoritos e reviews no mesmo lugar', 'Perfil que evolui com a sua trajetória'].map((item) => <li key={item} className="flex items-center gap-3"><Check size={16} className="text-violet-300" /> {item}</li>)}</ul>
            </div>
          </div>
        </section>

        <section id="extensao" className="scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-[1200px] gap-12 rounded-xl border border-white/[0.06] bg-white/[0.018] p-7 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:p-14">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300"><Plug size={13} /> CineSorte Sync</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Você assiste. A extensão lembra onde parou.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">No Microsoft Edge, o progresso pode aparecer automaticamente na sua página inicial. A conexão é opcional e controlada por você.</p>
              {IS_EDGE_BROWSER && EDGE_EXTENSION_URL ? <a href={EDGE_EXTENSION_URL} target="_blank" rel="noreferrer" className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-violet-100"><Download size={15} /> Instalar extensão</a> : <span className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-zinc-500"><ShieldCheck size={15} className="text-violet-300" /> Disponível exclusivamente para Microsoft Edge</span>}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#111216] p-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4"><span className="flex items-center gap-2 text-sm font-semibold"><Clapperboard size={17} className="text-violet-300" /> CineSorte Sync</span><span className="h-2 w-2 rounded-full bg-emerald-400" /></div>
              <div className="mt-5 flex gap-4"><img src={posters[0].image} alt="" className="h-24 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-wider text-zinc-600">Assistindo agora</p><p className="mt-1 truncate text-sm font-semibold">Blade Runner 2049</p><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-[68%] rounded-full bg-violet-400" /></div><p className="mt-2 text-[10px] text-zinc-600">1h 51min de 2h 43min</p></div></div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
          <div className="mx-auto max-w-[1400px] border-t border-white/[0.06] pt-16 text-center sm:pt-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Sua próxima história está esperando</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">Entre pelo filme. Fique pelas pessoas.</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-500">Crie sua conta gratuitamente e transforme o que você assiste em parte da sua história.</p>
            <Link to="/register" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-violet-100">Criar minha conta <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div><span className="text-base font-semibold tracking-[-0.04em]">Cine<span className="text-violet-400">Sorte</span></span><p className="mt-1 text-[11px] text-zinc-700">© 2026 CineSorte. Este produto usa a API da TMDB.</p></div>
          <div className="flex justify-center gap-5 text-xs font-medium text-zinc-600"><Link to="/login" className="hover:text-white">Entrar</Link><Link to="/register" className="hover:text-white">Criar conta</Link><a href="https://www.linkedin.com/in/brian-lucca-cardozo" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a></div>
        </div>
      </footer>
    </div>
  );
}
