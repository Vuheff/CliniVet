// =====================================================
// clinica.js — TELAS DA CLÍNICA (lado da veterinária)
// Layout (menu + topo) e as páginas: Visão geral, Pacientes,
// Planos, Acompanhamento e Configurações.
// =====================================================
import { html, useState, useMemo, useRef, useEffect } from '../vendor/preact-htm.js';
import { useEstado, ir, pet, Icone, Avatar, Status, Barra, Contador, Modal, dataHoje, saudacao, iniciais, pct, atualizar, toast } from './core.js';
import { CLINICA, PACIENTES, itensDoDia } from './data.js';
import { festa, centro } from './fx.js';
import { Trilha, PetFalante, GatoDormindo, Pegadas, Pata } from './pets.js';
import { enviarOrientacao, resolverAlerta, avancarDia, concluirPlano, irEtapa } from './acoes.js';

// ---------------- LAYOUT ----------------
const MENU = [
  { rota: 'painel', nome: 'Visão geral', icone: 'casa' },
  { rota: 'pacientes', nome: 'Pacientes', icone: 'pata' },
  { rota: 'planos', nome: 'Planos de cuidado', icone: 'prancheta' },
  { rota: 'acompanhamento', nome: 'Acompanhamento', icone: 'pulso' },
  { rota: 'config', nome: 'Configurações', icone: 'engrenagem' },
];

export function LayoutClinica({ rota, children }) {
  const s = useEstado();
  const [menuAberto, setMenuAberto] = useState(false);
  const alertas = s.atividades.filter(a => a.tipo === 'alerta' && !a.resolvido).length;
  useEffect(() => setMenuAberto(false), [rota[0]]);

  return html`<div class="app-clinica">
    <aside class=${'sidebar' + (menuAberto ? ' aberta' : '')}>
      <a class="logo" href="#/painel" aria-label="CliniVet — início"><img src="assets/clinivet-logo.png" alt="CliniVet" /></a>
      <p class="side-titulo">Espaço da clínica</p>
      <nav>
        ${MENU.map(m => html`<a href=${'#/' + m.rota} class=${'nav-item' + (rota[0] === m.rota ? ' ativo' : '')}>
          <${Icone} n=${m.icone} tam=${20} /> <span>${m.nome}</span>
          ${m.rota === 'acompanhamento' && alertas > 0 && html`<b class="badge">${alertas}</b>`}
        </a>`)}
      </nav>
      <${Pegadas} qtd=${7} classe="side-pegadas" />
      <div class="side-ajuda">
        <${PetFalante} id="luna" tam=${64} classe="side-gato" lado="dir" />
        <span class="side-ajuda-ic"><${Icone} n="msg" /></span>
        <div><strong>Precisa de ajuda?</strong><p>Refaça o tour guiado da demonstração.</p></div>
        <button class="link-claro" onClick=${() => irEtapa(1) || ir('painel')}>Abrir tour <${Icone} n="seta" tam=${14} /></button>
      </div>
      <a class="side-perfil" href="#/config">
        <span class="mini-avatar">${iniciais(CLINICA.vet.replace('Dra. ', ''))}</span>
        <div><strong>${CLINICA.vet}</strong><small>${CLINICA.cargo}</small></div>
        <${Icone} n="dir" tam=${16} />
      </a>
    </aside>
    ${menuAberto && html`<div class="sidebar-fundo" onClick=${() => setMenuAberto(false)}></div>`}

    <div class="principal">
      <header class="topo">
        <button class="icon-btn so-mobile" onClick=${() => setMenuAberto(true)} aria-label="Abrir menu"><${Icone} n="menu" /></button>
        <div class="topo-clinica"><strong>${CLINICA.nome}</strong><small>${CLINICA.unidade}</small></div>
        <${BuscaGlobal} />
        <${Notificacoes} />
        <span class="mini-avatar claro">MC</span>
      </header>
      <main class="conteudo" key=${rota.join('/')}>${children}</main>
    </div>
  </div>`;
}

// Busca no topo: pacientes e planos
function BuscaGlobal() {
  const s = useEstado();
  const [q, setQ] = useState('');
  const [foco, setFoco] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const atalho = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); ref.current?.focus(); } };
    window.addEventListener('keydown', atalho);
    return () => window.removeEventListener('keydown', atalho);
  }, []);
  const termo = q.trim().toLowerCase();
  const res = !termo ? [] : [
    ...PACIENTES.filter(p => (p.nome + p.tutor + p.raca).toLowerCase().includes(termo)).map(p => ({ tipo: 'Paciente', p, titulo: p.nome, sub: `${p.raca} • ${p.tutor}`, rota: 'pacientes/' + p.id })),
    ...s.planos.filter(pl => (pl.nome + pet(pl.pet).nome).toLowerCase().includes(termo)).map(pl => ({ tipo: 'Plano', p: pet(pl.pet), titulo: pl.nome, sub: `${pet(pl.pet).nome} • dia ${pl.dia} de ${pl.dias}`, rota: 'planos/' + pl.id })),
  ].slice(0, 6);
  return html`<div class="busca">
    <${Icone} n="busca" />
    <input ref=${ref} value=${q} onInput=${e => setQ(e.target.value)} onFocus=${() => setFoco(true)} onBlur=${() => setTimeout(() => setFoco(false), 150)}
      placeholder="Buscar paciente ou plano..." aria-label="Buscar paciente ou plano" />
    <kbd>Ctrl K</kbd>
    ${foco && termo && html`<div class="busca-res">
      ${res.length ? res.map(r => html`<button onMouseDown=${() => { ir(r.rota); setQ(''); }}>
        <${Avatar} p=${r.p} tam=${32} /><span><strong>${r.titulo}</strong><small>${r.sub}</small></span><em>${r.tipo}</em>
      </button>`) : html`<p class="vazio-mini">Nada encontrado para “${q}”.</p>`}
    </div>`}
  </div>`;
}

function Notificacoes() {
  const s = useEstado();
  const [aberto, setAberto] = useState(false);
  const novas = s.atividades.filter(a => a.tipo === 'alerta' && !a.resolvido);
  return html`<div class="notif">
    <button class="icon-btn borda" onClick=${() => setAberto(!aberto)} aria-label="Notificações">
      <${Icone} n="sino" />${novas.length > 0 && html`<i class="ponto"></i>`}
    </button>
    ${aberto && html`<div class="notif-pop" onMouseLeave=${() => setAberto(false)}>
      <p class="kicker">Notificações</p>
      ${s.atividades.slice(0, 5).map(a => html`<button class="notif-item" onClick=${() => { setAberto(false); ir(a.tipo === 'alerta' ? 'acompanhamento' : 'pacientes/' + a.pet); }}>
        <${IconeAtividade} tipo=${a.tipo} />
        <span><strong>${a.titulo}</strong><small>${pet(a.pet).nome} • ${a.texto}</small></span>
      </button>`)}
      <a href="#/acompanhamento" class="link" onClick=${() => setAberto(false)}>Ver tudo</a>
    </div>`}
  </div>`;
}

const TIPOS = {
  confirmado: ['check', 'verde'], registrado: ['nota', 'azul'], visualizado: ['olho', 'cinza'],
  alerta: ['alerta', 'vermelho'], orientacao: ['msg', 'navy'], criado: ['prancheta', 'verde'], concluido: ['coracao', 'verde'],
};
export function IconeAtividade({ tipo }) {
  const [ic, cor] = TIPOS[tipo] || TIPOS.registrado;
  return html`<span class=${'ativ-ic ' + cor}><${Icone} n=${ic} tam=${16} /></span>`;
}

// ---------------- 1. VISÃO GERAL ----------------
export function Painel() {
  const s = useEstado();
  const ativos = s.planos.filter(p => p.status !== 'concluido');
  const atencao = s.planos.filter(p => p.status === 'atencao');
  const alertas = s.atividades.filter(a => a.tipo === 'alerta' && !a.resolvido);
  const kpis = [
    { rotulo: 'Tratamentos ativos', valor: ativos.length + 14, sub: '+3 nesta semana', ic: 'pulso', cor: 'verde', rota: 'planos' },
    { rotulo: 'Altas felizes no mês', valor: s.base.concluidosMes + 1, sub: '92% no prazo', ic: 'osso', cor: 'verde', rota: 'planos' },
    { rotulo: 'Requerem atenção', valor: atencao.length + alertas.filter(a => !atencao.some(p => p.pet === a.pet)).length, sub: `${alertas.length} relato(s) aberto(s)`, ic: 'alerta', cor: 'vermelho', rota: 'acompanhamento' },
    { rotulo: 'Atividades registradas', valor: s.base.atividades24h + s.atividades.length, sub: 'Nas últimas 24h', ic: 'prancheta', cor: 'verde', rota: 'acompanhamento' },
  ];
  return html`
    <section class="hero-painel">
      <div class="hero-txt">
        <p class="kicker">${dataHoje()}</p>
        <h1>${saudacao()}, ${CLINICA.vetCurto}!</h1>
        <p class="muted">${ativos.length} peludos estão se cuidando em casa hoje. Vamos ver como eles estão?</p>
        <button class="btn btn-primario" data-tour="criar" onClick=${() => ir('planos/novo')}><${Icone} n="mais" /> Criar plano de cuidado</button>
      </div>
      <div class="hero-pets">
        <${PetFalante} id="luna" tam=${96} classe="hp-2" lado="dir" />
        <${PetFalante} id="thor" tam=${132} classe="hp-1" />
        <${PetFalante} id="bento" tam=${100} classe="hp-3" lado="dir" />
      </div>
      <${Pegadas} qtd=${9} classe="hero-pegadas" />
    </section>

    ${alertas.length > 0 && html`<button class="faixa-alerta" onClick=${() => ir('acompanhamento')}>
      <span class="ativ-ic vermelho"><${Icone} n="alerta" /></span>
      <span><strong>${alertas.length} relato(s) de tutores aguardando resposta</strong><small>${alertas.map(a => pet(a.pet).nome).join(', ')} • toque para responder</small></span>
      <${Icone} n="seta" />
    </button>`}

    <section class="kpis">
      ${kpis.map((k, i) => html`<button class="card kpi" style=${`--d:${i * 60}ms`} onClick=${() => ir(k.rota)}>
        <${Pata} tam=${86} classe="kpi-marca" />
        <span class=${'kpi-ic ' + k.cor}><${Icone} n=${k.ic} tam=${20} /></span>
        <span class="kpi-txt"><small>${k.rotulo}</small><strong><${Contador} valor=${k.valor} /></strong><em>${k.sub}</em></span>
      </button>`)}
    </section>

    <section class="grade-2">
      <div class="card">
        <header class="card-topo">
          <div><h2>Tratamentos em acompanhamento</h2><p class="muted">Planos com atividade recente</p></div>
          <a href="#/planos" class="link">Ver todos <${Icone} n="seta" tam=${16} /></a>
        </header>
        <div class="lista">
          ${ativos.length === 0 && html`<p class="vazio-mini">Nenhum plano ativo.</p>`}
          ${ativos.map(pl => html`<${LinhaPlano} pl=${pl} />`)}
        </div>
      </div>
      <div class="card">
        <header class="card-topo">
          <div><h2>Atividade recente</h2><p class="muted">Atualizações dos tutores</p></div>
          <a href="#/acompanhamento" class="icon-btn" aria-label="Ver tudo"><${Icone} n="pontos" /></a>
        </header>
        <${Linha_do_tempo} itens=${s.atividades.slice(0, 6)} />
      </div>
    </section>`;
}

function LinhaPlano({ pl }) {
  const p = pet(pl.pet);
  return html`<button class="linha" onClick=${() => ir('planos/' + pl.id)}>
    <${Avatar} p=${p} tam=${44} />
    <span class="linha-nome"><strong>${p.nome}</strong><small>${p.tutor}</small></span>
    <span class="linha-plano"><small class="kicker">Plano</small>${pl.nome}</span>
    <span class="linha-prog"><small>Dia ${pl.dia} de ${pl.dias}</small><${Trilha} valor=${pct(pl)} id=${pl.pet} /></span>
    <${Status} s=${pl.status} />
    <${Icone} n="dir" />
  </button>`;
}

export function Linha_do_tempo({ itens }) {
  if (!itens.length) return html`<${GatoDormindo} />`;
  return html`<ol class="timeline">
    ${itens.map(a => html`<li key=${a.id} class=${a.tipo === 'alerta' && !a.resolvido ? 'destaque' : ''}>
      <${IconeAtividade} tipo=${a.tipo} />
      <div><strong>${a.titulo}</strong><p>${pet(a.pet).nome} • ${a.texto}</p><small>${a.quando}</small></div>
    </li>`)}
  </ol>`;
}

// ---------------- 2. PACIENTES ----------------
export function Pacientes() {
  const s = useEstado();
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const lista = PACIENTES.filter(p => (p.nome + p.tutor + p.raca).toLowerCase().includes(q.toLowerCase()))
    .filter(p => filtro === 'todos' || (filtro === 'caes' ? p.especie === 'Canino' : p.especie === 'Felino'));
  return html`
    <section class="cabecalho">
      <div><p class="kicker">Pacientes</p><h1>Seus pacientes</h1><p class="muted">${PACIENTES.length} pacientes cadastrados nesta unidade.</p></div>
    </section>
    <div class="barra-filtros">
      <label class="campo-busca"><${Icone} n="busca" /><input placeholder="Filtrar por nome, tutor ou raça" value=${q} onInput=${e => setQ(e.target.value)} /></label>
      <div class="chips">
        ${[['todos', 'Todos'], ['caes', 'Cães'], ['gatos', 'Gatos']].map(([v, t]) => html`<button class=${'chip' + (filtro === v ? ' ativo' : '')} onClick=${() => setFiltro(v)}>${t}</button>`)}
      </div>
    </div>
    <section class="grade-cards">
      ${lista.map((p, i) => {
        const pl = s.planos.find(x => x.pet === p.id && x.status !== 'concluido');
        return html`<button class="card paciente" style=${`--d:${i * 40}ms`} onClick=${() => ir('pacientes/' + p.id)}>
          <div class="paciente-topo"><${Avatar} p=${p} tam=${52} /> ${pl ? html`<${Status} s=${pl.status} />` : html`<span class="pill pill-amarelo"><i></i>Sem plano ativo</span>`}</div>
          <strong>${p.nome}</strong>
          <small>${p.especie} • ${p.raca} • ${p.idade}</small>
          <p class="muted">Tutor(a): ${p.tutor}</p>
          ${pl && html`<div class="paciente-plano"><small>${pl.nome} • dia ${pl.dia}/${pl.dias}</small><${Trilha} valor=${pct(pl)} id=${p.id} /></div>`}
        </button>`;
      })}
      ${lista.length === 0 && html`<${GatoDormindo} texto="Nenhum peludo encontrado com esse nome." />`}
    </section>`;
}

export function PacienteDetalhe({ id }) {
  const s = useEstado();
  const p = pet(id);
  if (!p) return html`<p>Paciente não encontrado. <a href="#/pacientes" class="link">Voltar</a></p>`;
  const planos = s.planos.filter(x => x.pet === id);
  const ativo = planos.find(x => x.status !== 'concluido');
  const ativ = s.atividades.filter(a => a.pet === id);
  return html`
    <a href="#/pacientes" class="voltar"><${Icone} n="esq" tam=${16} /> Pacientes</a>
    <section class="cabecalho">
      <div><p class="kicker">Pacientes</p><h1>${p.nome}</h1><p class="muted">Perfil do paciente e planos de cuidado.</p></div>
      <button class="btn btn-primario" onClick=${() => ir('planos/novo/' + id)}><${Icone} n="mais" /> Criar plano de cuidado</button>
    </section>
    <section class="card perfil">
      <${PetFalante} id=${p.id} tam=${110} classe="perfil-pet" />
      <div class="perfil-info">
        <span class="pill pill-verde"><i></i>Paciente ativo</span>
        <h2>${p.nome}</h2>
        <p class="muted">${p.especie} • ${p.raca} • ${p.idade}</p>
      </div>
      <dl class="perfil-dados">
        <div><dt>${p.genero === 'a' ? 'Tutora' : 'Tutor'}</dt><dd>${p.tutor}</dd></div>
        <div><dt>Última consulta</dt><dd>${p.ultimaConsulta}</dd></div>
        <div><dt>Responsável</dt><dd>${CLINICA.vet}</dd></div>
      </dl>
    </section>
    ${!ativo && html`<section class="card destaque-verde" data-tour="revisar">
      <span class="kpi-ic verde"><${Icone} n="brilho" tam=${22} /></span>
      <div><h2>Plano pronto para revisão</h2><p class="muted">As orientações de alta podem ser organizadas em um plano digital acompanhável.</p></div>
      <button class="btn btn-primario" onClick=${() => ir('planos/novo/' + id)}>Revisar e criar plano <${Icone} n="seta" /></button>
    </section>`}
    <section class="grade-2">
      <div class="card">
        <header class="card-topo"><h2>Planos de cuidado</h2></header>
        <div class="lista">
          ${planos.length === 0 && html`<p class="vazio-mini">Ainda não há planos para ${p.nome}.</p>`}
          ${planos.map(pl => html`<button class="linha simples" onClick=${() => ir('planos/' + pl.id)}>
            <span class="kpi-ic verde"><${Icone} n="prancheta" /></span>
            <span class="linha-nome"><strong>${pl.nome}</strong><small>Dia ${pl.dia} de ${pl.dias}</small></span>
            <${Status} s=${pl.status} /><${Icone} n="dir" />
          </button>`)}
        </div>
      </div>
      <div class="card">
        <header class="card-topo"><h2>Histórico</h2></header>
        <${Linha_do_tempo} itens=${ativ} />
      </div>
    </section>`;
}

// ---------------- 3. PLANOS ----------------
export function Planos() {
  const s = useEstado();
  const [aba, setAba] = useState('todos');
  const abas = [['todos', 'Todos'], ['andamento', 'Em andamento'], ['atencao', 'Requer atenção'], ['concluido', 'Concluídos']];
  const lista = s.planos.filter(p => aba === 'todos' || p.status === aba);
  return html`
    <section class="cabecalho">
      <div><p class="kicker">Planos de cuidado</p><h1>Planos de cuidado</h1><p class="muted">Rotinas digitais que o tutor acompanha em casa.</p></div>
      <button class="btn btn-primario" onClick=${() => ir('planos/novo')}><${Icone} n="mais" /> Criar plano de cuidado</button>
    </section>
    <div class="chips abas">
      ${abas.map(([v, t]) => html`<button class=${'chip' + (aba === v ? ' ativo' : '')} onClick=${() => setAba(v)}>
        ${t} <b>${v === 'todos' ? s.planos.length : s.planos.filter(p => p.status === v).length}</b></button>`)}
    </div>
    <section class="grade-cards">
      ${lista.map((pl, i) => {
        const p = pet(pl.pet);
        const itens = itensDoDia(pl);
        const feitos = itens.filter(x => x.feito).length;
        return html`<button class="card plano-card" style=${`--d:${i * 40}ms`} onClick=${() => ir('planos/' + pl.id)}>
          <div class="paciente-topo"><${Avatar} p=${p} tam=${44} /><${Status} s=${pl.status} /></div>
          <small class="kicker">${p.nome} • ${p.tutor}</small>
          <strong>${pl.nome}</strong>
          <div class="plano-meta"><span><${Icone} n="calendario" tam=${14} /> Dia ${pl.dia} de ${pl.dias}</span><span><${Icone} n="check" tam=${14} /> ${feitos}/${itens.length} hoje</span></div>
          <${Trilha} valor=${pct(pl)} id=${pl.pet} />
        </button>`;
      })}
      ${lista.length === 0 && html`<${GatoDormindo} texto="Nenhum plano nesta categoria." />`}
    </section>`;
}

export function PlanoDetalhe({ id }) {
  const s = useEstado();
  const pl = s.planos.find(x => x.id === id);
  if (!pl) return html`<p>Plano não encontrado. <a href="#/planos" class="link">Voltar</a></p>`;
  const p = pet(pl.pet);
  const itens = itensDoDia(pl);
  return html`
    <a href="#/planos" class="voltar"><${Icone} n="esq" tam=${16} /> Planos</a>
    <section class="cabecalho">
      <div><p class="kicker">${p.nome} • ${p.tutor}</p><h1>${pl.nome}</h1><p class="muted">Dia ${pl.dia} de ${pl.dias} • retorno em ${pl.retorno}</p></div>
      <div class="acoes">
        ${pl.status !== 'concluido' && html`<button class="btn btn-sec" onClick=${() => avancarDia(pl.id)}><${Icone} n="calendario" /> Avançar dia (demo)</button>
        <button class="btn btn-primario" onClick=${(e) => { festa(...centro(e), 40); concluirPlano(pl.id); }}><${Icone} n="check" /> Concluir plano</button>`}
      </div>
    </section>
    <section class="grade-2">
      <div class="card">
        <header class="card-topo"><div><h2>Rotina de hoje</h2><p class="muted">O que o tutor já confirmou</p></div><${Status} s=${pl.status} /></header>
        <div class="progresso-grande"><${Anel} valor=${pct(pl)} /><div><strong>${pct(pl)}% do plano</strong><p class="muted">${itens.filter(i => i.feito).length} de ${itens.length} cuidados confirmados hoje</p></div></div>
        <ul class="checklist">
          ${itens.map(i => html`<li class=${i.feito ? 'ok' : ''}>
            <span class="check-bolinha">${i.feito && html`<${Icone} n="check" tam=${14} />`}</span>
            <span><strong>${i.tarefa.nome}</strong><small>${i.tarefa.detalhe}</small></span>
            <em>${i.hora}</em>
            <small class="muted">${i.feito ? 'Confirmado ' + i.feito : 'Pendente'}</small>
          </li>`)}
        </ul>
      </div>
      <div class="card">
        <header class="card-topo"><h2>Orientações e atividade</h2></header>
        <p class="orientacao">${pl.orientacao}</p>
        <${Linha_do_tempo} itens=${s.atividades.filter(a => a.pet === pl.pet).slice(0, 6)} />
      </div>
    </section>`;
}

export function Anel({ valor, tam = 72 }) {
  const r = 30, c = 2 * Math.PI * r;
  return html`<svg class="anel" width=${tam} height=${tam} viewBox="0 0 72 72">
    <circle cx="36" cy="36" r=${r} class="anel-fundo" />
    <circle cx="36" cy="36" r=${r} class="anel-valor" stroke-dasharray=${c} stroke-dashoffset=${c - (c * valor) / 100} />
    <text x="36" y="41" text-anchor="middle">${valor}%</text>
  </svg>`;
}

// ---------------- 4. ACOMPANHAMENTO ----------------
export function Acompanhamento() {
  const s = useEstado();
  const [filtro, setFiltro] = useState('todos');
  const [responder, setResponder] = useState(null);
  const [texto, setTexto] = useState('');
  const abertos = s.atividades.filter(a => a.tipo === 'alerta' && !a.resolvido);
  const filtros = [['todos', 'Tudo'], ['alerta', 'Relatos'], ['confirmado', 'Confirmações'], ['orientacao', 'Orientações'], ['visualizado', 'Visualizações']];
  const lista = s.atividades.filter(a => filtro === 'todos' || a.tipo === filtro);
  const sugestoes = ['Tente oferecer o medicamento envolto em um petisco úmido.', 'Pode trazer o paciente amanhã às 10h para avaliarmos.', 'Mantenha a rotina e nos avise se persistir.'];

  return html`
    <section class="cabecalho">
      <div><p class="kicker">Acompanhamento</p><h1>Acompanhamento</h1><p class="muted">Tudo o que os tutores registram, em tempo real.</p></div>
    </section>

    <section class="card" data-tour="relatos">
      <header class="card-topo"><div><h2>Relatos aguardando resposta</h2><p class="muted">Situações que os tutores encaminharam à equipe</p></div>
        <span class=${'pill ' + (abertos.length ? 'pill-vermelho' : 'pill-verde')}><i></i>${abertos.length} aberto(s)</span></header>
      ${abertos.length === 0 && html`<${GatoDormindo} texto="Tudo em dia! Nenhum relato pendente — até a Luna foi tirar um cochilo." />`}
      <div class="relatos">
        ${abertos.map(a => {
          const p = pet(a.pet);
          return html`<article class="relato" key=${a.id}>
            <${Avatar} p=${p} tam=${48} />
            <div class="relato-txt"><strong>${p.nome} • ${p.tutor}</strong><p>${a.texto}</p><small>${a.quando}</small></div>
            <div class="acoes">
              <button class="btn btn-sec" onClick=${(e) => { festa(...centro(e), 14); resolverAlerta(a.id, a.pet); }}>Marcar resolvido</button>
              <button class="btn btn-primario" onClick=${() => { setResponder(a); setTexto(''); }}><${Icone} n="enviar" /> Enviar orientação</button>
            </div>
          </article>`;
        })}
      </div>
    </section>

    <section class="card">
      <header class="card-topo"><h2>Linha do tempo</h2>
        <div class="chips">${filtros.map(([v, t]) => html`<button class=${'chip' + (filtro === v ? ' ativo' : '')} onClick=${() => setFiltro(v)}>${t}</button>`)}</div>
      </header>
      <${Linha_do_tempo} itens=${lista} />
    </section>

    <${Modal} aberto=${!!responder} fechar=${() => setResponder(null)} sub="Responder relato" titulo=${responder ? `Orientação para ${pet(responder.pet).tutor}` : ''}
      rodape=${html`<button class="btn btn-sec" onClick=${() => setResponder(null)}>Cancelar</button>
        <button class="btn btn-primario" disabled=${!texto.trim()} onClick=${(e) => { festa(...centro(e), 18); enviarOrientacao(responder.id, responder.pet, texto.trim()); setResponder(null); }}><${Icone} n="enviar" /> Enviar ao tutor</button>`}>
      ${responder && html`<p class="citacao">${responder.texto}</p>
        <label class="rotulo">Sua orientação</label>
        <textarea rows="4" value=${texto} onInput=${e => setTexto(e.target.value)} placeholder="Escreva a orientação que o tutor verá no app..."></textarea>
        <p class="rotulo">Sugestões rápidas</p>
        <div class="chips">${sugestoes.map(t => html`<button class="chip" onClick=${() => setTexto(t)}>${t}</button>`)}</div>`}
    <//>`;
}

// ---------------- 5. CONFIGURAÇÕES ----------------
export function Config() {
  const s = useEstado();
  const alternar = (k) => { atualizar(st => ({ ...st, config: { ...st.config, [k]: !st.config[k] } })); toast('Preferência salva'); };
  const itens = [
    ['notificar', 'Notificar relatos dos tutores', 'Receba um alerta quando um tutor pedir ajuda.'],
    ['resumoDiario', 'Resumo diário por e-mail', 'Um resumo dos tratamentos às 18h.'],
    ['iaAssistente', 'Assistente supervisionado para tutores', 'Respostas baseadas apenas no plano aprovado.'],
  ];
  return html`
    <section class="cabecalho"><div><p class="kicker">Configurações</p><h1>Configurações</h1><p class="muted">Preferências da clínica e da conta.</p></div></section>
    <section class="grade-2">
      <div class="card">
        <header class="card-topo"><h2>Clínica</h2></header>
        <dl class="perfil-dados col">
          <div><dt>Nome</dt><dd>${CLINICA.nome}</dd></div>
          <div><dt>Unidade</dt><dd>${CLINICA.unidade}</dd></div>
          <div><dt>Profissional</dt><dd>${CLINICA.vet} • ${CLINICA.cargo}</dd></div>
        </dl>
        <button class="btn btn-sec" style="margin-top:18px" onClick=${() => { atualizar(st => ({ ...st, sessao: null })); ir('entrar'); }}><${Icone} n="sair" /> Sair da conta</button>
      </div>
      <div class="card">
        <header class="card-topo"><h2>Preferências</h2></header>
        ${itens.map(([k, t, d]) => html`<label class="toggle-linha">
          <span><strong>${t}</strong><small>${d}</small></span>
          <input type="checkbox" class="toggle" checked=${s.config[k]} onChange=${() => alternar(k)} />
        </label>`)}
      </div>
    </section>`;
}
