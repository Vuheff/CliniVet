// =====================================================
// data.js — DADOS DE DEMONSTRAÇÃO
// Tudo que aparece na tela nasce daqui.
// Quer mudar um nome, um pet ou um horário? Mude aqui.
// =====================================================

export const CLINICA = {
  nome: 'Clínica Vida Pet',
  unidade: 'Unidade principal',
  vet: 'Dra. Marina Costa',
  vetCurto: 'Dra. Marina',
  cargo: 'Médica-veterinária',
};

export const PACIENTES = [
  { id: 'thor',   nome: 'Thor', sexo: 'm',   especie: 'Canino', raca: 'Golden Retriever',  idade: '4 anos', tutor: 'Ana Ribeiro',    tutorCurto: 'Ana',     genero: 'a', cor: '#E9A23B', ultimaConsulta: '17 nov. 2026' },
  { id: 'luna',   nome: 'Luna', sexo: 'f',   especie: 'Felino', raca: 'SRD',               idade: '2 anos', tutor: 'Beatriz Souza',  tutorCurto: 'Beatriz', genero: 'a', cor: '#7C8CF8', ultimaConsulta: '12 nov. 2026' },
  { id: 'bento',  nome: 'Bento', sexo: 'm',  especie: 'Canino', raca: 'Bulldog Francês',   idade: '6 anos', tutor: 'Carlos Lima',    tutorCurto: 'Carlos',  genero: 'o', cor: '#3FB8A0', ultimaConsulta: '08 nov. 2026' },
  { id: 'mel',    nome: 'Mel', sexo: 'f',    especie: 'Canino', raca: 'Shih-tzu',          idade: '9 anos', tutor: 'Fernanda Alves', tutorCurto: 'Fernanda',genero: 'a', cor: '#F07A8C', ultimaConsulta: '05 nov. 2026' },
  { id: 'nina',   nome: 'Nina', sexo: 'f',   especie: 'Felino', raca: 'Persa',             idade: '7 anos', tutor: 'Rafael Costa',   tutorCurto: 'Rafael',  genero: 'o', cor: '#B68CF0', ultimaConsulta: '28 out. 2026' },
  { id: 'pipoca', nome: 'Pipoca', sexo: 'f', especie: 'Canino', raca: 'Poodle',            idade: '12 anos',tutor: 'Juliana Mendes', tutorCurto: 'Juliana', genero: 'a', cor: '#5AA9E6', ultimaConsulta: '19 nov. 2026' },
];

// Modelos que aparecem no assistente "Criar plano de cuidado"
export const MODELOS = [
  {
    id: 'posop', nome: 'Cuidados pós-operatórios', dias: 7,
    resumo: 'Região operada e repouso',
    orientacao: 'Manter em repouso e seguir os cuidados com a região operada conforme demonstrado durante a alta.',
    tarefas: [
      { id: 't1', tipo: 'med',     nome: 'Medicamento A', detalhe: 'Administração a cada 12 horas', horarios: ['08:00', '20:00'] },
      { id: 't2', tipo: 'cuidado', nome: 'Limpeza da região operada', detalhe: 'Soro fisiológico e gaze', horarios: ['10:00'] },
      { id: 't3', tipo: 'obs',     nome: 'Repouso e colar elizabetano', detalhe: 'Evitar saltos e corridas', horarios: [] },
    ],
  },
  {
    id: 'odonto', nome: 'Recuperação odontológica', dias: 7,
    resumo: 'Higiene oral e alimentação pastosa',
    orientacao: 'Oferecer alimentação úmida e realizar a higiene oral conforme orientado.',
    tarefas: [
      { id: 't1', tipo: 'med',     nome: 'Antibiótico', detalhe: 'Uma vez ao dia', horarios: ['12:00'] },
      { id: 't2', tipo: 'cuidado', nome: 'Higiene oral', detalhe: 'Gel bucal após a refeição', horarios: ['20:00'] },
    ],
  },
  {
    id: 'derma', nome: 'Cuidados dermatológicos', dias: 14,
    resumo: 'Banho terapêutico e pomada',
    orientacao: 'Realizar banho terapêutico 2x por semana e aplicar a pomada na região indicada.',
    tarefas: [
      { id: 't1', tipo: 'med',     nome: 'Pomada tópica', detalhe: 'Camada fina na lesão', horarios: ['09:00'] },
      { id: 't2', tipo: 'med',     nome: 'Antialérgico', detalhe: 'Uma vez ao dia', horarios: ['19:00'] },
      { id: 't3', tipo: 'cuidado', nome: 'Banho terapêutico', detalhe: 'Terças e sextas', horarios: [] },
    ],
  },
  {
    id: 'peso', nome: 'Controle de peso', dias: 30,
    resumo: 'Dieta e caminhadas',
    orientacao: 'Seguir a quantidade de ração indicada e manter caminhadas leves diárias.',
    tarefas: [
      { id: 't1', tipo: 'cuidado', nome: 'Ração medida', detalhe: '2 porções de 60 g', horarios: ['08:00', '18:00'] },
      { id: 't2', tipo: 'cuidado', nome: 'Caminhada leve', detalhe: '20 minutos', horarios: ['17:00'] },
    ],
  },
];

// Como a demonstração começa (e volta, ao clicar em "Reiniciar demonstração")
export function estadoInicial() {
  const posop = MODELOS[0], odonto = MODELOS[1], derma = MODELOS[2], peso = MODELOS[3];
  return {
    sessao: null,            // null = ninguém logado
    visao: 'clinica',        // 'clinica' | 'tutor'
    etapa: 1,                // etapa do tour (1 a 6)
    tourAberto: true,
    tutorPet: 'thor',        // qual tutor está "logado" na visão do tutor
    planos: [
      // Thor começa SEM plano: o tour mostra a clínica criando o plano dele.
      { id: 'p-luna',  pet: 'luna',  modelo: 'odonto', nome: odonto.nome, dias: 7,  dia: 5, status: 'andamento', tarefas: clone(odonto.tarefas), feitos: { 't1-12:00': '12:05' }, orientacao: odonto.orientacao, retorno: '21/11' },
      { id: 'p-bento', pet: 'bento', modelo: 'derma',  nome: derma.nome,  dias: 14, dia: 9, status: 'andamento', tarefas: clone(derma.tarefas),  feitos: { 't1-09:00': '09:14' }, orientacao: derma.orientacao, retorno: '25/11' },
      { id: 'p-mel',   pet: 'mel',   modelo: 'peso',   nome: peso.nome,   dias: 30, dia: 12, status: 'atencao',  tarefas: clone(peso.tarefas),   feitos: {}, orientacao: peso.orientacao, retorno: '10/12' },
      { id: 'p-nina',  pet: 'nina',  modelo: 'posop',  nome: posop.nome,  dias: 7,  dia: 7, status: 'concluido', tarefas: clone(posop.tarefas), feitos: {}, orientacao: posop.orientacao, retorno: '—' },
    ],
    atividades: [
      { id: 'a1', pet: 'luna',  tipo: 'registrado',  titulo: 'Cuidado registrado',  texto: 'Higiene oral', quando: 'Ontem, 20:04' },
      { id: 'a2', pet: 'mel',   tipo: 'alerta',      titulo: 'Relato do tutor',     texto: 'Não consegui realizar um cuidado — "Mel recusou a ração medida"', quando: 'Ontem, 19:40', resolvido: false },
      { id: 'a3', pet: 'bento', tipo: 'visualizado', titulo: 'Plano visualizado',   texto: 'Cuidados dermatológicos', quando: 'Ontem, 18:32' },
      { id: 'a4', pet: 'bento', tipo: 'confirmado',  titulo: 'Atividade confirmada',texto: 'Pomada tópica — 09h', quando: 'Hoje, 09:14' },
    ],
    mensagens: { thor: [] },  // orientações que a clínica manda ao tutor
    base: { concluidosMes: 41, atividades24h: 118 }, // números "históricos" só para o painel parecer real
    config: { notificar: true, resumoDiario: true, iaAssistente: true },
  };
}

export function clone(x) { return JSON.parse(JSON.stringify(x)); }

// Respostas pré-programadas do "Assistente" (IA simulada — não é IA de verdade)
export function respostaAssistente(pergunta, plano, pet) {
  const horarios = plano.tarefas.flatMap(t => t.horarios.map(h => `${t.nome} às ${h.slice(0, 2)}h`));
  switch (pergunta) {
    case 'proximo':
      return { texto: `O próximo cuidado do ${pet.nome} é: ${proximoCuidado(plano)?.rotulo || 'nenhum pendente hoje'}. Rotina completa: ${horarios.join(', ')}.` };
    case 'termina':
      return { texto: `O plano dura ${plano.dias} dias. Hoje é o dia ${plano.dia}, faltam ${plano.dias - plano.dia} dia(s). Retorno à clínica: ${plano.retorno}.` };
    case 'cuidados':
      return { texto: `${plano.orientacao} Itens do plano: ${plano.tarefas.map(t => t.nome).join(', ')}.` };
    case 'dificuldade':
      return {
        texto: 'Não altere a dose nem o modo de administração sem orientação veterinária. Posso encaminhar sua dificuldade à equipe para que avalie a situação.',
        limite: true,
      };
    default:
      return { texto: 'Não encontrei essa informação no plano aprovado.' };
  }
}

// Descobre a próxima tarefa pendente do dia
export function proximoCuidado(plano) {
  const itens = itensDoDia(plano).filter(i => !i.feito);
  return itens[0] || null;
}

// Transforma as tarefas em "itens do dia" (uma linha por horário)
export function itensDoDia(plano) {
  const itens = [];
  plano.tarefas.forEach(t => {
    const hs = t.horarios.length ? t.horarios : ['—'];
    hs.forEach(h => {
      const chave = `${t.id}-${h}`;
      itens.push({ chave, tarefa: t, hora: h, feito: plano.feitos[chave] || null, rotulo: h === '—' ? t.nome : `${t.nome} • ${h.slice(0, 2)}h` });
    });
  });
  return itens.sort((a, b) => (a.hora === '—' ? '99' : a.hora).localeCompare(b.hora === '—' ? '99' : b.hora));
}

// "do Thor" / "da Luna"
export const doPet = (p) => (p.sexo === 'f' ? 'da ' : 'do ') + p.nome;
