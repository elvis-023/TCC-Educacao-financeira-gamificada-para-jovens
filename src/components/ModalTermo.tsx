import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SELO_PROVISORIO, type Termo } from '@/dados/demo/termos';
import { formatarDataHora } from '@/lib/formatacao';

interface Props {
  termo: Termo;
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
  /** Instante ISO do aceite, quando já existe (Perfil). */
  aceitoEm?: string | null;
}

/** Quem abre controla o estado, então o formulário de cadastro não perde o que foi digitado. */
export function ModalTermo({ termo, open, onOpenChange, aceitoEm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{termo.titulo}</DialogTitle>
          <DialogDescription className="sr-only">Leia o texto e feche para voltar.</DialogDescription>
        </DialogHeader>
        <Badge variant="outline" className="h-auto whitespace-normal py-1 text-left">{SELO_PROVISORIO}</Badge>
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4">
            {termo.secoes.map((secao) => (
              <section key={secao.titulo} className="space-y-1">
                <h3 className="font-semibold">{secao.titulo}</h3>
                <p className="text-sm text-muted-foreground">{secao.texto}</p>
              </section>
            ))}
          </div>
        </ScrollArea>
        {aceitoEm && <p className="text-sm tabular-nums">Aceito em {formatarDataHora(aceitoEm)}</p>}
      </DialogContent>
    </Dialog>
  );
}
