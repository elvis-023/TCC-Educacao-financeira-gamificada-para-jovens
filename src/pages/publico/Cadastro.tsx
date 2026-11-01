import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CampoFormulario } from '@/components/CampoFormulario';
import { ModalTermo } from '@/components/ModalTermo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { POLITICA_PRIVACIDADE, TCLE, type Termo } from '@/dados/demo/termos';
import { repositorios } from '@/dados/repositorios';
import { MENSAGEM_CONFIRMAR_EMAIL } from '@/dados/repositorios/supabase/sessao';
import { useAtualizarSessao } from '@/hooks/useSessao';
import { esquemaCadastro, oQueFalta, type FormularioCadastro } from './esquemasAcesso';

const VALORES_INICIAIS = {
  nome: '', email: '', senha: '', confirmarSenha: '',
  // Todos os aceites começam desmarcados (PRD T02); o esquema só deixa enviar com `true`.
  aceiteTcle: false as unknown as true, aceitePrivacidade: false as unknown as true, maioridade: false as unknown as true,
} satisfies FormularioCadastro;

export function Cadastro() {
  const atualizarSessao = useAtualizarSessao();
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [termoAberto, setTermoAberto] = useState<Termo | null>(null);

  const { control, register, handleSubmit, setError, formState: { errors, isValid, isSubmitting } } =
    useForm<FormularioCadastro, unknown, z.output<typeof esquemaCadastro>>({
      resolver: zodResolver(esquemaCadastro),
      mode: 'onChange',
      defaultValues: VALORES_INICIAIS,
    });
  const valores = useWatch({ control });
  const falta = oQueFalta(valores);

  async function criarConta(v: z.output<typeof esquemaCadastro>) {
    try {
      await repositorios.sessao.cadastrar({ nome: v.nome, email: v.email, senha: v.senha, tcleVersao: TCLE.versao });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível criar a conta';
      if (mensagem === 'Já existe uma conta com este e-mail') setError('email', { message: mensagem });
      else if (mensagem === MENSAGEM_CONFIRMAR_EMAIL) {
        toast.success(mensagem);
        navigate('/entrar');
      } else toast.error(mensagem);
      return;
    }
    // A sessão já foi aberta; ao atualizá-la, a guarda leva ao pré-teste (PRD T02).
    await atualizarSessao();
  }

  return (
    <main className="space-y-5 py-6">
      <h1 className="text-2xl font-semibold">Criar conta</h1>

      <form onSubmit={handleSubmit(criarConta)} noValidate className="space-y-4">
        <CampoFormulario id="nome" rotulo="Nome" erro={errors.nome?.message}>
          {(p) => <Input {...p} autoComplete="name" {...register('nome')} />}
        </CampoFormulario>

        <CampoFormulario id="email" rotulo="E-mail" erro={errors.email?.message}>
          {(p) => <Input {...p} type="email" inputMode="email" autoComplete="email" {...register('email')} />}
        </CampoFormulario>

        <CampoFormulario id="senha" rotulo="Senha" erro={errors.senha?.message} ajuda="No mínimo 8 caracteres.">
          {(p) => (
            <div className="relative">
              <Input {...p} type={mostrarSenha ? 'text' : 'password'} autoComplete="new-password" className="pr-11" {...register('senha')} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setMostrarSenha((v) => !v)}
              >
                {mostrarSenha ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
            </div>
          )}
        </CampoFormulario>

        <CampoFormulario id="confirmarSenha" rotulo="Confirmar senha" erro={errors.confirmarSenha?.message}>
          {(p) => <Input {...p} type={mostrarSenha ? 'text' : 'password'} autoComplete="new-password" {...register('confirmarSenha')} />}
        </CampoFormulario>

        <fieldset className="space-y-3">
          <legend className="sr-only">Aceites obrigatórios</legend>

          <div className="space-y-1">
            <div className="flex items-start gap-3">
              <Controller
                control={control}
                name="aceiteTcle"
                render={({ field }) => (
                  <Checkbox id="aceiteTcle" checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
                )}
              />
              <Label htmlFor="aceiteTcle" className="font-normal leading-snug">
                Li e aceito o TCLE (Termo de Consentimento Livre e Esclarecido)
              </Label>
            </div>
            <Button type="button" variant="link" className="h-auto p-0 pl-8" onClick={() => setTermoAberto(TCLE)}>Ler o TCLE</Button>
          </div>

          <div className="space-y-1">
            <div className="flex items-start gap-3">
              <Controller
                control={control}
                name="aceitePrivacidade"
                render={({ field }) => (
                  <Checkbox id="aceitePrivacidade" checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
                )}
              />
              <Label htmlFor="aceitePrivacidade" className="font-normal leading-snug">Li e aceito a Política de Privacidade</Label>
            </div>
            <Button type="button" variant="link" className="h-auto p-0 pl-8" onClick={() => setTermoAberto(POLITICA_PRIVACIDADE)}>Ler a política</Button>
          </div>

          <div className="flex items-start gap-3">
            <Controller
              control={control}
              name="maioridade"
              render={({ field }) => (
                <Checkbox id="maioridade" checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
              )}
            />
            <Label htmlFor="maioridade" className="font-normal leading-snug">Tenho 18 anos ou mais</Label>
          </div>
        </fieldset>

        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>Criar conta</Button>
          {falta && <p className="text-center text-sm text-muted-foreground" aria-live="polite">{falta}</p>}
        </div>
      </form>

      <p className="text-center text-sm">
        Já tem conta? <Link to="/entrar" className="text-primary underline underline-offset-4">Entrar</Link>
      </p>

      {termoAberto && (
        <ModalTermo termo={termoAberto} open onOpenChange={(aberto) => !aberto && setTermoAberto(null)} />
      )}
    </main>
  );
}
