import { Celebracao } from '@/components/Celebracao';
import { IconeConquista } from '@/components/IconeConquista';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Badge, CodigoBadge, UsuarioBadge } from '@/dados/tipos';
import { formatarData } from '@/lib/formatacao';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  novas: CodigoBadge[];
  badges: Badge[];
  conquistadas: UsuarioBadge[];
}

/** Aparece uma vez ao concluir o quiz com conquistas novas (PRD 2.5, critério 3). */
export function ModalConquista({ aberto, aoFechar, novas, badges, conquistadas }: Props) {
  const lista = badges.filter((b) => novas.includes(b.id)).sort((a, b) => a.ordem - b.ordem);
  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conquista desbloqueada!</DialogTitle>
          <DialogDescription className="sr-only">Conquistas que você ganhou neste quiz</DialogDescription>
        </DialogHeader>
        <Celebracao titulo={lista.length === 1 ? lista[0].nome : `${lista.length} conquistas novas`} />
        <ul className="space-y-3">
          {lista.map((b) => {
            const data = conquistadas.find((c) => c.badgeId === b.id)?.conquistadoEm;
            return (
              <li key={b.id} className="flex items-center gap-3">
                <IconeConquista nome={b.icone} className="size-8 shrink-0 text-xp-icone" />
                <div>
                  <p className="font-medium">{b.nome}</p>
                  <p className="text-sm text-muted-foreground">{data ? `Conquistada em ${formatarData(data)}` : b.criterioMarco}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <DialogFooter><Button onClick={aoFechar} className="w-full sm:w-auto">Continuar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
