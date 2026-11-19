// =====================================================
// app.js — PONTO DE PARTIDA
// Decide qual tela mostrar (rotas), desenha a barra de
// demonstração no topo e o tour guiado de 6 etapas.
// =====================================================
import { html, render, useState } from '../vendor/preact-htm.js';
import { useEstado, useRota, ir, Icone, Toasts, reiniciar, atualizar } from './core.js';
import { LayoutClinica, Painel, Pacientes, PacienteDetalhe, Planos, PlanoDetalhe, Acompanhamento, Config } from './clinica.js';
import { CriarPlano, PlanoSucesso } from './wizard.js';
import { AppTutor } from './tutor.js';
import { Login } from './login.js';
import { Tour } from './tour.js';

// ---------- BARRA DE DEMONSTRAÇÃO (topo) ----------
function BarraDemo({ ehTutor }) {
  const s = useEstado();
  return html`<div class="demo-bar">
    <span class="demo-tag"><i></i> <span>Modo demonstração</span></span>
    <button class="demo-etapa" onClick=${() => atualizar(st => ({ ...st, tourAberto: !st.tourAberto }))}>Etapa ${s.etapa} de 6</button>
    <div class="demo-toggle" role="tablist">
      <button class=${!ehTutor ? 'ativo' : ''} onClick=${() => ir('painel')}><${Icone} n="estetoscopio" tam=${15} /> <span>Visão da clínica</span></button>
      <button class=${ehTutor ? 'ativo' : ''} onClick=${() => ir('tutor')}><${Icone} n="celular" tam=${15} /> <span>Visão do tutor</span></button>
    </div>
    <button class="demo-reset" onClick=${() => { reiniciar(); ir('painel'); }}><${Icone} n="refresh" tam=${15} /> <span>Reiniciar demonstração</span></button>
  </div>`;
}

// ---------- ROTEADOR ----------
function App() {
  const s = useEstado();
  const rota = useRota();
  const [r0, r1, r2] = rota;

  if (!s.sessao || r0 === 'entrar') return html`<${Login} /><${Toasts} />`;

  const ehTutor = r0 === 'tutor';
  let tela;
  if (ehTutor) tela = html`<${AppTutor} aba=${r1} rota=${rota} />`;
  else {
    let pagina;
    if (r0 === 'pacientes' && r1) pagina = html`<${PacienteDetalhe} id=${r1} />`;
    else if (r0 === 'pacientes') pagina = html`<${Pacientes} />`;
    else if (r0 === 'planos' && r1 === 'novo') pagina = html`<${CriarPlano} petInicial=${r2} key=${'novo' + (r2 || '')} />`;
    else if (r0 === 'planos' && r1 === 'sucesso') pagina = html`<${PlanoSucesso} id=${r2} />`;
    else if (r0 === 'planos' && r1) pagina = html`<${PlanoDetalhe} id=${r1} />`;
    else if (r0 === 'planos') pagina = html`<${Planos} />`;
    else if (r0 === 'acompanhamento') pagina = html`<${Acompanhamento} />`;
    else if (r0 === 'config') pagina = html`<${Config} />`;
    else pagina = html`<${Painel} />`;
    tela = html`<${LayoutClinica} rota=${rota}>${pagina}<//>`;
  }

  return html`<${BarraDemo} ehTutor=${ehTutor} />${tela}<${Tour} rota=${rota} classe=${ehTutor ? 'so-pequeno' : ''} /><${Toasts} />`;
}

render(html`<${App} />`, document.getElementById('app'));
