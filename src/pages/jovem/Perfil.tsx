import { Button } from '@/components/ui/button';
import { useSair } from '@/hooks/useSair';

// Tela provisória do passo 6: só o botão Sair. O Perfil completo entra no passo 16.
export function Perfil() {
  const sair = useSair();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">T19 Perfil</h1>
      <p className="text-muted-foreground">Tela provisória.</p>
      <Button type="button" variant="outline" onClick={sair}>Sair</Button>
    </section>
  );
}
