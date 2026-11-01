import { useState } from 'react';
import { toast } from 'sonner';
import { CampoFormulario } from '@/components/CampoFormulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ChaveParametro } from '@/dados/tipos';
import { useHistoricoParametros, useParametrosAtuais, useSalvarParametros } from '@/hooks/dados/useAdmin';
import { formatarDataHora, paraNumero } from '@/lib/formatacao';
import { validarParametros } from '@/regras/parametros';

const CAMPOS: { chave: ChaveParametro; rotulo: string; unidade: string; ajuda: string }[] = [
  { chave: 'limite_inatividade_horas', rotulo: 'Limite de inatividade', unidade: 'horas', ajuda: 'Depois disso sem acesso, o jovem recebe um lembrete (de 1 a 720).' },
  { chave: 'janela_motor', rotulo: 'Janela do motor adaptativo', unidade: 'respostas', ajuda: 'Quantas respostas recentes entram no cálculo do nível (de 3 a 20).' },
  { chave: 'limiar_subida', rotulo: 'Limiar de subida', unidade: '%', ajuda: 'Acertos na janela a partir dos quais o nível sobe (de 1 a 100).' },
  { chave: 'limiar_descida', rotulo: 'Limiar de descida', unidade: '%', ajuda: 'Acertos na janela até os quais o nível desce (de 0 a 99).' },
];

const ROTULO = Object.fromEntries(CAMPOS.map((c) => [c.chave, c.rotulo])) as Record<ChaveParametro, string>;

export function Parametros() {
  const atuais = useParametrosAtuais();
  const historico = useHistoricoParametros();
  const salvar = useSalvarParametros();
  const [texto, setTexto] = useState<Partial<Record<ChaveParametro, string>>>({});
  const [erros, setErros] = useState<Partial<Record<ChaveParametro, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  if (atuais.isPending) return <Skeleton className="h-72 w-full rounded-xl" aria-label="Carregando parâmetros" />;
  if (atuais.isError || !atuais.data) return <p role="alert">Não foi possível carregar os parâmetros. Tente de novo.</p>;

  const valorDoCampo = (chave: ChaveParametro) => texto[chave] ?? String(atuais.data![chave]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral(null);
    const valores = Object.fromEntries(CAMPOS.map((c) => [c.chave, paraNumero(valorDoCampo(c.chave)) ?? Number.NaN])) as Record<ChaveParametro, number>;
    const encontrados = validarParametros(valores);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    try {
      await salvar.mutateAsync(valores);
      setTexto({});
      toast.success('Parâmetros salvos. O quiz já usa os novos valores.');
    } catch (erro) {
      setErroGeral(erro instanceof Error ? erro.message : 'Não foi possível salvar');
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={enviar} noValidate className="max-w-md space-y-4">
        {CAMPOS.map((c) => (
          <CampoFormulario key={c.chave} id={c.chave} rotulo={`${c.rotulo} (${c.unidade})`} erro={erros[c.chave]} ajuda={c.ajuda}>
            {(p) => <Input {...p} inputMode="decimal" value={valorDoCampo(c.chave)} onChange={(e) => setTexto((t) => ({ ...t, [c.chave]: e.target.value }))} />}
          </CampoFormulario>
        ))}
        {erroGeral && <p role="alert" className="rounded-lg border border-erro/40 bg-erro-fundo p-3 text-sm text-erro">{erroGeral}</p>}
        <Button type="submit" disabled={salvar.isPending}>Salvar</Button>
      </form>

      <section className="space-y-2" aria-labelledby="historico-titulo">
        <h2 id="historico-titulo" className="font-semibold">Histórico de alterações</h2>
        {historico.isPending ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Data e hora</TableHead><TableHead>Autor</TableHead><TableHead>Parâmetro</TableHead><TableHead>Valor anterior</TableHead><TableHead>Novo valor</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(historico.data ?? []).map((l, i) => (
                  <TableRow key={`${l.chave}-${l.alteradoEm}-${i}`}>
                    <TableCell className="tabular-nums">{formatarDataHora(l.alteradoEm)}</TableCell>
                    <TableCell>{l.autor}</TableCell>
                    <TableCell>{ROTULO[l.chave]}</TableCell>
                    <TableCell className="tabular-nums">{l.valorAnterior ?? '—'}</TableCell>
                    <TableCell className="tabular-nums">{l.valor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
