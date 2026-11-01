import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { PerguntaTeste } from '@/components/PerguntaTeste';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { PerguntaPublica, ResumoTeste } from '@/dados/tipos';
import { useIniciarTeste, useResponderPergunta } from '@/hooks/dados/useTestes';
import { TOTAL_TRILHAS, useEstadoTesteFinal } from '@/hooks/useEstadoTesteFinal';
import { formatarData, formatarPercentualInteiro, formatarPontosPercentuais } from '@/lib/formatacao';
import { diferencaPp, percentualDeAcerto, TOTAL_PERGUNTAS } from '@/regras/pesquisa';

export function PosTeste() {
  const { carregando, estado, trilhasConcluidas, pre, pos } = useEstadoTesteFinal();

  if (carregando) {
    return (
      <div className="space-y-3" aria-label="Carregando teste final">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (estado === 'bloqueado') {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Conclua as {TOTAL_TRILHAS} trilhas para liberar o teste final</h1>
        <p className="tabular-nums">{trilhasConcluidas} de {TOTAL_TRILHAS} trilhas concluídas</p>
        <Progress value={(trilhasConcluidas / TOTAL_TRILHAS) * 100} aria-label={`${trilhasConcluidas} de ${TOTAL_TRILHAS} trilhas concluídas`} />
        <Button asChild size="lg" className="w-full"><Link to="/trilhas">Ver trilhas</Link></Button>
      </section>
    );
  }
  if (estado === 'concluido' && pre && pos) return <ResultadoTestes pre={pre} pos={pos} />;
  return <TesteFinalLiberado pelaDemonstracao={estado === 'liberado_demo'} />;
}

function TesteFinalLiberado({ pelaDemonstracao }: { pelaDemonstracao: boolean }) {
  const iniciar = useIniciarTeste();
  const responder = useResponderPergunta();
  const [perguntas, setPerguntas] = useState<PerguntaPublica[] | null>(null);
  const [indice, setIndice] = useState(0);

  async function comecar() {
    try {
      const aberto = await iniciar.mutateAsync('pos');
      const primeiraSemResposta = aberto.perguntas.findIndex((p) => !aberto.respondidas.includes(p.id));
      setPerguntas(aberto.perguntas);
      setIndice(Math.max(primeiraSemResposta, 0));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível abrir o teste');
    }
  }

  async function confirmar(alternativa: number) {
    if (!perguntas) return;
    try {
      // Ao concluir, o estado vira "concluído" e a tela passa a mostrar o resultado.
      const { concluido } = await responder.mutateAsync({ tipo: 'pos', perguntaId: perguntas[indice].id, alternativa });
      if (!concluido) setIndice((n) => n + 1);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível registrar a resposta');
    }
  }

  if (perguntas?.[indice]) {
    return <PerguntaTeste key={perguntas[indice].id} pergunta={perguntas[indice]} total={perguntas.length} enviando={responder.isPending} onConfirmar={confirmar} />;
  }
  return (
    <section className="space-y-4">
      {pelaDemonstracao && <Badge variant="outline">Liberado pela ferramenta de demonstração</Badge>}
      <h1 className="text-2xl font-semibold">Teste final</h1>
      <p>
        São {TOTAL_PERGUNTAS} perguntas e levam cerca de 2 minutos. Elas não valem XP e não existe nota boa ou ruim: servem para medir
        o quanto você aprendeu com o app.
      </p>
      <p className="text-muted-foreground">Se não souber, marque Não sei. Isso ajuda a pesquisa.</p>
      <Button size="lg" className="w-full" onClick={comecar} disabled={iniciar.isPending}>Começar</Button>
      <Button asChild variant="ghost" className="w-full"><Link to="/inicio">Voltar ao início</Link></Button>
    </section>
  );
}

function ResultadoTestes({ pre, pos }: { pre: ResumoTeste; pos: ResumoTeste }) {
  const notaPre = pre.pontuacaoTotal ?? 0;
  const notaPos = pos.pontuacaoTotal ?? 0;
  const pctPre = percentualDeAcerto(notaPre, TOTAL_PERGUNTAS);
  const pctPos = percentualDeAcerto(notaPos, TOTAL_PERGUNTAS);
  const barra = (rotulo: string, nota: number, pct: number, data: string | null) => (
    <div className="space-y-1">
      <p className="tabular-nums">{rotulo}: {nota} de {TOTAL_PERGUNTAS} ({formatarPercentualInteiro(pct)}){data ? ` · ${formatarData(data)}` : ''}</p>
      <div className="h-3 w-full rounded-full bg-muted" role="img" aria-label={`${rotulo}: ${formatarPercentualInteiro(pct)}`}>
        <div className="h-3 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Seu resultado</h1>
      {barra('Teste inicial', notaPre, pctPre, pre.concluidoEm)}
      {barra('Teste final', notaPos, pctPos, pos.concluidoEm)}
      <p className="text-xl font-semibold tabular-nums">Diferença: {formatarPontosPercentuais(diferencaPp(notaPre, notaPos, TOTAL_PERGUNTAS))}</p>
      <p className="text-muted-foreground">Este número mostra a sua evolução entre os dois testes.</p>
      <Button asChild size="lg" className="w-full"><Link to="/inicio">Voltar ao início</Link></Button>
    </section>
  );
}
