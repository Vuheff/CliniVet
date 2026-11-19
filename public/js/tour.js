// =====================================================
// tour.js — TOUR GUIADO (as 6 etapas do protótipo)
// Cada etapa: título, texto, para qual tela ir e o botão.
// =====================================================
import { html } from '../vendor/preact-htm.js';
import { useEstado, ir, Icone, atualizar } from './core.js';
import { irEtapa } from './acoes.js';

const TOUR = [
  { titulo: 'Visão geral da clínica', texto: 'A veterinária vê todos os tratamentos que continuam em casa: quem está em dia, quem precisa de atenção e o que os tutores registraram.', rota: 'painel', botao: 'Abrir o paciente Thor' },
  { titulo: 'O Thor recebeu alta', texto: 'Ele acabou de passar por uma cirurgia. Em vez de um papel com orientações, a clínica transforma a alta em um plano digital.', rota: 'pacientes/thor', botao: 'Criar o plano do Thor' },
  { titulo: 'Monte o plano em 5 etapas', texto: 'Paciente → período → rotina com horários → orientações → aprovação. Ajuste o que quiser e clique em “Aprovar e disponibilizar plano”.', rota: 'planos/novo/thor', botao: null },
  { titulo: 'Plano disponibilizado', texto: 'A tutora recebe um link de acesso. Agora veja o mesmo plano pelos olhos dela, no celular.', rota: null, botao: 'Ver como tutora' },
  { titulo: 'O tutor no celular', texto: 'Ana confirma cada cuidado e, se tiver dificuldade, pede ajuda ou pergunta ao assistente. Experimente: confirme um item e toque em “Preciso de ajuda”.', rota: 'tutor', botao: 'Ver o que a clínica recebe' },
  { titulo: 'A clínica recebe na hora', texto: 'O relato aparece em Acompanhamento. Responda com uma orientação: ela chega no app do tutor (veja o sininho no avatar do pet).', rota: 'acompanhamento', botao: 'Concluir tour' },
];

function irParaEtapa(n) {
  const passo = TOUR[n - 1];
  irEtapa(n);
  if (n === 5) atualizar(s => ({ ...s, tutorPet: s.planos.find(p => p.pet === 'thor' && p.status !== 'concluido') ? 'thor' : s.tutorPet }));
  if (passo.rota) ir(passo.rota);
}

export function Tour({ rota, inline = false, classe = '' }) {
  const s = useEstado();
  if (!s.tourAberto) return null;
  const n = s.etapa, passo = TOUR[n - 1];
  const fechar = () => atualizar(st => ({ ...st, tourAberto: false }));
  const proximo = () => (n === 6 ? fechar() : irParaEtapa(n + 1));
  const foraDaTela = passo.rota && rota.join('/') !== passo.rota;
  return html`<div class=${'tour ' + (inline ? 'inline ' : '') + classe} role="dialog" aria-label="Tour da demonstração" key=${n}>
    <div class="tour-topo">
      <span class="tour-num">${n}</span>
      <div class="tour-pontos">${TOUR.map((_, i) => html`<button class=${i + 1 === n ? 'ativo' : i + 1 < n ? 'feito' : ''} onClick=${() => irParaEtapa(i + 1)} aria-label=${'Etapa ' + (i + 1)}></button>`)}</div>
      <button class="icon-btn" onClick=${fechar} aria-label="Fechar tour"><${Icone} n="x" tam=${16} /></button>
    </div>
    <strong>${passo.titulo}</strong>
    <p>${passo.texto}</p>
    <div class="tour-acoes">
      ${n > 1 && html`<button class="btn-texto" onClick=${() => irParaEtapa(n - 1)}>Anterior</button>`}
      ${foraDaTela && html`<button class="btn-texto" onClick=${() => ir(passo.rota)}>Ir para esta tela</button>`}
      ${passo.botao
        ? html`<button class="btn btn-primario" onClick=${proximo}>${passo.botao} <${Icone} n="seta" tam=${16} /></button>`
        : html`<span class="tour-espera"><i></i> Aguardando aprovação do plano…</span>`}
    </div>
  </div>`;
}

