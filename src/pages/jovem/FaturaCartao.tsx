import { zodResolver } from '@hookform/resolvers/zod';
import { Scale } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { Bar, BarChart, CartesianGrid, Legend, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { z } from 'zod';
import { AvisoEducativo } from '@/components/AvisoEducativo';
import { CampoFormulario } from '@/components/CampoFormulario';
import { CampoMoeda } from '@/components/CampoMoeda';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EntradaFatura } from '@/dados/tipos';
import { useSalvarSimulacao } from '@/hooks/dados/useSimulacoes';
import { formatarDecimal, formatarMoeda, formatarMoedaCompacta, formatarPercentual } from '@/lib/formatacao';
import { AVISO_FATURA, simularFatura, type ResultadoFatura } from '@/regras/simuladores';
import { esquemaFatura, paraEntradaFatura, type FormularioFatura } from './esquemasSimuladores';

const VALORES_INICIAIS: FormularioFatura = {
  valorFatura: null as unknown as number,
  pagamentoMinimo: null as unknown as number,
  taxaRotativo: '',
  taxaParcelamento: '',
  parcelas: 12,
};

interface Calculo { entrada: EntradaFatura; resultado: ResultadoFatura }

function paraFormulario(e: EntradaFatura): FormularioFatura {
  return {
    valorFatura: e.valorFatura, pagamentoMinimo: e.pagamentoMinimo, taxaRotativo: formatarDecimal(e.taxaRotativoPercentual),
    taxaParcelamento: formatarDecimal(e.taxaParcelamentoPercentual), parcelas: e.parcelas,
  };
}

const OPCOES_PARCELAS = Array.from({ length: 23 }, (_, i) => i + 2);

export function FaturaCartao() {
  const { state } = useLocation() as { state: { parametros?: EntradaFatura } | null };
  const salvar = useSalvarSimulacao();
  // Reabrir uma simulação vinda da lista da T13: preenche os campos e mostra o resultado, sem salvar de novo.
  const reaberta = state?.parametros;
  const [calculo, setCalculo] = useState<Calculo | null>(() => (reaberta ? { entrada: reaberta, resultado: simularFatura(reaberta) } : null));

  const { control, register, handleSubmit, reset, formState: { errors } } =
    useForm<FormularioFatura, unknown, z.output<typeof esquemaFatura>>({
      resolver: zodResolver(esquemaFatura),
      mode: 'onSubmit',
      defaultValues: reaberta ? paraFormulario(reaberta) : VALORES_INICIAIS,
    });

  function simular(valores: z.output<typeof esquemaFatura>) {
    const entrada = paraEntradaFatura(valores);
    const resultado = simularFatura(entrada);
    setCalculo({ entrada, resultado });
    salvar.mutate({ tipoSimulacao: 'cartao_credito', parametros: entrada, resultadoFinal: resultado.pagandoMinimo.totalPago });
  }

  function limpar() {
    reset(VALORES_INICIAIS);
    setCalculo(null);
  }

  const entrada = calculo?.entrada;
  const resultado = calculo?.resultado;
  const dadosGrafico = entrada && resultado
    ? [
        { cenario: 'Pagando o total', rotuloCurto: 'Total', fatura: entrada.valorFatura, juros: resultado.pagandoTotal.juros },
        { cenario: 'Pagando só o mínimo', rotuloCurto: 'Só o mínimo', fatura: entrada.valorFatura, juros: resultado.pagandoMinimo.juros },
      ]
    : [];

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Fatura do cartão</h1>
      <p className="text-sm text-muted-foreground">Use valores de exemplo. O app nunca pede dados do seu cartão.</p>

      <form onSubmit={handleSubmit(simular, () => setCalculo(null))} noValidate className="space-y-4">
        <CampoFormulario id="valorFatura" rotulo="Valor total da fatura (R$)" erro={errors.valorFatura?.message}>
          {(p) => (
            <Controller
              control={control}
              name="valorFatura"
              render={({ field }) => <CampoMoeda {...p} placeholder="0,00" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
            />
          )}
        </CampoFormulario>

        <CampoFormulario id="pagamentoMinimo" rotulo="Valor do pagamento mínimo (R$)" erro={errors.pagamentoMinimo?.message}>
          {(p) => (
            <Controller
              control={control}
              name="pagamentoMinimo"
              render={({ field }) => <CampoMoeda {...p} placeholder="0,00" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
            />
          )}
        </CampoFormulario>

        <CampoFormulario id="taxaRotativo" rotulo="Taxa do rotativo (% ao mês)" erro={errors.taxaRotativo?.message}>
          {(p) => <Input {...p} inputMode="decimal" className="tabular-nums" placeholder="Ex.: 15,00" {...register('taxaRotativo')} />}
        </CampoFormulario>

        <CampoFormulario id="taxaParcelamento" rotulo="Taxa do parcelamento (% ao mês)" erro={errors.taxaParcelamento?.message}>
          {(p) => <Input {...p} inputMode="decimal" className="tabular-nums" placeholder="Ex.: 9,00" {...register('taxaParcelamento')} />}
        </CampoFormulario>

        <CampoFormulario id="parcelas" rotulo="Número de parcelas" erro={errors.parcelas?.message}>
          {(p) => (
            <Controller
              control={control}
              name="parcelas"
              render={({ field }) => (
                <Select value={field.value === undefined || field.value === null ? '' : String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger {...p} className="w-full tabular-nums"><SelectValue placeholder="Escolha" /></SelectTrigger>
                  <SelectContent>
                    {OPCOES_PARCELAS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </CampoFormulario>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">Simular</Button>
          <Button type="button" variant="outline" onClick={limpar}>Limpar</Button>
        </div>
      </form>

      <AvisoEducativo texto={AVISO_FATURA} />

      {entrada && resultado && (
        <div className="space-y-4" aria-live="polite">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Pagando o total</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <p className="text-lg font-semibold tabular-nums">{formatarMoeda(resultado.pagandoTotal.totalPago)}</p>
                <p className="text-sm tabular-nums">Juros: {formatarMoeda(resultado.pagandoTotal.juros)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Pagando só o mínimo</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <p className="text-lg font-semibold tabular-nums">{formatarMoeda(resultado.pagandoMinimo.totalPago)}</p>
                <p className="text-sm tabular-nums">Juros: {formatarMoeda(resultado.pagandoMinimo.juros)}</p>
              </CardContent>
            </Card>
          </div>

          <p className="rounded-lg border border-erro/40 bg-erro-fundo p-3 font-medium text-erro">
            Pagar só o mínimo custa <span className="tabular-nums">{formatarMoeda(resultado.custoExtra)}</span> a mais.
          </p>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg border p-3 text-sm">
            <dt className="text-muted-foreground">Juros do rotativo (1 mês)</dt>
            <dd className="text-right tabular-nums">{formatarMoeda(resultado.pagandoMinimo.jurosRotativo)}</dd>
            <dt className="text-muted-foreground">Saldo parcelado</dt>
            <dd className="text-right tabular-nums">{formatarMoeda(resultado.pagandoMinimo.saldoParcelado)}</dd>
            <dt className="text-muted-foreground">{entrada.parcelas} parcelas de</dt>
            <dd className="text-right tabular-nums">{formatarMoeda(resultado.pagandoMinimo.parcela)}</dd>
          </dl>

          {resultado.tetoAplicado && (
            <div role="note" className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
              <Scale aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                Teto legal aplicado: os juros foram limitados a 100% do saldo que foi para o rotativo (Lei nº 14.690/2023).
                A taxa do parcelamento caiu de {formatarPercentual(entrada.taxaParcelamentoPercentual)} para {formatarPercentual(resultado.taxaParcelamentoEfetiva * 100)} ao mês.
              </p>
            </div>
          )}

          <div
            role="img"
            aria-label={`Pagando o total: ${formatarMoeda(resultado.pagandoTotal.totalPago)}, sem juros. Pagando só o mínimo: ${formatarMoeda(resultado.pagandoMinimo.totalPago)}, sendo ${formatarMoeda(resultado.pagandoMinimo.juros)} de juros.`}
            className="h-64 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="rotuloCurto" interval={0} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => formatarMoedaCompacta(v)} width={64} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(valor) => formatarMoeda(Number(valor))}
                  contentStyle={{ background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Bar dataKey="fatura" name="Valor da fatura" stackId="total" fill="var(--primary)">
                  <LabelList dataKey="fatura" position="center" fill="var(--primary-foreground)" fontSize={11} formatter={(v) => formatarMoeda(Number(v))} />
                </Bar>
                <Bar dataKey="juros" name="Juros" stackId="total" fill="var(--erro)">
                  <LabelList dataKey="juros" position="center" fill="var(--primary-foreground)" fontSize={11} formatter={(v) => (Number(v) > 0 ? formatarMoeda(Number(v)) : '')} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Pagamento</TableHead>
                  <TableHead className="text-right">Juros do mês</TableHead>
                  <TableHead className="text-right">Saldo devedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.tabela.map((linha) => (
                  <TableRow key={linha.mes}>
                    <TableCell className="tabular-nums">{linha.mes}</TableCell>
                    <TableCell>{linha.situacao}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatarMoeda(linha.pagamento)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatarMoeda(linha.juros)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatarMoeda(linha.saldo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Os valores são arredondados só na exibição; a soma das parcelas exibidas pode diferir do total em alguns centavos.
          </p>
        </div>
      )}
    </section>
  );
}
