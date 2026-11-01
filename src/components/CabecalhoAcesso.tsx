import { Link } from 'react-router';

interface Props { titulo: string; texto: string }

/** Faixa azul no topo das telas de acesso, no mesmo estilo da tela de boas-vindas. */
export function CabecalhoAcesso({ titulo, texto }: Props) {
  return (
    <header className="fundo-hero space-y-2 rounded-3xl p-6">
      <Link to="/" className="inline-flex min-h-11 items-center text-sm opacity-90 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-destaque">
        Educação Financeira Gamificada
      </Link>
      <h1 className="text-3xl font-semibold leading-tight">{titulo}</h1>
      <p className="opacity-90">{texto}</p>
    </header>
  );
}
