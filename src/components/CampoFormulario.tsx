import type { ReactNode } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

interface PropsDoControle {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface Props {
  id: string;
  rotulo: string;
  erro?: string;
  ajuda?: string;
  /** Recebe o id e os atributos de acessibilidade para colocar no controle. */
  children: (propsDoControle: PropsDoControle) => ReactNode;
}

/** Rótulo visível, ajuda e mensagem de erro ligados ao controle por aria-describedby. */
export function CampoFormulario({ id, rotulo, erro, ajuda, children }: Props) {
  const ids = [ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null].filter(Boolean).join(' ');
  return (
    <Field data-invalid={erro ? true : undefined}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': ids || undefined })}
      {ajuda && <FieldDescription id={`${id}-ajuda`}>{ajuda}</FieldDescription>}
      {erro && <FieldError id={`${id}-erro`} role="alert">{erro}</FieldError>}
    </Field>
  );
}
