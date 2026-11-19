// =====================================================
// acoes.js — AS FUNÇÕES QUE MUDAM OS DADOS
// Cada botão importante do site chama UMA função daqui.
// Regra de ouro: tela só MOSTRA; quem MUDA é a ação.
// =====================================================
import { atualizar, agora, toast, pet } from './core.js';
import { clone } from './data.js';

const novoId = () => Math.random().toString(36).slice(2, 9);

function registrar(s, atividade) {
  return [{ id: novoId(), quando: `Hoje, ${agora()}`, ...atividade }, ...s.atividades];
}

// Clínica → aprova o plano no assistente de 5 etapas
export function criarPlano({ petId, modelo, nome, dias, retorno, tarefas, orientacao }) {
  const id = 'p-' + petId + '-' + novoId();
  atualizar(s => ({
    ...s,
    planos: [{ id, pet: petId, modelo: modelo.id, nome, dias, dia: 1, status: 'andamento', tarefas: clone(tarefas), feitos: {}, orientacao, retorno },
      ...s.planos.filter(p => !(p.pet === petId && p.status !== 'concluido'))],
    atividades: registrar(s, { pet: petId, tipo: 'criado', titulo: 'Plano disponibilizado', texto: nome }),
    etapa: Math.max(s.etapa, 4),
  }));
  return id;
}

// Tutor → marca "Realizado" num cuidado
export function confirmarItem(planoId, item) {
  const hora = agora();
  atualizar(s => ({
    ...s,
    planos: s.planos.map(p => p.id === planoId ? { ...p, feitos: { ...p.feitos, [item.chave]: hora } } : p),
    atividades: registrar(s, {
      pet: s.planos.find(p => p.id === planoId).pet,
      tipo: 'confirmado', titulo: item.tarefa.tipo === 'med' ? 'Administração confirmada' : 'Cuidado registrado', texto: item.rotulo,
    }),
  }));
  toast('Registrado! A clínica já pode ver.');
}

// Tutor → desfaz (caso tenha marcado sem querer)
export function desfazerItem(planoId, item) {
  atualizar(s => {
    const planos = s.planos.map(p => {
      if (p.id !== planoId) return p;
      const feitos = { ...p.feitos }; delete feitos[item.chave];
      return { ...p, feitos };
    });
    return { ...s, planos };
  });
}

// Tutor → "Preciso de ajuda" ou "Encaminhar para a clínica" (assistente)
export function relatar(planoId, motivo, texto) {
  atualizar(s => {
    const plano = s.planos.find(p => p.id === planoId);
    return {
      ...s,
      planos: s.planos.map(p => p.id === planoId ? { ...p, status: 'atencao' } : p),
      atividades: registrar(s, { pet: plano.pet, tipo: 'alerta', titulo: 'Relato do tutor', texto: motivo + (texto ? ` — "${texto}"` : ''), resolvido: false }),
    };
  });
  toast('Relato enviado à equipe da clínica', 'alerta');
}

// Clínica → responde o relato com uma orientação (aparece no app do tutor)
export function enviarOrientacao(atividadeId, petId, texto) {
  atualizar(s => ({
    ...s,
    atividades: registrar(
      { ...s, atividades: s.atividades.map(a => a.id === atividadeId ? { ...a, resolvido: true } : a) },
      { pet: petId, tipo: 'orientacao', titulo: 'Orientação enviada', texto }),
    mensagens: { ...s.mensagens, [petId]: [{ id: novoId(), texto, quando: `Hoje, ${agora()}`, lida: false }, ...(s.mensagens[petId] || [])] },
    planos: s.planos.map(p => p.pet === petId && p.status === 'atencao' ? { ...p, status: 'andamento' } : p),
  }));
  toast(`Orientação enviada para o tutor de ${pet(petId).nome}`);
}

export function resolverAlerta(atividadeId, petId) {
  atualizar(s => ({
    ...s,
    atividades: s.atividades.map(a => a.id === atividadeId ? { ...a, resolvido: true } : a),
    planos: s.planos.map(p => p.pet === petId && p.status === 'atencao' ? { ...p, status: 'andamento' } : p),
  }));
  toast('Relato marcado como resolvido');
}

// Clínica → botões de demonstração no detalhe do plano
export function avancarDia(planoId) {
  atualizar(s => ({
    ...s,
    planos: s.planos.map(p => p.id === planoId && p.dia < p.dias ? { ...p, dia: p.dia + 1, feitos: {} } : p),
  }));
  toast('Avançamos um dia no plano (simulação)');
}
export function concluirPlano(planoId) {
  atualizar(s => {
    const plano = s.planos.find(p => p.id === planoId);
    return {
      ...s,
      planos: s.planos.map(p => p.id === planoId ? { ...p, status: 'concluido', dia: p.dias } : p),
      atividades: registrar(s, { pet: plano.pet, tipo: 'concluido', titulo: 'Plano concluído', texto: plano.nome }),
      base: { ...s.base, concluidosMes: s.base.concluidosMes + 1 },
    };
  });
  toast('Plano concluído. Bom trabalho!');
}

export function marcarMensagensLidas(petId) {
  atualizar(s => ({ ...s, mensagens: { ...s.mensagens, [petId]: (s.mensagens[petId] || []).map(m => ({ ...m, lida: true })) } }));
}

// Tutor → visualizou o plano (gera atividade 1x)
export function plano_visualizado(planoId) {
  atualizar(s => {
    const p = s.planos.find(x => x.id === planoId);
    if (!p || p.visto) return s;
    return { ...s, planos: s.planos.map(x => x.id === planoId ? { ...x, visto: true } : x),
      atividades: registrar(s, { pet: p.pet, tipo: 'visualizado', titulo: 'Plano visualizado', texto: p.nome }) };
  });
}

export const irEtapa = (n) => atualizar(s => ({ ...s, etapa: n, tourAberto: true }));
export const trocarVisao = (v) => atualizar(s => ({ ...s, visao: v }));
