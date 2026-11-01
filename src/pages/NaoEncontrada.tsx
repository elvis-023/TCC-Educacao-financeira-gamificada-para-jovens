import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <Button asChild><Link to="/">Voltar</Link></Button>
    </main>
  );
}
