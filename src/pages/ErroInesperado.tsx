import { Button } from '@/components/ui/button';

/** T24: erro inesperado em qualquer tela. O botão recarrega o app. */
export function ErroInesperado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="text-muted-foreground">Não foi possível mostrar esta tela. Seu progresso foi guardado. Recarregue para tentar de novo.</p>
      <Button onClick={() => window.location.reload()}>Recarregar</Button>
    </main>
  );
}
