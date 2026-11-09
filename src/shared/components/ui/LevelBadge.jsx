import { Award, Crown, Eye, MessageSquare, PenTool, Sparkles, Star, Zap } from "lucide-react";

const TIERS = [
  {
    id: "divindade",
    minReviews: 500,
    title: "divindade do cinema",
    icon: Crown,
    main: "Divindade",
    sub: "do cinema",
  },
  {
    id: "entidade",
    minReviews: 250,
    title: "entidade cinematografica",
    icon: Zap,
    main: "Entidade",
    sub: "cinematográfica",
  },
  {
    id: "oraculo",
    minReviews: 100,
    title: "oraculo da setima arte",
    icon: Sparkles,
    main: "Oráculo",
    sub: "da sétima arte",
  },
  {
    id: "mestre",
    minReviews: 50,
    title: "mestre da critica",
    icon: Award,
    main: "Mestre",
    sub: "da crítica",
  },
  {
    id: "experiente",
    minReviews: 20,
    title: "cinefilo experiente",
    icon: Star,
    main: "Cinéfilo",
    sub: "experiente",
  },
  {
    id: "cinefilo",
    minReviews: 10,
    title: "cinefilo",
    icon: MessageSquare,
    main: "Cinéfilo",
  },
  {
    id: "iniciante",
    minReviews: 5,
    title: "critico iniciante",
    icon: PenTool,
    main: "Crítico",
    sub: "iniciante",
  },
  {
    id: "espectador",
    minReviews: 0,
    title: "espectador",
    icon: Eye,
    main: "Espectador",
  },
];

const DEFAULT_TIER = TIERS[TIERS.length - 1];

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getTierByReviews = (reviewsCount) => {
  if (reviewsCount === null || reviewsCount === undefined || reviewsCount === "") return null;

  const count = Number(reviewsCount);
  if (!Number.isFinite(count)) return null;

  return TIERS.find((tier) => count >= tier.minReviews) || DEFAULT_TIER;
};

const getTierByTitle = (title) => {
  const key = normalize(title);
  if (!key) return DEFAULT_TIER;

  return TIERS.find((tier) => normalize(`${tier.main} ${tier.sub || ""}`) === key || tier.title === key) || DEFAULT_TIER;
};

const resolveTier = (title, reviewsCount) => getTierByReviews(reviewsCount) || getTierByTitle(title);

export function LevelMedal({ title, reviewsCount, className = "" }) {
  const tier = resolveTier(title, reviewsCount);
  const Icon = tier.icon;

  return (
    <span
      className={`tb-medal${className ? ` ${className}` : ""}`}
      data-tier={tier.id}
      aria-hidden="true"
    >
      <Icon />
    </span>
  );
}

export default function LevelBadge({ title, reviewsCount, compact = false, className = "" }) {
  const tier = resolveTier(title, reviewsCount);
  const Icon = tier.icon;

  return (
    <span
      className={`tb${compact ? " tb--compact" : ""}${className ? ` ${className}` : ""}`}
      data-tier={tier.id}
    >
      <span className="tb__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="tb__text">
        <span className="tb__main">{tier.main}</span>
        {tier.sub && (
          <>
            <span className="tb__dot" aria-hidden="true" />
            <span className="tb__sub">{tier.sub}</span>
          </>
        )}
      </span>
    </span>
  );
}
