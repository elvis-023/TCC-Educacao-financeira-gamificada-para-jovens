import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import type { z } from 'zod';
import { CampoFormulario } from '@/components/CampoFormulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODO_DADOS, repositorios } from '@/dados/repositorios';
import type { Papel } from '@/dados/tipos';
import { useAtualizarSessao } from '@/hooks/useSessao';
import { esquemaEntrar } from './esquemasAcesso';

type Formulario = z.input<typeof esquemaEntrar>;

export function Entrar() {
  const atualizarSessao = useAtualizarSessao();
  const [erro, setErro] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Formulario>({
    resolver: zodResolver(esquemaEntrar),
    defaultValues: { email: '', senha: '' },
  });

  // Depois de entrar, a guarda das telas públicas leva a pessoa à rota que ela tentou abrir ou à área do papel (PRD T03).
  async function entrar({ email, senha }: Formulario) {
    setErro(null);
    try {
      await repositorios.sessao.entrar(email, senha);
      await atualizarSessao();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar');
    }
  }

  async function entrarComoDemonstracao(papel: Papel) {
    setErro(null);
    await repositorios.sessao.entrarDemonstracao(papel);
    await atualizarSessao();
  }

  return (
    <main className="space-y-5 py-6">
      <h1 className="text-2xl font-semibold">Entrar</h1>

      <form onSubmit={handleSubmit(entrar)} noValidate className="space-y-4">
        <CampoFormulario id="email" rotulo="E-mail" erro={errors.email?.message}>
          {(p) => <Input {...p} type="email" inputMode="email" autoComplete="email" {...register('email')} />}
        </CampoFormulario>
        <CampoFormulario id="senha" rotulo="Senha" erro={errors.senha?.message}>
          {(p) => <Input {...p} type="password" autoComplete="current-password" {...register('senha')} />}
        </CampoFormulario>

        {erro && <p role="alert" className="rounded-lg border border-erro/40 bg-erro-fundo p-3 text-sm text-erro">{erro}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>Entrar</Button>
      </form>

      <div className="flex justify-between text-sm">
        <Link to="/esqueci-senha" className="text-primary underline underline-offset-4">Esqueci minha senha</Link>
        <Link to="/cadastro" className="text-primary underline underline-offset-4">Criar conta</Link>
      </div>

      {MODO_DADOS === 'local' && (
        <section className="space-y-2 rounded-xl border border-dashed p-3">
          <h2 className="text-sm font-medium">Atalhos de demonstração (dados fictícios)</h2>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" onClick={() => entrarComoDemonstracao('jovem')}>Entrar como jovem</Button>
            <Button type="button" variant="outline" onClick={() => entrarComoDemonstracao('admin')}>Entrar como administrador</Button>
          </div>
        </section>
      )}
    </main>
  );
}
