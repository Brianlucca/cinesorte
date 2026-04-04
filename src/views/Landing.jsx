import { Link } from 'react-router-dom';
import { Film, Star, Users, MessageSquare, Play, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-500 selection:text-white overflow-x-hidden">
      
      <nav className="fixed w-full z-[100] top-0 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-tighter">
                    CINE<span className="text-violet-500">SORTE</span>
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all px-6 py-2">
                    Entrar
                </Link>
                <Link to="/register" className="text-sm font-black uppercase tracking-[0.15em] bg-white text-black px-6 py-3 rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
                    Criar Conta
                </Link>
            </div>
        </div>
      </nav>

      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center min-h-screen">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="text-center relative max-w-5xl z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <Sparkles size={14} className="text-violet-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">A rede social definitiva para cinéfilos</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                Sua jornada <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                    cinematográfica
                </span>
                <br /> começa agora.
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Crie sua biblioteca pessoal, avalie seus filmes favoritos, descubra trailers exclusivos e conecte-se com amigos apaixonados pela sétima arte.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Link 
                    to="/register" 
                    className="w-full sm:w-auto px-10 py-5 bg-violet-600 hover:bg-violet-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(139,92,246,0.3)] active:scale-95 flex items-center justify-center gap-3"
                >
                    Começar Agora
                    <ArrowRight size={18} />
                </Link>
            </div>
        </div>

        <div className="mt-32 w-full max-w-7xl mx-auto relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-zinc-900 rounded-[2.5rem] border border-white/10 aspect-video md:aspect-[21/9] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
                <img 
                    src="/preview.png" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 opacity-60"
                    alt="CineSorte App Preview"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em]">
                        Prévia da Plataforma
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
                <h2 className="text-sm font-black text-violet-500 uppercase tracking-[0.3em] mb-4">Funcionalidades</h2>
                <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                    Tudo o que você precisa <br /> para organizar sua vida cinéfila.
                </h3>
            </div>
            <p className="text-zinc-500 font-medium max-w-xs text-sm">
                Uma experiência completa, rápida e focada no que realmente importa: o conteúdo.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: Users, title: "Siga Amigos", desc: "Veja o que as pessoas que você admira estão assistindo e descubra novas pérolas." },
                { icon: MessageSquare, title: "Críticas Reais", desc: "Escreva suas próprias reviews e dê notas de 1 a 10 para cada obra." },
                { icon: Star, title: "Gamificação", desc: "Ganhe XP, suba de nível e conquiste troféus exclusivos enquanto assiste." }
            ].map((feature, i) => (
                <div key={i} className="p-10 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] hover:bg-zinc-900/50 hover:border-violet-500/30 transition-all duration-500 group shadow-inner">
                    <div className="w-14 h-14 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-400 mb-8 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <feature.icon size={28} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h4>
                    <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>

      <section className="py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative group order-2 lg:order-1">
                <div className="absolute -inset-4 bg-violet-500/20 blur-[80px] rounded-full opacity-50" />
                <div className="relative aspect-square md:aspect-video rounded-[3rem] bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl">
                    <img 
                        src="/preview2.png" 
                        className="w-full h-full object-cover opacity-50" 
                        alt="Profile Feature"
                    />
                </div>
            </div>
            
            <div className="space-y-8 order-1 lg:order-2">
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
                    Perfis altamente <br /> 
                    <span className="text-violet-500">personalizáveis.</span>
                </h3>
                <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                    Escolha capas de seus filmes favoritos, mude seu avatar e mostre seu nível de conhecimento cinematográfico para o mundo.
                </p>
                <div className="grid gap-4">
                    {["Títulos Dinâmicos", "Estante de Troféus", "Diário por Gêneros"].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-zinc-300">
                            <CheckCircle2 className="text-violet-500" size={20} />
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_40px_80px_rgba(139,92,246,0.25)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
            <h2 className="relative text-4xl md:text-7xl font-black tracking-tighter text-white mb-10 leading-[0.85]">
                Pronto para entrar <br /> nesse universo?
            </h2>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                    to="/register" 
                    className="w-full sm:w-auto px-12 py-6 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-zinc-100 transition-all shadow-2xl active:scale-95"
                >
                    Criar Conta Agora
                </Link>
                <Link 
                    to="/login" 
                    className="w-full sm:w-auto px-12 py-6 bg-transparent border-2 border-white/30 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95"
                >
                    Já tenho conta
                </Link>
            </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
                <div className="flex items-center gap-3">  
                    <span className="text-xl font-black tracking-tighter">CINE<span className="text-violet-500">SORTE</span></span>
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">© 2026 CineSorte — Todos os direitos reservados.</p>
            </div>
            
            <div className="flex gap-10">
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Links</span>
                    <Link to="/login" className="text-sm font-bold hover:text-violet-500 transition-colors">Entrar</Link>
                    <Link to="/register" className="text-sm font-bold hover:text-violet-500 transition-colors">Registrar</Link>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Social</span>
                    <a href="https://www.linkedin.com/in/brian-lucca-cardozo" className="text-sm font-bold hover:text-violet-500 transition-colors">LinkedIn</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}