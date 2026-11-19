// =====================================================
// wizard.js — "CRIAR PLANO DE CUIDADO" (5 etapas)
// 1 Paciente → 2 Informações → 3 Rotina → 4 Orientações → 5 Revisão
// =====================================================
import { html, useState } from '../vendor/preact-htm.js';
import { useEstado, ir, pet, Icone, Avatar, toast, atualizar } from './core.js';
import { PACIENTES, MODELOS, CLINICA, clone, doPet } from './data.js';
import { criarPlano, trocarVisao } from './acoes.js';
import { festa } from './fx.js';
import { PetFalante, Pegadas } from './pets.js';
import { useEffect } from '../vendor/preact-htm.js';

const ETAPAS = ['Paciente', 'Informações', 'Rotina', 'Orientações', 'Revisão'];

function somarDias(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function CriarPlano({ petInicial }) {
  const s = useEstado();
  const [etapa, setEtapa] = useState(1);
  const [petId, setPetId] = useState(petInicial || 'thor');
  const [modeloId, setModeloId] = useState('posop');
  const modelo0 = MODELOS.find(m => m.id === modeloId);
  const [form, setForm] = useState(() => ({ nome: modelo0.nome, dias: modelo0.dias, tarefas: clone(modelo0.tarefas), orientacao: modelo0.orientacao }));
  const [aprovado, setAprovado] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({ nome: '', hora: '' });
  const p = pet(petId);

  const escolherModelo = (m) => {
    setModeloId(m.id);
    setForm({ nome: m.nome, dias: m.dias, tarefas: clone(m.tarefas), orientacao: m.orientacao });
  };
  const mudarHora = (ti, hi, valor) => setForm(f => ({ ...f, tarefas: f.tarefas.map((t, i) => i !== ti ? t : { ...t, horarios: t.horarios.map((h, j) => j === hi ? valor : h) }) }));
  const removerTarefa = (ti) => setForm(f => ({ ...f, tarefas: f.tarefas.filter((_, i) => i !== ti) }));
  const addTarefa = () => {
    if (!novaTarefa.nome.trim()) return;
    setForm(f => ({ ...f, tarefas: [...f.tarefas, { id: 'n' + Date.now(), tipo: 'cuidado', nome: novaTarefa.nome.trim(), detalhe: 'Adicionado pela veterinária', horarios: novaTarefa.hora ? [novaTarefa.hora] : [] }] }));
    setNovaTarefa({ nome: '', hora: '' });
  };
  const retorno = somarDias(Number(form.dias) || 1);

  const aprovar = () => {
    const id = criarPlano({ petId, modelo: modelo0, nome: form.nome, dias: Number(form.dias), retorno, tarefas: form.tarefas, orientacao: form.orientacao });
    toast('Plano aprovado e disponibilizado');
    ir('planos/sucesso/' + id);
  };

  const podeSeguir = etapa !== 3 || form.tarefas.length > 0;

  return html`
    <a href=${'#/pacientes/' + petId} class="voltar"><${Icone} n="esq" tam=${16} /> Voltar para o paciente</a>
    <section class="cabecalho">
      <div><p class="kicker">Novo plano</p><h1>Criar plano de cuidado</h1><p class="muted">${form.nome} • ${p.nome}</p></div>
      <span class="pill pill-amarelo"><i></i>Rascunho</span>
    </section>

    <ol class="passos" aria-label="Etapas">
      ${ETAPAS.map((t, i) => html`<li class=${(i + 1 < etapa ? 'feito ' : '') + (i + 1 === etapa ? 'atual' : '')}>
        <button disabled=${i + 1 > etapa} onClick=${() => setEtapa(i + 1)}>
          <span>${i + 1 < etapa ? html`<${Icone} n="check" tam=${14} />` : i + 1}</span><em>${t}</em>
        </button></li>`)}
    </ol>

    <section class="card wizard" key=${etapa}>
      <p class="wizard-num">0${etapa}</p>

      ${etapa === 1 && html`
        <h2>Paciente e responsável</h2><p class="muted">Confirme para quem este plano será disponibilizado.</p>
        <div class="escolha-grade">
          ${PACIENTES.map(x => {
            const temPlano = s.planos.some(pl => pl.pet === x.id && pl.status !== 'concluido');
            return html`<button class=${'escolha' + (x.id === petId ? ' ativo' : '')} onClick=${() => setPetId(x.id)}>
              <${Avatar} p=${x} tam=${44} />
              <span><strong>${x.nome}</strong><small>${x.especie} • ${x.raca} • ${x.idade}</small>${temPlano && html`<em>Já tem plano ativo (será substituído)</em>`}</span>
              ${x.id === petId && html`<span class="escolha-ok"><${Icone} n="check" tam=${14} /></span>`}
            </button>`;
          })}
        </div>
        <dl class="perfil-dados">
          <div><dt>${p.genero === 'a' ? 'Tutora' : 'Tutor'}</dt><dd>${p.tutor}</dd></div>
          <div><dt>Profissional responsável</dt><dd>${CLINICA.vet}</dd></div>
          <div><dt>Cadastro</dt><dd class="ok"><${Icone} n="check" tam=${14} /> Confirmado</dd></div>
        </dl>`}

      ${etapa === 2 && html`
        <h2>Informações do plano</h2><p class="muted">Escolha um modelo e defina o período de acompanhamento.</p>
        <div class="modelos">
          ${MODELOS.map(m => html`<button class=${'modelo' + (m.id === modeloId ? ' ativo' : '')} onClick=${() => escolherModelo(m)}>
            <strong>${m.nome}</strong><small>${m.dias} dias • ${m.resumo}</small></button>`)}
        </div>
        <div class="form-grade">
          <label><span class="rotulo">Nome do plano</span><input value=${form.nome} onInput=${e => setForm({ ...form, nome: e.target.value })} /></label>
          <label><span class="rotulo">Duração (dias)</span><input type="number" min="1" max="90" value=${form.dias} onInput=${e => setForm({ ...form, dias: e.target.value })} /></label>
          <label><span class="rotulo">Início</span><input value="Hoje" disabled /></label>
          <label><span class="rotulo">Retorno à clínica</span><input value=${retorno} disabled /></label>
        </div>`}

      ${etapa === 3 && html`
        <h2>Rotina de cuidados</h2><p class="muted">Organize os itens aprovados na orientação de alta. Ajuste os horários.</p>
        <div class="rotina">
          ${form.tarefas.map((t, ti) => html`<div class="rotina-item">
            <span class=${'kpi-ic ' + (t.tipo === 'med' ? 'azul' : 'verde')}><${Icone} n=${t.tipo === 'med' ? 'pilula' : t.tipo === 'obs' ? 'olho' : 'coracao'} /></span>
            <div class="rotina-txt"><strong>${t.nome}</strong><small>${t.detalhe}</small></div>
            <div class="horas">
              ${t.horarios.map((h, hi) => html`<input type="time" value=${h} onInput=${e => mudarHora(ti, hi, e.target.value)} aria-label=${'Horário de ' + t.nome} />`)}
              ${!t.horarios.length && html`<span class="muted">Sem horário fixo</span>`}
            </div>
            <button class="icon-btn" onClick=${() => removerTarefa(ti)} aria-label=${'Remover ' + t.nome}><${Icone} n="lixo" /></button>
          </div>`)}
          <div class="rotina-add">
            <input placeholder="Novo cuidado (ex.: Compressa morna)" value=${novaTarefa.nome} onInput=${e => setNovaTarefa({ ...novaTarefa, nome: e.target.value })} onKeyDown=${e => e.key === 'Enter' && addTarefa()} />
            <input type="time" value=${novaTarefa.hora} onInput=${e => setNovaTarefa({ ...novaTarefa, hora: e.target.value })} />
            <button class="btn btn-sec" onClick=${addTarefa}><${Icone} n="mais" /> Adicionar</button>
          </div>
        </div>`}

      ${etapa === 4 && html`
        <h2>Orientações para ${p.genero === 'a' ? 'a tutora' : 'o tutor'}</h2><p class="muted">Revise o texto que ficará disponível no app de ${p.tutorCurto}.</p>
        <label class="rotulo">Orientações aprovadas pela veterinária</label>
        <textarea rows="5" value=${form.orientacao} onInput=${e => setForm({ ...form, orientacao: e.target.value })}></textarea>
        <div class="previa-celular">
          <small class="kicker">Prévia no celular do tutor</small>
          <div class="previa-bolha"><strong>Orientações da ${CLINICA.vetCurto}</strong><p>${form.orientacao}</p></div>
        </div>`}

      ${etapa === 5 && html`
        <h2>Revisão e aprovação</h2><p class="muted">Confira as informações antes de disponibilizar o plano.</p>
        <dl class="resumo">
          <div><dt>Paciente</dt><dd>${p.nome} • ${p.tutor}</dd></div>
          <div><dt>Plano</dt><dd>${form.nome}</dd></div>
          <div><dt>Período</dt><dd>${form.dias} dias • retorno em ${retorno}</dd></div>
          <div><dt>Rotina</dt><dd>${form.tarefas.map(t => t.nome + (t.horarios.length ? ' às ' + t.horarios.map(h => h.slice(0, 2) + 'h').join(' e ') : '')).join('; ')}</dd></div>
        </dl>
        <label class=${'aprovar' + (aprovado ? ' ok' : '')}>
          <input type="checkbox" checked=${aprovado} onChange=${e => setAprovado(e.target.checked)} />
          <span><strong>Revisei e aprovo este plano</strong><small>Confirmo que as orientações refletem o cuidado definido para o paciente.</small></span>
        </label>`}

      <footer class="wizard-rodape">
        <button class="btn btn-sec" onClick=${() => etapa === 1 ? ir('pacientes/' + petId) : setEtapa(etapa - 1)}>${etapa === 1 ? 'Cancelar' : 'Voltar'}</button>
        <span class="muted">Etapa ${etapa} de 5</span>
        ${etapa < 5
          ? html`<button class="btn btn-primario" disabled=${!podeSeguir} onClick=${() => setEtapa(etapa + 1)}>Continuar <${Icone} n="seta" /></button>`
          : html`<button class="btn btn-primario" disabled=${!aprovado} onClick=${aprovar}><${Icone} n="check" /> Aprovar e disponibilizar plano</button>`}
      </footer>
    </section>`;
}

export function PlanoSucesso({ id }) {
  const s = useEstado();
  const pl = s.planos.find(x => x.id === id);
  if (!pl) return html`<p>Plano não encontrado.</p>`;
  const p = pet(pl.pet);
  const link = `clinivet.app/p/${p.id}-${pl.dias}dias`;
  const copiar = () => { navigator.clipboard?.writeText('https://' + link).catch(() => {}); toast('Link copiado'); };
  const verComoTutor = () => { atualizar(st => ({ ...st, tutorPet: p.id, etapa: Math.max(st.etapa, 5) })); trocarVisao('tutor'); ir('tutor'); };
  useEffect(() => { const t = setTimeout(() => festa(innerWidth / 2, innerHeight / 3, 60), 250); return () => clearTimeout(t); }, []);
  return html`<section class="sucesso card">
    <${Pegadas} qtd=${8} classe="sucesso-pegadas" />
    <${PetFalante} id=${p.id} tam=${150} humor="feliz" classe="sucesso-pet" />
    <span class="pill pill-verde"><i></i>Plano ativo</span>
    <h1>Plano disponibilizado com sucesso</h1>
    <p class="muted">${p.tutorCurto} já pode acessar as orientações e acompanhar a rotina de cuidados ${doPet(p)}.</p>
    <div class="link-tutor"><small class="kicker">Link de acesso do tutor</small>
      <div><${Icone} n="link" /><code>${link}</code><button class="btn btn-sec" onClick=${copiar}>Copiar link</button></div></div>
    <div class="acoes centro">
      <button class="btn btn-sec" onClick=${() => ir('painel')}>Voltar ao painel</button>
      <button class="btn btn-primario" onClick=${verComoTutor}><${Icone} n="celular" /> Visualizar como tutor</button>
    </div>
    <small class="muted">Compartilhamento simulado para fins de demonstração.</small>
  </section>`;
}
