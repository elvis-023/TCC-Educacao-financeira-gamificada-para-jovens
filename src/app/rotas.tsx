import { createBrowserRouter } from 'react-router';
import { LayoutAdmin } from '@/layouts/LayoutAdmin';
import { LayoutFoco } from '@/layouts/LayoutFoco';
import { LayoutJovem } from '@/layouts/LayoutJovem';
import { LayoutPublico } from '@/layouts/LayoutPublico';
import { NaoEncontrada } from '@/pages/NaoEncontrada';
import { TelaProvisoria } from '@/pages/TelaProvisoria';

const provisoria = (titulo: string) => <TelaProvisoria titulo={titulo} />;

export const roteador = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: '/', element: provisoria('T01 Boas-vindas') },
      { path: '/cadastro', element: provisoria('T02 Cadastro') },
      { path: '/entrar', element: provisoria('T03 Login') },
      { path: '/esqueci-senha', element: provisoria('T04 Esqueci minha senha') },
    ],
  },
  {
    element: <LayoutFoco />,
    children: [
      { path: '/pre-teste', element: provisoria('T05 Pré-teste') },
      { path: '/pos-teste', element: provisoria('T06 Pós-teste') },
      { path: '/trilhas/:trilha/licoes/:licao', element: provisoria('T10 Lição') },
      { path: '/trilhas/:trilha/licoes/:licao/quiz', element: provisoria('T11 Quiz') },
      { path: '/trilhas/:trilha/licoes/:licao/resultado', element: provisoria('T12 Resultado do quiz') },
    ],
  },
  {
    element: <LayoutJovem />,
    children: [
      { path: '/inicio', element: provisoria('T07 Início') },
      { path: '/trilhas', element: provisoria('T08 Trilhas') },
      { path: '/trilhas/:trilha', element: provisoria('T09 Trilha') },
      { path: '/simuladores', element: provisoria('T13 Simuladores') },
      { path: '/simuladores/juros-compostos', element: provisoria('T14 Juros compostos') },
      { path: '/simuladores/cartao-de-credito', element: provisoria('T15 Fatura do cartão') },
      { path: '/ranking', element: provisoria('T16 Ranking') },
      { path: '/conquistas', element: provisoria('T17 Conquistas') },
      { path: '/notificacoes', element: provisoria('T18 Notificações') },
      { path: '/perfil', element: provisoria('T19 Perfil') },
    ],
  },
  {
    path: '/admin',
    element: <LayoutAdmin />,
    children: [
      { index: true, element: provisoria('T20 Visão geral') },
      { path: 'questoes', element: provisoria('T21 Banco de questões') },
      { path: 'parametros', element: provisoria('T22 Parâmetros') },
      { path: 'exportar', element: provisoria('T23 Exportar dados') },
    ],
  },
  { path: '*', element: <NaoEncontrada /> },
]);
