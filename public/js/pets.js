// =====================================================
// pets.js — OS BICHINHOS DESENHADOS (SVG feito à mão)
// CaraPet  → rostinho do pet (pisca, mexe a orelha, põe a língua)
// PetEspiando → pet "espiando" por cima de um card, abanando o rabo
// GatoDormindo → para telas vazias
// Pegadas → trilha de patinhas andando
// Trilha → barra de progresso com o pet andando até o ossinho
// =====================================================
import { html, useState, useRef } from '../vendor/preact-htm.js';
import { festa } from './fx.js';

// Aparência de cada pet (cores de pelo e tipo de orelha)
export const VISUAL = {
  thor:   { orelha: 'caida',   pelo: '#E8A94F', escuro: '#C47F2C', focinho: '#F7DDB0' },
  luna:   { orelha: 'gato',    pelo: '#A3ABBD', escuro: '#6E778A', focinho: '#EEF0F4', listras: true },
  bento:  { orelha: 'morcego', pelo: '#D9B48A', escuro: '#7A5B3E', focinho: '#EED8BC', mascara: true },
  mel:    { orelha: 'fofa',    pelo: '#F3E1CB', escuro: '#C89D72', focinho: '#FFF8F0' },
  nina:   { orelha: 'gato',    pelo: '#F4EFE8', escuro: '#D8CBBB', focinho: '#FFFFFF', fofa: true, olhoAzul: true },
  pipoca: { orelha: 'cacho',   pelo: '#EEC59C', escuro: '#D9A273', focinho: '#F8E2CB' },
};

const ESC = '#2B2230';      // cor dos olhos/nariz
const ROSA = '#FF8FA3';

function Orelhas({ v }) {
  const { orelha, pelo, escuro } = v;
  if (orelha === 'caida') return html`
    <ellipse class="orelha e" cx="22" cy="50" rx="11" ry="21" fill=${escuro} transform="rotate(22 22 50)" />
    <ellipse class="orelha d" cx="78" cy="50" rx="11" ry="21" fill=${escuro} transform="rotate(-22 78 50)" />`;
  if (orelha === 'fofa') return html`
    <ellipse class="orelha e" cx="21" cy="60" rx="13" ry="25" fill=${escuro} transform="rotate(12 21 60)" />
    <ellipse class="orelha d" cx="79" cy="60" rx="13" ry="25" fill=${escuro} transform="rotate(-12 79 60)" />`;
  if (orelha === 'morcego') return html`
    <path class="orelha e" d="M30 40 L18 10 Q38 14 44 32 Z" fill=${escuro} />
    <path class="orelha d" d="M70 40 L82 10 Q62 14 56 32 Z" fill=${escuro} />
    <path d="M30 36 L23 17 Q35 20 39 31 Z" fill=${ROSA} opacity=".55" />
    <path d="M70 36 L77 17 Q65 20 61 31 Z" fill=${ROSA} opacity=".55" />`;
  if (orelha === 'cacho') return html`
    <g class="orelha e" fill=${escuro}><circle cx="20" cy="50" r="10"/><circle cx="16" cy="62" r="10"/><circle cx="22" cy="72" r="9"/></g>
    <g class="orelha d" fill=${escuro}><circle cx="80" cy="50" r="10"/><circle cx="84" cy="62" r="10"/><circle cx="78" cy="72" r="9"/></g>
    <g fill=${pelo}><circle cx="40" cy="28" r="10"/><circle cx="50" cy="23" r="11"/><circle cx="60" cy="28" r="10"/></g>`;
  // gato
  return html`
    <path class="orelha e" d="M22 44 L24 12 L46 30 Z" fill=${pelo} stroke=${escuro} stroke-width="2" stroke-linejoin="round" />
    <path class="orelha d" d="M78 44 L76 12 L54 30 Z" fill=${pelo} stroke=${escuro} stroke-width="2" stroke-linejoin="round" />
    <path d="M27 36 L28 20 L39 30 Z" fill=${ROSA} opacity=".7" />
    <path d="M73 36 L72 20 L61 30 Z" fill=${ROSA} opacity=".7" />`;
}

// humor: 'normal' | 'feliz' | 'dormindo'
export function CaraPet({ id, tam = 48, humor = 'normal', classe = '' }) {
  const v = VISUAL[id] || VISUAL.thor;
  const gato = v.orelha === 'gato';
  const feliz = humor === 'feliz';
  const dorm = humor === 'dormindo';
  return html`<svg class=${'cara ' + (gato ? 'eh-gato ' : 'eh-cao ') + (feliz ? 'feliz ' : '') + classe} width=${tam} height=${tam} viewBox="0 0 100 100" aria-hidden="true">
    <${Orelhas} v=${v} />
    ${v.fofa && html`<g fill=${v.pelo}><circle cx="24" cy="66" r="12"/><circle cx="76" cy="66" r="12"/></g>`}
    <ellipse cx="50" cy="56" rx=${gato ? 32 : 30} ry=${gato ? 27 : 29} fill=${v.pelo} />
    ${v.listras && html`<g stroke=${v.escuro} stroke-width="3" stroke-linecap="round" fill="none"><path d="M50 30v9M42 32l2 7M58 32l-2 7"/></g>`}
    ${v.mascara && html`<ellipse cx="50" cy="66" rx="20" ry="15" fill=${v.escuro} opacity=".35" />`}
    <ellipse cx="50" cy="68" rx=${gato ? 13 : 17} ry=${gato ? 10 : 13} fill=${v.focinho} />
    <ellipse class="bochecha" cx="31" cy="64" rx="5" ry="3.2" fill=${ROSA} opacity=".45" />
    <ellipse class="bochecha" cx="69" cy="64" rx="5" ry="3.2" fill=${ROSA} opacity=".45" />
    ${dorm
      ? html`<g stroke=${ESC} stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M33 52q5 4 10 0M57 52q5 4 10 0"/></g>`
      : feliz
        ? html`<g stroke=${ESC} stroke-width="3" stroke-linecap="round" fill="none"><path d="M33 53q5-6 10 0M57 53q5-6 10 0"/></g>`
        : html`<g class="olhos">
            ${gato
              ? html`<ellipse cx="38" cy="51" rx="5.5" ry="6.5" fill=${v.olhoAzul ? '#5AA9E6' : '#9BC53D'} /><ellipse cx="62" cy="51" rx="5.5" ry="6.5" fill=${v.olhoAzul ? '#5AA9E6' : '#9BC53D'} />
                     <ellipse cx="38" cy="51" rx="1.8" ry="5" fill=${ESC} /><ellipse cx="62" cy="51" rx="1.8" ry="5" fill=${ESC} />`
              : html`<circle cx="38" cy="51" r="5.2" fill=${ESC} /><circle cx="62" cy="51" r="5.2" fill=${ESC} />`}
            <circle cx="39.8" cy="49" r="1.7" fill="#fff" /><circle cx="63.8" cy="49" r="1.7" fill="#fff" />
          </g>`}
    ${gato
      ? html`<path d="M46 62 h8 l-4 4 z" fill=${ROSA} stroke=${ROSA} stroke-linejoin="round" stroke-width="1.5" />
             <g stroke=${ESC} stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M50 66 q-3 5 -7 2 M50 66 q3 5 7 2"/></g>
             <g class="bigodes" stroke=${v.escuro} stroke-width="1.3" stroke-linecap="round"><path d="M30 66h-14M31 70l-13 3M70 66h14M69 70l13 3"/></g>`
      : html`<ellipse cx="50" cy="62" rx="7" ry="5" fill=${ESC} /><ellipse cx="48" cy="60.5" rx="2" ry="1.2" fill="#fff" opacity=".6" />
             <g stroke=${ESC} stroke-width="2" fill="none" stroke-linecap="round"><path d="M50 67 q0 6 -6 6 M50 67 q0 6 6 6"/></g>`}
    <path class="lingua" d="M45 74 q5 12 10 0 z" fill=${ROSA} />
  </svg>`;
}

// Pet espiando por cima de algo, com patinhas e rabo abanando
export function PetEspiando({ id, tam = 120, humor = 'normal', classe = '' }) {
  const v = VISUAL[id] || VISUAL.thor;
  const gato = v.orelha === 'gato';
  return html`<div class=${'espiando ' + classe} style=${`width:${tam}px;height:${tam * 0.9}px`}>
    <svg class=${'rabo ' + (gato ? 'rabo-gato' : 'rabo-cao')} viewBox="0 0 60 60" aria-hidden="true">
      ${gato
        ? html`<path d="M10 55 C 10 30, 40 40, 35 10" stroke=${v.pelo} stroke-width="9" fill="none" stroke-linecap="round" />`
        : html`<path d="M8 52 C 16 34, 30 30, 40 14" stroke=${v.escuro} stroke-width="8" fill="none" stroke-linecap="round" />`}
    </svg>
    <${CaraPet} id=${id} tam=${tam * 0.82} humor=${humor} classe="espiando-cara" />
    <svg class="patinhas" viewBox="0 0 100 20" aria-hidden="true">
      <ellipse cx="34" cy="10" rx="10" ry="8" fill=${v.pelo} stroke=${v.escuro} stroke-width="1.5" />
      <ellipse cx="66" cy="10" rx="10" ry="8" fill=${v.pelo} stroke=${v.escuro} stroke-width="1.5" />
      <path d="M30 6v4M34 5v5M38 6v4M62 6v4M66 5v5M70 6v4" stroke=${v.escuro} stroke-width="1.2" stroke-linecap="round" />
    </svg>
  </div>`;
}

export function GatoDormindo({ texto = 'Nada por aqui… só um cochilo.' }) {
  return html`<div class="gato-dormindo">
    <svg viewBox="0 0 160 90" width="150" aria-hidden="true">
      <ellipse cx="80" cy="80" rx="60" ry="6" fill="#0F2E4D" opacity=".06" />
      <path d="M30 70 C 25 40, 70 28, 105 42 C 128 50, 135 70, 120 76 L 40 76 Z" fill="#A3ABBD" />
      <path class="rabo-dorm" d="M120 74 C 140 74, 145 60, 132 56" stroke="#A3ABBD" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M100 44 C 100 56, 70 62, 58 54" stroke="#6E778A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5" />
      <circle cx="44" cy="58" r="20" fill="#A3ABBD" />
      <path d="M30 46 L30 30 L42 40 Z M56 44 L60 29 L48 38 Z" fill="#A3ABBD" />
      <path d="M36 58q4 3 8 0M48 58q4 3 8 0" stroke="#2B2230" stroke-width="2" fill="none" stroke-linecap="round" />
      <ellipse cx="46" cy="64" rx="2.5" ry="1.8" fill="#FF8FA3" />
    </svg>
    <span class="zzz"><i>z</i><i>z</i><i>Z</i></span>
    <p>${texto}</p>
  </div>`;
}

// Pegada de patinha (um só)
export function Pata({ tam = 22, cor = 'currentColor', classe = '', estilo = '' }) {
  return html`<svg class=${'pata ' + classe} style=${estilo} width=${tam} height=${tam} viewBox="0 0 24 24" fill=${cor} aria-hidden="true">
    <ellipse cx="12" cy="16" rx="5.5" ry="4.6" /><ellipse cx="5.5" cy="10" rx="2.3" ry="2.9" /><ellipse cx="9.5" cy="5.5" rx="2.3" ry="2.9" />
    <ellipse cx="14.5" cy="5.5" rx="2.3" ry="2.9" /><ellipse cx="18.5" cy="10" rx="2.3" ry="2.9" />
  </svg>`;
}

// Trilha de pegadas "andando" (decoração)
export function Pegadas({ qtd = 8, classe = '' }) {
  return html`<div class=${'pegadas ' + classe} aria-hidden="true">
    ${Array.from({ length: qtd }, (_, i) => html`<${Pata} tam=${18} estilo=${`--i:${i};--n:${qtd};transform:translateY(${i % 2 ? 9 : -9}px) rotate(90deg)`} />`)}
  </div>`;
}

export function Osso({ tam = 26, cor = '#F5E6C8' }) {
  return html`<svg width=${tam} height=${tam * 0.5} viewBox="0 0 40 20" aria-hidden="true">
    <path d="M8 4a4 4 0 1 0-2 7.5A4 4 0 1 0 10 16h20a4 4 0 1 0 4-4.5A4 4 0 1 0 32 4a4 4 0 0 0-2 2H10a4 4 0 0 0-2-2z" fill=${cor} stroke="#D9BE8C" stroke-width="1.5" />
  </svg>`;
}

// Barra de progresso onde o pet anda até o ossinho
export function Trilha({ valor, id = 'thor', claro = false }) {
  return html`<div class=${'trilha' + (claro ? ' claro' : '')} style=${`--v:${valor}%`}>
    <div class="trilha-pista"><div class="trilha-feito"></div></div>
    <span class="trilha-pet"><${CaraPet} id=${id} tam=${28} humor=${valor >= 100 ? 'feliz' : 'normal'} /></span>
    <span class="trilha-osso"><${Osso} tam=${24} /></span>
  </div>`;
}

// Fala do pet ("Au au!", "Miau!")
export function falaDoPet(id) {
  const gato = (VISUAL[id] || {}).orelha === 'gato';
  const falas = gato ? ['Miau!', 'Purrr…', 'Mrrau?', 'Cadê meu sachê?'] : ['Au au!', 'Auuu!', 'Bora passear?', 'Cadê o petisco?'];
  return falas[Math.floor(Math.random() * falas.length)];
}

// Pet clicável: ao tocar, fala e solta coraçõezinhos
export function PetFalante({ id, tam = 120, humor = 'normal', classe = '', lado = 'esq' }) {
  const [fala, setFala] = useState(null);
  const t = useRef();
  const tocar = (e) => {
    clearTimeout(t.current);
    setFala(falaDoPet(id));
    festa(e.clientX, e.clientY, 10);
    t.current = setTimeout(() => setFala(null), 1800);
  };
  return html`<button class=${'pet-falante ' + classe} onClick=${tocar} aria-label="Fazer carinho no pet">
    ${fala && html`<span class=${'balao ' + lado} key=${fala + Math.random()}>${fala}</span>`}
    <${PetEspiando} id=${id} tam=${tam} humor=${fala ? 'feliz' : humor} />
  </button>`;
}
