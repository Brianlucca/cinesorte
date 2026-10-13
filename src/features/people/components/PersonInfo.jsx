import { createElement } from "react";
import {
  Calendar,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  Twitter,
  User,
} from "lucide-react";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("pt-BR", { dateStyle: "long" });
}

function calculateAge(birthday, deathday) {
  if (!birthday) return null;
  const birth = new Date(`${birthday}T12:00:00`);
  const end = deathday ? new Date(`${deathday}T12:00:00`) : new Date();
  if (Number.isNaN(birth.getTime()) || Number.isNaN(end.getTime())) return null;

  let age = end.getFullYear() - birth.getFullYear();
  const birthdayHasPassed =
    end.getMonth() > birth.getMonth() ||
    (end.getMonth() === birth.getMonth() && end.getDate() >= birth.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

const socialLinks = [
  { key: "instagram_id", label: "Instagram", href: (id) => `https://instagram.com/${id}`, Icon: Instagram, color: "text-[#E4405F]" },
  { key: "twitter_id", label: "X / Twitter", href: (id) => `https://twitter.com/${id}`, Icon: Twitter, color: "text-[#1DA1F2]" },
  { key: "facebook_id", label: "Facebook", href: (id) => `https://facebook.com/${id}`, Icon: Facebook, color: "text-[#1877F2]" },
  { key: "imdb_id", label: "IMDb", href: (id) => `https://www.imdb.com/name/${id}`, Icon: null, color: "text-[#F5C518]" },
];

export default function PersonInfo({ details }) {
  const age = calculateAge(details.birthday, details.deathday);
  const birthDate = formatDate(details.birthday);
  const deathDate = formatDate(details.deathday);
  const social = details.external_ids || {};
  const gender =
    details.gender === 1
      ? "Feminino"
      : details.gender === 2
        ? "Masculino"
        : "Não informado";

  return (
    <section className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <div className="mb-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
          Perfil
        </span>
        <h2 className="mt-1 text-base font-semibold text-white">Dados pessoais</h2>
      </div>

      <dl className="space-y-4">
        <InfoItem icon={User} label="Gênero" value={gender} />
        {birthDate && (
          <InfoItem
            icon={Calendar}
            label="Nascimento"
            value={`${birthDate}${age !== null && !details.deathday ? ` · ${age} anos` : ""}`}
          />
        )}
        {deathDate && (
          <InfoItem
            icon={Calendar}
            label="Falecimento"
            value={`${deathDate}${age !== null ? ` · aos ${age} anos` : ""}`}
            highlight
          />
        )}
        {details.place_of_birth && (
          <InfoItem icon={MapPin} label="Local de nascimento" value={details.place_of_birth} />
        )}
        {details.homepage && (
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
            <dt className="flex items-center gap-2 text-xs text-zinc-500">
              <Globe size={14} /> Website
            </dt>
            <dd>
              <a
                href={details.homepage}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
              >
                Visitar
              </a>
            </dd>
          </div>
        )}
      </dl>

      {details.also_known_as?.length > 0 && (
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <h3 className="mb-2.5 text-xs font-medium text-zinc-400">Também conhecido como</h3>
          <ul className="flex flex-wrap gap-2">
            {details.also_known_as.slice(0, 4).map((alias, index) => (
              <li
                key={`${alias}-${index}`}
                className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-xs text-zinc-300"
              >
                {alias}
              </li>
            ))}
          </ul>
        </div>
      )}

      {socialLinks.some(({ key }) => social[key]) && (
        <nav className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4" aria-label="Redes sociais">
          {socialLinks.map(({ key, label, href, Icon, color }) =>
            social[key] ? (
              <a
                key={key}
                href={href(social[key])}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 text-xs font-medium transition-colors hover:bg-white/[0.06] ${color}`}
              >
                {Icon ? <Icon size={15} /> : <span>IMDb</span>}
                {Icon && <span className="sr-only">{label}</span>}
              </a>
            ) : null,
          )}
        </nav>
      )}
    </section>
  );
}

function InfoItem({ icon, label, value, highlight = false }) {
  return (
    <div className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
      <dt className="flex items-center gap-2 text-xs text-zinc-500">
        {createElement(icon, { size: 14 })} {label}
      </dt>
      <dd className={`mt-1.5 break-words text-sm leading-5 ${highlight ? "text-zinc-200" : "text-zinc-300"}`}>
        {value}
      </dd>
    </div>
  );
}
