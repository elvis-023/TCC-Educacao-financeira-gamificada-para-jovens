import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { marcarSaidaDoAdmin } from '@/app/saidaDoAdmin';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { repositorios } from '@/dados/repositorios';
import type { Papel } from '@/dados/tipos';
import { useAtualizarSessao } from '@/hooks/useSessao';

/** Só para a apresentação do TCC (PRD 2.11): some quando a fonte de dados é o Supabase. */
export function FerramentasDemonstracao({ papel, aoNavegar }: { papel: Papel; aoNavegar?: () => void }) {
  const demo = repositorios.demonstracao;
  const navigate = useNavigate();
  const cliente = useQueryClient();
  const atualizarSessao = useAtualizarSessao();
  const [confirmando, setConfirmando] = useState(false);
  const limite = useQuery({ queryKey: ['demonstracao', 'limite'], queryFn: () => demo.limiteDeInatividade(), enabled: demo.disponivel });
  if (!demo.disponivel) return null;

  const horas = limite.data ?? 48;
  const atualizarTudo = () => cliente.invalidateQueries();

  async function trocarDePapel() {
    const destino: Papel = papel === 'jovem' ? 'admin' : 'jovem';
    if (destino === 'jovem') marcarSaidaDoAdmin();
    await repositorios.sessao.entrarDemonstracao(destino);
    await atualizarSessao();
    aoNavegar?.();
    navigate(destino === 'admin' ? '/admin' : '/inicio');
  }
  async function avancar() {
    await demo.avancarRelogio(horas);
    await atualizarTudo();
    toast.success(`Relógio avançado em ${horas} h (simulação)`);
  }
  async function liberar() {
    await demo.liberarPosTeste();
    await atualizarTudo();
    toast.success('Teste final liberado (demonstração)');
  }
  async function reiniciar() {
    await demo.reiniciar();
    marcarSaidaDoAdmin();
    await repositorios.sessao.entrarDemonstracao(papel);
    await atualizarSessao();
    await atualizarTudo();
    toast.success('Dados de demonstração restaurados');
  }

  return (
    <section className="space-y-3 rounded-xl border-2 border-dashed p-4" aria-labelledby="ferramentas-demo">
      <div>
        <h2 id="ferramentas-demo" className="font-semibold">Ferramentas de demonstração</h2>
        <p className="text-sm text-muted-foreground">Só para a apresentação do TCC — dados fictícios</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={trocarDePapel}>{papel === 'jovem' ? 'Entrar como administrador' : 'Entrar como jovem'}</Button>
        <Button variant="outline" onClick={avancar}>Simular {horas} h sem acesso</Button>
        <Button variant="outline" onClick={liberar}>Liberar o pós-teste</Button>
        <Button variant="outline" onClick={() => setConfirmando(true)}>Reiniciar dados de demonstração</Button>
      </div>
      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar os dados?</AlertDialogTitle>
            <AlertDialogDescription>Isso apaga o progresso feito neste aparelho e restaura os dados fictícios. Continuar?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={reiniciar}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
