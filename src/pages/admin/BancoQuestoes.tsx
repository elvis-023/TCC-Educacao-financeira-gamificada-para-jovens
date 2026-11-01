import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, CircleOff, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { CampoFormulario } from '@/components/CampoFormulario';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { Licao, QuestaoAdmin, QuestaoEditavel, Trilha } from '@/dados/tipos';
import { useSalvarQuestao, useQuestoesAdmin } from '@/hooks/dados/useAdmin';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { ROTULO_NIVEL } from '@/lib/rotulos';
import { normalizarTexto } from '@/lib/texto';
import { esquemaQuestao, type FormularioQuestao } from './esquemaQuestao';

const CLASSE_SELECT =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-xs focus-visible:outline-2 focus-visible:outline-ring aria-invalid:border-destructive md:text-sm';

const vazio = (): FormularioQuestao => ({
  trilhaId: '', licaoId: '', nivel: 'medio', enunciado: '', alt0: '', alt1: '', alt2: '', alt3: '', correta: '0', explicacao: '', ativa: true,
});
const doRegistro = (q: QuestaoAdmin): FormularioQuestao => ({
  trilhaId: q.trilhaId, licaoId: q.licaoId, nivel: q.nivelDificuldade, enunciado: q.enunciado,
  alt0: q.alternativas[0], alt1: q.alternativas[1], alt2: q.alternativas[2], alt3: q.alternativas[3],
  correta: String(q.respostaCorreta) as '0' | '1' | '2' | '3', explicacao: q.explicacao, ativa: q.ativa,
});

function Painel({ questao, trilhas, licoes, aoFechar }: { questao: QuestaoAdmin | null; trilhas: Trilha[]; licoes: Licao[]; aoFechar: () => void }) {
  const salvar = useSalvarQuestao();
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormularioQuestao>({
    resolver: zodResolver(esquemaQuestao),
    defaultValues: questao ? doRegistro(questao) : vazio(),
  });
  const trilhaEscolhida = useWatch({ control, name: 'trilhaId' });
  const licoesDaTrilha = licoes.filter((l) => l.trilhaId === trilhaEscolhida).sort((a, b) => a.ordem - b.ordem);

  async function enviar(v: FormularioQuestao) {
    setErroServidor(null);
    const editavel: QuestaoEditavel = {
      id: questao?.id ?? null, quizId: `${v.licaoId}-quiz`, enunciado: v.enunciado.trim(),
      alternativas: [v.alt0.trim(), v.alt1.trim(), v.alt2.trim(), v.alt3.trim()], respostaCorreta: Number(v.correta) as 0 | 1 | 2 | 3,
      nivelDificuldade: v.nivel, explicacao: v.explicacao.trim(), ativa: v.ativa,
    };
    try {
      await salvar.mutateAsync(editavel);
      toast.success(questao && questao.ativa !== v.ativa ? (v.ativa ? 'Questão reativada' : 'Questão inativada') : 'Questão salva');
      aoFechar();
    } catch (erro) {
      setErroServidor(erro instanceof Error ? erro.message : 'Não foi possível salvar');
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
      {erroServidor && <p role="alert" className="rounded-lg border border-erro/40 bg-erro-fundo p-3 text-sm text-erro">{erroServidor}</p>}

      <CampoFormulario id="trilhaId" rotulo="Trilha" erro={errors.trilhaId?.message}>
        {(p) => (
          <select {...p} className={CLASSE_SELECT} {...register('trilhaId')}>
            <option value="">Escolha a trilha</option>
            {trilhas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
          </select>
        )}
      </CampoFormulario>
      <CampoFormulario id="licaoId" rotulo="Lição" erro={errors.licaoId?.message}>
        {(p) => (
          <select {...p} className={CLASSE_SELECT} {...register('licaoId')}>
            <option value="">Escolha a lição</option>
            {licoesDaTrilha.map((l) => <option key={l.id} value={l.id}>Lição {l.ordem}: {l.titulo}</option>)}
          </select>
        )}
      </CampoFormulario>
      <CampoFormulario id="nivel" rotulo="Nível" erro={errors.nivel?.message}>
        {(p) => (
          <select {...p} className={CLASSE_SELECT} {...register('nivel')}>
            {(['facil', 'medio', 'dificil'] as const).map((n) => <option key={n} value={n}>{ROTULO_NIVEL[n]}</option>)}
          </select>
        )}
      </CampoFormulario>
      <CampoFormulario id="enunciado" rotulo="Enunciado" erro={errors.enunciado?.message}>
        {(p) => <Textarea {...p} rows={3} {...register('enunciado')} />}
      </CampoFormulario>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Alternativas (marque a correta)</legend>
        {([0, 1, 2, 3] as const).map((i) => (
          <div key={i} className="flex items-start gap-2">
            <input type="radio" value={String(i)} aria-label={`Alternativa ${i + 1} é a correta`} className="mt-3 size-5" {...register('correta')} />
            <div className="flex-1">
              <CampoFormulario id={`alt${i}`} rotulo={`Alternativa ${i + 1}`} erro={errors[`alt${i}` as 'alt0']?.message}>
                {(p) => <Input {...p} {...register(`alt${i}` as 'alt0')} />}
              </CampoFormulario>
            </div>
          </div>
        ))}
        {errors.correta && <p role="alert" className="text-sm text-erro">{errors.correta.message}</p>}
      </fieldset>

      <CampoFormulario id="explicacao" rotulo="Explicação mostrada depois da resposta" erro={errors.explicacao?.message}>
        {(p) => <Textarea {...p} rows={3} {...register('explicacao')} />}
      </CampoFormulario>

      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" className="size-5" {...register('ativa')} />
        <span>Questão ativa (inativa não entra no quiz)</span>
      </label>

      <Button type="submit" disabled={isSubmitting || salvar.isPending}>Salvar</Button>
    </form>
  );
}

export function BancoQuestoes() {
  const questoes = useQuestoesAdmin();
  const trilhas = useTrilhas();
  const licoes = useLicoes();
  const salvar = useSalvarQuestao();
  const [busca, setBusca] = useState('');
  const [painel, setPainel] = useState<{ questao: QuestaoAdmin | null } | null>(null);

  if (questoes.isPending || trilhas.isPending || licoes.isPending) return <Skeleton className="h-96 w-full rounded-xl" aria-label="Carregando questões" />;
  if (questoes.isError || !questoes.data) return <p role="alert">Não foi possível carregar as questões. Tente de novo.</p>;

  const nomeTrilha = (id: string) => trilhas.data?.find((t) => t.id === id)?.titulo ?? id;
  const termo = normalizarTexto(busca);
  const lista = questoes.data.filter((q) => !termo || normalizarTexto(q.enunciado).includes(termo));
  const ativas = questoes.data.filter((q) => q.ativa).length;

  async function alternarAtiva(q: QuestaoAdmin) {
    try {
      await salvar.mutateAsync({
        id: q.id, quizId: q.quizId, enunciado: q.enunciado, alternativas: q.alternativas, respostaCorreta: q.respostaCorreta,
        nivelDificuldade: q.nivelDificuldade, explicacao: q.explicacao, ativa: !q.ativa,
      });
      toast.success(q.ativa ? 'Questão inativada' : 'Questão reativada');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível salvar');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="font-medium tabular-nums">{questoes.data.length} questões · {ativas} ativas</p>
        <Button onClick={() => setPainel({ questao: null })}><Plus aria-hidden="true" />Nova questão</Button>
      </div>
      <Input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar no enunciado" aria-label="Buscar no enunciado" className="max-w-md" />

      {lista.length === 0 ? (
        <p>Nenhuma questão encontrada para “{busca}”.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enunciado</TableHead><TableHead>Trilha</TableHead><TableHead>Lição</TableHead><TableHead>Nível</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-md whitespace-normal"><span className="line-clamp-2">{q.enunciado}</span></TableCell>
                  <TableCell>{nomeTrilha(q.trilhaId)}</TableCell>
                  <TableCell className="tabular-nums">{q.licaoOrdem}</TableCell>
                  <TableCell><EtiquetaNivel nivel={q.nivelDificuldade} /></TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      {q.ativa ? <CircleCheck aria-hidden="true" className="size-4 text-primary" /> : <CircleOff aria-hidden="true" className="size-4 text-muted-foreground" />}
                      {q.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => setPainel({ questao: q })}>Editar<span className="sr-only">: {q.enunciado}</span></Button>
                    <Button variant="ghost" size="sm" onClick={() => alternarAtiva(q)} disabled={salvar.isPending}>{q.ativa ? 'Inativar' : 'Reativar'}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={painel !== null} onOpenChange={(aberto) => !aberto && setPainel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{painel?.questao ? 'Editar questão' : 'Nova questão'}</SheetTitle>
            <SheetDescription>Questões não são excluídas: para tirar do quiz, deixe como inativa.</SheetDescription>
          </SheetHeader>
          {painel && (
            <Painel key={painel.questao?.id ?? 'nova'} questao={painel.questao} trilhas={trilhas.data ?? []} licoes={licoes.data ?? []} aoFechar={() => setPainel(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
