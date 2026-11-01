import { CreditCard, Landmark, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';

/** Ícone de cada trilha. */
const VISUAL: Record<string, LucideIcon> = {
  'orcamento-pessoal': Wallet,
  'juros-compostos': TrendingUp,
  'cartao-de-credito': CreditCard,
  'inflacao-e-investimentos': Landmark,
};

export function IconeTrilha({ slug, className }: { slug: string; className?: string }) {
  const Icone = VISUAL[slug] ?? Wallet;
  return <Icone aria-hidden="true" className={className} />;
}
