import { createBrowserRouter } from 'react-router';
import { RotaAdmin, RotaJovem, RotaVisitante } from '@/app/guardas';
import { LayoutAdmin } from '@/layouts/LayoutAdmin';
import { LayoutFoco } from '@/layouts/LayoutFoco';
import { LayoutJovem } from '@/layouts/LayoutJovem';
import { LayoutPublico } from '@/layouts/LayoutPublico';
import { ErroInesperado } from '@/pages/ErroInesperado';
import { NaoEncontrada } from '@/pages/NaoEncontrada';
import { Conquistas } from '@/pages/jovem/Conquistas';
import { Inicio } from '@/pages/jovem/Inicio';
import { Licao } from '@/pages/jovem/Licao';
import { Notificacoes } from '@/pages/jovem/Notificacoes';
import { Perfil } from '@/pages/jovem/Perfil';
import { PosTeste } from '@/pages/jovem/PosTeste';
import { PreTeste } from '@/pages/jovem/PreTeste';
import { Quiz } from '@/pages/jovem/Quiz';
import { Ranking } from '@/pages/jovem/Ranking';
import { ResultadoQuiz } from '@/pages/jovem/ResultadoQuiz';
import { Trilha } from '@/pages/jovem/Trilha';
import { Trilhas } from '@/pages/jovem/Trilhas';
import { BoasVindas } from '@/pages/publico/BoasVindas';
import { Cadastro } from '@/pages/publico/Cadastro';
import { EsqueciSenha } from '@/pages/publico/EsqueciSenha';
import { Entrar } from '@/pages/publico/Entrar';
import { RedefinirSenha } from '@/pages/publico/RedefinirSenha';

export const roteador = createBrowserRouter([
  {
    element: <RotaVisitante />,
    errorElement: <ErroInesperado />,
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
    errorElement: <ErroInesperado />,
    children: [
      {
        element: <LayoutFoco />,
        children: [
          { path: '/pre-teste', element: <PreTeste /> },
          { path: '/pos-teste', element: <PosTeste /> },
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
          { path: '/ranking', element: <Ranking />, handle: { titulo: 'Ranking' } },
          { path: '/conquistas', element: <Conquistas />, handle: { titulo: 'Conquistas' } },
          { path: '/notificacoes', element: <Notificacoes />, handle: { titulo: 'Notificações' } },
          { path: '/perfil', element: <Perfil />, handle: { titulo: 'Perfil' } },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <RotaAdmin />,
    errorElement: <ErroInesperado />,
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          { index: true, handle: { titulo: 'Visão geral' }, lazy: async () => ({ Component: (await import('@/pages/admin/VisaoGeral')).VisaoGeral }) },
          { path: 'questoes', handle: { titulo: 'Banco de questões' }, lazy: async () => ({ Component: (await import('@/pages/admin/BancoQuestoes')).BancoQuestoes }) },
          { path: 'parametros', handle: { titulo: 'Parâmetros' }, lazy: async () => ({ Component: (await import('@/pages/admin/Parametros')).Parametros }) },
          { path: 'exportar', handle: { titulo: 'Exportar dados' }, lazy: async () => ({ Component: (await import('@/pages/admin/ExportarDados')).ExportarDados }) },
        ],
      },
    ],
  },
  // Fora das regras de acesso: o link do e-mail de recuperação abre uma sessão de recuperação.
  { path: '/redefinir-senha', element: <RedefinirSenha /> },
  { path: '*', element: <NaoEncontrada /> },
]);
