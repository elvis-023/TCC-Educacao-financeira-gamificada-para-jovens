import { useNavigate } from 'react-router';
import { repositorios } from '@/dados/repositorios';
import { useAtualizarSessao } from './useSessao';

/** Encerra a sessão e volta para o login. Usado no Perfil e no menu do administrador. */
export function useSair() {
  const navigate = useNavigate();
  const atualizarSessao = useAtualizarSessao();
  return async () => {
    await repositorios.sessao.sair();
    await atualizarSessao();
    navigate('/entrar', { replace: true });
  };
}
