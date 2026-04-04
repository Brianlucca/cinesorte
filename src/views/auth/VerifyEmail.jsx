import { Mail, ArrowRight, CheckCircle2, Film } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function VerifyEmail() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3">
                <span className="text-3xl font-black text-white tracking-tight">CineSorte</span>
            </div>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-center shadow-inner group">
                    <Mail className="w-10 h-10 text-zinc-500 group-hover:text-violet-400 transition-colors duration-500" />
                    <div className="absolute -top-2 -right-2 bg-zinc-950 rounded-xl p-1.5 border border-white/5 shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Verifique seu Email</h2>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-10 font-medium">
              Enviamos um link de confirmação para sua caixa de entrada. Clique no link para ativar sua conta e acessar a plataforma.
            </p>

            <div className="w-full space-y-6">
                <Link 
                    to={`/login${location.search}`}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-zinc-200 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 group"
                >
                    Voltar para Login
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="pt-6 border-t border-white/5 w-full">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">
                        Não recebeu o email? <br/>
                        <span className="text-zinc-400">Verifique sua pasta de Spam ou Lixo Eletrônico.</span>
                    </p>
                </div>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            &copy; 2026 CineSorte. Todos os Direitos Reservados.
        </p>
      </div>
    </div>
  );
}