import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MODO_DADOS } from '@/dados/repositorios';
import { useExportacao } from '@/hooks/dados/useAdmin';
import { baixarArquivo, gerarCsv } from '@/lib/csv';
import { diaNoFuso } from '@/lib/fuso';
import { agora } from '@/lib/relogio';

const COLUNAS = ['id_pseudonimizado', 'tipo_teste', 'forma', 'versao', 'data', 'pergunta', 'resposta_marcada', 'acerto', 'nota_total'];

export function ExportarDados() {
  const { data: linhas, isPending, isError } = useExportacao();

  if (isPending) return <Skeleton className="h-64 w-full rounded-xl" aria-label="Carregando dados" />;
  if (isError || !linhas) return <p role="alert">Não foi possível carregar os dados. Tente de novo.</p>;
  if (linhas.length === 0) return <p>Ainda não há respostas para exportar.</p>;

  function baixar() {
    // O sufixo marca de onde vêm os dados; no projeto de produção ele sai (PRD 8.8).
    const sufixo = MODO_DADOS === 'local' ? 'demonstracao' : 'contas-de-teste';
    const csv = gerarCsv(COLUNAS, linhas!.map((l) => [l.idPseudonimizado, l.tipoTeste, l.forma, l.versao, l.data, l.pergunta, l.respostaMarcada, l.acerto, l.notaTotal]));
    baixarArquivo(`respostas-testes-${sufixo}-${diaNoFuso(agora())}.csv`, csv);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Uma linha por pergunta respondida, só com o id pseudonimizado (sem nome nem e-mail). Arquivo CSV com separador ponto e vírgula, em UTF-8.
      </p>
      <p className="font-medium tabular-nums">{linhas.length} linhas</p>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader><TableRow>{COLUNAS.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {linhas.slice(0, 20).map((l, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono">{l.idPseudonimizado}</TableCell><TableCell>{l.tipoTeste}</TableCell><TableCell>{l.forma}</TableCell>
                <TableCell>{l.versao}</TableCell><TableCell className="tabular-nums">{l.data}</TableCell><TableCell>{l.pergunta}</TableCell>
                <TableCell>{l.respostaMarcada}</TableCell><TableCell>{l.acerto}</TableCell><TableCell>{l.notaTotal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {linhas.length > 20 && <p className="text-sm text-muted-foreground">Prévia das 20 primeiras linhas.</p>}
      <Button onClick={baixar}><Download aria-hidden="true" />Baixar CSV</Button>
    </div>
  );
}
