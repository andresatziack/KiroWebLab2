/* ============================================================
   TasKiro — Task Manager Prototype
   Vanilla JS, localStorage persistence, fully interactive.
   ============================================================ */
(function () {
  'use strict';

  // ---------- Constants ----------
  const STORE_KEY = 'taskiro.v1';
  const PROJECT_COLORS = [
    { name: 'indigo', dot: 'bg-brand-500', text: 'text-brand-600', soft: 'bg-brand-100 dark:bg-brand-900/40' },
    { name: 'rose',   dot: 'bg-rose-500',  text: 'text-rose-600',  soft: 'bg-rose-100 dark:bg-rose-900/40' },
    { name: 'emerald',dot: 'bg-emerald-500',text:'text-emerald-600',soft:'bg-emerald-100 dark:bg-emerald-900/40' },
    { name: 'amber',  dot: 'bg-amber-500',  text: 'text-amber-600', soft: 'bg-amber-100 dark:bg-amber-900/40' },
    { name: 'sky',    dot: 'bg-sky-500',    text: 'text-sky-600',   soft: 'bg-sky-100 dark:bg-sky-900/40' },
    { name: 'fuchsia',dot: 'bg-fuchsia-500',text:'text-fuchsia-600',soft:'bg-fuchsia-100 dark:bg-fuchsia-900/40' },
  ];
  const COLUMNS = [
    { id: 'todo',  label: 'A fazer',       icon: 'circle',        accent: 'text-slate-400' },
    { id: 'doing', label: 'Em andamento',  icon: 'loader',        accent: 'text-amber-500' },
    { id: 'done',  label: 'Concluída',     icon: 'check-circle-2', accent: 'text-emerald-500' },
  ];
  const PRIORITY = {
    high:   { label: 'Alta',  badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300', dot: 'bg-rose-500', rank: 0 },
    medium: { label: 'Média', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-amber-500', rank: 1 },
    low:    { label: 'Baixa', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', dot: 'bg-sky-500', rank: 2 },
  };
  const VIEWS = [
    { id: 'all',       label: 'Todas as tarefas', sub: 'Seu painel completo',        icon: 'layout-grid' },
    { id: 'today',     label: 'Hoje',             sub: 'Vence hoje',                  icon: 'sun' },
    { id: 'upcoming',  label: 'Próximas',         sub: 'Com prazo futuro',            icon: 'calendar-clock' },
    { id: 'overdue',   label: 'Atrasadas',        sub: 'Passaram do prazo',           icon: 'alarm-clock' },
    { id: 'completed', label: 'Concluídas',       sub: 'Tarefas finalizadas',         icon: 'check-check' },
  ];

  // ---------- State ----------
  let state = {
    tasks: [],
    projects: [],
    theme: 'light',
    layout: 'board',
    view: 'all',
    priorityFilter: 'all',
    sort: 'manual',
    search: '',
  };
  let ctx = { cardTaskId: null, selectedColor: 'indigo', confirmCb: null };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

  // ---------- Persistence ----------
  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      tasks: state.tasks, projects: state.projects,
      theme: state.theme, layout: state.layout,
    }));
  }
  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { data = null; }
    if (data && Array.isArray(data.tasks)) {
      state.tasks = data.tasks;
      state.projects = data.projects || [];
      state.theme = data.theme || 'light';
      state.layout = data.layout || 'board';
    } else {
      seed();
    }
  }
  function seed() {
    const p1 = { id: uid(), name: 'Produto', color: 'indigo' };
    const p2 = { id: uid(), name: 'Marketing', color: 'rose' };
    const p3 = { id: uid(), name: 'Pessoal', color: 'emerald' };
    state.projects = [p1, p2, p3];
    const today = new Date();
    const d = (off) => { const x = new Date(today); x.setDate(x.getDate() + off); return x.toISOString().slice(0, 10); };
    state.tasks = [
      { id: uid(), title: 'Definir wireframes do app TasKiro', desc: 'Esboçar as telas principais e o fluxo de navegação.', status: 'doing', priority: 'high', projectId: p1.id, due: d(0), tags: ['design', 'ux'], order: 0, createdAt: Date.now() },
      { id: uid(), title: 'Revisar paleta de cores', desc: 'Garantir contraste acessível (WCAG AA).', status: 'todo', priority: 'medium', projectId: p1.id, due: d(2), tags: ['design'], order: 1, createdAt: Date.now() },
      { id: uid(), title: 'Escrever copy da landing page', desc: '', status: 'todo', priority: 'medium', projectId: p2.id, due: d(3), tags: ['conteúdo'], order: 2, createdAt: Date.now() },
      { id: uid(), title: 'Configurar campanha de e-mail', desc: 'Segmentar a base e preparar o template.', status: 'doing', priority: 'low', projectId: p2.id, due: d(5), tags: ['email'], order: 3, createdAt: Date.now() },
      { id: uid(), title: 'Publicar protótipo para feedback', desc: 'Compartilhar link com o time de design.', status: 'done', priority: 'high', projectId: p1.id, due: d(-1), tags: ['review'], order: 4, createdAt: Date.now() },
      { id: uid(), title: 'Agendar consulta médica', desc: '', status: 'todo', priority: 'low', projectId: p3.id, due: d(-2), tags: [], order: 5, createdAt: Date.now() },
      { id: uid(), title: 'Preparar apresentação da sprint', desc: 'Resumo de entregas e métricas.', status: 'todo', priority: 'high', projectId: p1.id, due: d(1), tags: ['reunião'], order: 6, createdAt: Date.now() },
    ];
    save();
  }

  // ---------- Helpers ----------
  function projectById(id) { return state.projects.find(p => p.id === id) || null; }
  function colorByName(n) { return PROJECT_COLORS.find(c => c.name === n) || PROJECT_COLORS[0]; }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function formatDue(due) {
    if (!due) return null;
    const t = todayStr();
    const dt = new Date(due + 'T00:00:00');
    const now = new Date(t + 'T00:00:00');
    const diff = Math.round((dt - now) / 86400000);
    const opts = { day: '2-digit', month: 'short' };
    let label = dt.toLocaleDateString('pt-BR', opts);
    if (diff === 0) label = 'Hoje';
    else if (diff === 1) label = 'Amanhã';
    else if (diff === -1) label = 'Ontem';
    return { label, overdue: diff < 0, soon: diff >= 0 && diff <= 1, diff };
  }
  function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

  // ---------- Filtering & sorting ----------
  function visibleTasks() {
    let list = state.tasks.slice();
    const t = todayStr();
    switch (state.view) {
      case 'today': list = list.filter(x => x.due === t && x.status !== 'done'); break;
      case 'upcoming': list = list.filter(x => x.due && x.due > t && x.status !== 'done'); break;
      case 'overdue': list = list.filter(x => x.due && x.due < t && x.status !== 'done'); break;
      case 'completed': list = list.filter(x => x.status === 'done'); break;
      default:
        if (state.view.startsWith('project:')) {
          const pid = state.view.slice(8);
          list = list.filter(x => x.projectId === pid);
        }
    }
    if (state.priorityFilter !== 'all') list = list.filter(x => x.priority === state.priorityFilter);
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = list.filter(x =>
        x.title.toLowerCase().includes(q) ||
        (x.desc || '').toLowerCase().includes(q) ||
        (x.tags || []).some(tg => tg.toLowerCase().includes(q)));
    }
    const sorters = {
      manual: (a, b) => (a.order ?? 0) - (b.order ?? 0),
      due: (a, b) => (a.due || '9999').localeCompare(b.due || '9999'),
      priority: (a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank,
      alpha: (a, b) => a.title.localeCompare(b.title),
    };
    list.sort(sorters[state.sort] || sorters.manual);
    return list;
  }

  // ---------- Rendering ----------
  function render() {
    renderNav();
    renderHeader();
    const list = visibleTasks();
    $('#task-count').textContent = list.length + (list.length === 1 ? ' tarefa' : ' tarefas');

    const empty = list.length === 0;
    $('#empty-state').hidden = !empty;
    if (state.layout === 'board') {
      $('#board-view').hidden = empty;
      $('#list-view').hidden = true;
      if (!empty) renderBoard(list);
    } else {
      $('#list-view').hidden = empty;
      $('#board-view').hidden = true;
      if (!empty) renderList(list);
    }
    syncLayoutButtons();
    syncPriorityButtons();
    refreshIcons();
  }

  function renderNav() {
    // Views
    $('#nav-views').innerHTML = VIEWS.map(v => {
      const active = state.view === v.id ? ' active' : '';
      const count = countForView(v.id);
      return `<li><a class="nav-item${active}" data-action="set-view" data-view="${v.id}">
        <i data-lucide="${v.icon}" class="h-4 w-4"></i>
        <span class="flex-1">${v.label}</span>
        ${count ? `<span class="text-xs font-semibold text-slate-400">${count}</span>` : ''}
      </a></li>`;
    }).join('');

    // Projects
    $('#nav-projects').innerHTML = state.projects.map(p => {
      const c = colorByName(p.color);
      const vid = 'project:' + p.id;
      const active = state.view === vid ? ' active' : '';
      const count = state.tasks.filter(t => t.projectId === p.id).length;
      return `<li><a class="nav-item${active} group" data-action="set-view" data-view="${vid}">
        <span class="h-2.5 w-2.5 rounded-full ${c.dot}"></span>
        <span class="flex-1 truncate">${escapeHtml(p.name)}</span>
        <span class="text-xs font-semibold text-slate-400 group-hover:hidden">${count || ''}</span>
        <button data-action="delete-project" data-id="${p.id}" class="hidden group-hover:grid place-items-center h-5 w-5 rounded text-slate-400 hover:text-rose-600" title="Excluir projeto" aria-label="Excluir projeto">
          <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
        </button>
      </a></li>`;
    }).join('') || `<li class="px-3 py-2 text-xs text-slate-400">Nenhum projeto ainda.</li>`;
  }

  function countForView(id) {
    const t = todayStr();
    if (id === 'today') return state.tasks.filter(x => x.due === t && x.status !== 'done').length;
    if (id === 'upcoming') return state.tasks.filter(x => x.due && x.due > t && x.status !== 'done').length;
    if (id === 'overdue') return state.tasks.filter(x => x.due && x.due < t && x.status !== 'done').length;
    if (id === 'completed') return state.tasks.filter(x => x.status === 'done').length;
    if (id === 'all') return state.tasks.length;
    return 0;
  }

  function renderHeader() {
    let title = 'Todas as tarefas', sub = 'Seu painel completo';
    const v = VIEWS.find(x => x.id === state.view);
    if (v) { title = v.label; sub = v.sub; }
    else if (state.view.startsWith('project:')) {
      const p = projectById(state.view.slice(8));
      if (p) { title = p.name; sub = 'Projeto'; }
    }
    $('#view-title').textContent = title;
    $('#view-subtitle').textContent = sub;
  }

  function priorityBadge(p) {
    const pr = PRIORITY[p];
    return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${pr.badge}"><span class="h-1.5 w-1.5 rounded-full ${pr.dot}"></span>${pr.label}</span>`;
  }

  function cardHtml(t) {
    const p = projectById(t.projectId);
    const pc = p ? colorByName(p.color) : null;
    const due = formatDue(t.due);
    const done = t.status === 'done';
    const tags = (t.tags || []).slice(0, 3).map(tg =>
      `<span class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">#${escapeHtml(tg)}</span>`).join('');
    const dueHtml = due ? `<span class="inline-flex items-center gap-1 text-[11px] font-medium ${due.overdue ? 'text-rose-600' : due.soon ? 'text-amber-600' : 'text-slate-400'}">
        <i data-lucide="calendar" class="h-3 w-3"></i>${due.label}</span>` : '';
    return `<article draggable="true" data-id="${t.id}" data-action="open-card"
      class="task-card group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition cursor-pointer">
      <div class="flex items-start gap-2.5">
        <button data-action="toggle-done" data-id="${t.id}" aria-label="Concluir tarefa"
          class="mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 grid place-items-center transition ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'}">
          <i data-lucide="check" class="h-3 w-3"></i>
        </button>
        <div class="min-w-0 flex-1">
          <h4 class="font-semibold text-sm leading-snug ${done ? 'line-through text-slate-400' : ''}">${escapeHtml(t.title)}</h4>
          ${t.desc ? `<p class="text-xs text-slate-400 mt-0.5 line-clamp-2">${escapeHtml(t.desc)}</p>` : ''}
        </div>
        <button data-action="card-menu" data-id="${t.id}" aria-label="Mais opções"
          class="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 -mt-1 -mr-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <i data-lucide="more-vertical" class="h-4 w-4"></i>
        </button>
      </div>
      ${tags ? `<div class="flex flex-wrap gap-1 mt-2.5">${tags}</div>` : ''}
      <div class="flex items-center gap-2 mt-3 flex-wrap">
        ${priorityBadge(t.priority)}
        ${dueHtml}
        ${p ? `<span class="ml-auto inline-flex items-center gap-1 text-[11px] font-medium ${pc.text}"><span class="h-1.5 w-1.5 rounded-full ${pc.dot}"></span>${escapeHtml(p.name)}</span>` : ''}
      </div>
    </article>`;
  }

  function renderBoard(list) {
    const board = $('#board-view');
    board.innerHTML = COLUMNS.map(col => {
      const items = list.filter(t => t.status === col.id);
      const cards = items.map(cardHtml).join('') ||
        `<p class="text-xs text-slate-400 text-center py-6 select-none">Solte tarefas aqui</p>`;
      return `<section class="flex flex-col">
        <div class="flex items-center gap-2 mb-3 px-1">
          <i data-lucide="${col.icon}" class="h-4 w-4 ${col.accent}"></i>
          <h3 class="font-bold text-sm">${col.label}</h3>
          <span class="text-xs font-semibold text-slate-400 bg-slate-200/70 dark:bg-slate-800 rounded-full px-2 py-0.5">${items.length}</span>
          <button data-action="new-task" data-status="${col.id}" class="ml-auto p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label="Nova tarefa em ${col.label}" title="Adicionar tarefa">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </button>
        </div>
        <div class="column-dropzone flex-1 space-y-2.5 rounded-xl p-1.5 min-h-[120px] transition" data-status="${col.id}">
          ${cards}
        </div>
      </section>`;
    }).join('');
  }

  function renderList(list) {
    const wrap = $('#list-view');
    wrap.innerHTML = list.map(t => {
      const p = projectById(t.projectId);
      const pc = p ? colorByName(p.color) : null;
      const due = formatDue(t.due);
      const done = t.status === 'done';
      const dueHtml = due ? `<span class="inline-flex items-center gap-1 text-[11px] font-medium ${due.overdue ? 'text-rose-600' : due.soon ? 'text-amber-600' : 'text-slate-400'}"><i data-lucide="calendar" class="h-3 w-3"></i>${due.label}</span>` : '';
      return `<article data-id="${t.id}" data-action="open-card"
        class="task-card group flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition cursor-pointer">
        <button data-action="toggle-done" data-id="${t.id}" aria-label="Concluir tarefa"
          class="shrink-0 h-5 w-5 rounded-full border-2 grid place-items-center transition ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'}">
          <i data-lucide="check" class="h-3 w-3"></i>
        </button>
        <div class="min-w-0 flex-1">
          <h4 class="font-semibold text-sm truncate ${done ? 'line-through text-slate-400' : ''}">${escapeHtml(t.title)}</h4>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            ${priorityBadge(t.priority)}
            ${dueHtml}
            ${p ? `<span class="inline-flex items-center gap-1 text-[11px] font-medium ${pc.text}"><span class="h-1.5 w-1.5 rounded-full ${pc.dot}"></span>${escapeHtml(p.name)}</span>` : ''}
          </div>
        </div>
        <button data-action="card-menu" data-id="${t.id}" aria-label="Mais opções"
          class="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <i data-lucide="more-vertical" class="h-4 w-4"></i>
        </button>
      </article>`;
    }).join('');
  }

  function syncLayoutButtons() {
    $$('.layout-btn').forEach(b => {
      const active = b.dataset.layout === state.layout;
      b.classList.toggle('bg-white', active);
      b.classList.toggle('dark:bg-slate-700', active);
      b.classList.toggle('shadow-sm', active);
      b.classList.toggle('text-brand-600', active);
      b.classList.toggle('text-slate-500', !active);
    });
  }
  function syncPriorityButtons() {
    $$('.prio-filter').forEach(b => {
      const active = b.dataset.priority === state.priorityFilter;
      b.classList.toggle('bg-white', active);
      b.classList.toggle('dark:bg-slate-700', active);
      b.classList.toggle('shadow-sm', active);
      b.classList.toggle('text-brand-600', active);
      b.classList.toggle('text-slate-500', !active);
    });
  }

  // ---------- Theme ----------
  function applyTheme() {
    const dark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    $$('[data-theme-icon]').forEach(i => i.setAttribute('data-lucide', dark ? 'sun' : 'moon'));
    $$('[data-theme-label]').forEach(l => l.textContent = dark ? 'Modo claro' : 'Modo escuro');
    refreshIcons();
  }
  function toggleTheme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); save(); }

  // ---------- Modals ----------
  function openTaskModal(task, presetStatus) {
    const isEdit = !!task;
    $('#modal-title').textContent = isEdit ? 'Editar tarefa' : 'Nova tarefa';
    $('#task-id').value = isEdit ? task.id : '';
    $('#f-title').value = isEdit ? task.title : '';
    $('#f-desc').value = isEdit ? (task.desc || '') : '';
    $('#f-status').value = isEdit ? task.status : (presetStatus || 'todo');
    $('#f-priority').value = isEdit ? task.priority : 'medium';
    $('#f-due').value = isEdit ? (task.due || '') : '';
    $('#f-tags').value = isEdit ? (task.tags || []).join(', ') : '';
    // project options
    $('#f-project').innerHTML = `<option value="">Sem projeto</option>` +
      state.projects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    $('#f-project').value = isEdit ? (task.projectId || '') : (state.view.startsWith('project:') ? state.view.slice(8) : '');
    $('#modal-delete-btn').hidden = !isEdit;
    showOverlay('#task-modal');
    setTimeout(() => $('#f-title').focus(), 50);
  }

  function saveTask() {
    const title = $('#f-title').value.trim();
    if (!title) { $('#f-title').focus(); toast('Informe um título para a tarefa', 'error'); return; }
    const id = $('#task-id').value;
    const tags = $('#f-tags').value.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      title,
      desc: $('#f-desc').value.trim(),
      status: $('#f-status').value,
      priority: $('#f-priority').value,
      projectId: $('#f-project').value || null,
      due: $('#f-due').value || null,
      tags,
    };
    if (id) {
      const t = state.tasks.find(x => x.id === id);
      if (t) Object.assign(t, payload);
      toast('Tarefa atualizada', 'success');
    } else {
      state.tasks.push(Object.assign({ id: uid(), order: state.tasks.length, createdAt: Date.now() }, payload));
      toast('Tarefa criada', 'success');
    }
    save();
    closeOverlay('#task-modal');
    render();
  }

  function openProjectModal() {
    $('#p-name').value = '';
    ctx.selectedColor = 'indigo';
    $('#p-colors').innerHTML = PROJECT_COLORS.map(c =>
      `<button type="button" data-action="pick-color" data-color="${c.name}" aria-label="Cor ${c.name}"
        class="color-swatch h-8 w-8 rounded-full ${c.dot} ring-offset-2 dark:ring-offset-slate-900 transition ${c.name === ctx.selectedColor ? 'ring-2 ring-slate-900 dark:ring-white' : ''}"></button>`).join('');
    showOverlay('#project-modal');
    setTimeout(() => $('#p-name').focus(), 50);
  }
  function saveProject() {
    const name = $('#p-name').value.trim();
    if (!name) { $('#p-name').focus(); toast('Informe o nome do projeto', 'error'); return; }
    state.projects.push({ id: uid(), name, color: ctx.selectedColor });
    save();
    closeOverlay('#project-modal');
    render();
    toast('Projeto criado', 'success');
  }

  // Overlay show/hide — uses the [hidden] attribute, which our CSS forces to
  // win over any class-based display via display:none !important.
  function showOverlay(sel) { const el = $(sel); if (el) el.hidden = false; }
  function closeOverlay(sel) { const el = $(sel); if (el) el.hidden = true; }
  function closeAllOverlays() {
    ['#task-modal', '#project-modal', '#confirm-modal'].forEach(closeOverlay);
    closeAllMenus();
  }

  // ---------- Confirm dialog ----------
  function confirmAction(title, text, okLabel, cb) {
    $('#confirm-title').textContent = title;
    $('#confirm-text').textContent = text;
    $('#confirm-ok').textContent = okLabel || 'Confirmar';
    ctx.confirmCb = cb;
    showOverlay('#confirm-modal');
  }

  // ---------- Menus / dropdowns ----------
  function closeAllMenus() {
    $$('.dropdown').forEach(m => { m.hidden = true; });
  }
  function toggleMenu(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const willOpen = el.hidden;
    closeAllMenus();
    el.hidden = !willOpen;
  }
  function openCardMenu(btn, taskId) {
    ctx.cardTaskId = taskId;
    closeAllMenus();
    const menu = $('#card-menu');
    menu.hidden = false;
    const r = btn.getBoundingClientRect();
    const mw = 176, mh = menu.offsetHeight || 180;
    let left = r.right - mw;
    let top = r.bottom + 6;
    if (left < 8) left = 8;
    if (top + mh > window.innerHeight - 8) top = r.top - mh - 6;
    menu.style.left = left + 'px';
    menu.style.top = Math.max(8, top) + 'px';
    refreshIcons();
  }

  // ---------- Toasts ----------
  function toast(msg, type) {
    const icons = { success: 'check-circle-2', error: 'alert-circle', info: 'info' };
    const colors = {
      success: 'text-emerald-500', error: 'text-rose-500', info: 'text-brand-500',
    };
    const el = document.createElement('div');
    el.className = 'pointer-events-auto flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl pl-3 pr-2 py-2.5 animate-slide-in max-w-xs';
    el.innerHTML = `<i data-lucide="${icons[type] || icons.info}" class="h-4 w-4 ${colors[type] || colors.info}"></i>
      <span class="text-sm font-medium flex-1">${escapeHtml(msg)}</span>
      <button class="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label="Fechar"><i data-lucide="x" class="h-3.5 w-3.5"></i></button>`;
    el.querySelector('button').addEventListener('click', () => removeToast(el));
    $('#toast-container').appendChild(el);
    refreshIcons();
    setTimeout(() => removeToast(el), 3200);
  }
  function removeToast(el) {
    if (!el || !el.parentNode) return;
    el.style.transition = 'opacity .2s, transform .2s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(24px)';
    setTimeout(() => el.remove(), 200);
  }

  // ---------- Task operations ----------
  function getTask(id) { return state.tasks.find(t => t.id === id); }
  function toggleDone(id) {
    const t = getTask(id); if (!t) return;
    t.status = t.status === 'done' ? 'todo' : 'done';
    save(); render();
    toast(t.status === 'done' ? 'Tarefa concluída' : 'Tarefa reaberta', 'success');
  }
  function duplicateTask(id) {
    const t = getTask(id); if (!t) return;
    const copy = Object.assign({}, t, { id: uid(), title: t.title + ' (cópia)', order: state.tasks.length, createdAt: Date.now() });
    state.tasks.push(copy);
    save(); render();
    toast('Tarefa duplicada', 'success');
  }
  function deleteTask(id) {
    const t = getTask(id); if (!t) return;
    confirmAction('Excluir tarefa?', `"${t.title}" será removida permanentemente.`, 'Excluir', () => {
      state.tasks = state.tasks.filter(x => x.id !== id);
      save(); render();
      toast('Tarefa excluída', 'info');
    });
  }
  function deleteProject(id) {
    const p = projectById(id); if (!p) return;
    confirmAction('Excluir projeto?', `"${p.name}" será removido. As tarefas ficarão sem projeto.`, 'Excluir', () => {
      state.projects = state.projects.filter(x => x.id !== id);
      state.tasks.forEach(t => { if (t.projectId === id) t.projectId = null; });
      if (state.view === 'project:' + id) state.view = 'all';
      save(); render();
      toast('Projeto excluído', 'info');
    });
  }

  // ---------- Drag & drop ----------
  let dragId = null;
  function setupDnD() {
    document.addEventListener('dragstart', e => {
      const card = e.target.closest('.task-card');
      if (!card) return;
      dragId = card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragId); } catch (_) {}
    });
    document.addEventListener('dragend', e => {
      const card = e.target.closest('.task-card');
      if (card) card.classList.remove('dragging');
      $$('.column-dropzone').forEach(z => z.classList.remove('drag-over'));
      dragId = null;
    });
    document.addEventListener('dragover', e => {
      const zone = e.target.closest('.column-dropzone');
      if (!zone) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    document.addEventListener('dragenter', e => {
      const zone = e.target.closest('.column-dropzone');
      if (zone) zone.classList.add('drag-over');
    });
    document.addEventListener('dragleave', e => {
      const zone = e.target.closest('.column-dropzone');
      if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });
    document.addEventListener('drop', e => {
      const zone = e.target.closest('.column-dropzone');
      if (!zone || !dragId) return;
      e.preventDefault();
      const t = getTask(dragId);
      if (t && t.status !== zone.dataset.status) {
        t.status = zone.dataset.status;
        save();
        toast('Tarefa movida para "' + (COLUMNS.find(c => c.id === t.status) || {}).label + '"', 'success');
      }
      $$('.column-dropzone').forEach(z => z.classList.remove('drag-over'));
      render();
    });
  }

  // ---------- Sidebar (mobile) ----------
  function openSidebar() {
    $('#sidebar').classList.remove('-translate-x-full');
    $('#sidebar-backdrop').hidden = false;
  }
  function closeSidebar() {
    $('#sidebar').classList.add('-translate-x-full');
    $('#sidebar-backdrop').hidden = true;
  }

  // ---------- Search ----------
  function setSearch(v) {
    state.search = v;
    $('[data-action="clear-search"]').hidden = !v;
    render();
  }

  // ---------- Event delegation ----------
  function onClick(e) {
    const actEl = e.target.closest('[data-action]');
    // Close menus when clicking outside any dropdown / menu trigger
    if (!actEl || !['toggle-menu', 'card-menu'].includes(actEl.dataset.action)) {
      if (!e.target.closest('.dropdown')) closeAllMenus();
    }
    if (!actEl) return;
    const action = actEl.dataset.action;
    const id = actEl.dataset.id;

    switch (action) {
      case 'new-task': e.preventDefault(); openTaskModal(null, actEl.dataset.status); break;
      case 'open-card': {
        // ignore clicks on inner action buttons
        if (e.target.closest('[data-action="toggle-done"],[data-action="card-menu"]')) return;
        const t = getTask(actEl.dataset.id); if (t) openTaskModal(t); break;
      }
      case 'toggle-done': e.stopPropagation(); toggleDone(id); break;
      case 'card-menu': e.stopPropagation(); openCardMenu(actEl, id); break;
      case 'card-edit': { const t = getTask(ctx.cardTaskId); closeAllMenus(); if (t) openTaskModal(t); break; }
      case 'card-duplicate': closeAllMenus(); duplicateTask(ctx.cardTaskId); break;
      case 'card-toggle-done': closeAllMenus(); toggleDone(ctx.cardTaskId); break;
      case 'card-delete': closeAllMenus(); deleteTask(ctx.cardTaskId); break;
      case 'save-task': saveTask(); break;
      case 'delete-from-modal': { const tid = $('#task-id').value; closeOverlay('#task-modal'); deleteTask(tid); break; }
      case 'close-modal': closeAllOverlays(); break;
      case 'new-project': openProjectModal(); break;
      case 'save-project': saveProject(); break;
      case 'pick-color': {
        ctx.selectedColor = actEl.dataset.color;
        $$('.color-swatch').forEach(s => s.classList.toggle('ring-2', s.dataset.color === ctx.selectedColor));
        $$('.color-swatch').forEach(s => { s.classList.toggle('ring-slate-900', s.dataset.color === ctx.selectedColor); s.classList.toggle('dark:ring-white', s.dataset.color === ctx.selectedColor); });
        break;
      }
      case 'delete-project': e.preventDefault(); e.stopPropagation(); deleteProject(id); break;
      case 'set-view': {
        e.preventDefault();
        if (e.target.closest('[data-action="delete-project"]')) return;
        state.view = actEl.dataset.view; render(); closeSidebar(); break;
      }
      case 'set-layout': state.layout = actEl.dataset.layout; save(); render(); break;
      case 'set-priority-filter': state.priorityFilter = actEl.dataset.priority; render(); break;
      case 'set-sort': {
        state.sort = actEl.dataset.sort;
        const labels = { manual: 'Manual', due: 'Data', priority: 'Prioridade', alpha: 'A-Z' };
        $('#sort-label').textContent = labels[state.sort] || 'Ordenar';
        closeAllMenus(); render(); break;
      }
      case 'toggle-menu': e.stopPropagation(); toggleMenu(actEl.dataset.menu); break;
      case 'toggle-theme': toggleTheme(); break;
      case 'open-sidebar': openSidebar(); break;
      case 'close-sidebar': closeSidebar(); break;
      case 'focus-search': {
        // reveal mobile search via prompt-like inline behavior: focus desktop input if visible else use overlay
        const inp = $('#search-input');
        inp.closest('div').classList.remove('hidden');
        inp.focus();
        break;
      }
      case 'clear-search': { $('#search-input').value = ''; setSearch(''); break; }
      case 'close-confirm': closeOverlay('#confirm-modal'); ctx.confirmCb = null; break;
      case 'menu-profile': closeAllMenus(); toast('Perfil — recurso de demonstração', 'info'); break;
      case 'menu-settings': closeAllMenus(); toast('Configurações — recurso de demonstração', 'info'); break;
      case 'menu-logout': closeAllMenus(); toast('Sessão encerrada (demonstração)', 'info'); break;
    }
  }

  // ---------- Init ----------
  function init() {
    load();
    applyTheme();

    // events
    document.addEventListener('click', onClick);

    $('#confirm-ok').addEventListener('click', () => {
      const cb = ctx.confirmCb; ctx.confirmCb = null;
      closeOverlay('#confirm-modal');
      if (typeof cb === 'function') cb();
    });

    $('#search-input').addEventListener('input', e => setSearch(e.target.value));

    $('#task-form').addEventListener('submit', e => { e.preventDefault(); saveTask(); });
    $('#project-form').addEventListener('submit', e => { e.preventDefault(); saveProject(); });

    // Escape closes top-most overlay/menu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!$('#confirm-modal').hidden) { closeOverlay('#confirm-modal'); ctx.confirmCb = null; return; }
        if (!$('#task-modal').hidden || !$('#project-modal').hidden) { closeAllOverlays(); return; }
        closeAllMenus();
        closeSidebar();
      }
      // Quick add with "n"
      if ((e.key === 'n' || e.key === 'N') && !/input|textarea|select/i.test(document.activeElement.tagName) && $('#task-modal').hidden && $('#project-modal').hidden) {
        e.preventDefault(); openTaskModal();
      }
    });

    // Reposition card menu on scroll/resize -> just close it to avoid drift
    window.addEventListener('scroll', () => { if (!$('#card-menu').hidden) closeAllMenus(); }, true);
    window.addEventListener('resize', closeAllMenus);

    setupDnD();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
