import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { formatarDecimal } from '@/lib/formatacao';

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number | null;
  onChange: (valor: number | null) => void;
};

export function CampoMoeda({ value, onChange, ...props }: Props) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
      <Input
        {...props}
        inputMode="numeric"
        className="pl-9 tabular-nums"
        value={value === null ? '' : formatarDecimal(value)}
        onChange={(evento) => {
          const digitos = evento.target.value.replace(/\D/g, '');
          onChange(digitos ? Number(digitos) / 100 : null);
        }}
      />
    </div>
  );
}
