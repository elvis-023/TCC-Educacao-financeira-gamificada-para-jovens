import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMetricasPesquisa } from '@/hooks/dados/useAdmin';
import { formatarData, formatarPercentualInteiro, formatarPontosPercentuais } from '@/lib/formatacao';
import { percentualDeAcerto, TOTAL_PERGUNTAS } from '@/regras/pesquisa';

const nota = (n: number | null) => (n === null ? '—' : `${n}/${TOTAL_PERGUNTAS} (${formatarPercentualInteiro(percentualDeAcerto(n, TOTAL_PERGUNTAS))})`);
const data = (d: string | null) => (d ? formatarData(d) : '—');

export function VisaoGeral() {
  const { data: m, isPending, isError } = useMetricasPesquisa();

  if (isPending) {
    return (
      <div className="space-y-4" aria-label="Carregando métricas">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }
  if (isError || !m) return <p role="alert">Não foi possível carregar as métricas. Tente de novo.</p>;

  const cartoes = [
    { rotulo: 'Participantes', valor: String(m.participantes) },
    { rotulo: 'Pré-testes concluídos', valor: String(m.preConcluidos) },
    { rotulo: 'Pós-testes concluídos', valor: String(m.posConcluidos) },
  ];
  const dadosGrafico = m.porPergunta.map((p) => ({ nome: `P${p.numero}`, pre: Math.round(p.pre), pos: Math.round(p.pos) }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cartoes.map((c) => (
          <Card key={c.rotulo}>
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">{c.rotulo}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold tabular-nums">{c.valor}</p></CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Ganho observado médio</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{m.ganhoMedio === null ? '—' : formatarPontosPercentuais(m.ganhoMedio, 1)}</p>
            {m.ganhoMedio !== null && <p className="text-sm text-muted-foreground tabular-nums">n = {m.nPares}</p>}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2 rounded-xl border p-4" aria-labelledby="grafico-titulo">
        <h2 id="grafico-titulo" className="font-semibold">Acerto por pergunta — participantes com os dois testes (n = {m.nPares})</h2>
        {m.nPares === 0 ? (
          <p className="text-muted-foreground">Ainda não há participantes com os dois testes concluídos.</p>
        ) : (
          <div className="h-72 w-full" role="img" aria-label={`Acerto por pergunta, pré e pós: ${dadosGrafico.map((d) => `${d.nome} ${d.pre}% e ${d.pos}%`).join('; ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" />
                <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                <Legend />
                <Bar dataKey="pre" name="Pré-teste (Forma A)" fill="var(--muted-foreground)" isAnimationActive={false}>
                  <LabelList dataKey="pre" position="top" formatter={(v) => `${v}%`} />
                </Bar>
                <Bar dataKey="pos" name="Pós-teste (Forma B)" fill="var(--primary)" isAnimationActive={false}>
                  <LabelList dataKey="pos" position="top" formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="space-y-2" aria-labelledby="tabela-titulo">
        <h2 id="tabela-titulo" className="font-semibold">Participantes (só pseudônimo)</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pseudônimo</TableHead><TableHead>Data do pré</TableHead><TableHead>Nota do pré</TableHead><TableHead>Data do pós</TableHead><TableHead>Nota do pós</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {m.participantesTabela.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nenhum teste concluído ainda.</TableCell></TableRow>}
            {m.participantesTabela.map((p) => (
              <TableRow key={p.pseudonimo}>
                <TableCell className="font-mono">{p.pseudonimo}</TableCell>
                <TableCell className="tabular-nums">{data(p.preData)}</TableCell>
                <TableCell className="tabular-nums">{nota(p.preNota)}</TableCell>
                <TableCell className="tabular-nums">{data(p.posData)}</TableCell>
                <TableCell className="tabular-nums">{nota(p.posNota)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <p className="text-sm text-muted-foreground">Sem grupo de controle: o número mostra o ganho observado, não o efeito do aplicativo.</p>
    </div>
  );
}
