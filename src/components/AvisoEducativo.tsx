import { Info } from 'lucide-react';

/** Aviso fixo dos simuladores (RNF05): sempre visível, não fecha. */
export function AvisoEducativo({ texto }: { texto: string }) {
  return (
    <div role="note" className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{texto}</p>
    </div>
  );
}
