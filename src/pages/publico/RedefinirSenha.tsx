import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { CabecalhoAcesso } from '@/components/CabecalhoAcesso';
import { CampoFormulario } from '@/components/CampoFormulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODO_DADOS, repositorios } from '@/dados/repositorios';

const esquema = z.object({
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  confirmarSenha: z.string(),
}).refine((v) => v.senha === v.confirmarSenha, { path: ['confirmarSenha'], message: 'As senhas não são iguais' });
type Formulario = z.input<typeof esquema>;

/** Abre pelo link do e-mail de recuperação (o Supabase cria uma sessão de recuperação). Fora das regras de acesso. */
export function RedefinirSenha() {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { senha: '', confirmarSenha: '' },
  });

  if (MODO_DADOS === 'local') {
    return (
      <main className="mx-auto min-h-dvh max-w-[430px] space-y-4 p-4 py-6">
        <CabecalhoAcesso titulo="Redefinir senha" texto="Esta função depende da base de dados." />
        <p className="text-muted-foreground">A redefinição de senha funciona só com a base de dados.</p>
        <Link to="/entrar" className="text-primary underline underline-offset-4">Voltar para o login</Link>
      </main>
    );
  }

  async function redefinir({ senha }: Formulario) {
    try {
      await repositorios.sessao.definirNovaSenha(senha);
    } catch {
      setError('senha', { message: 'O link expirou. Peça um novo em Esqueci minha senha.' });
      return;
    }
    toast.success('Senha alterada. Entre com a nova senha.');
    await repositorios.sessao.sair();
    navigate('/entrar');
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[430px] space-y-5 p-4 py-6">
      <CabecalhoAcesso titulo="Criar nova senha" texto="Escolha uma senha com pelo menos 8 caracteres." />
      <form onSubmit={handleSubmit(redefinir)} noValidate className="space-y-4">
        <CampoFormulario id="senha" rotulo="Nova senha" erro={errors.senha?.message} ajuda="No mínimo 8 caracteres.">
          {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('senha')} />}
        </CampoFormulario>
        <CampoFormulario id="confirmarSenha" rotulo="Confirmar senha" erro={errors.confirmarSenha?.message}>
          {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('confirmarSenha')} />}
        </CampoFormulario>
        <Button type="submit" className="w-full" disabled={isSubmitting}>Salvar nova senha</Button>
      </form>
      <Link to="/entrar" className="block text-sm text-primary underline underline-offset-4">Voltar para o login</Link>
    </main>
  );
}
