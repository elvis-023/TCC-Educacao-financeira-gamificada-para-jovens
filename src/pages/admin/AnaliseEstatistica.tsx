import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExportacao } from '@/hooks/dados/useAdmin';
import { ALFA, analisarPrePos, type Resumo } from '@/regras/estatistica';

const numero = (valor: number, casas = 2) => valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const valorP = (p: number) => (p < 0.001 ? '< 0,001' : numero(p, 3));
const resumo = (r: Resumo) => `${numero(r.mediana, 1)} (${numero(r.q1, 1)} a ${numero(r.q3, 1)})`;

/** Protocolo do artigo (3.3): Wilcoxon unilateral, r = Z/√N e McNemar por pergunta, só com quem fez os dois testes. */
export function AnaliseEstatistica() {
  const { data: linhas, isPending, isError } = useExportacao();

  return (
    <section className="space-y-3 rounded-xl border p-4" aria-labelledby="analise-titulo">
      <h2 id="analise-titulo" className="font-semibold">Análise estatística do protocolo</h2>
      {isPending && <Skeleton className="h-32 w-full rounded-xl" />}
      {isError && <p role="alert">Não foi possível carregar as respostas para a análise.</p>}
      {linhas && (() => {
        const a = analisarPrePos(linhas);
        if (!a) return <p className="text-muted-foreground">Ainda não há participantes com os dois testes concluídos.</p>;
        const w = a.wilcoxon;
        return (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-muted-foreground">Pares (pré e pós)</dt><dd className="numero text-xl font-semibold">{a.nPares}</dd></div>
              <div><dt className="text-muted-foreground">Nota do pré: mediana (IIQ)</dt><dd className="numero text-xl font-semibold">{resumo(a.pre)}</dd></div>
              <div><dt className="text-muted-foreground">Nota do pós: mediana (IIQ)</dt><dd className="numero text-xl font-semibold">{resumo(a.pos)}</dd></div>
              <div><dt className="text-muted-foreground">Pares com diferença ≠ 0</dt><dd className="numero text-xl font-semibold">{w ? w.nEfetivo : 0}</dd></div>
            </dl>
            {w ? (
              <p className="text-sm">
                Wilcoxon de postos sinalizados (unilateral, H1: pós &gt; pré, {w.metodo === 'exato' ? 'distribuição exata' : 'aproximação normal'}):
                {' '}W+ = {numero(w.wMais, 1)}, Z = {numero(w.z)}, p = {valorP(w.pUnilateral)}, r = {numero(w.r)}.
                {' '}{w.significativo ? `Ganho observado com p < ${numero(ALFA)}.` : `Sem ganho observado com p < ${numero(ALFA)}.`}
              </p>
            ) : (
              <p className="text-sm">Todas as diferenças entre pós e pré são zero: o teste de Wilcoxon não se aplica.</p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pergunta</TableHead><TableHead>Ganhou</TableHead><TableHead>Perdeu</TableHead><TableHead>Acertou nas duas</TableHead><TableHead>Errou nas duas</TableHead><TableHead>p de McNemar (unilateral)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.porPergunta.map((q) => (
                  <TableRow key={q.pergunta}>
                    <TableCell>P{q.pergunta}</TableCell>
                    <TableCell className="tabular-nums">{q.ganhou}</TableCell>
                    <TableCell className="tabular-nums">{q.perdeu}</TableCell>
                    <TableCell className="tabular-nums">{q.ambosAcertaram}</TableCell>
                    <TableCell className="tabular-nums">{q.ambosErraram}</TableCell>
                    <TableCell className="tabular-nums">{valorP(q.pUnilateral)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground">
              Ganhou = errou no pré e acertou no pós. Notas de 0 a 3 têm muitos empates e efeito teto, o que reduz o número efetivo de pares. Sem grupo de controle, é ganho observado, não efeito do aplicativo.
            </p>
          </>
        );
      })()}
    </section>
  );
}
