# TasKiro — Gerenciador de Tarefas

Protótipo de um gerenciador de tarefas moderno e totalmente navegável, construído com HTML, [Tailwind CSS](https://tailwindcss.com) (via Play CDN) e ícones [Lucide](https://lucide.dev) (via CDN).

![Logo](https://kiro.dev/images/community/events/thumbnails/meetup2.svg)

---

## Sobre este exercício

Este projeto é a realização do **Lab 1: Construir um App de Gestão de Tarefas**, do workshop da AWS **"Kiro — Trabalhando em Ambientes Corporativos"**.

A diferença é que, em vez de executar a prática no Kiro para IDE/Desktop, **a mesma prática foi reproduzida no [Kiro Web](https://kiro.dev)**, gerando o resultado deste repositório.

### Configuração utilizada no Kiro Web

| Item | Configuração |
|------|--------------|
| **Modelo** | Claude Opus 4.8 |
| **Fonte** | Repositório do GitHub selecionado |
| **Autonomous** | Desabilitado |
| **Spec** | Não selecionado |
| **Duração aproximada** | ~10 min (Elapsed Time: 7m 36s) |

---

## Prompt utilizado

O resultado deste repositório pode ser reproduzido com o seguinte prompt, enviado no chat do Kiro Web:

> Projeto: TasKiro
>
> Você é um desenvolvedor sênior de produtos digitais com experiência em UX Design.
>
> Construa um protótipo de um gerenciador de tarefas moderno e funcional usando HTML.
>
> A biblioteca de ícones Lucide deve ser carregada via CDN (https://lucide.dev). Não use emojis.
> O framework Tailwind CSS deve ser carregado via Play CDN (https://cdn.tailwindcss.com).
>
> O protótipo deve ser totalmente navegável: todo botão e elemento interativo deve executar uma ação real ao ser clicado, sem botões "mortos" (sem lógica). Além disso, camadas como modais, overlays e toasts não podem ficar sobre a interface quando fechados. Implemente a ocultação de modo que ela vença qualquer `display` definido por classe (ex.: `[hidden]{display:none !important}` ou alternância de classe equivalente), e confirme que elementos ocultos não interceptam cliques (`pointer-events` / área clicável).
>
> Os menus devem ficar fixos na posição correta e permanecer visíveis quando o usuário rolar a página.
>
> Use essa imagem como logo (https://kiro.dev/images/community/events/thumbnails/meetup2.svg).

---

## Funcionalidades

- **Visão Quadro (Kanban)** e **Visão Lista**, com **arrastar-e-soltar** entre as colunas (A fazer / Em andamento / Concluída).
- **CRUD completo** de tarefas: criar, editar, duplicar, concluir e excluir.
- **Projetos** com cores personalizadas.
- **Visões inteligentes**: Todas, Hoje, Próximas, Atrasadas, Concluídas e por projeto.
- Filtro por **prioridade**, **ordenação** (manual, data, prioridade, A-Z) e **busca**.
- **Tema claro/escuro**.
- **Persistência** em `localStorage` (os dados ficam salvos no navegador).
- Atalhos de teclado: `N` para nova tarefa, `Esc` para fechar camadas.

## Requisitos técnicos atendidos

- **Sem botões "mortos"**: todo elemento interativo dispara uma ação real, via delegação de eventos (`data-action`).
- **Ocultação robusta** que vence qualquer `display` de classe e impede interceptação de cliques:
  ```css
  [hidden] {
    display: none !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }
  ```
- **Menus fixos e visíveis na rolagem**: barra lateral `fixed`, cabeçalho `sticky top-0` (mantém os dropdowns ancorados) e o menu de contexto do card em `position: fixed`.
- **Sem emojis**; ícones exclusivamente via Lucide.

## Stack

- HTML5
- Tailwind CSS via Play CDN (`https://cdn.tailwindcss.com`)
- Ícones Lucide via CDN (`https://unpkg.com/lucide`)
- JavaScript puro (sem build/dependências)

## Como executar

Não há etapa de build. Basta abrir o arquivo `index.html` em um navegador moderno:

```bash
# opção 1: abrir diretamente
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows

# opção 2: servir localmente
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

> É necessário acesso à internet para carregar o Tailwind, os ícones Lucide e o logo via CDN.

## Estrutura do projeto

```
.
├── index.html   # Marcação, estilos e camadas (modais, menus, toasts)
├── app.js       # Lógica: estado, render, CRUD, drag & drop, filtros
└── README.md    # Este arquivo
```

## Limitações conhecidas

- Itens de demonstração no menu do usuário (Perfil / Configurações / Sair) exibem apenas um toast informativo, pois não há backend.
- A persistência é local ao navegador (`localStorage`); não há sincronização entre dispositivos.
