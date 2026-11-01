import { Flame } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { Celebracao } from '@/components/Celebracao';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { IconeConquista } from '@/components/IconeConquista';
import { ModalConquista } from '@/components/ModalConquista';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ResultadoResposta } from '@/dados/tipos';
import { useConquistas } from '@/hooks/dados/useConquistas';
import { useBadges, useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useMinhasRespostas, useProgressos } from '@/hooks/dados/useProgresso';
import { useMeuUsuario } from '@/hooks/dados/useUsuario';
import { diaNoFuso } from '@/lib/fuso';
import { formatarXp } from '@/lib/formatacao';
import { agora } from '@/lib/relogio';
import { nivelAtualDaTrilha } from '@/regras/motorAdaptativo';
import { estadoDaLicao, trilhasConcluidas } from '@/regras/progresso';
import { sequenciaAtual } from '@/regras/sequencia';
import { NaoEncontrada } from '@/pages/NaoEncontrada';

export function ResultadoQuiz() {
  const { trilha: slug, licao: ordemTexto } = useParams();
  const { state } = useLocation() as { state: { resultado?: ResultadoResposta } | null };
  const badges = useBadges();
  const conquistas = useConquistas();
  const [modalAberto, setModalAberto] = useState(true);
  const novas = state?.resultado?.conquistasNovas ?? [];
  const trilhas = useTrilhas();
  const licoes = useLicoes();
  const progressos = useProgressos();
  const respostas = useMinhasRespostas();
  const usuario = useMeuUsuario();

  if (trilhas.isPending || licoes.isPending || progressos.isPending || respostas.isPending || usuario.isPending) {
    return (
      <div className="space-y-3" aria-label="Carregando resultado">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const trilha = trilhas.data?.find((t) => t.slug === slug);
  const daTrilha = (licoes.data ?? []).filter((l) => l.trilhaId === trilha?.id).sort((a, b) => a.ordem - b.ordem);
  const licao = daTrilha.find((l) => String(l.ordem) === ordemTexto);
  if (!trilha || !licao) return <NaoEncontrada />;

  const meusProgressos = progressos.data ?? [];
  // O resultado só existe para o quiz concluído; com a leitura pendente, a pessoa volta ao passo certo.
  const estado = estadoDaLicao(licao, daTrilha, meusProgressos);
  if (estado === 'quiz_pendente') return <Navigate to={`/trilhas/${trilha.slug}/licoes/${licao.ordem}/quiz`} replace />;
  if (estado !== 'concluida') return <Navigate to={`/trilhas/${trilha.slug}/licoes/${licao.ordem}`} replace />;

  const progresso = meusProgressos.find((p) => p.licaoId === licao.id)!;
  const acertos = state?.resultado?.acertosNoQuiz ?? progresso.acertos;
  const xp = state?.resultado?.xpNoQuiz ?? progresso.xpGanho;
  const nivel = nivelAtualDaTrilha((respostas.data ?? []).filter((r) => r.trilhaId === trilha.id));
  const sequencia = sequenciaAtual(usuario.data!.diasStreak, usuario.data!.ultimoDiaUso, diaNoFuso(agora()));
  const proxima = daTrilha.find((l) => l.ordem === licao.ordem + 1);
  const trilhaConcluida = !proxima && meusProgressos.filter((p) => p.trilhaId === trilha.id && p.quizConcluidoEm).length >= 3;
  const testeFinalLiberado = trilhasConcluidas(meusProgressos) === 4;

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{trilha.titulo} · Lição {licao.ordem} de 3</p>
        <h1 className="text-2xl font-semibold tabular-nums">Você acertou {acertos} de 3</h1>
      </header>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="text-3xl font-semibold text-xp tabular-nums">+{formatarXp(xp)}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Nível atual da trilha</span>
            <EtiquetaNivel nivel={nivel} />
          </div>
          <p className="flex items-center gap-1 text-sm">
            <Flame aria-hidden="true" className="size-4 text-sequencia-icone" />
            <span className="tabular-nums text-sequencia">{sequencia} {sequencia === 1 ? 'dia seguido' : 'dias seguidos'}</span>
          </p>
        </CardContent>
      </Card>

      {trilhaConcluida && <Celebracao titulo="Trilha concluída!" texto={`Você terminou ${trilha.titulo}.`} />}

      {novas.length > 0 && (
        <>
          <Card className="border-xp-icone/50 bg-xp-icone/10">
            <CardContent className="space-y-2 pt-6">
              <p className="font-semibold">{novas.length === 1 ? 'Conquista nova' : 'Conquistas novas'}</p>
              <ul className="space-y-2">
                {(badges.data ?? []).filter((b) => novas.includes(b.id)).map((b) => (
                  <li key={b.id} className="flex items-center gap-2">
                    <IconeConquista nome={b.icone} className="size-5 text-xp-icone" />
                    <span>{b.nome}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="link" className="h-auto p-0"><Link to="/conquistas">Ver todas as conquistas</Link></Button>
            </CardContent>
          </Card>
          <ModalConquista aberto={modalAberto} aoFechar={() => setModalAberto(false)} novas={novas} badges={badges.data ?? []} conquistadas={conquistas.data ?? []} />
        </>
      )}

      {testeFinalLiberado && trilhaConcluida && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="space-y-3 pt-6">
            <p className="font-semibold">Teste final liberado</p>
            <p className="text-sm text-muted-foreground">Você concluiu as 4 trilhas. Falta só o teste final, de 3 perguntas.</p>
            <Button asChild><Link to="/pos-teste">Fazer agora</Link></Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {proxima ? (
          <>
            <Button asChild size="lg"><Link to={`/trilhas/${trilha.slug}/licoes/${proxima.ordem}`}>Próxima lição</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to={`/trilhas/${trilha.slug}`}>Voltar à trilha</Link></Button>
          </>
        ) : (
          <>
            <Button asChild size="lg"><Link to="/trilhas">Ver trilhas</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to={`/trilhas/${trilha.slug}`}>Voltar à trilha</Link></Button>
          </>
        )}
      </div>
    </section>
  );
}
