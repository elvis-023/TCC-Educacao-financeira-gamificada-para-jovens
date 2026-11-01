import { TCLE_VERSAO } from './usuarios';

export const SELO_PROVISORIO = 'Texto provisório — será substituído pelo texto oficial aprovado pelo Comitê de Ética em Pesquisa (CEP)';
export interface Termo { titulo: string; versao: string; secoes: { titulo: string; texto: string }[] }

export const TCLE: Termo = {
  titulo: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
  versao: TCLE_VERSAO,
  secoes: [
    { titulo: 'Objetivo da pesquisa', texto: 'Este app faz parte de um Trabalho de Conclusão de Curso de Engenharia de Software da Universidade São Judas Tadeu. A pesquisa quer medir o ganho de conhecimento em finanças pessoais de quem usa o app.' },
    { titulo: 'O que pedimos a você', texto: 'Usar o app e responder a dois testes curtos, de 3 perguntas cada: um antes das trilhas e outro depois de concluí-las.' },
    { titulo: 'Dados coletados', texto: 'Nome, e-mail, as respostas dos testes e dados de uso do app (lições lidas, respostas dos quizzes e simulações). Não pedimos dados bancários.' },
    { titulo: 'Como os dados são tratados', texto: 'As respostas dos testes ficam ligadas a um código (pseudônimo), separado do seu nome e do seu e-mail, e são analisadas só de forma agregada.' },
    { titulo: 'Participação voluntária', texto: 'Participar é voluntário. Você pode desistir a qualquer momento, sem nenhum prejuízo.' },
    { titulo: 'Riscos e benefícios', texto: 'O risco é mínimo, ligado ao tempo de uso e ao desconforto de responder a perguntas. O benefício é aprender sobre finanças pessoais.' },
    { titulo: 'Contato', texto: 'Pesquisadores e Comitê de Ética em Pesquisa: contatos a preencher no texto oficial.' },
  ],
};

export const POLITICA_PRIVACIDADE: Termo = {
  titulo: 'Política de Privacidade',
  versao: TCLE_VERSAO,
  secoes: [
    { titulo: 'Dados coletados', texto: 'Nome, e-mail, respostas dos testes e dados de uso do app.' },
    { titulo: 'Finalidade', texto: 'Fazer o app funcionar (progresso, XP, conquistas e ranking) e realizar a pesquisa do TCC.' },
    { titulo: 'Quem tem acesso', texto: 'Só a equipe da pesquisa, e as respostas dos testes só pelo pseudônimo. No ranking, os outros participantes veem apenas o seu primeiro nome, a inicial do sobrenome e o seu XP.' },
    { titulo: 'Por quanto tempo', texto: 'Prazo de guarda a definir no texto oficial.' },
    { titulo: 'Dados bancários', texto: 'O app nunca pede número de cartão, conta ou senha de banco.' },
  ],
};
