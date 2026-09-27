---
name: cinesorte-development
description: Desenvolver, corrigir ou revisar o frontend cinesorte e o cinesorte-backend, aplicando as convenções obrigatórias de branch, pull request e commits dos dois repositórios.
---

# Desenvolvimento CineSorte

Use esta skill para alterações em `cinesorte` e `cinesorte-backend`.

## Repositórios

- Frontend: `C:\Users\Brian\repos\cinesorte`
- Backend: `C:\Users\Brian\repos\cinesorte-backend`

## Git e pull requests

- Nunca abra pull request contra `main`. A branch base obrigatória é sempre `dev`.
- Antes de abrir um PR, confirme explicitamente que a base selecionada é `dev`.
- Use Conventional Commits no formato `tipo(escopo): descrição`, com tipos como `feat`, `fix`, `refactor`, `test`, `docs` e `chore`.
- Faça exatamente um commit por arquivo alterado. Não agrupe dois ou mais arquivos no mesmo commit, mesmo quando pertencem à mesma funcionalidade.
- Cada commit deve incluir somente aquele arquivo e ter uma mensagem Conventional Commit que descreva sua alteração.
- Não crie commits nem abra PR sem autorização do usuário. Quando autorizado, preserve mudanças preexistentes e não relacionadas.

Ao entregar uma alteração ainda não commitada, proponha mensagens de commit individuais por arquivo quando isso for útil para o próximo passo.

## Sistema visual do frontend

- Ao criar ou refatorar uma tela, reutilize a linguagem visual já consolidada na Home, Feed e Detalhes; não crie uma identidade isolada para cada página.
- Use `#111216` como fundo principal, `#181a20` para superfícies destacadas, `bg-white/[0.018]` para superfícies leves e `border-white/[0.06]` para divisórias e contornos.
- Use violeta como acento, não como preenchimento dominante.
- Cabeçalhos de páginas internas devem seguir o Feed: `text-3xl sm:text-4xl`, `font-semibold`, `leading-tight` e `tracking-[-0.035em]`.
- A escala de hero de Detalhes (`text-4xl sm:text-5xl`, entrelinha próxima de `0.98`) é reservada ao título de um filme, série, temporada ou episódio em destaque sobre imagem; não deve ser usada em frases introdutórias ou títulos comuns de página.
- Títulos de seção devem seguir `text-xl md:text-2xl`, `font-semibold` e `tracking-[-0.02em]`.
- CTAs principais devem usar `text-sm font-semibold`; evite `font-black` em títulos e ações das telas já reformuladas.
- Prefira `rounded-xl`, bordas discretas e hierarquia por espaçamento. Evite acumular caixas, sombras e gradientes para separar cada bloco.
