import { Users } from "lucide-react";

export default function MessageAvatar({ thread, size = "md" }) {
  const dimensions = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  if (thread?.avatar) {
    return (
      <span className={`block shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-800 ${dimensions}`}>
        <img src={thread.avatar} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className={`grid shrink-0 place-items-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-sm font-bold text-violet-200 ${dimensions}`}>
      {thread?.type === "group" ? <Users size={size === "sm" ? 16 : 18} /> : (thread?.displayName?.[0] || "U")}
    </span>
  );
}
