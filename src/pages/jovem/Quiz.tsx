import { gsap, reduzMovimento } from '@/lib/animacao';
import { CircleCheck, CircleX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { AvisoSemInternet } from '@/components/AvisoSemInternet';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { repositorios } from '@/dados/repositorios';
import type { Licao, QuestaoPublica, ResultadoResposta, Trilha as TrilhaTipo } from '@/dados/tipos';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useProgressos } from '@/hooks/dados/useProgresso';
import { useResponder } from '@/hooks/dados/useQuiz';
import { NaoEncontrada } from '@/pages/NaoEncontrada';
import { useTrilhaIndisponivel } from '@/hooks/useConexao';
import { NIVEIS } from '@/regras/motorAdaptativo';
import { estadoDaLicao, type EstadoLicao } from '@/regras/progresso';
import { MENSAGEM_BLOQUEIO } from './Trilha';

const LETRAS = ['A', 'B', 'C', 'D'];

interface Feedback { resultado: ResultadoResposta; escolhida: number }

export function Quiz() {
  const { trilha: slug, licao: ordemTexto } = useParams();
  const trilhas = useTrilhas();
  const semInternet = useTrilhaIndisponivel(trilhas.data?.find((t) => t.slug === slug)?.id);
  const licoes = useLicoes();
  const progressos = useProgressos();

  if (trilhas.isPending || licoes.isPending || progressos.isPending) {
    return (
      <div className="space-y-3" aria-label="Carregando quiz">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  const trilha = trilhas.data?.find((t) => t.slug === slug);
  const daTrilha = (licoes.data ?? []).filter((l) => l.trilhaId === trilha?.id).sort((a, b) => a.ordem - b.ordem);
  const licao = daTrilha.find((l) => String(l.ordem) === ordemTexto);
  if (!trilha || !licao) return <NaoEncontrada />;
  if (semInternet) return <AvisoSemInternet voltarPara="/trilhas" />;

  // O estado da lição só vale na abertura: ao concluir o quiz ele muda, e a tela não deve redirecionar antes do feedback.
  return <QuizAberto key={licao.id} trilha={trilha} licao={licao} estadoNaAbertura={estadoDaLicao(licao, daTrilha, progressos.data ?? [])} />;
}

function QuizAberto({ trilha, licao, estadoNaAbertura }: { trilha: TrilhaTipo; licao: Licao; estadoNaAbertura: EstadoLicao }) {
  const navigate = useNavigate();
  const [estadoInicial] = useState(estadoNaAbertura);
  const quizId = `${licao.id}-quiz`;
  const base = `/trilhas/${trilha.slug}`;
  const responder = useResponder(quizId);

  const [questao, setQuestao] = useState<QuestaoPublica | null>(null);
  const [pedido, setPedido] = useState(0); // muda para pedir a próxima questão
  const [completo, setCompleto] = useState(false);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [explicacaoAberta, setExplicacaoAberta] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  useEffect(() => {
    if (estadoInicial !== 'quiz_pendente') return;
    let ignorar = false;
    repositorios.quiz.proximaQuestao(quizId)
      .then((q) => {
        if (ignorar) return;
        if (q) setQuestao(q);
        else setCompleto(true);
      })
      .catch((e: Error) => toast.error(e.message));
    return () => { ignorar = true; };
  }, [quizId, pedido, estadoInicial]);

  useEffect(() => {
    if (estadoInicial === 'disponivel') toast('Leia a lição antes do quiz', { id: 'ler-antes' });
    if (estadoInicial === 'bloqueada') toast(MENSAGEM_BLOQUEIO, { id: 'licao-bloqueada' });
  }, [estadoInicial]);

  async function confirmar() {
    if (!questao || escolha === null || feedback || responder.isPending) return;
    try {
      const resultado = await responder.mutateAsync({ questaoId: questao.id, alternativa: escolha });
      setFeedback({ resultado, escolhida: escolha });
      toast.success(`+${resultado.xpGanho} XP`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível registrar a resposta');
    }
  }

  function avancar() {
    if (!feedback) return;
    if (feedback.resultado.quizConcluido) {
      navigate(`${base}/licoes/${licao.ordem}/resultado`, { state: { resultado: feedback.resultado } });
      return;
    }
    setQuestao(null);
    setEscolha(null);
    setFeedback(null);
    setExplicacaoAberta(false);
    setPedido((n) => n + 1);
  }

  // Cada questão nova entra com as alternativas em sequência (GSAP); o resto da tela fica parado.
  const questaoId = questao?.id;
  useEffect(() => {
    if (!questaoId || reduzMovimento()) return;
    gsap.fromTo('[data-alternativa]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out', clearProps: 'opacity,transform' });
  }, [questaoId]);

  // Teclado (PRD 5.6): 1 a 4 escolhem; Enter confirma e, depois do feedback, avança.
  const acoes = useRef({ confirmar, avancar, feedback, questao, confirmandoSaida });
  useEffect(() => {
    acoes.current = { confirmar, avancar, feedback, questao, confirmandoSaida };
  });
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const a = acoes.current;
      if (a.confirmandoSaida || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest?.('[data-ignora-teclado]')) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (a.feedback) a.avancar();
        else void a.confirmar();
      } else if (!a.feedback && a.questao && ['1', '2', '3', '4'].includes(e.key)) {
        setEscolha(Number(e.key) - 1);
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  // Regras de acesso 6 e 7 (PRD 4.4).
  if (estadoInicial === 'bloqueada') return <Navigate to={base} replace />;
  if (estadoInicial === 'disponivel') return <Navigate to={`${base}/licoes/${licao.ordem}`} replace />;
  if (estadoInicial === 'concluida' || completo) return <Navigate to={`${base}/licoes/${licao.ordem}/resultado`} replace />;

  const resultado = feedback?.resultado;
  const numero = questao?.numeroNoQuiz ?? 1;
  const total = questao?.totalNoQuiz ?? 3;
  const mensagemDeNivel = resultado && NIVEIS.indexOf(resultado.nivelDepois) > NIVEIS.indexOf(resultado.nivelAntes)
    ? 'Mandou bem! As próximas questões vão ficar mais desafiadoras.'
    : resultado && NIVEIS.indexOf(resultado.nivelDepois) < NIVEIS.indexOf(resultado.nivelAntes)
      ? 'Tudo certo! As próximas questões vão ficar um pouco mais tranquilas para você firmar o conteúdo.'
      : null;

  return (
    <div className="space-y-5 pb-28">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Quiz da Lição {licao.ordem}</h1>
          <Button type="button" variant="ghost" size="icon" aria-label="Fechar quiz" data-ignora-teclado onClick={() => setConfirmandoSaida(true)}>
            <X aria-hidden="true" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">Questão {numero} de {total}</p>
        <Progress value={((numero - 1 + (feedback ? 1 : 0)) / total) * 100} aria-label={`Questão ${numero} de ${total}`} />
      </header>

      {!questao ? (
        <div className="space-y-3" aria-label="Carregando questão">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
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
                : correta ? 'border-acerto bg-acerto-fundo' : marcada ? 'border-erro bg-erro-fundo' : 'opacity-70';
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
          <>
            {resultado.acertou ? (
              <div className="space-y-2 rounded-xl bg-acerto-fundo p-4 text-acerto">
                <p className="flex items-center gap-2 font-semibold">
                  <CircleCheck aria-hidden="true" className="size-5" />
                  Resposta certa! +{resultado.xpGanho} XP
                </p>
                <button type="button" className="text-sm underline underline-offset-4" onClick={() => setExplicacaoAberta((v) => !v)} aria-expanded={explicacaoAberta}>
                  Ver explicação
                </button>
                {explicacaoAberta && <p className="text-sm text-foreground">{resultado.explicacao}</p>}
              </div>
            ) : (
              <div className="space-y-2 rounded-xl bg-erro-fundo p-4 text-erro">
                <p className="flex items-start gap-2 font-semibold">
                  <CircleX aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                  <span>Resposta errada. A correta é a {LETRAS[resultado.respostaCorreta]}: {questao.alternativas[resultado.respostaCorreta]}</span>
                </p>
                <p className="text-sm text-foreground">{resultado.explicacao}</p>
                <p className="text-sm font-medium">+{resultado.xpGanho} XP pela participação</p>
              </div>
            )}
            {mensagemDeNivel && <p className="rounded-xl border p-3 text-sm">{mensagemDeNivel}</p>}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 bg-background/90 p-4 backdrop-blur">
        {feedback ? (
          <Button className="w-full" size="lg" onClick={avancar}>
            {feedback.resultado.quizConcluido ? 'Ver resultado' : 'Próxima questão'}
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={() => void confirmar()} disabled={escolha === null || !questao || responder.isPending}>
            Confirmar resposta
          </Button>
        )}
      </div>

      <AlertDialog open={confirmandoSaida} onOpenChange={setConfirmandoSaida}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do quiz?</AlertDialogTitle>
            <AlertDialogDescription>As respostas já dadas ficam salvas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar o quiz</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(base)}>Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
