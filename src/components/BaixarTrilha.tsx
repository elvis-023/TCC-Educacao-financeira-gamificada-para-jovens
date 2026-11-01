import { CircleCheck, Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { atualizarAparelho, lerAparelho } from '@/dados/aparelho';
import { useConexao, useTrilhasBaixadas } from '@/hooks/useConexao';

const DURACAO_MS = 2000;

/** Download simulado da trilha (PRD T09): barra de ~2 s e depois o selo "Disponível offline", guardado no aparelho. */
export function BaixarTrilha({ trilhaId }: { trilhaId: string }) {
  const baixadas = useTrilhasBaixadas();
  const online = useConexao();
  const [progresso, setProgresso] = useState<number | null>(null);
  const intervalo = useRef<number | null>(null);

  useEffect(() => () => {
    if (intervalo.current) window.clearInterval(intervalo.current);
  }, []);

  if (baixadas.includes(trilhaId)) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-acerto">
        <CircleCheck aria-hidden="true" className="size-4" />
        Disponível offline
      </span>
    );
  }

  function baixar() {
    const inicio = Date.now();
    setProgresso(0);
    intervalo.current = window.setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - inicio) / DURACAO_MS) * 100));
      setProgresso(pct);
      if (pct >= 100) {
        if (intervalo.current) window.clearInterval(intervalo.current);
        atualizarAparelho({ trilhasBaixadas: [...lerAparelho().trilhasBaixadas, trilhaId] });
        setProgresso(null);
        toast.success('Trilha disponível offline');
      }
    }, 100);
  }

  if (progresso !== null) {
    return (
      <div className="space-y-1" aria-live="polite">
        <p className="text-sm tabular-nums">Baixando trilha… {progresso}%</p>
        <Progress value={progresso} aria-label="Progresso do download" />
      </div>
    );
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={baixar} disabled={!online}>
      <Download aria-hidden="true" />
      {online ? 'Baixar trilha' : 'Conecte-se para baixar'}
    </Button>
  );
}
