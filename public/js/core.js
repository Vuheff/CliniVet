// =====================================================
// core.js — O "CÉREBRO" DO APP
// 1) store: guarda o estado (dados) e avisa as telas quando muda
// 2) rotas: lê o endereço (#/painel, #/tutor...) e diz qual tela mostrar
// 3) ícones e pequenos componentes reutilizáveis
// =====================================================
import { html, useState, useEffect } from '../vendor/preact-htm.js';
import { estadoInicial, PACIENTES } from './data.js';
import { CaraPet, Pata } from './pets.js';

const CHAVE = 'clinivet-demo-v2';

// ---------- 1) STORE ----------
function carregar() {
  try { const s = localStorage.getItem(CHAVE); return s ? JSON.parse(s) : null; } catch { return null; }
}
function salvar(s) {
  try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch { /* sem armazenamento: segue só em memória */ }
}

let estado = carregar() || estadoInicial();
const ouvintes = new Set();

export function getEstado() { return estado; }

// atualizar(s => ({...s, algo: novo}))  ← jeito padrão de mudar dados
export function atualizar(fn) {
  estado = fn(estado);
  salvar(estado);
  ouvintes.forEach(o => o());
}

export function reiniciar() {
  const sessao = estado.sessao;
  estado = { ...estadoInicial(), sessao };
  salvar(estado);
  ouvintes.forEach(o => o());
  toast('Demonstração reiniciada');
}

// Hook: qualquer tela que chama useEstado() redesenha quando o estado muda
export function useEstado() {
  const [, forcar] = useState(0);
  useEffect(() => {
    const o = () => forcar(x => x + 1);
    ouvintes.add(o);
    return () => ouvintes.delete(o);
  }, []);
  return estado;
}

// ---------- 2) ROTAS ----------
export function useRota() {
  const ler = () => (location.hash.replace(/^#\/?/, '') || 'painel').split('/');
  const [rota, setRota] = useState(ler());
  useEffect(() => {
    const f = () => { setRota(ler()); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return rota; // ex.: ['pacientes', 'thor']
}
export const ir = (caminho) => { location.hash = '/' + caminho; };

// ---------- 3) TOASTS (avisos que somem sozinhos) ----------
const toastOuvintes = new Set();
export function toast(texto, tipo = 'ok') {
  const t = { id: Math.random(), texto, tipo };
  toastOuvintes.forEach(o => o(t));
}
export function Toasts() {
  const [lista, setLista] = useState([]);
  useEffect(() => {
    const o = (t) => {
      setLista(l => [...l, t]);
      setTimeout(() => setLista(l => l.filter(x => x.id !== t.id)), 3200);
    };
    toastOuvintes.add(o);
    return () => toastOuvintes.delete(o);
  }, []);
  return html`<div class="toasts" role="status" aria-live="polite">
    ${lista.map(t => html`<div class="toast toast-${t.tipo}" key=${t.id}>
      ${t.tipo === 'alerta' ? html`<${Icone} n="alerta" />` : html`<${Pata} tam=${18} classe="toast-pata" />`} ${t.texto}</div>`)}
  </div>`;
}

// ---------- utilidades ----------
export const pet = (id) => PACIENTES.find(p => p.id === id);
export const agora = () => new Date().toTimeString().slice(0, 5);
export const iniciais = (nome) => nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
export const pct = (plano) => Math.round((plano.dia / plano.dias) * 100);

export function dataHoje() {
  const d = new Date();
  const txt = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
export function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

// Número que "conta" até o valor (efeito animado)
export function Contador({ valor }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, inicio;
    const de = 0, dur = 700;
    const passo = (t) => {
      inicio ??= t;
      const p = Math.min((t - inicio) / dur, 1);
      setV(Math.round(de + (valor - de) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return html`${v}`;
}

// Avatar do pet: o rostinho desenhado (pisca, e põe a língua no hover)
export function Avatar({ p, tam = 40, humor }) {
  return html`<span class="avatar" style=${`--c:${p.cor};width:${tam}px;height:${tam}px`} title=${p.nome}>
    <${CaraPet} id=${p.id} tam=${tam * 0.92} humor=${humor} />
  </span>`;
}

const STATUS = {
  andamento: ['Em andamento', 'verde'],
  atencao:   ['Requer atenção', 'vermelho'],
  concluido: ['Concluído', 'cinza'],
  revisao:   ['Em revisão', 'amarelo'],
};
export function Status({ s }) {
  const [txt, cor] = STATUS[s] || STATUS.andamento;
  return html`<span class=${'pill pill-' + cor}><i></i>${txt}</span>`;
}

export function Barra({ valor, cor }) {
  return html`<div class="barra"><div style=${`width:${valor}%;${cor ? 'background:' + cor : ''}`}></div></div>`;
}

// Modal genérico
export function Modal({ aberto, fechar, titulo, sub, children, largura = 520, rodape }) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto]);
  if (!aberto) return null;
  return html`<div class="modal-fundo" onClick=${(e) => e.target === e.currentTarget && fechar()}>
    <div class="modal" style=${`max-width:${largura}px`} role="dialog" aria-modal="true">
      <header class="modal-topo">
        <div>${sub && html`<p class="kicker">${sub}</p>`}<h3>${titulo}</h3></div>
        <button class="icon-btn" onClick=${fechar} aria-label="Fechar"><${Icone} n="x" /></button>
      </header>
      <div class="modal-corpo">${children}</div>
      ${rodape && html`<footer class="modal-rodape">${rodape}</footer>`}
    </div>
  </div>`;
}

// ---------- ÍCONES (SVG desenhados à mão, estilo traço) ----------
const I = {
  casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  pata: '<circle cx="5.5" cy="10" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 11c-3 0-6 4.5-6 7 0 1.7 1.3 3 3 3 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.7 0 3-1.3 3-3 0-2.5-3-7-6-7z"/>',
  gato: '<path d="M4 4l3 4M20 4l-3 4"/><path d="M4 4v8a8 8 0 0 0 16 0V4l-4 4H8z"/><circle cx="9.5" cy="12.5" r=".6"/><circle cx="14.5" cy="12.5" r=".6"/>',
  prancheta: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>',
  pulso: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sino: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alerta: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  pilula: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
  coracao: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  olho: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  nota: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  dir: '<path d="m9 18 6-6-6-6"/>',
  esq: '<path d="m15 18-6-6 6-6"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  celular: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  estetoscopio: '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  sair: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  brilho: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  historico: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  pontos: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  osso: '<path d="M8.5 7.5 16.5 15.5"/><circle cx="6" cy="7.5" r="2.2"/><circle cx="8.5" cy="5" r="2.2"/><circle cx="16" cy="18.5" r="2.2"/><circle cx="18.5" cy="16" r="2.2"/>',
  tigela: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 8c0-1.5 1-2 2-2M12 7c0-1.5 1-2 2-2"/>',
  lixo: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
};
export function Icone({ n, tam = 18 }) {
  return html`<svg class="ic" width=${tam} height=${tam} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    dangerouslySetInnerHTML=${{ __html: I[n] || '' }}></svg>`;
}
