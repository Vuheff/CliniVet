// =====================================================
// tutor.js — VISÃO DO TUTOR (app no celular)
// Abas: Início, Meu plano, Histórico, Assistente
// =====================================================
import { html, useState, useEffect, useRef } from '../vendor/preact-htm.js';
import { useEstado, ir, pet, Icone, Avatar, Status, dataHoje, pct, atualizar } from './core.js';
import { CLINICA, itensDoDia, proximoCuidado, respostaAssistente, doPet } from './data.js';
import { confirmarItem, desfazerItem, relatar, marcarMensagensLidas, plano_visualizado, trocarVisao } from './acoes.js';
import { Anel } from './clinica.js';
import { Tour } from './tour.js';
import { PetFalante, Trilha, Pata, Pegadas, GatoDormindo } from './pets.js';
import { festa, centro } from './fx.js';

const ABAS = [
  { rota: 'tutor', nome: 'Início', icone: 'casa' },
  { rota: 'tutor/plano', nome: 'Meu plano', icone: 'prancheta' },
  { rota: 'tutor/historico', nome: 'Histórico', icone: 'historico' },
  { rota: 'tutor/assistente', nome: 'Assistente', icone: 'brilho' },
];

export function AppTutor({ aba, rota }) {
  const s = useEstado();
  const p = pet(s.tutorPet);
  const plano = s.planos.find(x => x.pet === p.id && x.status !== 'concluido');
  const [folha, setFolha] = useState(null); // 'orientacoes' | 'ajuda' | 'mensagens'
  useEffect(() => { if (plano) plano_visualizado(plano.id); }, [plano?.id]);

  const rotaAtual = aba ? 'tutor/' + aba : 'tutor';

  return html`<div class="tutor-palco">
    <${Pegadas} qtd=${12} classe="palco-pegadas" />
    <aside class="tutor-lado">
      <p class="kicker">Visão do tutor</p>
      <h2>O cuidado continua em casa</h2>
      <p class="muted">É assim que ${p.tutor} vê o plano ${doPet(p)} no celular. Tudo que ${p.genero === 'a' ? 'ela' : 'ele'} registrar aparece na hora para a clínica.</p>
      <label class="rotulo">Ver como o tutor de:</label>
      <select class="select" value=${p.id} onChange=${e => { atualizar(st => ({ ...st, tutorPet: e.target.value })); ir('tutor'); }}>
        ${s.planos.filter(x => x.status !== 'concluido').map(x => pet(x.pet)).concat(plano ? [] : [p])
          .map(x => html`<option value=${x.id}>${x.nome} — ${x.tutor}</option>`)}
      </select>
      <button class="btn btn-sec" onClick=${() => { trocarVisao('clinica'); ir('acompanhamento'); }}><${Icone} n="estetoscopio" /> Ver o que a clínica recebe</button>
      <${Tour} rota=${rota} inline />
    </aside>

    <div class="celular">
      <div class="celular-notch"></div>
      <div class="celular-tela">
        ${!plano
          ? html`<${SemPlano} p=${p} />`
          : html`
            <div class="tela-rolagem" key=${rotaAtual}>
              ${rotaAtual === 'tutor' && html`<${Inicio} p=${p} plano=${plano} abrir=${setFolha} />`}
              ${rotaAtual === 'tutor/plano' && html`<${MeuPlano} p=${p} plano=${plano} />`}
              ${rotaAtual === 'tutor/historico' && html`<${Historico} p=${p} />`}
              ${rotaAtual === 'tutor/assistente' && html`<${Assistente} p=${p} plano=${plano} />`}
            </div>
            <nav class="tabbar">
              ${ABAS.map(a => html`<a href=${'#/' + a.rota} class=${rotaAtual === a.rota ? 'ativo' : ''}><${Icone} n=${a.icone} tam=${20} /><span>${a.nome}</span></a>`)}
            </nav>
            ${folha && html`<${Folha} tipo=${folha} fechar=${() => setFolha(null)} p=${p} plano=${plano} />`}`}
      </div>
    </div>
  </div>`;
}

function SemPlano({ p }) {
  return html`<div class="tela-rolagem centro-v">
    <div class="tutor-ola"><div><h3>Olá, ${p.tutorCurto}!</h3><p>Vamos cuidar ${doPet(p)}?</p></div></div>
    <${PetFalante} id=${p.id} tam=${150} />
    <div class="t-card amarelo">
      <span class="kpi-ic amarelo"><${Icone} n="relogio" /></span>
      <strong>Plano em revisão</strong>
      <p>A clínica ainda está preparando as orientações ${doPet(p)}.</p>
    </div>
    <button class="btn btn-primario largo" onClick=${() => { trocarVisao('clinica'); ir('planos/novo/' + p.id); }}>Criar o plano na visão da clínica</button>
  </div>`;
}

function Inicio({ p, plano, abrir }) {
  const s = useEstado();
  const itens = itensDoDia(plano);
  const prox = proximoCuidado(plano);
  const msgs = s.mensagens[p.id] || [];
  const naoLidas = msgs.filter(m => !m.lida).length;
  const [feliz, setFeliz] = useState(false);
  const tFeliz = useRef();
  const tudoFeito = itens.every(i => i.feito);
  const confirmar = (e, i) => {
    festa(...centro(e), 22);
    confirmarItem(plano.id, i);
    setFeliz(true); clearTimeout(tFeliz.current);
    tFeliz.current = setTimeout(() => setFeliz(false), 2600);
  };
  return html`
    <div class="tutor-ola">
      <div><h3>Olá, ${p.tutorCurto}!</h3><p>Vamos cuidar ${doPet(p)}?</p></div>
      <button class="sino-tutor" onClick=${() => abrir('mensagens')} aria-label="Mensagens da clínica">
        <${Avatar} p=${p} tam=${44} />${naoLidas > 0 && html`<b>${naoLidas}</b>`}
      </button>
    </div>

    ${naoLidas > 0 && html`<button class="t-card navy" onClick=${() => abrir('mensagens')}>
      <span class="kpi-ic branco"><${Icone} n="msg" /></span>
      <span><strong>Nova orientação da ${CLINICA.vetCurto}</strong><small>${msgs[0].texto}</small></span>
    </button>`}

    <div class="t-hero">
      <small class="kicker claro">${plano.nome}</small>
      <h4>Seu cuidado faz parte da recuperação.</h4>
      <p>Acompanhe as orientações da ${CLINICA.vetCurto}.</p>
      <div class="t-hero-prog"><strong>Dia ${plano.dia} de ${plano.dias}</strong><small>${pct(plano)}% do caminho até a alta</small></div>
      <${Trilha} valor=${pct(plano)} id=${p.id} claro />
      ${prox
        ? html`<div class="t-prox"><small>Próximo cuidado</small><strong>${prox.rotulo}</strong></div>`
        : html`<div class="t-prox ok"><small>Hoje</small><strong>Tudo feito! ${p.nome} agradece.</strong></div>`}
      <${PetFalante} id=${p.id} tam=${104} classe="hero-pet" humor=${feliz || tudoFeito ? 'feliz' : 'normal'} lado="dir" />
    </div>

    <a class="t-card ia" href="#/tutor/assistente">
      <span class="kpi-ic verde"><${Icone} n="brilho" /></span>
      <span><small class="kicker">IA supervisionada</small><strong>Tirar dúvida com o assistente</strong><small>Respostas baseadas no plano aprovado ${doPet(p)}.</small></span>
      <${Icone} n="dir" />
    </a>

    <div class="t-secao"><div><strong>Cuidados de hoje</strong><small>${dataHoje()}</small></div><a href="#/tutor/historico" class="link">Ver histórico</a></div>
    ${tudoFeito && html`<div class="t-card missao"><${Pata} tam=${28} /><span><strong>Missão do dia cumprida!</strong><small>${p.nome} está orgulhos${p.sexo === 'f' ? 'a' : 'o'} de você.</small></span></div>`}
    <ul class="t-tarefas">
      ${itens.map(i => {
        const ehProx = prox && prox.chave === i.chave;
        return html`<li class=${(i.feito ? 'feito ' : '') + (ehProx ? 'prox' : '')} key=${i.chave}>
          <div class="t-tarefa-topo">
            <span class=${'kpi-ic ' + (i.tarefa.tipo === 'med' ? 'azul' : 'verde')}><${Icone} n=${i.tarefa.tipo === 'med' ? 'pilula' : i.tarefa.tipo === 'obs' ? 'olho' : 'coracao'} /></span>
            <span class="t-tarefa-txt"><small class="kicker">${i.tarefa.tipo === 'med' ? 'Medicamento' : 'Cuidado diário'}</small><strong>${i.tarefa.nome}</strong>
              <small>${i.hora !== '—' ? i.hora + ' • ' : ''}${i.feito ? 'Confirmado às ' + i.feito : ehProx ? 'Próxima atividade' : 'Pendente'}</small></span>
            <span class=${'pill ' + (i.feito ? 'pill-verde' : 'pill-cinza')}><i></i>${i.feito ? 'Realizado' : 'Pendente'}</span>
          </div>
          ${i.feito
            ? html`<button class="t-desfazer" onClick=${() => desfazerItem(plano.id, i)}>Desfazer</button>`
            : html`<button class="btn btn-primario largo" onClick=${(e) => confirmar(e, i)}><${Icone} n="check" /> ${i.tarefa.tipo === 'med' ? 'Confirmar administração' : 'Marcar como feito'}</button>`}
        </li>`;
      })}
    </ul>

    <button class="t-card" onClick=${() => abrir('orientacoes')}>
      <span class="kpi-ic verde"><${Icone} n="nota" /></span>
      <span><strong>Orientações da ${CLINICA.vetCurto}</strong><small>Ver orientações do plano</small></span><${Icone} n="dir" />
    </button>
    <button class="t-card ajuda" onClick=${() => abrir('ajuda')}>
      <span class="kpi-ic vermelho"><${Icone} n="msg" /></span>
      <span><strong>Preciso de ajuda com o tratamento</strong><small>Conte à equipe se algo não saiu como esperado.</small></span><${Icone} n="dir" />
    </button>
    <p class="t-aviso">Os registros são informações declaradas pelo tutor e não substituem avaliação veterinária.</p>`;
}

function MeuPlano({ p, plano }) {
  const [aba, setAba] = useState('med');
  const tarefas = plano.tarefas.filter(t => aba === 'med' ? t.tipo === 'med' : aba === 'cuid' ? t.tipo !== 'med' : false);
  return html`
    <div class="t-titulo"><small class="kicker">Plano de cuidado</small><h3>Cuidados ${doPet(p)}</h3><p>${plano.nome} • Dia ${plano.dia} de ${plano.dias}</p></div>
    <div class="segmentado">
      ${[['med', 'Medicamentos'], ['cuid', 'Cuidados'], ['ori', 'Orientações'], ['ret', 'Retorno']].map(([v, t]) =>
        html`<button class=${aba === v ? 'ativo' : ''} onClick=${() => setAba(v)}>${t}</button>`)}
    </div>
    ${(aba === 'med' || aba === 'cuid') && (tarefas.length ? tarefas.map(t => html`<div class="t-card col">
      <small class="kicker">${t.tipo === 'med' ? 'Medicamento' : 'Cuidado'}</small>
      <strong>${t.nome}</strong><small>Conforme registrado pela ${CLINICA.vet}.</small>
      <dl class="t-dl">
        <div><dt>Horários</dt><dd>${t.horarios.length ? t.horarios.map(h => h.slice(0, 2) + 'h').join(' e ') : 'Livre'}</dd></div>
        <div><dt>Detalhe</dt><dd>${t.detalhe}</dd></div>
        <div><dt>Período</dt><dd>${plano.dias} dias</dd></div>
      </dl></div>`) : html`<p class="vazio-mini">Nada nesta categoria.</p>`)}
    ${aba === 'ori' && html`<div class="t-card col"><strong>Orientações da ${CLINICA.vetCurto}</strong><p>${plano.orientacao}</p></div>`}
    ${aba === 'ret' && html`<div class="t-card col"><span class="kpi-ic verde"><${Icone} n="calendario" /></span><strong>Retorno à clínica</strong><p>${plano.retorno} • ${CLINICA.nome}</p></div>`}`;
}

function Historico({ p }) {
  const s = useEstado();
  const lista = s.atividades.filter(a => a.pet === p.id && ['confirmado', 'alerta', 'orientacao', 'criado'].includes(a.tipo));
  return html`
    <div class="t-titulo"><small class="kicker">Atividades</small><h3>Histórico ${doPet(p)}</h3><p>Acompanhe os registros informados no plano.</p></div>
    ${lista.length === 0 && html`<${GatoDormindo} texto="Nenhum registro ainda. Confirme um cuidado na aba Início." />`}
    <ul class="t-hist">
      ${lista.map(a => html`<li key=${a.id}>
        <small class="kicker">${a.quando}</small>
        <strong>${a.texto}</strong>
        <small>${a.tipo === 'confirmado' ? 'Registrado por você.' : a.tipo === 'alerta' ? 'Relato enviado à equipe.' : a.tipo === 'orientacao' ? 'Orientação da clínica.' : 'Plano disponibilizado pela clínica.'}</small>
        <span class=${'pill ' + (a.tipo === 'alerta' ? 'pill-vermelho' : a.tipo === 'orientacao' ? 'pill-azul' : 'pill-verde')}><i></i>${a.tipo === 'alerta' ? (a.resolvido ? 'Respondido' : 'Enviado') : a.tipo === 'orientacao' ? 'Recebida' : 'Realizado'}</span>
      </li>`)}
    </ul>`;
}

// ---------- Assistente (IA simulada) ----------
const PERGUNTAS = [
  ['proximo', 'Qual é o próximo horário do medicamento?'],
  ['termina', 'Quando termina o tratamento?'],
  ['cuidados', 'Quais cuidados foram orientados?'],
  ['dificuldade', 'Estou com dificuldade para administrar o medicamento.'],
];
function Assistente({ p, plano }) {
  const [conversa, setConversa] = useState([]);
  const [digitando, setDigitando] = useState(false);
  const fim = useRef();
  useEffect(() => fim.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [conversa, digitando]);

  const perguntar = (id, texto) => {
    setConversa(c => [...c, { de: 'eu', texto }]);
    setDigitando(true);
    setTimeout(() => {
      const r = respostaAssistente(id, plano, p);
      setConversa(c => [...c, { de: 'ia', ...r, pergunta: texto }]);
      setDigitando(false);
    }, 900);
  };
  const encaminhar = (i) => {
    relatar(plano.id, 'Dificuldade para administrar medicamento', 'Encaminhado pelo assistente');
    setConversa(c => c.map((m, j) => j === i ? { ...m, encaminhado: true } : m));
  };

  return html`
    <div class="t-titulo"><small class="kicker">Assistente CliniVet</small><h3>Como posso ajudar?</h3><p>Recupere informações aprovadas no plano ${doPet(p)}.</p>
      <div class="chips"><span class="pill pill-verde"><i></i>Baseado no plano aprovado</span><span class="pill pill-azul"><i></i>IA supervisionada</span></div></div>
    <div class="chat">
      ${conversa.map((m, i) => html`<div class=${'bolha ' + m.de}>
        <p>${m.texto}</p>
        ${m.limite && html`<div class="limite">
          <small><${Icone} n="escudo" tam=${14} /> Limite de segurança • requer avaliação profissional</small>
          ${m.encaminhado
            ? html`<strong class="ok"><${Icone} n="check" tam=${14} /> Encaminhado para a clínica</strong>`
            : html`<p><strong>Deseja compartilhar esta situação?</strong> A pergunta será enviada para a equipe.</p>
              <button class="btn btn-primario largo" onClick=${() => encaminhar(i)}><${Icone} n="enviar" /> Encaminhar para a clínica</button>`}
        </div>`}
      </div>`)}
      ${digitando && html`<div class="bolha ia digitando"><${Pata} tam=${14} /><${Pata} tam=${14} /><${Pata} tam=${14} /></div>`}
      <div ref=${fim}></div>
    </div>
    <small class="kicker">Perguntas sugeridas</small>
    <div class="sugestoes">${PERGUNTAS.map(([id, t]) => html`<button onClick=${() => perguntar(id, t)} disabled=${digitando}>${t}</button>`)}</div>
    <p class="t-aviso"><strong>IA simulada e supervisionada.</strong> As respostas são pré-programadas para esta demonstração. O assistente não diagnostica, prescreve, altera doses ou substitui a equipe veterinária. Não use este canal em emergências.</p>`;
}

// ---------- Folhas (bottom sheets) ----------
const MOTIVOS = ['Dificuldade para administrar medicamento', 'Dúvida sobre orientação', 'Não consegui realizar um cuidado', 'Outra situação'];
function Folha({ tipo, fechar, p, plano }) {
  const s = useEstado();
  const [motivo, setMotivo] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviado, setEnviado] = useState(false);
  useEffect(() => { if (tipo === 'mensagens') marcarMensagensLidas(p.id); }, [tipo]);
  const msgs = s.mensagens[p.id] || [];

  return html`<div class="folha-fundo" onClick=${e => e.target === e.currentTarget && fechar()}>
    <div class="folha">
      <span class="folha-alca"></span>
      <button class="icon-btn folha-x" onClick=${fechar} aria-label="Fechar"><${Icone} n="x" /></button>

      ${tipo === 'orientacoes' && html`
        <small class="kicker">Orientações • ${plano.nome}</small>
        <h3>Orientações da ${CLINICA.vetCurto}</h3>
        <p>${plano.orientacao}</p>
        <ol class="passos-v">
          <li><b>1</b><span><strong>Rotina de cuidados</strong><small>Realize os cuidados nos horários combinados com a clínica.</small></span></li>
          <li><b>2</b><span><strong>Acompanhe e registre</strong><small>Confirme somente as atividades que você realizou.</small></span></li>
          <li><b>3</b><span><strong>Em caso de dificuldade</strong><small>Envie um relato pelo plano para contextualizar a equipe.</small></span></li>
        </ol>
        <small class="muted">Estas informações foram registradas pela ${CLINICA.nome}.</small>
        <button class="btn btn-primario largo" onClick=${fechar}>Entendi</button>`}

      ${tipo === 'ajuda' && (enviado
        ? html`<div class="centro-v"><div class="sucesso-ic pequeno"><${Icone} n="check" tam=${28} /></div>
            <h3>Relato enviado</h3><p>A equipe da ${CLINICA.nome} foi avisada e vai responder por aqui.</p>
            <button class="btn btn-primario largo" onClick=${fechar}>Voltar ao início</button></div>`
        : html`
          <small class="kicker">Preciso de ajuda</small>
          <h3>Como podemos ajudar?</h3>
          <p>Selecione a opção que melhor descreve a situação.</p>
          <div class="opcoes">${MOTIVOS.map(m => html`<button class=${motivo === m ? 'ativo' : ''} onClick=${() => setMotivo(m)}><span class="radio"></span>${m}</button>`)}</div>
          ${motivo && html`<textarea rows="3" placeholder="Conte o que aconteceu (opcional)" value=${texto} onInput=${e => setTexto(e.target.value)}></textarea>`}
          <button class="btn btn-primario largo" disabled=${!motivo} onClick=${() => { relatar(plano.id, motivo, texto.trim()); setEnviado(true); }}>Enviar para a clínica</button>`)}

      ${tipo === 'mensagens' && html`
        <small class="kicker">Mensagens</small><h3>Orientações recebidas</h3>
        ${msgs.length === 0 && html`<p class="vazio-mini">Nenhuma mensagem da clínica ainda.</p>`}
        ${msgs.map(m => html`<div class="t-card col"><strong>${CLINICA.vet}</strong><p>${m.texto}</p><small class="muted">${m.quando}</small></div>`)}
        <button class="btn btn-sec largo" onClick=${fechar}>Fechar</button>`}
    </div>
  </div>`;
}
