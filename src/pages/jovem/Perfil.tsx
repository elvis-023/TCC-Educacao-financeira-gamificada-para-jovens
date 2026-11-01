import { useQueryClient } from '@tanstack/react-query';
import { Flame, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { FerramentasDemonstracao } from '@/components/FerramentasDemonstracao';
import { ModalTermo } from '@/components/ModalTermo';
import { ResumoTestes } from '@/components/ResumoTestes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { POLITICA_PRIVACIDADE, TCLE, type Termo } from '@/dados/demo/termos';
import { repositorios } from '@/dados/repositorios';
import { chaves } from '@/hooks/dados/chaves';
import { useConquistas } from '@/hooks/dados/useConquistas';
import { useBadges } from '@/hooks/dados/useConteudo';
import { useMeuUsuario } from '@/hooks/dados/useUsuario';
import { useAgora } from '@/hooks/useRelogio';
import { useSair } from '@/hooks/useSair';
import { formatarData, formatarXp } from '@/lib/formatacao';
import { diaNoFuso } from '@/lib/fuso';
import { definirTema, lerTema } from '@/lib/tema';
import { sequenciaAtual } from '@/regras/sequencia';

const iniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/);
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
};

export function Perfil() {
  const sair = useSair();
  const cliente = useQueryClient();
  const usuario = useMeuUsuario();
  const conquistas = useConquistas();
  const badges = useBadges();
  const agora = useAgora();
  const [escuro, setEscuro] = useState(() => lerTema() === 'escuro');
  const [termo, setTermo] = useState<Termo | null>(null);

  if (usuario.isPending || !usuario.data) {
    return (
      <div className="space-y-3" aria-label="Carregando perfil">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const u = usuario.data;
  const sequencia = sequenciaAtual(u.diasStreak, u.ultimoDiaUso, diaNoFuso(agora));

  async function mudarLembretes(valor: boolean) {
    try {
      await repositorios.usuario.definirReceberLembretes(valor);
      await cliente.invalidateQueries({ queryKey: chaves.usuario });
      toast.success(valor ? 'Lembretes ligados' : 'Lembretes desligados');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível salvar a preferência');
    }
  }
  function mudarTema(valor: boolean) {
    setEscuro(valor);
    definirTema(valor ? 'escuro' : 'claro');
  }

  return (
    <section className="space-y-5">
      <h1 className="sr-only">Perfil</h1>

      <header className="flex items-center gap-4">
        <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {iniciais(u.nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{u.nome}</p>
          <p className="truncate text-sm text-muted-foreground">{u.email}</p>
          <p className="text-sm text-muted-foreground tabular-nums">No app desde {formatarData(u.criadoEm)}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border p-3">
          <Sparkles aria-hidden="true" className="mx-auto size-5 text-xp-icone" />
          <p className="font-semibold text-xp tabular-nums">{formatarXp(u.xpTotal)}</p>
        </div>
        <div className="rounded-xl border p-3">
          <Flame aria-hidden="true" className="mx-auto size-5 text-sequencia-icone" />
          <p className="font-semibold text-sequencia tabular-nums">{sequencia} {sequencia === 1 ? 'dia' : 'dias'}</p>
        </div>
        <Link to="/conquistas" className="rounded-xl border p-3 focus-visible:outline-2 focus-visible:outline-ring">
          <span className="block font-semibold tabular-nums">{conquistas.data?.length ?? 0} de {badges.data?.length ?? 6}</span>
          <span className="block text-sm text-muted-foreground">Ver conquistas</span>
        </Link>
      </div>

      <ResumoTestes />

      <section className="space-y-3 rounded-xl border p-4" aria-labelledby="preferencias">
        <h2 id="preferencias" className="font-semibold">Preferências</h2>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Label htmlFor="lembretes">Receber lembretes</Label>
          <Switch id="lembretes" checked={u.receberLembretes} onCheckedChange={mudarLembretes} />
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Label htmlFor="tema-escuro">Tema escuro</Label>
          <Switch id="tema-escuro" checked={escuro} onCheckedChange={mudarTema} />
        </div>
      </section>

      <section className="space-y-2 rounded-xl border p-4" aria-labelledby="termos">
        <h2 id="termos" className="font-semibold">Termos</h2>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => setTermo(TCLE)}>Ler o TCLE</Button>
          <Button variant="outline" onClick={() => setTermo(POLITICA_PRIVACIDADE)}>Política de privacidade</Button>
        </div>
      </section>
      {termo && (
        <ModalTermo
          termo={termo}
          open
          onOpenChange={(aberto) => !aberto && setTermo(null)}
          aceitoEm={termo === TCLE ? u.tcleAceitoEm : u.privacidadeAceitaEm}
        />
      )}

      <FerramentasDemonstracao papel={u.papel} />

      <Button type="button" variant="outline" size="lg" className="w-full" onClick={sair}>Sair</Button>
    </section>
  );
}
