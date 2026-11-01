import { useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { QuestaoTreino, ResultadoTreino } from '@/dados/tipos';
import { repositorios } from '@/dados/repositorios';
import { chaves } from '@/hooks/dados/chaves';
import { useEstadoTreino } from '@/hooks/dados/useTreino';
import { entradaDasAlternativas } from '@/lib/animacao';
import { formatarXp } from '@/lib/formatacao';
import { QUESTOES_POR_TREINO, TETO_XP_TREINO_DIARIO } from '@/regras/treino';

const LETRAS = ['A', 'B', 'C', 'D'];

type Fase = 'intro' | 'questao' | 'resumo';

export function Treino() {
  const navigate = useNavigate();
  const cliente = useQueryClient();
  const estado = useEstadoTreino();
  const [fase, setFase] = useState<Fase>('intro');
  const [questao, setQuestao] = useState<QuestaoTreino | null>(null);
  const [vistas, setVistas] = useState<string[]>([]);
  const [numero, setNumero] = useState(1);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ escolhida: number; resultado: ResultadoTreino } | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [xpDaSessao, setXpDaSessao] = useState(0);
  const [enviando, setEnviando] = useState(false);

  async function buscar(jaVistas: string[]) {
    try {
      const proxima = await repositorios.treino.proximaQuestao(jaVistas);
      if (!proxima) {
        setFase('resumo');
        return;
      }
      setQuestao(proxima);
      setVistas([...jaVistas, proxima.id]);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível buscar a questão');
      setFase('intro');
    }
  }

  async function comecar() {
    setNumero(1);
    setAcertos(0);
    setXpDaSessao(0);
    setEscolha(null);
    setFeedback(null);
    setQuestao(null);
    setVistas([]);
    setFase('questao');
    await buscar([]);
  }

  async function confirmar() {
    if (!questao || escolha === null || enviando || feedback) return;
    setEnviando(true);
    try {
      const resultado = await repositorios.treino.responder(questao.id, escolha);
      setFeedback({ escolhida: escolha, resultado });
      if (resultado.acertou) setAcertos((n) => n + 1);
      setXpDaSessao((n) => n + resultado.xpGanho);
      // O XP do topo, o ranking e o XP de hoje acompanham a resposta.
      await Promise.all([chaves.usuario, chaves.ranking, chaves.treino].map((chave) => cliente.invalidateQueries({ queryKey: chave })));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível registrar a resposta');
    } finally {
      setEnviando(false);
    }
  }

  async function avancar() {
    if (!feedback) return;
    if (numero >= QUESTOES_POR_TREINO) {
      setFase('resumo');
      return;
    }
    setNumero((n) => n + 1);
    setEscolha(null);
    setFeedback(null);
    setQuestao(null);
    await buscar(vistas);
  }

  // Teclado (PRD 5.6): 1 a 4 escolhem; Enter confirma e, depois do feedback, avança.
  const acoes = useRef({ confirmar, avancar, feedback, questao, fase });
  useEffect(() => {
    acoes.current = { confirmar, avancar, feedback, questao, fase };
  });
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const a = acoes.current;
      if (a.fase !== 'questao' || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest?.('a, button')) {
        if (e.key === 'Enter') return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (a.feedback) void a.avancar();
        else void a.confirmar();
      } else if (!a.feedback && a.questao && ['1', '2', '3', '4'].includes(e.key)) {
        setEscolha(Number(e.key) - 1);
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  const questaoId = questao?.id;
  useEffect(() => {
    if (questaoId) entradaDasAlternativas();
  }, [questaoId]);

  if (fase === 'intro') {
    if (estado.isPending) return <Skeleton className="h-64 w-full rounded-3xl" aria-label="Carregando treino" />;
    const liberado = (estado.data?.questoesDisponiveis ?? 0) > 0;
    const xpHoje = estado.data?.xpHoje ?? 0;
    return (
      <section className="space-y-5">
        <div className="fundo-hero space-y-4 rounded-3xl p-6">
          <h1 className="text-3xl font-semibold leading-tight">Treino</h1>
          <p className="opacity-90">
            {QUESTOES_POR_TREINO} questões das lições que você já concluiu. Pode repetir quantas vezes quiser, com questões que você viu menos.
          </p>
          <ul className="space-y-1 text-sm opacity-90">
            <li>Cada acerto vale 20% do XP do quiz. Erro não vale XP.</li>
            <li className="tabular-nums">Hoje você ganhou {xpHoje} de {TETO_XP_TREINO_DIARIO} XP de treino.</li>
            <li>O treino não muda o seu nível nas trilhas nem as conquistas.</li>
          </ul>
        </div>
        {liberado ? (
          <Button size="lg" className="h-12 w-full bg-destaque font-semibold text-destaque-foreground hover:bg-destaque/90" onClick={() => void comecar()}>
            Começar o treino
          </Button>
        ) : (
          <div className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
            <p>Conclua o quiz de uma lição para liberar o treino.</p>
            <Button asChild><Link to="/trilhas">Ver trilhas</Link></Button>
          </div>
        )}
        <Button asChild variant="ghost" className="w-full"><Link to="/inicio">Voltar ao início</Link></Button>
      </section>
    );
  }

  if (fase === 'resumo') {
    const respondidas = feedback ? numero : numero - 1;
    const teto = (estado.data?.xpHoje ?? 0) >= TETO_XP_TREINO_DIARIO;
    return (
      <section className="space-y-5">
        <div className="fundo-hero space-y-3 rounded-3xl p-6">
          <h1 className="text-3xl font-semibold leading-tight">Treino concluído</h1>
          <p className="numero text-2xl">Você acertou {acertos} de {Math.max(respondidas, acertos)}</p>
          <p className="numero text-4xl font-semibold text-destaque">+{formatarXp(xpDaSessao)}</p>
          {teto && <p className="text-sm opacity-90">Você chegou ao teto de {TETO_XP_TREINO_DIARIO} XP de treino de hoje. Amanhã tem mais.</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Button size="lg" className="h-12" onClick={() => void comecar()}>Treinar de novo</Button>
          <Button asChild size="lg" variant="outline" className="h-12"><Link to="/inicio">Voltar ao início</Link></Button>
        </div>
      </section>
    );
  }

  const resultado = feedback?.resultado;
  return (
    <div className="space-y-5 pb-28">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Treino</h1>
          <Button type="button" variant="ghost" size="icon" aria-label="Sair do treino" onClick={() => navigate('/inicio')}>
            <X aria-hidden="true" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">Questão {numero} de {QUESTOES_POR_TREINO}</p>
        <Progress value={((numero - 1 + (feedback ? 1 : 0)) / QUESTOES_POR_TREINO) * 100} aria-label={`Questão ${numero} de ${QUESTOES_POR_TREINO}`} />
      </header>

      {!questao ? (
        <div className="space-y-3" aria-label="Carregando questão">
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : (
        <section className="space-y-4">
          <div className="fundo-hero space-y-3 rounded-3xl p-5">
            <EtiquetaNivel nivel={questao.nivelDificuldade} />
            <h2 className="text-xl font-semibold leading-snug">{questao.enunciado}</h2>
          </div>
          <ul className="space-y-2">
            {questao.alternativas.map((texto, i) => {
              const correta = resultado?.respostaCorreta === i;
              const marcada = feedback?.escolhida === i;
              const estilo = !feedback
                ? escolha === i ? 'border-primary bg-primary/10' : 'border-transparent bg-card ring-1 ring-foreground/10 hover:bg-secondary'
                : correta ? 'border-acerto bg-acerto-fundo' : marcada ? 'border-erro bg-erro-fundo' : 'border-transparent bg-card opacity-70';
              return (
                <li key={i}>
                  <button
                    type="button"
                    aria-pressed={feedback ? marcada : escolha === i}
                    disabled={Boolean(feedback)}
                    onClick={() => setEscolha(i)}
                    data-alternativa
                    className={`flex min-h-14 w-full items-start gap-3 rounded-2xl border-2 p-3 text-left ${estilo}`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${!feedback && escolha === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{LETRAS[i]}</span>
                    <span className="flex-1 pt-0.5">{texto}</span>
                    {feedback && (correta || marcada) && (
                      <span className={`inline-flex shrink-0 items-center gap-1 pt-0.5 text-sm font-medium ${correta ? 'text-acerto' : 'text-erro'}`}>
                        {correta ? <CircleCheck aria-hidden="true" className="size-4" /> : <CircleX aria-hidden="true" className="size-4" />}
                        {marcada && correta ? 'Sua resposta · Correta' : correta ? 'Correta' : 'Sua resposta'}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="hidden text-xs text-muted-foreground [@media(pointer:fine)]:block">Use as teclas 1 a 4 e Enter</p>
        </section>
      )}

      <div aria-live="polite" className="space-y-3">
        {resultado && questao && (
          resultado.acertou ? (
            <div className="space-y-2 rounded-2xl bg-acerto-fundo p-4 text-acerto">
              <p className="flex items-center gap-2 font-semibold">
                <CircleCheck aria-hidden="true" className="size-5" />
                Resposta certa! {resultado.xpGanho > 0 ? `+${resultado.xpGanho} XP` : 'Sem XP: você chegou ao teto de hoje'}
              </p>
              <p className="text-sm text-foreground">{resultado.explicacao}</p>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl bg-erro-fundo p-4 text-erro">
              <p className="flex items-start gap-2 font-semibold">
                <CircleX aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                <span>Resposta errada. A correta é a {LETRAS[resultado.respostaCorreta]}: {questao.alternativas[resultado.respostaCorreta]}</span>
              </p>
              <p className="text-sm text-foreground">{resultado.explicacao}</p>
            </div>
          )
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 bg-background/90 p-4 backdrop-blur">
        {feedback ? (
          <Button className="w-full" size="lg" onClick={() => void avancar()}>
            {numero >= QUESTOES_POR_TREINO ? 'Ver resultado' : 'Próxima questão'}
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={() => void confirmar()} disabled={escolha === null || !questao || enviando}>
            Confirmar resposta
          </Button>
        )}
      </div>
    </div>
  );
}
