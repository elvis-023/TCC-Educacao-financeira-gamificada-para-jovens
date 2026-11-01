import { CartaoTrilha } from '@/components/CartaoTrilha';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrilhas } from '@/hooks/dados/useConteudo';
import { useProgressoDasTrilhas } from '@/hooks/dados/useProgresso';
import { useTrilhasBaixadas } from '@/hooks/useConexao';

export function Trilhas() {
  const { data: trilhas, isPending } = useTrilhas();
  const { carregando, mapa } = useProgressoDasTrilhas();
  const baixadas = useTrilhasBaixadas();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Trilhas</h1>
      {isPending || carregando ? (
        <div className="space-y-3" aria-label="Carregando trilhas">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full rounded-3xl" />)}
        </div>
      ) : (
        <ul className="space-y-3">
          {trilhas?.map((trilha) => (
            <li key={trilha.id}>
              <CartaoTrilha trilha={trilha} progresso={mapa.get(trilha.id)} baixada={baixadas.includes(trilha.id)} detalhado />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
