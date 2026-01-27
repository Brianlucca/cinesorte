import { Trophy, Crown, Sparkles, Zap, Shield, Star, Flame, Eye } from "lucide-react";

export default function LevelBadge({ title, size = "md" }) {
  
  const getStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema":
        return {
          container: "bg-black border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse",
          text: "bg-gradient-to-r from-cyan-300 via-white to-blue-500 text-transparent bg-clip-text font-black animate-gradient bg-[length:200%_auto]",
          icon: <Eye className="text-cyan-400 animate-bounce" size={size === "lg" ? 20 : 14} />,
          effect: "raios-cyan"
        };
      case "Entidade Cinematográfica":
        return {
          container: "bg-black border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
          text: "bg-gradient-to-r from-fuchsia-500 via-purple-300 to-pink-500 text-transparent bg-clip-text font-black",
          icon: <Sparkles className="text-fuchsia-400 animate-spin-slow" size={size === "lg" ? 20 : 14} />,
          effect: "aura-roxa"
        };
      case "Oráculo da Sétima Arte":
        return {
          container: "bg-black border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
          text: "bg-gradient-to-r from-emerald-400 via-green-200 to-teal-500 text-transparent bg-clip-text font-extrabold",
          icon: <Zap className="text-emerald-400" size={size === "lg" ? 20 : 14} />,
          effect: "brilho-verde"
        };
      case "Mestre da Crítica":
        return {
          container: "bg-yellow-950/30 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
          text: "text-yellow-400 font-bold",
          icon: <Crown className="text-yellow-500 fill-yellow-500" size={size === "lg" ? 20 : 14} />,
          effect: "ouro"
        };
      case "Cinéfilo Experiente":
        return {
          container: "bg-zinc-800 border border-zinc-600",
          text: "text-zinc-300 font-bold",
          icon: <Star className="text-zinc-400" size={size === "lg" ? 20 : 14} />,
          effect: "prata"
        };
      case "Cinéfilo":
        return {
          container: "bg-zinc-900 border border-zinc-700",
          text: "text-zinc-400 font-medium",
          icon: <Flame className="text-orange-700" size={size === "lg" ? 20 : 14} />,
          effect: "bronze"
        };
      default: // Espectador e outros
        return {
          container: "bg-zinc-900/50 border border-zinc-800",
          text: "text-zinc-500 font-medium",
          icon: <Shield className="text-zinc-600" size={size === "lg" ? 20 : 14} />,
          effect: "padrao"
        };
    }
  };

  const style = getStyle(title);
  
  const sizeClasses = size === "lg" 
    ? "px-4 py-2 text-sm md:text-base rounded-xl" 
    : "px-2.5 py-1 text-[10px] rounded-lg";

  return (
    <div className={`relative inline-flex items-center gap-2 ${sizeClasses} ${style.container} backdrop-blur-md overflow-hidden group select-none`}>
      {/* Efeito de "Raios" passando (Shine effect) para níveis altos */}
      {(style.effect === 'raios-cyan' || style.effect === 'aura-roxa') && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}

      <span className="relative z-10">{style.icon}</span>
      <span className={`relative z-10 uppercase tracking-wider ${style.text}`}>
        {title}
      </span>
    </div>
  );
}