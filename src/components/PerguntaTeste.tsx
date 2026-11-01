import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PerguntaPublica } from '@/dados/tipos';

interface Props {
  pergunta: PerguntaPublica;
  total: number;
  enviando: boolean;
  onConfirmar: (alternativa: number) => void;
}

/** Uma pergunta do teste diagnóstico (pré e pós). Medição, não quiz: nunca mostra a correta, a nota ou XP; não há volta. */
export function PerguntaTeste({ pergunta, total, enviando, onConfirmar }: Props) {
  const [escolha, setEscolha] = useState<number | null>(null);

  // Teclas 1 a 4 escolhem a alternativa e Enter confirma (PRD 2.2), com a mesma lógica do quiz.
  const acoes = useRef({ escolha, enviando, onConfirmar, quantidade: pergunta.alternativas.length });
  useEffect(() => {
    acoes.current = { escolha, enviando, onConfirmar, quantidade: pergunta.alternativas.length };
  });
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const a = acoes.current;
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement | null)?.closest?.('[data-ignora-teclado]')) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (a.escolha !== null && !a.enviando) a.onConfirmar(a.escolha);
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= a.quantidade) setEscolha(n - 1);
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <section className="space-y-5 pb-28">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground tabular-nums">Pergunta {pergunta.numero} de {total}</p>
        <Progress value={((pergunta.numero - 1) / total) * 100} aria-label={`Pergunta ${pergunta.numero} de ${total}`} />
      </div>
      <h2 className="text-xl font-semibold leading-snug">{pergunta.enunciado}</h2>
      <RadioGroup
        value={escolha === null ? '' : String(escolha)}
        onValueChange={(v) => setEscolha(Number(v))}
        aria-label="Alternativas"
        className="gap-2"
      >
        {pergunta.alternativas.map((texto, i) => (
          <label
            key={texto}
            htmlFor={`alt-${pergunta.id}-${i}`}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${escolha === i ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
          >
            <RadioGroupItem id={`alt-${pergunta.id}-${i}`} value={String(i)} />
            <span>{texto}</span>
          </label>
        ))}
      </RadioGroup>
      <p className="hidden text-xs text-muted-foreground [@media(pointer:fine)]:block">Use as teclas 1 a {pergunta.alternativas.length} e Enter</p>
      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t bg-background p-4">
        <Button className="w-full" size="lg" disabled={escolha === null || enviando} onClick={() => escolha !== null && onConfirmar(escolha)}>
          Confirmar
        </Button>
      </div>
    </section>
  );
}
