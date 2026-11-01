import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

// A próxima questão não é uma consulta em cache (o sorteio mudaria a cada nova busca): a tela chama o repositório direto.
export function useResponder(quizId: string) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ questaoId, alternativa }: { questaoId: string; alternativa: number }) => repositorios.quiz.responder(quizId, questaoId, alternativa),
    onSuccess: () =>
      Promise.all([chaves.usuario, chaves.progresso, chaves.respostas, chaves.ranking, chaves.conquistas, chaves.notificacoes].map((chave) =>
        cliente.invalidateQueries({ queryKey: chave }),
      )),
  });
}
