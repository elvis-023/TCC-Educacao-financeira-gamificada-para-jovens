import { Skeleton } from '@/components/ui/skeleton';
import { carregarBanco } from '@/dados/bancoLocal';
import { useTrilhas } from '@/hooks/dados/useConteudo';

// Tela provisória do passo 2: mostra que os dados de demonstração carregam. Some no passo 10.
export function Inicio() {
  const { data: trilhas, isPending } = useTrilhas();
  const totalUsuarios = carregarBanco().usuarios.length;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">T07 Início</h1>
      <p className="text-sm text-muted-foreground">Dados de demonstração (fictícios).</p>
      {isPending ? (
        <div className="space-y-2" aria-label="Carregando trilhas">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      ) : (
        <ul className="list-disc space-y-1 pl-5">
          {trilhas?.map((trilha) => <li key={trilha.id}>{trilha.titulo}</li>)}
        </ul>
      )}
      <p>{totalUsuarios} usuários</p>
    </section>
  );
}
