import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarData, formatarPercentualInteiro, formatarPontosPercentuais } from '@/lib/formatacao';
import { useEstadoTesteFinal, TOTAL_TRILHAS } from '@/hooks/useEstadoTesteFinal';
import { diferencaPp, percentualDeAcerto, TOTAL_PERGUNTAS } from '@/regras/pesquisa';

const notaTexto = (nota: number) => `${nota} de ${TOTAL_PERGUNTAS} (${formatarPercentualInteiro(percentualDeAcerto(nota, TOTAL_PERGUNTAS))})`;

/** "Meus testes" do Perfil (PRD 2.11): teste inicial e teste final, nunca quais perguntas foram acertadas. */
export function ResumoTestes() {
  const { carregando, estado, trilhasConcluidas, pre, pos } = useEstadoTesteFinal();
  if (carregando) return <Skeleton className="h-28 w-full rounded-xl" />;

  return (
    <section className="space-y-3 rounded-xl border p-4" aria-labelledby="meus-testes">
      <h2 id="meus-testes" className="font-semibold">Meus testes</h2>
      <div>
        <p className="text-sm text-muted-foreground">Teste inicial</p>
        {pre?.concluidoEm && pre.pontuacaoTotal !== null ? (
          <p className="tabular-nums">{notaTexto(pre.pontuacaoTotal)} · {formatarData(pre.concluidoEm)}</p>
        ) : (
          <p>Pendente</p>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Teste final</p>
        {estado === 'concluido' && pos?.concluidoEm && pos.pontuacaoTotal !== null && pre?.pontuacaoTotal != null ? (
          <div className="space-y-1">
            <p className="tabular-nums">{notaTexto(pos.pontuacaoTotal)} · {formatarData(pos.concluidoEm)}</p>
            <p className="font-medium tabular-nums">
              Diferença: {formatarPontosPercentuais(diferencaPp(pre.pontuacaoTotal, pos.pontuacaoTotal, TOTAL_PERGUNTAS))}
            </p>
          </div>
        ) : estado === 'bloqueado' ? (
          <p className="tabular-nums">Liberado depois das {TOTAL_TRILHAS} trilhas: {trilhasConcluidas} de {TOTAL_TRILHAS}</p>
        ) : (
          <div className="space-y-2">
            <p>Liberado</p>
            <Button asChild size="sm"><Link to="/pos-teste">Fazer agora</Link></Button>
          </div>
        )}
      </div>
    </section>
  );
}
