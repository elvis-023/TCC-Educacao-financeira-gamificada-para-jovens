import { Award, CircleCheck, Crown, Flag, Flame, Mountain, Target, type LucideIcon } from 'lucide-react';

const ICONES: Record<string, LucideIcon> = { CircleCheck, Flag, Flame, Target, Mountain, Crown };

/** Ícone da conquista pelo nome guardado no banco; se o nome não existir, usa o ícone padrão (PRD 2.10). */
export function IconeConquista({ nome, className }: { nome: string; className?: string }) {
  const Icone = ICONES[nome] ?? Award;
  return <Icone aria-hidden="true" className={className} />;
}
