import { createBrowserRouter } from 'react-router';
import { RotaAdmin, RotaJovem, RotaVisitante } from '@/app/guardas';
import { LayoutAdmin } from '@/layouts/LayoutAdmin';
import { LayoutFoco } from '@/layouts/LayoutFoco';
import { LayoutJovem } from '@/layouts/LayoutJovem';
import { LayoutPublico } from '@/layouts/LayoutPublico';
import { NaoEncontrada } from '@/pages/NaoEncontrada';
import { TelaProvisoria } from '@/pages/TelaProvisoria';
import { Inicio } from '@/pages/jovem/Inicio';
import { Licao } from '@/pages/jovem/Licao';
import { Perfil } from '@/pages/jovem/Perfil';
import { PreTeste } from '@/pages/jovem/PreTeste';
import { Quiz } from '@/pages/jovem/Quiz';
import { ResultadoQuiz } from '@/pages/jovem/ResultadoQuiz';
import { Trilha } from '@/pages/jovem/Trilha';
import { Trilhas } from '@/pages/jovem/Trilhas';
import { BoasVindas } from '@/pages/publico/BoasVindas';
import { Cadastro } from '@/pages/publico/Cadastro';
import { EsqueciSenha } from '@/pages/publico/EsqueciSenha';
import { Entrar } from '@/pages/publico/Entrar';
import { RedefinirSenha } from '@/pages/publico/RedefinirSenha';

const provisoria = (titulo: string) => <TelaProvisoria titulo={titulo} />;

export const roteador = createBrowserRouter([
  {
    element: <RotaVisitante />,
    children: [
      {
        element: <LayoutPublico />,
        children: [
          { path: '/', element: <BoasVindas /> },
          { path: '/cadastro', element: <Cadastro /> },
          { path: '/entrar', element: <Entrar /> },
          { path: '/esqueci-senha', element: <EsqueciSenha /> },
        ],
      },
    ],
  },
  {
    element: <RotaJovem />,
    children: [
      {
        element: <LayoutFoco />,
        children: [
          { path: '/pre-teste', element: <PreTeste /> },
          { path: '/pos-teste', element: provisoria('T06 Pós-teste') },
          { path: '/trilhas/:trilha/licoes/:licao', element: <Licao /> },
          { path: '/trilhas/:trilha/licoes/:licao/quiz', element: <Quiz /> },
          { path: '/trilhas/:trilha/licoes/:licao/resultado', element: <ResultadoQuiz /> },
        ],
      },
      {
        element: <LayoutJovem />,
        children: [
          { path: '/inicio', element: <Inicio />, handle: { saudacao: true } },
          { path: '/trilhas', element: <Trilhas />, handle: { titulo: 'Trilhas' } },
          { path: '/trilhas/:trilha', element: <Trilha />, handle: { titulo: 'Trilha' } },
          { path: '/simuladores', handle: { titulo: 'Simuladores' }, lazy: async () => ({ Component: (await import('@/pages/jovem/Simuladores')).Simuladores }) },
          { path: '/simuladores/juros-compostos', handle: { titulo: 'Juros compostos' }, lazy: async () => ({ Component: (await import('@/pages/jovem/JurosCompostos')).JurosCompostos }) },
          { path: '/simuladores/cartao-de-credito', handle: { titulo: 'Fatura do cartão' }, lazy: async () => ({ Component: (await import('@/pages/jovem/FaturaCartao')).FaturaCartao }) },
          { path: '/ranking', element: provisoria('T16 Ranking'), handle: { titulo: 'Ranking' } },
          { path: '/conquistas', element: provisoria('T17 Conquistas'), handle: { titulo: 'Conquistas' } },
          { path: '/notificacoes', element: provisoria('T18 Notificações'), handle: { titulo: 'Notificações' } },
          { path: '/perfil', element: <Perfil />, handle: { titulo: 'Perfil' } },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <RotaAdmin />,
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          { index: true, element: provisoria('T20 Visão geral') },
          { path: 'questoes', element: provisoria('T21 Banco de questões') },
          { path: 'parametros', element: provisoria('T22 Parâmetros') },
          { path: 'exportar', element: provisoria('T23 Exportar dados') },
        ],
      },
    ],
  },
  // Fora das regras de acesso: o link do e-mail de recuperação abre uma sessão de recuperação.
  { path: '/redefinir-senha', element: <RedefinirSenha /> },
  { path: '*', element: <NaoEncontrada /> },
]);
