import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import type { z } from 'zod';
import { CabecalhoAcesso } from '@/components/CabecalhoAcesso';
import { CampoFormulario } from '@/components/CampoFormulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { repositorios } from '@/dados/repositorios';
import { esquemaEsqueciSenha } from './esquemasAcesso';

export function EsqueciSenha() {
  const [enviado, setEnviado] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof esquemaEsqueciSenha>>({
    resolver: zodResolver(esquemaEsqueciSenha),
    defaultValues: { email: '' },
  });

  async function enviar({ email }: z.input<typeof esquemaEsqueciSenha>) {
    await repositorios.sessao.pedirNovaSenha(email);
    setEnviado(true);
  }

  return (
    <main className="space-y-5 py-6">
      <CabecalhoAcesso titulo="Esqueci minha senha" texto="Informe o e-mail da conta e enviamos o link para criar uma nova senha." />
      {enviado ? (
        <p role="status" className="rounded-lg border bg-muted/50 p-3">
          Se houver uma conta com este e-mail, você vai receber um link para criar uma nova senha.
        </p>
      ) : (
        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
          <CampoFormulario id="email" rotulo="E-mail" erro={errors.email?.message}>
            {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" {...register('email')} />}
          </CampoFormulario>
          <Button type="submit" className="w-full" disabled={isSubmitting}>Enviar link</Button>
        </form>
      )}
      <Link to="/entrar" className="block text-sm text-primary underline underline-offset-4">Voltar para o login</Link>
    </main>
  );
}
