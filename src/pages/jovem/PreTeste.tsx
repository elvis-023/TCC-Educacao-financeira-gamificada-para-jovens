import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { PerguntaTeste } from '@/components/PerguntaTeste';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { PerguntaPublica } from '@/dados/tipos';
import { useIniciarTeste, useMeusTestes, useResponderPergunta } from '@/hooks/dados/useTestes';
import { useSair } from '@/hooks/useSair';
import { TOTAL_PERGUNTAS } from '@/regras/pesquisa';

export function PreTeste() {
  const testes = useMeusTestes();
  if (testes.isPending) {
    return (
      <div className="space-y-3" aria-label="Carregando teste">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  // O estado só vale na abertura: ao responder a última pergunta ele muda, e o agradecimento precisa aparecer antes.
  const concluidoNaAbertura = Boolean(testes.data?.some((t) => t.tipoTeste === 'pre' && t.concluidoEm));
  return <PreTesteAberto concluidoNaAbertura={concluidoNaAbertura} />;
}

type Fase = 'introducao' | 'perguntas' | 'agradecimento';

function PreTesteAberto({ concluidoNaAbertura }: { concluidoNaAbertura: boolean }) {
  const navigate = useNavigate();
  const sair = useSair();
  const iniciar = useIniciarTeste();
  const responder = useResponderPergunta();
  const [concluidoInicial] = useState(concluidoNaAbertura);
  const [fase, setFase] = useState<Fase>('introducao');
  const [perguntas, setPerguntas] = useState<PerguntaPublica[]>([]);
  const [indice, setIndice] = useState(0);

  if (concluidoInicial) return <Navigate to="/inicio" replace />;

  async function comecar() {
    try {
      const aberto = await iniciar.mutateAsync('pre');
      const primeiraSemResposta = aberto.perguntas.findIndex((p) => !aberto.respondidas.includes(p.id));
      setPerguntas(aberto.perguntas);
      setIndice(Math.max(primeiraSemResposta, 0));
      setFase('perguntas');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível abrir o teste');
    }
  }

  async function confirmar(alternativa: number) {
    const pergunta = perguntas[indice];
    try {
      const { concluido } = await responder.mutateAsync({ tipo: 'pre', perguntaId: pergunta.id, alternativa });
      if (concluido) setFase('agradecimento');
      else setIndice((n) => n + 1);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível registrar a resposta');
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex justify-end">
        <Button type="button" variant="ghost" onClick={sair}>Sair</Button>
      </header>

      {fase === 'introducao' && (
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Antes de começar, um teste rápido</h1>
          <p>
            São {TOTAL_PERGUNTAS} perguntas e levam cerca de 2 minutos. Elas não valem XP e não existe nota boa ou ruim: servem para medir
            o quanto você aprende com o app.
          </p>
          <p className="text-muted-foreground">Se não souber, marque Não sei. Isso ajuda a pesquisa.</p>
          <Button size="lg" className="w-full" onClick={comecar} disabled={iniciar.isPending}>Começar</Button>
        </section>
      )}

      {fase === 'perguntas' && perguntas[indice] && (
        <PerguntaTeste key={perguntas[indice].id} pergunta={perguntas[indice]} total={perguntas.length} enviando={responder.isPending} onConfirmar={confirmar} />
      )}

      {fase === 'agradecimento' && (
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Agradecemos por responder! Suas trilhas estão liberadas.</h1>
          <Button size="lg" className="w-full" onClick={() => navigate('/inicio')}>Ir para o início</Button>
        </section>
      )}
    </div>
  );
}
