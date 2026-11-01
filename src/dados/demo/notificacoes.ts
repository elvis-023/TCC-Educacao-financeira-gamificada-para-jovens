import type { Notificacao } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';
import { ID_ALEX } from './usuarios';

export function criarNotificacoes(agora: Date): Notificacao[] {
  return [
    { id: 'demo-notif-1', usuarioId: ID_ALEX, tipo: 'conquista', mensagem: 'Você ganhou a conquista Primeira Trilha!', link: '/conquistas', dataEnvio: instanteRelativo(agora, 2, 19, 13), lida: true },
    { id: 'demo-notif-2', usuarioId: ID_ALEX, tipo: 'sistema', mensagem: 'Nova trilha disponível: Inflação e Investimentos.', link: '/trilhas/inflacao-e-investimentos', dataEnvio: instanteRelativo(agora, 3, 9, 0), lida: true },
    { id: 'demo-notif-3', usuarioId: ID_ALEX, tipo: 'sistema', mensagem: 'Faltam 3 dias para a conquista Sequência de 7 dias. Continue estudando!', link: '/conquistas', dataEnvio: instanteRelativo(agora, 1, 20, 5), lida: false },
  ];
}
