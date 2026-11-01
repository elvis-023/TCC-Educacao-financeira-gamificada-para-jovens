import { ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarPontosPercentuais } from '@/lib/formatacao';
import { TOTAL_TRILHAS, useEstadoTesteFinal } from '@/hooks/useEstadoTesteFinal';
import { diferencaPp, TOTAL_PERGUNTAS } from '@/regras/pesquisa';

/** 5º card do Início (PRD T07): teste final bloqueado, liberado ou concluído. */
export function CardTesteFinal() {
  const { carregando, estado, trilhasConcluidas, pre, pos } = useEstadoTesteFinal();
  if (carregando) return <Skeleton className="h-32 w-full rounded-3xl" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ClipboardCheck aria-hidden="true" className="size-5 text-primary" />Teste final</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {estado === 'bloqueado' && (
          <>
            <p>Conclua as {TOTAL_TRILHAS} trilhas: <span className="tabular-nums">{trilhasConcluidas} de {TOTAL_TRILHAS}</span></p>
            <Progress value={(trilhasConcluidas / TOTAL_TRILHAS) * 100} aria-label={`${trilhasConcluidas} de ${TOTAL_TRILHAS} trilhas concluídas`} />
          </>
        )}
        {(estado === 'liberado' || estado === 'liberado_demo') && (
          <Button asChild><Link to="/pos-teste">Fazer o teste final</Link></Button>
        )}
        {estado === 'concluido' && pre?.pontuacaoTotal != null && pos?.pontuacaoTotal != null && (
          <p className="font-medium tabular-nums">
            Sua evolução: {formatarPontosPercentuais(diferencaPp(pre.pontuacaoTotal, pos.pontuacaoTotal, TOTAL_PERGUNTAS))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
