import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-500 selection:text-white">
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-2xl font-black tracking-tighter">
                CINE<span className="text-violet-500">SORTE</span>
            </span>
            <div className="flex gap-4">
                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2">
                    Entrar
                </Link>
                <Link to="/register" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                    Criar Conta
                </Link>
            </div>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center relative max-w-4xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/30 blur-[100px] rounded-full pointer-events-none" />
            
            <h1 className="relative text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                Sua rede social de <br />
                <span className="text-violet-500">cinema e séries.</span>
            </h1>
            
            <p className="relative text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
                Avalie, compartilhe e descubra novas histórias com seus amigos.
            </p>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                    to="/register" 
                    className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all"
                >
                    Começar Agora
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
}