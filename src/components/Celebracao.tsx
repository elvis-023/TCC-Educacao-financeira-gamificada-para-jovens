import { PartyPopper, Sparkles } from 'lucide-react';

/** Celebração discreta (PRD 5.5): entra com escala em até 1 s. O CSS global a desliga com prefers-reduced-motion. */
export function Celebracao({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div role="status" className="animar-celebracao flex flex-col items-center gap-2 rounded-xl border border-xp-icone/50 bg-xp-icone/10 p-5 text-center">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden="true" className="size-5 text-xp-icone" />
        <PartyPopper aria-hidden="true" className="size-8 text-xp-icone" />
        <Sparkles aria-hidden="true" className="size-5 text-xp-icone" />
      </div>
      <p className="text-lg font-semibold">{titulo}</p>
      {texto && <p className="text-sm text-muted-foreground">{texto}</p>}
    </div>
  );
}
