export const WATCH_PARTY_SOURCES = [
  { id: "screen", name: "Compartilhar janela ou tela", description: "Ideal para uma aba de streaming ou outra janela. O navegador pedirá sua autorização ao entrar.", icon: "screen" },
  { id: "local", name: "Pasta de filmes", description: "Escolha uma pasta do computador e monte sua playlist. O CineSorte não salva o conteúdo nem envia os arquivos ao banco de dados.", icon: "folder" },
];

export const WATCH_PARTY_PRIVACY = [
  { id: "public", label: "Público", description: "Qualquer pessoa do CineSorte pode encontrar e acessar." },
  { id: "invite", label: "Somente convidados", description: "A entrada acontece exclusivamente pelo código da sala." },
  { id: "followers", label: "Pessoas que me seguem", description: "Somente seus seguidores; você também pode limitar a pessoas específicas." },
  { id: "following", label: "Pessoas que eu sigo", description: "Somente perfis que você segue; você também pode limitar a pessoas específicas." },
];

export const INITIAL_PARTY_FORM = { name: "", service: "screen", privacy: "invite", selectedUserIds: [], allowGuestControl: false };
