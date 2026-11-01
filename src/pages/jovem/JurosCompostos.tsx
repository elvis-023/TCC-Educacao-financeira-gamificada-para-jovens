import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useLocation } from 'react-router';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { z } from 'zod';
import { AvisoEducativo } from '@/components/AvisoEducativo';
import { CampoFormulario } from '@/components/CampoFormulario';
import { CampoMoeda } from '@/components/CampoMoeda';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { EntradaJuros } from '@/dados/tipos';
import { useSalvarSimulacao } from '@/hooks/dados/useSimulacoes';
import { formatarDecimal, formatarMoeda, formatarMoedaCompacta, formatarPercentual, paraNumero } from '@/lib/formatacao';
import {
  AVISO_JUROS, simularJuros, TAXA_SUGERIDA, taxaAnualEquivalente, taxaMensalEquivalente, type ResultadoJuros,
} from '@/regras/simuladores';
import { esquemaJuros, paraEntradaJuros, type FormularioJuros } from './esquemasSimuladores';

const VALORES_INICIAIS: FormularioJuros = {
  valorInicial: null as unknown as number,
  aporteMensal: null as unknown as number,
  taxa: formatarDecimal(TAXA_SUGERIDA.percentual),
  unidadeTaxa: TAXA_SUGERIDA.unidade,
  prazo: '',
  unidadePrazo: 'meses',
};

interface Calculo { entrada: EntradaJuros; resultado: ResultadoJuros }

function paraFormulario(e: EntradaJuros): FormularioJuros {
  return {
    valorInicial: e.valorInicial, aporteMensal: e.aporteMensal, taxa: formatarDecimal(e.taxaPercentual),
    unidadeTaxa: e.unidadeTaxa, prazo: String(e.prazo), unidadePrazo: e.unidadePrazo,
  };
}

function rotuloPrazo({ prazo, unidadePrazo }: EntradaJuros): string {
  const unidade = unidadePrazo === 'meses' ? (prazo === 1 ? 'mês' : 'meses') : prazo === 1 ? 'ano' : 'anos';
  return `${prazo} ${unidade}`;
}

export function JurosCompostos() {
  const { state } = useLocation() as { state: { parametros?: EntradaJuros } | null };
  const salvar = useSalvarSimulacao();
  // Reabrir uma simulação vinda da lista da T13: preenche os campos e mostra o resultado, sem salvar de novo.
  const reaberta = state?.parametros;
  const [calculo, setCalculo] = useState<Calculo | null>(() => (reaberta ? { entrada: reaberta, resultado: simularJuros(reaberta) } : null));
  const [mostrarTabela, setMostrarTabela] = useState(false);

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<FormularioJuros, unknown, z.output<typeof esquemaJuros>>({
      resolver: zodResolver(esquemaJuros),
      mode: 'onSubmit',
      defaultValues: reaberta ? paraFormulario(reaberta) : VALORES_INICIAIS,
    });

  const taxaDigitada = useWatch({ control, name: 'taxa' });
  const unidadeTaxa = useWatch({ control, name: 'unidadeTaxa' });
  const taxaNumero = paraNumero(taxaDigitada ?? '');
  const equivalencia = taxaNumero !== null && taxaNumero >= 0 && taxaNumero <= 100
    ? unidadeTaxa === 'ano'
      ? `Equivale a ${formatarPercentual(taxaMensalEquivalente(taxaNumero / 100) * 100)} ao mês`
      : `Equivale a ${formatarPercentual(taxaAnualEquivalente(taxaNumero / 100) * 100)} ao ano`
    : null;

  function calcular(valores: z.output<typeof esquemaJuros>) {
    const entrada = paraEntradaJuros(valores);
    const resultado = simularJuros(entrada);
    setCalculo({ entrada, resultado });
    salvar.mutate({ tipoSimulacao: 'juros_compostos', parametros: entrada, resultadoFinal: resultado.montante });
  }

  function mudarPrazo(prazo: number) {
    if (!calculo) return;
    const entrada = { ...calculo.entrada, prazo };
    setCalculo({ entrada, resultado: simularJuros(entrada) });
    setValue('prazo', String(prazo));
    setValue('unidadePrazo', entrada.unidadePrazo);
  }

  function limpar() {
    reset(VALORES_INICIAIS);
    setCalculo(null);
    setMostrarTabela(false);
  }

  const resultado = calculo?.resultado;
  const ultimo = resultado?.evolucao[resultado.prazoMeses];

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Juros compostos</h1>

      <form onSubmit={handleSubmit(calcular)} noValidate className="space-y-4">
        <CampoFormulario id="valorInicial" rotulo="Valor inicial (R$)" erro={errors.valorInicial?.message}>
          {(p) => (
            <Controller
              control={control}
              name="valorInicial"
              render={({ field }) => <CampoMoeda {...p} placeholder="0,00" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
            />
          )}
        </CampoFormulario>

        <CampoFormulario id="aporteMensal" rotulo="Aporte mensal (R$)" erro={errors.aporteMensal?.message}>
          {(p) => (
            <Controller
              control={control}
              name="aporteMensal"
              render={({ field }) => <CampoMoeda {...p} placeholder="0,00" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
            />
          )}
        </CampoFormulario>

        <div className="space-y-2">
          <CampoFormulario
            id="taxa"
            rotulo="Taxa de juros (%)"
            erro={errors.taxa?.message}
            ajuda={[TAXA_SUGERIDA.texto, equivalencia].filter(Boolean).join('. ')}
          >
            {(p) => <Input {...p} inputMode="decimal" className="tabular-nums" {...register('taxa')} />}
          </CampoFormulario>
          <Controller
            control={control}
            name="unidadeTaxa"
            render={({ field }) => (
              <ToggleGroup
                type="single"
                variant="outline"
                aria-label="Unidade da taxa"
                value={field.value}
                onValueChange={(v) => v && field.onChange(v)}
              >
                <ToggleGroupItem value="mes">% ao mês</ToggleGroupItem>
                <ToggleGroupItem value="ano">% ao ano</ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </div>

        <div className="space-y-2">
          <CampoFormulario id="prazo" rotulo="Prazo" erro={errors.prazo?.message}>
            {(p) => <Input {...p} inputMode="numeric" className="tabular-nums" placeholder="Ex.: 12" {...register('prazo')} />}
          </CampoFormulario>
          <Controller
            control={control}
            name="unidadePrazo"
            render={({ field }) => (
              <ToggleGroup
                type="single"
                variant="outline"
                aria-label="Unidade do prazo"
                value={field.value}
                onValueChange={(v) => v && field.onChange(v)}
              >
                <ToggleGroupItem value="meses">meses</ToggleGroupItem>
                <ToggleGroupItem value="anos">anos</ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">Calcular</Button>
          <Button type="button" variant="outline" onClick={limpar}>Limpar</Button>
        </div>
      </form>

      <AvisoEducativo texto={AVISO_JUROS} />

      {calculo && resultado && ultimo && (
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Montante final</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold tabular-nums">{formatarMoeda(resultado.montante)}</CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Total investido</CardTitle></CardHeader>
                <CardContent className="text-lg font-semibold tabular-nums">{formatarMoeda(resultado.totalInvestido)}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Total de juros</CardTitle></CardHeader>
                <CardContent className="text-lg font-semibold tabular-nums">{formatarMoeda(resultado.totalJuros)}</CardContent>
              </Card>
            </div>
          </div>

          <div
            role="img"
            aria-label={`Saldo de ${formatarMoeda(ultimo.saldo)} no mês ${resultado.prazoMeses}, contra ${formatarMoeda(ultimo.investido)} investidos`}
            className="h-60 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resultado.evolucao} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => formatarMoedaCompacta(v)} width={64} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(valor) => formatarMoeda(Number(valor))}
                  labelFormatter={(mes) => `Mês ${mes}`}
                  contentStyle={{ background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                <Area type="monotone" dataKey="investido" name="Total investido" stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <label htmlFor="prazo-slider" className="text-sm font-medium">
              Prazo: <span className="tabular-nums">{rotuloPrazo(calculo.entrada)}</span>
            </label>
            <Slider
              id="prazo-slider"
              min={1}
              max={calculo.entrada.unidadePrazo === 'anos' ? 50 : 600}
              step={1}
              value={[calculo.entrada.prazo]}
              onValueChange={([v]) => mudarPrazo(v)}
              aria-label="Prazo"
            />
          </div>

          <Button type="button" variant="outline" onClick={() => setMostrarTabela((v) => !v)} aria-expanded={mostrarTabela}>
            {mostrarTabela ? 'Esconder tabela mês a mês' : 'Ver tabela mês a mês'}
          </Button>
          {mostrarTabela && (
            <div className="max-h-80 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Investido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.evolucao.map((ponto) => (
                    <TableRow key={ponto.mes}>
                      <TableCell className="tabular-nums">{ponto.mes}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatarMoeda(ponto.saldo)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatarMoeda(ponto.investido)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
